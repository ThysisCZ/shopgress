import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { UserProvider } from '@/context/UserContext';
import { ShoppingListsProvider } from '@/context/ShoppingListsContext';
import { ModeProvider } from '@/context/ModeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import TopPanel from '@/components/top-panel';
import { useUserContext } from '@/context/UserContext';
import { PaperProvider } from 'react-native-paper';

function RootLayoutContent() {
    const router = useRouter();
    const { user } = useUserContext();

    // Show login on start
    useEffect(() => {
        if (!user) {
            const t = setTimeout(() => {
                router.replace('/login');
            }, 0);
            return () => clearTimeout(t);
        }
    }, [user, router]);

    return (
        <View style={{ flex: 1 }}>
            <TopPanel />
            <View style={{ flex: 1 }}>
                <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="login" options={{ headerShown: false }} />
                    <Stack.Screen name="register" options={{ headerShown: false }} />
                    <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
                    <Stack.Screen name="reset-password" options={{ headerShown: false }} />
                    <Stack.Screen name="shopping-lists" options={{ headerShown: false }} />
                </Stack>
            </View>
        </View>
    );
}

export default function RootLayout() {
    return (
        <UserProvider>
            <ShoppingListsProvider>
                <ModeProvider>
                    <LanguageProvider>
                        <PaperProvider>
                            <RootLayoutContent />
                        </PaperProvider>
                    </LanguageProvider>
                </ModeProvider>
            </ShoppingListsProvider>
        </UserProvider>
    );
}