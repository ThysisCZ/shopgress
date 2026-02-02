import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create mode context
const ModeContext = createContext();

// Custom hook for mode context
export function useModeContext() {
    return useContext(ModeContext);
}

// Component that provides mode context
export function ModeProvider({ children }) {
    const [mode, setMode] = useState("light");

    const getMode = async () => {
        try {
            const storedMode = await AsyncStorage.getItem('mode');

            if (!storedMode) {
                return null
            }

            return storedMode;
        } catch (e) {
            console.error("Failed to load mode from storage", e);
            return null;
        }
    };

    // Set mode context with AsyncStorage on mount
    useEffect(() => {
        const loadMode = async () => {
            const storedMode = await getMode();

            if (storedMode) {
                setMode(storedMode);
            }
        }
        loadMode();
    }, []);

    const value = {
        mode,
        setMode
    }

    return (
        <ModeContext.Provider value={value}>
            {children}
        </ModeContext.Provider>
    )
}