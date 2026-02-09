import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Dimensions } from 'react-native';
import { TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUserContext } from '../context/UserContext';
import { useLanguageContext } from '../context/LanguageContext';
import { useModeContext } from '@/context/ModeContext';
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

export default function SignUpScreen() {
    const defaultForm = {
        name: '',
        email: '',
        password: ''
    }

    const SERVER_URI = process.env.EXPO_PUBLIC_SERVER_URI;

    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState(defaultForm);
    const [registerCall, setRegisterCall] = useState<{ state: string; data?: UserData; error?: string }>({ state: "inactive" });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPassword, setShowPassword] = useState(false);
    const { login, user } = useUserContext();
    const { currentLanguage } = useLanguageContext();
    const { mode } = useModeContext();
    const router = useRouter();

    const emailRegEx = /^\S+@\S+\.\S+$/;
    const passwordRegEx = /(?=.*[a-z]+)(?=.*[A-Z]+)(?=.*\d+).*/;

    // Navigate to lists after registering
    useEffect(() => {
        if (user) {
            router.replace('/shopping-lists');
        }
    }, [user, router]);

    const setField = (name: string, val: any) => {
        setFormData((formData) => ({ ...formData, [name]: val }));
    };

    const handleSubmit = async () => {
        setValidated(true);

        if (!formData.email || !formData.password) return;

        try {
            setRegisterCall({ state: "pending" });
            setMessage({ type: '', text: '' });

            const response = await fetch(`${SERVER_URI}/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setRegisterCall(
                    {
                        state: "success",
                        data: data
                    }
                );

                login(data.user, data.token);
                setFormData(defaultForm);
                setValidated(false);
            } else {
                console.error('Registration failed: ' + data.message)
                setRegisterCall({ state: "error", error: data.message });
                setMessage({ type: 'error', text: data.message });
            }
        } catch (e: any) {
            console.error('Login error:', e);
            setRegisterCall({ state: "error", error: e.message });
            setMessage({ type: 'error', text: currentLanguage?.id === "EN" ? "Network error. Please try again." : "Chyba sítě. Zkuste to prosím znovu." });
        }
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: mode === "light" ? "#fff" : "#000" }}>
            <View style={styles.loginContainer}>
                <Text style={styles.loginHeader}>
                    {currentLanguage?.id === "EN" ? "Sign Up" : "Registrace"}
                </Text>

                <View style={{ marginBottom: 24 }}>
                    <Text style={styles.formLabel}>
                        {currentLanguage?.id === "EN" ? "Username" : "Uživatelské jméno"}:
                    </Text>
                    <TextInput
                        style={styles.input}
                        textColor="black"
                        value={formData.name}
                        onChangeText={(val) => setField("name", val)}
                        maxLength={20}
                    />
                    {validated && formData.name.length === 0 && (
                        <Text style={{ color: '#721c24' }}>
                            {currentLanguage?.id === "EN" ? "This field is required" : "Toto pole je povinné"}
                        </Text>
                    )}
                </View>

                <View style={{ marginBottom: 24 }}>
                    <Text style={styles.formLabel}>Email:</Text>
                    <TextInput
                        style={styles.input}
                        textColor="black"
                        value={formData.email}
                        onChangeText={(val) => setField("email", val)}
                        maxLength={60}
                        keyboardType="email-address"
                    />
                    {validated && formData.email.length === 0 && (
                        <Text style={{ color: '#721c24' }}>
                            {currentLanguage?.id === "EN" ? "This field is required" : "Toto pole je povinné"}
                        </Text>
                    )}
                    {validated && formData.email && !emailRegEx.test(formData.email) && (
                        <Text style={{ color: '#721c24' }}>
                            {currentLanguage?.id === "EN" ? "Enter a valid email" : "Zadejte validní email"}
                        </Text>
                    )}
                </View>

                <View style={{ marginBottom: 24 }}>
                    <Text style={styles.formLabel}>
                        {currentLanguage?.id === "EN" ? "Password" : "Heslo"}:
                    </Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            textColor="black"
                            value={formData.password}
                            onChangeText={(val) => setField("password", val)}
                            maxLength={20}
                            secureTextEntry={!showPassword}
                            keyboardType="default"
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
                            {currentLanguage?.id === "EN" ? "This field is required" : "Toto pole je povinné"}
                        </Text>
                    )}
                    {validated && formData.password && formData.password.length < 8 && (
                        <Text style={{ color: '#721c24' }}>
                            {currentLanguage?.id === "EN" ? "At least 8 characters are required" : "Heslo musí mít alespoň 8 znaků"}
                        </Text>
                    )}
                    {validated && formData.password && !passwordRegEx.test(formData.password) && (
                        <Text style={{ color: '#721c24' }}>
                            {currentLanguage?.id === "EN" ? "Include uppercase, lowercase and numbers" : "Zadejte velká a malá písmena včetně číslic"}
                        </Text>
                    )}
                </View>

                <View style={styles.authButton}>
                    <TouchableOpacity
                        disabled={registerCall.state === "pending"}
                        onPress={handleSubmit}
                        style={{
                            backgroundColor: registerCall.state === "pending" ? '#ccc' : '#007bff',
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderRadius: 4,
                        }}
                    >
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
                            {registerCall.state === "pending" ?
                                currentLanguage?.id === "EN" ? "Signing up..." : "Registrování..." :
                                currentLanguage?.id === "EN" ? "Sign Up" : "Registrovat se"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={{ marginTop: 20, marginBottom: -10, alignItems: 'center' }}>
                    <Text style={styles.loginText}>
                        {currentLanguage?.id === "EN" ? "Already have an account?" : "Máte vytvořený účet?"}
                    </Text>
                </View>

                <View style={styles.authButton}>
                    <TouchableOpacity
                        disabled={registerCall.state === "pending"}
                        onPress={() => router.replace("/login")}
                        style={{
                            backgroundColor: registerCall.state === "pending" ? '#ccc' : '#6c757d',
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderRadius: 4
                        }}
                    >
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
                            {currentLanguage?.id === "EN" ? "Login" : "Přihlásit se"}
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
    inputWrapper: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        backgroundColor: 'white',
        borderColor: '#ccc',
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        paddingRight: 50,
        height: 25
    },
    togglePasswordBtn: {
        position: 'absolute',
        right: 10,
        padding: 5,
    },
    loginText: {
        fontSize: 16
    },
    messageText: {
        textAlign: 'center',
    },
});