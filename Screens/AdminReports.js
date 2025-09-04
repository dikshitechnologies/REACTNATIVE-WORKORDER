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
    Alert,
    KeyboardAvoidingView,
    ScrollView,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React, { useState, useEffect } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { BackHandler } from "react-native";
import axios from "axios";
import { BASE_URL, IMG_URL } from "./Links";   // ✅ include IMG_URL
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import ImageViewer from "react-native-image-zoom-viewer";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
import DeviceInfo from "react-native-device-info";

const isTablet = DeviceInfo.isTablet();
// A common threshold for tablets

const AdminReports = ({ navigation }) => {
    const [partyName, setPartyName] = useState("");
    const [phoneWarning, setPhoneWarning] = useState("");


    const [phone, setPhone] = useState("");


    const [selectedPartyCode, setSelectedPartyCode] = useState(null);

    // Modal states
    const [showPartyModal, setShowPartyModal] = useState(false);
    const [partySearch, setPartySearch] = useState("");

    const clearForm = () => {
        setPartyName("");
        setPhoneWarning("");
        setPhone("");

    };

    const updateForm = async () => {
        if (!selectedPartyCode) {
            Alert.alert("Validation", "Please select a Party first");
            return;
        }
        if (!phone) {
            Alert.alert("Validation", "Please enter a phone number");
            return;
        }
        if (phone.length !== 10) {
            Alert.alert("Validation", "Phone number must be exactly 10 digits");
            return;
        }

        try {
            const res = await axios.put(
                `${BASE_URL}Party/UpdatePhone?fCode=${selectedPartyCode}&phone=${phone}`
            );

            if (res.status === 200) {
                Alert.alert("Success", "Phone updated successfully!");

                // ✅ Clear form after success
                setPartyName("");
                setSelectedPartyCode(null);
                setPhone("");
                setPhoneWarning("");
            } else {
                Alert.alert("Error", "Failed to update phone number");
            }
        } catch (err) {
            console.error("Update error:", err);
            Alert.alert("Error", "Something went wrong");
        }
    };


    const [activeSection, setActiveSection] = useState(null);
    const [showArtisanModal, setShowArtisanModal] = useState(false);
    const [selectedArtisans, setSelectedArtisans] = useState([]);
    const [searchSNo, setSearchSNo] = useState("");
    const [validUrl, setValidUrl] = useState(null);

    const [expandedRow, setExpandedRow] = useState(null);
    const [tableData, setTableData] = useState([]);  // ✅ start empty
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [artisans, setArtisans] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [artisanSearch, setArtisanSearch] = useState("");
    // States for Return
    const [returnShowArtisanModal, setReturnShowArtisanModal] = useState(false);
    const [returnSelectedArtisans, setReturnSelectedArtisans] = useState([]);
    const [returnSearchSNo, setReturnSearchSNo] = useState("");
    const [returnExpandedRow, setReturnExpandedRow] = useState(null);
    const [returnTableData, setReturnTableData] = useState([]);
    const [returnSelectedRows, setReturnSelectedRows] = useState([]);
    const [returnSelectAll, setReturnSelectAll] = useState(false);
    const [returnPageNumber, setReturnPageNumber] = useState(1);
    const [returnLoading, setReturnLoading] = useState(false);
    const [returnHasMore, setReturnHasMore] = useState(true);
    const [returnArtisanSearch, setReturnArtisanSearch] = useState("");
    const [deliveredShowArtisanModal, setDeliveredShowArtisanModal] = useState(false);
    const [deliveredSelectedArtisans, setDeliveredSelectedArtisans] = useState([]);
    const [deliveredSearchSNo, setDeliveredSearchSNo] = useState("");
    const [deliveredExpandedRow, setDeliveredExpandedRow] = useState(null);
    const [deliveredTableData, setDeliveredTableData] = useState([]);
    const [deliveredSelectedRows, setDeliveredSelectedRows] = useState([]);
    const [deliveredSelectAll, setDeliveredSelectAll] = useState(false);
    const [deliveredPageNumber, setDeliveredPageNumber] = useState(1);
    const [deliveredLoading, setDeliveredLoading] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState(null); // holds the fileName (design)

    const [deliveredHasMore, setDeliveredHasMore] = useState(true);
    const [deliveredArtisanSearch, setDeliveredArtisanSearch] = useState("");
    // ✅ Fallback image component
    const renderUserCreation = () => {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9f5" }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setActiveSection(null)}>
                        <Ionicons name="arrow-undo" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>User Creation</Text>
                    <View style={{ width: 30 }} />
                </View>

                <KeyboardAwareScrollView
                    contentContainerStyle={{ padding: 16 }}
                    extraScrollHeight={60}
                    enableOnAndroid={true}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Card Container */}
                    <View
                        style={{
                            backgroundColor: "#fff",
                            borderRadius: 16,
                            padding: 20,
                            shadowColor: "#000",
                            shadowOpacity: 0.1,
                            shadowOffset: { width: 0, height: 2 },
                            shadowRadius: 6,
                            elevation: 4,
                        }}
                    >
                        {/* Card Heading */}
                        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 15, color: "#2d531a" }}>
                            Add / Update Phone Number
                        </Text>

                        {/* Party Name with search icon */}
                        <Text style={{ marginBottom: 6 }}>Party Name</Text>
                        <TouchableOpacity onPress={() => setShowPartyModal(true)}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                                    placeholder="Select Party"
                                    placeholderTextColor="#7c7c7c"
                                    value={partyName}
                                    editable={false}
                                    pointerEvents="none"
                                />
                                <Ionicons name="search" size={26} color="#7c7c7c" />
                            </View>
                        </TouchableOpacity>

                        {/* Phone Number */}



                        {phoneWarning ? (
                            <Text
                                style={{
                                    color: phone.includes("⚠️") ? "red" : "#2d531a", // red for missing, greenish for info
                                    marginBottom: 6,
                                }}
                            >
                                {phoneWarning}
                            </Text>
                        ) : null}
                        {/* Phone Number */}
                        <Text style={{ marginTop: 16, marginBottom: 6 }}>Phone No</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={(text) => {
                                // allow only numbers and max 10 digits
                                const cleaned = text.replace(/[^0-9]/g, "");
                                if (cleaned.length <= 10) {
                                    setPhone(cleaned);
                                }
                            }}
                            keyboardType="number-pad"
                            maxLength={10}  // 👈 ensures only 10 digits
                        />

                        {/* Buttons inside card */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginTop: 20,
                            }}
                        >
                            <TouchableOpacity style={styles.clearButton} onPress={clearForm}>
                                <Text style={styles.buttonText}>Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.updateButton} onPress={updateForm}>
                                <Text style={styles.buttonText}>Update</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAwareScrollView>

                {/* Party Modal (same as before) */}
                <Modal visible={showPartyModal} transparent animationType="slide">
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
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 12,
                                }}
                            >
                                <Text style={{ fontSize: 18, fontWeight: "700" }}>Select Party</Text>
                                <TouchableOpacity onPress={() => setShowPartyModal(false)}>
                                    <Ionicons name="close" size={28} />
                                </TouchableOpacity>
                            </View>

                            {/* Search input */}
                            <TextInput
                                style={styles.input}
                                placeholder="Search Party"
                                placeholderTextColor="#7c7c7c"
                                value={partySearch}
                                onChangeText={setPartySearch}
                            />

                            {/* Party List */}
                            <FlatList
                                data={artisans.filter((a) =>
                                    a.name.toLowerCase().includes(partySearch.toLowerCase())
                                )}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={{
                                            paddingVertical: 10,
                                            borderBottomWidth: 1,
                                            borderColor: "#eee",
                                        }}
                                        onPress={() => {
                                            setPartyName(item.name);
                                            setSelectedPartyCode(item.code);

                                            if (!item.phone || item.phone.trim() === "") {
                                                setPhone("");
                                                setPhoneWarning("⚠️ No phone number for this party, please enter a number.");
                                            } else {
                                                setPhone(item.phone);
                                                setPhoneWarning("ℹ️ Phone number already exists. Update if needed.");
                                            }

                                            setShowPartyModal(false);
                                        }}


                                    >
                                        <Text style={{ fontSize: 16, color: "#2d531a" }}>
                                            {item.name} ({item.code})
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        );
    };


    const returnUpdateData = async () => {
        if (returnSelectedRows.length === 0) {
            Alert.alert("Validation", "Please select at least one row to update");
            return;
        }

        try {
            const payload = returnTableData
                .filter(item => returnSelectedRows.includes(item.id))
                .map(item => ({
                    IssueNo: item.issueNo,   // 👈 PascalCase
                    SNo: item.sNo,
                    TransId: item.transId,
                }));

            console.log("Sending payload:", payload);

            const res = await fetch(`${BASE_URL}ItemTransaction/UpdateReturnStatus`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                Alert.alert("Success", "Return status updated successfully!");
                const codes = artisans
                    .filter((a) => returnSelectedArtisans.includes(a.id))
                    .map((a) => a.code);
                fetchReturnOrders(codes, 1, returnSearchSNo);
                setReturnSelectedRows([]);
            } else {
                const errText = await res.text();
                console.error("Update failed:", errText);
                Alert.alert("Error", errText || "Failed to update return status");
            }
        } catch (err) {
            console.error("Update error:", err);
            Alert.alert("Error", "Something went wrong");
        }
    };

    const fetchReturnOrders = async (codes = [], page = 1, search = "") => {
        try {
            setReturnLoading(true);

            const cusCodesQuery = codes.map(code => `cusCodes=${code}`).join("&");
            const url = `${BASE_URL}ItemTransaction/GetDeliveryAdmin?${cusCodesQuery}&search=${search}&pageNumber=${page}&pageSize=30`;

            const res = await fetch(url);
            const data = await res.json();

            if (Array.isArray(data)) {
                const mappedData = data.map((item, index) => ({
                    id: `${page}-${index}`,
                    issueNo: item.fIssueNo,
                    orderNo: item.fOrderNo,
                    orderType: item.fOrderType,
                    orderDate: item.fOrderDate,
                    product: item.fProduct,
                    design: item.fDesign,
                    weight: item.fWeight,
                    size: item.fSize,
                    qty: item.fQty,
                    purity: item.fPurity,
                    theme: item.fTheme,
                    status: item.fconfirmStatus === "Y" ? "Delivered" : "Undelivered",
                    sNo: item.fSNo,
                    transId: item.fTransaId,
                }));

                setReturnTableData(prev =>
                    page === 1 ? mappedData : [...prev, ...mappedData]
                );
                setReturnHasMore(mappedData.length === 30);
            }
        } catch (error) {
            console.error("Error fetching return orders:", error);
        } finally {
            setReturnLoading(false);
        }
    };
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (returnSelectedArtisans.length > 0) {
                setReturnPageNumber(1);
                const codes = artisans
                    .filter((a) => returnSelectedArtisans.includes(a.id))
                    .map((a) => a.code);
                fetchReturnOrders(codes, 1, returnSearchSNo);
            } else {
                setReturnTableData([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [returnSearchSNo, returnSelectedArtisans]);


    const FallbackImage = ({ fileName, style, onSuccess }) => {
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
                onLoad={() => {
                    if (onSuccess) onSuccess(sources[uriIndex]); // ✅ report back valid URL
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
                    phone: item.fphone,
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
                    status: item.fconfirmStatus === "N" ? "Undelivered" : "Delivered",
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
    const fetchDeliveredOrders = async (selectedCodes, page = 1, search = "") => {
        if (!selectedCodes || selectedCodes.length === 0) return;

        try {
            const cusCodes = selectedCodes.map((c) => `cusCodes=${c}`).join("&");
            const res = await axios.get(
                `${BASE_URL}ItemTransaction/GetDeliveryAdmin?${cusCodes}&search=${search}&pageNumber=${page}&pageSize=30`
            );
            console.log("Pending API sample:", res.data[0]);
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
                    status: item.fconfirmStatus === "Y" ? "Delivered" : "Undelivered",
                }));

                if (page === 1) {
                    setDeliveredTableData(mapped);   // 👈 FIXED
                } else {
                    setDeliveredTableData((prev) => [...prev, ...mapped]); // 👈 FIXED
                }

                setDeliveredHasMore(mapped.length === 30);
            }
        } catch (err) {
            console.error("Error fetching delivered orders:", err);
        }
    };



    // ✅ Hardware back button
    useEffect(() => {
        const backAction = () => {
            if (activeSection) {
                // If inside a section, go back to main instead of exit
                setActiveSection(null);
                return true;
            } else {
                // Show confirmation alert
                Alert.alert(
                    "Exit App",
                    "Are you sure you want to exit the app?",
                    [
                        {
                            text: "Cancel",
                            onPress: () => null,
                            style: "cancel",
                        },
                        {
                            text: "Yes",
                            onPress: () => {
                                navigation.replace("Login"); // Navigate to Login
                                BackHandler.exitApp();       // Exit app
                            },
                        },
                    ]
                );
                return true; // prevent default behavior
            }
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, [activeSection, navigation]);

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
        { id: "1", title: "User Creation", icon: require("../asserts/user.jpg") },
        { id: "2", title: "Pending", icon: require("../asserts/undelivered.jpg") },
        { id: "3", title: "Delivered", icon: require("../asserts/delivered.jpg") },
        { id: "4", title: "Return", icon: require("../asserts/return.jpg") },
    ];
    const deliveredFilteredData = deliveredTableData.filter(
        (item) =>
            deliveredSearchSNo === "" ||
            item.sNo?.toLowerCase().includes(deliveredSearchSNo.toLowerCase()) ||
            item.design?.toLowerCase().includes(deliveredSearchSNo.toLowerCase()) ||
            item.product?.toLowerCase().includes(deliveredSearchSNo.toLowerCase()) ||
            item.orderNo?.toLowerCase().includes(deliveredSearchSNo.toLowerCase())
    );
    const renderDelivered = () => (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9f5" }}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setActiveSection(null)}>
                    <Ionicons name="arrow-undo" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivered</Text>
                <View style={{ width: 30 }} />
            </View>

            {/* Fullscreen Image Viewer */}
            <Modal
                visible={!!fullscreenImage}
                transparent={true}
                onRequestClose={() => setFullscreenImage(null)}
            >
                <View style={{ flex: 1, backgroundColor: "#000" }}>
                    {/* Close Button */}
                    <TouchableOpacity
                        style={{
                            position: "absolute",
                            top: 40,
                            right: 20,
                            zIndex: 10,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            borderRadius: 20,
                            padding: 6,
                        }}
                        onPress={() => setFullscreenImage(null)}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>

                    {/* Image Viewer */}
                    <ImageViewer
                        imageUrls={[{ url: fullscreenImage }]}
                        enableSwipeDown
                        onSwipeDown={() => setFullscreenImage(null)}
                        onCancel={() => setFullscreenImage(null)}
                        saveToLocalByLongPress={false}
                    />
                </View>
            </Modal>

            {/* Artisan Selection */}
            <View style={{ padding: 12 }}>
                <TouchableOpacity onPress={() => setDeliveredShowArtisanModal(true)}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                padding: 10,
                                borderRadius: 10,
                                color: "#000",
                                width: isTablet ? wp("90%") : wp("85%"),
                                marginRight: 8,
                            }}
                            placeholderTextColor={"#7c7c7cff"}
                            placeholder="Select Artisan"
                            value={
                                deliveredSelectedArtisans.length === artisans.length
                                    ? "Selected All"
                                    : deliveredSelectedArtisans
                                        .map((id) => {
                                            const artisan = artisans.find((a) => a.id === id);
                                            return artisan ? `${artisan.name} (${artisan.code})` : "";
                                        })
                                        .join(", ")
                            }
                            editable={false}
                            pointerEvents="none"
                        />
                        <Ionicons name="search" size={26} color="#7c7c7c" />
                    </View>
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
                    placeholderTextColor={"#7c7c7cff"}
                    placeholder="Search S.No / Design / Product / Order No"
                    value={deliveredSearchSNo}
                    onChangeText={setDeliveredSearchSNo}
                />
            </View>

            {/* Artisan Modal */}
            <Modal visible={deliveredShowArtisanModal} transparent animationType="slide">
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
                                onPress={() => setDeliveredShowArtisanModal(false)}
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
                            placeholderTextColor={"#7c7c7cff"}
                            value={deliveredArtisanSearch || ""}
                            onChangeText={(text) => setDeliveredArtisanSearch(text)}
                        />

                        {/* Select All */}
                        {/* <TouchableOpacity
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: 10,
                                borderBottomWidth: 1,
                                borderColor: "#eee",
                            }}
                            onPress={() => {
                                if (deliveredSelectedArtisans.length === artisans.length) {
                                    setDeliveredSelectedArtisans([]);
                                } else {
                                    setDeliveredSelectedArtisans(artisans.map((a) => a.id));
                                }
                            }}
                        >
                            <Ionicons
                                name={
                                    deliveredSelectedArtisans.length === artisans.length
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
                        </TouchableOpacity> */}

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
                                        if (deliveredSelectedArtisans.includes(artisan.id)) {
                                            setDeliveredSelectedArtisans(
                                                deliveredSelectedArtisans.filter(
                                                    (id) => id !== artisan.id
                                                )
                                            );
                                        } else {
                                            setDeliveredSelectedArtisans([
                                                ...deliveredSelectedArtisans,
                                                artisan.id,
                                            ]);
                                        }
                                    }}
                                >
                                    <Ionicons
                                        name={
                                            deliveredSelectedArtisans.includes(artisan.id)
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
                                if (!deliveredLoading && deliveredHasMore) {
                                    const nextPage = deliveredPageNumber + 1;
                                    setDeliveredPageNumber(nextPage);
                                    fetchArtisans(nextPage, deliveredArtisanSearch);
                                }
                            }}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={
                                deliveredLoading ? (
                                    <Text style={{ textAlign: "center", padding: 10 }}>
                                        Loading...
                                    </Text>
                                ) : null
                            }
                        />

                        {/* Footer Buttons */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "flex-end",
                            }}
                        >
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={() => {
                                    setDeliveredSelectedArtisans([]);
                                    setDeliveredArtisanSearch("");
                                }}
                            >
                                <Text style={{ color: "#fff", fontWeight: "600" }}>Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.updateButton}
                                onPress={() => {
                                    setDeliveredShowArtisanModal(false);
                                    const codes = artisans
                                        .filter((a) =>
                                            deliveredSelectedArtisans.includes(a.id)
                                        )
                                        .map((a) => a.code);
                                    fetchDeliveredOrders(codes, 1, deliveredSearchSNo);
                                }}
                            >
                                <Text style={{ color: "#fff", fontWeight: "600" }}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Table */}
            {deliveredTableData.length > 0 ? (
                <ScrollView horizontal style={{ marginBottom: 80 }}>
                    <View style={{ flex: 1 }}>
                        {/* Table Header */}
                        <View
                            style={{
                                flexDirection: "row",
                                backgroundColor: "#ccc",
                                padding: 8,
                            }}
                        >
                            <Text style={{ width: wp("12%"), fontWeight: "700" }}>#</Text>
                            <Text style={{ width: wp("24%"), fontWeight: "700" }}>Product</Text>
                            <Text style={{ width: wp("24%"), fontWeight: "700" }}>Design</Text>
                            <Text style={{ width: wp("25%"), fontWeight: "700" }}>S.No</Text>
                            <Text style={{ width: wp("12%"), fontWeight: "700" }}>View</Text>
                        </View>

                        {/* Table Rows */}
                        <FlatList
                            data={deliveredFilteredData}
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
                                        <Text style={{ width: wp("12%") }}>{index + 1}</Text>
                                        <Text style={{ width: wp("24%") }}>{item.product}</Text>
                                        <Text style={{ width: wp("24%") }}>{item.design}</Text>
                                        <Text style={{ width: wp("25%") }}>{item.sNo}</Text>
                                        <TouchableOpacity
                                            style={{ width: wp("12%") }}
                                            onPress={() =>
                                                setDeliveredExpandedRow(
                                                    deliveredExpandedRow === item.id ? null : item.id
                                                )
                                            }
                                        >
                                            <Ionicons
                                                name={
                                                    deliveredExpandedRow === item.id
                                                        ? "eye-off"
                                                        : "eye"
                                                }
                                                size={24}
                                                color="#2d531a"
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Expanded Row */}
                                    {deliveredExpandedRow === item.id && (
                                        <View
                                            style={{
                                                padding: wp("3%"),
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
                                                        maxWidth: wp("65%"),
                                                        paddingRight: wp("3%"),
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
                                                        {new Date(item.orderDate).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                        })}
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
                                                <TouchableOpacity
                                                    onPress={() => setFullscreenImage(validUrl)}
                                                    style={{
                                                        width: wp("45%"),
                                                        height: hp("25%"),
                                                        borderWidth: 1,
                                                        borderColor: "#ccc",
                                                        borderRadius: wp("3%"),
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <FallbackImage
                                                        fileName={item.design}
                                                        style={{ width: "100%", height: "100%" }}
                                                        onSuccess={(url) => setValidUrl(url)}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}
                            showsVerticalScrollIndicator
                            style={{ maxHeight: 500 }}
                            onEndReached={() => {
                                if (!deliveredLoading && deliveredHasMore) {
                                    const nextPage = deliveredPageNumber + 1;
                                    setDeliveredPageNumber(nextPage);
                                    const codes = artisans
                                        .filter((a) =>
                                            deliveredSelectedArtisans.includes(a.id)
                                        )
                                        .map((a) => a.code);
                                    fetchDeliveredOrders(codes, nextPage, deliveredSearchSNo);
                                }
                            }}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={
                                deliveredLoading ? (
                                    <Text style={{ textAlign: "center", padding: 10 }}>
                                        Loading...
                                    </Text>
                                ) : null
                            }
                            ListEmptyComponent={
                                !deliveredLoading ? (
                                    <View
                                        style={{
                                            flex: 1,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: 20,
                                        }}
                                    >
                                        <Image
                                            source={require("../asserts/Search.png")}
                                            style={{
                                                width: 180,
                                                height: 180,
                                                marginBottom: 16,
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
                                            Select an artisan and/or search S.No or Design or
                                            Product or Order No to view the table.
                                        </Text>
                                    </View>
                                ) : null
                            }
                        />
                    </View>
                </ScrollView>
            ) : (
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 20,
                    }}
                >
                    <Image
                        source={require("../asserts/Search.png")}
                        style={{
                            width: 180,
                            height: 180,
                            marginBottom: 16,
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
                        Select an artisan and/or search S.No or Design or Product or Order
                        No to view the table.
                    </Text>
                </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => {
                        setDeliveredSelectedArtisans([]);
                        setDeliveredSearchSNo("");
                        setDeliveredArtisanSearch("");
                        setDeliveredTableData([]);
                        setDeliveredPageNumber(1);
                        setDeliveredHasMore(true);
                        setDeliveredExpandedRow(null);
                    }}
                >
                    <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );


    // ✅ Render Undelivered Section
    const renderUndelivered = () => (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9f5" }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setActiveSection(null)}>
                    <Ionicons name="arrow-undo" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pending</Text>
                <View style={{ width: 30 }} />
            </View>
            <Modal visible={!!fullscreenImage} transparent={true} onRequestClose={() => setFullscreenImage(null)}>
                <View style={{ flex: 1, backgroundColor: "#000" }}>
                    {/* Close Button */}
                    <TouchableOpacity
                        style={{
                            position: "absolute",
                            top: 40,
                            right: 20,
                            zIndex: 10,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            borderRadius: 20,
                            padding: 6,
                        }}
                        onPress={() => setFullscreenImage(null)}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>

                    {/* Image Viewer */}
                    <ImageViewer
                        imageUrls={[{ url: fullscreenImage }]}
                        enableSwipeDown
                        onSwipeDown={() => setFullscreenImage(null)}
                        onCancel={() => setFullscreenImage(null)}
                        saveToLocalByLongPress={false}
                    />
                </View>
            </Modal>


            {/* Artisan Selection */}
            <View style={{ padding: 12 }}>
                <TouchableOpacity onPress={() => setShowArtisanModal(true)}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",



                        }}
                    >
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                padding: 10,
                                borderRadius: 10,
                                color: "#000",
                                width: isTablet ? wp("90%") : wp("85%"),
                                marginRight: 8,
                            }}
                            placeholderTextColor={"#7c7c7cff"}
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
                        <Ionicons name="search" size={26} color="#7c7c7c" /></View>
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
                    placeholderTextColor={"#7c7c7cff"}
                    placeholder="Search S.No / Design / Product / Order No"
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
                            placeholderTextColor={"#7c7c7cff"}
                            value={artisanSearch || ""}
                            onChangeText={(text) => setArtisanSearch(text)}
                        />

                        {/* Select All */}
                        {/* <TouchableOpacity
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
                        </TouchableOpacity> */}

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
                        {/* <View
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
                        </View> */}

                        {/* Table Header */}
                        <View
                            style={{
                                flexDirection: "row",
                                backgroundColor: "#ccc",
                                padding: 8,
                            }}
                        >
                            <Text style={{ width: wp("12%"), fontWeight: "700" }}>Select</Text>
                            <Text style={{ width: wp("7%"), fontWeight: "700" }}>#</Text>
                            <Text style={{ width: wp("24%"), fontWeight: "700" }}>Product</Text>
                            <Text style={{ width: wp("24%"), fontWeight: "700" }}>Design</Text>
                            <Text style={{ width: wp("18%"), fontWeight: "700" }}>S.No</Text>
                            <Text style={{ width: wp("12%"), fontWeight: "700" }}>View</Text>
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
                                            style={{ width: wp("12%") }}
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
                                        <Text style={{ width: wp("7%") }}>{index + 1}</Text>
                                        <Text style={{ width: wp("24%") }}>{item.product}</Text>
                                        <Text style={{ width: wp("24%") }}>{item.design}</Text>
                                        <Text style={{ width: wp("18%") }}>{item.sNo}</Text>
                                        <TouchableOpacity
                                            style={{ width: wp("12%") }}
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
                                                padding: wp("3%"),
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
                                                        maxWidth: wp("65%"),
                                                        paddingRight: wp("3%"),
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
                                                        {new Date(item.orderDate).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                        })}
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
                                                <TouchableOpacity
                                                    onPress={() => setFullscreenImage(validUrl)}  // 👈 set the working URL
                                                    style={{
                                                        width: wp("45%"),
                                                        height: hp("25%"),
                                                        borderWidth: 1,
                                                        borderColor: "#ccc",
                                                        borderRadius: wp("3%"),
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <FallbackImage
                                                        fileName={item.design}
                                                        style={{ width: "100%", height: "100%" }}
                                                        onSuccess={(url) => setValidUrl(url)}  // 👈 store the actual valid URL
                                                    />
                                                </TouchableOpacity>


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
                                            Select an artisan and/or search S.No or Design or Product or Order No to view the table.
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
                        Select an artisan and/or search S.No or Design or Product or Order No to view the table.
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
    const renderReturn = () => (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9f5" }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setActiveSection(null)}>
                    <Ionicons name="arrow-undo" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Return</Text>
                <View style={{ width: 30 }} />
            </View>
            <Modal visible={!!fullscreenImage} transparent={true} onRequestClose={() => setFullscreenImage(null)}>
                <View style={{ flex: 1, backgroundColor: "#000" }}>
                    {/* Close Button */}
                    <TouchableOpacity
                        style={{
                            position: "absolute",
                            top: 40,
                            right: 20,
                            zIndex: 10,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            borderRadius: 20,
                            padding: 6,
                        }}
                        onPress={() => setFullscreenImage(null)}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>

                    {/* Image Viewer */}
                    <ImageViewer
                        imageUrls={[{ url: fullscreenImage }]}
                        enableSwipeDown
                        onSwipeDown={() => setFullscreenImage(null)}
                        onCancel={() => setFullscreenImage(null)}
                        saveToLocalByLongPress={false}
                    />
                </View>
            </Modal>
            {/* Artisan Selection */}
            <View style={{ padding: 12 }}>
                <TouchableOpacity onPress={() => setReturnShowArtisanModal(true)}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                padding: 10,
                                borderRadius: 10,
                                color: "#000",
                                width: isTablet ? wp("90%") : wp("85%"),
                                marginRight: 8,
                            }}
                            placeholderTextColor={"#7c7c7cff"}
                            placeholder="Select Artisan"
                            value={
                                returnSelectedArtisans.length === artisans.length
                                    ? "Selected All"
                                    : returnSelectedArtisans
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
                        <Ionicons name="search" size={26} color="#7c7c7c" />
                    </View>
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
                    placeholderTextColor={"#7c7c7cff"}
                    placeholder="Search S.No / Design / Product / Order No"
                    value={returnSearchSNo}
                    onChangeText={setReturnSearchSNo}
                />
            </View>

            {/* Artisan Modal */}
            <Modal visible={returnShowArtisanModal} transparent animationType="slide">
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
                                onPress={() => setReturnShowArtisanModal(false)}
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
                            placeholderTextColor={"#7c7c7cff"}
                            value={returnArtisanSearch || ""}
                            onChangeText={(text) => setReturnArtisanSearch(text)}
                        />

                        {/* Select All */}
                        {/* <TouchableOpacity
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: 10,
                                borderBottomWidth: 1,
                                borderColor: "#eee",
                            }}
                            onPress={() => {
                                if (returnSelectedArtisans.length === artisans.length) {
                                    setReturnSelectedArtisans([]);
                                } else {
                                    setReturnSelectedArtisans(artisans.map((a) => a.id));
                                }
                            }}
                        >
                            <Ionicons
                                name={
                                    returnSelectedArtisans.length === artisans.length
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
                        </TouchableOpacity> */}

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
                                        if (returnSelectedArtisans.includes(artisan.id)) {
                                            setReturnSelectedArtisans(
                                                returnSelectedArtisans.filter(
                                                    (id) => id !== artisan.id
                                                )
                                            );
                                        } else {
                                            setReturnSelectedArtisans([
                                                ...returnSelectedArtisans,
                                                artisan.id,
                                            ]);
                                        }
                                    }}
                                >
                                    <Ionicons
                                        name={
                                            returnSelectedArtisans.includes(artisan.id)
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
                                if (!returnLoading && returnHasMore) {
                                    const nextPage = returnPageNumber + 1;
                                    setReturnPageNumber(nextPage);
                                    fetchArtisans(nextPage, returnArtisanSearch);
                                }
                            }}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={
                                returnLoading ? (
                                    <Text style={{ textAlign: "center", padding: 10 }}>
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
                                    setReturnSelectedArtisans([]);
                                    setReturnArtisanSearch("");
                                }}
                            >
                                <Text style={{ color: "#fff", fontWeight: "600" }}>Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.updateButton}
                                onPress={() => {
                                    setReturnShowArtisanModal(false);
                                    const codes = artisans
                                        .filter((a) => returnSelectedArtisans.includes(a.id))
                                        .map((a) => a.code);
                                    fetchReturnOrders(codes); // 👈 replace with Return API if needed
                                }}
                            >
                                <Text style={{ color: "#fff", fontWeight: "600" }}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Table */}
            {returnTableData.length > 0 ? (
                <ScrollView horizontal style={{ marginBottom: 80 }}>
                    <View style={{ flex: 1 }}>
                        {/* Select All */}
                        {/* <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                padding: 8,
                            }}
                        >
                            <TouchableOpacity
                                style={{ width: 50 }}
                                onPress={() => {
                                    if (returnSelectAll) {
                                        setReturnSelectedRows([]);
                                        setReturnSelectAll(false);
                                    } else {
                                        const ids = returnTableData.map((item) => item.id);
                                        setReturnSelectedRows(ids);
                                        setReturnSelectAll(true);
                                    }
                                }}
                            >
                                <Ionicons
                                    name={returnSelectAll ? "checkbox" : "square-outline"}
                                    size={24}
                                    color="#2d531a"
                                />
                            </TouchableOpacity>
                            <Text>Select All</Text>
                        </View> */}

                        {/* Table Header */}
                        <View
                            style={{
                                flexDirection: "row",
                                backgroundColor: "#ccc",
                                padding: 8,
                            }}
                        >
                            <Text style={{ width: wp("12%"), fontWeight: "700" }}>Select</Text>
                            <Text style={{ width: wp("7%"), fontWeight: "700" }}>#</Text>
                            <Text style={{ width: wp("24%"), fontWeight: "700" }}>Product</Text>
                            <Text style={{ width: wp("24%"), fontWeight: "700" }}>Design</Text>
                            <Text style={{ width: wp("18%"), fontWeight: "700" }}>S.No</Text>
                            <Text style={{ width: wp("12%"), fontWeight: "700" }}>View</Text>
                        </View>

                        {/* Rows */}
                        <FlatList
                            data={returnTableData}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item, index }) => (
                                <View
                                    style={{
                                        borderBottomWidth: 1,
                                        borderColor: "#ccc",
                                    }}
                                >
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            padding: 8,
                                            alignItems: "center",
                                        }}
                                    >
                                        <TouchableOpacity
                                            style={{ width: wp("12%") }}
                                            onPress={() => {
                                                if (returnSelectedRows.includes(item.id)) {
                                                    setReturnSelectedRows(
                                                        returnSelectedRows.filter(
                                                            (id) => id !== item.id
                                                        )
                                                    );
                                                } else {
                                                    setReturnSelectedRows([
                                                        ...returnSelectedRows,
                                                        item.id,
                                                    ]);
                                                }
                                            }}
                                        >
                                            <Ionicons
                                                name={
                                                    returnSelectedRows.includes(item.id)
                                                        ? "checkbox"
                                                        : "square-outline"
                                                }
                                                size={24}
                                                color="#2d531a"
                                            />
                                        </TouchableOpacity>
                                        <Text style={{ width: wp("7%") }}>{index + 1}</Text>
                                        <Text style={{ width: wp("24%") }}>{item.product}</Text>
                                        <Text style={{ width: wp("24%") }}>{item.design}</Text>
                                        <Text style={{ width: wp("18%") }}>{item.sNo}</Text>
                                        <TouchableOpacity
                                            style={{ width: wp("12%") }}
                                            onPress={() =>
                                                setReturnExpandedRow(
                                                    returnExpandedRow === item.id ? null : item.id
                                                )
                                            }
                                        >
                                            <Ionicons
                                                name={
                                                    returnExpandedRow === item.id
                                                        ? "eye-off"
                                                        : "eye"
                                                }
                                                size={24}
                                                color="#2d531a"
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Expanded Row */}
                                    {returnExpandedRow === item.id && (
                                        <View
                                            style={{
                                                padding: wp("3%"),
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
                                                        maxWidth: wp("65%"),
                                                        paddingRight: wp("3%"),
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
                                                        {new Date(item.orderDate).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                        })}
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
                                                <TouchableOpacity
                                                    onPress={() => setFullscreenImage(validUrl)}  // 👈 set the working URL
                                                    style={{
                                                        width: wp("45%"),
                                                        height: hp("25%"),
                                                        borderWidth: 1,
                                                        borderColor: "#ccc",
                                                        borderRadius: wp("3%"),
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <FallbackImage
                                                        fileName={item.design}
                                                        style={{ width: "100%", height: "100%" }}
                                                        onSuccess={(url) => setValidUrl(url)}  // 👈 store the actual valid URL
                                                    />
                                                </TouchableOpacity>

                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}
                            onEndReached={() => {
                                if (!returnLoading && returnHasMore) {
                                    const nextPage = returnPageNumber + 1;
                                    setReturnPageNumber(nextPage);
                                    const codes = artisans
                                        .filter((a) => returnSelectedArtisans.includes(a.id))
                                        .map((a) => a.code);
                                    fetchReturnOrders(codes, nextPage, returnSearchSNo);
                                    // 👆 replace with Return API if different
                                }
                            }}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={
                                returnLoading ? (
                                    <Text style={{ textAlign: "center", padding: 10 }}>
                                        Loading...
                                    </Text>
                                ) : null
                            }
                            ListEmptyComponent={
                                !returnLoading ? (
                                    <View
                                        style={{
                                            flex: 1,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: 20,
                                        }}
                                    >
                                        <Image
                                            source={require("../asserts/Search.png")}
                                            style={{
                                                width: 180,
                                                height: 180,
                                                marginBottom: 16,
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
                                            Select an artisan and/or search S.No or Design or Product
                                            or Order No to view the table.
                                        </Text>
                                    </View>
                                ) : null
                            }
                        />
                    </View>
                </ScrollView>
            ) : (
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 20,
                    }}
                >
                    <Image
                        source={require("../asserts/Search.png")}
                        style={{
                            width: 180,
                            height: 180,
                            marginBottom: 16,
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
                        Select an artisan and/or search S.No or Design or Product or Order No to
                        view the table.
                    </Text>
                </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => {
                        setReturnSelectedRows([]);
                        setReturnSelectedArtisans([]);
                        setReturnSearchSNo("");
                        setReturnArtisanSearch("");
                        setReturnSelectAll(false);
                        setReturnTableData([]);
                        setReturnPageNumber(1);
                        setReturnHasMore(true);
                        setReturnExpandedRow(null);
                    }}
                >
                    <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={returnUpdateData}
                >
                    <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

    const renderSectionScreen = () => {
        if (activeSection === "User Creation") return renderUserCreation();
        if (activeSection === "Pending") return renderUndelivered();
        if (activeSection === "Delivered") return renderDelivered();
        if (activeSection === "Return") return renderReturn();
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
                    onPress={() =>
                        Alert.alert(
                            "Logout",
                            "Are you sure you want to logout?",
                            [
                                {
                                    text: "Cancel",
                                    style: "cancel",
                                },
                                {
                                    text: "Yes",
                                    onPress: () => navigation.navigate("Login"),
                                },
                            ],
                            { cancelable: true }
                        )
                    }
                >
                    <Ionicons
                        name="log-out-outline"
                        size={30}
                        color="#fff"
                        style={{ transform: [{ scaleX: -1 }] }}
                    />

                </TouchableOpacity>
                <Text style={styles.headerTitle}>Admin Reports</Text>
                <View style={{ width: 30 }} />
            </View>

            {/* 👇 MODIFIED BANNER JSX */}
            <View style={styles.bannerWrapper}>
                <Image
                    source={require("../asserts/achariss.jpg")}
                    style={styles.bannerImage}
                    resizeMode="cover"
                />
                <View style={styles.overlay} />
                <Image
                    source={require("../asserts/rkjewellers.png")}
                    style={styles.bannerLogo}
                    resizeMode="contain"
                />
                <Text style={styles.welcomeText}>Hello, Admin</Text>
            </View>

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
        paddingTop: 40,
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
        shadowColor: "#2d531a",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 4,
    },
    cardImage: { width: 80, height: 80, marginBottom: 8 },
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
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
        color: "#000",
        backgroundColor: "#fff",
    },

    // 👇 NEW AND UPDATED BANNER STYLES
    bannerWrapper: {
        height: hp("25%"),
        width: "90%",
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 16,
        borderRadius: 20,
        overflow: 'hidden',
        position: "relative",
    },
    bannerImage: {
        ...StyleSheet.absoluteFillObject,
        width: null,
        height: null,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.72)",
    },
    bannerLogo: {
        width: wp("60%"),
        height: hp("20%"),
        position: 'absolute',
        marginBottom: hp("4%"),
    },
    welcomeText: {
        position: "absolute",
        bottom: 15,
        fontSize: 24,
        fontWeight: "700",
        color: "#f9feffff",
        textAlign: "center",
        textShadowColor: "rgba(0,0,0,0.6)",
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
        zIndex: 1,
    },
});