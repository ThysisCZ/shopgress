import React, { useState } from "react";
import { View } from "react-native";
import { Portal, Modal, Button, Text, TextInput, Checkbox, List, Divider } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useLanguageContext } from "../context/LanguageContext";
import { useModeContext } from "@/context/ModeContext";

interface User {
    _id: string;
    name: string;
    email: string;
}

interface ShoppingList {
    ownerId: string;
    memberIds: string[];
}

interface InviteMemberModalProps {
    show: boolean;
    setInviteMemberShow: (value: boolean) => void;
    onMembersInvite: (userIds: string[]) => void;
    users: User[],
    list: ShoppingList;
}

export default function InviteMemberModal({
    show,
    setInviteMemberShow,
    onMembersInvite,
    users,
    list
}: InviteMemberModalProps) {

    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [searched, setSearched] = useState(false);
    const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
    const { currentLanguage } = useLanguageContext();
    const { mode } = useModeContext();

    const handleClose = () => {
        setSelectedUsers([]);
        setInviteMemberShow(false);
    };

    const handleUserSelection = (userId: string) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const availableUsers = users.filter((user) => {
        const isOwner = user._id === list?.ownerId;
        const isMember = list?.memberIds.includes(user._id);
        return !isOwner && !isMember;
    });

    const handleSubmit = () => {
        onMembersInvite(selectedUsers);
        setSearch("");
        setSearched(false);
        setSelectedUsers([]);
        setInviteMemberShow(false);
    };

    const handleSearch = () => {
        const query = search.trim().toLowerCase();

        if (!query) {
            setSearched(false);
            return;
        }

        const filtered = availableUsers.filter((user) =>
            user.name.trim().toLowerCase().includes(query)
        );

        setSearchedUsers(filtered);
        setSearched(true);
    };

    const displayedUsers = searched ? searchedUsers : [];

    return (
        <Portal>
            <Modal
                visible={show}
                onDismiss={handleClose}
                contentContainerStyle={{
                    margin: 20,
                    padding: 20,
                    borderRadius: 14,
                    backgroundColor: mode === "light" ? "#555" : "#1c191f"
                }}
            >
                <Text
                    variant="titleLarge"
                    style={{ marginTop: 5, marginBottom: 20, textAlign: "left" }}
                >
                    {currentLanguage.id === "EN"
                        ? "Invite Members"
                        : "Pozvat členy"}
                </Text>

                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 16,
                        gap: 6
                    }}
                >
                    <TextInput
                        mode="outlined"
                        placeholder={
                            currentLanguage.id === "EN"
                                ? "Search members..."
                                : "Hledat členy..."
                        }
                        value={search}
                        onChangeText={setSearch}
                        style={{ flex: 1, height: 30 }}
                        activeOutlineColor="aqua"
                    />

                    <Button mode="contained" onPress={handleSearch} style={{ backgroundColor: "aqua" }}>
                        <MaterialCommunityIcons
                            name="account-search"
                            size={20}
                            color="darkblue"
                        />
                    </Button>
                </View>

                {searched && displayedUsers.length === 0 ? (
                    <Text
                        style={{
                            textAlign: "center",
                            color: "grey",
                            marginTop: 10,
                            marginBottom: 25
                        }}
                    >
                        {currentLanguage.id === "EN"
                            ? "No users to invite"
                            : "Žádní uživatelé k pozvání"}
                    </Text>
                ) : (
                    <View style={{ maxHeight: 260 }}>
                        {displayedUsers.map((user) => (
                            <List.Item
                                key={user._id}
                                title={() => (
                                    <View style={{ flex: 1, flexDirection: "row", gap: 10, marginTop: 7 }}>
                                        <MaterialCommunityIcons name="account" size={20} color={"white"} />
                                        <Text style={{ color: "white" }}>{user.name}</Text>
                                    </View>
                                )}
                                right={() => (
                                    <Checkbox
                                        status={
                                            selectedUsers.includes(user._id)
                                                ? "checked"
                                                : "unchecked"
                                        }
                                        onPress={() =>
                                            handleUserSelection(user._id)
                                        }
                                        uncheckedColor="white"
                                        color="aqua"
                                    />
                                )}
                            />
                        ))}
                    </View>
                )}

                <Divider />

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        marginTop: 20
                    }}
                >
                    <Button
                        mode="text"
                        onPress={handleClose}
                        style={{ marginRight: 10 }}
                        textColor="white"
                    >
                        {currentLanguage.id === "EN" ? "Cancel" : "Zrušit"}
                    </Button>

                    <Button
                        mode="contained"
                        disabled={selectedUsers.length === 0}
                        onPress={handleSubmit}
                        textColor="darkblue"
                        buttonColor="aqua"
                    >
                        {currentLanguage.id === "EN" ? "Invite" : "Pozvat"} (
                        {selectedUsers.length})
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
}