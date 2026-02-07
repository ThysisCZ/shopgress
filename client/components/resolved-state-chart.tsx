import { View, Text, StyleSheet } from "react-native";
import PieChart from "react-native-pie-chart";
import Svg, { Circle } from "react-native-svg";
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
                <Text style={styles.emptyText}>
                    {currentLanguage.id === "EN" ? "No data to view" : "Žádná data k zobrazení"}
                </Text>
            </View>
        );
    }

    const GREEN = "#00C49F";
    const RED = "#ff4b42ff";

    const series = [
        { value: resolvedCount, color: GREEN },
        { value: unresolvedCount, color: RED },
    ];

    const resolvedTitle = currentLanguage.id === "EN" ? "Resolved" : "Vyřešeno";
    const unresolvedTitle = currentLanguage.id === "EN" ? "Unresolved" : "Nevyřešeno";

    return (
        <View style={styles.chartContainer}>
            <View>
                <PieChart
                    widthAndHeight={200}
                    series={series}
                    cover={{ radius: 0.6, color: mode === "light" ? "#fff" : "#000" }}
                />
            </View>

            <View style={styles.stateContainer}>
                <View>
                    <View style={styles.state}>
                        <Text style={[styles.label, { color: mode === "light" ? "black" : "white" }]}>
                            <Svg height="50%" width="17%" viewBox="0 0 125 100">
                                <Circle cx="50" cy="50" r="50" stroke={GREEN} strokeWidth="2.5" fill={GREEN} />
                            </Svg>
                            {`${resolvedTitle}: ${resolvedCount}`}
                        </Text>
                    </View>
                    <View style={styles.state}>
                        <Text style={[styles.label, { color: mode === "light" ? "black" : "white" }]}>
                            <Svg height="50%" width="15%" viewBox="0 0 125 100">
                                <Circle cx="50" cy="50" r="50" stroke={RED} strokeWidth="2.5" fill={RED} />
                            </Svg>
                            {`${unresolvedTitle}: ${unresolvedCount}`}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    chartContainer: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 60,
        marginLeft: 20,
    },
    stateContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    state: {
        flex: 1,
        flexDirection: 'row',
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
        color: "gray",
        marginBottom: 50
    },
});