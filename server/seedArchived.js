require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Team = require('./models/Team');

const seedArchived = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/capstone_db';

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // ── Advisers ──────────────────────────────────────────
        const adviserData = [
            { firstName: 'Maria', lastName: 'Santos', email: 'maria.santos@buksu.edu.ph', password: hashedPassword, role: 'adviser', department: 'IT' },
            { firstName: 'Jose', lastName: 'Reyes', email: 'jose.reyes@buksu.edu.ph', password: hashedPassword, role: 'adviser', department: 'IT' },
            { firstName: 'Ana', lastName: 'Cruz', email: 'ana.cruz@buksu.edu.ph', password: hashedPassword, role: 'adviser', department: 'IT' },
        ];

        // ── Students (groups of 3-4 per project) ─────────────
        const studentData = [
            // Project 1 members
            { firstName: 'John', lastName: 'Dela Cruz', email: 'john.delacruz@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Anna', lastName: 'Garcia', email: 'anna.garcia@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Mark', lastName: 'Lopez', email: 'mark.lopez@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            // Project 2 members
            { firstName: 'Rica', lastName: 'Mendoza', email: 'rica.mendoza@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Kevin', lastName: 'Ramos', email: 'kevin.ramos@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Lea', lastName: 'Torres', email: 'lea.torres@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Paolo', lastName: 'Villanueva', email: 'paolo.villanueva@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            // Project 3 members
            { firstName: 'Carla', lastName: 'Bautista', email: 'carla.bautista@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Miguel', lastName: 'Aquino', email: 'miguel.aquino@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Jessa', lastName: 'Navarro', email: 'jessa.navarro@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            // Project 4 members
            { firstName: 'Daniel', lastName: 'Fernandez', email: 'daniel.fernandez@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Sophia', lastName: 'Castillo', email: 'sophia.castillo@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Ethan', lastName: 'Rivera', email: 'ethan.rivera@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Bianca', lastName: 'Morales', email: 'bianca.morales@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            // Project 5 members
            { firstName: 'Rafael', lastName: 'Santiago', email: 'rafael.santiago@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Patricia', lastName: 'Lim', email: 'patricia.lim@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Bryan', lastName: 'Ocampo', email: 'bryan.ocampo@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            // Project 6 members
            { firstName: 'Christine', lastName: 'Dizon', email: 'christine.dizon@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'James', lastName: 'Pascual', email: 'james.pascual@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Aimee', lastName: 'Soriano', email: 'aimee.soriano@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            // Project 7 members
            { firstName: 'Leo', lastName: 'Manalo', email: 'leo.manalo@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Nicole', lastName: 'Perez', email: 'nicole.perez@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Ryan', lastName: 'Gutierrez', email: 'ryan.gutierrez@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Grace', lastName: 'Tan', email: 'grace.tan@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            // Project 8 members
            { firstName: 'Carlo', lastName: 'Alberto', email: 'carlo.alberto@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Mia', lastName: 'Salazar', email: 'mia.salazar@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
            { firstName: 'Josh', lastName: 'Enriquez', email: 'josh.enriquez@student.buksu.edu.ph', password: hashedPassword, role: 'student', department: 'IT', yearLevel: '4th Year' },
        ];

        // Upsert advisers (insert if email doesn't exist, skip if it does)
        const advisers = [];
        for (const data of adviserData) {
            let user = await User.findOne({ email: data.email });
            if (!user) {
                user = await User.create(data);
                console.log(`  Created adviser: ${data.firstName} ${data.lastName}`);
            } else {
                console.log(`  Adviser already exists: ${data.firstName} ${data.lastName}`);
            }
            advisers.push(user);
        }

        // Upsert students
        const students = [];
        for (const data of studentData) {
            let user = await User.findOne({ email: data.email });
            if (!user) {
                user = await User.create(data);
            }
            students.push(user);
        }
        console.log(`Inserted/found ${students.length} students`);

        // ── Archived Projects ─────────────────────────────────
        const archivedProjects = [
            {
                title: 'BukSU Online Enrollment System with Real-Time Slot Monitoring',
                members: [students[0]._id, students[1]._id, students[2]._id],
                adviser: advisers[0]._id,
                status: 'ARCHIVED',
                capstonePhase: 4,
                academicYear: '2023-2024',
                keywords: ['enrollment', 'web application', 'real-time monitoring', 'student portal', 'queue management'],
                titleLocked: true,
                proposal: {
                    background: 'The current enrollment process at BukSU relies on manual queuing and paper-based forms, leading to long wait times and data entry errors. This study aims to develop an online enrollment system that provides real-time slot monitoring to streamline the registration process.',
                    problemStatement: 'How can an online enrollment system with real-time slot monitoring reduce enrollment processing time and improve the student experience at BukSU?',
                    generalObjective: 'To develop and implement an online enrollment system with real-time slot monitoring for Bukidnon State University.',
                    specificObjectives: [
                        'To design a responsive web-based enrollment interface accessible on any device.',
                        'To implement real-time class slot availability tracking using WebSocket technology.',
                        'To integrate student record validation for prerequisite and load balancing checks.',
                        'To evaluate the system usability through ISO 25010 software quality metrics.'
                    ],
                    scope: [
                        'Online enrollment for undergraduate IT students.',
                        'Real-time monitoring of available class slots.',
                        'Student dashboard for enrollment status tracking.'
                    ],
                    delimitations: [
                        'Does not cover graduate program enrollment.',
                        'Payment processing is handled by existing university systems.'
                    ],
                    methodology: {
                        sdlc: 'Agile/Scrum',
                        techStack: { frontend: 'React.js', backend: 'Node.js / Express', database: 'MongoDB', tools: ['Socket.IO', 'JWT', 'Tailwind CSS'] }
                    }
                },
                capstone4: {
                    plagiarismReport: { score: 8, status: 'clear' },
                    defenseVerdict: { result: 'passed', remarks: 'Excellent implementation with practical deployment potential.', evaluatedAt: new Date('2024-03-15') }
                },
                statusHistory: [
                    { fromStatus: 'FINAL_DEFENSE', toStatus: 'FINAL_APPROVED', comment: 'Passed final defense.', changedAt: new Date('2024-03-15') },
                    { fromStatus: 'FINAL_APPROVED', toStatus: 'ARCHIVED', comment: 'Archived after completion.', changedAt: new Date('2024-04-01') }
                ],
                createdAt: new Date('2023-08-15'),
                updatedAt: new Date('2024-04-01')
            },
            {
                title: 'Smart Greenhouse Monitoring and Control System Using IoT',
                members: [students[3]._id, students[4]._id, students[5]._id, students[6]._id],
                adviser: advisers[1]._id,
                status: 'ARCHIVED',
                capstonePhase: 4,
                academicYear: '2023-2024',
                keywords: ['IoT', 'greenhouse', 'sensor monitoring', 'automation', 'Arduino', 'agriculture technology'],
                titleLocked: true,
                proposal: {
                    background: 'Traditional greenhouse farming in Bukidnon relies heavily on manual monitoring of temperature, humidity, and soil moisture. This project integrates IoT sensors and actuators to automate greenhouse environment control.',
                    problemStatement: 'How can IoT-based monitoring and automated control improve greenhouse crop yield and reduce manual labor for small-scale farmers in Bukidnon?',
                    generalObjective: 'To design and develop a smart greenhouse monitoring and control system using IoT technologies.',
                    specificObjectives: [
                        'To deploy temperature, humidity, and soil moisture sensors inside the greenhouse.',
                        'To develop a web dashboard for real-time environmental data visualization.',
                        'To implement automated irrigation and ventilation control based on sensor thresholds.',
                        'To evaluate system accuracy and reliability through field testing.'
                    ],
                    scope: [
                        'Sensor-based monitoring of greenhouse environment.',
                        'Web-based dashboard accessible via mobile and desktop.',
                        'Automated control of irrigation pumps and exhaust fans.'
                    ],
                    delimitations: [
                        'Limited to one greenhouse prototype.',
                        'Does not include pest detection or crop disease identification.'
                    ],
                    methodology: {
                        sdlc: 'V-Model',
                        techStack: { frontend: 'React.js', backend: 'Node.js / Express', database: 'MongoDB', tools: ['Arduino', 'ESP32', 'MQTT', 'Chart.js'] }
                    }
                },
                capstone4: {
                    plagiarismReport: { score: 12, status: 'clear' },
                    defenseVerdict: { result: 'passed', remarks: 'Well-executed hardware-software integration. Recommended for deployment.', evaluatedAt: new Date('2024-03-20') }
                },
                statusHistory: [
                    { fromStatus: 'FINAL_DEFENSE', toStatus: 'FINAL_APPROVED', comment: 'Passed final defense.', changedAt: new Date('2024-03-20') },
                    { fromStatus: 'FINAL_APPROVED', toStatus: 'ARCHIVED', comment: 'Archived after completion.', changedAt: new Date('2024-04-05') }
                ],
                createdAt: new Date('2023-08-20'),
                updatedAt: new Date('2024-04-05')
            },
            {
                title: 'Barangay Health Center Patient Record Management System',
                members: [students[7]._id, students[8]._id, students[9]._id],
                adviser: advisers[2]._id,
                status: 'ARCHIVED',
                capstonePhase: 4,
                academicYear: '2023-2024',
                keywords: ['health records', 'patient management', 'barangay', 'electronic medical records', 'FHSIS'],
                titleLocked: true,
                proposal: {
                    background: 'Barangay health centers in Malaybalay City still rely on paper-based records for patient consultations, immunizations, and prenatal visits. This leads to data loss, difficulty in generating FHSIS reports, and delayed patient follow-ups.',
                    problemStatement: 'How can a web-based patient record management system improve the accuracy, accessibility, and reporting efficiency of barangay health centers?',
                    generalObjective: 'To develop a web-based patient record management system for barangay health centers in compliance with DOH reporting standards.',
                    specificObjectives: [
                        'To digitize patient records including consultation history, immunizations, and maternal care.',
                        'To implement role-based access for health workers, midwives, and barangay officials.',
                        'To generate automated FHSIS-compliant monthly reports.',
                        'To evaluate the system through user acceptance testing with actual health workers.'
                    ],
                    scope: [
                        'Patient registration and consultation record management.',
                        'Immunization and prenatal tracking modules.',
                        'FHSIS report generation.'
                    ],
                    delimitations: [
                        'Limited to one pilot barangay health center.',
                        'Does not include telemedicine or video consultation features.'
                    ],
                    methodology: {
                        sdlc: 'Waterfall',
                        techStack: { frontend: 'React.js', backend: 'PHP / Laravel', database: 'MySQL', tools: ['Bootstrap', 'Chart.js', 'TCPDF'] }
                    }
                },
                capstone4: {
                    plagiarismReport: { score: 6, status: 'clear' },
                    defenseVerdict: { result: 'passed', remarks: 'Practical solution addressing a real community need.', evaluatedAt: new Date('2024-03-18') }
                },
                statusHistory: [
                    { fromStatus: 'FINAL_DEFENSE', toStatus: 'FINAL_APPROVED', comment: 'Passed final defense.', changedAt: new Date('2024-03-18') },
                    { fromStatus: 'FINAL_APPROVED', toStatus: 'ARCHIVED', comment: 'Archived after completion.', changedAt: new Date('2024-04-02') }
                ],
                createdAt: new Date('2023-09-01'),
                updatedAt: new Date('2024-04-02')
            },
            {
                title: 'AI-Powered Crop Disease Detection Mobile Application for Bukidnon Farmers',
                members: [students[10]._id, students[11]._id, students[12]._id, students[13]._id],
                adviser: advisers[0]._id,
                status: 'ARCHIVED',
                capstonePhase: 4,
                academicYear: '2022-2023',
                keywords: ['artificial intelligence', 'image classification', 'mobile application', 'crop disease', 'deep learning', 'agriculture'],
                titleLocked: true,
                proposal: {
                    background: 'Bukidnon is one of the top agricultural provinces in the Philippines. Farmers frequently encounter crop diseases that reduce yield but lack immediate access to agricultural experts for diagnosis.',
                    problemStatement: 'How can a mobile application leveraging AI-based image classification assist Bukidnon farmers in early detection of common crop diseases?',
                    generalObjective: 'To develop a mobile application that uses deep learning for real-time identification of crop diseases through image capture.',
                    specificObjectives: [
                        'To collect and label a dataset of diseased and healthy crop images from local farms.',
                        'To train a convolutional neural network (CNN) model for multi-class disease classification.',
                        'To deploy the trained model into a cross-platform mobile application.',
                        'To validate classification accuracy through field testing with actual farmers.'
                    ],
                    scope: [
                        'Image-based identification of rice and corn diseases.',
                        'Offline-capable mobile app for areas with limited connectivity.',
                        'Basic treatment recommendations per identified disease.'
                    ],
                    delimitations: [
                        'Limited to rice and corn crops.',
                        'Does not replace professional agronomist consultation.'
                    ],
                    methodology: {
                        sdlc: 'Agile/Scrum',
                        techStack: { frontend: 'React Native', backend: 'Python / Flask', database: 'SQLite', tools: ['TensorFlow Lite', 'OpenCV', 'Expo'] }
                    }
                },
                capstone4: {
                    plagiarismReport: { score: 10, status: 'clear' },
                    defenseVerdict: { result: 'passed', remarks: 'Innovative application of AI in local agriculture. Model accuracy of 92%.', evaluatedAt: new Date('2023-03-22') }
                },
                statusHistory: [
                    { fromStatus: 'FINAL_DEFENSE', toStatus: 'FINAL_APPROVED', comment: 'Passed final defense with commendation.', changedAt: new Date('2023-03-22') },
                    { fromStatus: 'FINAL_APPROVED', toStatus: 'ARCHIVED', comment: 'Archived after completion.', changedAt: new Date('2023-04-10') }
                ],
                createdAt: new Date('2022-08-10'),
                updatedAt: new Date('2023-04-10')
            },
            {
                title: 'BukSU Library Resource Management System with QR Code Integration',
                members: [students[14]._id, students[15]._id, students[16]._id],
                adviser: advisers[1]._id,
                status: 'ARCHIVED',
                capstonePhase: 4,
                academicYear: '2022-2023',
                keywords: ['library system', 'QR code', 'resource management', 'book tracking', 'inventory'],
                titleLocked: true,
                proposal: {
                    background: 'The BukSU library currently uses a logbook-based borrowing system which makes it difficult to track overdue books, monitor inventory, and generate usage reports.',
                    problemStatement: 'How can a web-based library management system with QR code integration streamline book borrowing, returns, and inventory tracking at BukSU?',
                    generalObjective: 'To develop a library resource management system with QR code-based book identification for Bukidnon State University.',
                    specificObjectives: [
                        'To implement a cataloging system with QR code generation for each book.',
                        'To develop modules for borrowing, returning, and overdue notification.',
                        'To create an admin dashboard for inventory reporting and analytics.',
                        'To evaluate system efficiency through comparative analysis with the existing manual process.'
                    ],
                    scope: [
                        'Book catalog management with QR code labels.',
                        'Borrower registration and transaction tracking.',
                        'Overdue notifications via email.'
                    ],
                    delimitations: [
                        'Does not include e-book or digital resource management.',
                        'Limited to the main campus library.'
                    ],
                    methodology: {
                        sdlc: 'Iterative',
                        techStack: { frontend: 'Vue.js', backend: 'Node.js / Express', database: 'MongoDB', tools: ['qrcode.js', 'Nodemailer', 'Vuetify'] }
                    }
                },
                capstone4: {
                    plagiarismReport: { score: 9, status: 'clear' },
                    defenseVerdict: { result: 'passed', remarks: 'Functional system ready for pilot deployment.', evaluatedAt: new Date('2023-03-10') }
                },
                statusHistory: [
                    { fromStatus: 'FINAL_DEFENSE', toStatus: 'FINAL_APPROVED', comment: 'Passed final defense.', changedAt: new Date('2023-03-10') },
                    { fromStatus: 'FINAL_APPROVED', toStatus: 'ARCHIVED', comment: 'Archived after completion.', changedAt: new Date('2023-04-01') }
                ],
                createdAt: new Date('2022-08-18'),
                updatedAt: new Date('2023-04-01')
            },
            {
                title: 'Disaster Risk Assessment and Evacuation Route Mapping System for Malaybalay City',
                members: [students[17]._id, students[18]._id, students[19]._id],
                adviser: advisers[2]._id,
                status: 'ARCHIVED',
                capstonePhase: 4,
                academicYear: '2022-2023',
                keywords: ['disaster risk', 'GIS', 'evacuation mapping', 'web GIS', 'hazard assessment', 'DRRM'],
                titleLocked: true,
                proposal: {
                    background: 'Malaybalay City is prone to flooding and landslides during typhoon season. The city DRRM office lacks a centralized digital tool for assessing risk areas and planning evacuation routes.',
                    problemStatement: 'How can a web-based GIS application assist the Malaybalay DRRM office in assessing disaster risks and mapping optimal evacuation routes?',
                    generalObjective: 'To develop a web-based GIS application for disaster risk assessment and evacuation route mapping for Malaybalay City.',
                    specificObjectives: [
                        'To integrate flood and landslide hazard maps from PHIVOLCS and MGB.',
                        'To implement shortest-path algorithms for evacuation route computation.',
                        'To provide a public-facing portal for residents to view nearby evacuation centers.',
                        'To validate mapped routes with DRRM personnel through field verification.'
                    ],
                    scope: [
                        'Flood and landslide hazard visualization.',
                        'Evacuation center database with capacity information.',
                        'Route computation from any point to the nearest center.'
                    ],
                    delimitations: [
                        'Limited to Malaybalay City boundaries.',
                        'Does not include real-time weather data integration.'
                    ],
                    methodology: {
                        sdlc: 'Waterfall',
                        techStack: { frontend: 'React.js', backend: 'Node.js / Express', database: 'PostgreSQL / PostGIS', tools: ['Leaflet.js', 'GeoJSON', 'Turf.js'] }
                    }
                },
                capstone4: {
                    plagiarismReport: { score: 7, status: 'clear' },
                    defenseVerdict: { result: 'passed', remarks: 'Strong community impact. DRRM office expressed interest in adoption.', evaluatedAt: new Date('2023-03-25') }
                },
                statusHistory: [
                    { fromStatus: 'FINAL_DEFENSE', toStatus: 'FINAL_APPROVED', comment: 'Passed final defense.', changedAt: new Date('2023-03-25') },
                    { fromStatus: 'FINAL_APPROVED', toStatus: 'ARCHIVED', comment: 'Archived after completion.', changedAt: new Date('2023-04-15') }
                ],
                createdAt: new Date('2022-09-05'),
                updatedAt: new Date('2023-04-15')
            },
            {
                title: 'Student Performance Analytics Dashboard Using Learning Management System Data',
                members: [students[20]._id, students[21]._id, students[22]._id, students[23]._id],
                adviser: advisers[0]._id,
                status: 'ARCHIVED',
                capstonePhase: 4,
                academicYear: '2024-2025',
                keywords: ['learning analytics', 'data visualization', 'student performance', 'dashboard', 'LMS', 'predictive analytics'],
                titleLocked: true,
                proposal: {
                    background: 'BukSU uses an LMS for course delivery but lacks analytical tools to help instructors identify at-risk students early. This project builds an analytics dashboard that aggregates LMS activity data to provide actionable insights.',
                    problemStatement: 'How can a data analytics dashboard derived from LMS activity logs help instructors identify at-risk students and improve course completion rates?',
                    generalObjective: 'To develop a student performance analytics dashboard that visualizes LMS engagement data and predicts at-risk learners.',
                    specificObjectives: [
                        'To extract and aggregate student activity logs from the university LMS.',
                        'To design interactive charts displaying engagement metrics per course.',
                        'To implement a basic predictive model for identifying at-risk students.',
                        'To evaluate the dashboard effectiveness through instructor feedback surveys.'
                    ],
                    scope: [
                        'Data extraction from existing LMS activity logs.',
                        'Interactive dashboard for instructors.',
                        'At-risk student flagging based on login frequency and assignment submission rates.'
                    ],
                    delimitations: [
                        'Does not modify the existing LMS platform.',
                        'Predictive model uses basic regression, not advanced ML.'
                    ],
                    methodology: {
                        sdlc: 'Agile/Scrum',
                        techStack: { frontend: 'React.js', backend: 'Python / Django', database: 'PostgreSQL', tools: ['D3.js', 'Pandas', 'scikit-learn', 'REST API'] }
                    }
                },
                capstone4: {
                    plagiarismReport: { score: 11, status: 'clear' },
                    defenseVerdict: { result: 'passed', remarks: 'Valuable tool for academic intervention. Dashboard UI is well-designed.', evaluatedAt: new Date('2025-01-20') }
                },
                statusHistory: [
                    { fromStatus: 'FINAL_DEFENSE', toStatus: 'FINAL_APPROVED', comment: 'Passed final defense.', changedAt: new Date('2025-01-20') },
                    { fromStatus: 'FINAL_APPROVED', toStatus: 'ARCHIVED', comment: 'Archived after completion.', changedAt: new Date('2025-02-01') }
                ],
                createdAt: new Date('2024-08-12'),
                updatedAt: new Date('2025-02-01')
            },
            {
                title: 'Contactless School Gate Attendance System Using RFID and Face Recognition',
                members: [students[24]._id, students[25]._id, students[26]._id],
                adviser: advisers[1]._id,
                status: 'ARCHIVED',
                capstonePhase: 4,
                academicYear: '2024-2025',
                keywords: ['RFID', 'face recognition', 'attendance system', 'contactless', 'biometric', 'school security'],
                titleLocked: true,
                proposal: {
                    background: 'Post-pandemic health protocols emphasize contactless processes. The current attendance system at the BukSU laboratory school uses manual logbooks. This project implements a dual-mode attendance system combining RFID cards and face recognition.',
                    problemStatement: 'How can a contactless attendance system using RFID and face recognition improve the accuracy and speed of student attendance logging at the BukSU laboratory school?',
                    generalObjective: 'To develop a contactless attendance system that uses RFID and face recognition for automated student attendance tracking.',
                    specificObjectives: [
                        'To design and deploy RFID-based tap-in stations at school gates.',
                        'To implement a face recognition module as a secondary verification method.',
                        'To build a web portal for teachers and administrators to view attendance records.',
                        'To measure system speed and accuracy compared to manual attendance logging.'
                    ],
                    scope: [
                        'RFID-based primary attendance logging.',
                        'Face recognition fallback for students without RFID cards.',
                        'Admin web portal with daily/weekly/monthly reports.'
                    ],
                    delimitations: [
                        'Limited to the BukSU laboratory high school.',
                        'Face recognition accuracy dependent on adequate lighting conditions.'
                    ],
                    methodology: {
                        sdlc: 'V-Model',
                        techStack: { frontend: 'React.js', backend: 'Python / FastAPI', database: 'MySQL', tools: ['OpenCV', 'dlib', 'MFRC522', 'Raspberry Pi'] }
                    }
                },
                capstone4: {
                    plagiarismReport: { score: 5, status: 'clear' },
                    defenseVerdict: { result: 'passed', remarks: 'Impressive hardware integration. RFID read speed under 1 second. Face recognition accuracy at 95%.', evaluatedAt: new Date('2025-01-25') }
                },
                statusHistory: [
                    { fromStatus: 'FINAL_DEFENSE', toStatus: 'FINAL_APPROVED', comment: 'Passed final defense with commendation.', changedAt: new Date('2025-01-25') },
                    { fromStatus: 'FINAL_APPROVED', toStatus: 'ARCHIVED', comment: 'Archived after completion.', changedAt: new Date('2025-02-10') }
                ],
                createdAt: new Date('2024-08-20'),
                updatedAt: new Date('2025-02-10')
            }
        ];

        // Remove any previously seeded archived projects (by exact title match)
        const titles = archivedProjects.map(p => p.title);
        const deleted = await Project.deleteMany({ title: { $in: titles } });
        console.log(`Cleared ${deleted.deletedCount} previously seeded archived projects`);

        const inserted = await Project.insertMany(archivedProjects);
        console.log(`Seeded ${inserted.length} archived capstone projects`);

        // Create teams for each project
        const teams = inserted.map((project, idx) => ({
            name: `Team ${project.title.split(' ').slice(0, 3).join(' ')}`,
            members: archivedProjects[idx].members.map((userId, memberIdx) => ({
                user: userId,
                role: memberIdx === 0 ? 'leader' : 'member',
                joinedAt: project.createdAt
            })),
            maxSize: 5,
            status: 'locked',
            invitations: [],
            project: project._id,
            createdBy: archivedProjects[idx].members[0]
        }));

        // Remove old teams for these projects
        await Team.deleteMany({ project: { $in: inserted.map(p => p._id) } });
        const insertedTeams = await Team.insertMany(teams);
        console.log(`Seeded ${insertedTeams.length} teams for archived projects`);

        console.log('\nArchived capstone seed complete.');
        console.log('Summary:');
        console.log(`  Advisers: ${advisers.length}`);
        console.log(`  Students: ${students.length}`);
        console.log(`  Archived Projects: ${inserted.length}`);
        console.log(`  Teams: ${insertedTeams.length}`);
        console.log('\nAcademic years covered: 2022-2023, 2023-2024, 2024-2025');

        process.exit();
    } catch (error) {
        console.error('Error seeding archived capstones:', error);
        process.exit(1);
    }
};

seedArchived();
