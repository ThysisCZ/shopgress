import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

    const getSession = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            const storedToken = await AsyncStorage.getItem('token');

            if (!storedUser || !storedToken) {
                return null;
            }

            const sessionData = {
                user: JSON.parse(storedUser),
                token: storedToken
            };

            return sessionData;
        } catch (e) {
            console.error("Failed to load user session from storage", e);
            return null;
        }
    };

    // Load user session data from AsyncStorage on mount
    useEffect(() => {
        const loadSession = async () => {
            const sessionData = await getSession();

            if (sessionData) {
                setUser(sessionData.user);
                setToken(sessionData.token);
            }
        }
        loadSession();
    }, []);

    // Login function - stores user data and token
    const login = async (userData, authToken) => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            await AsyncStorage.setItem('token', authToken);

            setUser(userData);
            setToken(authToken);
        } catch (e) {
            console.error("Failed to save user session to storage", e);
        }
    };

    // Logout function - clears everything
    const logout = () => {
        setLogoutCall("pending");

        setTimeout(async () => {
            setUser(null);
            setToken(null);

            // Clear AsyncStorage
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');

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