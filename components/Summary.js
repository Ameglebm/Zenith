import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Summary({ latestRun }) {
  if (!latestRun) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Nenhuma corrida registrada ainda.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Última Corrida</Text>
      <Text style={styles.summaryText}>
        📏 {latestRun.distance} km • ⚡ {latestRun.avgSpeed} km/h • 🔥{" "}
        {latestRun.calories} kcal
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#d1d1d1", 
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#165bba", 
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 14,
    color: "#3d3d3d", 
  },
  message: {
    fontSize: 14,
    color: "#777", 
    textAlign: "center",
  },
});
