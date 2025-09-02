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

const PendingReports = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]); // ✅ keep original
  const [expandedId, setExpandedId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);

  // artisan + issue popup states
  const [showArtisanModal, setShowArtisanModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [artisans, setArtisans] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selectedArtisan, setSelectedArtisan] = useState("");
  const [selectedIssue, setSelectedIssue] = useState("");

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

  // ✅ Fetch reports
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
          artisan: item.fAcname || "", // 👈 if API returns artisan name
        }));
        setReports(mapped);
        setAllReports(mapped);
        setIssues([...new Set(mapped.map((x) => x.issueNo))]); // unique issue numbers
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch artisans list
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

  // ✅ Apply filters
  const applyFilters = () => {
    let filtered = allReports;

    if (selectedIssue) {
      filtered = filtered.filter((r) => r.issueNo === selectedIssue);
    }
    if (selectedArtisan) {
      filtered = filtered.filter((r) =>
        selectedArtisan.includes(r.artisan)
      );
    }

    setReports(filtered);
  };

  // ✅ Expand row
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // ✅ Select row
  const toggleRow = (id) => {
    if (selectedRows.includes(id)) {
      const newRows = selectedRows.filter((i) => i !== id);
      setSelectedRows(newRows);
      setSelectAll(newRows.length === reports.length);
    } else {
      const newRows = [...selectedRows, id];
      setSelectedRows(newRows);
      setSelectAll(newRows.length === reports.length);
    }
  };

  // ✅ Select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
      setSelectAll(false);
    } else {
      setSelectedRows(reports.map((item) => item.id));
      setSelectAll(true);
    }
  };

  // ✅ Clear + Update actions
  const clearSelection = () => {
    setSelectedRows([]);
    setSelectedArtisan("");
    setSelectedIssue("");
    setReports(allReports); // reset list
    setSelectAll(false);
    setExpandedId(null);
  };

  const updateData = () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one row to update.");
      return;
    }
    // Replace with your API call
    alert("Update triggered for rows: " + JSON.stringify(selectedRows));
  };

  // ✅ Row rendering
  const renderItem = ({ item, index }) => (
    <View style={{ borderBottomWidth: 1, borderColor: "#ccc" }}>
      <View style={styles.row}>
        {/* Checkbox */}
        <TouchableOpacity
          style={{ width: 50 }}
          onPress={() => toggleRow(item.id)}
        >
          <Ionicons
            name={selectedRows.includes(item.id) ? "checkbox" : "square-outline"}
            size={22}
            color="#2d531a"
          />
        </TouchableOpacity>

        <Text style={{ width: 30, textAlign: "center" }}>{index + 1}</Text>
        <Text style={{ width: 100 }}>{item.product}</Text>
        <Text style={{ width: 100 }}>{item.design}</Text>
        <Text style={{ width: 100 }}>{item.orderNo}</Text>

        {/* Eye Icon */}
        <TouchableOpacity style={{ width: 50 }} onPress={() => toggleExpand(item.id)}>
          <Ionicons
            name={expandedId === item.id ? "eye-off" : "eye"}
            size={22}
            color="#2d531a"
          />
        </TouchableOpacity>
      </View>

      {/* Expanded details */}
      {expandedId === item.id && (
        <View style={styles.details}>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailText}>Issue No: {item.issueNo}</Text>
            <Text style={styles.detailText}>Order No: {item.orderNo}</Text>
            <Text style={styles.detailText}>Order Date: {item.orderDate}</Text>
            <Text style={styles.detailText}>Order Type: {item.orderType}</Text>
            <Text style={styles.detailText}>Product: {item.product}</Text>
            <Text style={styles.detailText}>Design: {item.design}</Text>
            <Text style={styles.detailText}>Weight: {item.weight}</Text>
            <Text style={styles.detailText}>Size: {item.size}</Text>
            <Text style={styles.detailText}>Qty: {item.qty}</Text>
            <Text style={styles.detailText}>Purity: {item.purity}</Text>
            <Text style={styles.detailText}>Theme: {item.theme}</Text>
            <Text style={styles.detailText}>Status: {item.status}</Text>
          </View>

          <FallbackImage
            fileName={item.design}
            style={{ width: 120, height: 150, marginLeft: 10 }}
          />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-undo" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Pending Reports</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={{ flexBasis: "48%" }} onPress={() => setShowIssueModal(true)}>
          <TextInput
            style={styles.input}
            placeholder="Issue No"
            value={selectedIssue}
            editable={false}
          />
        </TouchableOpacity>

        <TouchableOpacity style={{ flexBasis: "48%" }} onPress={() => setShowArtisanModal(true)}>
          <TextInput
            style={styles.input}
            placeholder="Artisan Name"
            value={selectedArtisan}
            editable={false}
          />
        </TouchableOpacity>
      </View>

      {/* Select All */}
      <View style={styles.selectAllContainer}>
        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={toggleSelectAll}>
          <Ionicons
            name={selectAll ? "checkbox" : "square-outline"}
            size={22}
            color="#2d531a"
          />
          <Text style={{ marginLeft: 8, fontWeight: "600", color: "#2d531a" }}>
            Select All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Table */}
      <ScrollView horizontal>
        <View style={{ flex: 1 }}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={{ width: 50, fontWeight: "bold" }}>Select</Text>
            <Text style={{ width: 30, fontWeight: "bold" }}>#</Text>
            <Text style={{ width: 100, fontWeight: "bold" }}>Product</Text>
            <Text style={{ width: 100, fontWeight: "bold" }}>Design</Text>
            <Text style={{ width: 100, fontWeight: "bold" }}>Order No</Text>
            <Text style={{ width: 50, fontWeight: "bold" }}>View</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#2d531a" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={reports}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 450 }}
            />
          )}
        </View>
      </ScrollView>

      {/* Issue Modal */}
      <Modal visible={showIssueModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Issue No</Text>
            <FlatList
              data={issues}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => setSelectedIssue(item)}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSelectedIssue("")}
              >
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.updateButton}
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

      {/* Artisan Modal */}
      <Modal visible={showArtisanModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Artisan</Text>
            <FlatList
              data={artisans}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => setSelectedArtisan(`${item.name} (${item.code})`)}
                >
                  <Text>{item.name} ({item.code})</Text>
                </TouchableOpacity>
              )}
            />
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSelectedArtisan("")}
              >
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.updateButton}
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

      {/* Footer */}
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
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2d531a",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: { padding: 4 },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },

  // Filters
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    backgroundColor: "#fff",
    color: "#000",
  },

  // Select All
  selectAllContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#eef9f1",
  },

  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e6e6e6",
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  row: {
    flexDirection: "row",
    padding: 8,
    alignItems: "center",
  },

  // Expanded
  details: {
    flexDirection: "row",
    backgroundColor: "#eef9f1",
    padding: 12,
  },
  detailText: { fontSize: 14, marginVertical: 2, color: "#2d531a" },

  // Modal
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
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  // Footer
  footer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
  },
  clearButton: {
    backgroundColor: "rgba(120, 3, 3, 1)",
    padding: 14,
    borderRadius: 10,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  updateButton: {
    backgroundColor: "#2d531a",
    padding: 14,
    borderRadius: 10,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
