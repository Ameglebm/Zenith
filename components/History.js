import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";

export default function History({ history }) {
  const [selectedRun, setSelectedRun] = useState(null);

  const handleSelectRun = (run) => {
    setSelectedRun(run);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Corridas</Text>
      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => handleSelectRun(item)}
          >
            <Text style={styles.historyButtonText}>
              🗓 {item.date} - {item.timeOfDay}
            </Text>
          </TouchableOpacity>
        )}
      />
      {selectedRun && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedRun}
          onRequestClose={() => setSelectedRun(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Detalhes da Corrida</Text>
              <Text style={styles.modalText}>📅 Data: {selectedRun.date}</Text>
              <Text style={styles.modalText}>
                ⏱ Tempo: {Math.floor(selectedRun.time / 60)} min{" "}
                {selectedRun.time % 60} seg
              </Text>
              <Text style={styles.modalText}>
                📏 Distância: {selectedRun.distance} km
              </Text>
              <Text style={styles.modalText}>
                ⚡ Velocidade Média: {selectedRun.avgSpeed} km/h
              </Text>
              <Text style={styles.modalText}>
                🔥 Calorias Perdidas: {selectedRun.calories} kcal
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedRun(null)}
              >
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#d1d1d1", 
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#165bba", 
    marginBottom: 10,
  },
  historyButton: {
    padding: 15,
    backgroundColor: "#c0c0c0", 
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
  },
  historyButtonText: {
    fontSize: 14,
    color: "#3d3d3d", 
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#d1d1d1", 
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#165bba", 
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: "#292929", 
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#165bba", 
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
