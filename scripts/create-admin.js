const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Define User Schema inline to avoid module issues if running standalone
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not defined in .env.local');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@5az.com';
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'admin';
            await existingAdmin.save();
            console.log('Admin user updated');
        } else {
            await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Admin user created');
        }

        console.log('-----------------------------------');
        console.log('Admin Credentials:');
        console.log('Email: admin@5az.com');
        console.log('Password: admin123');
        console.log('-----------------------------------');

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
