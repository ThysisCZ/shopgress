import React, { useState } from "react";
import { View } from "react-native";
import {
    Portal,
    Dialog,
    Button,
    TextInput,
    HelperText,
    Menu,
    Divider
} from "react-native-paper";

export interface ItemData {
    _id: string;
    name: string;
    quantity: number;
    unit: string | null;
    resolved: boolean;
}

interface AddItemModalProps {
    visible: boolean;
    onDismiss: () => void;
    onAdd: (item: ItemData) => void;
    existingItems: string[];
}

const UNITS = ["kg", "g", "l", "ml", "pcs"];

const AddItemModal: React.FC<AddItemModalProps> = ({
    visible,
    onDismiss,
    onAdd,
    existingItems
}) => {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [unit, setUnit] = useState("");
    const [errors, setErrors] = useState({
        name: "",
        amount: "",
        unit: "",
    });

    const [menuVisible, setMenuVisible] = useState(false);

    const validate = () => {
        let valid = true;
        const newErrors = { name: "", amount: "", unit: "" };

        if (!name.trim()) {
            newErrors.name = "Please enter an item name.";
            valid = false;
        } else if (existingItems.includes(name.trim().toLowerCase())) {
            newErrors.name = "Item already exists in this list.";
            valid = false;
        }

        if (!amount.trim()) {
            newErrors.amount = "Please enter an amount.";
            valid = false;
        } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
            newErrors.amount = "Amount must be a positive number.";
            valid = false;
        }

        if (!unit) {
            newErrors.unit = "Please select a unit.";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleAddItem = () => {
        if (!validate()) return;

        const newItem: ItemData = {
            _id: "",
            name: name.trim(),
            quantity: Number(amount),
            unit,
            resolved: false
        };

        onAdd(newItem);
        setName("");
        setAmount("");
        setUnit("");
        onDismiss();
    };

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>Add Item</Dialog.Title>

                <Dialog.Content>
                    <TextInput
                        label="Item name"
                        value={name}
                        onChangeText={setName}
                        error={!!errors.name}
                        mode="outlined"
                    />
                    {errors.name ? (
                        <HelperText type="error">{errors.name}</HelperText>
                    ) : null}

                    <TextInput
                        label="Amount"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        error={!!errors.amount}
                        mode="outlined"
                        style={{ marginTop: 10 }}
                    />
                    {errors.amount ? (
                        <HelperText type="error">{errors.amount}</HelperText>
                    ) : null}

                    {/* Unit selector */}
                    <View style={{ marginTop: 10 }}>
                        <Menu
                            visible={menuVisible}
                            onDismiss={() => setMenuVisible(false)}
                            anchor={
                                <Button mode="outlined" onPress={() => setMenuVisible(true)}>
                                    {unit ? `Unit: ${unit}` : "Select unit"}
                                </Button>
                            }
                        >
                            {UNITS.map((u) => (
                                <Menu.Item
                                    key={u}
                                    onPress={() => {
                                        setUnit(u);
                                        setMenuVisible(false);
                                    }}
                                    title={u}
                                />
                            ))}
                        </Menu>
                        {errors.unit ? (
                            <HelperText type="error">{errors.unit}</HelperText>
                        ) : null}
                    </View>
                </Dialog.Content>

                <Divider />

                <Dialog.Actions>
                    <Button onPress={onDismiss}>Cancel</Button>
                    <Button mode="contained" onPress={handleAddItem}>
                        Add
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default AddItemModal;
