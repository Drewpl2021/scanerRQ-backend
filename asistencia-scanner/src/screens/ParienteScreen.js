import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { registrarAsistencia } from '../api/api';

const PARIENTES = [
  { label: '👨 Padre',           value: 'Padre' },
  { label: '👩 Madre',           value: 'Madre' },
  { label: '🧑 Tío / Tía',       value: 'Tío/Tía' },
  { label: '👴 Abuelo / Abuela',  value: 'Abuelo/Abuela' },
  { label: '🪪 Apoderado',        value: 'Apoderado' },
];

export default function ParienteScreen({ navigation, route }) {
  const { alumno, evento } = route.params;
  const [parienteSeleccionado, setParienteSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);

  const confirmarAsistencia = async () => {
    if (!parienteSeleccionado) {
      Alert.alert('⚠️ Atención', 'Selecciona quién acompaña al alumno');
      return;
    }
    setLoading(true);
    try {
      await registrarAsistencia(alumno.codigo, evento.id, parienteSeleccionado);
      Alert.alert(
        '✅ Asistencia registrada',
        `${alumno.nombres} ${alumno.apellidos}\nAcompañado por: ${parienteSeleccionado}`,
        [{
          text: 'Registrar otro',
          onPress: () => {
            setParienteSeleccionado(null); // ← Limpia selección
            setLoading(false);             // ← Resetea loading
            navigation.navigate('Scanner', { evento });
          }
        }]
      );
    } catch (error) {
      const msg = error.response?.data?.detail || 'Error al registrar';
      Alert.alert('❌ Error', msg, [
        { text: 'Volver', onPress: () => {
          setLoading(false);  // ← Resetea loading en error también
          navigation.goBack();
        }}
      ]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.alumnoCard}>
        <Text style={styles.alumnoLabel}>Alumno encontrado ✓</Text>
        <Text style={styles.alumnoNombre}>{alumno.nombres} {alumno.apellidos}</Text>
        <Text style={styles.alumnoDni}>DNI: {alumno.dni}</Text>
        <Text style={styles.alumnoEstado}>{alumno.estado} · {alumno.condicion}</Text>
      </View>

      <Text style={styles.pregunta}>¿Quién acompaña al alumno?</Text>

      {PARIENTES.map(p => (
        <TouchableOpacity
          key={p.value}
          style={[styles.opcion, parienteSeleccionado === p.value && styles.opcionSeleccionada]}
          onPress={() => setParienteSeleccionado(p.value)}
        >
          <Text style={[styles.opcionTexto, parienteSeleccionado === p.value && styles.opcionTextoSeleccionado]}>
            {p.label}
          </Text>
          {parienteSeleccionado === p.value && <Text style={styles.check}>✓</Text>}
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.botonConfirmar, !parienteSeleccionado && styles.botonDeshabilitado]}
        onPress={confirmarAsistencia}
        disabled={!parienteSeleccionado || loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.botonTexto}>✅ Confirmar asistencia</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 20 },
  alumnoCard: {
    backgroundColor: '#1a1a2e', borderRadius: 14, padding: 20,
    marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#4ade80',
  },
  alumnoLabel: { color: '#4ade80', fontSize: 12, marginBottom: 6 },
  alumnoNombre: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  alumnoDni: { color: '#aaa', marginTop: 4 },
  alumnoEstado: { color: '#aaa', marginTop: 2, fontSize: 12 },
  pregunta: { color: '#fff', fontSize: 17, fontWeight: 'bold', marginBottom: 14 },
  opcion: {
    backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16,
    marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderWidth: 1, borderColor: '#2a2a4a',
  },
  opcionSeleccionada: { borderColor: '#e94560', backgroundColor: '#2a1a2e' },
  opcionTexto: { color: '#ccc', fontSize: 16 },
  opcionTextoSeleccionado: { color: '#fff', fontWeight: 'bold' },
  check: { color: '#e94560', fontSize: 18, fontWeight: 'bold' },
  botonConfirmar: {
    backgroundColor: '#e94560', borderRadius: 12,
    padding: 18, alignItems: 'center', marginTop: 10,
  },
  botonDeshabilitado: { backgroundColor: '#444' },
  botonTexto: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
});