import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';

interface Language {
    id: string;
    name: string;
}

interface LanguageSelectorProps {
    languages: Language[];
    selectedLanguageId: string;
    setLanguage: (id: string) => void;
}

export default function LanguageSelector({
    languages,
    selectedLanguageId,
    setLanguage
}: LanguageSelectorProps) {
    const [isFocus, setIsFocus] = useState(false);
    const currentLanguage = languages.find(lang => lang.id === selectedLanguageId);

    return (
        <View style={{ marginHorizontal: 10, width: 100 }}>
            <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                data={languages}
                labelField="name"
                valueField="name"
                value={currentLanguage?.name}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={lang => {
                    setLanguage(lang.id);
                    setIsFocus(false);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    dropdown: {
        height: 50,
        backgroundColor: 'white',
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
    }
});