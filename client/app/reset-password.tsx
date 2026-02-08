import { useState, useEffect } from 'react';
import { useLanguageContext } from '../context/LanguageContext';
import { useModeContext } from '@/context/ModeContext';

import { StyleSheet, View, ScrollView, Text, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ResetData {
    success: boolean,
    message: string
}

const { width } = Dimensions.get('window');
const mobileSize = width < 568;

export default function ForgotPassword() {
    const defaultForm = {
        code: '',
        newPassword: '',
        confirmPassword: ''
    }

    const SERVER_URI = process.env.EXPO_PUBLIC_SERVER_URI;
    const router = useRouter();
    const params = useLocalSearchParams();

    const { currentLanguage } = useLanguageContext();
    const { mode } = useModeContext()
    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState(defaultForm);
    const [resetCall, setResetCall] = useState<{ state: string; data?: ResetData; error?: string | unknown }>({ state: "inactive" });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [email, setEmail] = useState<string | string[]>('');

    useEffect(() => {
        // Get email from params
        if (params.email) {
            setEmail(params.email);
        } else {
            // If no email in params, redirect to forgot password
            router.replace('/forgot-password');
        }
    }, [params, router]);

    const setField = (name: string, val: string) => {
        setFormData((formData) => ({ ...formData, [name]: val }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        e.stopPropagation()
        setValidated(true)

        // Check if form is valid before sending
        if (!formData.code || !formData.newPassword || !formData.confirmPassword) return;

        // Check if passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({
                type: 'error',
                text: currentLanguage.id === "EN"
                    ? "Passwords do not match"
                    : "Hesla se neshodují"
            });
            return;
        }

        try {
            setResetCall({ state: "pending" })
            setMessage({ type: '', text: '' });

            // First verify the code
            const verifyResponse = await fetch(`${SERVER_URI}/user/verify-reset-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    code: formData.code
                })
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
                setResetCall({ state: "error", error: verifyData.message });
                setMessage({ type: 'error', text: verifyData.message || (currentLanguage.id === "EN" ? "Invalid reset code" : "Neplatný kód") });
                return;
            }

            // If code is valid, reset the password
            const resetResponse = await fetch(`${SERVER_URI}/user/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    code: formData.code,
                    newPassword: formData.newPassword
                })
            });

            const resetData = await resetResponse.json();

            if (resetResponse.ok) {
                setResetCall({
                    state: "success",
                    data: resetData
                })

                setMessage({
                    type: 'success',
                    text: currentLanguage.id === "EN"
                        ? "Password reset successful"
                        : "Heslo bylo úspěšně změněno"
                });

                // Clear form
                setFormData(defaultForm);
                setValidated(false);

                // Navigate to login after 2 seconds
                setTimeout(() => {
                    router.replace('/login');
                }, 2000);
            } else {
                console.error('Password reset failed: ' + resetData.message)
                setResetCall({ state: "error", error: resetData.message });
                setMessage({ type: 'error', text: resetData.message || (currentLanguage.id === "EN" ? "Failed to reset password" : "Nepodařilo se změnit heslo") });
            }
        } catch (e) {
            console.error('Password reset error:', e)
            setResetCall({ state: "error", error: e })
            setMessage({ type: 'error', text: currentLanguage.id === "EN" ? "Network error. Please try again." : "Chyba sítě. Zkuste to prosím znovu." });
        }
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: mode === "light" ? "#fff" : "#000" }}>
            <View style={styles.resetPasswordContainer}>
                <Text style={styles.resetPasswordHeader}>
                    {currentLanguage.id === "EN" ? "Reset Password" : "Obnovit heslo"}
                </Text>

                <View style={{ marginBottom: 24 }}>
                    <Text style={styles.formLabel}>{currentLanguage.id === "EN" ? "Reset code" : "Potvrzovací kód"}:</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.code}
                        onChangeText={(val) => setField("code", val)}
                        maxLength={6}
                        keyboardType='number-pad'
                    />
                    {validated && formData.code.length === 0 && (
                        <Text style={{ color: '#721c24' }}>
                            {currentLanguage?.id === "EN" ? "This field is required" : "Toto pole je povinné"}
                        </Text>
                    )}
                </View>

                <View style={{ marginBottom: 24 }}>
                    <Text style={styles.formLabel}>
                        {currentLanguage?.id === "EN" ? "New password" : "Nové heslo"}:
                    </Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value={formData.newPassword}
                            onChangeText={(val) => setField("newPassword", val)}
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
                    {validated && formData.newPassword.length === 0 && (
                        <Text style={{ color: '#721c24' }}>
                            {currentLanguage?.id === "EN" ? "This field is required" : "Toto pole je povinné"}
                        </Text>
                    )}
                </View>

                <View style={{ marginBottom: 24 }}>
                    <Text style={styles.formLabel}>
                        {currentLanguage?.id === "EN" ? "Confirm password" : "Potvrzení hesla"}:
                    </Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            value={formData.confirmPassword}
                            onChangeText={(val) => setField("confirmPassword", val)}
                            maxLength={20}
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity
                            style={styles.togglePasswordBtn}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ?
                                <MaterialCommunityIcons name="eye" size={24} /> :
                                <MaterialCommunityIcons name="eye-off" size={24} />
                            }
                        </TouchableOpacity>
                    </View>
                    {validated && formData.confirmPassword.length === 0 && (
                        <Text style={{ color: '#721c24' }}>
                            {currentLanguage?.id === "EN" ? "This field is required" : "Toto pole je povinné"}
                        </Text>
                    )}
                </View>

                <View style={styles.authButton}>
                    <TouchableOpacity
                        disabled={resetCall.state === "pending"}
                        onPress={handleSubmit}
                        style={{
                            backgroundColor: resetCall.state === "pending" ? '#ccc' : '#007bff',
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderRadius: 4
                        }}
                    >
                        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
                            {resetCall.state === "pending" ?
                                currentLanguage.id === "EN" ? "Resetting..." : "Obnovování..." :
                                currentLanguage.id === "EN" ? "Reset" : "Obnovit"}
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
    resetPasswordContainer: {
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
    resetPasswordHeader: {
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
    inputWrapper: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
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
    togglePasswordBtn: {
        position: 'absolute',
        right: 10,
        padding: 5,
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