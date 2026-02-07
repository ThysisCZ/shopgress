import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Card, Button, List } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import InviteMemberModal from "../components/invite-member-modal";
import DeleteMemberModal from "../components/delete-member-modal";
import { useShoppingListsContext } from "../context/ShoppingListsContext";
import { useLanguageContext } from "../context/LanguageContext";
import { useUserContext } from "../context/UserContext";
import { useModeContext } from "@/context/ModeContext";

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

interface MemberListProps {
    currentUser: User;
    users: any[];
    shoppingList: ShoppingList;
    setShoppingList: (list: ShoppingList) => void;
}

const SERVER_URI = process.env.EXPO_PUBLIC_SERVER_URI;
const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === "true";

export default function MemberList({
    currentUser,
    users,
    shoppingList,
    setShoppingList
}: MemberListProps) {
    const [inviteMemberShow, setInviteMemberShow] = useState(false);
    const [deleteMemberShow, setDeleteMemberShow] = useState(false);
    const [selectedMember, setSelectedMember] = useState<User | null>(null);

    const { updateList } = useShoppingListsContext();
    const { currentLanguage } = useLanguageContext();
    const { mode } = useModeContext();
    const { token } = useUserContext();

    const handleMembersInvited = async (newIds: string[]) => {
        const updatedList = {
            ...shoppingList,
            memberIds: [...shoppingList?.memberIds, ...newIds]
        };

        if (USE_MOCKS) {
            await updateList(updatedList);
        } else {
            const dtoIn = { memberIds: [...shoppingList?.memberIds, ...newIds] };
            try {
                const response = await fetch(`${SERVER_URI}/shoppingList/update/${shoppingList._id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(dtoIn)
                });

                setShoppingList(updatedList);
                return await response.json();
            } catch (e: any) {
                console.error("Error: ", e.message);
            }
        }
    };

    const handleMemberDeleted = async (member: any) => {
        const updatedList = {
            ...shoppingList,
            memberIds: shoppingList?.memberIds.filter(id => id !== member._id)
        };

        if (USE_MOCKS) {
            await updateList(updatedList);
        } else {
            const dtoIn = { memberIds: shoppingList?.memberIds.filter(id => id !== member._id) };
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
                return await response.json();
            } catch (e: any) {
                console.error("Error: ", e.message);
            }
        }
    };

    const handleInviteMemberShow = () => setInviteMemberShow(true);
    const handleDeleteMemberShow = (member: any) => {
        setSelectedMember(member);
        setDeleteMemberShow(true);
    };

    return (
        <>
            <Card style={{ margin: 10, backgroundColor: mode === "light" ? "#f3f3f3" : "#272727" }}>
                <Card.Title
                    title={currentLanguage.id === "EN" ? "Members" : "Členové"}
                    titleStyle={{ color: mode === "light" ? "black" : "white" }}
                    right={() =>
                        currentUser.id === shoppingList?.ownerId && (
                            <Button
                                mode="contained"
                                onPress={handleInviteMemberShow}
                                icon={() => <MaterialCommunityIcons name="account-plus" size={20} color="darkblue" />}
                                style={{ backgroundColor: "lightblue", marginRight: 15 }}
                            >
                                <Text style={{ color: "darkblue" }}>
                                    {currentLanguage.id === "EN" ? "Invite" : "Pozvat"}
                                </Text>
                            </Button>
                        )
                    }
                />
                <Card.Content>
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
                                {users.map(user => shoppingList?.memberIds.includes(user._id) && (
                                    <List.Item
                                        key={user._id}
                                        title={() => (
                                            <View style={styles.listItem}>
                                                <MaterialCommunityIcons name="account" size={20} color={mode === "light" ? "black" : "white"} />
                                                <Text style={[styles.memberName, { color: mode === "light" ? "black" : "white" }]}>{user.name}</Text>
                                                {user._id === shoppingList?.ownerId && (
                                                    <Text style={styles.ownerBadge}>
                                                        {currentLanguage.id === "EN" ? "Owner" : "Vlastník"}
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                        right={() =>
                                            currentUser.id === shoppingList?.ownerId &&
                                            user._id !== shoppingList?.ownerId && (
                                                <TouchableOpacity onPress={() => handleDeleteMemberShow(user)}>
                                                    <MaterialCommunityIcons name="close" size={20} color="red" />
                                                </TouchableOpacity>
                                            )
                                        }
                                    />
                                ))}
                            </ScrollView>
                        </List.Accordion>
                    </List.Section>
                </Card.Content>
            </Card>

            <InviteMemberModal
                show={inviteMemberShow}
                setInviteMemberShow={setInviteMemberShow}
                onMembersInvite={handleMembersInvited}
                users={users}
                list={shoppingList}
            />

            <DeleteMemberModal
                show={deleteMemberShow}
                setDeleteMemberShow={setDeleteMemberShow}
                onMemberDelete={handleMemberDeleted}
                user={selectedMember as User}
            />
        </>
    );
}

const styles = StyleSheet.create({
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5
    },
    memberName: {
        flex: 1,
        fontWeight: "bold"
    },
    ownerBadge: {
        backgroundColor: "aqua",
        color: "black",
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
        fontSize: 12,
    }
});