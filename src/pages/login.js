import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Pressable, TextInput, Image } from 'react-native';
import {db} from '../../firebase';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Checkbox } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation }) {
    const {height} = Dimensions.get('window');
    const inputMethod = useRef(null);
    const inputPass = useRef(null);
    const[email, setEmail] = useState(null);
    const[password, setPass] = useState(null);
    const [checked, setChecked] = useState(false);

    const methodLogin = (emailtext) =>{
        setEmail(emailtext);
    }

    const senhaSet = (passw) => {
        setPass(passw);
    }

    const saveValue = async (key, value) => {
      try {
        await AsyncStorage.setItem(key, value);
        console.log('Data successfully saved');
      } catch (error) {
        console.log('Failed to save the data to the storage');
      }
    };

    const getValue = async (key) => {
      try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          console.log('Data retrieved successfully:', value);
          return value;
        }
      } catch (error) {
        console.log('Failed to fetch the data from storage');
      }
    };

    const auth = getAuth();

    const validaLog = async() =>{

      if(checked){
        // salvando
        saveValue("emailLogin", email);
        saveValue("senhaLogin", password);
      }

        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;

            navigation.navigate('Painel');
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            console.log(errorMessage);
        });
    }

    useEffect(() => {
      
      try {
        const savesEmail = AsyncStorage.getItem("emailLogin");
        if (savesEmail !== null) {
          setEmail(savesEmail);
        }
      } catch (error) {
        console.log('Failed to fetch the data from storage');
      }

      try {
        const savesPass = AsyncStorage.getItem("senhaLogin");
        if (savesPass !== null) {
          setPass(savesPass);
        }
      } catch (error) {
        console.log('Failed to fetch the data from storage');
      }
   
    }, []);


    const openCad = () =>{
      navigation.navigate("Cadastro");
    }


  return (
    <View style={[styles.containerlogin, {height: height}]}>
            
            <View style={styles.containerimagelogin}><Image source={{uri: 'https://i.imgur.com/NoSUKTN.png'}} style={{width: 120, height: 120, marginTop: 10, marginBottom: 10, borderRadius:15}}/></View>

            <View style={styles.containerform}>
                <Text style={styles.textform}>CPF/CNPJ</Text>
                <TextInput
                    style={styles.inputlogin}
                    placeholder="Digite seu e-mail ou CNPJ/CPF"
                    keyboardType="default"
                    onChangeText={methodLogin}
                    ref={inputMethod}
                />
            </View>

            <View style={styles.containerform}>
                <Text style={styles.textform}>Senha</Text>
                <TextInput
                    style={styles.inputlogin}
                    placeholder="Digite sua senha..."
                    keyboardType="default"
                    onChangeText={senhaSet}
                    ref={inputPass}
                    secureTextEntry={true}
                />
            </View>

            <View style={styles.containerform}>
                <View style={styles.containercheck}>
                  <Checkbox
                    status={checked ? 'checked' : 'unchecked'}
                    onPress={() => {
                      setChecked(!checked);
                    }}
                  />
                  <Text style={{fontSize: 16, color: '#fff'}}>Lembrar Meu Login E Senha</Text>
                </View>
                <Pressable style={styles.conesqueci}><Text style={styles.textesqueci}>Esqueci Minha Senha</Text></Pressable>
                <Pressable style={styles.btncadlogin} onPress={() => openCad()}><Text style={styles.textbtncad}>Cadastrar-Se</Text></Pressable>
                <Pressable style={styles.btnvalidalogin} onPress={() => validaLog()}><Text style={styles.textbtncad}>Acessar</Text></Pressable>
            </View>

        </View>
  );
}

const styles = StyleSheet.create({
  containercheck:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent:'flex-start',
    alignItems: 'center',
    marginTop: 10
  },
    containerlogin:{
        width: '100%',
        padding: '2vh',
        borderRadius: 5,
        backgroundColor: '#13182B',
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    inputlogin: {
        width: '90%',
        height: 60,
        borderRadius: 5,
        paddingLeft: 10,
        backgroundColor: '#fff',
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    textform: {
        fontSize: 18,
        color: '#fff',
        marginTop:10,
        marginBottom:10
    },
    containerimagelogin:{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    btncadlogin:{
        width: '90%',
        padding: 5,
        borderRadius: 5,
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: '#55C2FA',
        marginTop: 35,
        height: 50
    },
    textbtncad:{
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center'
    },
    textesqueci:{
        fontSize: 20,
        color: '#808080'
    },
    conesqueci:{
        marginTop:10
    },
    btnvalidalogin: {
        backgroundColor: '#2e385e',
        width: '90%',
        padding: 5,
        borderRadius: 5,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 35,
        height: 50
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
      },
      modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '95%'
      },
      inputCadd:{
        width: '95%',
        height: 40,
        paddingLeft: 5,
        borderRadius: 5,
        backgroundColor: '#f2f2f2'
      },
      inputCad:{
        fontSize: 18
      },
      formcontrol: {
        width: '100%',
        marginTop:25
      },
      containerradio:{
        width: '90%',
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20
      },
      containeropservice: {
        width: '50%'
      },
      btncadav:{
        backgroundColor: '#2e385e',
        width: '90%',
        padding: 5,
        borderRadius: 5,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 35,
        height: 50
      },
      textcadav:{
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center'
      }
});
