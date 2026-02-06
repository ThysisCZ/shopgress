import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import { useLanguageContext } from "@/context/LanguageContext";

interface Unit {
    id: string,
    name: string,
    translation: string
}

interface UnitSelectorProps {
    units: Unit[];
    selectedUnit: string;
    setUnit: (name: string) => void;
}

export default function LanguageSelector({
    units,
    selectedUnit,
    setUnit
}: UnitSelectorProps) {
    const { currentLanguage } = useLanguageContext();
    const [isFocus, setIsFocus] = useState(false);
    const currentUnit = units.find(unit => unit.name === selectedUnit);
    const placeholder = (currentLanguage.id === "EN" ? "No unit" : "Bez jednotky")

    return (
        <View>
            <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                data={units}
                labelField="translation"
                valueField="name"
                value={currentUnit?.name}
                placeholder={placeholder}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={unit => {
                    setUnit(unit.name);
                    setIsFocus(false);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    dropdown: {
        height: 50,
        width: 128,
        backgroundColor: 'white',
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
    }
});