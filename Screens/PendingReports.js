import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const PendingReports = ({ navigation }) => {
  const [reports, setReports] = useState([
    {
      id: "1",
      sno: "1",
      name: "Dinesh",
      design: "MCZNS41460",
      orderNo: "5143SO2600760-003",
      orderDate: "29-08-2025",
      weight: "28.000",
      size: "24",
      qty: "1",
      image:
        "https://i.pinimg.com/736x/18/ca/9e/18ca9e91ae302ca3648934e3a31945b7.jpg",
    },
    {
      id: "2",
      sno: "2",
      name: "Kumar",
      design: "MCZNS41492",
      orderNo: "5139SO2600970-001",
      orderDate: "29-08-2025",
      weight: "20.000",
      size: "26",
      qty: "1",
      image:
        "https://i.pinimg.com/1200x/b0/60/64/b060644772a4145f02f778ab3aeb9266.jpg",
    },
    {
      id: "3",
      sno: "3",
      name: "Arun",
      design: "MCZNS41481",
      orderNo: "5405SO2600879-004",
      orderDate: "29-08-2025",
      weight: "64.000",
      size: "26",
      qty: "1",
      image:
        "https://i.pinimg.com/736x/3f/64/fc/3f64fcafaea6060183f828bcf7ea243a.jpg",
    },
  ]);

  const [expandedId, setExpandedId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

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

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
      setSelectAll(false);
    } else {
      setSelectedRows(reports.map((item) => item.id));
      setSelectAll(true);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.rowContainer}>
      {/* Row */}
      <View style={styles.row}>
        {/* Select Checkbox */}
        <TouchableOpacity
          style={[styles.cell, { flex: 0.6 }]}
          onPress={() => toggleRow(item.id)}
        >
          <Ionicons
            name={selectedRows.includes(item.id) ? "checkbox" : "square-outline"}
            size={22}
            color="#2d531a"
          />
        </TouchableOpacity>

        <Text style={[styles.cell, { flex: 0.6 }]}>{item.sno}</Text>
        <Text style={[styles.cell, { flex: 1.2 }]}>{item.name}</Text>
        <Text style={[styles.cell, { flex: 1.5 }]}>{item.design}</Text>
        <Text
          style={[styles.cell, { flex: 2 }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.orderNo}
        </Text>

        {/* Eye Icon */}
        <TouchableOpacity
          onPress={() => toggleExpand(item.id)}
          style={[styles.cell, { flex: 0.8 }]}
        >
          <Ionicons
            name={expandedId === item.id ? "eye-off" : "eye"}
            size={22}
            color="#2d531a"
          />
        </TouchableOpacity>
      </View>

      {/* Expanded Section */}
      {expandedId === item.id && (
        <View style={styles.details}>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailText}>S.No: {item.sno}</Text>
            <Text style={styles.detailText}>Name: {item.name}</Text>
            <Text style={styles.detailText}>Design: {item.design}</Text>
            <Text style={styles.detailText}>Order No: {item.orderNo}</Text>
            <Text style={styles.detailText}>Order Date: {item.orderDate}</Text>
            <Text style={styles.detailText}>Weight: {item.weight}</Text>
            <Text style={styles.detailText}>Size: {item.size}</Text>
            <Text style={styles.detailText}>Quantity: {item.qty}</Text>
          </View>
          <Image source={{ uri: item.image }} style={styles.image} />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-undo" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Pending Reports</Text>
        <View style={{ width: 26 }} /> 
      </View>

      {/* Filter Fields Section */}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.input}
          placeholder="Issue No"
          placeholderTextColor="#777"
        />
        <TouchableOpacity style={styles.input}>
          <Text style={styles.dateText}>Date</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.input}>
          <Text style={styles.dateText}>Due Date</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Artisan Name"
          placeholderTextColor="#777"
        />
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search" size={18} color="#fff" />
          <Text style={styles.searchText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Select All Button */}
      <View style={styles.selectAllContainer}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={toggleSelectAll}
        >
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

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 0.6 }]}>Select</Text>
        <Text style={[styles.headerCell, { flex: 0.6 }]}>S.No</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>Name</Text>
        <Text style={[styles.headerCell, { flex: 1.5 }]}>Design</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Order No</Text>
        <Text style={[styles.headerCell, { flex: 0.8 }]}>View</Text>
      </View>

      {/* Data Rows */}
      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
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

  // 🔹 Filter Fields
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    flexBasis: "48%",
  },
  dateText: { color: "#555" },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "green",
    padding: 10,
    borderRadius: 6,
    justifyContent: "center",
    flexBasis: "48%",
  },
  searchText: { color: "#fff", marginLeft: 5, fontWeight: "bold" },

  // 🔹 Select All
  selectAllContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#eef9f1",
  },

  // 🔹 Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e6e6e6",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  headerCell: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  rowContainer: { borderBottomWidth: 1, borderBottomColor: "#ccc" },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    alignItems: "center",
  },
  cell: { fontSize: 14, textAlign: "center" },

  // 🔹 Expanded Details
  details: {
    flexDirection: "row",
    backgroundColor: "#eef9f1",
    padding: 12,
  },
  detailText: { fontSize: 14, marginVertical: 2, color: "#2d531a" },
  image: {
    width: 100,
    height: 150,
    resizeMode: "contain",
    marginLeft: 10,
  },
});
