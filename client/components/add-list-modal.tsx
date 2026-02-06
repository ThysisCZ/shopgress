import { useState } from "react";
import { Portal, Dialog, Button, TextInput, HelperText, Divider } from "react-native-paper";

interface AddListModalProps {
    visible: boolean;
    onDismiss: () => void;
    onAdd: (name: string) => void;
    existingLists: string[];
    language: string;
    mode: string;
}

export default function AddListModal({
    visible,
    onDismiss,
    onAdd,
    existingLists,
    language,
    mode
}: AddListModalProps) {
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const validate = () => {
        if (!name.trim()) {
            setError(language === "EN" ? "This field is required." : "Toto pole je povinné.");
            return false;
        }

        if (existingLists.some(list => list.trim().toLowerCase() === name.trim().toLowerCase())) {
            setError(language === "EN" ? "This list already exists." : "Tento seznam již existuje.");
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
            <Dialog visible={visible} onDismiss={onDismiss} style={{ backgroundColor: mode === "light" ? "#555" : "#1c191f" }}>
                <Dialog.Title>{language === "EN" ? "Add a new list" : "Přidat nový seznam"}</Dialog.Title>

                <Dialog.Content>
                    <TextInput
                        label={language === "EN" ? "List title" : "Název"}
                        mode="outlined"
                        value={name}
                        onChangeText={setName}
                        error={!!error}
                    />

                    {error ? <HelperText type="error">{error}</HelperText> : null}
                </Dialog.Content>

                <Divider style={{ marginBottom: 25 }} />

                <Dialog.Actions>
                    <Button onPress={onDismiss} textColor="white">{language === "EN" ? "Cancel" : "Zrušit"}</Button>
                    <Button mode="contained" onPress={handleAdd} buttonColor="lightgreen" textColor="darkgreen"
                        style={{ width: 80 }}>
                        {language === "EN" ? "Add" : "Přidat"}
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};