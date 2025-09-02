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
import axios from "axios";
import { BASE_URL, IMG_URL } from "./Links";   // ✅ include IMG_URL

import GifImage from 'react-native-gif';
const AdminReports = ({ navigation }) => {
    const [activeSection, setActiveSection] = useState(null);
    const [showArtisanModal, setShowArtisanModal] = useState(false);
    const [selectedArtisans, setSelectedArtisans] = useState([]);
    const [searchSNo, setSearchSNo] = useState("");
    const [expandedRow, setExpandedRow] = useState(null);
    const [tableData, setTableData] = useState([]);  // ✅ start empty
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [artisans, setArtisans] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [artisanSearch, setArtisanSearch] = useState("");

    // ✅ Fallback image component
    const FallbackImage = ({ fileName, style }) => {
        const [uriIndex, setUriIndex] = useState(0);
        const extensions = [".jpg", ".jpeg", ".png"];
        const sources = extensions.map((ext) => `${IMG_URL}${fileName}${ext}`);

        return (
            <Image
                source={{ uri: sources[uriIndex] }}
                style={style}
                resizeMode="contain"
                onError={() => {
                    if (uriIndex < sources.length - 1) {
                        setUriIndex(uriIndex + 1);
                    } else {
                        console.log("No valid image found for", fileName);
                    }
                }}
            />
        );
    };

    // ✅ Fetch artisan list
    useEffect(() => {
        fetchArtisans(1);
    }, []);
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (selectedArtisans.length > 0) {   // ✅ only fetch when artisan(s) selected
                setPageNumber(1);
                const codes = artisans
                    .filter((a) => selectedArtisans.includes(a.id))
                    .map((a) => a.code);
                fetchPendingOrders(codes, 1, searchSNo);
            } else {
                setTableData([]); // ✅ keep it empty
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchSNo, selectedArtisans]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setPageNumber(1);
            fetchArtisans(1, artisanSearch);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [artisanSearch]);

    const fetchArtisans = async (page = 1, search = "") => {
        if (loading || (page !== 1 && !hasMore)) return;
        setLoading(true);
        try {
            const res = await fetch(
                `${BASE_URL}Party/GetPartyList?search=${search}&pageNumber=${page}&pageSize=30`
            );
            const data = await res.json();
            if (data && data.data) {
                const mapped = data.data.map((item, index) => ({
                    id: `${page}-${index}`,
                    code: item.fCode,
                    name: item.fAcname,
                }));
                if (page === 1) {
                    setArtisans(mapped);
                } else {
                    setArtisans((prev) => [...prev, ...mapped]);
                }
                const total = data.totalRecords || 0;
                const alreadyLoaded = page * 30;
                setHasMore(alreadyLoaded < total);
            }
        } catch (err) {
            console.error("Error fetching artisans:", err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch pending orders for artisans
    const fetchPendingOrders = async (selectedCodes, page = 1, search = "") => {
        if (!selectedCodes || selectedCodes.length === 0) return;

        try {
            const cusCodes = selectedCodes.map((c) => `cusCodes=${c}`).join("&");
            const res = await axios.get(
                `${BASE_URL}ItemTransaction/GetPendingAdmin?${cusCodes}&search=${search}&pageNumber=${page}&pageSize=30`
            );

            if (res.data) {
                const mapped = res.data.map((item, index) => ({
                    id: `${page}-${index}`,
                    issueNo: item.fIssueNo,
                    transaId: item.fTransaId,
                    product: item.fProduct,
                    design: item.fDesign,
                    orderNo: item.fOrderNo,
                    orderType: item.fOrderType,
                    orderDate: item.fOrderDate,
                    weight: item.fWeight,
                    size: item.fSize,
                    qty: item.fQty,
                    purity: item.fPurity,
                    theme: item.fTheme,
                    sNo: item.fSNo,
                    status: item.fConfirmStatus === "N" ? "Pending" : "Confirmed",
                }));

                if (page === 1) {
                    setTableData(mapped);
                } else {
                    setTableData((prev) => [...prev, ...mapped]);
                }

                // if less than 30 → no more pages
                setHasMore(mapped.length === 30);
            }
        } catch (err) {
            console.error("Error fetching pending orders:", err);
        }
    };


    // ✅ Hardware back button
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

    // ✅ Table selection
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

    // ✅ Only filter by S.No / Design
    const filteredData = tableData.filter(
        (item) =>
            searchSNo === "" ||
            item.sNo.includes(searchSNo) ||
            item.design.toLowerCase().includes(searchSNo.toLowerCase())
    );

    // ✅ Update payload will use hidden fields
    // ✅ Update payload will use hidden fields
    const updateData = async () => {
        if (selectedRows.length === 0) {
            alert("Please select at least one row.");
            return;
        }

        const payload = selectedRows.map((id) => {
            const row = tableData.find((r) => r.id === id);
            return {
                issueNo: row.issueNo,   // from API
                sno: row.sNo,           // from API
                transId: row.transaId   // from API
            };
        });

        console.log("Update payload:", payload);

        try {
            const res = await axios.put(
                `${BASE_URL}ItemTransaction/UpdateConfirmStatus`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (res.status === 200) {
                alert("Update successful!");
                clearSelection();
                // Optionally refresh table
                const codes = artisans
                    .filter((a) => selectedArtisans.includes(a.id))
                    .map((a) => a.code);
                fetchPendingOrders(codes, 1, searchSNo);


            } else {
                alert("Update failed. Please try again.");
            }
        } catch (err) {
            console.error("Error updating data:", err);
            alert("Error while updating data.");
        }
    };


    const clearSelection = () => {
        setSelectedRows([]);
        setSelectedArtisans([]);
        setSearchSNo("");
        setArtisanSearch("");
        setSelectAll(false);
        setTableData([]);
        setPageNumber(1);
        setHasMore(true);
        setExpandedRow(null);
    };


    const sections = [
        { id: "1", title: "Undelivered", icon: require("../asserts/undelivered.jpg") },
        { id: "2", title: "Delivered", icon: require("../asserts/delivered.jpg") },
    ];

    // ✅ Render Undelivered Section
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
                            color: "#000",
                        }}
                        placeholder="Select Artisan"
                        value={
                            selectedArtisans.length === artisans.length
                                ? "Selected All"
                                : selectedArtisans
                                    .map((id) => {
                                        const artisan = artisans.find((a) => a.id === id);
                                        return artisan
                                            ? `${artisan.name} (${artisan.code})`
                                            : "";
                                    })
                                    .join(", ")
                        }
                        editable={false}
                        pointerEvents="none"
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
                        {/* Header */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 12,
                            }}
                        >
                            <Text style={{ fontSize: 18, fontWeight: "700" }}>
                                Select Artisan
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowArtisanModal(false)}
                            >
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

                        {/* Select All */}
                        <TouchableOpacity
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: 10,
                                borderBottomWidth: 1,
                                borderColor: "#eee",
                            }}
                            onPress={() => {
                                if (
                                    selectedArtisans.length === artisans.length
                                ) {
                                    setSelectedArtisans([]);
                                } else {
                                    setSelectedArtisans(
                                        artisans.map((a) => a.id)
                                    );
                                }
                            }}
                        >
                            <Ionicons
                                name={
                                    selectedArtisans.length === artisans.length
                                        ? "checkbox"
                                        : "square-outline"
                                }
                                size={22}
                                color="#2d531a"
                            />
                            <Text
                                style={{
                                    fontSize: 16,
                                    marginLeft: 8,
                                    color: "#2d531a",
                                }}
                            >
                                Select All
                            </Text>
                        </TouchableOpacity>

                        {/* Artisan List */}
                        <FlatList
                            data={artisans}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item: artisan }) => (
                                <TouchableOpacity
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        paddingVertical: 10,
                                    }}
                                    onPress={() => {
                                        if (
                                            selectedArtisans.includes(
                                                artisan.id
                                            )
                                        ) {
                                            setSelectedArtisans(
                                                selectedArtisans.filter(
                                                    (id) => id !== artisan.id
                                                )
                                            );
                                        } else {
                                            setSelectedArtisans([
                                                ...selectedArtisans,
                                                artisan.id,
                                            ]);
                                        }
                                    }}
                                >
                                    <Ionicons
                                        name={
                                            selectedArtisans.includes(
                                                artisan.id
                                            )
                                                ? "checkbox"
                                                : "square-outline"
                                        }
                                        size={22}
                                        color="#2d531a"
                                    />
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            marginLeft: 8,
                                            color: "#2d531a",
                                        }}
                                    >
                                        {artisan.name} ({artisan.code})
                                    </Text>
                                </TouchableOpacity>
                            )}
                            onEndReached={() => {
                                if (!loading && hasMore) {
                                    const nextPage = pageNumber + 1;
                                    setPageNumber(nextPage);
                                    fetchArtisans(nextPage, artisanSearch);
                                }
                            }}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={
                                loading ? (
                                    <Text
                                        style={{
                                            textAlign: "center",
                                            padding: 10,
                                        }}
                                    >
                                        Loading...
                                    </Text>
                                ) : null
                            }
                        />

                        {/* Footer Buttons */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={() => {
                                    setSelectedArtisans([]);
                                    setArtisanSearch("");
                                }}
                            >
                                <Text style={{ color: "#fff", fontWeight: "600" }}>
                                    Clear
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.updateButton}
                                onPress={() => {
                                    setShowArtisanModal(false);
                                    const codes = artisans
                                        .filter((a) =>
                                            selectedArtisans.includes(a.id)
                                        )
                                        .map((a) => a.code);
                                    fetchPendingOrders(codes);
                                }}
                            >
                                <Text style={{ color: "#fff", fontWeight: "600" }}>
                                    Apply
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Table */}
            {tableData.length > 0 ? (
                <ScrollView horizontal style={{ marginBottom: 80 }}>
                    <View style={{ flex: 1 }}>
                        {/* Select All */}
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                padding: 8,
                            }}
                        >
                            <TouchableOpacity style={{ width: 50 }} onPress={toggleSelectAll}>
                                <Ionicons
                                    name={selectAll ? "checkbox" : "square-outline"}
                                    size={24}
                                    color="#2d531a"
                                />
                            </TouchableOpacity>
                            <Text>Select All</Text>
                        </View>

                        {/* Table Header */}
                        <View
                            style={{
                                flexDirection: "row",
                                backgroundColor: "#ccc",
                                padding: 8,
                            }}
                        >
                            <Text style={{ width: 50, fontWeight: "700" }}>Select</Text>
                            <Text style={{ width: 30, fontWeight: "700" }}>#</Text>
                            <Text style={{ width: 100, fontWeight: "700" }}>Product</Text>
                            <Text style={{ width: 100, fontWeight: "700" }}>Design</Text>
                            <Text style={{ width: 80, fontWeight: "700" }}>S.No</Text>
                            <Text style={{ width: 50, fontWeight: "700" }}>View</Text>
                        </View>

                        {/* ✅ FlatList with pagination + empty state */}
                        <FlatList
                            data={filteredData}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item, index }) => (
                                <View style={{ borderBottomWidth: 1, borderColor: "#ccc" }}>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            padding: 8,
                                            alignItems: "center",
                                        }}
                                    >
                                        <TouchableOpacity
                                            style={{ width: 50 }}
                                            onPress={() => toggleRow(item.id)}
                                        >
                                            <Ionicons
                                                name={
                                                    selectedRows.includes(item.id)
                                                        ? "checkbox"
                                                        : "square-outline"
                                                }
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
                                                setExpandedRow(
                                                    expandedRow === item.id ? null : item.id
                                                )
                                            }
                                        >
                                            <Ionicons
                                                name={expandedRow === item.id ? "eye-off" : "eye"}
                                                size={24}
                                                color="#2d531a"
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Expanded Row */}
                                    {expandedRow === item.id && (
                                        <View
                                            style={{
                                                padding: 12,
                                                backgroundColor: "#eaf5ea",
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "flex-start",
                                                }}
                                            >
                                                {/* Left details */}
                                                <View
                                                    style={{
                                                        flexShrink: 1,
                                                        maxWidth: "65%",
                                                        paddingRight: 12,
                                                    }}
                                                >
                                                    <Text>
                                                        <Text style={{ fontWeight: "bold" }}>
                                                            Order No:{" "}
                                                        </Text>
                                                        {item.orderNo}
                                                    </Text>
                                                    <Text>
                                                        <Text style={{ fontWeight: "bold" }}>
                                                            Order Type:{" "}
                                                        </Text>
                                                        {item.orderType}
                                                    </Text>
                                                    <Text>
                                                        <Text style={{ fontWeight: "bold" }}>
                                                            Order Date:{" "}
                                                        </Text>
                                                        {item.orderDate}
                                                    </Text>
                                                    <Text>
                                                        <Text style={{ fontWeight: "bold" }}>
                                                            Product:{" "}
                                                        </Text>
                                                        {item.product}
                                                    </Text>
                                                    <Text>
                                                        <Text style={{ fontWeight: "bold" }}>
                                                            Design:{" "}
                                                        </Text>
                                                        {item.design}
                                                    </Text>
                                                    <Text>
                                                        <Text style={{ fontWeight: "bold" }}>
                                                            Weight:{" "}
                                                        </Text>
                                                        {item.weight}
                                                    </Text>
                                                    <Text>
                                                        <Text style={{ fontWeight: "bold" }}>
                                                            Size:{" "}
                                                        </Text>
                                                        {item.size}
                                                    </Text>
                                                    <Text>
                                                        <Text style={{ fontWeight: "bold" }}>
                                                            Qty:{" "}
                                                        </Text>
                                                        {item.qty}
                                                    </Text>
                                                    <Text>
                                                        <Text style={{ fontWeight: "bold" }}>
                                                            Purity:{" "}
                                                        </Text>
                                                        {item.purity}
                                                    </Text>
                                                    <Text>
                                                        <Text style={{ fontWeight: "bold" }}>
                                                            Theme:{" "}
                                                        </Text>
                                                        {item.theme}
                                                    </Text>
                                                    <Text>
                                                        <Text style={{ fontWeight: "bold" }}>
                                                            Status:{" "}
                                                        </Text>
                                                        {item.status}
                                                    </Text>
                                                </View>

                                                {/* Right image */}
                                                <View
                                                    style={{
                                                        width: 200,
                                                        height: 200,
                                                        borderWidth: 1,
                                                        borderColor: "#ccc",
                                                        borderRadius: 12,
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <FallbackImage
                                                        fileName={item.design}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}
                            showsVerticalScrollIndicator
                            style={{ maxHeight: 500 }}
                            onEndReached={() => {
                                if (!loading && hasMore) {
                                    const nextPage = pageNumber + 1;
                                    setPageNumber(nextPage);
                                    const codes = artisans
                                        .filter((a) => selectedArtisans.includes(a.id))
                                        .map((a) => a.code);
                                    fetchPendingOrders(codes, nextPage, searchSNo);
                                }
                            }}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={
                                loading ? (
                                    <Text style={{ textAlign: "center", padding: 10 }}>
                                        Loading...
                                    </Text>
                                ) : null
                            }
                            ListEmptyComponent={
                                !loading ? (
                                    <View
                                        style={{
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: 20,
                                        }}
                                    >
                                        <Image
                                            source={require("../asserts/Search.png")} // 👈 replace with your image path
                                            style={{
                                                width: 180,
                                                height: 180,
                                                marginBottom: 16, // space between image and text
                                                resizeMode: "contain",
                                            }}
                                        />
                                        <Text
                                            style={{
                                                textAlign: "center",
                                                color: "#666",
                                                fontSize: 16,
                                            }}
                                        >
                                            No data available. Select an artisan and/or search S.No or Design to view.
                                        </Text>
                                    </View>
                                ) : null
                            }
                        />
                    </View>
                </ScrollView>
            ) : (
                // optional: you can completely remove this else block
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 20,
                    }}
                >
                    <Image
                        source={require("../asserts/Search.png")} // 👈 replace with your image path
                        style={{
                            width: 180,
                            height: 180,
                            marginBottom: 16, // space between image and text
                            resizeMode: "contain",
                        }}
                    />
                    <Text
                        style={{
                            fontSize: 16,
                            color: "#666",
                            textAlign: "center",
                        }}
                    >
                        No data available. Select an artisan and/or search S.No or Design to view the table.
                    </Text>
                </View>
            )}



            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearSelection}
                >
                    <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={updateData}
                >
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
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Text style={styles.sectionText}>
                        You are in {activeSection} Section
                    </Text>
                </View>
            </View>
        );
    };

    if (activeSection) return renderSectionScreen();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate("Login")}
                >
                    <Ionicons name="arrow-undo" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Admin Reports</Text>
                <View style={{ width: 30 }} />
            </View>

            <Image
                source={require("../asserts/Admin.png")}
                style={styles.banner}
                resizeMode="cover"
            />

            <FlatList
                data={sections}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.gridContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => setActiveSection(item.title)}
                    >
                        {item.icon && (
                            <Image
                                source={item.icon}
                                style={styles.cardImage}
                                resizeMode="contain"
                            />
                        )}
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2d531a",
        paddingVertical: 18,
        paddingHorizontal: 16,
        justifyContent: "space-between",
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    backButton: { padding: 6 },
    headerTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
        flex: 1,
    },
    banner: {
        width: "90%",
        height: 200,
        borderRadius: 20,
        alignSelf: "center",
        marginVertical: 16,
    },
    gridContainer: { paddingHorizontal: 12 },
    row: { justifyContent: "space-between", marginBottom: 14 },
    card: {
        flex: 1,
        backgroundColor: "#fff",
        margin: 6,
        borderRadius: 16,
        paddingVertical: 20,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 4,
    },
    cardImage: { width: 60, height: 60, marginBottom: 8 },
    cardText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#2d531a",
        textAlign: "center",
    },
    sectionContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
    sectionText: { fontSize: 22, fontWeight: "700", color: "#2d531a" },
    footer: {
        flexDirection: "row",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: "#f8f9f5",
    },
    clearButton: {
        backgroundColor: "rgba(120, 3, 3, 1)",
        padding: 16,
        borderRadius: 10,
        flex: 1,
        marginRight: 8,
        alignItems: "center",
    },
    updateButton: {
        backgroundColor: "#2d531a",
        padding: 16,
        borderRadius: 10,
        flex: 1,
        marginLeft: 8,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
