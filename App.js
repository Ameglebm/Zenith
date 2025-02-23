import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import History from './components/History'; 

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [distance, setDistance] = useState(0); // Distância percorrida em km
  const [coordinates, setCoordinates] = useState([]); // Coordenadas do usuário
  const [watchId, setWatchId] = useState(null); // ID do rastreamento de localização
  const [history, setHistory] = useState([]); // Histórico de corridas
  const mapRef = useRef(null); 

  // Solicita permissão de localização
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão de localização:', error);
      return false;
    }
  };

  // Inicia o rastreamento da localização
  const startTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      alert('Permissão de localização negada.');
      return;
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High, // Alta precisão
        distanceInterval: 10, // Atualiza a cada 10 metros
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        const newCoordinate = { latitude, longitude };

        // Atualiza as coordenadas
        setCoordinates((prev) => {
          const newCoordinates = [...prev, newCoordinate];

          // Calcula a distância percorrida
          if (newCoordinates.length > 1) {
            const lastCoordinate = newCoordinates[newCoordinates.length - 2];
            const newDistance = calculateDistance(lastCoordinate, newCoordinate);
            setDistance((prevDistance) => prevDistance + newDistance);
          }

          return newCoordinates;
        });

        // Centraliza o mapa na nova localização
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
      watchId.remove(); // Para o rastreamento
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
    return R * c; // Distância em km
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTracking();

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
      const avgSpeed = (distance / (time / 3600)).toFixed(2); // Velocidade média em km/h
      const calories = (distance * 60).toFixed(0); // Calorias estimadas
      const runData = {
        time,
        distance: distance.toFixed(2),
        avgSpeed,
        calories,
        date: new Date().toLocaleDateString(),
        timeOfDay: new Date().toLocaleTimeString(),
      };

      // Adiciona a corrida ao histórico
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
  
    setCoordinates((prev) => [...prev, newCoordinate]); // Adiciona a nova posição
  
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
      {/* Cronômetro */}
      <View style={styles.chronometerContainer}>
        <Text style={styles.timer}>{formatTime(time)}</Text>
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
          <TouchableOpacity
            style={[styles.button, time > 0 && distance > 0 && styles.buttonSave]}
            onPress={saveRun}
            disabled={time === 0 || distance === 0}
          >
            <Text style={styles.buttonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mapa */}
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
          {/* Exibe a rota percorrida */}
          <Polyline
            coordinates={coordinates}
            strokeColor="#045708" // Cor da linha
            strokeWidth={3} // Espessura da linha
          />
          {/* Marcador da localização atual bonequinho */}
          {coordinates.length > 0 && (
            <Marker coordinate={coordinates[coordinates.length - 1]}>
              <View style={styles.markerContainer}>
                <Text style={styles.markerText}>🚶‍♂️</Text>
              </View>
            </Marker>
          )}

        </MapView>

        {/* Botão para centralizar a localização */}
        <TouchableOpacity
          style={styles.centerButton}
          onPress={centerMapOnLocation}
        >
          <Text style={styles.centerButtonText}>📍</Text>
        </TouchableOpacity>
      </View>

      {/* Histórico de corridas */}
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
  buttonSave: {
    backgroundColor: '#207735',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
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