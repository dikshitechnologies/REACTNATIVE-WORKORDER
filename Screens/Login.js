import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Image, // 👈 Import Image
} from "react-native";
import { BackHandler } from "react-native";
import * as Animatable from "react-native-animatable";
import Ionicons from "react-native-vector-icons/Ionicons"; // 👈 for eye icon
import AsyncStorage from "@react-native-async-storage/async-storage"; // 👈 for remember me
import { BASE_URL } from "./Links";

import messaging from '@react-native-firebase/messaging';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const { height } = Dimensions.get("window");
const LoginScreen = ({ navigation }) => {
  const [mode, setMode] = useState(null); // "admin" | "achari" | null
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);
  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp(); // 👈 Close the app
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const scrollY = useRef(new Animated.Value(0)).current;

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const requestPermission = async () => {
    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        await requestToken();
      } else {
        Alert.alert('Permission Denied');
      }
    } catch (error) {
      console.log(error);
    }
  };
  const requestToken = async () => {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      setFcmToken(token);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    requestPermission();
    requestToken();
  }, []);

  // helper to save FCM token for a user
  const saveTokenForUser = async (userCode, token, userType) => {
    try {
      if (!userCode || !token || !userType) {
        console.warn('saveTokenForUser missing params', { userCode, token, userType });
        return;
      }

      const url = `${BASE_URL}UserToken/SaveToken`;
      console.log('Saving token to:', url, { userCode, token, userType });

      const resp = await fetch(url, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ userCode: userCode.toString(), token, userType }),
      });

      const text = await resp.text();
      console.log('SaveToken response', resp.status, text);
      return resp;
    } catch (error) {
      console.error('saveTokenForUser error', error);
      throw error;
    }
  };



  // Load saved credentials (if remember me was set)
  React.useEffect(() => {
    (async () => {
      try {
        const savedMode = await AsyncStorage.getItem("loginMode");
        const savedUser = await AsyncStorage.getItem("adminUser");
        const savedPass = await AsyncStorage.getItem("adminPass");
        const savedPhone = await AsyncStorage.getItem("achariPhone");

        if (savedMode === "admin" && savedUser && savedPass) {
          // ❌ don't setMode here
          setUsername(savedUser);
          setPassword(savedPass);
          setRememberMe(true);
        } else if (savedMode === "achari" && savedPhone) {
          // ❌ don't setMode here
          setPhone(savedPhone);
          setRememberMe(true);
        }
      } catch (err) {
        console.log("⚠️ Error loading saved credentials", err);
      }
    })();
  }, []);

  // handle login
  const handleLogin = async () => {
    try {
      // 🛑 Validation checks before API call
      if (!mode) {
        Alert.alert("Validation", "Please select Admin or Achari mode");
        return;
      }

      if (mode === "admin") {
        if (!username.trim()) {
          Alert.alert("Validation", "Please enter username");
          return;
        }
        if (!password.trim()) {
          Alert.alert("Validation", "Please enter password");
          return;
        }

        const url = `${BASE_URL}Auth/Login`;
        console.log("🔗 Admin Login API URL:", url);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName: username,
            password: password,
          }),
        });

        const text = await response.text();
        console.log("📩 Admin Login Response:", text);

        if (
          response.ok &&
          text.trim().toLowerCase().includes("login success")
        ) {
          // ✅ Remember me save
          if (rememberMe) {
            await AsyncStorage.setItem("adminUser", username);
            await AsyncStorage.setItem("adminPass", password);
            await AsyncStorage.setItem("loginMode", "admin");
            await AsyncStorage.removeItem("achariPhone");
          } else {
            await AsyncStorage.removeItem("adminUser");
            await AsyncStorage.removeItem("adminPass");
            await AsyncStorage.removeItem("achariPhone");
            await AsyncStorage.removeItem("loginMode");
          }

          // ✅ Clear fields
          setUsername("");
          setPassword("");

          // send FCM token to backend for admin (userCode '001', userType 'A')
          try {
            if (fcmToken) {
              await saveTokenForUser("001", fcmToken, "A");
            } else {
              console.warn("No FCM token available to send for admin");
            }
          } catch (err) {
            console.warn("Failed to send admin token", err);
          }

          navigation.navigate("AdminReports");
        } else {
          Alert.alert("Error", text || "Invalid admin credentials");
        }
      } else if (mode === "achari") {
        if (!phone.trim()) {
          Alert.alert("Validation", "Please enter phone number");
          return;
        }

        const url = `${BASE_URL}Auth/GetByPhone/${phone}`;
        console.log("🔗 Achari Login API URL:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        const data = await response.json();
        console.log("📩 Achari Login Response:", data);

        if (response.ok && data?.fAcname) {
          // ✅ Remember me save
          if (rememberMe) {
            await AsyncStorage.setItem("achariPhone", phone);
            await AsyncStorage.setItem("loginMode", "achari");
            await AsyncStorage.removeItem("adminUser");
            await AsyncStorage.removeItem("adminPass");
          } else {
            await AsyncStorage.removeItem("adminUser");
            await AsyncStorage.removeItem("adminPass");
            await AsyncStorage.removeItem("achariPhone");
            await AsyncStorage.removeItem("loginMode");
          }

          // ✅ Clear phone field
          setPhone("");

          // send FCM token to backend for achari (userCode from response, userType 'U')
          try {
            const userCode = data?.fCode ?? data?.fcode ?? data?.fCode?.toString?.() ?? "";
            if (fcmToken) {
              await saveTokenForUser(userCode || "", fcmToken, "U");
            } else {
              console.warn("No FCM token available to send for achari");
            }
          } catch (err) {
            console.warn("Failed to send achari token", err);
          }

          navigation.navigate("ArtisansReport", { user: data });
        } else {
          Alert.alert("Error", "Phone number not found");
        }
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
      Alert.alert("Error", "Something went wrong, please try again");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ImageBackground
        source={require("../asserts/black.jpg")}
        style={styles.background}
      >
        <View style={styles.overlay} />
        <Image
          source={require("../asserts/rkjewellers.png")}
          style={styles.logo}
        />
        {/* If no mode selected → show 2 buttons */}
        {!mode && (
          <Animatable.View
            animation="fadeInUp"
            duration={1000}
            style={styles.bottomButtons}
          >
            <TouchableOpacity
              style={styles.choiceButton}
              onPress={() => setMode("admin")}
            >
              <Text style={styles.choiceText}>Admin Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.choiceButton}
              onPress={() => setMode("achari")}
            >
              <Text style={styles.choiceText}>Achari Login</Text>
            </TouchableOpacity>
          </Animatable.View>
        )}

        {mode && (
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
              <ImageBackground
                source={
                  mode === "admin"
                    ? require("../asserts/blacking.png") // 👈 Admin background image
                    : require("../asserts/blacking.png") // 👈 Achari background image
                }
                style={styles.headerBackground}
                resizeMode="cover"
              >
                <View style={styles.overlay} />
                <Image
                  source={require("../asserts/rkjewellers.png")}
                  style={styles.logo_two}
                />
                <Animated.Image
                  source={
                    mode === "admin"
                      ? require("../asserts/blacking.png") // 👈 Admin logo/image
                      : require("../asserts/blacking.png") // 👈 Achari logo/image
                  }
                  style={[styles.headerImage, { opacity: imageOpacity }]}
                  resizeMode="contain"
                />
              </ImageBackground>
            </View>
            {/* Form */}
            <Animatable.View
              animation="slideInUp"
              duration={800}
              style={styles.formWrapper}
            >
              <ScrollView
                contentContainerStyle={{ paddingBottom: 10 }}
                showsVerticalScrollIndicator={false}
              >
                {mode === "admin" && (
                  <>
                    <TextInput
                      placeholder="Username"
                      style={styles.input}
                      placeholderTextColor="#aaa"
                      value={username}
                      onChangeText={setUsername}
                    />

                    {/* Password with eye toggle */}
                    <View style={styles.passwordWrapper}>
                      <TextInput
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                        placeholderTextColor="#aaa"
                        value={password}
                        onChangeText={setPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off" : "eye"}
                          size={22}
                          color="#555"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Remember me */}
                    <TouchableOpacity
                      style={styles.rememberMe}
                      onPress={() => setRememberMe(!rememberMe)}
                    >
                      <Ionicons
                        name={rememberMe ? "checkbox" : "square-outline"}
                        size={20}
                        color="#2d531a"
                      />
                      <Text style={{ marginLeft: 8, color: "#2d531a" }}>
                        Remember Me
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {mode === "achari" && (
                  <>
                    <TextInput
                      placeholder="Phone Number"
                      keyboardType="phone-pad"
                      style={styles.input}
                      placeholderTextColor="#aaa"
                      value={phone}
                      onChangeText={setPhone}
                    />
                    <TouchableOpacity
                      style={styles.rememberMe}
                      onPress={() => setRememberMe(!rememberMe)}
                    >
                      <Ionicons
                        name={rememberMe ? "checkbox" : "square-outline"}
                        size={20}
                        color="#2d531a"
                      />
                      <Text style={{ marginLeft: 8, color: "#2d531a" }}>
                        Remember Me
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                >
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setMode(null)}
                >
                  <Ionicons
                    name="arrow-undo"
                    size={22}
                    color="#2d531a"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.backLink}>Back</Text>
                </TouchableOpacity>

                <Text
                  style={[
                    styles.footerText,
                    mode === "admin"
                      ? styles.footerAdmin
                      : styles.footerAchari,
                  ]}
                >
                  @Dikshi Technologies - 7448880375
                </Text>
              </ScrollView>
            </Animatable.View>
          </View>
        )}


      </ImageBackground>
    </KeyboardAvoidingView>

  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, justifyContent: "flex-end" },
  bottomButtons: { padding: 20 },
  choiceButton: {
    backgroundColor: "#2d531a",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    marginVertical: 10,
  },
  choiceText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  header: {
    height: height * 0.4,
    overflow: "hidden",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerImage: {
    width: 120,
    height: 120,
    position: "absolute",
    bottom: 30,
  },
  formWrapper: {
    height: height * 0.6,
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 25,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
    width: "100%",
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  eyeButton: { position: "absolute", right: 15 },
  rememberMe: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#2d531a",
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // centers horizontally
    marginTop: 20,
  },
  backLink: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2d531a",
  },
  footerAdmin: {
    marginTop: Platform.select({
      ios: hp("9%"),
      android: hp("12%"), // you can tweak separately
    }),
  },
  footerAchari: {
    marginTop: Platform.OS === "ios" ? hp("16%") : hp("18%"),
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.66)",
  },
  logo: {
    position: "absolute",
    width: wp("120%"), // Increased size
    height: wp("120%"), // Increased size
    top: hp("10%"), // Positioned from the top
    alignSelf: "center", // Centered horizontally
    resizeMode: "contain",
  },
  logo_two: {
    // This is now centered by the parent container `headerBackground`
    width: wp("85%"), // A bit smaller to fit nicely in the header
    height: wp("85%"),
    resizeMode: "contain",
  },
});