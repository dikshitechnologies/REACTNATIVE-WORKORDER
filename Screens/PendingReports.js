import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";

const PendingReportsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Pending Reports</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>📌 This is the Pending Reports screen</Text>
      </View>
    </SafeAreaView>
  );
};

export default PendingReportsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#2d531a",
    paddingVertical: 15,
    alignItems: "center",
  },
  headerText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 18 },
});
