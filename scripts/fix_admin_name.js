const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        // Use strict: false to allow reading/writing fields not in this temporary schema
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

        const user = await User.findOne({ email: 'admin@5az.com' });
        if (user) {
            console.log('Found Admin User');
            console.log('Current Name:', user.name);

            // Check if name is already an object with first/last
            if (typeof user.name === 'string') {
                console.log('Fixing name structure...');
                user.name = { first: 'Admin', last: 'User' };
                // Also ensure password is preserved (it should be)
                await User.updateOne({ _id: user._id }, { $set: { name: { first: 'Admin', last: 'User' } } });
                console.log('Admin user name updated successfully.');
            } else {
                console.log('Name structure is already correct.');
            }
        } else {
            console.log('Admin user not found!');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixAdmin();
