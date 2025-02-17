import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function Chronometer({ addRunToHistory }) {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [distance, setDistance] = useState("");

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      const id = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
      setIntervalId(id);
    }
  };

  const stopTimer = () => {
    if (isRunning) {
      clearInterval(intervalId);
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTime(0);
    setDistance("");
  };

  const saveRun = () => {
    if (time > 0 && distance) {
      const avgSpeed = (distance / (time / 3600)).toFixed(2); 
      const calories = (distance * 60).toFixed(0); 
      addRunToHistory({
        time,
        distance,
        avgSpeed,
        calories,
        date: new Date().toLocaleDateString(),
      });
      resetTimer();
    } else {
      alert("Por favor, insira a distância percorrida antes de salvar.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{formatTime(time)}</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite a distância (km)"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={distance}
        onChangeText={setDistance}
      />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, isRunning && styles.buttonActive]}
          onPress={startTimer}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>Iniciar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !isRunning && time > 0 && styles.buttonActive]}
          onPress={stopTimer}
          disabled={!isRunning}
        >
          <Text style={styles.buttonText}>Parar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, time > 0 && styles.buttonActive]}
          onPress={resetTimer}
          disabled={time === 0}
        >
          <Text style={styles.buttonText}>Resetar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, time > 0 && distance && styles.buttonSave]}
          onPress={saveRun}
          disabled={time === 0 || !distance}
        >
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#d1d1d1", 
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  timer: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#165bba", 
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#bbb", 
    borderRadius: 8,
    padding: 10,
    width: "100%",
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
    backgroundColor: "#d9d9d9", 
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#b0b0b0", 
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
    flex: 1,
  },
  buttonActive: {
    backgroundColor: "#165bba", 
  },
  buttonSave: {
    backgroundColor: "#207735", 
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
