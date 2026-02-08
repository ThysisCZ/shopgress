import React, { useState, useEffect } from "react";
import { Text, TextInput, StyleSheet, ScrollView, View } from "react-native";
import { Button, Card, IconButton, HelperText } from "react-native-paper";
import LeaveListModal from "../components/leave-list-modal";
import { useShoppingListsContext } from "../context/ShoppingListsContext";
import { useLanguageContext } from "../context/LanguageContext";
import { useUserContext } from "../context/UserContext";
import { useModeContext } from "@/context/ModeContext";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";

interface User {
    id: string;
    name: string;
    email: string;
}

interface ShoppingList {
    _id: string;
    title: string;
    ownerId: string;
    memberIds: string[];
}

interface ListHeaderProps {
    currentUser: User;
    users: any[];
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
    const [error, setError] = useState("");

    const { updateList } = useShoppingListsContext();
    const { currentLanguage } = useLanguageContext();
    const { mode } = useModeContext();
    const { token } = useUserContext();
    const router = useRouter();

    useEffect(() => {
        if (!isEditing) {
            setEdit(shoppingList?.title);
            setError("");
        }
    }, [shoppingList?.title, isEditing]);

    const ownerId = shoppingList?.ownerId;
    const listOwner = users.find(user => user?._id === ownerId);

    const handleListLeft = async () => {
        if (USE_MOCKS) {
            const updatedList = {
                ...shoppingList,
                memberIds: shoppingList?.memberIds.filter(id => id !== currentUser.id)
            };
            await updateList(updatedList);
        } else {
            const dtoIn = {
                memberIds: shoppingList?.memberIds.filter(id => id !== currentUser.id)
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

                router.replace("/shopping-lists");

                const dtoOut = await response.json();
                return dtoOut;
            } catch (e: any) {
                console.error("Error: ", e.message);
            }
        }
    };

    const handleLeaveListShow = () => setLeaveListShow(true);

    // Check duplicate titles
    const isDuplicate = shoppingLists?.some(
        list =>
            list?._id !== shoppingList?._id &&
            list?.title?.trim().toLowerCase() === edit?.trim().toLowerCase()
    );

    const handleEdited = async () => {
        setValidated(true);

        if (edit?.trim().length === 0) {
            const error = currentLanguage.id === "EN" ? "This field is required" : "Toto pole je povinné";
            setError(error);
            return;
        } else if (isDuplicate) {
            const error = currentLanguage.id === "EN" ? "This list already exists" : "Tento seznam již existuje";
            setError(error);
            return;
        }

        const updatedList = { ...shoppingList, title: edit };

        if (USE_MOCKS) {
            await updateList(updatedList);
            setIsEditing(false);
            setValidated(false);
        } else {
            const dtoIn = {
                title: updatedList.title
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
        <Card style={{ margin: 10, backgroundColor: mode === "light" ? "#f3f3f3" : "#272727" }}>
            <Card.Content>
                <ScrollView horizontal contentContainerStyle={{
                    flex: 1, alignItems: "center", flexDirection: "row",
                    justifyContent: currentUser.id === ownerId ? "flex-start" : "space-between"
                }}>
                    {isEditing ? (
                        <View>
                            <TextInput
                                style={[
                                    styles.input,
                                    validated && error && styles.invalidInput
                                ]}
                                value={edit}
                                maxLength={20}
                                onChangeText={text => setEdit(text)}
                                placeholder={currentLanguage.id === "EN" ? "List title" : "Název seznamu"}
                            />
                            {error ? (
                                <HelperText type="error" style={{ marginLeft: -10 }}>{error}</HelperText>
                            ) : null}
                        </View>
                    ) : (
                        <Text style={[styles.title, { color: mode === "light" ? "black" : "white" }]}>{edit}</Text>
                    )}

                    {currentUser.id === ownerId && (
                        isEditing ? (
                            <View style={{ flex: 1, flexDirection: "row", marginBottom: error ? 27 : 0 }}>
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
                            </View>
                        ) : (
                            <IconButton
                                icon={() => <MaterialCommunityIcons name="pencil" size={24} color={mode === "light" ? "black" : "white"}
                                    style={{ marginLeft: -15 }} />}
                                onPress={() => setIsEditing(true)}
                            />
                        )
                    )}

                    {currentUser.id !== ownerId && (
                        <Button
                            mode="contained"
                            onPress={handleLeaveListShow}
                            style={{ backgroundColor: "red" }}
                            labelStyle={{ color: "white" }}
                        >
                            {currentLanguage.id === "EN" ? "Leave" : "Opustit"}
                        </Button>
                    )}
                </ScrollView>

                <Text style={{
                    fontSize: 12, color: mode === "light" ? "black" : "white",
                    marginTop: 5, marginBottom: 25
                }}>
                    {currentLanguage.id === "EN" ? "Owner" : "Vlastník"}: {listOwner?.name}
                </Text>
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