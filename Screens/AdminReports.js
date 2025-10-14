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
import React from 'react';
import { useState, useEffect, useRef } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { BackHandler } from "react-native";
import axios from "axios";
import { BASE_URL, IMG_URL } from "./Links";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import ViewShot, { captureRef } from "react-native-view-shot";
import Share from 'react-native-share';
import DeviceInfo from "react-native-device-info";
import ImageZoom from 'react-native-image-pan-zoom';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const { width, height } = Dimensions.get("window");

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

    // New state and ref for image sharing
    const viewRef = useRef();
    const [selectedItem, setSelectedItem] = useState(null);

    const [activeSection, setActiveSection] = useState(null);
    const [showArtisanModal, setShowArtisanModal] = useState(false);
    const [selectedArtisans, setSelectedArtisans] = useState([]);
    const [searchSNo, setSearchSNo] = useState("");
    const [validUrl, setValidUrl] = useState(null);

    const [tableData, setTableData] = useState([]);  // ✅ start empty
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [artisans, setArtisans] = useState([]);
    const [pageNumber, setPageNumber] = useState(1);
    const [artisanPage, setArtisanPage] = useState(1); // ✅ FIX: Dedicated page state for artisan modals
    const [loading, setLoading] = useState(false);
    const [loadings, setLoadings] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [artisanSearch, setArtisanSearch] = useState("");
    // States for Return
    const [returnShowArtisanModal, setReturnShowArtisanModal] = useState(false);
    const [returnSelectedArtisans, setReturnSelectedArtisans] = useState([]);
    const [returnSearchSNo, setReturnSearchSNo] = useState("");
    const [returnTableData, setReturnTableData] = useState([]);
    const [returnSelectedRows, setReturnSelectedRows] = useState([]);
    const [returnSelectAll, setReturnSelectAll] = useState(false);
    const [returnPageNumber, setReturnPageNumber] = useState(1);
    const [returnLoading, setReturnLoading] = useState(false);
    const [returnHasMore, setReturnHasMore] = useState(true);
    const [returnArtisanSearch, setReturnArtisanSearch] = useState("");
    // States for Delivered
    const [deliveredShowArtisanModal, setDeliveredShowArtisanModal] = useState(false);
    const [deliveredSelectedArtisans, setDeliveredSelectedArtisans] = useState([]);
    const [deliveredSearchSNo, setDeliveredSearchSNo] = useState("");
    const [deliveredTableData, setDeliveredTableData] = useState([]);
    const [deliveredSelectedRows, setDeliveredSelectedRows] = useState([]);
    const [deliveredSelectAll, setDeliveredSelectAll] = useState(false);
    const [deliveredPageNumber, setDeliveredPageNumber] = useState(1);
    const [deliveredLoading, setDeliveredLoading] = useState(false); // ✅ FIX: Dedicated loading state
    const [fullscreenImage, setFullscreenImage] = useState(null); // holds the fileName (design)
    const [deliveredHasMore, setDeliveredHasMore] = useState(true);
    const [deliveredArtisanSearch, setDeliveredArtisanSearch] = useState("");

    // States for Overdue Section
    const [overdueTableData, setOverdueTableData] = useState([]);
    const [overdueSelectedArtisans, setOverdueSelectedArtisans] = useState([]);
    const [overdueSearch, setOverdueSearch] = useState("");
    const [overduePageNumber, setOverduePageNumber] = useState(1);
    const [overdueLoading, setOverdueLoading] = useState(false);
    const [overdueHasMore, setOverdueHasMore] = useState(true);
    const [overdueArtisanSearch, setOverdueArtisanSearch] = useState("");
    const [showOverdueArtisanModal, setShowOverdueArtisanModal] = useState(false);

    const clearForm = () => {
        setPartyName("");
        setPhoneWarning("");
        setPhone("");
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            // Handle ISO format like "2025-08-18T16:16:15.31"
            if (dateString.includes('T')) {
                return new Date(dateString).toLocaleDateString("en-GB");
            }
             // Handle "DD-MM-YYYY" format
            const parts = dateString.split('-');
            if (parts.length === 3) {
                const [day, month, year] = parts;
                if(day && month && year && day.length === 2 && month.length === 2 && year.length === 4) {
                   return `${day}/${month}/${year}`;
                }
            }
            // Return original if format is unexpected
            return dateString;
        } catch (error) {
            console.log("Date formatting error:", error);
            return dateString; // Fallback
        }
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

    const shareToWhatsApp = async () => {
        try {
            if (!viewRef.current || !selectedItem) return;

            const uri = await captureRef(viewRef, {
                format: "png",
                quality: 0.9,
            });

            let message = `S.No: ${selectedItem.sNo}\nWeight: ${selectedItem.weight}\nSize: ${selectedItem.size}\nQty: ${selectedItem.qty}\nDesign: ${selectedItem.design}\nOrder No: ${selectedItem.orderNo}`;

            // Conditionally add overdue details
            if (selectedItem.daysOverdue !== undefined) {
                message += `\nDays Overdue: ${selectedItem.daysOverdue}\nDue Date: ${formatDate(selectedItem.dueDate)}`;
            }

            const shareOptions = {
                title: "Share via WhatsApp",
                message: message,
                url: uri,
                social: Share.Social.WHATSAPP,
            };

            await Share.open(shareOptions);
        } catch (error) {
            console.log("❌ Error sharing:", error);
            if (error.message !== "User did not share") {
                Alert.alert("Error", "An error occurred while sharing.");
            }
        }
    };

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
                        <Text style={{ marginBottom: 6, fontWeight: 'bold', color: "#2d531a" }}>Party Name</Text>
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
                        <Text style={{ marginTop: 16, marginBottom: 6, fontWeight: 'bold', color: "#2d531a" }}>Phone No</Text>
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


    const FallbackImage = ({ fileName, style, onSuccess, onPress }) => {
        const [uriIndex, setUriIndex] = useState(0);
        const [resolvedUrl, setResolvedUrl] = useState(null);
        const extensions = [".jpg", ".jpeg", ".png"];
        const sources = extensions.map((ext) => `${IMG_URL}${fileName}${ext}`);

        return (
            <TouchableOpacity
                onPress={() => resolvedUrl && onPress(resolvedUrl)}
                style={style}
                disabled={!onPress}
            >
                <Image
                    source={{ uri: sources[uriIndex] }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                    onError={() => {
                        if (uriIndex < sources.length - 1) {
                            setUriIndex(uriIndex + 1);
                        } else {
                            // console.log("No valid image found for", fileName);
                        }
                    }}
                    onLoad={() => {
                        const validUrl = sources[uriIndex];
                        setResolvedUrl(validUrl);
                        if (onSuccess) onSuccess(validUrl); // ✅ report back valid URL
                    }}
                />
            </TouchableOpacity>
        );
    };

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
            setArtisanPage(1);
            fetchArtisans(1, artisanSearch);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [artisanSearch]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setArtisanPage(1);
            fetchArtisans(1, deliveredArtisanSearch);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [deliveredArtisanSearch]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setArtisanPage(1);
            fetchArtisans(1, returnArtisanSearch);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [returnArtisanSearch]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setArtisanPage(1);
            fetchArtisans(1, overdueArtisanSearch);
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [overdueArtisanSearch]);


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
                const alreadyLoaded = (page - 1) * 30 + mapped.length;
                setHasMore(alreadyLoaded < total);
            } else {
                if (page === 1) setArtisans([]);
                setHasMore(false);
            }
        } catch (err) {
            console.error("Error fetching artisans:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingOrders = async (selectedCodes, page = 1, search = "") => {
        if (!selectedCodes || selectedCodes.length === 0) return;
        setLoadings(true);
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

                setHasMore(mapped.length === 30);
            }
        } catch (err) {
            console.error("Error fetching pending orders:", err);
        }
        finally {
            setLoadings(false);
        }
    };

    const fetchDeliveredOrders = async (selectedCodes, page = 1, search = "") => {
        if (!selectedCodes || selectedCodes.length === 0) return;
        setDeliveredLoading(true);
        try {
            const cusCodes = selectedCodes.map((c) => `cusCodes=${c}`).join("&");
            const res = await axios.get(
                `${BASE_URL}ItemTransaction/GetDeliveryAdmin?${cusCodes}&search=${search}&pageNumber=${page}&pageSize=30`
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
                    status: item.fconfirmStatus === "Y" ? "Delivered" : "Undelivered",
                }));

                if (page === 1) {
                    setDeliveredTableData(mapped);
                } else {
                    setDeliveredTableData((prev) => [...prev, ...mapped]);
                }

                setDeliveredHasMore(mapped.length === 30);
            }
        } catch (err) {
            console.error("Error fetching delivered orders:", err);
        }
        finally {
            setDeliveredLoading(false);
        }
    };

    const fetchOverdueOrders = async (codes = [], page = 1, search = "") => {
        if (!codes || codes.length === 0) {
            setOverdueTableData([]);
            return;
        }
        setOverdueLoading(true);
        try {
            const cusCodesQuery = codes.map(code => `cusCodes=${code}`).join("&");
            const url = `${BASE_URL}ItemTransaction/GetPendingOverdue?${cusCodesQuery}&search=${search}&pageNumber=${page}&pageSize=30`;
            
            const res = await axios.get(url);

            if (res.data && Array.isArray(res.data.data)) {
                const mappedData = res.data.data.map((item, index) => ({
                    id: item.fTransaId?.toString() || `${page}-${index}`,
                    issueNo: item.fIssueNo,
                    orderNo: item.fOrderNo,
                    orderDate: item.fOrderDate,
                    dueDate: item.fDueDate,
                    orderType: item.fOrderType,
                    product: item.fProduct,
                    design: item.fDesign,
                    weight: item.fWeight,
                    size: item.fSize || "N/A",
                    qty: item.fQty,
                    purity: item.fPurity,
                    theme: item.fTheme,
                    sNo: item.fSNo,
                    status: item.fconfirmStatus === "N" ? "Pending" : "Confirmed",
                    daysOverdue: item.daysOverdue || 0,
                }));

                setOverdueTableData(prev =>
                    page === 1 ? mappedData : [...prev, ...mappedData]
                );
                setOverdueHasMore(mappedData.length === 30);
            } else {
                 if (page === 1) setOverdueTableData([]);
                setOverdueHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching overdue orders:", error);
            if (page === 1) setOverdueTableData([]);
            setOverdueHasMore(false);
        } finally {
            setOverdueLoading(false);
        }
    };
    
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (overdueSelectedArtisans.length > 0) {
                setOverduePageNumber(1);
                const codes = artisans
                    .filter((a) => overdueSelectedArtisans.includes(a.id))
                    .map((a) => a.code);
                fetchOverdueOrders(codes, 1, overdueSearch);
            } else {
                setOverdueTableData([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [overdueSearch, overdueSelectedArtisans]);

    useEffect(() => {
        const backAction = () => {
            if (activeSection) {
                setActiveSection(null);
                return true;
            } else {
                Alert.alert(
                    "Exit App",
                    "Are you sure you want to exit the app?",
                    [
                        { text: "Cancel", onPress: () => null, style: "cancel" },
                        { text: "Yes", onPress: () => {
                                navigation.replace("Login");
                                BackHandler.exitApp();
                            }
                        },
                    ]
                );
                return true;
            }
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, [activeSection, navigation]);

    const toggleRow = (id) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter((i) => i !== id));
        } else {
            setSelectedRows([...selectedRows, id]);
        }
    };

    const updateData = async () => {
        if (selectedRows.length === 0) {
            alert("Please select at least one row.");
            return;
        }

        const payload = selectedRows.map((id) => {
            const row = tableData.find((r) => r.id === id);
            return {
                issueNo: row.issueNo,
                sno: row.sNo,
                transId: row.transaId
            };
        });

        console.log("Update payload:", payload);

        try {
            const res = await axios.put(
                `${BASE_URL}ItemTransaction/UpdateConfirmStatus`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            if (res.status === 200) {
                alert("Update successful!");
                clearSelection();
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
        setLoadings(false);
    };

    const sections = [
        { id: "1", title: "User Creation", icon: require("../asserts/user.jpg") },
        { id: "2", title: "Pending", icon: require("../asserts/undelivered.jpg") },
        { id: "3", title: "Delivered", icon: require("../asserts/delivered.jpg") },
        { id: "4", title: "Return", icon: require("../asserts/return.jpg") },
        { id: "5", title: "Return List", icon: require("../asserts/returnlist.jpg") },
        { id: "6", title: "Overdue", icon: require("../asserts/overdue.png") },
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

            {/* Fullscreen Image Viewer with Sharing */}
            <Modal
                visible={!!fullscreenImage}
                transparent={false}
                onRequestClose={() => setFullscreenImage(null)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
                    <ViewShot ref={viewRef} style={{ flex: 1, backgroundColor: "#fff" }}>
                        <View
                            style={{
                                flex: 1,
                                borderWidth: 2,
                                borderColor: "#000",
                                margin: 10,
                                padding: 10,
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#fff",
                            }}
                        >
                            <View
                                style={{
                                    width: '100%',
                                    height: '75%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <ImageZoom
                                    cropWidth={screenWidth}
                                    cropHeight={screenHeight * 0.75}
                                    imageWidth={screenWidth * 0.8}
                                    imageHeight={screenHeight * 0.75}
                                    enableSwipeDown={false}
                                    pinchToZoom={true}
                                    centerOn={{ x: 0, y: 0, scale: 1, duration: 100 }} // ✅ ensures it starts centered
                                >
                                    <Image
                                        source={{ uri: fullscreenImage }}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            resizeMode: 'contain',
                                            alignSelf: 'center',
                                        }}
                                    />
                                </ImageZoom>
                            </View>
                            {selectedItem && (
                                <View style={{ width: "90%", marginTop: 20, borderTopWidth: 1, borderColor: "#ffffffff", paddingTop: 10 }}>
                                    <View style={styles.detailRowFix}>
                                        <Text style={styles.detailLabel1}>SNo :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.sNo}</Text>
                                        <Text style={styles.detailLabel1}>Weight :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.weight}</Text>
                                    </View>
                                    <View style={styles.detailRowFix}>
                                        <Text style={styles.detailLabel1}>Size :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.size}</Text>
                                        <Text style={styles.detailLabel1}>Qty :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.qty}</Text>
                                    </View>
                                    <View style={styles.detailRowFix}>
                                        <Text style={styles.detailLabel1}>Design :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.design}</Text>
                                        <Text style={styles.detailLabel1}>Order No :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.orderNo}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </ViewShot>

                    {/* Bottom buttons */}
                    <View style={styles.modalFooterButtons}>
                        <TouchableOpacity onPress={() => setFullscreenImage(null)} style={styles.modalCloseButton}>
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={shareToWhatsApp} style={styles.modalShareButton}>
                            <Ionicons name="logo-whatsapp" size={22} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
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
                                if (!loading && hasMore) {
                                    const nextPage = artisanPage + 1;
                                    setArtisanPage(nextPage);
                                    fetchArtisans(nextPage, deliveredArtisanSearch);
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
                                    setDeliveredPageNumber(1); // Reset data page number
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
                <FlatList
                    data={deliveredFilteredData}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 5 }}
                    renderItem={({ item, index }) => (
                        <View style={styles.card}>
                            <Text style={styles.cardNumber}>#{index + 1}</Text>
                            <View style={styles.imageWrapper}>
                                <FallbackImage
                                    fileName={item.design}
                                    style={{ width: "100%", height: "100%" }}
                                    onPress={(url) => {
                                        setFullscreenImage(url);
                                        setSelectedItem(item);
                                    }}
                                />
                            </View>
                            <View style={styles.detailsBox}>
                                <View style={styles.detailContainer}>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.highlights, { width: wp("30%") }]}>DESIGN:</Text>
                                        <Text style={[styles.highlight, { width: wp("40%"), marginRight: wp("5%") }]}>{item.design}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.highlights, { width: wp("30%") }]}>SNO:</Text>
                                        <Text style={[styles.highlight, { width: wp("40%"), marginRight: wp("5%") }]}>{item.sNo}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.highlights, { width: wp("30%") }]}>ORDER NO:</Text>
                                        <Text style={[styles.highlight, { width: wp("40%"), marginRight: wp("5%") }]}>{item.orderNo}</Text>
                                    </View>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Weight:</Text>
                                    <Text style={styles.value}>{item.weight}</Text>
                                    <Text style={styles.label}>Size:</Text>
                                    <Text style={styles.value}>{item.size}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Product:</Text>
                                    <Text style={styles.value}>{item.product}</Text>
                                    <Text style={styles.label}>Qty:</Text>
                                    <Text style={styles.value}>{item.qty}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Order Date:</Text>
                                    <Text style={styles.value}>{new Date(item.orderDate).toLocaleDateString("en-GB")}</Text>
                                    <Text style={styles.label}>Order Type:</Text>
                                    <Text style={styles.value}>{item.orderType}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Purity:</Text>
                                    <Text style={styles.value}>{item.purity}</Text>
                                    <Text style={styles.label}>Theme:</Text>
                                    <Text style={styles.value}>{item.theme}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Status:</Text>
                                    <Text style={styles.value}>{item.status}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                    onEndReached={() => {
                        if (!deliveredLoading && deliveredHasMore) {
                            const nextPage = deliveredPageNumber + 1;
                            setDeliveredPageNumber(nextPage);
                            const codes = artisans
                                .filter((a) => deliveredSelectedArtisans.includes(a.id))
                                .map((a) => a.code);
                            fetchDeliveredOrders(codes, nextPage, deliveredSearchSNo);
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        deliveredLoading ? (
                            <Text style={{ textAlign: "center", padding: 10 }}>Loading...</Text>
                        ) : !deliveredHasMore && deliveredTableData.length > 0 ? (
                            <Text style={{ textAlign: "center", padding: 10 }}>No more data</Text>
                        ) : null
                    }
                />
            ) : deliveredLoading ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Loading...</Text>
                </View>
            ) : deliveredSelectedArtisans.length > 0 ? (
                <View style={styles.emptyContainer}>
                    <Image
                        source={require("../asserts/Search.png")}
                        style={styles.emptyImage}
                    />
                    <Text style={styles.emptyText}>No data found</Text>
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Image
                        source={require("../asserts/Search.png")}
                        style={styles.emptyImage}
                    />
                    <Text style={styles.emptyText}>
                        Select an artisan and/or search S.No or Design or Product or Order No to view the table.
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
                        setDeliveredLoading(false);
                    }}
                >
                    <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

    const renderUndelivered = () => (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9f5" }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setActiveSection(null)}>
                    <Ionicons name="arrow-undo" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pending</Text>
                <View style={{ width: 30 }} />
            </View>
            <Modal
                visible={!!fullscreenImage}
                transparent={false}
                onRequestClose={() => setFullscreenImage(null)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
                    <ViewShot ref={viewRef} style={{ flex: 1, backgroundColor: "#fff" }}>
                        <View
                            style={{
                                flex: 1,
                                borderWidth: 2,
                                borderColor: "#000",
                                margin: 10,
                                padding: 10,
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#fff",
                            }}
                        >
                            <View
                                style={{
                                    width: '100%',
                                    height: '75%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <ImageZoom
                                    cropWidth={screenWidth}
                                    cropHeight={screenHeight * 0.75}
                                    imageWidth={screenWidth * 0.8}
                                    imageHeight={screenHeight * 0.75}
                                    enableSwipeDown={false}
                                    pinchToZoom={true}
                                    centerOn={{ x: 0, y: 0, scale: 1, duration: 100 }} // ✅ ensures it starts centered
                                >
                                    <Image
                                        source={{ uri: fullscreenImage }}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            resizeMode: 'contain',
                                            alignSelf: 'center',
                                        }}
                                    />
                                </ImageZoom>
                            </View>
                            {selectedItem && (
                                <View style={{ width: "90%", marginTop: 20, borderTopWidth: 1, borderColor: "#ffffffff", paddingTop: 10 }}>
                                    <View style={styles.detailRowFix}>
                                        <Text style={styles.detailLabel1}>SNo :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.sNo}</Text>
                                        <Text style={styles.detailLabel1}>Weight :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.weight}</Text>
                                    </View>
                                    <View style={styles.detailRowFix}>
                                        <Text style={styles.detailLabel1}>Size :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.size}</Text>
                                        <Text style={styles.detailLabel1}>Qty :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.qty}</Text>
                                    </View>
                                    <View style={styles.detailRowFix}>
                                        <Text style={styles.detailLabel1}>Design :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.design}</Text>
                                        <Text style={styles.detailLabel1}>Order No :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.orderNo}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </ViewShot>

                    {/* Bottom buttons */}
                    <View style={styles.modalFooterButtons}>
                        <TouchableOpacity onPress={() => setFullscreenImage(null)} style={styles.modalCloseButton}>
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={shareToWhatsApp} style={styles.modalShareButton}>
                            <Ionicons name="logo-whatsapp" size={22} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
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
                                    const nextPage = artisanPage + 1;
                                    setArtisanPage(nextPage);
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
                                    setPageNumber(1); // Reset data page number
                                    const codes = artisans
                                        .filter((a) =>
                                            selectedArtisans.includes(a.id)
                                        )
                                        .map((a) => a.code);
                                    fetchPendingOrders(codes, 1);
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
                <FlatList
                    data={tableData}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 5 }}
                    renderItem={({ item, index }) => (
                        <View style={styles.card}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <Text style={styles.cardNumber}>#{index + 1}</Text>
                                <TouchableOpacity onPress={() => toggleRow(item.id)}>
                                    <Ionicons
                                        name={selectedRows.includes(item.id) ? "checkbox" : "square-outline"}
                                        size={28}
                                        color="#2d531a"
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.imageWrapper}>
                                <FallbackImage
                                    fileName={item.design}
                                    style={{ width: "100%", height: "100%" }}
                                    onPress={(url) => {
                                        setFullscreenImage(url);
                                        setSelectedItem(item);
                                    }}
                                />
                            </View>
                            <View style={styles.detailsBox}>
                                <View style={styles.detailContainer}>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.highlights, { width: wp("30%") }]}>DESIGN:</Text>
                                        <Text style={[styles.highlight, { width: wp("40%"), marginRight: wp("5%") }]}>{item.design}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.highlights, { width: wp("30%") }]}>SNO:</Text>
                                        <Text style={[styles.highlight, { width: wp("40%"), marginRight: wp("5%") }]}>{item.sNo}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.highlights, { width: wp("30%") }]}>ORDER NO:</Text>
                                        <Text style={[styles.highlight, { width: wp("40%"), marginRight: wp("5%") }]}>{item.orderNo}</Text>
                                    </View>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Weight:</Text>
                                    <Text style={styles.value}>{item.weight}</Text>
                                    <Text style={styles.label}>Size:</Text>
                                    <Text style={styles.value}>{item.size}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Product:</Text>
                                    <Text style={styles.value}>{item.product}</Text>
                                    <Text style={styles.label}>Qty:</Text>
                                    <Text style={styles.value}>{item.qty}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Order Date:</Text>
                                    <Text style={styles.value}>{new Date(item.orderDate).toLocaleDateString("en-GB")}</Text>
                                    <Text style={styles.label}>Order Type:</Text>
                                    <Text style={styles.value}>{item.orderType}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Purity:</Text>
                                    <Text style={styles.value}>{item.purity}</Text>
                                    <Text style={styles.label}>Theme:</Text>
                                    <Text style={styles.value}>{item.theme}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Status:</Text>
                                    <Text style={styles.value}>{item.status}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                    onEndReached={() => {
                        if (!loadings && hasMore) {
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
                        loadings ? (
                            <Text style={{ textAlign: "center", padding: 10 }}>Loading...</Text>
                        ) : !hasMore && tableData.length > 0 ? (
                            <Text style={{ textAlign: "center", padding: 10 }}>No more data</Text>
                        ) : null
                    }
                />
            ) : loadings ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Loading...</Text>
                </View>
            ) : selectedArtisans.length > 0 ? (
                <View style={styles.emptyContainer}>
                    <Image
                        source={require("../asserts/Search.png")}
                        style={styles.emptyImage}
                    />
                    <Text style={styles.emptyText}>No data found</Text>
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Image
                        source={require("../asserts/Search.png")}
                        style={styles.emptyImage}
                    />
                    <Text style={styles.emptyText}>
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
            <Modal
                visible={!!fullscreenImage}
                transparent={false}
                onRequestClose={() => setFullscreenImage(null)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
                    <ViewShot ref={viewRef} style={{ flex: 1, backgroundColor: "#fff" }}>
                        <View
                            style={{
                                flex: 1,
                                borderWidth: 2,
                                borderColor: "#000",
                                margin: 10,
                                padding: 10,
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#fff",
                            }}
                        >
                            <View
                                style={{
                                    width: '100%',
                                    height: '75%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <ImageZoom
                                    cropWidth={screenWidth}
                                    cropHeight={screenHeight * 0.75}
                                    imageWidth={screenWidth * 0.8}
                                    imageHeight={screenHeight * 0.75}
                                    enableSwipeDown={false}
                                    pinchToZoom={true}
                                    centerOn={{ x: 0, y: 0, scale: 1, duration: 100 }} // ✅ ensures it starts centered
                                >
                                    <Image
                                        source={{ uri: fullscreenImage }}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            resizeMode: 'contain',
                                            alignSelf: 'center',
                                        }}
                                    />
                                </ImageZoom>
                            </View>
                            {selectedItem && (
                                <View style={{ width: "90%", marginTop: 20, borderTopWidth: 1, borderColor: "#ffffffff", paddingTop: 10 }}>
                                    <View style={styles.detailRowFix}>
                                        <Text style={styles.detailLabel1}>SNo :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.sNo}</Text>
                                        <Text style={styles.detailLabel1}>Weight :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.weight}</Text>
                                    </View>
                                    <View style={styles.detailRowFix}>
                                        <Text style={styles.detailLabel1}>Size :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.size}</Text>
                                        <Text style={styles.detailLabel1}>Qty :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.qty}</Text>
                                    </View>
                                    <View style={styles.detailRowFix}>
                                        <Text style={styles.detailLabel1}>Design :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.design}</Text>
                                        <Text style={styles.detailLabel1}>Order No :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.orderNo}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </ViewShot>

                    {/* Bottom buttons */}
                    <View style={styles.modalFooterButtons}>
                        <TouchableOpacity onPress={() => setFullscreenImage(null)} style={styles.modalCloseButton}>
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={shareToWhatsApp} style={styles.modalShareButton}>
                            <Ionicons name="logo-whatsapp" size={22} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
            <View style={{ padding: 12 }}>
                <TouchableOpacity onPress={() => setReturnShowArtisanModal(true)}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TextInput
                            style={{
                                borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 10,
                                color: "#000", width: isTablet ? wp("90%") : wp("85%"), marginRight: 8,
                            }}
                            placeholderTextColor={"#7c7c7cff"}
                            placeholder="Select Artisan"
                            value={
                                returnSelectedArtisans.length === artisans.length
                                    ? "Selected All"
                                    : returnSelectedArtisans
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
            <View style={{ paddingHorizontal: 12, marginBottom: 12 }}>
                <TextInput
                    style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 10 }}
                    placeholderTextColor={"#7c7c7cff"}
                    placeholder="Search S.No / Design / Product / Order No"
                    value={returnSearchSNo}
                    onChangeText={setReturnSearchSNo}
                />
            </View>
            <Modal visible={returnShowArtisanModal} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 }}>
                    <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20, maxHeight: "80%" }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <Text style={{ fontSize: 18, fontWeight: "700" }}>Select Artisan</Text>
                            <TouchableOpacity onPress={() => setReturnShowArtisanModal(false)}>
                                <Ionicons name="close" size={28} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 10, marginBottom: 10 }}
                            placeholder="Search Artisan"
                            placeholderTextColor={"#7c7c7cff"}
                            value={returnArtisanSearch || ""}
                            onChangeText={(text) => setReturnArtisanSearch(text)}
                        />
                        <FlatList
                            data={artisans}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item: artisan }) => (
                                <TouchableOpacity
                                    style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}
                                    onPress={() => {
                                        if (returnSelectedArtisans.includes(artisan.id)) {
                                            setReturnSelectedArtisans(returnSelectedArtisans.filter((id) => id !== artisan.id));
                                        } else {
                                            setReturnSelectedArtisans([...returnSelectedArtisans, artisan.id]);
                                        }
                                    }}
                                >
                                    <Ionicons
                                        name={returnSelectedArtisans.includes(artisan.id) ? "checkbox" : "square-outline"}
                                        size={22}
                                        color="#2d531a"
                                    />
                                    <Text style={{ fontSize: 16, marginLeft: 8, color: "#2d531a" }}>
                                        {artisan.name} ({artisan.code})
                                    </Text>
                                </TouchableOpacity>
                            )}
                            onEndReached={() => {
                                if (!loading && hasMore) {
                                    const nextPage = artisanPage + 1;
                                    setArtisanPage(nextPage);
                                    fetchArtisans(nextPage, returnArtisanSearch);
                                }
                            }}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={
                                loading ? <Text style={{ textAlign: "center", padding: 10 }}>Loading...</Text> : null
                            }
                        />
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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
                                    setReturnPageNumber(1);
                                    const codes = artisans
                                        .filter((a) => returnSelectedArtisans.includes(a.id))
                                        .map((a) => a.code);
                                    fetchReturnOrders(codes, 1);
                                }}
                            >
                                <Text style={{ color: "#fff", fontWeight: "600" }}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {returnTableData.length > 0 ? (
                <FlatList
                    data={returnTableData}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 5 }}
                    renderItem={({ item, index }) => (
                        <View style={styles.card}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <Text style={styles.cardNumber}>#{index + 1}</Text>
                                <TouchableOpacity onPress={() => {
                                    if (returnSelectedRows.includes(item.id)) {
                                        setReturnSelectedRows(returnSelectedRows.filter((id) => id !== item.id));
                                    } else {
                                        setReturnSelectedRows([...returnSelectedRows, item.id]);
                                    }
                                }}>
                                    <Ionicons
                                        name={returnSelectedRows.includes(item.id) ? "checkbox" : "square-outline"}
                                        size={28}
                                        color="#2d531a"
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.imageWrapper}>
                                <FallbackImage
                                    fileName={item.design}
                                    style={{ width: "100%", height: "100%" }}
                                    onPress={(url) => {
                                        setFullscreenImage(url);
                                        setSelectedItem(item);
                                    }}
                                />
                            </View>
                            <View style={styles.detailsBox}>
                                <View style={styles.detailContainer}>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.highlights, { width: wp("30%") }]}>DESIGN:</Text>
                                        <Text style={[styles.highlight, { width: wp("40%"), marginRight: wp("5%") }]}>{item.design}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.highlights, { width: wp("30%") }]}>SNO:</Text>
                                        <Text style={[styles.highlight, { width: wp("40%"), marginRight: wp("5%") }]}>{item.sNo}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.highlights, { width: wp("30%") }]}>ORDER NO:</Text>
                                        <Text style={[styles.highlight, { width: wp("40%"), marginRight: wp("5%") }]}>{item.orderNo}</Text>
                                    </View>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Weight:</Text>
                                    <Text style={styles.value}>{item.weight}</Text>
                                    <Text style={styles.label}>Size:</Text>
                                    <Text style={styles.value}>{item.size}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Product:</Text>
                                    <Text style={styles.value}>{item.product}</Text>
                                    <Text style={styles.label}>Qty:</Text>
                                    <Text style={styles.value}>{item.qty}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Order Date:</Text>
                                    <Text style={styles.value}>{new Date(item.orderDate).toLocaleDateString("en-GB")}</Text>
                                    <Text style={styles.label}>Order Type:</Text>
                                    <Text style={styles.value}>{item.orderType}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Purity:</Text>
                                    <Text style={styles.value}>{item.purity}</Text>
                                    <Text style={styles.label}>Theme:</Text>
                                    <Text style={styles.value}>{item.theme}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Status:</Text>
                                    <Text style={styles.value}>{item.status}</Text>
                                </View>
                            </View>
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
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        returnLoading ? (
                            <Text style={{ textAlign: "center", padding: 10 }}>Loading...</Text>
                        ) : !returnHasMore && returnTableData.length > 0 ? (
                            <Text style={{ textAlign: "center", padding: 10 }}>No more data</Text>
                        ) : null
                    }
                />
            ) : returnLoading ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Loading...</Text>
                </View>
            ) : returnSelectedArtisans.length > 0 ? (
                <View style={styles.emptyContainer}>
                    <Image
                        source={require("../asserts/Search.png")}
                        style={styles.emptyImage}
                    />
                    <Text style={styles.emptyText}>No data found</Text>
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Image
                        source={require("../asserts/Search.png")}
                        style={styles.emptyImage}
                    />
                    <Text style={styles.emptyText}>
                        Select an artisan and/or search S.No or Design or Product or Order No to view the table.
                    </Text>
                </View>
            )}

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

                    }}
                >
                    <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={() => {
                        returnUpdateData();
                        setReturnSelectedRows([]);
                        setReturnSelectedArtisans([]);
                        setReturnSearchSNo("");
                        setReturnArtisanSearch("");
                        setReturnSelectAll(false);
                        setReturnTableData([]);
                        setReturnPageNumber(1);
                        setReturnHasMore(true);
                    }}
                >
                    <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
    
    const renderOverdue = () => (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f8f9f5" }}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setActiveSection(null)}>
                    <Ionicons name="arrow-undo" size={30} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Overdue</Text>
                <View style={{ width: 30 }} />
            </View>

            {/* Fullscreen Image Viewer with Sharing */}
            <Modal
                visible={!!fullscreenImage}
                transparent={false}
                onRequestClose={() => setFullscreenImage(null)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
                    <ViewShot ref={viewRef} style={{ flex: 1, backgroundColor: "#fff" }}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalImageContainer}>
                                <ImageZoom
                                    cropWidth={screenWidth}
                                    cropHeight={screenHeight * 0.75}
                                    imageWidth={screenWidth * 0.9}
                                    imageHeight={screenHeight * 0.7}
                                >
                                    <Image
                                        source={{ uri: fullscreenImage }}
                                        style={styles.fullscreenImageStyle}
                                    />
                                </ImageZoom>
                            </View>
                            {selectedItem && (
                                <View style={styles.modalDetailsContainer}>
                                    <View style={styles.detailRowFix}>
                                        <Text style={styles.detailLabel1}>SNo :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.sNo}</Text>
                                        <Text style={styles.detailLabel1}>Weight :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.weight}</Text>
                                    </View>
                                    <View style={styles.detailRowFix}>
                                        <Text style={styles.detailLabel1}>Size :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.size}</Text>
                                        <Text style={styles.detailLabel1}>Qty :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.qty}</Text>
                                    </View>
                                    <View style={styles.detailRowFix}>
                                        <Text style={styles.detailLabel1}>Design :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.design}</Text>
                                        <Text style={styles.detailLabel1}>Order No :</Text>
                                        <Text style={styles.detailValue1}>{selectedItem.orderNo}</Text>
                                    </View>
                                     <View style={styles.detailRowFix}>
                                        <Text style={styles.detailLabel1}>Days Overdue:</Text>
                                        <Text style={[styles.detailValue1, { color: '#d32f2f', fontWeight: 'bold' }]}>{selectedItem.daysOverdue}</Text>
                                        <Text style={styles.detailLabel1}>Due Date:</Text>
                                        <Text style={styles.detailValue1}>{formatDate(selectedItem.dueDate)}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </ViewShot>

                    {/* Bottom buttons */}
                    <View style={styles.modalFooterButtons}>
                        <TouchableOpacity onPress={() => setFullscreenImage(null)} style={styles.modalCloseButton}>
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={shareToWhatsApp} style={styles.modalShareButton}>
                            <Ionicons name="logo-whatsapp" size={22} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>

            {/* Artisan Selection */}
            <View style={{ padding: 12 }}>
                <TouchableOpacity onPress={() => setShowOverdueArtisanModal(true)}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginRight: 8}]}
                            placeholder="Select Artisan"
                            placeholderTextColor="#7c7c7c"
                            value={
                                overdueSelectedArtisans
                                    .map(id => {
                                        const artisan = artisans.find(a => a.id === id);
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

            {/* Search Bar */}
            <View style={{ paddingHorizontal: 12, marginBottom: 12 }}>
                <TextInput
                    style={styles.input}
                    placeholder="Search Design / S.No / Order No..."
                    placeholderTextColor="#7c7c7c"
                    value={overdueSearch}
                    onChangeText={setOverdueSearch}
                />
            </View>

            {/* Artisan Modal for Overdue */}
            <Modal visible={showOverdueArtisanModal} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 }}>
                    <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20, maxHeight: "80%" }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                            <Text style={{ fontSize: 18, fontWeight: "700" }}>Select Artisan</Text>
                            <TouchableOpacity onPress={() => setShowOverdueArtisanModal(false)}>
                                <Ionicons name="close" size={28} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Search Artisan"
                            value={overdueArtisanSearch}
                            onChangeText={setOverdueArtisanSearch}
                        />
                        <FlatList
                            data={artisans}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item: artisan }) => (
                                <TouchableOpacity
                                    style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}
                                    onPress={() => {
                                        if (overdueSelectedArtisans.includes(artisan.id)) {
                                            setOverdueSelectedArtisans(overdueSelectedArtisans.filter((id) => id !== artisan.id));
                                        } else {
                                            setOverdueSelectedArtisans([...overdueSelectedArtisans, artisan.id]);
                                        }
                                    }}
                                >
                                    <Ionicons
                                        name={overdueSelectedArtisans.includes(artisan.id) ? "checkbox" : "square-outline"}
                                        size={22}
                                        color="#2d531a"
                                    />
                                    <Text style={{ fontSize: 16, marginLeft: 8, color: "#2d531a" }}>{artisan.name} ({artisan.code})</Text>
                                </TouchableOpacity>
                            )}
                            onEndReached={() => {
                                if (!loading && hasMore) {
                                    const nextPage = artisanPage + 1;
                                    setArtisanPage(nextPage);
                                    fetchArtisans(nextPage, overdueArtisanSearch);
                                }
                            }}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={loading ? <Text style={{ textAlign: "center", padding: 10 }}>Loading...</Text> : null}
                        />
                        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10 }}>
                            <TouchableOpacity style={styles.clearButton} onPress={() => { setOverdueSelectedArtisans([]); setOverdueArtisanSearch(""); }}>
                                <Text style={{ color: "#fff", fontWeight: "600" }}>Clear</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.updateButton} onPress={() => setShowOverdueArtisanModal(false)}>
                                <Text style={{ color: "#fff", fontWeight: "600" }}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Table */}
            {overdueTableData.length > 0 ? (
                <FlatList
                    data={overdueTableData}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 5 }}
                    renderItem={({ item, index }) => (
                        <View style={styles.card}>
                            <Text style={styles.cardNumber}>#{index + 1}</Text>
                            <View style={styles.overdueBadge}>
                                <Text style={styles.overdueBadgeText}>
                                    Overdue ({item.daysOverdue} days)
                                </Text>
                            </View>
                            <View style={styles.imageWrapper}>
                                <FallbackImage
                                    fileName={item.design}
                                    style={{ width: "100%", height: "100%" }}
                                    onPress={(url) => {
                                        setFullscreenImage(url);
                                        setSelectedItem(item);
                                    }}
                                />
                            </View>
                            <View style={styles.detailsBox}>
                                <View style={styles.detailContainer}>
                                    <View style={styles.detailRow}><Text style={[styles.highlights, {width: wp("30%")}]}>DESIGN:</Text><Text style={[styles.highlight, {width: wp("40%"), marginRight: wp("5%")}]}>{item.design}</Text></View>
                                    <View style={styles.detailRow}><Text style={[styles.highlights, {width: wp("30%")}]}>SNO:</Text><Text style={[styles.highlight, {width: wp("40%"), marginRight: wp("5%")}]}>{item.sNo}</Text></View>
                                    <View style={styles.detailRow}><Text style={[styles.highlights, {width: wp("30%")}]}>ORDER NO:</Text><Text style={[styles.highlight, {width: wp("40%"), marginRight: wp("5%")}]}>{item.orderNo}</Text></View>
                                </View>
                                <View style={styles.detailRow}><Text style={styles.label}>Weight:</Text><Text style={styles.value}>{item.weight}</Text><Text style={styles.label}>Size:</Text><Text style={styles.value}>{item.size}</Text></View>
                                <View style={styles.detailRow}><Text style={styles.label}>Product:</Text><Text style={styles.value}>{item.product}</Text><Text style={styles.label}>Qty:</Text><Text style={styles.value}>{item.qty}</Text></View>
                                <View style={styles.detailRow}><Text style={styles.label}>Order Date:</Text><Text style={styles.value}>{formatDate(item.orderDate)}</Text><Text style={styles.label}>Due Date:</Text><Text style={styles.value}>{formatDate(item.dueDate)}</Text></View>
                            </View>
                        </View>
                    )}
                    onEndReached={() => {
                        if (!overdueLoading && overdueHasMore) {
                            const nextPage = overduePageNumber + 1;
                            setOverduePageNumber(nextPage);
                            const codes = artisans.filter(a => overdueSelectedArtisans.includes(a.id)).map(a => a.code);
                            fetchOverdueOrders(codes, nextPage, overdueSearch);
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={overdueLoading ? <Text style={{ textAlign: "center", padding: 10 }}>Loading...</Text> : !overdueHasMore && overdueTableData.length > 0 ? <Text style={{textAlign: 'center', padding: 10}}>No more data</Text> : null}
                />
            ) : overdueLoading ? (
                <View style={styles.emptyContainer}><Text style={styles.emptyText}>Loading...</Text></View>
            ) : overdueSelectedArtisans.length > 0 ? (
                <View style={styles.emptyContainer}>
                    <Image source={require("../asserts/Search.png")} style={styles.emptyImage} />
                    <Text style={styles.emptyText}>No data found.</Text>
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Image source={require("../asserts/Search.png")} style={styles.emptyImage} />
                    <Text style={styles.emptyText}>Select an artisan to view overdue items.</Text>
                </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => {
                        setOverdueSelectedArtisans([]);
                        setOverdueSearch("");
                        setOverdueArtisanSearch("");
                        setOverdueTableData([]);
                        setOverduePageNumber(1);
                        setOverdueHasMore(true);
                    }}
                >
                    <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );

    const renderSectionScreen = () => {
        if (activeSection === "User Creation") return renderUserCreation();
        if (activeSection === "Pending") return renderUndelivered();
        if (activeSection === "Delivered") return renderDelivered();
        if (activeSection === "Return") return renderReturn();
        if (activeSection === "Overdue") return renderOverdue();
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
                                { text: "Cancel", style: "cancel" },
                                { text: "Yes", onPress: () => navigation.navigate("Login") },
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

            <View style={styles.bannerWrapper}>
                <Image
                    source={require("../asserts/name.jpg")}
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
                        style={styles.cardDashboard}
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
    gridContainer: {
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    row: {
        justifyContent: "space-around",
    },
    cardDashboard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        width: "44%",
        elevation: 10,
        shadowColor: "#2d531a",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        margin: 10,
        padding: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    cardImage: {
        width: 80,
        height: 80,
        resizeMode: "contain",
        marginBottom: 10,
    },
    cardText: {
        fontSize: 16,
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
        borderTopWidth: 1,
        borderColor: '#eee'
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
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        marginTop: hp('10%')
    },
    emptyImage: {
        width: 180,
        height: 180,
        marginBottom: 16,
        resizeMode: "contain",
    },
    emptyText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
    },
    imageWrapper: {
        width: "100%",
        height: hp("30%"),
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 12,
        backgroundColor: 'white'
    },
    detailsBox: {
        marginTop: 8,
    },
    highlight: {
        color: "#2d531a",
        fontWeight: "bold",
        fontSize: 15,
    },
    highlights: {
        color: "rgba(120, 3, 3, 1)",
        fontWeight: "bold",
        fontSize: 15,
    },
    detailContainer: {
        backgroundColor: "#f3f9f4ff",
        padding: 10,
        borderRadius: 8,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 4,
    },
    label: {
        fontWeight: "bold",
        color: "#000",
        width: wp("20%"),
    },
    value: {
        color: "#000",
        width: wp("25%"),
        marginRight: wp("5%"),
    },
    cardNumber: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#fff',
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#2d531a',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        zIndex: 1,
    },
    detailRowFix: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 4,
    },
    detailLabel1: {
        width: "22%",
        textAlign: "left",
        fontWeight: "bold",
        fontSize: 12,
        color: "#000",
    },
    detailValue1: {
        width: "28%",
        textAlign: "left",
        fontSize: 12,
        color: "#000",
    },
    modalFooterButtons: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginVertical: 20,
    },
    modalCloseButton: {
        backgroundColor: "rgba(120,3,3,1)",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    modalShareButton: {
        backgroundColor: "#25D366",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    // Styles for Overdue Section
    overdueBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#d32f2f',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        zIndex: 1,
    },
    overdueBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    modalContent: {
        flex: 1,
        borderWidth: 2,
        borderColor: "#000",
        margin: 10,
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    modalImageContainer: {
        width: '100%',
        height: '75%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenImageStyle: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    modalDetailsContainer: {
        width: "95%",
        marginTop: 20,
        borderTopWidth: 1,
        borderColor: "#eee",
        paddingTop: 10,
    },
});