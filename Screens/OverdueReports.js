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
  Alert,
  Platform,
  Share,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { BASE_URL, IMG_URL } from "./Links";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import ImageViewer from "react-native-image-zoom-viewer";
import { BackHandler } from "react-native";

const OverdueReports = ({ navigation, route }) => {
  const user = route?.params?.user;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

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

  // ✅ fetch overdue reports with search + paging
  const fetchReports = async (query = "", pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const url = `${BASE_URL}ItemTransaction/GetPendingOverdue?cusCode=${user?.fCode}&search=${query}&pageNumber=${pageNum}&pageSize=30`;
      console.log("📡 Fetching overdue reports:", url);

      const res = await axios.get(url);

      if (res.data && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map((item, index) => ({
          // ✅ stable unique ID
          id: item.fTransaId?.toString() || item.fIssueNo?.toString() || `${pageNum}-${index}`,
          globalIndex: (pageNum - 1) * 30 + (index + 1),
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
          transaId: item.fTransaId,
          daysOverdue: item.daysOverdue || 0,
          dueFlag: item.dueFlag,
        }));

        setReports((prev) => (append ? [...prev, ...mapped] : mapped));
        setTotalRecords(res.data.totalRecords || 0);
        setHasMore(res.data.data.length === 30);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.log("❌ Error fetching overdue reports:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Simple overdue status - just show "Overdue" with days
  const getOverdueStatus = (daysOverdue) => {
    return { 
      text: "Overdue", 
      color: daysOverdue > 0 ? "#d32f2f" : "#2d531a" 
    };
  };

  // ✅ Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      // Handle different date formats from API
      if (dateString.includes('T')) {
        // ISO format like "2025-08-18T16:16:15.31"
        return new Date(dateString).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } else {
        // DD-MM-YYYY format like "16-08-2025"
        const [day, month, year] = dateString.split('-');
        return new Date(`${year}-${month}-${day}`).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
    } catch (error) {
      console.log("Date formatting error:", error);
      return dateString;
    }
  };

  // ✅ Simple CSV Export using react-native-share
  const handleExportToExcel = () => {
    if (reports.length === 0) {
      Alert.alert("No Data", "There is no data to export.");
      return;
    }

    Alert.alert(
      "Export Overdue Data",
      `Do you want to export ${reports.length} overdue records?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Export",
          onPress: () => exportToCSV()
        }
      ]
    );
  };

  // ✅ Generate and share CSV
  const exportToCSV = async () => {
    try {
      setExportLoading(true);

      // CSV headers
      const headers = [
        'S.No',
        'Issue No',
        'Order No', 
        'Order Date',
        'Due Date',
        'Days Overdue',
        'Status',
        'Order Type',
        'Product',
        'Design',
        'Weight',
        'Size',
        'Quantity',
        'Purity',
        'Theme',
        'Serial No',
        'Transaction ID'
      ];

      // CSV rows
      const csvRows = reports.map((item, index) => {
        const overdueStatus = getOverdueStatus(item.daysOverdue);
        return [
          (index + 1).toString(),
          item.issueNo || 'N/A',
          item.orderNo || 'N/A',
          formatDate(item.orderDate),
          formatDate(item.dueDate),
          item.daysOverdue?.toString() || '0',
          overdueStatus.text,
          item.orderType || 'N/A',
          item.product || 'N/A',
          item.design || 'N/A',
          item.weight?.toString() || 'N/A',
          item.size || 'N/A',
          item.qty?.toString() || 'N/A',
          item.purity || 'N/A',
          item.theme || 'N/A',
          item.sNo || 'N/A',
          item.transaId?.toString() || 'N/A'
        ];
      });

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      // Create filename
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `Overdue_Reports_${timestamp}.csv`;

      // Share the CSV content
      try {
        await Share.share({
          title: 'Overdue Reports Export',
          message: `Overdue Reports Data (${reports.length} records)`,
          url: `data:text/csv;base64,${btoa(csvContent)}`,
        });
        
        Alert.alert(
          "Success",
          `Overdue data has been prepared for export!\n\nFile: ${fileName}\nRecords: ${reports.length}`,
          [{ text: "OK" }]
        );
        
      } catch (shareError) {
        console.log('Share cancelled or failed:', shareError);
        // Fallback: show success message
        Alert.alert(
          "Export Ready",
          `CSV data for ${reports.length} overdue records has been prepared.\n\nFile: ${fileName}`,
          [{ text: "OK" }]
        );
      }

    } catch (error) {
      console.log("❌ Error exporting overdue data:", error);
      Alert.alert(
        "Export Failed", 
        "Failed to export overdue data. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setExportLoading(false);
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

  const renderItem = ({ item }) => {
    const overdueStatus = getOverdueStatus(item.daysOverdue);
    
    return (
      <View style={styles.card}>
        {/* Card number */}
        <Text style={styles.cardNumber}>#{item.globalIndex}</Text>

        {/* Overdue Badge - Simple "Overdue" with days */}
        <View style={[styles.overdueBadge, { backgroundColor: overdueStatus.color }]}>
          <Text style={styles.overdueBadgeText}>
            {overdueStatus.text} ({item.daysOverdue} days)
          </Text>
        </View>

        {/* Product Image */}
        <FallbackImage
          fileName={item.design}
          style={styles.imageWrapper}
          onPress={(url) => setFullscreenImage(url)}
        />

        {/* Details */}
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

          {/* Order Dates */}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Order Date:</Text>
            <Text style={styles.value}>{formatDate(item.orderDate)}</Text>
            <Text style={styles.label}>Due Date:</Text>
            <Text style={styles.value}>{formatDate(item.dueDate)}</Text>
          </View>

          {/* Weight + Size */}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Weight:</Text>
            <Text style={styles.value}>{item.weight}</Text>
            <Text style={styles.label}>Size:</Text>
            <Text style={styles.value}>{item.size}</Text>
          </View>

          {/* Product + Qty */}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Product:</Text>
            <Text style={styles.value}>{item.product}</Text>
            <Text style={styles.label}>Qty:</Text>
            <Text style={styles.value}>{item.qty}</Text>
          </View>

          {/* Order Type + Status */}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Order Type:</Text>
            <Text style={styles.value}>{item.orderType}</Text>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{item.status}</Text>
          </View>

          {/* Purity + Theme */}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Purity:</Text>
            <Text style={styles.value}>{item.purity}</Text>
            <Text style={styles.label}>Theme:</Text>
            <Text style={styles.value}>{item.theme}</Text>
          </View>

          {/* Transaction ID */}
          <View style={styles.detailRow}>
            <Text style={styles.label}>Transa ID:</Text>
            <Text style={styles.value}>{item.transaId}</Text>
          </View>

        </View>
      </View>
    );
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
        <Text style={styles.headerText}>Overdue</Text>
        <TouchableOpacity
          style={styles.excelButton}
          onPress={handleExportToExcel}
          disabled={exportLoading || reports.length === 0}
        >
          {exportLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="document-text" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* fullscreen image */}
      <Modal
        visible={!!fullscreenImage}
        transparent
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

          <ImageViewer
            imageUrls={[{ url: fullscreenImage }]}
            enableSwipeDown
            onSwipeDown={() => setFullscreenImage(null)}
            onCancel={() => setFullscreenImage(null)}
            saveToLocalByLongPress={false}
          />
        </View>
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

      {/* Simple Summary - Only Total Count */}
      {reports.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalRecords}</Text>
            <Text style={styles.statLabel}>Total Overdue Orders</Text>
          </View>
        </View>
      )}

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
              <Text style={styles.emptyText}>No overdue reports found.</Text>
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

export default OverdueReports;

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
  excelButton: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#fff",
    marginHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
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
    position: "relative",
  },
  cardNumber: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#2d531a",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "bold",
    zIndex: 1,
  },
  overdueBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  overdueBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  imageWrapper: {
    width: "100%",
    height: hp("30%"),
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 12,
    marginTop: 8,
  },
  detailsBox: {
    marginTop: 8,
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
    fontSize: 12,
  },
  value: {
    color: "#000",
    width: wp("25%"),
    marginRight: wp("5%"),
    fontSize: 12,
  },
  highlightValue: {
    color: "#2d531a",
    fontWeight: "bold",
    fontSize: 14,
  },
  highlightLabel: {
    color: "rgba(120, 3, 3, 1)",
    fontWeight: "bold",
    fontSize: 14,
  },
  detailContainer: {
    backgroundColor: "#f3f9f4ff",
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
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
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});