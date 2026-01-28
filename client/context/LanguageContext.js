import { createContext, useContext, useState, useEffect } from 'react';
import mockData from '../mockData.json';

// Create language context
const LanguageContext = createContext();

// Custom hook for language context
export function useLanguageContext() {
    return useContext(LanguageContext);
}

// Component that provides language context
export function LanguageProvider({ children }) {
    const [currentLanguage, setCurrentLanguage] = useState({
        "id": "EN",
        "name": "English"
    });

    const languages = mockData.languages;

    const value = {
        languages,
        currentLanguage,
        setCurrentLanguage
    }

    // Set language context with localStorage on mount
    useEffect(() => {
        const storedLanguage = localStorage.getItem('language');
        setCurrentLanguage(JSON.parse(storedLanguage));
    }, []);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}