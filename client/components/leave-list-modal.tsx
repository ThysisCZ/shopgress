import React from "react";
import { View } from "react-native";
import { Portal, Modal, Button, Text, Divider } from "react-native-paper";
import { useLanguageContext } from "../context/LanguageContext";
import { useModeContext } from "@/context/ModeContext";

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
    const { mode } = useModeContext();

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
                    backgroundColor: mode === "light" ? "#555" : "#1c191f"
                }}
            >
                <Text
                    variant="titleLarge"
                    style={{ marginBottom: 20, textAlign: "left" }}
                >
                    {currentLanguage.id === "EN"
                        ? "Leave List"
                        : "Opustit seznam"}{" "}
                    ({list?.title})?
                </Text>

                <Divider />

                <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 20 }}>
                    <Button
                        mode="text"
                        onPress={handleClose}
                        style={{ marginRight: 10 }}
                        labelStyle={{ color: "white" }}
                    >
                        {currentLanguage.id === "EN" ? "Cancel" : "Zrušit"}
                    </Button>

                    <Button
                        mode="contained"
                        buttonColor="#d9534f"
                        onPress={handleSubmit}
                        labelStyle={{ color: "white" }}
                    >
                        {currentLanguage.id === "EN" ? "Leave" : "Opustit"}
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
}