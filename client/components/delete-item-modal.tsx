import React from "react";
import { Portal, Dialog, Button, Text } from "react-native-paper";

interface DeleteItemModalProps {
    visible: boolean;
    onDismiss: () => void;
    onDelete: () => void;
    itemName?: string;
    language: "EN" | "CZ";
}

const DeleteItemModal: React.FC<DeleteItemModalProps> = ({
    visible,
    onDismiss,
    onDelete,
    itemName,
    language
}) => {
    const handleDelete = () => {
        onDelete();
        onDismiss();
    };

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>
                    {language === "EN" ? "Delete Item" : "Smazat položku"} {itemName ? `(${itemName})?` : "?"}
                </Dialog.Title>

                <Dialog.Content>
                    <Text variant="bodyMedium" >
                        {language === "EN"
                            ? "Are you sure you want to delete this item?"
                            : "Opravdu chcete tuto položku smazat?"}
                    </Text>
                </Dialog.Content>

                <Dialog.Actions>
                    <Button onPress={onDismiss}>{language === "EN" ? "Cancel" : "Zrušit"}</Button>
                    <Button mode="contained" onPress={handleDelete} buttonColor="#d9534f">
                        {language === "EN" ? "Delete" : "Smazat"}
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default DeleteItemModal;
