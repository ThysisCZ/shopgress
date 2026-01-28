import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '@mdi/react';
import { mdiThemeLightDark, mdiLogout } from '@mdi/js';
import { useUserContext } from '@/context/UserContext';
import { useModeContext } from '@/context/ModeContext';
import { useLanguageContext } from '@/context/LanguageContext';
import LanguageSelector from '@/components/language-selector';
import { useRouter } from 'expo-router';

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
    userInfo: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    button: {
        padding: 8,
        borderRadius: 4,
    },
});

export default function TopPanel() {
    const { logout, logoutCall } = useUserContext();
    const { mode, setMode } = useModeContext();
    const { languages, currentLanguage, setCurrentLanguage } = useLanguageContext();
    const router = useRouter();

    const handleModeChange = () => {
        if (mode === "light") {
            setMode("dark");
            localStorage.setItem('mode', "dark");
        } else {
            setMode("light");
            localStorage.setItem('mode', "light");
        }
    }

    const handleLanguageChange = (id: string) => {
        const languageData = languages.find((language: Language) => language.id === id);

        if (languageData) {
            setCurrentLanguage(languageData);
            localStorage.setItem('language', JSON.stringify(languageData));
        }
    }

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    }

    return (
        <View style={styles.topPanel}>
            <TouchableOpacity
                disabled={logoutCall === "pending"}
                onPress={handleLogout}
                style={styles.button}
            >
                <div style={{ display: "flex", flexDirection: "row", gap: 5 }}>
                    <Icon path={mdiLogout} size={1} color="#333" />
                    <Text style={{ marginTop: 2 }}>
                        {logoutCall === "pending" ?
                            <div>
                                {currentLanguage.id === "EN" ? "Loading..." : "Odhlašování..."}
                            </div> :
                            <div>
                                {currentLanguage.id === "EN" ? "Logout" : "Odhlásit se"}
                            </div>
                        }
                    </Text>
                </div>
            </TouchableOpacity>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 3, marginRight: 3 }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Text style={{ marginBottom: 3 }}>{currentLanguage.id === "EN" ? "Language" : "Jazyk"}:</Text>
                    <LanguageSelector
                        languages={languages}
                        setLanguage={handleLanguageChange}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Text style={{ marginBottom: 3 }}>{currentLanguage.id === "EN" ? "Mode" : "Režim"}:</Text>
                    <TouchableOpacity
                        onPress={handleModeChange}
                        style={styles.button}
                    >
                        <Icon path={mdiThemeLightDark} size={1} color="#333" />
                    </TouchableOpacity>
                </div>
            </div>
        </View>
    );
}