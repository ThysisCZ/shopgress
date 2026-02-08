import { useState } from "react";
import { View } from "react-native";
import {
    Portal,
    Dialog,
    Button,
    TextInput,
    HelperText,
    Divider
} from "react-native-paper";
import UnitSelector from './unit-selector';

export interface ItemData {
    _id?: string | undefined;
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
    language: string;
    mode: string;
}

export default function AddItemModal({
    visible,
    onDismiss,
    onAdd,
    existingItems,
    language,
    mode
}: AddItemModalProps) {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [unit, setUnit] = useState("");

    const defaultErrors = {
        name: "",
        amount: "",
        unit: "",
    }

    const [errors, setErrors] = useState(defaultErrors);

    const renderUnit = (unit: string) => {
        if (language === "EN") return unit;

        const unitMap: Record<string, string> = { tsp: "ČL", tbsp: "PL", pc: "ks", c: "hrn" };
        const translatedUnit = unitMap[unit];
        return translatedUnit;
    };

    const UNITS = [
        { id: "0", name: "", translation: language === "EN" ? "No unit" : "Bez jednotky" },
        { id: "1", name: "ml", translation: "ml" },
        { id: "2", name: "dl", translation: "dl" },
        { id: "3", name: "l", translation: "l" },
        { id: "4", name: "g", translation: "g" },
        { id: "5", name: "dkg", translation: "dkg" },
        { id: "6", name: "kg", translation: "kg" },
        { id: "7", name: "tsp", translation: `${renderUnit("tsp")}` },
        { id: "8", name: "tbsp", translation: `${renderUnit("tbsp")}` },
        { id: "9", name: "pc", translation: `${renderUnit("pc")}` },
        { id: "10", name: "c", translation: `${renderUnit("c")}` },
        { id: "11", name: "fl oz", translation: "fl oz" },
        { id: "12", name: "pt", translation: "pt" },
        { id: "13", name: "qt", translation: "qt" },
        { id: "14", name: "gal", translation: "gal" },
        { id: "15", name: "lb", translation: "lb" },
        { id: "16", name: "oz", translation: "oz" }
    ]

    const validate = () => {
        let valid = true;
        const newErrors = { name: "", amount: "", unit: "" };

        if (!name.trim()) {
            newErrors.name = (language === "EN" ? "This field is required" : "Toto pole je povinné");
            valid = false;
        } else if (existingItems.some(item => item.trim().toLowerCase() === name.trim().toLowerCase())) {
            newErrors.name = (language === "EN" ? "Item already exists in this list" : "Tuto položku již máte v seznamu");
            valid = false;
        }

        if (!amount.trim()) {
            newErrors.amount = (language === "EN" ? "This field is required" : "Toto pole je povinné");
            valid = false;
        } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
            newErrors.amount = (language === "EN" ? "Enter a valid amount" : "Zadejte validní množství");
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleAddItem = () => {
        if (!validate()) return;

        const newItem: ItemData = {
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
            <Dialog visible={visible} onDismiss={onDismiss} style={{ backgroundColor: mode === "light" ? "#555" : "#1c191f" }}>
                <Dialog.Title>{language === "EN" ? "Add a new item" : "Přidat novou položku"}</Dialog.Title>

                <Dialog.Content>
                    <TextInput
                        label={language === "EN" ? "Item name" : "Název"}
                        value={name}
                        onChangeText={setName}
                        error={!!errors.name}
                        mode="outlined"
                    />
                    {errors.name ? (
                        <HelperText type="error" style={{ marginLeft: -10 }}>{errors.name}</HelperText>
                    ) : null}

                    <TextInput
                        label={language === "EN" ? "Amount" : "Množství"}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        error={!!errors.amount}
                        mode="outlined"
                        style={{ marginTop: 10 }}
                    />
                    {errors.amount ? (
                        <HelperText type="error" style={{ marginLeft: -10 }}>{errors.amount}</HelperText>
                    ) : null}

                    <View style={{ marginTop: 10 }}>
                        <UnitSelector
                            units={UNITS}
                            selectedUnit={unit}
                            setUnit={setUnit}
                        />
                        {errors.unit ? (
                            <HelperText type="error">{errors.unit}</HelperText>
                        ) : null}
                    </View>
                </Dialog.Content>

                <Divider style={{ marginBottom: 25 }} />

                <Dialog.Actions>
                    <Button onPress={() => { onDismiss(), setErrors(defaultErrors) }} textColor="white">{language === "EN" ? "Cancel" : "Zrušit"} </Button>
                    <Button mode="contained" onPress={handleAddItem} buttonColor="lightgreen" textColor="darkgreen"
                        style={{ width: 80 }}>
                        {language === "EN" ? "Add" : "Přidat"}
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};
