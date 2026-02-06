import React from "react";
import { View } from "react-native";
import { Portal, Modal, Button, Text } from "react-native-paper";
import { useLanguageContext } from "../context/LanguageContext";

interface User {
    _id: string;
    name: string;
}

interface DeleteMemberModalProps {
    show: boolean;
    setDeleteMemberShow: (value: boolean) => void;
    onMemberDelete: (user: User) => void;
    user: User | null;
}

export default function DeleteMemberModal({
    show,
    setDeleteMemberShow,
    onMemberDelete,
    user
}: DeleteMemberModalProps) {
    const { currentLanguage } = useLanguageContext();

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
                    backgroundColor: "white"
                }}
            >
                <Text
                    variant="titleLarge"
                    style={{ marginBottom: 20, textAlign: "center" }}
                >
                    {currentLanguage.id === "EN"
                        ? "Delete Member"
                        : "Smazat člena"}{" "}
                    ({user?.name})?
                </Text>

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        marginTop: 10
                    }}
                >
                    <Button
                        mode="outlined"
                        onPress={handleClose}
                        style={{ marginRight: 10 }}
                    >
                        {currentLanguage.id === "EN" ? "Cancel" : "Zrušit"}
                    </Button>

                    <Button mode="contained" onPress={handleSubmit}>
                        {currentLanguage.id === "EN" ? "Delete" : "Smazat"}
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
}