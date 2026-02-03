import React from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useLanguageContext } from "../context/LanguageContext";

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
                }}
                width={screenWidth - 20}
                height={240}
                yAxisSuffix=""
                fromZero
                chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(136, 132, 216, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    propsForDots: {
                        r: "4",
                    },
                }}
                style={{
                    borderRadius: 12,
                    marginHorizontal: 10,
                }}
                bezier
            />
        </View>
    );
};

export default ShoppingListChart;