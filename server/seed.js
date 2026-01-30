require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedUsers = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/capstone_db';

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected');

        // Clear existing users
        await User.deleteMany({});
        console.log('Existing users cleared');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = [
            {
                firstName: 'Coordinator',
                lastName: 'User',
                email: 'coordinator@buksu.edu.ph',
                password: hashedPassword,
                role: 'coordinator',
                department: 'IT'
            },
            {
                firstName: 'Adviser',
                lastName: 'User',
                email: 'adviser@buksu.edu.ph',
                password: hashedPassword,
                role: 'adviser',
                department: 'IT'
            },
            {
                firstName: 'Student',
                lastName: 'User',
                email: 'student@buksu.edu.ph',
                password: hashedPassword,
                role: 'student',
                department: 'IT'
            }
        ];

        await User.insertMany(users);
        console.log('Users seeded successfully');

        process.exit();
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
