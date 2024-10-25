import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {db, auth} from './firebase.js';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/pages/login.js';
import Start from './src/pages/start.js';
import Painel from './src/pages/painel.js';
import Pagamento from './src/pages/pagamento.js';
import MapaView from './src/pages/map.js';
import Busca from './src/pages/busca.js';
import Perfil from './src/pages/perfil.js';
import Chat from './src/pages/chat.js';
import Config from './src/pages/config.js';
import Notifica from './src/pages/notification.js';
import DetalService from './src/pages/detalhes.js';
import Cadastro from './src/pages/cadastro.js';
import Galeria from './src/pages/galeria.js';
import Social from './src/pages/social.js';
import GerenciaPost from './src/pages/gerenciaPost.js';

export default function App() {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Painel" component={Painel} />
        <Stack.Screen name="Pagamento" component={Pagamento} />
        <Stack.Screen name="Mapa" component={MapaView} />
        <Stack.Screen name="Busca" component={Busca} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="Config" component={Config} />
        <Stack.Screen name="Notifica" component={Notifica} />
        <Stack.Screen name="Cadastro" component={Cadastro} />
        <Stack.Screen name="Detalhes" component={DetalService} />
        <Stack.Screen name="Galeria" component={Galeria} />
        <Stack.Screen name="Social" component={Social} />
        <Stack.Screen name="GerenciarPost" component={GerenciaPost} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
