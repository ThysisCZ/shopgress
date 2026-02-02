import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

    const getLanguage = async () => {
        try {
            const storedLanguage = await AsyncStorage.getItem('language');

            if (!storedLanguage) {
                return null
            }

            return JSON.parse(storedLanguage)
        } catch (e) {
            console.error("Failed to load language from storage", e);
            return null;
        }
    };

    // Set language context with AsyncStorage on mount
    useEffect(() => {
        const loadLanguage = async () => {
            const storedLanguage = await getLanguage();

            if (storedLanguage) {
                setCurrentLanguage(storedLanguage);
            }
        }
        loadLanguage();
    }, []);

    const value = {
        languages,
        currentLanguage,
        setCurrentLanguage
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}