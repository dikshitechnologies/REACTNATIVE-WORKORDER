import React, { useState, useRef } from "react";
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
} from "react-native";
import * as Animatable from "react-native-animatable";
import Ionicons from "react-native-vector-icons/Ionicons"; // 👈 for eye icon
import AsyncStorage from "@react-native-async-storage/async-storage"; // 👈 for remember me
import { BASE_URL } from './Links';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
const { height } = Dimensions.get("window");
const LoginScreen = ({ navigation }) => {
  const [mode, setMode] = useState(null); // "admin" | "achari" | null
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);


  const scrollY = useRef(new Animated.Value(0)).current;

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Load saved credentials (if remember me was set)
  React.useEffect(() => {
    (async () => {
      try {
        const savedMode = await AsyncStorage.getItem("loginMode");
        const savedUser = await AsyncStorage.getItem("adminUser");
        const savedPass = await AsyncStorage.getItem("adminPass");
        const savedPhone = await AsyncStorage.getItem("achariPhone");

        if (savedMode === "admin" && savedUser && savedPass) {
          setMode("admin");
          setUsername(savedUser);
          setPassword(savedPass);
          setRememberMe(true);
        } else if (savedMode === "achari" && savedPhone) {
          setMode("achari");
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
      if (mode === "admin") {
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

        if (response.ok && text.trim().toLowerCase().includes("login success")) {
        

          // ✅ Remember me save
          // inside handleLogin
          if (rememberMe) {
            if (mode === "admin") {
              await AsyncStorage.setItem("adminUser", username);
              await AsyncStorage.setItem("adminPass", password);
              await AsyncStorage.setItem("loginMode", "admin");   // save mode
              await AsyncStorage.removeItem("achariPhone");
            } else if (mode === "achari") {
              await AsyncStorage.setItem("achariPhone", phone);
              await AsyncStorage.setItem("loginMode", "achari");  // save mode
              await AsyncStorage.removeItem("adminUser");
              await AsyncStorage.removeItem("adminPass");
            }
          } else {
            await AsyncStorage.removeItem("adminUser");
            await AsyncStorage.removeItem("adminPass");
            await AsyncStorage.removeItem("achariPhone");
            await AsyncStorage.removeItem("loginMode");
          }


          // ✅ Clear fields
          setUsername("");
          setPassword("");

          navigation.navigate("AdminReports");
        } else {
          Alert.alert("Error", text || "Invalid admin credentials");
        }
      } else if (mode === "achari") {
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
          // inside handleLogin
          if (rememberMe) {
            if (mode === "admin") {
              await AsyncStorage.setItem("adminUser", username);
              await AsyncStorage.setItem("adminPass", password);
              await AsyncStorage.setItem("loginMode", "admin");   // save mode
              await AsyncStorage.removeItem("achariPhone");
            } else if (mode === "achari") {
              await AsyncStorage.setItem("achariPhone", phone);
              await AsyncStorage.setItem("loginMode", "achari");  // save mode
              await AsyncStorage.removeItem("adminUser");
              await AsyncStorage.removeItem("adminPass");
            }
          } else {
            await AsyncStorage.removeItem("adminUser");
            await AsyncStorage.removeItem("adminPass");
            await AsyncStorage.removeItem("achariPhone");
            await AsyncStorage.removeItem("loginMode");
          }

          // ✅ Clear phone field
          setPhone("");

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
        source={require("../asserts/goldartlogin.png")}
        style={styles.background}
      >
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
            {/* Header */}
            <View style={styles.header}>
              <ImageBackground
                source={
                  mode === "admin"
                    ? require("../asserts/adminslogin.png") // 👈 Admin background image
                    : require("../asserts/acharilogin.png") // 👈 Achari background image
                }
                style={styles.headerBackground}
                resizeMode="cover"
              >
                <Animated.Image
                  source={
                    mode === "admin"
                      ? require("../asserts/adminslogin.png") // 👈 Admin logo/image
                      : require("../asserts/acharilogin.png") // 👈 Achari logo/image
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
                contentContainerStyle={{ paddingBottom: 40 }}
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
                    </TouchableOpacity></>
                )}

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backButton} onPress={() => setMode(null)}>
                  <Ionicons name="arrow-undo" size={22} color="#2d531a" style={{ marginRight: 6 }} />
                  <Text style={styles.backLink}>Back</Text>
                </TouchableOpacity>


                <Text style={[
                  styles.footerText,
                  mode === "admin" ? styles.footerAdmin : styles.footerAchari
                ]}>
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
    height: height * 0.45,
    overflow: "hidden",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerBackground: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerImage: {
    width: 120,
    height: 120,
    position: "absolute",
    bottom: 30,
  },
  formWrapper: {
    height: height * 0.65,
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
    marginTop: hp("14%"), // Admin-specific spacing
  },

  footerAchari: {
    marginTop: hp("20%"),  // Achari-specific spacing
  },
  footerText: {

    textAlign: "center",
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
});
