import React, { createContext, useContext, useState, useEffect } from 'react';
import { isBikatr7URL } from '../utils';

interface ThemeContextType {
    isRetro: boolean;
    toggleRetro: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isRetro, setIsRetro] = useState(() => {
        // Initialize from localStorage or URL
        const savedRetro = localStorage.getItem('isRetro');
        return savedRetro ? JSON.parse(savedRetro) : isBikatr7URL();
    });

    useEffect(() => {
        localStorage.setItem('isRetro', JSON.stringify(isRetro));
    }, [isRetro]);

    const toggleRetro = () => {
        setIsRetro(!isRetro);
    };

    return (
        <ThemeContext.Provider value={{ isRetro, toggleRetro }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
} 