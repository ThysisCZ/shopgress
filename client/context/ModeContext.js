import { createContext, useContext, useState, useEffect } from 'react';

// Create mode context
const ModeContext = createContext();

// Custom hook for mode context
export function useModeContext() {
    return useContext(ModeContext);
}

// Component that provides mode context
export function ModeProvider({ children }) {
    const [mode, setMode] = useState("light");

    const value = {
        mode,
        setMode
    }

    // Set mode context with localStorage on mount
    useEffect(() => {
        const storedMode = localStorage.getItem('mode');
        setMode(storedMode);
    }, []);

    return (
        <ModeContext.Provider value={value}>
            {children}
        </ModeContext.Provider>
    )
}