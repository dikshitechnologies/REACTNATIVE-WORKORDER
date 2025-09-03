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

const PendingReports = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [validUrl, setValidUrl] = useState(null);
  const [issueSearch, setIssueSearch] = useState("");
  const [artisanSearch, setArtisanSearch] = useState("");
  // Artisan + issue popup states
  const [showArtisanModal, setShowArtisanModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [artisans, setArtisans] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selectedArtisan, setSelectedArtisan] = useState("");
  const [selectedIssue, setSelectedIssue] = useState("");

  // Fallback image component
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
          if (onSuccess) onSuccess(sources[uriIndex]);
        }}
      />
    );
  };

  // Fetch reports
  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}ItemTransaction/GetPendingByCustomer?cusCode=00103&pageNumber=1&pageSize=30`
      );
      if (res.data && res.data.data) {
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
        setAllReports(mapped);
        setIssues([...new Set(mapped.map((x) => x.issueNo))]);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch artisans list
  const fetchArtisans = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}Party/GetPartyList?search=&pageNumber=1&pageSize=30`
      );
      const data = await res.json();
      if (data && data.data) {
        const mapped = data.data.map((item, index) => ({
          id: index.toString(),
          code: item.fCode,
          name: item.fAcname,
        }));
        setArtisans(mapped);
      }
    } catch (err) {
      console.error("Error fetching artisans:", err);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchArtisans();
  }, []);

  // Apply filters
  const applyFilters = () => {
    let filtered = allReports;

    if (selectedIssue) {
      filtered = filtered.filter((r) => r.issueNo === selectedIssue);
    }
    if (selectedArtisan) {
      filtered = filtered.filter((r) =>
        r.artisan.toLowerCase().includes(selectedArtisan.toLowerCase())
      );
    }

    setReports(filtered);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleRow = (id) => {
    const newRows = selectedRows.includes(id)
      ? selectedRows.filter((i) => i !== id)
      : [...selectedRows, id];

    setSelectedRows(newRows);
    setSelectAll(newRows.length === reports.length);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
      setSelectAll(false);
    } else {
      setSelectedRows(reports.map((item) => item.id));
      setSelectAll(true);
    }
  };

  const clearSelection = () => {
    setSelectedRows([]);
    setSelectedArtisan("");
    setSelectedIssue("");
    setReports(allReports);
    setSelectAll(false);
    setExpandedId(null);
     setArtisanSearch("");
    setIssueSearch("");

  };

  const updateData = () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one row to update.");
      return;
    }
    alert("Update triggered for rows: " + JSON.stringify(selectedRows));
  };

  const renderItem = ({ item, index }) => (
    <View style={{ borderBottomWidth: 1, borderColor: "#ccc" }}>
      <View style={styles.row}>
        <TouchableOpacity style={{ width: wp("12%") }} onPress={() => toggleRow(item.id)}>
          <Ionicons
            name={selectedRows.includes(item.id) ? "checkbox" : "square-outline"}
            size={24}
            color="#2d531a"
          />
        </TouchableOpacity>

        <Text style={{ width: wp("7%") }}>{index + 1}</Text>
        <Text style={{ width: wp("24%") }}>{item.product}</Text>
        <Text style={{ width: wp("24%") }}>{item.design}</Text>
        <Text style={{ width: wp("18%") }}>{item.orderNo}</Text>

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
            <Text style={styles.detailText}><Text style={{ fontWeight: 'bold' }}>Issue No: </Text>{item.issueNo}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: 'bold' }}>Order No: </Text>{item.orderNo}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: 'bold' }}>Order Date: </Text>{item.orderDate}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: 'bold' }}>Order Type: </Text>{item.orderType}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: 'bold' }}>Product: </Text>{item.product}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: 'bold' }}>Design: </Text>{item.design}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: 'bold' }}>Weight: </Text>{item.weight}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: 'bold' }}>Size: </Text>{item.size}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: 'bold' }}>Qty: </Text>{item.qty}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: 'bold' }}>Purity: </Text>{item.purity}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: 'bold' }}>Theme: </Text>{item.theme}</Text>
            <Text style={styles.detailText}><Text style={{ fontWeight: 'bold' }}>Status: </Text>{item.status}</Text>
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-undo" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Pending Reports</Text>
        <View style={{ width: 30 }} />
      </View>

      <Modal visible={!!fullscreenImage} transparent={true} onRequestClose={() => setFullscreenImage(null)}>
        <ImageViewer
          imageUrls={[{ url: fullscreenImage }]}
          enableSwipeDown={true}
          onSwipeDown={() => setFullscreenImage(null)}
          onCancel={() => setFullscreenImage(null)}
          saveToLocalByLongPress={false}
        />
      </Modal>

      <View style={{ padding: 12 }}>
        <TouchableOpacity onPress={() => setShowIssueModal(true)}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Select Issue No"
              placeholderTextColor={"#7c7c7cff"}
              value={selectedIssue}
              editable={false}
              pointerEvents="none"
            />
            <Ionicons name="search" size={26} color="#7c7c7c" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 12, marginBottom: 12 }}>
        <TouchableOpacity onPress={() => setShowArtisanModal(true)}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Select Artisan Name"
              placeholderTextColor={"#7c7c7cff"}
              value={selectedArtisan}
              editable={false}
              pointerEvents="none"
            />
            <Ionicons name="search" size={26} color="#7c7c7c" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal style={{ marginBottom: 80 }}>
        <View style={{ flex: 1 }}>
          <View style={styles.selectAllContainer}>
            <TouchableOpacity onPress={toggleSelectAll}>
              <Ionicons
                name={selectAll ? "checkbox" : "square-outline"}
                size={24}
                color="#2d531a"
              />
            </TouchableOpacity>
            <Text style={{ marginLeft: 8 }}>Select All</Text>
          </View>

          <View style={styles.tableHeader}>
            <Text style={{ width: wp("12%"), fontWeight: "700" }}>Select</Text>
            <Text style={{ width: wp("7%"), fontWeight: "700" }}>#</Text>
            <Text style={{ width: wp("24%"), fontWeight: "700" }}>Product</Text>
            <Text style={{ width: wp("24%"), fontWeight: "700" }}>Design</Text>
            <Text style={{ width: wp("18%"), fontWeight: "700" }}>Order No</Text>
            <Text style={{ width: wp("12%"), fontWeight: "700" }}>View</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#2d531a" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={reports}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: hp('55%') }}
              ListEmptyComponent={
                !loading ? (
                  <View style={styles.emptyContainer}>
                    <Image
                      source={require("../asserts/Search.png")}
                      style={styles.emptyImage}
                    />
                    <Text style={styles.emptyText}>
                      No pending reports found. Try changing your filters or check back later.
                    </Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </ScrollView>

      <Modal visible={showIssueModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Issue No</Text>
              <TouchableOpacity onPress={() => setShowIssueModal(false)}>
                <Ionicons name="close" size={28} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <TextInput
              style={styles.searchBar}
              placeholder="Search Issue No..."
              placeholderTextColor="#7c7c7cff"
              value={issueSearch}
              onChangeText={setIssueSearch}
            />

            {/* Scrollable List of Issues */}
            <FlatList
              data={
                issues.filter(issue =>
                  issue.toLowerCase().includes(issueSearch.toLowerCase())
                )
              }
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => setSelectedIssue(item)}
                >
                  <Ionicons
                    name={selectedIssue === item ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color="#2d531a"
                  />
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              // Optional: Add a message for when no search results are found
              ListEmptyComponent={
                <Text style={styles.emptyListText}>No issues found.</Text>
              }
            />

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalClearButton}
                onPress={() => {
                  setSelectedIssue("");
                  setIssueSearch(""); // Also clear the search bar
                }}
              >
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApplyButton}
                onPress={() => {
                  setShowIssueModal(false);
                  applyFilters();
                }}
              >
                <Text style={styles.buttonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showArtisanModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Artisan</Text>
              <TouchableOpacity onPress={() => setShowArtisanModal(false)}>
                <Ionicons name="close" size={28} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchBar}
              placeholder="Search Artisan..."
              placeholderTextColor="#7c7c7cff"
              value={artisanSearch}
              onChangeText={setArtisanSearch}
            />
            <FlatList
              data={
                artisans.filter(artisan =>
                  artisan.name.toLowerCase().includes(artisanSearch.toLowerCase()) ||
                  artisan.code.toLowerCase().includes(artisanSearch.toLowerCase())
                )
              }
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => setSelectedArtisan(item.name)}
                >
                  <Ionicons name={selectedArtisan === item.name ? "radio-button-on" : "radio-button-off"} size={22} color="#2d531a" />
                  <Text style={styles.modalItemText}>{item.name} ({item.code})</Text>
                </TouchableOpacity>
              )}
            />
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalClearButton}
                onPress={() =>{setSelectedArtisan(""), setArtisanSearch("")} }
              >
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApplyButton}
                onPress={() => {
                  setShowArtisanModal(false);
                  applyFilters();
                }}
              >
                <Text style={styles.buttonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
};

export default PendingReports;

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