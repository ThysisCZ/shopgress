import { useState } from 'react';
import { useLanguageContext } from '../context/LanguageContext';
import { useRouter } from 'expo-router';
import { useModeContext } from '@/context/ModeContext';

import { StyleSheet, View, ScrollView, Text, TextInput, TouchableOpacity, Dimensions } from 'react-native';

interface EmailData {
    success: boolean,
    message: string
}

const { width } = Dimensions.get('window');
const mobileSize = width < 568;

export default function ForgotPassword() {
    const defaultForm = {
        email: ''
    }

    const SERVER_URI = process.env.EXPO_PUBLIC_SERVER_URI;

    const router = useRouter();
    const { currentLanguage } = useLanguageContext();
    const { mode } = useModeContext();
    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState(defaultForm);
    const [emailCall, setEmailCall] = useState<{ state: string; data?: EmailData; error?: string }>({ state: "inactive" });
    const [message, setMessage] = useState({ type: '', text: '' });

    const setField = (name: string, val: string) => {
        setFormData((formData) => ({ ...formData, [name]: val }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        e.stopPropagation()
        setValidated(true)

        // Check if form is valid before sending
        if (!formData.email) return;

        try {
            setEmailCall({ state: "pending" })
            setMessage({ type: '', text: '' });

            const response = await fetch(`${SERVER_URI}/user/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setEmailCall({
                    state: "success",
                    data: data
                })

                setMessage({
                    type: 'success',
                    text: currentLanguage.id === "EN"
                        ? "A reset code has been sent to your email."
                        : "Potvrzovací kód byl úspěšně odeslán."
                });

                // Navigate to reset password page after 2 seconds
                setTimeout(() => {
                    router.replace({
                        pathname: "/reset-password",
                        params: {
                            email: formData.email
                        }
                    });
                }, 2000);
            } else {
                console.error('Password reset request failed: ' + data.message)
                setEmailCall({ state: "error", error: data.message });
                setMessage({ type: 'error', text: data.message });
            }
        } catch (e: any) {
            console.error('Password reset request error:', e)
            setEmailCall({ state: "error", error: e })
            setMessage({ type: 'error', text: currentLanguage.id === "EN" ? "Network error. Please try again." : "Chyba sítě. Zkuste to prosím znovu." });
        }
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: mode === "light" ? "#fff" : "#000" }}>
            <View style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordHeader}>
                    {currentLanguage.id === "EN" ? "Forgot Password" : "Zapomenuté heslo"}
                </Text>

                <View style={{ marginBottom: 24 }}>
                    <Text style={styles.formLabel}>Email:</Text>
                    <TextInput
                        style={styles.input}
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

                <View style={styles.authButton}>
                    <TouchableOpacity
                        disabled={emailCall.state === "pending"}
                        onPress={handleSubmit}
                        style={{
                            backgroundColor: emailCall.state === "pending" ? '#ccc' : '#007bff',
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderRadius: 4
                        }}
                    >
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
                            {emailCall.state === "pending" ?
                                currentLanguage.id === "EN" ? "Sending..." : "Odesílání..." :
                                currentLanguage.id === "EN" ? "Send Reset Code" : "Odeslat kód"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {message.text && (
                    <View style={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
                        <Text style={styles.messageText}>{message.text}</Text>
                    </View>
                )}

                <View style={styles.authButton}>
                    <TouchableOpacity
                        disabled={emailCall.state === "pending"}
                        onPress={() => router.replace("/login")}
                        style={{
                            backgroundColor: emailCall.state === "pending" ? '#ccc' : '#6c757d',
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderRadius: 4,
                        }}
                    >
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
                            {currentLanguage?.id === "EN" ? "Back to login" : "Zpět na přihlášení"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {message.text && (
                    <View style={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
                        <Text style={styles.messageText}>{message.text}</Text>
                    </View>
                )}
            </View >
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    forgotPasswordContainer: {
        width: mobileSize ? 300 : 500,
        marginTop: 60,
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 30,
        borderWidth: 1,
        borderColor: '#d8d8d8',
        backgroundColor: 'white',
        borderRadius: 8
    },
    forgotPasswordHeader: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#2e2e2e'
    },
    authButton: {
        marginTop: 25,
        alignItems: 'center'
    },
    formLabel: {
        marginBottom: 8,
        color: '#2e2e2e',
        fontWeight: '500'
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        paddingRight: 50,
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
    messageText: {
        textAlign: 'center',
    }
});