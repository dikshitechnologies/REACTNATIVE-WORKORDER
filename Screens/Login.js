
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
} from "react-native";
import * as Animatable from "react-native-animatable";

const { height } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const [mode, setMode] = useState(null); // "admin" | "achari" | null
  const scrollY = useRef(new Animated.Value(0)).current;

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const handleLogin = () => {
    if (mode === "achari") {
      navigation.navigate("ArtisansReport");
    } else {
      // Later you can add admin navigation here
      navigation.navigate("AdminReports");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ImageBackground
        source={require("../asserts/goldart.png")} // rectangle background
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
            {/* Header takes half screen */}
            <View style={styles.header}>
              <ImageBackground
                source={require("../asserts/gold.png")}
                style={styles.headerBackground}
                resizeMode="cover"
              >
                <Animated.Image
                  source={require("../asserts/gold.png")}
                  style={[styles.headerImage, { opacity: imageOpacity }]}
                  resizeMode="contain"
                />
              </ImageBackground>
            </View>

            {/* White form container takes other half */}
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
                    />
                    <TextInput
                      placeholder="Password"
                      secureTextEntry
                      style={styles.input}
                      placeholderTextColor="#aaa"
                    />
                  </>
                )}

                {mode === "achari" && (
                  <TextInput
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                    style={styles.input}
                    placeholderTextColor="#aaa"
                  />
                )}

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setMode(null)}>
                  <Text style={styles.backLink}>← Back</Text>
                </TouchableOpacity>

                {/* Footer */}
                <Text style={styles.footerText}>
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
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bottomButtons: {
    padding: 20,
  },
  choiceButton: {
    backgroundColor: "#2d531a",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    marginVertical: 10,
  },
  choiceText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  header: {
    height: height * 0.45,
    overflow: "hidden",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
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
  loginButton: {
    backgroundColor: "#2d531a",
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  backLink: {
    marginTop: 20,
    textAlign: "center",
    color: "#2d531a",
    fontWeight: "500",
  },
  footerText: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
});

