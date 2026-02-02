import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserContext } from '@/context/UserContext';
import { useModeContext } from '@/context/ModeContext';
import { useLanguageContext } from '@/context/LanguageContext';
import LanguageSelector from '@/components/language-selector';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Language {
    key: string;
    id: string;
    name: string;
}

const styles = StyleSheet.create({
    topPanel: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
    },
    button: {
        backgroundColor: 'aqua',
        padding: 8,
        borderRadius: 4,
    }
});

export default function TopPanel() {
    const { user, logout, logoutCall } = useUserContext();
    const { mode, setMode } = useModeContext();
    const { languages, currentLanguage, setCurrentLanguage } = useLanguageContext();
    const router = useRouter();

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
        router.replace('/login');
    }

    return (
        <View style={styles.topPanel}>
            <View>
                {user &&
                    <TouchableOpacity
                        disabled={logoutCall === "pending"}
                        onPress={handleLogout}
                        style={styles.button}
                    >
                        <View style={{ flex: 1, flexDirection: "row", gap: 5 }}>
                            <MaterialCommunityIcons name="logout" size={24} color="#333" />
                            <Text style={{ marginTop: 2 }}>
                                {logoutCall === "pending" ?
                                    (currentLanguage.id === "EN" ? "Loading..." : "Odhlašování...") :
                                    (currentLanguage.id === "EN" ? "Logout" : "Odhlásit se")
                                }
                            </Text>
                        </View>
                    </TouchableOpacity>
                }
            </View>
            <View style={{ flex: 1, flexDirection: "column", gap: 5, marginTop: 3, marginRight: 3 }}>
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Text style={{ marginBottom: 3 }}>{currentLanguage.id === "EN" ? "Language" : "Jazyk"}:</Text>
                    <LanguageSelector
                        languages={languages}
                        selectedLanguageId={currentLanguage.id}
                        setLanguage={handleLanguageChange}
                    />
                </View>
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Text style={{ marginBottom: 3 }}>{currentLanguage.id === "EN" ? "Mode" : "Režim"}:</Text>
                    <TouchableOpacity
                        onPress={handleModeChange}
                        style={styles.button}
                    >
                        <MaterialCommunityIcons name="theme-light-dark" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}