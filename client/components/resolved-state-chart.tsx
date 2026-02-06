import { View, Text, StyleSheet } from "react-native";
import PieChart from "react-native-pie-chart";
import { useLanguageContext } from "../context/LanguageContext";
import { useModeContext } from "../context/ModeContext";

interface ItemData {
    _id: string;
    name: string;
    resolved: boolean;
}

interface ShoppingList {
    _id: string;
    title: string;
    items: ItemData[];
}

interface ResolvedStateChartProps {
    shoppingList: ShoppingList;
}

export default function ResolvedStateChart({
    shoppingList,
}: ResolvedStateChartProps) {
    const { currentLanguage } = useLanguageContext();
    const { mode } = useModeContext();

    // Count resolved vs unresolved
    const items = shoppingList?.items || [];
    const resolvedCount = items.filter((item) => item.resolved).length;
    const unresolvedCount = items.filter((item) => !item.resolved).length;
    const total = resolvedCount + unresolvedCount;

    if (total === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: mode === "light" ? "black" : "white" }]}>
                    {currentLanguage.id === "EN" ? "No data to view." : "Žádná data k zobrazení."}
                </Text>
            </View>
        );
    }

    const series = [
        { value: resolvedCount, color: "#00C49F" },
        { value: unresolvedCount, color: "#ff4b42ff" },
    ];

    const resolvedPct = ((resolvedCount / total) * 100).toFixed(0);
    const unresolvedPct = ((unresolvedCount / total) * 100).toFixed(0);

    return (
        <View style={styles.chartContainer}>
            <PieChart
                widthAndHeight={200}
                series={series}
                cover={{ radius: 0.6, color: mode === "light" ? "#fff" : "#000" }}
            />

            <View style={styles.labels}>
                <Text style={[styles.label, { color: mode === "light" ? "black" : "white" }]}>
                    {currentLanguage.id === "EN"
                        ? `Resolved: ${resolvedCount} (${resolvedPct}%)`
                        : `Vyřešeno: ${resolvedCount} (${resolvedPct}%)`}
                </Text>
                <Text style={[styles.label, { color: mode === "light" ? "black" : "white" }]}>
                    {currentLanguage.id === "EN"
                        ? `Unresolved: ${unresolvedCount} (${unresolvedPct}%)`
                        : `Nevyřešeno: ${unresolvedCount} (${unresolvedPct}%)`}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    chartContainer: {
        alignItems: "center",
        marginVertical: 20,
    },
    labels: {
        marginTop: 12,
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
    },
    emptyContainer: {
        marginTop: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        fontSize: 16,
    },
});