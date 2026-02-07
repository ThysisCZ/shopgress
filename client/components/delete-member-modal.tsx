import React from "react";
import { View } from "react-native";
import { Portal, Modal, Button, Text, Divider } from "react-native-paper";
import { useLanguageContext } from "../context/LanguageContext";
import { useModeContext } from "@/context/ModeContext";


interface User {
    id: string;
    name: string;
    email: string;
}

interface DeleteMemberModalProps {
    show: boolean;
    setDeleteMemberShow: (value: boolean) => void;
    onMemberDelete: (user: User) => void;
    user: User
}

export default function DeleteMemberModal({
    show,
    setDeleteMemberShow,
    onMemberDelete,
    user
}: DeleteMemberModalProps) {
    const { currentLanguage } = useLanguageContext();
    const { mode } = useModeContext();

    const handleClose = () => {
        setDeleteMemberShow(false);
    };

    const handleSubmit = () => {
        if (user) {
            onMemberDelete(user);
        }
        setDeleteMemberShow(false);
    };

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
                    style={{ marginBottom: 20, textAlign: "left" }}
                >
                    {currentLanguage.id === "EN"
                        ? "Delete Member"
                        : "Smazat člena"}{" "}
                    ({user?.name})?
                </Text>

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

                    <Button mode="contained" onPress={handleSubmit} textColor="white" buttonColor="#d9534f">
                        {currentLanguage.id === "EN" ? "Delete" : "Smazat"}
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
}