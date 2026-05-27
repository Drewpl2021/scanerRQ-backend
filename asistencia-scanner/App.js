import 'react-native-gesture-handler';
import React from 'react';
// ... resto del código
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import EventosScreen from './src/screens/EventosScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import ParienteScreen from './src/screens/ParienteScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="Eventos"
          component={EventosScreen}
          options={{ title: '📋 Selecciona un Evento' }}
        />
        <Stack.Screen
          name="Scanner"
          component={ScannerScreen}
          options={{ title: '📷 Escanear QR' }}
        />
        <Stack.Screen
          name="Pariente"
          component={ParienteScreen}
          options={{ title: '👤 ¿Quién acompaña?' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}