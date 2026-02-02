import React, { useState } from "react";
import { Portal, Dialog, Button, TextInput, HelperText, Divider } from "react-native-paper";

interface AddListModalProps {
    visible: boolean;
    onDismiss: () => void;
    onAdd: (name: string) => void;
    existingLists: string[];
}

const AddListModal: React.FC<AddListModalProps> = ({
    visible,
    onDismiss,
    onAdd,
    existingLists
}) => {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const validate = () => {
        if (!name.trim()) {
            setError("Please enter a list name.");
            return false;
        }

        if (existingLists.includes(name.trim().toLowerCase())) {
            setError("A list with this name already exists.");
            return false;
        }

        setError("");
        return true;
    };

    const handleAdd = () => {
        if (!validate()) return;

        onAdd(name.trim());
        setName("");
        onDismiss();
    };

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>Create a new list</Dialog.Title>

                <Dialog.Content>
                    <TextInput
                        label="List name"
                        mode="outlined"
                        value={name}
                        onChangeText={setName}
                        error={!!error}
                    />

                    {error ? <HelperText type="error">{error}</HelperText> : null}
                </Dialog.Content>

                <Divider />

                <Dialog.Actions>
                    <Button onPress={onDismiss}>Cancel</Button>
                    <Button mode="contained" onPress={handleAdd}>
                        Create
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default AddListModal;