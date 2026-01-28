import { createContext, useContext, useState, useEffect } from 'react';

// Create user context
const UserContext = createContext();

// Custom hook for user context
export function useUserContext() {
    return useContext(UserContext);
}

// Component that provides user context
export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState(null);
    const [token, setToken] = useState(null);
    const [logoutCall, setLogoutCall] = useState("inactive");

    // Load user data from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Login function - stores user data and token
    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);

        // Persist to localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Logout function - clears everything
    const logout = () => {
        setLogoutCall("pending");

        setTimeout(() => {
            setUser(null);
            setToken(null);

            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            setLogoutCall("success");
        }, 2000);
    };

    // Value that will be accessible to all components
    const value = {
        user,
        users,
        setUsers,
        token,
        login,
        logout,
        logoutCall
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}