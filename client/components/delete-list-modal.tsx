import React from "react";
import { Portal, Dialog, Button, Text } from "react-native-paper";

interface DeleteListModalProps {
    visible: boolean;
    onDismiss: () => void;
    onDelete: () => void;
    listTitle?: string;
    language: "EN" | "CZ";
}

const DeleteListModal: React.FC<DeleteListModalProps> = ({
    visible,
    onDismiss,
    onDelete,
    listTitle,
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
                    {language === "EN" ? "Delete List" : "Smazat seznam"} {listTitle ? `(${listTitle})?` : "?"}
                </Dialog.Title>

                <Dialog.Content>
                    <Text variant="bodyMedium" >
                        {language === "EN"
                            ? "Are you sure you want to delete this list?"
                            : "Opravdu chcete tento seznam smazat?"}
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

export default DeleteListModal;
