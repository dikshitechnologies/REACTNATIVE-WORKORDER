import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";

const ArtisansReport = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Solid Background */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Achari Reports</Text>
      </View>

      {/* Image Below Header */}
      <Image
        source={require("../asserts/Achari.jpg")} // change to your desired image
        style={styles.banner}
        resizeMode="cover"
      />

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
          <Text style={styles.cardTitle}>Pending   Reports</Text>
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
          <Text style={styles.cardTitle}>Delivered Reports</Text>
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
    backgroundColor: "#2d531a",
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  banner: {
    width: "90%",
    height: 180,
    borderRadius: 20,
    alignSelf: "center",
    marginVertical: 16,
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
});
