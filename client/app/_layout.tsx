import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { UserProvider } from '@/context/UserContext';
import { ShoppingListsProvider } from '@/context/ShoppingListsContext';
import { ModeProvider } from '@/context/ModeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import TopPanel from '@/components/top-panel';

export const unstable_settings = {
    anchor: '(tabs)',
};

export default function RootLayout() {
    return (
        <UserProvider>
            <ShoppingListsProvider>
                <ModeProvider>
                    <LanguageProvider>
                        <TopPanel />
                        <Stack>
                            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                            <Stack.Screen name="login" options={{ headerShown: false }} />
                        </Stack>
                        <StatusBar style="auto" />
                    </LanguageProvider>
                </ModeProvider>
            </ShoppingListsProvider>
        </UserProvider>
    );
}