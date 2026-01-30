import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' ||
                (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Use useLayoutEffect to set theme before paint (prevents flash)
    useLayoutEffect(() => {
        const root = document.documentElement;
        
        // Disable transitions on initial load to prevent flash
        if (isInitialLoad) {
            root.classList.add('no-transitions');
        }

        if (darkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }

        // Re-enable transitions after initial load
        if (isInitialLoad) {
            // Small delay to ensure styles are applied before enabling transitions
            const timer = setTimeout(() => {
                root.classList.remove('no-transitions');
                setIsInitialLoad(false);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [darkMode, isInitialLoad]);

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
