import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const ArtisansReport = ({ navigation, route }) => {
  const user = route?.params?.user;
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-undo" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerText}>Achari Reports</Text>

        {/* Placeholder for spacing (to keep title centered) */}
        <View style={{ width: 28 }} />
      </View>

      {/* Image Below Header */}
      <View style={styles.bannerWrapper}>
        <Image
          source={require("../asserts/achariss.jpg")}
          style={styles.banner}
          resizeMode="cover"
        />
        {user?.fAcname && (
          <Text style={styles.welcomeText}>Hello, {user.fAcname}</Text>
        )}
      </View>
      {/* Cards Section */}
      <View style={styles.cardsContainer}>
        {/* Pending Reports Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("PendingReports")}
        >
          <Image
            source={require("../asserts/undelivered.jpg")}
            style={styles.cardImage}
          />
          <Text style={styles.cardTitle}>Pending</Text>
        </TouchableOpacity>

        {/* Delivered Reports Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("DeliveredReports")}
        >
          <Image
            source={require("../asserts/delivered.jpg")}
            style={styles.cardImage}
          />
          <Text style={styles.cardTitle}>Delivered</Text>
        </TouchableOpacity>
      </View>
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
  banner: {
    width: "90%",
    height: 190,
    borderRadius: 20,
    alignSelf: "center",
    marginVertical: 16,
     opacity: 0.7,
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    width: "40%",
    elevation: 10,
    shadowColor: "#2d531a",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
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
  position: "relative",
  alignItems: "center",
  justifyContent: "center", // 👈 centers vertically
  marginVertical: 10,
},
welcomeText: {
  position: "absolute",
  fontSize: 24,
  fontWeight: "700",
 color: "#f9feffff", // 👈 gold color
  textAlign: "center",
  textShadowColor: "rgba(0,0,0,0.6)",
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 4,
},


});
