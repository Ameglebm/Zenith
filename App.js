import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import History from './components/History';

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [distance, setDistance] = useState(0);
  const [coordinates, setCoordinates] = useState([]);
  const [watchId, setWatchId] = useState(null);
  const [history, setHistory] = useState([]);
  const mapRef = useRef(null);

  // Solicita permissão para acessar a localização
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  };

  // Inicia o rastreamento de localização
  const startTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      alert('Permissão de localização negada.');
      return;
    }

    const subscription = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 10 },
      (location) => {
        const { latitude, longitude } = location.coords;
        const newCoordinate = { latitude, longitude };

        setCoordinates((prev) => {
          const newCoordinates = [...prev, newCoordinate];

          if (newCoordinates.length > 1) {
            const lastCoordinate = newCoordinates[newCoordinates.length - 2];
            const newDistance = calculateDistance(lastCoordinate, newCoordinate);
            setDistance((prevDistance) => prevDistance + newDistance);
          }

          return newCoordinates;
        });

        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      }
    );

    setWatchId(subscription);
  };

  // Para o rastreamento da localização
  const stopTracking = () => {
    if (watchId) {
      watchId.remove();
      setWatchId(null);
    }
  };

  // Calcula a distância entre duas coordenadas (em km)
  const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (coord2.latitude - coord1.latitude) * (Math.PI / 180);
    const dLon = (coord2.longitude - coord1.longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.latitude * (Math.PI / 180)) *
        Math.cos(coord2.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTracking();

      const id = setInterval(() => setTime((prev) => prev + 1), 1000);
      setIntervalId(id);
    }
  };

  const stopTimer = () => {
    if (isRunning) {
      clearInterval(intervalId);
      setIsRunning(false);
      stopTracking();
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTime(0);
    setDistance(0);
    setCoordinates([]);
  };

  const saveRun = () => {
    if (time > 0 && distance > 0) {
      const avgSpeed = (distance / (time / 3600)).toFixed(2);
      const calories = (distance * 60).toFixed(0);
      const runData = {
        time,
        distance: distance.toFixed(2),
        avgSpeed,
        calories,
        date: new Date().toLocaleDateString(),
        timeOfDay: new Date().toLocaleTimeString(),
      };

      setHistory((prev) => [...prev, runData]);
      resetTimer();
    } else {
      alert('Por favor, inicie uma corrida/caminhada antes de salvar.');
    }
  };

  const centerMapOnLocation = async () => {
    const location = await Location.getCurrentPositionAsync({});
    const newCoordinate = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    setCoordinates((prev) => [...prev, newCoordinate]);

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: newCoordinate.latitude,
        longitude: newCoordinate.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.chronometerContainer}>
        <Text style={styles.timer}>{formatTime(time)}</Text>
        <Text style={styles.distanceText}>
          Distância: {(distance * 1000).toFixed(2)} metros
        </Text>

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
            style={[styles.button, time > 0 && distance > 0 && styles.buttonSave]}
            onPress={saveRun}
            disabled={time === 0 || distance === 0}
          >
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: coordinates[0]?.latitude || -23.5505,
            longitude: coordinates[0]?.longitude || -46.6333,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Polyline coordinates={coordinates} strokeColor="#045708" strokeWidth={3} />
          {coordinates.length > 0 && (
            <Marker coordinate={coordinates[coordinates.length - 1]}>
              <Text style={styles.markerText}>🚶‍♂️</Text>
            </Marker>
          )}
        </MapView>
        <TouchableOpacity style={styles.centerButton} onPress={centerMapOnLocation}>
          <Text style={styles.centerButtonText}>📍</Text>
        </TouchableOpacity>
      </View>

      <History history={history} />
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
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  chronometerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
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
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: '#b0b0b0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
    maxWidth: 120, // Limitar a largura máxima do botão
  },
  buttonActive: {
    backgroundColor: '#165bba',
  },
  buttonSave: {
    backgroundColor: '#207735',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    flexShrink: 1, // Permite que o texto se ajuste
    overflow: 'hidden', // Impede o texto de ultrapassar o botão
  },
  mapContainer: {
    height: 300, // Altura do mapa
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
  centerButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  centerButtonText: {
    fontSize: 24,
  },

  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    padding: 5,
    borderRadius: 20,
  },
  markerText: {
    fontSize: 24,
  },
});
