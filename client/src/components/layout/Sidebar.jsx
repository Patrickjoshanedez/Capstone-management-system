import React from 'react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, BookOpen } from 'lucide-react';

// Using Lucide icons for Sun and Moon (imported above)

const Sidebar = ({ navItems, activeSection, onNavigate, user, onLogout }) => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <div className="tw-fixed tw-left-0 tw-top-0 tw-h-full tw-w-64 tw-bg-card tw-border-r tw-border-border tw-shadow-sm tw-z-40 tw-transition-colors tw-duration-300">
            {/* Logo */}
            <div className="tw-p-4 tw-border-b tw-border-border">
                <Link to="/" className="tw-flex tw-items-center tw-gap-2">
                    <div className="tw-w-10 tw-h-10 tw-rounded-xl tw-bg-gradient-to-br tw-from-indigo-500 tw-to-purple-600 tw-flex tw-items-center tw-justify-center tw-shadow-lg">
                        <BookOpen className="tw-w-5 tw-h-5 tw-text-white" />
                    </div>
                    <span className="tw-text-lg tw-font-bold tw-text-foreground">
                        Project Workspace
                    </span>
                </Link>
            </div>

            {/* User Info */}
            <div className="tw-p-4 tw-border-b tw-border-border">
                <div className="tw-flex tw-items-center tw-gap-3">
                    <div className="tw-w-10 tw-h-10 tw-rounded-full tw-bg-gradient-to-br tw-from-indigo-400 tw-to-purple-500 tw-flex tw-items-center tw-justify-center tw-shadow-md">
                        <span className="tw-text-white tw-font-semibold">
                            {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="tw-flex-1 tw-min-w-0">
                        <div className="tw-font-medium tw-text-foreground tw-truncate">
                            {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'}
                        </div>
                        <div className="tw-text-sm tw-text-muted-foreground tw-capitalize">
                            {user?.role || 'Guest'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="tw-p-4 tw-flex-1 tw-overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                <ul className="tw-space-y-1">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => onNavigate(item.id)}
                                className={`tw-w-full tw-flex tw-items-center tw-gap-3 tw-px-4 tw-py-3 tw-rounded-lg tw-text-left tw-transition-all tw-duration-200 ${
                                    activeSection === item.id
                                        ? 'tw-bg-indigo-500/10 tw-text-indigo-600 dark:tw-text-indigo-400 tw-shadow-sm tw-border tw-border-indigo-500/20'
                                        : 'tw-text-muted-foreground hover:tw-bg-accent hover:tw-text-foreground'
                                }`}
                            >
                                <span className="tw-w-5 tw-h-5 tw-flex tw-items-center tw-justify-center">{item.icon}</span>
                                <span className="tw-font-medium">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Theme Toggle & Logout */}
            <div className="tw-p-4 tw-border-t tw-border-border tw-space-y-2">
                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="tw-w-full tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-3 tw-rounded-lg tw-text-muted-foreground hover:tw-bg-accent hover:tw-text-foreground tw-transition-colors tw-duration-200"
                >
                    <div className="tw-flex tw-items-center tw-gap-3">
                        {/* Icon container */}
                        <span className="tw-w-5 tw-h-5 tw-flex tw-items-center tw-justify-center">
                            {darkMode ? <Moon className="tw-w-5 tw-h-5" /> : <Sun className="tw-w-5 tw-h-5" />}
                        </span>
                        {/* Fixed-width text container */}
                        <span className="tw-font-medium tw-w-24">
                            {darkMode ? 'Dark Mode' : 'Light Mode'}
                        </span>
                    </div>
                    <div className={`tw-relative tw-w-11 tw-h-6 tw-rounded-full tw-flex-shrink-0 ${darkMode ? 'tw-bg-indigo-600' : 'tw-bg-muted'}`}>
                        <div className={`tw-absolute tw-top-0.5 tw-w-5 tw-h-5 tw-rounded-full tw-bg-white tw-shadow-md tw-transition-transform tw-duration-300 tw-ease-out ${darkMode ? 'tw-translate-x-5' : 'tw-translate-x-0.5'}`}>
                            <div className="tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-text-xs tw-text-muted-foreground">
                                {darkMode ? <Moon className="tw-w-3 tw-h-3" /> : <Sun className="tw-w-3 tw-h-3" />}
                            </div>
                        </div>
                    </div>
                </button>

                {/* Logout Button */}
                <Button
                    variant="outline"
                    className="tw-w-full tw-justify-start tw-gap-2 tw-border-border hover:tw-bg-destructive/10 hover:tw-text-destructive hover:tw-border-destructive/50 tw-transition-all tw-duration-200"
                    onClick={onLogout}
                >
                    <LogOut className="tw-w-4 tw-h-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
};

export default Sidebar;
