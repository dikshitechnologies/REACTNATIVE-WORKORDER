import React, { useState, useEffect } from "react";
import { useRef } from "react";
import ViewShot, { captureRef } from "react-native-view-shot";
import Share from "react-native-share";
import RNPrint from "react-native-print";

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
const DeliveredReports = ({ navigation, route }) => {
  const user = route?.params?.user;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // to hold the tapped image's data
  const viewRef = useRef(); // to capture the fullscreen image with text

  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const backAction = () => {
      navigation.replace("ArtisansReport", { user });
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [navigation]);

  const clearAll = () => {
    setSearch("");
    setPage(1);
    fetchReports("", 1, false);
  };

  // ✅ fallback image that resolves its own URL
  const FallbackImage = ({ fileName, style, onPress }) => {
    const [uriIndex, setUriIndex] = useState(0);
    const [resolvedUrl, setResolvedUrl] = useState(null);

    const extensions = [".jpg", ".jpeg", ".png"];
    const sources = extensions.map((ext) => `${IMG_URL}${fileName}${ext}`);

    return (
      <TouchableOpacity
        onPress={() => resolvedUrl && onPress(resolvedUrl)}
        style={style}
      >
        <Image
          source={{ uri: sources[uriIndex] }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
          onError={() => {
            if (uriIndex < sources.length - 1) {
              setUriIndex(uriIndex + 1);
            } else {
              console.log("❌ No valid image found for", fileName);
            }
          }}
          onLoad={() => setResolvedUrl(sources[uriIndex])}
        />
      </TouchableOpacity>
    );
  };

  // ✅ fetch delivered reports with search + paging
  const fetchReports = async (query = "", pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const url = `${BASE_URL}ItemTransaction/GetDeliveryAdmin?cusCodes=${user?.fCode}&search=${query}&pageNumber=${pageNum}&pageSize=30`;
      console.log("📡 Fetching delivered reports:", url);

      const res = await axios.get(url);

      if (Array.isArray(res.data)) {
        const mapped = res.data.map((item, index) => ({
          // ✅ stable unique ID
          id:
            item.fTransaId?.toString() ||
            item.fIssueNo?.toString() ||
            `${pageNum}-${index}`,
          globalIndex: (pageNum - 1) * 30 + (index + 1),
          issueNo: item.fIssueNo,
          orderNo: item.fOrderNo,
          orderDate: item.fOrderDate,
          orderType: item.fOrderType,
          product: item.fProduct,
          design: item.fDesign,
          weight: item.fWeight,
          size: item.fSize || "N/A",
          qty: item.fQty,
          purity: item.fPurity,
          theme: item.fTheme,
          sNo: item.fSNo,
          status: item.fconfirmStatus === "Y" ? "Delivered" : "Pending",
        }));

        setReports((prev) => (append ? [...prev, ...mapped] : mapped));
        setHasMore(res.data.length === 30);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.log("❌ Error fetching delivered reports:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ✅ Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchReports(search, 1, false);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Card number */}
      <Text style={styles.cardNumber}>#{item.globalIndex}</Text>

      {/* Product Image */}
      <FallbackImage
        fileName={item.design}
        style={styles.imageWrapper}
        onPress={(url) => {
          setSelectedItem(item);
          setFullscreenImage(url);
        }}

      />

      {/* Details - reordered */}
      <View style={styles.detailsBox}>

        {/* Design + S.No (highlighted) */}
        <View style={styles.detailContainer}>
          <View style={styles.detailRow}>
            <Text style={[{
              fontWeight: "bold",

              width: wp("30%"),
            }, styles.highlightLabel]}>DESIGN:</Text>
            <Text style={[{

              width: wp("40%"),
              marginRight: wp("5%"),
            }, styles.highlightValue]}>{item.design}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[{
              fontWeight: "bold",

              width: wp("30%"),
            }, styles.highlightLabel]}>SNO:</Text>
            <Text style={[{

              width: wp("40%"),
              marginRight: wp("5%"),
            }, styles.highlightValue]}>{item.sNo}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[{
              fontWeight: "bold",

              width: wp("30%")
            }, styles.highlightLabel]}>ORDER NO:</Text>
            <Text style={[styles.highlightValue, {

              width: wp("40%"),
              marginRight: wp("5%"),
            }]}>{item.orderNo}</Text>
          </View>
        </View>


        {/* Weight + Size */}
        <View style={styles.detailRow}>
          <Text style={styles.label}>Weight:</Text>
          <Text style={styles.value}>{item.weight}</Text>
          <Text style={styles.label}>Size:</Text>
          <Text style={styles.value}>{item.size}</Text>
        </View>

        {/* Order No + Qty */}
        <View style={styles.detailRow}>
          {/* <Text style={styles.label}>Order Date:</Text>
          <Text style={styles.value}>
            {new Date(item.orderDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </Text> */}
          <Text style={styles.label}>Qty:</Text>
          <Text style={styles.value}>{item.qty}</Text>
        </View>


        {/* <View style={styles.detailRow}>
         
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
        </View> */}

        {/* Product */}

      </View>
    </View>
  );
const printImage = async () => {
  try {
    if (!viewRef.current) return;

    const uri = await captureRef(viewRef, {
      format: "png",
      quality: 1,
    });

    await RNPrint.print({ filePath: uri });
  } catch (e) {
    console.log("❌ Print error:", e);
  }
};

  const shareToWhatsApp = async () => {
    try {
      if (!viewRef.current || !selectedItem) return;

      // Capture screenshot of the fullscreen view (image + overlay text)
      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 0.9,
      });

      const shareOptions = {
        title: "Share via WhatsApp",
        message: `S.No: ${selectedItem.sNo}\nWeight: ${selectedItem.weight}\nSize: ${selectedItem.size}\nQty: ${selectedItem.qty}`,
        url: uri,
        social: Share.Social.WHATSAPP,
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.log("❌ Error sharing:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-undo" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Delivered</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* fullscreen image */}
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
              {/* Product Image */}
              <Image
                source={{ uri: fullscreenImage }}
                style={{
                  width: "80%",
                  height: "75%",
                  resizeMode: "contain",
                }}
              />

              {/* SNo, Wt, Size, Qty details */}
              {selectedItem && (
                <View
                  style={{
                    width: "90%",
                    marginTop: 20,
                    backgroundColor: "#fff",
                    borderTopWidth: 1,
                    borderColor: "#fcfcfcff",
                    paddingTop: 10,
                  }}
                >
                  {/* Row 1 */}
                  <View style={styles.detailRowFix}>
                    <Text style={styles.detailLabel1}>SNo :</Text>
                    <Text style={styles.detailValue1}>{selectedItem.sNo}</Text>

                    <Text style={styles.detailLabel1}>Weight :</Text>
                    <Text style={styles.detailValue1}>{selectedItem.weight}</Text>
                  </View>

                  {/* Row 2 */}
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
          <View
  style={{
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 20,
  }}
>
  <TouchableOpacity
    onPress={() => setFullscreenImage(null)}
    style={{
      backgroundColor: "rgba(120,3,3,1)",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
    }}
  >
    <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={shareToWhatsApp}
    style={{
      backgroundColor: "#25D366",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
    }}
  >
    <Ionicons name="logo-whatsapp" size={22} color="#fff" style={{ marginRight: 8 }} />
    <Text style={{ color: "#fff", fontWeight: "bold" }}>Share</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={printImage}
    style={{
      backgroundColor: "#2d531a",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
    }}
  >
    <Ionicons name="print" size={22} color="#fff" style={{ marginRight: 8 }} />
    <Text style={{ color: "#fff", fontWeight: "bold" }}>Print</Text>
  </TouchableOpacity>
</View>

        </SafeAreaView>
      </Modal>


      {/* Search bar */}
      <View style={{ padding: 12 }}>
        <View
          style={[
            styles.inputContainer,
            { flexDirection: "row", alignItems: "center" },
          ]}
        >
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Search Product / Design / Order / SNo..."
            placeholderTextColor="#7c7c7c"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                fetchReports("");
              }}
            >
              <Ionicons
                name="close-circle"
                size={24}
                color="#7c7c7c"
                style={{ marginHorizontal: 6 }}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Cards list */}
      {loading && page === 1 ? (
        <ActivityIndicator
          size="large"
          color="#2d531a"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Image
                source={require("../asserts/Search.png")}
                style={styles.emptyImage}
              />
              <Text style={styles.emptyText}>No delivered reports found.</Text>
            </View>
          }
          onEndReached={() => {
            if (!loading && hasMore) {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchReports(search, nextPage, true);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading &&
            page > 1 && (
              <ActivityIndicator
                size="small"
                color="#2d531a"
                style={{ margin: 10 }}
              />
            )
          }
          // ✅ performance optimizations
          initialNumToRender={10}
          maxToRenderPerBatch={15}
          windowSize={7}
          removeClippedSubviews={true}
        />
      )}

      {/* footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};


export default DeliveredReports;

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
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginVertical: 3,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    //marginRight: wp("%")
  },

  label: {
    fontWeight: "bold",
    color: "#000",
    width: wp("20%"),   // fixed width for alignment
  },

  value: {
    color: "#000",
    width: wp("25%"),
    marginRight: wp("5%"),
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
  imageWrapper: {
    width: "100%",
    height: hp("30%"),
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
  },
  detailsBox: {
    marginTop: 8,
  },
  bold: {
    fontWeight: "bold",
    color: "#000",
  },
  detailRowFix: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },

  detailLabel: {
    width: "25%",        // equal width columns
    textAlign: "left",
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },

  detailValue: {
    width: "25%",        // equal width columns
    textAlign: "left",
    fontSize: 16,
    color: "#000",
  },
 detailLabel1: {
    width: "20%",        // equal width columns
    textAlign: "left",
    fontWeight: "bold",
    fontSize: 12,
    color: "#000",
  },

  detailValue1: {
    width: "35%",        // equal width columns
    textAlign: "left",
    fontSize: 11,
    color: "#000",
  },
  highlightValue: {
    color: "#2d531a",   // Dark green (matches your theme)
    fontWeight: "bold",
    fontSize: 15,
  },
  highlightLabel: {
    color: "rgba(120, 3, 3, 1)",   // Dark green (matches your theme)
    fontWeight: "bold",
    fontSize: 15,
  },
  detailContainer: {
    backgroundColor: "#f3f9f4ff", // light background
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },

});
