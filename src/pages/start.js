import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Image, Pressable } from 'react-native';
//import {db, auth} from './firebase.js';

export default function Start({ navigation }) {
    const {height} = Dimensions.get('window');
  return (
    <View style={[styles.containerP, {height: height}]}>
        <View style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Image source={{uri: 'https://i.imgur.com/NoSUKTN.png'}} style={{width: 120, height: 120, borderRadius:15}}/>
        </View>

        <Image source={{uri: 'https://i.imgur.com/cVPVQv5.png'}} style={{width: 300, height: 300, borderRadius:15}}/>

        <Pressable style={styles.btnstart} onPress={() => navigation.navigate('Login')}>
            <Text style={{fontSize: 22,color: '#fff', fontWeight: 'bold'}}>Vamos Começar?</Text>
        </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
    btnstart: {
        width: '90%',
        height: 50,
        marginLeft: 'auto',
        marginRight: 'auto',
        borderRadius: 10,
        backgroundColor: '#55C2FA',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10
      },
      containerP: {
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: '#13182B'
      }
});
