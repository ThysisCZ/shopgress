import { useRouter, useLocalSearchParams } from 'expo-router';
import { useShoppingListsContext } from '../context/ShoppingListsContext';
import { useModeContext } from '../context/ModeContext';
import { useLanguageContext } from '../context/LanguageContext';
import { useUserContext } from '../context/UserContext';
import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Text, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ListHeader from '../components/list-header';
import MemberList from '../components/member-list';
import ItemList from '../components/item-list';
import ResolvedStateChart from '../components/resolved-state-chart';

interface ItemData {
    _id?: string | undefined;
    name: string;
    quantity: number;
    unit: string | null;
    resolved: boolean;
}

interface ListData {
    _id?: string | undefined;
    title: string;
    ownerId: string;
    memberIds: string[];
    archived: boolean;
    items: ItemData[];
}

export default function Detail() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params.id
    const { shoppingLists, getListById } = useShoppingListsContext();
    const { mode } = useModeContext();
    const { currentLanguage } = useLanguageContext();
    const { user, users } = useUserContext();
    const [shoppingList, setShoppingList] = useState<any>(null);
    const [shoppingListCall, setShoppingListCall] = useState<{ state: string; data?: ListData; error?: string }>({ state: "inactive" });

    useEffect(() => {
        const load = async () => {
            setShoppingListCall({ state: "pending" });

            try {
                const data = await getListById(id);

                if (data) {
                    setShoppingList(data);
                    setShoppingListCall({ state: "success", data });
                } else {
                    setShoppingListCall({ state: "error", error: "Failed to load shopping list." });
                }
            } catch (e: any) {
                setShoppingListCall({ state: "error", error: e.message });
            }
        }

        load();
    }, [id, getListById]);

    // Redirect after logout
    useEffect(() => {
        if (!user) {
            router.replace("/login");
        }
        // eslint-disable-next-line
    }, [user]);

    if (shoppingListCall?.state === "error") {
        return (
            <ScrollView style={{ flex: 1, backgroundColor: mode === "light" ? "#fff" : "#000" }}>
                <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{currentLanguage.id === "EN" ? "404 - Not Found" : "404 - Nenalezeno"}</Text>
                <Text style={{ textAlign: 'center' }}>{currentLanguage.id === "EN" ? "Shopping list not found." : "Seznam nebyl nalezen."}</Text>
            </ScrollView>
        );
    }

    if (shoppingListCall?.state === "pending") {
        return (
            <ScrollView style={{ flex: 1, backgroundColor: mode === "light" ? "#fff" : "#000" }}>
                <ActivityIndicator size="large" color={mode === "light" ? "black" : "white"} style={{ marginTop: 50 }} />
            </ScrollView>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: mode === "light" ? "#fff" : "#000" }}>
            <TouchableOpacity style={styles.button} onPress={() => router.replace("/shopping-lists")}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                <Text>{currentLanguage.id === "EN" ? "Back" : "Zpět"}</Text>
            </TouchableOpacity>
            <ListHeader
                currentUser={user}
                users={users}
                shoppingList={shoppingList}
                setShoppingList={setShoppingList}
                shoppingLists={shoppingLists}
            />
            <MemberList
                currentUser={user}
                users={users}
                shoppingList={shoppingList}
                setShoppingList={setShoppingList}
            />
            <ItemList
                shoppingList={shoppingList}
                setShoppingList={setShoppingList}
            />
            <ResolvedStateChart
                shoppingList={shoppingList}
            />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'aqua',
        width: 80,
        margin: 10,
        padding: 8,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3
    }
});