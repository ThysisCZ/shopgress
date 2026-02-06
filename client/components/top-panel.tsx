import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserContext } from '@/context/UserContext';
import { useModeContext } from '@/context/ModeContext';
import { useLanguageContext } from '@/context/LanguageContext';
import LanguageSelector from '@/components/language-selector';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Language {
    key: string;
    id: string;
    name: string;
}

export default function TopPanel() {
    const { user, logout, logoutCall } = useUserContext();
    const { mode, setMode } = useModeContext();
    const { languages, currentLanguage, setCurrentLanguage } = useLanguageContext();

    const saveMode = async (mode: string) => {
        try {
            await AsyncStorage.setItem('mode', mode);
            setMode(mode);
        } catch (e) {
            console.error("Failed to save language to storage", e);
        }
    };

    const handleModeChange = () => {
        if (mode === "light") {
            saveMode("dark")
        } else {
            saveMode("light")
        }
    }

    const saveLanguage = async (id: string, name: string) => {
        try {
            await AsyncStorage.setItem('language', JSON.stringify({ id, name }));
            setCurrentLanguage({ id, name });
        } catch (e) {
            console.error("Failed to save language to storage", e);
        }
    };

    const handleLanguageChange = (id: string) => {
        const languageData = languages.find((language: Language) => language.id === id);

        if (languageData) {
            saveLanguage(languageData.id, languageData.name)
        }
    }

    const handleLogout = async () => {
        await logout();
    }

    return (
        <View style={mode === "light" ? styles.topPanelLight : styles.topPanelDark}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                {user &&
                    <TouchableOpacity
                        disabled={logoutCall === "pending"}
                        onPress={handleLogout}
                        style={styles.button}
                    >
                        <MaterialCommunityIcons name="logout" size={24} color="#333" />
                        <Text style={{ marginTop: 2 }}>
                            {logoutCall === "pending" ?
                                (currentLanguage.id === "EN" ? "Loading..." : "Odhlašování...") :
                                (currentLanguage.id === "EN" ? "Logout" : "Odhlásit se")
                            }
                        </Text>
                    </TouchableOpacity>
                }
            </View>
            <View>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                    <LanguageSelector
                        languages={languages}
                        selectedLanguageId={currentLanguage.id}
                        setLanguage={handleLanguageChange}
                    />
                    <TouchableOpacity
                        onPress={handleModeChange}
                        style={styles.button}
                    >
                        <MaterialCommunityIcons name="theme-light-dark" size={24} color={mode === "light" ? "#333" : "white"} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    topPanelLight: {
        backgroundColor: "#dddddd",
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#dddddd',
        height: 90
    },
    topPanelDark: {
        backgroundColor: "#333",
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        height: 90
    },
    button: {
        backgroundColor: 'aqua',
        padding: 8,
        borderRadius: 4,
        flexDirection: 'row',
        gap: 3
    }
});