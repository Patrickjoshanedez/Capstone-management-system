import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../components/ui/dialog';
import {
    BookOpen,
    FileText,
    BarChart3,
    Search,
    GraduationCap,
    Users,
    Briefcase,
    FileSearch,
    FileIcon,
    Cloud,
    Sun,
    Moon,
} from 'lucide-react';

// Using Lucide icons for dark mode toggle (Sun, Moon imported above)

const LandingPage = () => {
    const [faqOpen, setFaqOpen] = useState(false);
    const [overviewOpen, setOverviewOpen] = useState(false);
    const { darkMode, toggleDarkMode } = useTheme();

    const faqItems = [
        {
            question: 'What is Project Workspace?',
            answer: 'Project Workspace is a comprehensive Capstone Management System designed to streamline the process of managing capstone projects from proposal to final submission.'
        },
        {
            question: 'Who can use this system?',
            answer: 'The system supports three user roles: Students (who create and submit projects), Advisers (who review and guide projects), and Research Coordinators (who oversee all capstone projects).'
        },
        {
            question: 'How do I submit my proposal?',
            answer: 'After logging in as a student, navigate to the Centralized Submission Portal from your dashboard. You can upload your proposal document in PDF format.'
        },
        {
            question: 'What is the Originality/Similarity Report?',
            answer: 'The system checks your submitted documents for similarity with existing capstone projects and academic sources to ensure originality. You will receive a detailed report showing the similarity percentage.'
        },
        {
            question: 'How does the title similarity check work?',
            answer: 'When you propose a new project title, the system automatically checks for similar existing titles. You will see one of three results: unique title, similar but not identical title, or title already in development.'
        },
        {
            question: 'Can I track my project progress?',
            answer: 'Yes! The Real-time Progress Tracking feature allows you to monitor your project\'s status through each stage: Proposed → Adviser Review → Revision → Approved for Defense → Final Submitted → Archived.'
        },
        {
            question: 'How do I contact my adviser?',
            answer: 'Once an adviser is assigned to your project, you can view their contact information in your project details. The notification system will also keep both parties informed of any updates.'
        }
    ];

    const workflowSteps = [
        { step: 1, title: 'Register/Login', description: 'Create an account or sign in to access the system based on your role.' },
        { step: 2, title: 'Create Project Proposal', description: 'Students can create a new project proposal with a title and team members.' },
        { step: 3, title: 'Title Similarity Check', description: 'The system automatically checks if your title is similar to existing projects.' },
        { step: 4, title: 'Upload Documents', description: 'Submit your proposal document through the Centralized Submission Portal.' },
        { step: 5, title: 'Adviser Review', description: 'Your assigned adviser reviews the proposal and provides feedback.' },
        { step: 6, title: 'Revisions (if needed)', description: 'Make necessary revisions based on adviser feedback.' },
        { step: 7, title: 'Defense Approval', description: 'Once approved, proceed to defense preparation.' },
        { step: 8, title: 'Final Submission', description: 'Submit your final capstone document for archival.' }
    ];

    return (
        <div className="tw-min-h-screen tw-bg-background">
            {/* Navigation */}
            <nav className="tw-bg-card tw-shadow-sm tw-border-b tw-border-border">
                <div className="tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
                    <div className="tw-flex tw-justify-between tw-items-center tw-h-16">
                        <div className="tw-flex tw-items-center">
                            <span className="tw-text-xl tw-font-bold tw-text-indigo-600 dark:tw-text-indigo-400 tw-flex tw-items-center tw-gap-2">
                                <BookOpen className="tw-w-6 tw-h-6" />
                                Project Workspace
                            </span>
                        </div>
                        <div className="tw-flex tw-items-center tw-gap-4">
                            {/* Dark mode toggle */}
                            <button
                                onClick={toggleDarkMode}
                                className="tw-p-2 tw-rounded-lg tw-bg-muted hover:tw-bg-muted/80 tw-text-foreground tw-transition-colors tw-duration-200"
                                aria-label="Toggle dark mode"
                            >
                                <div className="tw-w-5 tw-h-5 tw-flex tw-items-center tw-justify-center">
                                    {darkMode ? <Sun className="tw-w-5 tw-h-5" /> : <Moon className="tw-w-5 tw-h-5" />}
                                </div>
                            </button>

                            <Dialog open={overviewOpen} onOpenChange={setOverviewOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost">System Overview</Button>
                                </DialogTrigger>
                                <DialogContent className="tw-max-w-2xl tw-max-h-[80vh] tw-overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>System Overview</DialogTitle>
                                        <DialogDescription>
                                            Understanding the Capstone Management System
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="tw-space-y-4">
                                        <div>
                                            <h3 className="tw-font-semibold tw-text-lg tw-mb-2 tw-text-foreground">Purpose</h3>
                                            <p className="tw-text-muted-foreground">
                                                Project Workspace is designed to manage the entire lifecycle of capstone projects, 
                                                from initial proposal to final submission and archival. It provides a centralized 
                                                platform for students, advisers, and research coordinators to collaborate effectively.
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="tw-font-semibold tw-text-lg tw-mb-2 tw-text-foreground">Copyleaks API Integration</h3>
                                            <p className="tw-text-muted-foreground">
                                                We integrate with Copyleaks for plagiarism detection, ensuring academic integrity 
                                                by checking submitted documents against a vast database of academic sources and 
                                                existing capstone projects.
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="tw-font-semibold tw-text-lg tw-mb-2 tw-text-foreground">Document Submission</h3>
                                            <p className="tw-text-muted-foreground">
                                                All documents are securely stored using Google Drive API. Students can upload 
                                                their proposals in PDF format, and the system maintains version history for 
                                                tracking changes throughout the project lifecycle.
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="tw-font-semibold tw-text-lg tw-mb-2 tw-text-foreground">Workflow Stages</h3>
                                            <div className="tw-space-y-2">
                                                {workflowSteps.map((item) => (
                                                    <div key={item.step} className="tw-flex tw-gap-3 tw-items-start">
                                                        <span className="tw-bg-indigo-500/10 dark:tw-bg-indigo-500/20 tw-text-indigo-800 dark:tw-text-indigo-300 tw-rounded-full tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center tw-text-sm tw-font-medium tw-flex-shrink-0">
                                                            {item.step}
                                                        </span>
                                                        <div>
                                                            <span className="tw-font-medium tw-text-foreground">{item.title}</span>
                                                            <p className="tw-text-sm tw-text-muted-foreground">{item.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost">FAQ</Button>
                                </DialogTrigger>
                                <DialogContent className="tw-max-w-2xl tw-max-h-[80vh] tw-overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Frequently Asked Questions</DialogTitle>
                                        <DialogDescription>
                                            Find answers to common questions about Project Workspace
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="tw-space-y-4">
                                        {faqItems.map((item, index) => (
                                            <div key={index} className="tw-border tw-border-border tw-rounded-lg tw-p-4">
                                                <h4 className="tw-font-medium tw-text-foreground tw-mb-2">
                                                    {item.question}
                                                </h4>
                                                <p className="tw-text-sm tw-text-muted-foreground">
                                                    {item.answer}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Link to="/login">
                                <Button variant="outline">Login</Button>
                            </Link>
                            <Link to="/register">
                                <Button>Register</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8 tw-py-16">
                <div className="tw-text-center tw-mb-16">
                    <h1 className="tw-text-4xl sm:tw-text-5xl tw-font-bold tw-text-foreground tw-mb-6">
                        Capstone Management
                        <span className="tw-text-indigo-600 dark:tw-text-indigo-400"> Made Simple</span>
                    </h1>
                    <p className="tw-text-xl tw-text-muted-foreground tw-max-w-3xl tw-mx-auto tw-mb-8">
                        A comprehensive platform for managing capstone projects from proposal to completion. 
                        Track progress, collaborate with advisers, and ensure originality with integrated plagiarism detection.
                    </p>
                    <div className="tw-flex tw-justify-center tw-gap-4">
                        <Link to="/register">
                            <Button size="lg" className="tw-px-8">
                                Get Started
                            </Button>
                        </Link>
                        <Dialog open={overviewOpen} onOpenChange={setOverviewOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg" variant="outline" className="tw-px-8">
                                    Learn More
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="tw-grid md:tw-grid-cols-3 tw-gap-8 tw-mb-16">
                    <Card className="tw-border-0 tw-shadow-lg">
                        <CardHeader>
                            <div className="tw-text-indigo-500 tw-mb-2"><FileText className="tw-w-10 tw-h-10" /></div>
                            <CardTitle>Centralized Submission</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="tw-text-muted-foreground">
                                Submit and manage all your capstone documents in one place. 
                                Upload proposals, track revisions, and store final submissions securely.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="tw-border-0 tw-shadow-lg">
                        <CardHeader>
                            <div className="tw-text-emerald-500 tw-mb-2"><BarChart3 className="tw-w-10 tw-h-10" /></div>
                            <CardTitle>Real-time Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="tw-text-muted-foreground">
                                Track your project's journey through each stage. Get instant updates 
                                on status changes and feedback from your adviser.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="tw-border-0 tw-shadow-lg">
                        <CardHeader>
                            <div className="tw-text-amber-500 tw-mb-2"><Search className="tw-w-10 tw-h-10" /></div>
                            <CardTitle>Originality Check</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="tw-text-muted-foreground">
                                Ensure academic integrity with integrated plagiarism detection. 
                                Get detailed similarity reports for your submissions.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Role-Based Features */}
                <div className="tw-mb-16">
                    <h2 className="tw-text-3xl tw-font-bold tw-text-center tw-mb-8 tw-text-foreground">
                        Features for Every Role
                    </h2>
                    <div className="tw-grid md:tw-grid-cols-3 tw-gap-8">
                        <Card className="tw-bg-indigo-500/10 dark:tw-bg-indigo-500/20 tw-border-indigo-500/30">
                            <CardHeader>
                                <div className="tw-text-indigo-500 tw-mb-2"><GraduationCap className="tw-w-8 tw-h-8" /></div>
                                <CardTitle className="tw-text-indigo-900 dark:tw-text-indigo-300">Students</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="tw-space-y-2 tw-text-indigo-800 dark:tw-text-indigo-300">
                                    <li className="tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-text-indigo-500">✓</span> Create project proposals
                                    </li>
                                    <li className="tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-text-indigo-500">✓</span> Upload documents
                                    </li>
                                    <li className="tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-text-indigo-500">✓</span> View similarity reports
                                    </li>
                                    <li className="tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-text-indigo-500">✓</span> Track progress in real-time
                                    </li>
                                    <li className="tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-text-indigo-500">✓</span> Manage profile & notifications
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="tw-bg-emerald-500/10 dark:tw-bg-emerald-500/20 tw-border-emerald-500/30">
                            <CardHeader>
                                <div className="tw-text-emerald-500 tw-mb-2"><Users className="tw-w-8 tw-h-8" /></div>
                                <CardTitle className="tw-text-emerald-900 dark:tw-text-emerald-300">Advisers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="tw-space-y-2 tw-text-emerald-800 dark:tw-text-emerald-300">
                                    <li className="tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-text-emerald-500">✓</span> View assigned teams
                                    </li>
                                    <li className="tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-text-emerald-500">✓</span> Review proposals
                                    </li>
                                    <li className="tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-text-emerald-500">✓</span> Request revisions
                                    </li>
                                    <li className="tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-text-emerald-500">✓</span> Approve for defense
                                    </li>
                                    <li className="tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-text-emerald-500">✓</span> Track overall statistics
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="tw-bg-purple-500/10 dark:tw-bg-purple-500/20 tw-border-purple-500/30">
                            <CardHeader>
                                <div className="tw-text-purple-500 tw-mb-2"><Briefcase className="tw-w-8 tw-h-8" /></div>
                                <CardTitle className="tw-text-purple-900 dark:tw-text-purple-300">Research Coordinators</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="tw-space-y-2 tw-text-purple-800 dark:tw-text-purple-300">
                                    <li className="tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-text-purple-500">✓</span> View all capstone teams
                                    </li>
                                    <li className="tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-text-purple-500">✓</span> Monitor completion rates
                                    </li>
                                    <li className="tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-text-purple-500">✓</span> Review paper status
                                    </li>
                                    <li className="tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-text-purple-500">✓</span> Access department statistics
                                    </li>
                                    <li className="tw-flex tw-items-center tw-gap-2">
                                        <span className="tw-text-purple-500">✓</span> Archive completed projects
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Title Similarity Section */}
                <Card className="tw-mb-16 tw-border-0 tw-shadow-lg tw-bg-amber-500/10 dark:tw-bg-amber-500/20 tw-border-amber-500/30">
                    <CardContent className="tw-p-8">
                        <div className="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-gap-8">
                            <div className="tw-text-amber-500"><FileSearch className="tw-w-16 tw-h-16" /></div>
                            <div>
                                <h3 className="tw-text-2xl tw-font-bold tw-text-foreground tw-mb-4">
                                    Smart Title Similarity Detection
                                </h3>
                                <p className="tw-text-muted-foreground tw-mb-4">
                                    Our system automatically checks your proposed title against existing capstone projects 
                                    to help you create unique and original research topics.
                                </p>
                                <div className="tw-grid sm:tw-grid-cols-3 tw-gap-4">
                                    <div className="tw-bg-card tw-rounded-lg tw-p-4 tw-border tw-border-emerald-500/30">
                                        <div className="tw-text-emerald-600 dark:tw-text-emerald-400 tw-font-semibold tw-mb-1">✓ Unique Title</div>
                                        <p className="tw-text-sm tw-text-muted-foreground">This capstone has not yet existed</p>
                                    </div>
                                    <div className="tw-bg-card tw-rounded-lg tw-p-4 tw-border tw-border-amber-500/30">
                                        <div className="tw-text-amber-600 dark:tw-text-amber-400 tw-font-semibold tw-mb-1">⚠ Similar Title</div>
                                        <p className="tw-text-sm tw-text-muted-foreground">Has similarity but not entirely the same</p>
                                    </div>
                                    <div className="tw-bg-card tw-rounded-lg tw-p-4 tw-border tw-border-red-500/30">
                                        <div className="tw-text-red-600 dark:tw-text-red-400 tw-font-semibold tw-mb-1">✕ In Development</div>
                                        <p className="tw-text-sm tw-text-muted-foreground">Currently being developed by seniors</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* CTA Section */}
                <div className="tw-text-center tw-py-16 tw-bg-card tw-rounded-2xl tw-shadow-lg tw-border tw-border-border">
                    <h2 className="tw-text-3xl tw-font-bold tw-text-foreground tw-mb-4">
                        Ready to Start Your Capstone Journey?
                    </h2>
                    <p className="tw-text-muted-foreground tw-mb-8 tw-max-w-2xl tw-mx-auto">
                        Join Project Workspace today and experience a streamlined approach to managing 
                        your capstone project from start to finish.
                    </p>
                    <div className="tw-flex tw-justify-center tw-gap-4">
                        <Link to="/register">
                            <Button size="lg" className="tw-px-8">
                                Create Account
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline" className="tw-px-8">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="tw-bg-gray-900 tw-text-white tw-py-12 tw-mt-16">
                <div className="tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
                    <div className="tw-grid md:tw-grid-cols-3 tw-gap-8">
                        <div>
                            <h3 className="tw-text-lg tw-font-semibold tw-mb-4 tw-flex tw-items-center tw-gap-2"><BookOpen className="tw-w-5 tw-h-5" /> Project Workspace</h3>
                            <p className="tw-text-gray-400">
                                A comprehensive Capstone Management System for academic excellence.
                            </p>
                        </div>
                        <div>
                            <h3 className="tw-text-lg tw-font-semibold tw-mb-4">Quick Links</h3>
                            <ul className="tw-space-y-2 tw-text-gray-400">
                                <li>
                                    <button onClick={() => setOverviewOpen(true)} className="hover:tw-text-white tw-transition-colors">
                                        System Overview
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => setFaqOpen(true)} className="hover:tw-text-white tw-transition-colors">
                                        FAQ
                                    </button>
                                </li>
                                <li>
                                    <Link to="/login" className="hover:tw-text-white tw-transition-colors">
                                        Login
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/register" className="hover:tw-text-white tw-transition-colors">
                                        Register
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="tw-text-lg tw-font-semibold tw-mb-4">Integrations</h3>
                            <ul className="tw-space-y-2 tw-text-gray-400">
                                <li className="tw-flex tw-items-center tw-gap-2"><FileIcon className="tw-w-4 tw-h-4" /> Google Docs API</li>
                                <li className="tw-flex tw-items-center tw-gap-2"><Search className="tw-w-4 tw-h-4" /> Copyleaks API</li>
                                <li className="tw-flex tw-items-center tw-gap-2"><Cloud className="tw-w-4 tw-h-4" /> Google Drive Storage</li>
                            </ul>
                        </div>
                    </div>
                    <div className="tw-border-t tw-border-gray-800 tw-mt-8 tw-pt-8 tw-text-center tw-text-gray-400">
                        <p>&copy; {new Date().getFullYear()} Project Workspace. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
