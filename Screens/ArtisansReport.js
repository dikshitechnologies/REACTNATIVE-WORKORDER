import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  FlatList,
  Modal,
  ScrollView,
} from "react-native";
import { BackHandler } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import axios from "axios";
import { BASE_URL } from "./Links";

const ArtisansReport = ({ navigation, route }) => {
  const user = route?.params?.user;
  const [showOverduePopup, setShowOverduePopup] = useState(false);
  const [overdueData, setOverdueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const backAction = () => {
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
              BackHandler.exitApp(); // Exit the app
            },
          },
        ]
      );
      return true; // prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Fetch overdue data when component mounts
  useEffect(() => {
    fetchOverdueData();
  }, []);

  const fetchOverdueData = async () => {
    try {
      setLoading(true);
      const url = `${BASE_URL}ItemTransaction/GetPendingOverdue?cusCodes=${user?.fCode}&search=&pageNumber=1&pageSize=10`;
      console.log("📡 Fetching overdue data for popup:", url);

      const res = await axios.get(url);

      if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setOverdueData(res.data.data.slice(0, 5)); // Show only first 5 records in popup
        setShowOverduePopup(true);
      }
    } catch (err) {
      console.log("❌ Error fetching overdue data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      if (dateString.includes('T')) {
        return new Date(dateString).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      } else {
        const [day, month, year] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
    } catch (error) {
      return dateString;
    }
  };

  const formatIssueDate = (issueDtString) => {
    if (!issueDtString) return "Unknown Date";
    
    try {
      const datePart = issueDtString.split(' ')[0];
      const [day, month, year] = datePart.split('-');
      return `${day}/${month}/${year}`;
    } catch (error) {
      return "Unknown Date";
    }
  };

  const sections = [
    {
      id: "1",
      title: "Pending",
      icon: require("../asserts/undelivered.jpg"),
      screen: "PendingReports",
    },
    {
      id: "2",
      title: "Delivered",
      icon: require("../asserts/delivered.jpg"),
      screen: "DeliveredReports",
    },
    {
      id: "3",
      title: "Overdue",
      icon: require("../asserts/overdue.png"),
      screen: "OverdueReports",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
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

        <Text style={styles.headerText}>Achari Reports</Text>

        <View style={{ width: 28 }} />
      </View>

      {/* Banner */}
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
        {user?.fAcname && (
          <Text style={styles.welcomeText}>Hello, {user.fAcname}</Text>
        )}
      </View>

      {/* Cards Section */}
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate(item.screen, { user })}
          >
            {item.icon && (
              <Image
                source={item.icon}
                style={styles.cardImage}
                resizeMode="contain"
              />
            )}
            <Text style={styles.cardTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Overdue Popup Modal */}
      <Modal
        visible={showOverduePopup}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {}} // Prevent closing on back button
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={28} color="#d32f2f" />
              <Text style={styles.modalTitle}>Overdue Orders Alert</Text>
              <Ionicons name="warning" size={28} color="#d32f2f" />
            </View>

            {/* Modal Content */}
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                You have {overdueData.length} overdue order(s) that need attention:
              </Text>

              {overdueData.map((item, index) => (
                <View key={index} style={styles.overdueItem}>
                  <View style={styles.overdueItemHeader}>
                    <Text style={styles.orderNo}>{item.fOrderNo}</Text>
                    <Text style={styles.daysOverdue}>
                      {item.daysOverdue || 0} days overdue
                    </Text>
                  </View>
                  
                  <View style={styles.overdueDetails}>
                    <Text style={styles.designText}>Design: {item.fDesign}</Text>
                    <Text style={styles.snoText}>S.No: {item.fSNo}</Text>
                  </View>

                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Due Date: </Text>
                    <Text style={styles.dateValue}>{formatDate(item.fDueDate)}</Text>
                  </View>

                  {index < overdueData.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Modal Footer with Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.seeMoreButton]}
                onPress={() => {
                  setShowOverduePopup(false);
                  navigation.navigate("OverdueReports", { user });
                }}
              >
                <Ionicons name="list" size={20} color="#fff" />
                <Text style={styles.seeMoreButtonText}>See More</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => setShowOverduePopup(false)}
              >
                <Ionicons name="close-circle" size={20} color="#fff" />
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ArtisansReport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
  },
  header: {
    paddingTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2d531a",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 1,
    textAlign: "center",
    flex: 1,
  },
  gridContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  row: {
    justifyContent: "space-evenly",
  },
  card: {
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
  cardImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d531a",
    textAlign: "center",
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
    backgroundColor: "rgba(0, 0, 0, 0.62)",
  },
  bannerLogo: {
    width: wp("65%"),
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
    textShadowColor: "rgba(0,0,0,0.72)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    zIndex: 1,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff3cd",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#ffeaa7",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#856404",
    marginHorizontal: 10,
    textAlign: "center",
  },
  modalContent: {
    maxHeight: hp("40%"),
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  overdueItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#d32f2f",
  },
 
  overdueItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // Changed from center to flex-start
    marginBottom: 8,
  },
  orderNo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2d531a",
    flex: 1, // Added flex to allow wrapping
    marginRight: 8, // Added spacing
  },
  daysOverdue: {
    fontSize: 12, // Reduced font size
    fontWeight: "bold",
    color: "#d32f2f",
    backgroundColor: "#ffebee",
    paddingHorizontal: 6, // Reduced padding
    paddingVertical: 3, // Reduced padding
    borderRadius: 6,
    textAlign: "center",
    minWidth: 70, // Minimum width to maintain appearance
    flexShrink: 0, // Prevent shrinking
  },
 overdueDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  designText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  snoText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  dateValue: {
    fontSize: 14,
    color: "#d32f2f",
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginTop: 12,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 0.48,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  seeMoreButton: {
    backgroundColor: "#2d531a",
  },
  closeButton: {
    backgroundColor: "#d32f2f",
  },
  seeMoreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});