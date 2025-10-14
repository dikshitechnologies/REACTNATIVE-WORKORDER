import React, { useEffect, useState, useRef } from "react";
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
  Dimensions,
  SectionList,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { BASE_URL, IMG_URL } from "./Links";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import ImageViewer from "react-native-image-zoom-viewer";
import { BackHandler } from "react-native";
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import RNPrint from "react-native-print";
import ViewShot, { captureRef } from "react-native-view-shot";
import ImageZoom from 'react-native-image-pan-zoom';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const OverdueReports = ({ navigation, route }) => {
  const user = route?.params?.user;
  const [reports, setReports] = useState([]);
  const [groupedReports, setGroupedReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const viewRef = useRef();

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

  // ✅ Group reports by issue date in ASCENDING order
  const groupReportsByIssueDate = (reportsData) => {
    const grouped = {};
    
    reportsData.forEach((item) => {
      const issueDate = item.issueDate || "Unknown Date";
      if (!grouped[issueDate]) {
        grouped[issueDate] = [];
      }
      grouped[issueDate].push(item);
    });

    // Convert to array format for SectionList and sort dates in ASCENDING order
    const sections = Object.keys(grouped)
      .sort((a, b) => new Date(a) - new Date(b)) // Sort dates ascending (oldest first)
      .map(date => ({
        title: date,
        data: grouped[date]
      }));

    return sections;
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

  // ✅ Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      // Handle different date formats from API
      if (dateString.includes('T')) {
        // ISO format like "2025-07-28T20:22:33.54"
        return new Date(dateString).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } else {
        // DD-MM-YYYY format like "28-07-2025"
        const [day, month, year] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
    } catch (error) {
      console.log("Date formatting error:", error);
      return dateString;
    }
  };

  // ✅ Format issue date for grouping (extract date part from fIssueDt)
  const formatIssueDate = (issueDtString) => {
    if (!issueDtString) return "Unknown Date";
    
    try {
      // fIssueDt format: "18-07-2025 20:30:01"
      const datePart = issueDtString.split(' ')[0]; // Get "18-07-2025"
      const [day, month, year] = datePart.split('-');
      return `${day}/${month}/${year}`; // Return in dd/mm/yyyy format
    } catch (error) {
      console.log("Issue date formatting error:", error);
      return "Unknown Date";
    }
  };

  // ✅ fetch overdue reports with search + paging
  const fetchReports = async (query = "", pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const url = `${BASE_URL}ItemTransaction/GetPendingOverdue?cusCodes=${user?.fCode}&search=${query}&pageNumber=${pageNum}&pageSize=30`;
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
          issueDate: formatIssueDate(item.fIssueDt), // Format issue date for grouping
          rawIssueDt: item.fIssueDt, // Keep original for display
          artisan: item.fAcname || "N/A",
          returnFlag: item.fReturnFlag,
        }));

        const newReports = append ? [...reports, ...mapped] : mapped;
        setReports(newReports);
        
        // Group the reports by issue date
        const grouped = groupReportsByIssueDate(newReports);
        setGroupedReports(grouped);
        
        setTotalRecords(res.data.totalRecords || 0);
        setHasMore(res.data.data.length === 30);
      } else {
        setHasMore(false);
        if (!append) {
          setReports([]);
          setGroupedReports([]);
        }
      }
    } catch (err) {
      console.log("❌ Error fetching overdue reports:", err);
      setHasMore(false);
      if (!append) {
        setReports([]);
        setGroupedReports([]);
      }
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

  // ✅ Generate Excel file
  const generateExcelFile = async () => {
    try {
      // Prepare data for Excel
      const excelData = reports.map((item, index) => ({
        "S.No": index + 1,
        "Issue No": item.issueNo || "N/A",
        "Order No": item.orderNo || "N/A",
        "Order Date": formatDate(item.orderDate),
        "Due Date": formatDate(item.dueDate),
        "Days Overdue": item.daysOverdue || 0,
        "Status": item.status || "N/A",
        "Order Type": item.orderType || "N/A",
        "Product": item.product || "N/A",
        "Design": item.design || "N/A",
        "Weight": item.weight || "N/A",
        "Size": item.size || "N/A",
        "Quantity": item.qty || "N/A",
        "Purity": item.purity || "N/A",
        "Theme": item.theme || "N/A",
        "Serial No": item.sNo || "N/A",
        "Transaction ID": item.transaId || "N/A",
        "Issue Date": item.issueDate || "N/A",
        "Artisan": item.artisan || "N/A",
        "Return Flag": item.returnFlag || "N/A",
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Overdue Reports");

      // Generate file name with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `Overdue_Reports_${timestamp}.xlsx`;
      
      // Generate file path
      let filePath = '';
      if (Platform.OS === 'android') {
        filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      } else {
        filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      }

      // Convert workbook to binary string
      const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });

      // Write file
      await RNFS.writeFile(filePath, wbout, 'ascii');
      
      console.log("✅ Excel file saved at:", filePath);
      return { filePath, fileName };

    } catch (error) {
      console.log("❌ Error generating Excel file:", error);
      throw error;
    }
  };

  // ✅ Export to Excel function with confirmation
  const handleExportToExcel = () => {
    if (reports.length === 0) {
      Alert.alert("No Data", "There is no data to export.");
      return;
    }

    // Show confirmation alert
    Alert.alert(
      "Export to Excel",
      `Do you want to export ${reports.length} overdue records to Excel?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Export",
          onPress: () => exportToExcel()
        }
      ]
    );
  };

  // ✅ Actual export function
  const exportToExcel = async () => {
    try {
      setExportLoading(true);

      const { filePath, fileName } = await generateExcelFile();

      // Open share dialog
      try {
        await Share.open({
          url: `file://${filePath}`,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          filename: fileName,
          subject: 'Overdue Reports Export',
          message: `Overdue Reports Data (${reports.length} records)`,
        });
        
        Alert.alert(
          "Success",
          `Excel file has been generated successfully!\n\nFile: ${fileName}\nRecords: ${reports.length}`,
          [{ text: "OK" }]
        );
        
      } catch (shareError) {
        console.log('Share cancelled or failed:', shareError);
        // If share is cancelled, still show success message
        Alert.alert(
          "Success",
          `Excel file has been generated successfully!\n\nFile: ${fileName}\nRecords: ${reports.length}\n\nFile saved at: ${filePath}`,
          [{ text: "OK" }]
        );
      }

    } catch (error) {
      console.log("❌ Error exporting to Excel:", error);
      Alert.alert(
        "Export Failed", 
        "Failed to export data to Excel. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setExportLoading(false);
    }
  };

  // ✅ Print function
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

  // ✅ Share to WhatsApp function
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
        message: `S.No: ${selectedItem.sNo}\nWeight: ${selectedItem.weight}\nSize: ${selectedItem.size}\nQty: ${selectedItem.qty}\nDesign: ${selectedItem.design}\nOrder No: ${selectedItem.orderNo}\nDays Overdue: ${selectedItem.daysOverdue}\nIssue Date: ${selectedItem.issueDate}`,
        url: uri,
        social: Share.Social.WHATSAPP,
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.log("❌ Error sharing:", error);
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

  // ✅ Render section header (Issue Date)
  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>
        Issue Date: {title}
      </Text>
    </View>
  );

  // ✅ Render individual item - SIMPLIFIED with only Due Date, Weight, Size, Product, Qty
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
          onPress={(url) => {
            setSelectedItem(item);
            setFullscreenImage(url);
          }}
        />

        {/* Details - SIMPLIFIED: Only Due Date, Weight, Size, Product, Qty */}
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

          {/* Due Date */}
          <View style={styles.detailRow}>
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
          {/* Image Viewer with Capture */}
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
              {/* Product image */}
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
                  centerOn={{ x: 0, y: 0, scale: 1, duration: 100 }}
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

              {/* Details section - SIMPLIFIED */}
              {selectedItem && (
                <View
                  style={{
                    width: "90%",
                    marginTop: 20,
                    backgroundColor: "#fff",
                    borderTopWidth: 1,
                    borderColor: "#ffffffff",
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

                  {/* Row 3 */}
                  <View style={styles.detailRowFix}>
                    <Text style={styles.detailLabel1}>Design :</Text>
                    <Text style={styles.detailValue1}>{selectedItem.design}</Text>

                    <Text style={styles.detailLabel1}>Product :</Text>
                    <Text style={styles.detailValue1}>{selectedItem.product}</Text>
                  </View>

                  {/* Row 4 - Overdue specific */}
                  <View style={styles.detailRowFix}>
                    <Text style={styles.detailLabel1}>Days Overdue :</Text>
                    <Text style={[styles.detailValue1, { color: '#d32f2f', fontWeight: 'bold' }]}>
                      {selectedItem.daysOverdue}
                    </Text>

                    <Text style={styles.detailLabel1}>Due Date :</Text>
                    <Text style={styles.detailValue1}>{formatDate(selectedItem.dueDate)}</Text>
                  </View>
                </View>
              )}
            </View>
          </ViewShot>

          {/* Buttons below */}
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
          {/* <View style={styles.statItem}>
            <Text style={styles.statNumber}>{groupedReports.length}</Text>
            <Text style={styles.statLabel}>Issue Dates</Text>
          </View> */}
        </View>
      )}

      {/* Grouped Cards list using SectionList */}
      {loading && page === 1 ? (
        <ActivityIndicator
          size="large"
          color="#2d531a"
          style={{ marginTop: 20 }}
        />
      ) : (
        <SectionList
          sections={groupedReports}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Image
                source={require("../asserts/Search.png")}
                style={styles.emptyImage}
              />
              <Text style={styles.emptyText}>
                {search ? `No overdue reports found for "${search}"` : "No overdue reports found."}
              </Text>
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
          stickySectionHeadersEnabled={true}
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
    justifyContent: "space-around",
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  // Section Header Styles
  sectionHeader: {
    backgroundColor: "#2d531a",
    padding: 12,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeaderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 10,
    marginTop: 5,
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
    color: "#000000ff",
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
  detailRowFix: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  detailLabel1: {
    width: "20%",
    textAlign: "left",
    fontWeight: "bold",
    fontSize: 12,
    color: "#000",
  },
  detailValue1: {
    width: "35%",
    textAlign: "left",
    fontSize: 11,
    color: "#000",
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