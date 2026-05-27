import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { getEventos } from '../api/api';

export default function EventosScreen({ navigation }) {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEventos()
      .then(res => setEventos(res.data))
      .catch(() => Alert.alert('Error', 'No se pudieron cargar los eventos.\nVerifica que la API esté corriendo.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#e94560" />
      <Text style={styles.loadingText}>Cargando eventos...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Eventos disponibles</Text>
      <FlatList
        data={eventos}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Scanner', { evento: item })}
          >
            <Text style={styles.cardTitulo}>{item.nombre}</Text>
            <Text style={styles.cardFecha}>📅 {item.fecha_inicio} → {item.fecha_fin}</Text>
            <Text style={styles.cardAccion}>Toca para registrar asistencia →</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.vacio}>No hay eventos registrados</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  center: { flex: 1, backgroundColor: '#0f0f1a', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#aaa', marginTop: 10 },
  titulo: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  card: {
    backgroundColor: '#1a1a2e', borderRadius: 12, padding: 18,
    marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#e94560',
  },
  cardTitulo: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  cardFecha: { color: '#aaa', marginTop: 6, fontSize: 13 },
  cardAccion: { color: '#e94560', marginTop: 8, fontSize: 12 },
  vacio: { color: '#aaa', textAlign: 'center', marginTop: 40 },
});