import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Image,
} from "react-native";

const ArtisansReport = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Background Image */}
      <ImageBackground
        source={require("../asserts/1.jpg")}
        style={styles.header}
        imageStyle={{
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}
      >
        <Text style={styles.headerText}>Artisans Report</Text>
      </ImageBackground>

      {/* Cards Section */}
      <View style={styles.cardsContainer}>
        {/* Pending Reports Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("PendingReports")}
        >
          <Image
            source={require("../asserts/pending.png")}
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
            source={require("../asserts/delivered.png")}
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
    height: 100, // reduced from 120 → less space below header
    justifyContent: "center",
    alignItems: "center",
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
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginTop: 20, // reduced gap below header
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    width: "40%",
    elevation: 10, // increased elevation
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
