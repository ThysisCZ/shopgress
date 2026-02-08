import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Card, List, Checkbox, Button, Switch } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AddItemModal from "../components/add-item-modal";
import DeleteItemModal from "../components/delete-item-modal";
import { useShoppingListsContext } from "../context/ShoppingListsContext";
import { useLanguageContext } from "../context/LanguageContext";
import { useUserContext } from "../context/UserContext";
import { useModeContext } from "@/context/ModeContext";

interface ItemData {
    _id?: string | undefined;
    name: string;
    quantity: number;
    unit: string | null;
    resolved: boolean;
}

interface ShoppingList {
    _id?: string | undefined;
    title: string;
    ownerId: string;
    memberIds: string[];
    items: ItemData[];
}

interface ItemListProps {
    shoppingList: ShoppingList;
    setShoppingList: (list: ShoppingList) => void;
}

const SERVER_URI = process.env.EXPO_PUBLIC_SERVER_URI;
const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === "true";

export default function ItemList({ shoppingList, setShoppingList }: ItemListProps) {
    const [showResolved, setShowResolved] = useState(false);
    const [addItemShow, setAddItemShow] = useState(false);
    const [deleteItemShow, setDeleteItemShow] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);

    const { updateList, getListById } = useShoppingListsContext();
    const { currentLanguage } = useLanguageContext();
    const { mode } = useModeContext();
    const { token } = useUserContext();

    const items = shoppingList?.items;

    const filteredItems = showResolved ? items : items?.filter(item => !item.resolved);

    const handleResolvedStatus = async (itemId: string) => {
        const updatedItems = items?.map(item =>
            item._id === itemId ? { ...item, resolved: !item.resolved } : item
        );

        const updatedList = { ...shoppingList, items: updatedItems };

        if (USE_MOCKS) {
            await updateList(updatedList);
        } else {
            const dtoIn = {
                items: updatedItems
            }

            try {
                await fetch(`${SERVER_URI}/shoppingList/update/${shoppingList?._id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(dtoIn)
                });
            } catch (e: any) {
                console.error("Error: ", e.message);
            }
        }

        setShoppingList(updatedList);
    };

    const handleItemAdded = async (item: ItemData) => {
        const updatedList = { ...shoppingList, items: [...shoppingList?.items, item] };

        if (USE_MOCKS) {
            await updateList(updatedList);
            const refreshed = await getListById(shoppingList?._id);
            setShoppingList(refreshed);
        } else {
            const dtoIn = {
                items: [...shoppingList?.items, item]
            }

            try {
                await fetch(`${SERVER_URI}/shoppingList/update/${shoppingList?._id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(dtoIn)
                });

                const refreshed = await getListById(shoppingList?._id);
                setShoppingList(refreshed);
            } catch (e: any) {
                console.error("Error: ", e.message);
            }
        }
    };

    const handleItemDeleted = async (item: ItemData) => {
        const updatedItems = items?.filter(i => i._id !== item._id);
        const updatedList = { ...shoppingList, items: updatedItems };

        if (USE_MOCKS) {
            await updateList(updatedList);
        } else {
            const dtoIn = {
                items: updatedItems
            }

            try {
                await fetch(`${SERVER_URI}/shoppingList/update/${shoppingList?._id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(dtoIn)
                });
            } catch (e: any) {
                console.error("Error: ", e.message);
            }
        }

        setShoppingList(updatedList);
    };

    const handleAddItemShow = () => setAddItemShow(true);
    const handleDeleteItemShow = (item: ItemData) => {
        setSelectedItem(item);
        setDeleteItemShow(true);
    };

    const renderItem = (item: ItemData) => {
        if (currentLanguage.id === "EN") return `${item.name} ${item.quantity} ${item.unit || ""}`;

        const unitMap: Record<string, string> = { tsp: "ČL", tbsp: "PL", pc: "ks", c: "hrn" };
        const translatedUnit = item.unit ? unitMap[item.unit] || item.unit : "";
        return `${item.name} ${item.quantity} ${translatedUnit}`;
    };

    return (
        <>
            <Card style={{ margin: 10, backgroundColor: mode === "light" ? "#f3f3f3" : "#272727" }}>
                <Card.Title
                    title={currentLanguage.id === "EN" ? "Items" : "Položky"}
                    right={() => (
                        <Button
                            mode="contained"
                            onPress={handleAddItemShow}
                            icon={() => <MaterialCommunityIcons name="plus" size={20} color="darkgreen" />}
                            labelStyle={{ color: "darkgreen" }}
                            style={{ backgroundColor: "lightgreen", marginRight: 15 }}
                        >
                            {currentLanguage.id === "EN" ? "Add" : "Přidat"}
                        </Button>
                    )}
                    titleStyle={{ color: mode === "light" ? "black" : "white" }}
                />
                <Card.Content>
                    <View style={styles.toggleRow}>
                        <Switch value={showResolved} onValueChange={() => setShowResolved(!showResolved)} color="aqua" />
                        <Text style={[styles.toggleLabel, { color: mode === "light" ? "black" : "white" }]}>
                            {currentLanguage.id === "EN" ? "Show resolved" : "Zobrazit vyřešené"}
                        </Text>
                    </View>

                    <List.Section>
                        <List.Accordion
                            title=""
                            style={{
                                backgroundColor: mode === "light" ? "#e5e5e5" : "#1c191f",
                                borderRadius: 12
                            }}
                            theme={{ colors: { background: mode === "light" ? "#f3f3f3" : "#272727" } }}
                            rippleColor={"#afffff"}
                        >
                            <ScrollView>
                                {filteredItems?.length > 0 ? (
                                    filteredItems?.map(item => (
                                        <List.Item
                                            key={item._id}
                                            title={() => (
                                                <View style={styles.itemRow}>
                                                    <Checkbox
                                                        status={item.resolved ? "checked" : "unchecked"}
                                                        onPress={() => handleResolvedStatus(item._id as string)}
                                                        uncheckedColor={mode === "light" ? "black" : "white"}
                                                        color={mode === "light" ? "green" : "lightgreen"}
                                                    />
                                                    <Text style={[styles.itemName, item.resolved && styles.resolved,
                                                    { color: mode === "light" ? "black" : "white" }
                                                    ]}>
                                                        {renderItem(item)}
                                                    </Text>
                                                </View>
                                            )}
                                            right={() =>
                                                <TouchableOpacity onPress={() => handleDeleteItemShow(item)}
                                                    style={{ marginTop: 5 }}>
                                                    <MaterialCommunityIcons name="close" size={18} color="red" />
                                                </TouchableOpacity>
                                            }
                                            style={{ height: 50 }}
                                        />
                                    ))
                                ) : (
                                    <Text style={styles.emptyText}>
                                        {currentLanguage.id === "EN" ? "No items" : "Žádné položky"}
                                    </Text>
                                )}
                            </ScrollView>
                        </List.Accordion>
                    </List.Section>
                </Card.Content>
            </Card>

            <AddItemModal
                visible={addItemShow}
                onDismiss={() => setAddItemShow(false)}
                onAdd={handleItemAdded}
                existingItems={items?.map(i => i.name)}
                language={currentLanguage.id}
                mode={mode}
            />

            <DeleteItemModal
                visible={deleteItemShow}
                onDismiss={() => setDeleteItemShow(false)}
                onDelete={() => selectedItem && handleItemDeleted(selectedItem)}
                itemName={selectedItem?.name}
                language={currentLanguage.id}
                mode={mode}
            />
        </>
    );
}

const styles = StyleSheet.create({
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10
    },
    toggleLabel: {
        marginLeft: 8
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center"
    },
    itemName: {
        fontWeight: "bold",
        flex: 1
    },
    resolved: {
        textDecorationLine: "line-through"
    },
    emptyText: {
        textAlign: "center",
        color: "gray",
        marginTop: 20
    }
});
