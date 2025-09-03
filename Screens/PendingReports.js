import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { BASE_URL, IMG_URL } from "./Links";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import ImageViewer from "react-native-image-zoom-viewer";
import { BackHandler } from "react-native";
const PendingReports = ({ navigation, route }) => {
  useEffect(() => {
    const backAction = () => {

      navigation.replace("ArtisansReport", { user }); // or navigation.navigate("Login")
      return true; // prevent default exit

    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const user = route?.params?.user;
  const clearAll = () => {
    setSearch("");
    setExpandedId(null);
    fetchReports(""); // reload everything
  };

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [validUrl, setValidUrl] = useState(null);
  const [search, setSearch] = useState(""); // 🔎 single search

  // fallback image
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
        onLoad={() => onSuccess && onSuccess(sources[uriIndex])}
      />
    );
  };

  // fetch reports with search
  const fetchReports = async (query = "") => {
    try {
      setLoading(true);

      const url = `${BASE_URL}ItemTransaction/GetPendingByCustomer?cusCode=${user?.fCode}&search=${query}&pageNumber=1&pageSize=30`;
      console.log("📡 Fetching reports from:", url);

      const res = await axios.get(url);
      console.log("✅ API Response:", res.data);

      if (res.data?.data && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map((item, index) => ({
          id: index.toString(),
          issueNo: item.fIssueNo,
          orderNo: item.fOrderNo,
          orderDate: item.fOrderDate,
          orderType: item.fOrderType,
          product: item.fProduct,
          design: item.fDesign,
          weight: item.fWeight,
          size: item.fSize,
          qty: item.fQty,
          purity: item.fPurity,
          theme: item.fTheme,
          sNo: item.fSNo,
          status: item.fStatus === "N" ? "Pending" : "Confirmed",
          transaId: item.fTransaId,
          artisan: item.fAcname || "",
        }));
        setReports(mapped);
      } else if (res.data?.message) {
        console.log("⚠️ API Message:", res.data.message);
        setReports([]); // clear reports list
      } else {
        console.log("⚠️ Unexpected API format:", res.data);
        setReports([]);
      }
    } catch (err) {
      // 404 or any API error → just clear reports silently
      setReports([]);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchReports(); // first load
  }, []);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderItem = ({ item, index }) => (
    <View style={{ borderBottomWidth: 1, borderColor: "#ccc" }}>
      <View style={styles.row}>
        <Text style={{ width: wp("7%") }}>{index + 1}</Text>
        <Text style={{ width: wp("28%") }}>{item.product}</Text>
        <Text style={{ width: wp("28%") }}>{item.design}</Text>
        <Text style={{ width: wp("20%") }}>{item.orderNo}</Text>

        <TouchableOpacity style={{ width: wp("12%") }} onPress={() => toggleExpand(item.id)}>
          <Ionicons
            name={expandedId === item.id ? "eye-off" : "eye"}
            size={24}
            color="#2d531a"
          />
        </TouchableOpacity>
      </View>

      {expandedId === item.id && (
        <View style={styles.details}>
          <View style={styles.detailsLeft}>
            <Text style={styles.detailText}><Text style={{ fontWeight: "bold" }}>Issue No: </Text>{item.issueNo}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: "bold" }}>Order No: </Text>{item.orderNo}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: "bold" }}>Order Date: </Text>{item.orderDate}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: "bold" }}>Order Type: </Text>{item.orderType}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: "bold" }}>Product: </Text>{item.product}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: "bold" }}>Design: </Text>{item.design}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: "bold" }}>Weight: </Text>{item.weight}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: "bold" }}>Size: </Text>{item.size}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: "bold" }}>Qty: </Text>{item.qty}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: "bold" }}>Purity: </Text>{item.purity}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: "bold" }}>Theme: </Text>{item.theme}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: "bold" }}>Status: </Text>{item.status}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setFullscreenImage(validUrl)}
            style={styles.detailsRightImage}
          >
            <FallbackImage
              fileName={item.design}
              style={{ width: "100%", height: "100%" }}
              onSuccess={(url) => setValidUrl(url)}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-undo" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Pending</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* fullscreen image */}
      <Modal visible={!!fullscreenImage} transparent onRequestClose={() => setFullscreenImage(null)}>
        <ImageViewer
          imageUrls={[{ url: fullscreenImage }]}
          enableSwipeDown
          onSwipeDown={() => setFullscreenImage(null)}
          onCancel={() => setFullscreenImage(null)}
          saveToLocalByLongPress={false}
        />
      </Modal>

      {/* 🔎 Search bar with clear */}
      <View style={{ padding: 12 }}>
        <View style={[styles.inputContainer, { flexDirection: "row", alignItems: "center" }]}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Search Product / Design / Issue / Artisan..."
            placeholderTextColor="#7c7c7c"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(""); fetchReports(""); }}>
              <Ionicons name="close-circle" size={24} color="#7c7c7c" style={{ marginHorizontal: 6 }} />
            </TouchableOpacity>
          )}

        </View>
      </View>

      {/* table */}
      <ScrollView horizontal style={{ marginBottom: 80 }}>
        <View style={{ flex: 1 }}>
          <View style={styles.tableHeader}>
            <Text style={{ width: wp("7%"), fontWeight: "700" }}>#</Text>
            <Text style={{ width: wp("28%"), fontWeight: "700" }}>Product</Text>
            <Text style={{ width: wp("28%"), fontWeight: "700" }}>Design</Text>
            <Text style={{ width: wp("20%"), fontWeight: "700" }}>Order No</Text>
            <Text style={{ width: wp("12%"), fontWeight: "700" }}>View</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#2d531a" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={reports}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: hp("70%") }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Image source={require("../asserts/Search.png")} style={styles.emptyImage} />
                  <Text style={styles.emptyText}>
                    No pending reports found.
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.clearButton} onPress={clearAll} >
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


export default PendingReports;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9f5" },
  header: {
    paddingTop: 40,
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
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    color: "#000",
    width: wp("85%"),
    marginRight: 8,
    backgroundColor: '#fff',
  },
  selectAllContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingLeft: wp('3%')
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ccc",
    padding: 8,
  },
  row: {
    flexDirection: "row",
    padding: 8,
    alignItems: "center",
  },
  details: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: wp("3%"),
    backgroundColor: "#eaf5ea",
  },
  detailsLeft: {
    flexShrink: 1,
    maxWidth: wp("65%"),
    paddingRight: wp("3%"),
  },
  detailText: {
    fontSize: 14,
    marginVertical: 1,
    color: "#000",
  },
  detailsRightImage: {
    width: wp("45%"),
    height: hp("25%"),
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: wp("3%"),
    overflow: "hidden",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#2d531a'
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  modalClearButton: {
    backgroundColor: "rgba(120, 3, 3, 1)",
    padding: 14,
    borderRadius: 10,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  modalApplyButton: {
    backgroundColor: "#2d531a",
    padding: 14,
    borderRadius: 10,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
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
  searchBar: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    color: '#000',
  },
  emptyListText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
});