import React, { useState } from "react";
import { View } from "react-native";
import { Menu, Button } from "react-native-paper";

interface Language {
    id: string;
    name: string;
}

interface LanguageSelectorProps {
    languages: Language[];
    selectedLanguageId: string;
    setLanguage: (id: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    languages,
    selectedLanguageId,
    setLanguage
}) => {
    const [visible, setVisible] = useState(false);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const currentLanguage = languages.find(lang => lang.id === selectedLanguageId);

    return (
        <View style={{ marginHorizontal: 10 }}>
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                    <Button mode="outlined" onPress={openMenu}>
                        {currentLanguage?.name || "Select Language"}
                    </Button>
                }
            >
                {languages.map(lang => (
                    <Menu.Item
                        key={lang.id}
                        title={lang.name}
                        onPress={() => {
                            setLanguage(lang.id);
                            closeMenu();
                        }}
                    />
                ))}
            </Menu>
        </View>
    );
};

export default LanguageSelector;