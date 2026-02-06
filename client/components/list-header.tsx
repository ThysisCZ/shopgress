import React, { useState, useEffect } from "react";
import { Text, TextInput, StyleSheet, ScrollView } from "react-native";
import { Button, Card, IconButton } from "react-native-paper";
import LeaveListModal from "../components/leave-list-modal";
import { useShoppingListsContext } from "../context/ShoppingListsContext";
import { useLanguageContext } from "../context/LanguageContext";
import { useUserContext } from "../context/UserContext";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface User {
    _id: string;
    name: string;
}

interface ShoppingList {
    _id: string;
    title: string;
    ownerId: string;
    memberIds: string[];
}

interface ListHeaderProps {
    currentUser: User;
    users: User[];
    shoppingList: ShoppingList;
    setShoppingList: (list: ShoppingList) => void;
    shoppingLists: ShoppingList[];
}

const SERVER_URI = process.env.EXPO_PUBLIC_SERVER_URI;
const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === "true";

export default function ListHeader({
    currentUser,
    users,
    shoppingList,
    setShoppingList,
    shoppingLists
}: ListHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [edit, setEdit] = useState(shoppingList?.title);
    const [leaveListShow, setLeaveListShow] = useState(false);
    const [validated, setValidated] = useState(false);

    const { updateList } = useShoppingListsContext();
    const { currentLanguage } = useLanguageContext();
    const { token } = useUserContext();

    useEffect(() => {
        if (!isEditing) {
            setEdit(shoppingList?.title);
        }
    }, [shoppingList?.title, isEditing]);

    const ownerId = shoppingList?.ownerId;
    const listOwner = users.find(user => user?._id === ownerId);

    const handleListLeft = async () => {
        if (USE_MOCKS) {
            const updatedList = {
                ...shoppingList,
                memberIds: shoppingList?.memberIds.filter(id => id !== currentUser._id)
            };
            await updateList(updatedList);
        } else {
            const dtoIn = {
                memberIds: shoppingList?.memberIds.filter(id => id !== currentUser._id)
            };

            try {
                const response = await fetch(`${SERVER_URI}/shoppingList/update/${shoppingList?._id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(dtoIn)
                });

                const dtoOut = await response.json();
                return dtoOut;
            } catch (e: any) {
                console.error("Error: ", e.message);
            }
        }
    };

    const handleLeaveListShow = () => setLeaveListShow(true);

    const handleEdited = async () => {
        setValidated(true);

        // Check duplicate titles
        const isDuplicate = shoppingLists?.some(
            list =>
                list?._id !== shoppingList?._id &&
                list?.title?.trim().toLowerCase() === edit.trim().toLowerCase()
        );

        if (edit.trim().length === 0 || isDuplicate) return;

        const updatedList = { ...shoppingList, title: edit };

        if (USE_MOCKS) {
            await updateList(updatedList);
            setIsEditing(false);
            setValidated(false);
        } else {
            const dtoIn = { title: updatedList.title };
            try {
                const response = await fetch(`${SERVER_URI}/shoppingList/update/${shoppingList?._id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(dtoIn)
                });

                setShoppingList(updatedList);
                setIsEditing(false);
                setValidated(false);

                const dtoOut = await response.json();
                return dtoOut;
            } catch (e: any) {
                console.error("Error: ", e.message);
            }
        }
    };

    return (
        <Card style={{ margin: 10, backgroundColor: "salmon" }}>
            <Card.Content>
                <ScrollView horizontal contentContainerStyle={{ alignItems: "center" }}>
                    {isEditing ? (
                        <TextInput
                            style={[
                                styles.input,
                                validated && edit.trim().length === 0 && styles.invalidInput
                            ]}
                            value={edit}
                            maxLength={20}
                            onChangeText={text => setEdit(text)}
                            placeholder={currentLanguage.id === "EN" ? "List title" : "Název seznamu"}
                        />
                    ) : (
                        <Text style={styles.title}>{edit}</Text>
                    )}

                    {currentUser._id === ownerId && (
                        isEditing ? (
                            <>
                                <IconButton
                                    icon={() => <MaterialCommunityIcons name="check" size={24} color="white" />}
                                    mode="contained"
                                    onPress={handleEdited}
                                />
                                <IconButton
                                    icon={() => <MaterialCommunityIcons name="close" size={24} color="white" />}
                                    mode="contained"
                                    onPress={() => {
                                        setIsEditing(false);
                                        setEdit(shoppingList?.title);
                                        setValidated(false);
                                    }}
                                />
                            </>
                        ) : (
                            <IconButton
                                icon={() => <MaterialCommunityIcons name="pencil" size={24} color="white" />}
                                onPress={() => setIsEditing(true)}
                            />
                        )
                    )}
                </ScrollView>

                <Text style={{ fontSize: 12, color: "#333", marginTop: 5 }}>
                    {currentLanguage.id === "EN" ? "Owner" : "Vlastník"}: {listOwner?.name}
                </Text>

                {currentUser._id !== ownerId && (
                    <Button
                        mode="contained"
                        onPress={handleLeaveListShow}
                        style={{ marginTop: 10 }}
                    >
                        {currentLanguage.id === "EN" ? "Leave" : "Opustit"}
                    </Button>
                )}
            </Card.Content>

            <LeaveListModal
                show={leaveListShow}
                setLeaveListShow={setLeaveListShow}
                onListLeave={handleListLeft}
                list={shoppingList}
            />
        </Card>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginRight: 10
    },
    input: {
        minWidth: 200,
        padding: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "white",
        marginRight: 10
    },
    invalidInput: {
        borderColor: "red"
    }
});