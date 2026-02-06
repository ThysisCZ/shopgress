import React from "react";
import { View } from "react-native";
import { Portal, Modal, Button, Text } from "react-native-paper";
import { useLanguageContext } from "../context/LanguageContext";

type LeaveListModalProps = {
    show: boolean;
    setLeaveListShow: (value: boolean) => void;
    onListLeave: () => void;
    list?: { title?: string };
};

export default function LeaveListModal({
    show,
    setLeaveListShow,
    onListLeave,
    list
}: LeaveListModalProps) {

    const { currentLanguage } = useLanguageContext();

    const handleClose = () => setLeaveListShow(false);

    const handleSubmit = () => {
        onListLeave();
        setLeaveListShow(false);
    };

    return (
        <Portal>
            <Modal
                visible={show}
                onDismiss={handleClose}
                contentContainerStyle={{
                    margin: 20,
                    padding: 20,
                    borderRadius: 12,
                    backgroundColor: "white"
                }}
            >
                <Text
                    variant="titleLarge"
                    style={{ marginBottom: 20, textAlign: "center" }}
                >
                    {currentLanguage.id === "EN"
                        ? "Leave List"
                        : "Opustit seznam"}{" "}
                    ({list?.title})?
                </Text>

                <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                    <Button
                        mode="outlined"
                        onPress={handleClose}
                        style={{ marginRight: 10 }}
                    >
                        {currentLanguage.id === "EN" ? "Cancel" : "Zrušit"}
                    </Button>

                    <Button
                        mode="contained"
                        buttonColor="#d9534f"
                        onPress={handleSubmit}
                    >
                        {currentLanguage.id === "EN" ? "Leave" : "Opustit"}
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
}