import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import Chronometer from "./components/Chronometer";
import Summary from "./components/Summary";
import History from "./components/History";

const HISTORY_FILE = `${FileSystem.documentDirectory}history.json`;

export default function App() {
  const [history, setHistory] = useState([]);
  const [latestRun, setLatestRun] = useState(null);

  const loadHistory = async () => {
    try {
      const fileExists = await FileSystem.getInfoAsync(HISTORY_FILE);
      if (fileExists.exists) {
        const data = await FileSystem.readAsStringAsync(HISTORY_FILE);
        setHistory(JSON.parse(data));
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  const saveHistory = async (newHistory) => {
    try {
      await FileSystem.writeAsStringAsync(HISTORY_FILE, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Erro ao salvar histórico:", error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const addRunToHistory = (runData) => {
    const timeOfDay = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newHistory = [...history, { ...runData, timeOfDay }];
    setHistory(newHistory);
    setLatestRun(runData);
    saveHistory(newHistory); 
  };

  return (
    <View style={styles.container}>
      <Chronometer addRunToHistory={addRunToHistory} />
      <Summary latestRun={latestRun} />
      <History history={history} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#afb3ba",
    padding: 20,
  },
});
