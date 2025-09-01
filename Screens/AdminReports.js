import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { BackHandler } from "react-native";
import { useEffect } from "react";
const AdminReports = () => {
  const [activeSection, setActiveSection] = useState(null);
  useEffect(() => {
    const backAction = () => {
      if (activeSection) {
        // If in section, go back to selection instead of exiting
        setActiveSection(null);
        return true; // Prevent default behavior
      }
      return false; // Exit app if on main screen
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove(); // Cleanup
  }, [activeSection]);
  const sections = [
    {
      id: "1",
      title: "Undelivered",
      icon: require("../asserts/undelivered.jpg"), // local image
    },
    {
      id: "2",
      title: "Delivered",
      icon: require("../asserts/delivered.jpg"),
    },
    {
      id: "3",
      title: "Section3",
      // icon: require("../asserts/section3.png"),
    },
    {
      id: "4",
      title: "Section4",
      // icon: require("../asserts/section4.png"),
    },
  ];

  const renderSectionScreen = () => (
    <View style={{ flex: 1 }}>
      {/* Header inside section */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setActiveSection(null)}
        >
          <Ionicons name="arrow-undo" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activeSection}</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Content of section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionText}>You are in {activeSection} Section</Text>
      </View>
    </View>
  );

  if (activeSection) {
    return renderSectionScreen();
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-undo" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Reports</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Rectangle Banner */}
      <Image
        source={require("../asserts/Admin.jpg")}
        style={styles.banner}
        resizeMode="cover"
      />

      {/* Grid of Report Sections */}
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
  container: {
    flex: 1,
    backgroundColor: "#f8f9f5",
  },
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
  backButton: {
    padding: 6,
  },
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
  gridContainer: {
    paddingHorizontal: 12,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 14,
  },
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
  cardImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2d531a",
    textAlign: "center",
  },
  sectionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2d531a",
  },
});
