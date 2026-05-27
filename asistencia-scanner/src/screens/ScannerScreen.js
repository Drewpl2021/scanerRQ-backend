import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Modal
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { buscarAlumnoPorCodigo } from '../api/api';

export default function ScannerScreen({ navigation, route }) {
  const { evento } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [modo, setModo] = useState('camara');
  const [codigoManual, setCodigoManual] = useState('');
  const [loading, setLoading] = useState(false);
  const [escaneado, setEscaneado] = useState(false);

  const buscarAlumno = async (codigo) => {
    if (!codigo.trim()) return;
    setLoading(true);
    try {
      const res = await buscarAlumnoPorCodigo(codigo.trim());
      navigation.navigate('Pariente', { alumno: res.data, evento });
    } catch (error) {
      const msg = error.response?.data?.detail || 'Código no encontrado';
      Alert.alert('❌ Error', msg, [
        { text: 'Reintentar', onPress: () => setEscaneado(false) }
      ]);
    } finally {
      setLoading(false);
      setEscaneado(false);
    }
  };

  const onQRScanned = ({ data }) => {
    if (escaneado) return;
    setEscaneado(true);
    buscarAlumno(data);
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.textoPermiso}>Se necesita acceso a la cámara</Text>
        <TouchableOpacity style={styles.boton} onPress={requestPermission}>
          <Text style={styles.botonTexto}>Permitir cámara</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.eventoHeader}>
        <Text style={styles.eventoLabel}>Evento activo:</Text>
        <Text style={styles.eventoNombre}>{evento.nombre}</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, modo === 'camara' && styles.tabActivo]}
          onPress={() => setModo('camara')}
        >
          <Text style={[styles.tabTexto, modo === 'camara' && styles.tabTextoActivo]}>
            📷 Escanear QR
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, modo === 'manual' && styles.tabActivo]}
          onPress={() => setModo('manual')}
        >
          <Text style={[styles.tabTexto, modo === 'manual' && styles.tabTextoActivo]}>
            ⌨️ Código manual
          </Text>
        </TouchableOpacity>
      </View>

      {modo === 'camara' && (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={escaneado ? undefined : onQRScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
          <View style={styles.overlay}>
            <View style={styles.scanBox} />
          </View>
          <Text style={styles.instruccion}>Apunta el QR dentro del recuadro</Text>
        </View>
      )}

      {modo === 'manual' && (
        <View style={styles.manualContainer}>
          <Text style={styles.label}>Ingresa el código del alumno:</Text>
          <TextInput
            style={styles.input}
            value={codigoManual}
            onChangeText={setCodigoManual}
            placeholder="Ej: ALU001"
            placeholderTextColor="#666"
            autoCapitalize="characters"
            autoFocus
          />
          <TouchableOpacity
            style={[styles.boton, !codigoManual && styles.botonDeshabilitado]}
            onPress={() => buscarAlumno(codigoManual)}
            disabled={!codigoManual || loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.botonTexto}>Buscar alumno →</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      <Modal transparent visible={loading && modo === 'camara'}>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.loadingTexto}>Buscando alumno...</Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  center: { flex: 1, backgroundColor: '#0f0f1a', justifyContent: 'center', alignItems: 'center', padding: 20 },
  eventoHeader: { backgroundColor: '#1a1a2e', padding: 14, borderBottomWidth: 1, borderBottomColor: '#e94560' },
  eventoLabel: { color: '#aaa', fontSize: 12 },
  eventoNombre: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', backgroundColor: '#1a1a2e' },
  tab: { flex: 1, padding: 14, alignItems: 'center' },
  tabActivo: { borderBottomWidth: 2, borderBottomColor: '#e94560' },
  tabTexto: { color: '#aaa', fontSize: 14 },
  tabTextoActivo: { color: '#e94560', fontWeight: 'bold' },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 40,
    justifyContent: 'center', alignItems: 'center'
  },
  scanBox: { width: 220, height: 220, borderWidth: 2, borderColor: '#e94560', borderRadius: 12 },
  instruccion: { color: '#fff', textAlign: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.6)' },
  manualContainer: { flex: 1, padding: 24, justifyContent: 'center' },
  label: { color: '#aaa', marginBottom: 10, fontSize: 15 },
  input: {
    backgroundColor: '#1a1a2e', color: '#fff', borderRadius: 10,
    padding: 14, fontSize: 18, borderWidth: 1, borderColor: '#e94560',
    marginBottom: 20, letterSpacing: 2,
  },
  boton: { backgroundColor: '#e94560', borderRadius: 10, padding: 16, alignItems: 'center' },
  botonDeshabilitado: { backgroundColor: '#555' },
  botonTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  textoPermiso: { color: '#fff', marginBottom: 20, fontSize: 16, textAlign: 'center' },
  loadingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  loadingTexto: { color: '#fff', marginTop: 16, fontSize: 16 },
});