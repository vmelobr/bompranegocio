import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Pressable, TextInput, Image, SafeAreaView, ImageBackground, Modal, Alert, FlatList, ScrollView} from 'react-native';
import {db, Timestamp, storage} from '../../firebase';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, updatePassword } from "firebase/auth";
import { collection, query, where, onSnapshot, startAt, endAt, orderBy, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL} from "firebase/storage";
import { format, addHours } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';


export default function Config({navigation,route}) {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);
    const [userId, setUserID] = useState(null);
    const [tpUser, setTpUser] = useState(null);
    const [userInfo, setUserInfo] = useState([]);
    const [userName, setUserName] = useState(null);
    const {height} = Dimensions.get('window');
    const [avatar, setAvatar] = useState('');
    const auth = getAuth();
    const [docc, setdocc] = useState(null);

    const [image, setImage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const uploadImage = async(uri) =>{
        if (!uri) return;

        // Criar um nome de arquivo único
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const response = await fetch(uri);
        const blob = await response.blob();

        // Referência ao arquivo no Firebase Storage
        const storageRef = ref(storage, filename);

        // Upload do arquivo para o Firebase Storage
        await uploadBytes(storageRef, blob);

        // Obter a URL de download
        const url = await getDownloadURL(storageRef);

        setAvatar(url);

          // update bd

          const updateDBD = doc(db, "user", docc);
          await updateDoc(updateDBD, {
              avatar: url
          });

        console.log('Imagem enviada para o Firebase. URL de download: ', url);

        setModalVisible(false);
    }

    const enviarImagem = async() => {
        uploadImage(image);
    }

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
    
        console.log(result);
    
        if (!result.canceled) {
          setImage(result.assets[0].uri);
          setModalVisible(true);
        }
    }

    const sair = () =>{
        signOut(auth).then(() => {
          console.log("Deslogado");
        }).catch((error) => {
          console.log("error ao deslogar");
        });
    }


    useEffect(() => {
      const subscriber = auth.onAuthStateChanged((userr) => {
        setUser(userr);
        if (initializing) setInitializing(false);
      });
   
    }, [initializing, user]);

    useEffect(() => {

      if(user != null){
        console.log('====>', user);

          const q = query(collection(db, "user"), where("email", "==", user.email));
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userInf = [];
            querySnapshot.forEach((doc) => {
              userInf.push(doc.data());
              setUserName(doc.data().name);
              setTpUser(doc.data().type);
              setUserID(doc.data().id);
              setAvatar(doc.data().avatar);

              setName(doc.data().name);
              setmail(doc.data().email);
              settell(doc.data().tel);
              setcepp(doc.data().cep);
              setEstado(doc.data().estado);
              setCity(doc.data().cidade);
              setR(doc.data().rua);
              setNumber(doc.data().num);
              setdocc(doc.id);
              setBai(doc.data().bairro);
            });

            setUserInfo(userInf);

            console.log(userInf);
            
          });
      }
    }, [user, tpUser, userId]);


    useEffect(() => {
      
      if(tpUser != null){

        var tpus = null;


        if(tpUser == "cliente"){
          tpus = "cliente";
        }else{
          tpus = "prestador";
        }
    }
        
   
    }, []);

    const [nome, setName] = useState('');

    const setNome = (nm) => {
        setName(nm);
    }

    const [email, setmail] = useState('');

    const setEmail = (em) => {
        setmail(em);
    }

    const [tel, settell] = useState('');

    const settel = (tel) => {
        settell(tel);
    }

    const [senha, setpass] = useState('');

    const setSenha = (sn) => {
        setpass(sn);
    }

    const [estado, setEstado] = useState('');

    const setuf = (uf) => {
        setEstado(uf);
    }

    const [cidade, setCidade] = useState('');

    const setCity = (city) => {
        setCidade(city);
    }

    const [bairro, setBai] = useState('');

    const setBairro = (bairro) => {
        setBai(bairro);
    }

    const [rua, setR] = useState('');

    const setRua = (rua) => {
        setR(rua);
    }

    const [num, setNumber] = useState('');
    const inputNum = useRef(null);

    const setNum = (num) => {
        setNumber(num);
    }

    const [cep, setcepp] = useState('');

    const setCep = (cep) => {
        setcepp(cep);

        if(cep.length == 8){
          buscarEndereco(cep);
        }
    }

    const savePerfil = async() => {

      // checando se a senha precisa mudar

      if(senha.length > 2){
        if(senha.length < 6){
          Alert.alert("Senha deve ter no minimo 6 caracteres...");
          return false;
        }else{
          const us = auth.currentUser;

          updatePassword(us, senha).then(() => {
            
          }).catch((error) => {
            Alert.alert("Error ao atualizar a senha");
            return false;
          });
        }
      }

      const arrupp = {
        name: nome,
        email: email,
        tel: tel,
        rua: rua,
        bairro: bairro,
        cidade: cidade,
        estado: estado,
        num: num,
        cep: cep
      };

      console.log("===============>", arrupp);

      const perfilup = doc(db, "user", docc);
      await updateDoc(perfilup, arrupp);

      Alert.alert("Dados Salvos com Sucesso!");

    }

    function buscarEndereco(cep) {
      // Remove qualquer caractere não numérico do CEP
      cep = cep.replace(/\D/g, '');
  
      // Verifica se o CEP tem 8 dígitos
      if (cep.length !== 8) {
          console.error('CEP inválido.');
          return;
      }
  
      // Faz a requisição à API ViaCEP
      const url = `https://viacep.com.br/ws/${cep}/json/`;
  
      fetch(url)
          .then(response => {
              if (!response.ok) {
                  throw new Error('Erro ao buscar o endereço.');
              }
              return response.json();
          })
          .then(data => {
              if (data.erro) {
                  console.error('CEP não encontrado.');
              } else {
                  console.log('Endereço encontrado:', data);

                  setEstado(data.uf);
                  setCidade(data.localidade);
                  setBai(data.bairro);
                  setR(data.logradouro);

                  inputNum.current.focus()
              }
          })
          .catch(error => {
              console.error('Erro:', error.message);
          });
  }

  return (
    <SafeAreaView style={{height: '100%', width: '95%', marginLeft: 'auto', marginRight: 'auto'}}>
        <Text style={{marginLeft: 10, marginTop: 10, fontSize: 18}}>Configurações</Text>
        <ScrollView>
            <Text style={styles.label}>Avatar:</Text>
            <View>
                {avatar ?(
                    <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <Image 
                            source={{ uri: avatar }} 
                            style={styles.image} 
                        />
                        <Pressable style={styles.btnup} onPress={() => pickImage()}><Text style={{fontSize: 18, fontWeight: 'bold', color: '#fff'}}>Atualizar Imagem</Text></Pressable>
                    </View>
                ):(
                    <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <Image 
                            source={{ uri: 'https://i.imgur.com/UG96RRu.jpg' }} 
                            style={styles.image} 
                        />
                        <Pressable style={styles.btnup} onPress={() => pickImage()}><Text style={{fontSize: 18, fontWeight: 'bold', color: '#fff'}}>Enviar Imagem</Text></Pressable>
                    </View>
                )}
                
            </View>

            <View>
                <Text style={styles.label}>Nome:</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setNome}
                    value={nome}
                    placeholder="Insira seu nome..."
                />
            </View>

            <View>
                <Text style={styles.label}>Email:</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setEmail}
                    value={email}
                    placeholder="Insira seu email..."
                />
            </View>

            <View>
                <Text style={styles.label}>Telefone:</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={settel}
                    value={tel}
                    placeholder="Insira seu telefone..."
                />
            </View>

            <View>
                <Text style={styles.label}>Senha:</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setSenha}
                    value={senha}
                    placeholder="Insira sua senha..."
                />
            </View>

            <Text style={styles.label}>Endereço:</Text>

            <View>
                <Text style={styles.label}>Cep:</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setCep}
                    value={cep}
                    placeholder="Insira seu cep..."
                />
            </View>

            <View>
                <Text style={styles.label}>Estado:</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setuf}
                    value={estado}
                    placeholder="Insira seu estado..."
                />
            </View>

            <View>
                <Text style={styles.label}>Cidade:</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setCity}
                    value={cidade}
                    placeholder="Insira sua cidade..."
                />
            </View>

            <View>
                <Text style={styles.label}>Bairro:</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setBairro}
                    value={bairro}
                    placeholder="Insira seu bairro..."
                />
            </View>

            <View>
                <Text style={styles.label}>Rua:</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setRua}
                    value={rua}
                    placeholder="Insira sua rua..."
                />
            </View>

            <View>
                <Text style={styles.label}>Numero:</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={setNum}
                    value={num}
                    placeholder="Insira seu numero..."
                    ref={inputNum}
                />
            </View>

            <Pressable onPress={() => savePerfil()} style={styles.btnconfirm}><Text style={{fontSize: 18, color: '#fff', fontWeight: 'bold', marginLeft: 10}}><Icon name="save" size={35} color="#fff" /> Salvar</Text></Pressable>
            <Pressable style={styles.btnsair} onPress={() => sair()}><Icon name="logout" size={35} color="#333" /><Text style={{fontSize: 18, color: '#333', fontWeight: 'bold', marginLeft: 10}}>Sair</Text></Pressable>
        </ScrollView>

        <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                setModalVisible(!modalVisible);
                }}>
                <View style={styles.centeredView}>
                <View style={styles.modalView}>

                    <Image source={{ uri: image }} style={styles.image} />

                    <Pressable onPress={() => enviarImagem()} style={styles.btnupload}><Text style={{fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center'}}>Upload Imagem</Text></Pressable>
                    
                    <Pressable
                      style={[styles.button, styles.buttonClose]}
                      onPress={() => setModalVisible(!modalVisible)}>
                      <Text style={{fontSize: 16, color: 'red', fontWeight: 'bold'}}>Cancelar</Text>
                    </Pressable>
                </View>
                </View>
        </Modal>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  image:{
    width: 80,
    height: 80,
    borderRadius: 50
  },
  label:{
    fontSize: 18,
    fontWeight: 'bold',
    margin: 10
  },
  btnup: {
    width: '95%',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: '#2e385e',
    padding: 10,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15
  },
  input:{
    backgroundColor: '#fff',
    height: 60,
    padding: 10,
    fontSize: 16
  },
  btnconfirm: {
    width: '95%',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: '#249938',
    padding: 10,
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15
  },
  btnsair: {
    width: '95%',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15
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
    width: '90%'
  },
  btnupload:{
    width: '99%',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#2b294f',
    marginTop: 15,
    marginBottom: 15
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose:{
    backgroundColor: '#fff'
  }

});
