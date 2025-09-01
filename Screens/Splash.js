// screens/SplashScreen.js
import React, { useEffect } from "react";
import { View, StyleSheet, ImageBackground, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";

const { width, height } = Dimensions.get("window");

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../asserts/Splash.png")} // 👈 full background image
        style={styles.background}
        resizeMode="cover"
      >
        {/* Expanding circular wave effect */}
        <Animatable.View
          animation={{
            0: { opacity: 0.6, scale: 0 },
            0.5: { opacity: 0.3, scale: 1 },
            1: { opacity: 0, scale: 2 },
          }}
          iterationCount="infinite"
          duration={2000}
          easing="ease-out"
          style={styles.wave}
        />
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2d531a",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  wave: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.3)", // glowing circle
  },
});

export default SplashScreen;
