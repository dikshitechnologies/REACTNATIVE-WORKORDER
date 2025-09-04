import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  FlatList,
} from "react-native";
import { BackHandler } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";


const ArtisansReport = ({ navigation, route }) => {
  const user = route?.params?.user;


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
          source={require("../asserts/achariss.jpg")}
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
  // 👇 NEW AND UPDATED BANNER STYLES
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
});