import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Card, List, Checkbox, Button } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AddItemModal from "../components/add-item-modal";
import DeleteItemModal from "../components/delete-item-modal";
import { useShoppingListsContext } from "../context/ShoppingListsContext";
import { useLanguageContext } from "../context/LanguageContext";
import { useUserContext } from "../context/UserContext";

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

const SERVER_URI = process.env.REACT_APP_SERVER_URI;
const USE_MOCKS = process.env.REACT_APP_USE_MOCKS === "true";

export default function ItemList({ shoppingList, setShoppingList }: ItemListProps) {
    const [showResolved, setShowResolved] = useState(false);
    const [addItemShow, setAddItemShow] = useState(false);
    const [deleteItemShow, setDeleteItemShow] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);

    const { updateList, getListById } = useShoppingListsContext();
    const { currentLanguage } = useLanguageContext();
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
            try {
                await fetch(`${SERVER_URI}/shoppingList/update/${shoppingList?._id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ items: updatedItems })
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
            try {
                await fetch(`${SERVER_URI}/shoppingList/update/${shoppingList?._id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ items: [...shoppingList?.items, item] })
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
            try {
                await fetch(`${SERVER_URI}/shoppingList/update/${shoppingList?._id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ items: updatedItems })
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

    return (
        <>
            <Card style={styles.card}>
                <Card.Title
                    title={currentLanguage.id === "EN" ? "Items" : "Položky"}
                    right={() => (
                        <Button
                            mode="contained"
                            onPress={handleAddItemShow}
                            icon={() => <MaterialCommunityIcons name="plus" size={20} color="white" />}
                        >
                            {currentLanguage.id === "EN" ? "Add" : "Přidat"}
                        </Button>
                    )}
                />
                <Card.Content>
                    <View style={styles.toggleRow}>
                        <Checkbox
                            status={showResolved ? "checked" : "unchecked"}
                            onPress={() => setShowResolved(!showResolved)}
                        />
                        <Text style={styles.toggleLabel}>
                            {currentLanguage.id === "EN" ? "Show resolved" : "Zobrazit vyřešené"}
                        </Text>
                    </View>

                    <List.Section>
                        <List.Accordion
                            title={currentLanguage.id === "EN" ? "Show Items" : "Zobrazit položky"}
                            style={styles.accordion}
                        >
                            <ScrollView>
                                {filteredItems?.length > 0 ? (
                                    filteredItems?.map(item => (
                                        <List.Item
                                            key={item._id}
                                            title={
                                                <View style={styles.itemRow}>
                                                    <Checkbox
                                                        status={item.resolved ? "checked" : "unchecked"}
                                                        onPress={() => handleResolvedStatus(item._id as string)}
                                                    />
                                                    <Text style={[styles.itemName, item.resolved && styles.resolved]}>
                                                        {item.name}
                                                        {item.quantity && (
                                                            <> ({item.quantity}{" "}
                                                                {currentLanguage.id === "CZ"
                                                                    ? item.unit === "tsp"
                                                                        ? "ČL"
                                                                        : item.unit === "tbsp"
                                                                            ? "PL"
                                                                            : item.unit === "pc"
                                                                                ? "ks"
                                                                                : item.unit === "c"
                                                                                    ? "hrn."
                                                                                    : item.unit
                                                                    : item.unit}
                                                                )</>
                                                        )}
                                                    </Text>
                                                </View>
                                            }
                                            right={() =>
                                                <Button
                                                    mode="contained"
                                                    compact
                                                    onPress={() => handleDeleteItemShow(item)}
                                                    icon={() => <MaterialCommunityIcons name="close" size={18} color="white" />}
                                                    children
                                                />
                                            }
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
                mode="default"
            />

            <DeleteItemModal
                visible={deleteItemShow}
                onDismiss={() => setDeleteItemShow(false)}
                onDelete={() => selectedItem && handleItemDeleted(selectedItem)}
                itemName={selectedItem?.name}
                language={currentLanguage.id}
                mode="default"
            />
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        margin: 10,
        backgroundColor: "salmon"
    },
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10
    },
    toggleLabel: {
        marginLeft: 8
    },
    accordion: {
        backgroundColor: "lightsalmon"
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
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
        marginVertical: 10
    }
});
