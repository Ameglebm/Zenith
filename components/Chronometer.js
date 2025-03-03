import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Chronometer({ distance, onStart, onStop }) {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      onStart(); // Inicia o rastreamento da localização

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
      onStop(); // Para o rastreamento da localização
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTime(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{formatTime(time)}</Text>

      {/* Exibe a distância percorrida */}
      <Text style={styles.distanceText}>
        Distância: {(distance * 1000).toFixed(2)} metros
      </Text>

      {/* Botões de controle */}
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
      </View>
    </View>
  );
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    alignItems: 'center',
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#165bba',
    marginBottom: 20,
  },
  distanceText: {
    fontSize: 18,
    color: '#3d3d3d',
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#b0b0b0',
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonActive: {
    backgroundColor: '#165bba',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});