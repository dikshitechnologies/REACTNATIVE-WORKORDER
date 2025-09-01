import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    Image,
    FlatList,
    Modal,
    TextInput,
    ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { BackHandler } from "react-native";

const dummyArtisans = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Alice Johnson" },
];

const dummyData = [
    {
        id: "1",
        product: "Ring",
        design: "Floral",
        sNo: "101",
        orderNo: "OD001",
        orderType: "Online",
        orderDate: "2025-08-01",
        weight: "5g",
        size: "6",
        balance: "2",
        purity: "18K",
        theme: "Classic",
        status: "Pending",
        image: require("../asserts/delivered.jpg"),
    },
    {
        id: "2",
        product: "Necklace",
        design: "Modern",
        sNo: "102",
        orderNo: "OD002",
        orderType: "Offline",
        orderDate: "2025-08-02",
        weight: "15g",
        size: "-",
        balance: "5",
        purity: "22K",
        theme: "Festive",
        status: "Pending",
        image: require("../asserts/delivered.jpg"),
    },
];

const AdminReports = () => {
    const [activeSection, setActiveSection] = useState(null);
    const [showArtisanModal, setShowArtisanModal] = useState(false);
    const [selectedArtisans, setSelectedArtisans] = useState([]);
    const [searchSNo, setSearchSNo] = useState("");
    const [expandedRow, setExpandedRow] = useState(null);
    const [tableData, setTableData] = useState(dummyData);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const [artisanSearch, setArtisanSearch] = useState("");


    // ✅ Derived: names to show in main input
    const selectedNames = dummyArtisans
        .filter((a) => selectedArtisans.includes(a.id))
        .map((a) => a.name)
        .join(", ");
    useEffect(() => {
        const backAction = () => {
            if (activeSection) {
                setActiveSection(null);
                return true;
            }
            return false;
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        return () => backHandler.remove();
    }, [activeSection]);

    const toggleRow = (id) => {
        if (selectedRows.includes(id)) {
            const newRows = selectedRows.filter((i) => i !== id);
            setSelectedRows(newRows);
            setSelectAll(newRows.length === tableData.length);
        } else {
            const newRows = [...selectedRows, id];
            setSelectedRows(newRows);
            setSelectAll(newRows.length === tableData.length);
        }
    };

    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedRows([]);
            setSelectAll(false);
        } else {
            const filteredIds = filteredData.map((item) => item.id);
            setSelectedRows(filteredIds);
            setSelectAll(true);
        }
    };

    const filteredData = tableData.filter(
        (item) =>
            (searchSNo === "" ||
                item.sNo.includes(searchSNo) ||
                item.design.toLowerCase().includes(searchSNo.toLowerCase())) &&
            (selectedArtisans.length === 0 || selectedArtisans.includes(item.id))
    );

    const updateData = () => alert("Data updated!");
    const clearSelection = () => {
        setSelectedRows([]);
        setSelectedArtisans([]);
        setSearchSNo("");
        setSelectAll(false);
    };

    const sections = [
        { id: "1", title: "Undelivered", icon: require("../asserts/undelivered.jpg") },
        { id: "2", title: "Delivered", icon: require("../asserts/delivered.jpg") },

    ];

    const renderUndelivered = () => (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9f5" }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setActiveSection(null)}>
                    <Ionicons name="arrow-undo" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Undelivered</Text>
                <View style={{ width: 30 }} />
            </View>

            {/* Artisan Selection */}
            <View style={{ padding: 12 }}>
                <TouchableOpacity onPress={() => setShowArtisanModal(true)}>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: "#ccc",
                            padding: 10,
                            borderRadius: 10,
                            color: "#000"
                        }}
                        placeholder="Select Artisan"
                        value={
                            selectedArtisans.length === 1
                                ? dummyArtisans.find((a) => a.id === selectedArtisans[0])?.name
                                : ""
                        }
                        editable={false} // prevents keyboard from showing
                        pointerEvents="none" // ensures TouchableOpacity handles the touch
                    />
                </TouchableOpacity>

            </View>

            {/* Search S.No / Design */}
            <View style={{ paddingHorizontal: 12, marginBottom: 12 }}>
                <TextInput
                    style={{
                        borderWidth: 1,
                        borderColor: "#ccc",
                        padding: 10,
                        borderRadius: 10,
                    }}
                    placeholder="Search S.No / Design"
                    value={searchSNo}
                    onChangeText={setSearchSNo}
                />
            </View>

            {/* Artisan Modal */}
            {/* Artisan Modal */}
            <Modal visible={showArtisanModal} transparent animationType="slide">
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        justifyContent: "center",
                        padding: 20,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: "#fff",
                            borderRadius: 16,
                            padding: 20,
                            maxHeight: "80%",
                        }}
                    >
                        {/* Header with Title & Close Button */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 12,
                            }}
                        >
                            <Text style={{ fontSize: 18, fontWeight: "700" }}>Select Artisan</Text>
                            <TouchableOpacity onPress={() => setShowArtisanModal(false)}>
                                <Ionicons name="close" size={28} />
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                padding: 10,
                                borderRadius: 10,
                                marginBottom: 10,
                            }}
                            placeholder="Search Artisan"
                            value={artisanSearch || ""}
                            onChangeText={(text) => setArtisanSearch(text)}
                        />

                        <ScrollView style={{ marginBottom: 12 }}>
                            {/* Select All Option */}
                            <TouchableOpacity
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingVertical: 10,
                                }}
                                onPress={() => {
                                    if (selectedArtisans.length === dummyArtisans.length) {
                                        setSelectedArtisans([]);
                                    } else {
                                        setSelectedArtisans(dummyArtisans.map((a) => a.id));
                                    }
                                }}
                            >
                                <Ionicons
                                    name={
                                        selectedArtisans.length === dummyArtisans.length
                                            ? "checkbox"
                                            : "square-outline"
                                    }
                                    size={22}
                                    color="#2d531a"
                                />
                                <Text style={{ fontSize: 16, marginLeft: 8, color: "#2d531a" }}>
                                    Select All
                                </Text>
                            </TouchableOpacity>

                            {/* Filtered Artisan List */}
                            {dummyArtisans
                                .filter((a) =>
                                    a.name.toLowerCase().includes((artisanSearch || "").toLowerCase())
                                )
                                .map((artisan) => (
                                    <TouchableOpacity
                                        key={artisan.id}
                                        style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}
                                        onPress={() => {
                                            if (selectedArtisans.includes(artisan.id)) {
                                                setSelectedArtisans(
                                                    selectedArtisans.filter((id) => id !== artisan.id)
                                                );
                                            } else {
                                                setSelectedArtisans([...selectedArtisans, artisan.id]);
                                            }
                                        }}
                                    >
                                        <Ionicons
                                            name={
                                                selectedArtisans.includes(artisan.id)
                                                    ? "checkbox"
                                                    : "square-outline"
                                            }
                                            size={22}
                                            color="#2d531a"
                                        />
                                        <Text style={{ fontSize: 16, marginLeft: 8, color: "#2d531a" }}>
                                            {artisan.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                        </ScrollView>

                        {/* Footer Buttons */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    backgroundColor: "rgba(120, 3, 3, 1)",
                                    borderRadius: 10,
                                    marginRight: 8,
                                    alignItems: "center",
                                }}
                                onPress={() => setSelectedArtisans([])}
                            >
                                <Text style={{ color: "#fff", fontWeight: "600" }}>Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    padding: 12,
                                    backgroundColor: "#2d531a",
                                    borderRadius: 10,
                                    marginLeft: 8,
                                    alignItems: "center",
                                }}
                                onPress={() => setShowArtisanModal(false)}
                            >
                                <Text style={{ color: "#fff", fontWeight: "600" }}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            {/* Table or Placeholder */}
            {selectedArtisans.length > 0 && filteredData.length > 0 ? (
                <ScrollView horizontal style={{ marginBottom: 80 }}>
                    <View style={{ flex: 1 }}>
                        {/* Select All */}
                        <View style={{ flexDirection: "row", alignItems: "center", padding: 8 }}>
                            <TouchableOpacity style={{ width: 50 }} onPress={toggleSelectAll}>
                                <Ionicons name={selectAll ? "checkbox" : "square-outline"} size={24} color="#2d531a" />
                            </TouchableOpacity>
                            <Text>Select All</Text>
                        </View>

                        {/* Table Header */}
                        <View style={{ flexDirection: "row", backgroundColor: "#ccc", padding: 8 }}>
                            <Text style={{ width: 50, fontWeight: "700" }}>Select</Text>
                            <Text style={{ width: 30, fontWeight: "700" }}>#</Text>
                            <Text style={{ width: 100, fontWeight: "700" }}>Product</Text>
                            <Text style={{ width: 100, fontWeight: "700" }}>Design</Text>
                            <Text style={{ width: 80, fontWeight: "700" }}>S.No</Text>
                            <Text style={{ width: 50, fontWeight: "700" }}>View</Text>
                        </View>

                        {filteredData.map((item, index) => (
                            <View key={item.id} style={{ borderBottomWidth: 1, borderColor: "#ccc" }}>
                                <View style={{ flexDirection: "row", padding: 8, alignItems: "center" }}>
                                    <TouchableOpacity style={{ width: 50 }} onPress={() => toggleRow(item.id)}>
                                        <Ionicons
                                            name={selectedRows.includes(item.id) ? "checkbox" : "square-outline"}
                                            size={24}
                                            color="#2d531a"
                                        />
                                    </TouchableOpacity>
                                    <Text style={{ width: 30 }}>{index + 1}</Text>
                                    <Text style={{ width: 100 }}>{item.product}</Text>
                                    <Text style={{ width: 100 }}>{item.design}</Text>
                                    <Text style={{ width: 80 }}>{item.sNo}</Text>
                                    <TouchableOpacity
                                        style={{ width: 50 }}
                                        onPress={() =>
                                            setExpandedRow(expandedRow === item.id ? null : item.id)
                                        }
                                    >
                                        <Ionicons
                                            name={expandedRow === item.id ? "eye-off" : "eye"}
                                            size={24}
                                            color="#2d531a"
                                        />
                                    </TouchableOpacity>

                                </View>

                                {expandedRow === item.id && (
                                    <View style={{ padding: 12, backgroundColor: "#eaf5ea" }}>
                                        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>

                                            {/* Left side texts */}
                                            <View style={{ flexShrink: 1, maxWidth: "65%", paddingRight: 12 }}>
                                                <Text style={{ fontWeight: "bold" }}>Order No: <Text style={{ fontWeight: "normal" }}>{item.orderNo}</Text></Text>
                                                <Text style={{ fontWeight: "bold" }}>Order Type: <Text style={{ fontWeight: "normal" }}>{item.orderType}</Text></Text>
                                                <Text style={{ fontWeight: "bold" }}>Order Date: <Text style={{ fontWeight: "normal" }}>{item.orderDate}</Text></Text>
                                                <Text style={{ fontWeight: "bold" }}>Product: <Text style={{ fontWeight: "normal" }}>{item.product}</Text></Text>
                                                <Text style={{ fontWeight: "bold" }}>Design: <Text style={{ fontWeight: "normal" }}>{item.design}</Text></Text>
                                                <Text style={{ fontWeight: "bold" }}>Weight: <Text style={{ fontWeight: "normal" }}>{item.weight}</Text></Text>
                                                <Text style={{ fontWeight: "bold" }}>Size: <Text style={{ fontWeight: "normal" }}>{item.size}</Text></Text>
                                                <Text style={{ fontWeight: "bold" }}>Balance: <Text style={{ fontWeight: "normal" }}>{item.balance}</Text></Text>
                                                <Text style={{ fontWeight: "bold" }}>Purity: <Text style={{ fontWeight: "normal" }}>{item.purity}</Text></Text>
                                                <Text style={{ fontWeight: "bold" }}>Theme: <Text style={{ fontWeight: "normal" }}>{item.theme}</Text></Text>
                                                <Text style={{ fontWeight: "bold" }}>S.No: <Text style={{ fontWeight: "normal" }}>{item.sNo}</Text></Text>
                                                <Text style={{ fontWeight: "bold" }}>Status: <Text style={{ fontWeight: "normal" }}>{item.status}</Text></Text>
                                            </View>

                                            {/* Right side image */}
                                            <View style={{ width: 200, height: 200, borderWidth: 1, borderColor: "#ccc", borderRadius: 12, overflow: "hidden" }}>
                                                <Image
                                                    source={item.image}
                                                    style={{ width: "100%", height: "100%", resizeMode: "contain" }}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                )}



                            </View>
                        ))}
                    </View>
                </ScrollView>
            ) : (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
                    <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
                        No data available. Select an artisan and/or search S.No or Design to view the table.
                    </Text>
                </View>
            )}

            {/* Fixed Footer Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
                    <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.updateButton} onPress={updateData}>
                    <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

    const renderSectionScreen = () => {
        if (activeSection === "Undelivered") return renderUndelivered();

        return (
            <View style={styles.sectionContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setActiveSection(null)}>
                        <Ionicons name="arrow-undo" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{activeSection}</Text>
                    <View style={{ width: 30 }} />
                </View>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text style={styles.sectionText}>You are in {activeSection} Section</Text>
                </View>
            </View>
        );
    };

    if (activeSection) return renderSectionScreen();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Ionicons name="arrow-undo" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Admin Reports</Text>
                <View style={{ width: 30 }} />
            </View>

            <Image source={require("../asserts/Admin.jpg")} style={styles.banner} resizeMode="cover" />

            <FlatList
                data={sections}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.gridContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} onPress={() => setActiveSection(item.title)}>
                        {item.icon && <Image source={item.icon} style={styles.cardImage} resizeMode="contain" />}
                        <Text style={styles.cardText}>{item.title}</Text>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
};

export default AdminReports;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9f5" },
    header: { flexDirection: "row", alignItems: "center", backgroundColor: "#2d531a", paddingVertical: 18, paddingHorizontal: 16, justifyContent: "space-between", borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
    backButton: { padding: 6 },
    headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700", textAlign: "center", flex: 1 },
    banner: { width: "90%", height: 200, borderRadius: 20, alignSelf: "center", marginVertical: 16 },
    gridContainer: { paddingHorizontal: 12 },
    row: { justifyContent: "space-between", marginBottom: 14 },
    card: { flex: 1, backgroundColor: "#fff", margin: 6, borderRadius: 16, paddingVertical: 20, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 3 }, shadowRadius: 5, elevation: 4 },
    cardImage: { width: 60, height: 60, marginBottom: 8 },
    cardText: { fontSize: 15, fontWeight: "600", color: "#2d531a", textAlign: "center" },
    sectionContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
    sectionText: { fontSize: 22, fontWeight: "700", color: "#2d531a" },
    footer: { flexDirection: "row", position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: "#f8f9f5" },
    clearButton: { backgroundColor: "rgba(120, 3, 3, 1)", padding: 16, borderRadius: 10, flex: 1, marginRight: 8, alignItems: "center" },
    updateButton: { backgroundColor: "#2d531a", padding: 16, borderRadius: 10, flex: 1, marginLeft: 8, alignItems: "center" },
    buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
