import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Card, Checkbox, Switch, List, Button } from "react-native-paper";
import { useRouter } from 'expo-router';
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

const SERVER_URI = process.env.EXPO_PUBLIC_SERVER_URI;
const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === "true";

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
    const filteredLists = showArchived ? userLists : userLists.filter(list => !list.archived);

    const loadAllLists = async () => {
        setAllListsCall({ state: "pending" });

        try {
            const allData = await getAllLists();

            if (allData) {
                setAllListsCall({ state: "success", allData });
                setAllLists(allData);
            } else {
                setAllListsCall({ state: "error", error: "Failed to load all lists." });
            }
        } catch (e: any) {
            setAllListsCall({ state: "error", error: e.message });
        }
    }

    const loadUserLists = async () => {
        setUserListsCall({ state: "pending" });

        try {
            const userData = await getListsByUser(user.id);

            if (userData) {
                setUserListsCall({ state: "success", userData });
                setUserLists(userData);
            } else {
                setUserListsCall({ state: "error", error: "Failed to load user lists." });
            }
        } catch (e: any) {
            setUserListsCall({ state: "error", error: e.message });
        }
    }

    const loadAllUsers = async () => {
        try {
            const res = await fetch(`${SERVER_URI}/user/list`, { headers: { Authorization: `Bearer ${token}` } });
            const result = await res.json();
            setUsers(result.data);
        } catch (e: any) {
            console.error("Error fetching users:", e.message);
        }
    };

    useEffect(() => {
        loadAllUsers();
        loadAllLists();
        loadUserLists();
    }, []);

    // Show or hide archived lists
    useEffect(() => {
        loadUserLists();
    }, [showArchived]);

    // Navigate to login after logout
    useEffect(() => {
        if (!user) {
            router.replace('login')
        }
    }, [user]);

    const isOwner = (list: ListData) => list.ownerId === user?.id;

    const handleDeleteListShow = (list: ListData) => {
        setSelectedList(list);
        setDeleteListVisible(true);
    }

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
        const updatedItems = [...selectedList?.items as ItemData[], item];
        const updatedList = { ...selectedList as ListData, items: updatedItems };

        if (USE_MOCKS) {
            await updateList(updatedList);
            await loadUserLists();
        } else {
            const dtoIn = {
                items: updatedItems
            }

            try {
                const response = await fetch(`${SERVER_URI}/shoppingList/update/${selectedList?._id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(dtoIn)
                });

                setSelectedList(updatedList);

                await loadUserLists();

                const dtoOut = await response.json();
                return dtoOut;
            } catch (e: any) {
                console.error("Error: ", e.message);
            }
        }
    }

    // Handle item resolved status toggle
    const handleItemResolved = async (listId: string, itemId: string) => {
        const list = await getListById(listId) as ListData;

        // Find the item and update resolved state
        let updatedItem = list.items.find(item => item._id === itemId);

        const updatedItems = list.items.map(item =>
            item._id === itemId ? { ...updatedItem, resolved: !updatedItem?.resolved } : item
        );

        const updatedList = { ...list, items: updatedItems };

        if (USE_MOCKS) {
            // Call mock data
            await updateList(updatedList);
        } else {
            // Call the server
            try {
                const dtoIn = {
                    items: updatedItems
                }

                const response = await fetch(`${SERVER_URI}/shoppingList/update/${listId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(dtoIn)
                });

                // Refresh without loading
                const refreshed = await getListsByUser(user.id);
                setUserLists(refreshed);

                const dtoOut = await response.json();
                return dtoOut;
            } catch (e: any) {
                console.error("Error:", e.message);
            }
        }
    };

    // Handle item deletion
    const handleItemDelete = async (item: ItemData) => {
        const updatedItems = items?.filter(i => i._id !== item._id);

        if (USE_MOCKS) {
            await updateList({ ...selectedList, items: updatedItems });
        } else {
            const dtoIn = {
                items: updatedItems
            }

            try {
                const response = await fetch(`${SERVER_URI}/shoppingList/update/${selectedList?._id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(dtoIn)
                });

                const refreshed = await getListsByUser(user.id);
                setUserLists(refreshed);

                const dtoOut = await response.json();
                return dtoOut;
            } catch (e: any) {
                console.error("Error: ", e.message);
            }
        }
    };

    const handleListAdd = async (newList: ListData) => {
        if (USE_MOCKS) {
            await addList(newList);
            await loadUserLists();
        } else {
            try {
                const response = await fetch(`${SERVER_URI}/shoppingList/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(newList)
                });

                await loadUserLists();

                const result = await response.json();
                const dtoOut = result.data;

                return dtoOut;
            } catch (e: any) {
                console.error("Error: ", e.message);
            }
        }
    };

    const handleListDelete = async (listId: string) => {
        setSelectedList(null);

        if (USE_MOCKS) {
            await deleteList(listId);
            await loadUserLists();
        } else {
            try {
                const response = await fetch(`${SERVER_URI}/shoppingList/delete/${listId}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                await loadUserLists();

                const dtoOut = await response.json();
                return dtoOut;
            } catch (e: any) {
                console.error("Error: " + e.message);
            }
        }
    };

    const handleArchive = async (listId: string) => {
        const list = await getListById(listId);

        if (USE_MOCKS) {
            list.archived ? await unarchiveList(listId) : await archiveList(listId);
            await loadUserLists();
        } else {
            const dtoIn = {
                archived: !list.archived
            }

            try {
                const response = await fetch(`${SERVER_URI}/shoppingList/update/${listId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(dtoIn)
                });

                await loadUserLists();

                const result = await response.json();
                const dtoOut = result.data;

                return dtoOut;
            } catch (e: any) {
                console.error("Error: ", e.message);
            }
        }
    };

    const handleViewDetail = (listId: string) => router.replace({
        pathname: "/detail",
        params: {
            id: listId
        }
    });

    const renderQuantity = (item: ItemData) => {
        if (currentLanguage.id === "EN") return `${item.quantity} ${item.unit || ""}`;

        const unitMap: Record<string, string> = { tsp: "ČL", tbsp: "PL", pc: "ks", c: "hrn" };
        const translatedUnit = item.unit ? unitMap[item.unit] || item.unit : "";
        return `${item.quantity} ${translatedUnit}`;
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: mode === "light" ? "#fff" : "#000" }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: mode === "light" ? "#000" : "#fff" }]}>
                    {currentLanguage.id === "EN" ? "Shopping Lists" : "Nákupní seznamy"}
                </Text>

                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={styles.switchRow}>
                        <Text style={{ color: mode === "light" ? "#000" : "#fff" }}>
                            {currentLanguage.id === "EN" ? "Show archived" : "Zobrazit uložené"}
                        </Text>
                        <Switch value={showArchived} onValueChange={() => setShowArchived(!showArchived)} color="aqua" />
                    </View>

                    <Button mode="contained" icon="plus" onPress={() => setAddListVisible(true)}
                        buttonColor="lightgreen" textColor="darkgreen">
                        {currentLanguage.id === "EN" ? "List" : "Seznam"}
                    </Button>
                </View>
            </View>

            {(allListsCall.state === "pending" || userListsCall.state === "pending") ? (
                <ActivityIndicator size="large" color={mode === "light" ? "black" : "white"} style={{ marginTop: 50 }} />
            ) : (
                <List.Section>
                    <List.Accordion
                        style={{
                            backgroundColor: mode === "light" ? "#e5e5e5" : "#1c191f",
                            borderRadius: 12, marginBottom: 10
                        }}
                        theme={{ colors: { background: mode === "light" ? "white" : "black" } }}
                        rippleColor={"#afffff"}
                        title={currentLanguage.id === "EN" ? "Lists" : "Seznamy"}
                        titleStyle={{ color: mode === "light" ? "black" : "white" }}
                        expanded={listsAccordionOpen}
                        onPress={() => setListsAccordionOpen(!listsAccordionOpen)}>
                        {filteredLists.length === 0 ? (
                            <Text style={{ textAlign: "center", marginVertical: 20, color: "gray" }}>
                                {currentLanguage.id === "EN" ? "No shopping lists found." : "Nejsou tu žádné seznamy."}
                            </Text>
                        ) : (
                            filteredLists.map((list) => (
                                <Card key={list._id} style={{ marginBottom: 10, backgroundColor: mode === "light" ? "#f3f3f3" : "#272727" }}>
                                    <Card.Title title={list.title} titleStyle={{ color: mode === "light" ? "black" : "white" }}
                                        right={() =>
                                            <Button icon="plus" mode="contained" onPress={() => handleAddItemShow(list)}
                                                buttonColor="lightgreen" textColor="darkgreen" style={{ marginRight: 13 }}>
                                                {currentLanguage.id === "EN" ? "Item" : "Položka"}
                                            </Button>} />
                                    <Card.Content style={{ marginRight: 5 }}>
                                        {list.items.length === 0 ? (
                                            <Text style={{ textAlign: "center", color: "gray", marginBottom: 15 }}>
                                                {currentLanguage.id === "EN" ? "No items" : "Žádné položky"}
                                            </Text>
                                        ) : (
                                            list.items.map((item: any) => (
                                                <View key={item._id} style={styles.itemRow}>
                                                    <Checkbox
                                                        status={item.resolved ? "checked" : "unchecked"}
                                                        onPress={() => handleItemResolved(list._id as string, item._id)}
                                                        color={mode === "light" ? "green" : "lightgreen"}
                                                        uncheckedColor={mode === "light" ? "black" : "white"}
                                                    />
                                                    <Text style={{
                                                        textDecorationLine: item.resolved ? "line-through" : "none", flex: 1,
                                                        color: mode === "light" ? "black" : "white"
                                                    }}>
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
                                        <View style={{ flex: 1, flexDirection: "row", justifyContent: isOwner(list) ? "center" : "flex-end", gap: 8, marginRight: 5 }}>
                                            {isOwner(list) && (
                                                <>
                                                    <Button icon="delete" mode="contained" onPress={() => handleDeleteListShow(list)}
                                                        buttonColor="pink" textColor="darkred">
                                                        {currentLanguage.id === "EN" ? "Delete" : "Smazat"}
                                                    </Button>
                                                    <Button icon={list.archived ? "archive-off" : "archive"} mode="contained" onPress={() => handleArchive(list._id as string)}
                                                        buttonColor={list.archived ? "lightgray" : "bisque"}
                                                        textColor={list.archived ? "dimgray" : "darkorange"}>
                                                        {list.archived ? (currentLanguage.id === "EN" ? "Unarchive" : "Obnovit") :
                                                            (currentLanguage.id === "EN" ? "Archive" : "Uložit")}
                                                    </Button>
                                                </>
                                            )}
                                            <Button mode="contained" icon="eye" onPress={() => handleViewDetail(list._id as string)}
                                                buttonColor="lightblue" textColor="darkblue">Detail</Button>
                                        </View>
                                    </Card.Actions>
                                </Card>
                            ))
                        )}
                    </List.Accordion>

                    <List.Accordion
                        style={{
                            backgroundColor: mode === "light" ? "#e5e5e5" : "#1c191f",
                            borderRadius: 12
                        }}
                        theme={{ colors: { background: mode === "light" ? "white" : "black" } }}
                        rippleColor={"#afffff"}
                        title={currentLanguage.id === "EN" ? "Statistics" : "Statistiky"}
                        titleStyle={{ color: mode === "light" ? "black" : "white" }}
                        expanded={statsAccordionOpen}
                        onPress={() => setStatsAccordionOpen(!statsAccordionOpen)}>
                        <ShoppingListChart userLists={userLists as any[]} />
                    </List.Accordion>
                </List.Section>
            )}

            <AddListModal
                visible={addListVisible}
                onDismiss={() => setAddListVisible(false)}
                onAdd={(name: string) => handleListAdd({
                    title: name,
                    ownerId: user.id,
                    memberIds: [user.id],
                    archived: false,
                    items: []
                })}
                existingLists={allLists.map(list => list.title)}
                language={currentLanguage.id}
                mode={mode}
            />

            <DeleteListModal
                visible={deleteListVisible}
                onDismiss={() => setDeleteListVisible(false)}
                onDelete={() => selectedList && handleListDelete(selectedList._id as string)}
                listTitle={selectedList?.title}
                language={currentLanguage.id}
                mode={mode}
            />

            <AddItemModal
                visible={addItemVisible}
                onDismiss={() => setAddItemVisible(false)}
                onAdd={(item: ItemData) => {
                    handleItemAdded({
                        name: item.name,
                        quantity: item.quantity,
                        unit: item.unit || null,
                        resolved: false
                    });
                }}
                existingItems={items.map(item => item.name)}
                language={currentLanguage.id}
                mode={mode}
            />

            <DeleteItemModal
                visible={deleteItemVisible}
                onDismiss={() => setDeleteItemVisible(false)}
                onDelete={() => selectedItem && handleItemDelete(selectedItem)}
                itemName={selectedItem?.name}
                language={currentLanguage.id}
                mode={mode}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    header: { marginBottom: 20 },
    title: { fontSize: 24, fontWeight: "bold" },
    switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 10 },
    itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 5, height: 50 }
});