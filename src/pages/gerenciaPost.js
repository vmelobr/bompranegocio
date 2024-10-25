import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Pressable, TextInput, Image, SafeAreaView, ImageBackground, Modal, Alert, FlatList} from 'react-native';
import {db, Timestamp, storage} from '../../firebase';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, startAt, endAt, orderBy, doc, deleteDoc } from "firebase/firestore";
import { format, addHours } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { requestBackgroundPermissionsAsync, getCurrentPositionAsync, LocationObject, requestForegroundPermissionsAsync, watchPositionAsync, LocationAccuracy } from 'expo-location';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject} from "firebase/storage";



export default function GerenciaPost({navigation,route}) {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);
    const [userId, setUserID] = useState(null);
    const [tpUser, setTpUser] = useState(null);
    const [userInfo, setUserInfo] = useState([]);
    const [userName, setUserName] = useState(null);
    const {height} = Dimensions.get('window');
    const auth = getAuth();

    const [updateLoc, setUpdateLoc]  =  useState(false);

    const [listSearch, setListSearch] = useState([]);
    const [numSearch, setNumSearch] =  useState(0);
    const [location, setLocation] = useState(null);
    const [post, setPost]  = useState([]);

    async function requestLocationPermissions() {
      const {granted} = await requestForegroundPermissionsAsync();
  
      if(granted){
        const currentPosition = await getCurrentPositionAsync();
        setLocation(currentPosition);
      }
    }

    useEffect(() => {
      const subscriber = auth.onAuthStateChanged((userr) => {
        setUser(userr);
        if (initializing) setInitializing(false);
      });
   
    }, [initializing, user]);

    useEffect(() => {
     
        const q = query(collection(db, "posts"), where("client", "==", route.params.client));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const posts = [];
          querySnapshot.forEach((doc) => {
            const arr = {
                iddoc: doc.id,
                img: doc.data().img,
                text: doc.data().text,
                clientName: doc.data().clientName,
                data: doc.data().data,
                address: {
                    cidade: doc.data().address.cidade
                }
            }
              posts.push(arr);
          });
          setPost(posts);
        });
      

    }, []);

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
            });

            setUserInfo(userInf);
            
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

    const formatDate = (date) =>{
      const data = date.toDate();

      const formattedDate = data.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
      });

      const formattedTime = data.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
      });

      return formattedDate+' '+formattedTime;
  }


    const renderItem = ({ item }) => {
      return(
      <View style={styles.boxsocial}>
        <View style={{width: '20%'}}>
            <Image 
              source={{ uri: item.img }} 
              style={styles.image} 
            />
        </View>
        <View style={{width: '80%'}}>
            <Pressable><Icon name="visibility" size={80} color="#333" /> <Text>4523</Text></Pressable>
        </View>
        <View style={{width: '80%'}}>
            <Pressable onPress={() => navigation.navigate('Chat', {post: item.id, client: item.client, type: 'prestador'})}><Text>Tenho Interesse</Text></Pressable>
        </View>
      </View>
    )};

    const renderPost = ({item}) =>{
      return(
        <View style={styles.cardPost}>
            <Image 
              source={{ uri: item.img }} 
              style={styles.image} 
            />
            <View style={{marginTop: 15, display:'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={{fontSize: 18, fontWeight: 'bold', textTransform:'capitalize'}}>{item.clientName}</Text>
              <Text style={{fontSize: 16, fontWeight: 'bold', textTransform:'capitalize', color:'#333'}}>{item.address.cidade}</Text>
            </View>

            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: 10}}>
              <Icon name="schedule" size={30} color="#333" style={{marginRight: 5}}/>
              <Text style={{fontWeight: 'bold'}}>{formatDate(item.data)}</Text>
            </View>

            <Text style={{fontSize: 16, padding: 10, backgroundColor: '#f1f1f1', borderRadius: 10, marginTop: 15}}>{item.text}</Text>

            <Pressable onPress={() => deletePost(item.iddoc, item.img)} style={{width: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor:'red', padding: 15, borderRadius: 10, marginTop:15}}><Text style={{fontSize:  18, color: '#fff', textAlign: 'center'}}>Remover</Text></Pressable>
        </View>
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

    const deletePost = async(id, img) =>{
        console.log('====>', id);

        await deleteDoc(doc(db, "posts", id));
        deleteFileFromUrl(img);

        Alert.alert("Postagem Excluida com Sucesso!");
    }

  return (
    <SafeAreaView style={{height: '100%', backgroundColor: '#fff'}}>
        <Text style={{fontSize: 18, fontWeight: 'bold', margin: 15}}>Minhas Postagens ({post.length}):</Text>
        <FlatList
             data={post}
              renderItem={renderPost}
              keyExtractor={item => item.id}
              style={{width: '100%'}}
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  image:{
    width: '100%',
    height: undefined,
    aspectRatio: 1
  },
  cardPost:{
    width: '85%',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 10,
    backgroundColor: '#fff',
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.50,
    shadowRadius: 3.84,
    // Android Shadow
    elevation: 5,
    padding:10,
    marginBottom:15
  }
});
