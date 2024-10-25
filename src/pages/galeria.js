import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Pressable, TextInput, Image, SafeAreaView, ImageBackground, Modal, Alert, FlatList} from 'react-native';
import {db, Timestamp, storage} from '../../firebase';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, startAt, endAt, orderBy, doc, updateDoc } from "firebase/firestore";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject} from "firebase/storage";
import * as ImagePicker from 'expo-image-picker';

import { format, addHours } from 'date-fns';

export default function Galeria({navigation,route}) {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);
    const [userId, setUserID] = useState(null);
    const [tpUser, setTpUser] = useState(null);
    const [userInfo, setUserInfo] = useState([]);
    const [userName, setUserName] = useState(null);
    const {height} = Dimensions.get('window');
    const auth = getAuth();
    const [tpbd, settpbd] = useState(null);
    const [imagemCapa, setImgCapa] = useState(null);
    const [docc, setDoc] = useState(null);
    const [fotos, setFotos] = useState([]); 

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
              setImgCapa(doc.data().capa);
              setDoc(doc.id);

              if(doc.data().fotos){
                setFotos(doc.data().fotos);
              }
              
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

    const [image, setImage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [imageOpen, setImageOpen] = useState(null);
    const [imageOpenIndex, setImageOpenIndex] = useState(0);

    const openImage = (img, index) =>{
      setModalOpen(true);
      setImageOpen(img);
      setImageOpenIndex(index);
    }

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

          // update bd

          if(tpbd == "capa"){
            const updateDBD = doc(db, "user", docc);
            await updateDoc(updateDBD, {
                capa: url
            });
          }else{
            console.log("===================>", fotos);

            let arr = [];

            if(fotos){
              arr = fotos;
              arr.push(url);
            }else{
              arr.push(url);
            }
            
            const updateDBD = doc(db, "user", docc);
            await updateDoc(updateDBD, {
                fotos: arr
            });
          }

          

        console.log('Imagem enviada para o Firebase. URL de download: ', url);
        setModalVisible(false);
    }

    const enviarImagem = async() => {
        uploadImage(image);
    }

    const pickImage = async (type) => {
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
          settpbd(type);
        }
    }


    const renderItem = ({item, index}) =>{
        return(
          <Pressable onPress={() => openImage(item, index)}>
            <Image 
                  source={{ uri: item }} 
                  style={styles.imggaleria} 
            />
          </Pressable>    
        )
    }

    const deleteFileFromUrl = async (downloadUrl) => {
      try {
        // Extraindo o caminho do arquivo da URL de download
        const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
        const startIndex = downloadUrl.indexOf(baseUrl) + baseUrl.length;
        const endIndex = downloadUrl.indexOf('?');
        const fullPath = decodeURIComponent(downloadUrl.substring(startIndex, endIndex).split('/o/')[1]);
    
        // Inicializando o Firebase Storage e criando uma referência ao arquivo
        const storage = getStorage();
        const fileRef = ref(storage, fullPath);
    
        // Deletando o arquivo
        await deleteObject(fileRef);
        console.log('Arquivo deletado com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar o arquivo:', error);
      }
    };

    const deletarImg = async (index) =>{
      let ft = fotos.splice(index, 1);
      const updateDBD = doc(db, "user", docc);
      await updateDoc(updateDBD, {
          fotos: ft
      });

      deleteFileFromUrl(fotos[index]);

      Alert.alert(
        'Imagem Deletada Com Sucesso!',
        '',
        [{ text: 'OK' }]
      );
    }



  return (
    <SafeAreaView style={{height: '100%', backgroundColor: '#fff', padding: 10}}>

        <Text style={styles.title}>Foto De Capa</Text>

        {imagemCapa ?(
          <ImageBackground source={{uri: imagemCapa}} style={styles.header_container}>

              <Pressable onPress={() => pickImage('capa')} style={{width: '100%', backgroundColor: 'rgba(000,000,000, 0.6)', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <Icon name="upload" size={80} color="#fff" />
              </Pressable>

          </ImageBackground>
        ):(
          <ImageBackground source={require('./bgg.png')} style={styles.header_container}>

              <Pressable onPress={() => pickImage('capa')} style={{width: '100%', backgroundColor: 'rgba(000,000,000, 0.6)', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <Icon name="upload" size={80} color="#fff" />
              </Pressable>

          </ImageBackground>
        )}        

        <Pressable onPress={() => pickImage('galeria')} style={{backgroundColor: '#2e385e', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', borderRadius: 10, padding: 10}}><Icon name="add" size={45} color="#fff" /><Text style={{fontSize: 18, color: '#f1f1f1', fontWeight: 'bold', textTransform: 'uppercase'}}>Adicionar Fotos A Galeria</Text></Pressable>
        <View style={{marginTop: 15, width: '95%', marginLeft: 'auto', marginRight: 'auto'}}>
            {fotos ? (
                <FlatList
                    data={fotos}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    style={{width: '100%'}}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
              />
            ): (
                <Text style={{fontSize: 23, fontWeight: 'bold', color: '#333'}}>Nenhuma Imagem Encontrada!</Text>
            )}
        </View>

        <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                setModalVisible(!modalVisible);
                }}>
                <View style={styles.centeredView}>
                <View style={styles.modalView}>

                    <Image source={{ uri: image }} style={styles.imageModal} />

                    <Pressable onPress={() => enviarImagem()} style={styles.btnupload}><Text style={{fontSize: 16, fontWeight: 'bold', color: '#fff', textAlign: 'center'}}>Upload Imagem</Text></Pressable>
                    
                    <Pressable
                      style={[styles.button, styles.buttonClose]}
                      onPress={() => setModalVisible(!modalVisible)}>
                      <Text style={styles.textStyle}>Cancelar</Text>
                    </Pressable>
                </View>
                </View>
        </Modal>

        <Modal
                animationType="slide"
                transparent={true}
                visible={modalOpen}
                onRequestClose={() => {
                  setModalOpen(!modalOpen);
                }}>
                <View style={styles.centeredView}>
                <View style={styles.modalView}>

                    <Image source={{ uri: imageOpen }} style={styles.imageModal} />

                    <Pressable onPress={() => deletarImg(imageOpenIndex)} style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginTop: 15}}>
                      <Icon name="delete" size={25} color="red" />
                      <Text style={{fontSize: 18, color: 'red', fontWeight: 'bold'}}>Deletar</Text>
                    </Pressable>
                    
                    <Pressable
                      style={[styles.button, styles.buttonClose]}
                      onPress={() => setModalOpen(!modalOpen)}>
                      <Text style={{marginTop: 10, fontSize: 18, color: '#333', fontWeight: 'bold'}}>Fechar</Text>
                    </Pressable>
                </View>
                </View>
        </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textStyle:{
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16
  },
  imageModal:{
    width: '100%',
    height: undefined,
    aspectRatio: 1
  },
  image:{
    width: 60,
    height: 60
  },
  title:{
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 15
  },
  imggaleria: {
    width: 85,
    height: undefined,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: 'black',
    marginLeft: 5
  },
  header_container:{
    height: 200,
    marginBottom: 20
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
  width: '95%',
  marginLeft: 'auto',
  marginRight: 'auto',
  padding: 10,
  borderRadius: 10,
  backgroundColor: '#2e385e',
  marginTop: 15,
  marginBottom: 15
}
});
