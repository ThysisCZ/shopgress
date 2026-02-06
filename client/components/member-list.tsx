import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Card, Button, List, IconButton } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import InviteMemberModal from "../components/invite-member-modal";
import DeleteMemberModal from "../components/delete-member-modal";
import { useShoppingListsContext } from "../context/ShoppingListsContext";
import { useLanguageContext } from "../context/LanguageContext";
import { useUserContext } from "../context/UserContext";

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

interface MemberListProps {
    currentUser: User;
    users: User[];
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

    const handleMemberDeleted = async (member: User) => {
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
    const handleDeleteMemberShow = (member: User) => {
        setSelectedMember(member);
        setDeleteMemberShow(true);
    };

    return (
        <>
            <Card style={styles.card}>
                <Card.Title
                    title={currentLanguage.id === "EN" ? "Members" : "Členové"}
                    right={() =>
                        currentUser._id === shoppingList?.ownerId && (
                            <Button
                                mode="contained"
                                onPress={handleInviteMemberShow}
                                icon={() => <MaterialCommunityIcons name="account-plus" size={20} color="white" />}
                            >
                                {currentLanguage.id === "EN" ? "Invite" : "Pozvat"}
                            </Button>
                        )
                    }
                    titleStyle={{ fontSize: 18, fontWeight: "bold" }}
                />
                <Card.Content>
                    <List.Section>
                        <List.Accordion
                            title={currentLanguage.id === "EN" ? "Show Members" : "Zobrazit členy"}
                            style={styles.accordion}
                        >
                            <ScrollView>
                                {users
                                    .filter(user => shoppingList?.memberIds.includes(user._id))
                                    .map(user => (
                                        <List.Item
                                            key={user._id}
                                            title={
                                                <View style={styles.listItem}>
                                                    <MaterialCommunityIcons name="account" size={20} />
                                                    <Text style={styles.memberName}>{user.name}</Text>
                                                    {user._id === shoppingList?.ownerId && (
                                                        <Text style={styles.ownerBadge}>
                                                            {currentLanguage.id === "EN" ? "Owner" : "Vlastník"}
                                                        </Text>
                                                    )}
                                                </View>
                                            }
                                            right={() =>
                                                currentUser._id === shoppingList?.ownerId &&
                                                user._id !== shoppingList?.ownerId && (
                                                    <IconButton
                                                        icon={() => <MaterialCommunityIcons name="close" size={20} color="white" />}
                                                        onPress={() => handleDeleteMemberShow(user)}
                                                    />
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
                user={selectedMember}
            />
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        margin: 10,
        backgroundColor: "salmon"
    },
    accordion: {
        backgroundColor: "lightsalmon"
    },
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    memberName: {
        fontWeight: "bold",
        flex: 1
    },
    ownerBadge: {
        backgroundColor: "#2196F3",
        color: "white",
        paddingHorizontal: 6,
        borderRadius: 4,
        fontSize: 12
    }
});