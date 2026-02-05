import React from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useLanguageContext } from "../context/LanguageContext";
import { useModeContext } from "@/context/ModeContext";

interface ItemData {
    _id: string;
    name: string;
    quantity: number;
    unit: string | null;
    resolved: boolean;
}

interface ListData {
    _id: string;
    title: string;
    items: ItemData[];
}

interface ShoppingListChartProps {
    userLists: ListData[];
}

const ShoppingListChart: React.FC<ShoppingListChartProps> = ({ userLists }) => {
    const { currentLanguage } = useLanguageContext();
    const { mode } = useModeContext();

    if (!userLists || userLists.length === 0) {
        return (
            <View style={{ marginTop: 20, alignItems: "center" }}>
                <Text>
                    {currentLanguage.id === "EN" ? "No data to view." : "Žádná data k zobrazení."}
                </Text>
            </View>
        );
    }

    const data = userLists.map(list => list.items.length);
    const labels = userLists.map(list => list.title);

    const screenWidth = Dimensions.get("window").width;

    return (
        <View style={{ marginTop: 20 }}>
            <LineChart
                data={{
                    labels,
                    datasets: [
                        {
                            data,
                        },
                    ],
                    legend: [currentLanguage.id === "EN" ? "No. of items" : "Počet položek"]
                }}
                width={screenWidth - 20}
                height={240}
                fromZero
                chartConfig={{
                    backgroundGradientFrom: mode === "light" ? "#f3f3f3" : "#272727",
                    backgroundGradientTo: mode === "light" ? "#f3f3f3" : "#272727",
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(136, 132, 216, ${opacity})`,
                    labelColor: (opacity = 1) => mode === "light" ? `rgba(0, 0, 0, ${opacity})` : `rgba(255, 255, 255, ${opacity})`,
                    propsForDots: {
                        r: "4",
                    },
                }}
                style={{
                    borderRadius: 12,
                    marginBottom: 50,
                    marginTop: -10
                }}
                bezier
                formatYLabel={(value: any) => value % 1 == 0 ? value.slice(0, 1) : ''}
            />
        </View>
    );
};

export default ShoppingListChart;