import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Card, Checkbox, Switch, List, Button, Divider } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useUserContext } from "../context/UserContext";
import { useShoppingListsContext } from "../context/ShoppingListsContext";
import { useModeContext } from "../context/ModeContext";
import { useLanguageContext } from "../context/LanguageContext";
import AddListModal from "../components/add-list-modal";
import DeleteListModal from "../components/delete-list-modal";
import AddItemModal from "../components/add-item-modal";
import DeleteItemModal from "../components/delete-item-modal";
import ShoppingListChart from "../components/shopping-list-chart";
import { useRouter } from 'expo-router';

const SERVER_URI = process.env.EXPO_PUBLIC_SERVER_URI;
const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === "true";

interface ItemData {
    _id: string;
    name: string;
    quantity: number;
    unit: string | null;
    resolved: boolean;
}

interface ListData {
    _id: string;
    title: string;
    ownerId: string;
    memberIds: string[];
    archived: boolean;
    items: ItemData[];
}

export default function ShoppingLists() {
    const { user, token, setUsers } = useUserContext();
    const {
        getAllLists,
        getListsByUser,
        getListById,
        archiveList,
        unarchiveList,
        deleteList,
        addList,
        updateList,
        showArchived,
        setShowArchived,
    } = useShoppingListsContext();
    const { mode } = useModeContext();
    const { currentLanguage } = useLanguageContext();
    const router = useRouter();

    const [addListVisible, setAddListVisible] = useState(false);
    const [deleteListVisible, setDeleteListVisible] = useState(false);
    const [addItemVisible, setAddItemVisible] = useState(false);
    const [deleteItemVisible, setDeleteItemVisible] = useState(false);

    const [selectedList, setSelectedList] = useState<ListData | null>(null);
    const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);

    const [allLists, setAllLists] = useState<ListData[]>([]);
    const [userLists, setUserLists] = useState<ListData[]>([]);

    const [allListsCall, setAllListsCall] = useState<{ state: string; allData?: ListData[]; error?: string }>({ state: "pending" });
    const [userListsCall, setUserListsCall] = useState<{ state: string; userData?: ListData[]; error?: string }>({ state: "pending" });

    const [listsAccordionOpen, setListsAccordionOpen] = useState(true);
    const [statsAccordionOpen, setStatsAccordionOpen] = useState(false);

    const items = selectedList?.items || [];

    const refreshLists = async () => {
        setAllListsCall({ state: "pending" });
        setUserListsCall({ state: "pending" });

        try {
            const allData = await getAllLists();
            const userData = await getListsByUser(user.id);

            if (allData) {
                setAllListsCall({ state: "success", allData });
                setAllLists(allData);
            } else {
                setAllListsCall({ state: "error", error: "Failed to load all lists" });
            }

            if (userData) {
                setUserListsCall({ state: "success", userData });
                setUserLists(userData);
            } else {
                setUserListsCall({ state: "error", error: "Failed to load user lists" });
            }
        } catch (e: any) {
            setAllListsCall({ state: "error", error: e.message });
            setUserListsCall({ state: "error", error: e.message });
        }
    };

    const getAllUsers = async () => {
        try {
            const res = await fetch(`${SERVER_URI}/user/list`, { headers: { Authorization: `Bearer ${token}` } });
            const result = await res.json();
            setUsers(result.data);
        } catch (e: any) {
            console.error("Error fetching users:", e.message);
        }
    };

    useEffect(() => {
        getAllUsers();
        refreshLists();
    }, []);

    useEffect(() => {
        refreshLists();
    }, [showArchived]);

    // Navigate to login after logout
    useEffect(() => {
        if (!user) {
            router.replace('login')
        }
    }, [user]);

    const isOwner = (list: ListData) => list.ownerId === user?.id;

    const handleAddItemShow = (list: ListData) => {
        setSelectedList(list);
        setAddItemVisible(true);
    };

    const handleDeleteItemShow = (list: ListData, item: ItemData) => {
        setSelectedList(list);
        setSelectedItem(item);
        setDeleteItemVisible(true);
    };

    const handleItemAdded = async (item: ItemData) => {
        if (!selectedList) return;
        const updatedItems = [...items, item];

        if (USE_MOCKS) await updateList({ ...selectedList, items: updatedItems });
        else
            await fetch(`${SERVER_URI}/shoppingList/update/${selectedList._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ items: updatedItems }),
            });

        refreshLists();
    };

    const handleItemResolved = async (listId: string, itemId: string) => {
        const list = (await getListById(listId)) as ListData;
        const updatedItems = list.items.map((item) => (item._id === itemId ? { ...item, resolved: !item.resolved } : item));

        if (USE_MOCKS) await updateList({ ...list, items: updatedItems });
        else await fetch(`${SERVER_URI}/shoppingList/update/${listId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ items: updatedItems }),
        });

        refreshLists();
    };

    const handleItemDelete = async (item: ItemData) => {
        if (!selectedList) return;
        const updatedItems = selectedList.items.filter((i) => i._id !== item._id);

        if (USE_MOCKS) await updateList({ ...selectedList, items: updatedItems });
        else await fetch(`${SERVER_URI}/shoppingList/update/${selectedList._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ items: updatedItems }),
        });

        refreshLists();
    };

    const handleListAdd = async (newList: ListData) => {
        if (USE_MOCKS) await addList(newList);
        else await fetch(`${SERVER_URI}/shoppingList/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(newList),
        });
        refreshLists();
    };

    const handleListDelete = async (listId: string) => {
        setDeleteListVisible(false);
        setSelectedList(null);

        if (USE_MOCKS) await deleteList(listId);
        else await fetch(`${SERVER_URI}/shoppingList/delete/${listId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });

        refreshLists();
    };

    const handleArchive = async (listId: string) => {
        const list = await getListById(listId);

        if (USE_MOCKS) {
            list.archived ? await unarchiveList(listId) : await archiveList(listId);
        } else {
            await fetch(`${SERVER_URI}/shoppingList/update/${listId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ archived: !list.archived }),
            });
        }

        refreshLists();
    };

    const handleViewDetail = (listId: string) => router.replace(`detail/${listId}`);

    const renderQuantity = (item: ItemData) => {
        if (!item.quantity) return "";
        if (currentLanguage.id === "EN") return `${item.quantity} ${item.unit || ""}`;

        const unitMap: Record<string, string> = { tsp: "ČL", tbsp: "PL", pc: "ks", c: "hrn." };
        const translatedUnit = item.unit ? unitMap[item.unit] || item.unit : "";
        return `${item.quantity} ${translatedUnit}`;
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: mode === "light" ? "#fff" : "#000" }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: mode === "light" ? "#000" : "#fff" }]}>
                    {currentLanguage.id === "EN" ? "Shopping Lists" : "Nákupní seznamy"}
                </Text>

                <View style={styles.switchRow}>
                    <Text style={{ color: mode === "light" ? "#000" : "#fff" }}>
                        {currentLanguage.id === "EN" ? "Show archived" : "Zobrazit uložené"}
                    </Text>
                    <Switch value={showArchived} onValueChange={() => setShowArchived(!showArchived)} />
                </View>

                <Button mode="contained" icon="plus" onPress={() => setAddListVisible(true)} style={{ marginTop: 10 }}>
                    {currentLanguage.id === "EN" ? "Add list" : "Přidat seznam"}
                </Button>
            </View>

            {(allListsCall.state === "pending" || userListsCall.state === "pending") ? (
                <ActivityIndicator size="large" color={mode === "light" ? "black" : "white"} style={{ marginTop: 50 }} />
            ) : (
                <List.Section>
                    <List.Accordion
                        style={{ backgroundColor: mode === "light" ? "#555" : undefined }}
                        title={currentLanguage.id === "EN" ? "Lists" : "Seznamy"}
                        titleStyle={{ color: "white" }}
                        expanded={listsAccordionOpen}
                        onPress={() => setListsAccordionOpen(!listsAccordionOpen)}>
                        {userLists.length === 0 ? (
                            <Text style={{ textAlign: "center", marginVertical: 20, color: "gray" }}>
                                {currentLanguage.id === "EN" ? "No shopping lists found." : "Nejsou tu žádné seznamy."}
                            </Text>
                        ) : (
                            userLists.map((list) => (
                                <Card key={list._id} style={{ marginVertical: 5 }}>
                                    <Card.Title title={list.title} right={() =>
                                        <Button icon="plus" mode="contained" onPress={() => handleAddItemShow(list)}>
                                            {currentLanguage.id === "EN" ? "Item" : "Položka"}
                                        </Button>} />
                                    <Card.Content>
                                        {list.items.length === 0 ? (
                                            <Text style={{ textAlign: "center", color: "gray" }}>
                                                {currentLanguage.id === "EN" ? "No items" : "Žádné položky"}
                                            </Text>
                                        ) : (
                                            list.items.map((item) => (
                                                <View key={item._id} style={styles.itemRow}>
                                                    <Checkbox
                                                        status={item.resolved ? "checked" : "unchecked"}
                                                        onPress={() => handleItemResolved(list._id, item._id)}
                                                    />
                                                    <Text style={{ textDecorationLine: item.resolved ? "line-through" : "none", flex: 1, color: "#fff" }}>
                                                        {item.name} {renderQuantity(item)}
                                                    </Text>
                                                    <TouchableOpacity onPress={() => handleDeleteItemShow(list, item)}>
                                                        <Icon name="close" size={20} color="red" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))
                                        )}
                                    </Card.Content>
                                    <Card.Actions>
                                        {isOwner(list) && (
                                            <>
                                                <Button icon="delete" mode="contained" onPress={() => setDeleteListVisible(true)}>
                                                    {currentLanguage.id === "EN" ? "Delete" : "Smazat"}
                                                </Button>
                                                <Button icon={list.archived ? "archive-off" : "archive"} mode="contained" onPress={() => handleArchive(list._id)}>
                                                    {list.archived ? (currentLanguage.id === "EN" ? "Unarchive" : "Obnovit") :
                                                        (currentLanguage.id === "EN" ? "Archive" : "Uložit")}
                                                </Button>
                                            </>
                                        )}
                                        <Button mode="contained" onPress={() => handleViewDetail(list._id)}>Detail</Button>
                                    </Card.Actions>
                                </Card>
                            ))
                        )}
                    </List.Accordion>

                    <List.Accordion
                        style={{ backgroundColor: mode === "light" ? "#555" : undefined }}
                        title={currentLanguage.id === "EN" ? "Statistics" : "Statistiky"}
                        titleStyle={{ color: "white" }}
                        expanded={statsAccordionOpen}
                        onPress={() => setStatsAccordionOpen(!statsAccordionOpen)}>
                        <ShoppingListChart userLists={userLists} />
                    </List.Accordion>
                </List.Section>
            )}

            <Divider style={{ marginVertical: 20 }} />

            <AddListModal
                visible={addListVisible}
                onDismiss={() => setAddListVisible(false)}
                onAdd={(name: string) => handleListAdd({
                    _id: "",
                    title: name,
                    ownerId: user.id,
                    memberIds: [user.id],
                    archived: false,
                    items: []
                })}
                existingLists={allLists.map(list => list.title)}
            />

            <DeleteListModal
                visible={deleteListVisible}
                onDismiss={() => setDeleteListVisible(false)}
                onDelete={() => selectedList && handleListDelete(selectedList._id)}
                listTitle={selectedList?.title}
                language={currentLanguage.id}
            />

            <AddItemModal
                visible={addItemVisible}
                onDismiss={() => setAddItemVisible(false)}
                onAdd={(item: ItemData) => {
                    handleItemAdded({
                        _id: "",
                        name: item.name,
                        quantity: item.quantity,
                        unit: item.unit || null,
                        resolved: false
                    });
                }}
                existingItems={items.map(item => item.name)}
            />

            <DeleteItemModal
                visible={deleteItemVisible}
                onDismiss={() => setDeleteItemVisible(false)}
                onDelete={() => selectedItem && handleItemDelete(selectedItem)}
                itemName={selectedItem?.name}
                language={currentLanguage.id}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    header: { marginBottom: 20 },
    title: { fontSize: 24, fontWeight: "bold" },
    switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 10 },
    itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 5 }
});