// screens/SplashScreen.js
import React, { useEffect } from "react";
import { View, StyleSheet, ImageBackground, Platform } from "react-native";
import * as Animatable from "react-native-animatable";

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
        source={require("../asserts/Splashz.png")}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Ripple glowing rings */}
        <Animatable.View
          animation={{
            0: { opacity: 0.9, scale: 0 },
            0.5: { opacity: 0.5, scale: 1 },
            1: { opacity: 0, scale: 2 },
          }}
          iterationCount="infinite"
          duration={2500}
          easing="ease-out"
          style={styles.ring}
        />
        <Animatable.View
          animation={{
            0: { opacity: 0.9, scale: 0 },
            0.5: { opacity: 0.5, scale: 1 },
            1: { opacity: 0, scale: 2 },
          }}
          iterationCount="infinite"
          duration={2500}
          delay={800}
          easing="ease-out"
          style={styles.ring}
        />
        <Animatable.View
          animation={{
            0: { opacity: 0.9, scale: 0 },
            0.5: { opacity: 0.5, scale: 1 },
            1: { opacity: 0, scale: 2 },
          }}
          iterationCount="infinite"
          duration={2500}
          delay={1600}
          easing="ease-out"
          style={styles.ring}
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
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    position: "absolute",
    width: 260,
    height: 260,
    marginBottom: 145,
    borderRadius: 130,
    borderWidth: 10, // thicker ring
    borderColor: "rgba(255,255,255,0.8)", // soft white glow
    ...Platform.select({
      ios: {
        shadowColor: "white",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 25,
      },
      android: {
        elevation: 15,
      },
    }),
  },
});

export default SplashScreen;
