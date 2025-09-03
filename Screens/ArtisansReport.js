import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  FlatList,
} from "react-native";
import { BackHandler } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const ArtisansReport = ({ navigation, route }) => {
  const user = route?.params?.user;

  useEffect(() => {
    const backAction = () => {
      navigation.replace("Login"); // or navigation.navigate("Login")
      return true; // prevent default exit
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

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
  ];

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

        <View style={{ width: 28 }} />
      </View>

      {/* Banner */}
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
  bannerWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  banner: {
    width: "90%",
    height: 190,
    borderRadius: 20,
    alignSelf: "center",
    marginVertical: 16,
    opacity: 0.7,
  },
  welcomeText: {
    position: "absolute",
    fontSize: 24,
    fontWeight: "700",
    color: "#f9feffff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
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
});
