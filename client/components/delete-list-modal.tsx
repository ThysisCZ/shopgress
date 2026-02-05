import React from "react";
import { Portal, Dialog, Button, Text, Divider } from "react-native-paper";

interface DeleteListModalProps {
    visible: boolean;
    onDismiss: () => void;
    onDelete: () => void;
    listTitle?: string;
    language: string;
    mode: string;
}

const DeleteListModal: React.FC<DeleteListModalProps> = ({
    visible,
    onDismiss,
    onDelete,
    listTitle,
    language,
    mode
}) => {
    const handleDelete = () => {
        onDelete();
        onDismiss();
    };

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss} style={{ backgroundColor: mode === "light" ? "#555" : "#1c191f" }}>
                <Dialog.Title>
                    {language === "EN" ? "Delete List" : "Smazat seznam"} {`(${listTitle})?`}
                </Dialog.Title>

                <Dialog.Content>
                    <Text variant="bodyMedium" >
                        {language === "EN"
                            ? "Are you sure you want to delete this list?"
                            : "Opravdu chcete tento seznam smazat?"}
                    </Text>
                </Dialog.Content>

                <Divider style={{ marginBottom: 25 }} />

                <Dialog.Actions>
                    <Button onPress={onDismiss} textColor="#ffffff">{language === "EN" ? "Cancel" : "Zrušit"}</Button>
                    <Button mode="contained" onPress={handleDelete} buttonColor="#d9534f" textColor="#ffffff"
                        style={{ width: 80 }}>
                        {language === "EN" ? "Delete" : "Smazat"}
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default DeleteListModal;
