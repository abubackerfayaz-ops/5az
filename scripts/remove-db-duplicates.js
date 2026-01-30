const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');

const { Schema } = mongoose;
const ProductSchema = new Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4
};

async function removeDuplicates() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, opts);
        console.log('Connected.');

        console.log('Finding duplicates...');
        const duplicates = await Product.aggregate([
            {
                $group: {
                    _id: "$name",
                    count: { $sum: 1 },
                    ids: { $push: "$_id" }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        console.log(`Found ${duplicates.length} sets of duplicates.`);

        let totalDeleted = 0;
        for (const doc of duplicates) {
            const idsToDelete = doc.ids.slice(1);
            const result = await Product.deleteMany({ _id: { $in: idsToDelete } });
            totalDeleted += result.deletedCount;
            process.stdout.write('.'); // Show progress
        }

        console.log(`\nTotal duplicates deleted: ${totalDeleted}`);
        process.exit(0);
    } catch (error) {
        console.error('\nError:', error);
        process.exit(1);
    }
}

removeDuplicates();
