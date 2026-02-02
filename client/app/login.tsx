import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserContext } from '../context/UserContext';
import { useLanguageContext } from '../context/LanguageContext';
import { useRouter } from 'expo-router';

interface UserData {
    success: boolean,
    token: string,
    user: {
        id: string,
        name: string,
        email: string
    },
    message: string
}

const { width } = Dimensions.get('window');
const mobileSize = width < 568;

const styles = StyleSheet.create({
    loginContainer: {
        width: mobileSize ? 300 : 500,
        marginTop: 60,
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 30,
        borderWidth: 1,
        borderColor: '#d8d8d8',
        backgroundColor: 'white',
        borderRadius: 8,
    },
    loginHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#2e2e2e',
    },
    formLabel: {
        marginBottom: 8,
        color: '#2e2e2e',
        fontWeight: '500',
    },
    authButton: {
        marginTop: 25,
        alignItems: 'center',
    },
    successMessage: {
        padding: 12,
        marginTop: 20,
        backgroundColor: '#d4edda',
        color: '#155724',
        borderWidth: 1,
        borderColor: '#c3e6cb',
        borderRadius: 4,
        textAlign: 'center',
    },
    errorMessage: {
        padding: 12,
        marginTop: 20,
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderWidth: 1,
        borderColor: '#f5c6cb',
        borderRadius: 4,
        textAlign: 'center',
    },
    passwordInputWrapper: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        paddingRight: 50,
    },
    togglePasswordBtn: {
        position: 'absolute',
        right: 10,
        padding: 5,
    },
    link: {
        marginTop: 4,
        color: '#2779F6',
        textDecorationLine: 'underline',
        fontSize: 16,
        textAlign: 'center',
    },
    messageText: {
        textAlign: 'center',
    },
});

export default function LoginScreen() {
    const defaultForm = {
        email: '',
        password: ''
    }

    const SERVER_URI = process.env.EXPO_PUBLIC_SERVER_URI;

    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState(defaultForm);
    const [loginCall, setLoginCall] = useState<{ state: string; data?: UserData; error?: string }>({ state: "inactive" });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPassword, setShowPassword] = useState(false);
    const { login, user } = useUserContext();
    const { currentLanguage } = useLanguageContext();
    const router = useRouter();

    // Navigate to lists after login
    useEffect(() => {
        if (user) {
            router.replace('/shoppingLists');
        }
    }, [user, router]);

    const setField = (name: string, val: any) => {
        setFormData((formData) => ({ ...formData, [name]: val }));
    };

    const handleSubmit = async () => {
        setValidated(true);

        if (!formData.email || !formData.password) return;

        try {
            setLoginCall({ state: "pending" });
            setMessage({ type: '', text: '' });

            const response = await fetch(`${SERVER_URI}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setLoginCall({
                    state: "success",
                    data: data
                });

                login(data.user, data.token);
                setFormData(defaultForm);
                setValidated(false);

                setTimeout(() => {
                    router.replace('/shoppingLists');
                }, 1000);
            } else {
                setLoginCall({ state: "error", error: data.message });
                setMessage({ type: 'error', text: currentLanguage?.id === "EN" ? "Incorrect email or password." : "Nesprávný email nebo heslo." });
            }
        } catch (e: any) {
            console.error('Login error:', e);
            setLoginCall({ state: "error", error: e.message });
            setMessage({ type: 'error', text: currentLanguage?.id === "EN" ? "Network error. Please try again." : "Chyba sítě. Zkuste to prosím znovu." });
        }
    }

    return (
        <ScrollView style={{ flex: 1 }}>
            <View style={styles.loginContainer}>
                <Text style={styles.loginHeader}>
                    {currentLanguage?.id === "EN" ? "Login" : "Přihlášení"}
                </Text>

                <View style={{ marginBottom: 24 }}>
                    <Text style={styles.formLabel}>Email:</Text>
                    <TextInput
                        style={styles.passwordInput}
                        value={formData.email}
                        onChangeText={(val) => setField("email", val)}
                        maxLength={60}
                        keyboardType="email-address"
                    />
                    {validated && formData.email.length === 0 && (
                        <Text style={{ color: '#721c24' }}>
                            {currentLanguage?.id === "EN" ? "This field is required." : "Toto pole je povinné."}
                        </Text>
                    )}
                </View>

                <View style={{ marginBottom: 24 }}>
                    <Text style={styles.formLabel}>
                        {currentLanguage?.id === "EN" ? "Password" : "Heslo"}:
                    </Text>
                    <View style={styles.passwordInputWrapper}>
                        <TextInput
                            style={styles.passwordInput}
                            value={formData.password}
                            onChangeText={(val) => setField("password", val)}
                            maxLength={20}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.togglePasswordBtn}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ?
                                <MaterialCommunityIcons name="eye" size={24} /> :
                                <MaterialCommunityIcons name="eye-off" size={24} />
                            }
                        </TouchableOpacity>
                    </View>
                    {validated && formData.password.length === 0 && (
                        <Text style={{ color: '#721c24' }}>
                            {currentLanguage?.id === "EN" ? "This field is required." : "Toto pole je povinné."}
                        </Text>
                    )}
                </View>

                <View style={styles.authButton}>
                    <TouchableOpacity
                        disabled={loginCall.state === "pending"}
                        onPress={handleSubmit}
                        style={{
                            backgroundColor: loginCall.state === "pending" ? '#ccc' : '#007bff',
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderRadius: 4,
                        }}
                    >
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
                            {loginCall.state === "pending" ?
                                currentLanguage?.id === "EN" ? "Logging in..." : "Přihlašování..." :
                                currentLanguage?.id === "EN" ? "Login" : "Přihlásit se"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => router.replace("/forgotPassword")}
                    style={{ marginTop: 20, alignItems: 'center' }}
                >
                    <Text style={styles.link}>
                        {currentLanguage?.id === "EN" ? "Forgot password?" : "Zapomněli jste heslo?"}
                    </Text>
                </TouchableOpacity>

                <View style={styles.authButton}>
                    <TouchableOpacity
                        disabled={loginCall.state === "pending"}
                        onPress={() => router.replace("/register")}
                        style={{
                            backgroundColor: loginCall.state === "pending" ? '#ccc' : '#6c757d',
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderRadius: 4,
                        }}
                    >
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
                            {currentLanguage?.id === "EN" ? "Sign Up" : "Registrovat se"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {message.text && (
                    <View style={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
                        <Text style={styles.messageText}>{message.text}</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}