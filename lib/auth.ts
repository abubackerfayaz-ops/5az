import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import { trackFailedLogin, resetFailedLoginAttempts } from '@/lib/rate-limit';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter an email and password');
                }

                // Track failed login attempts
                const lockStatus = trackFailedLogin(credentials.email);
                if (lockStatus.locked) {
                    const minutesLeft = lockStatus.lockExpiry
                        ? Math.ceil((lockStatus.lockExpiry - Date.now()) / 60000)
                        : 15;
                    throw new Error(`Too many failed attempts. Try again in ${minutesLeft} minutes.`);
                }

                await dbConnect();

                const user = await User.findOne({ email: credentials.email }).select('+password');

                if (!user) {
                    throw new Error('No user found with this email');
                }

                // Check if account is locked
                if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
                    const minutesLeft = Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / 60000);
                    throw new Error(`Account locked. Try again in ${minutesLeft} minutes`);
                }

                // Check if account is blocked
                if (user.isBlocked) {
                    throw new Error('Account has been blocked. Contact support.');
                }

                const isMatch = await bcrypt.compare(credentials.password, user.password);

                if (!isMatch) {
                    // Increment failed attempts
                    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

                    // Lock account after max attempts
                    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
                        user.accountLockedUntil = new Date(Date.now() + LOCK_TIME);
                        await user.save();
                        throw new Error('Too many failed attempts. Account locked for 15 minutes.');
                    }

                    await user.save();
                    const attemptsLeft = MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts;
                    throw new Error(`Invalid password. ${attemptsLeft} attempts remaining.`);
                }

                // Reset failed attempts on successful login
                user.failedLoginAttempts = 0;
                user.accountLockedUntil = undefined;
                user.lastLoginAt = new Date();
                await user.save();

                // Reset rate limit tracking
                resetFailedLoginAttempts(credentials.email);

                return {
                    id: user._id.toString(),
                    name: `${user.name.first} ${user.name.last}`,
                    email: user.email,
                    role: user.role,
                    image: user.image,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};
