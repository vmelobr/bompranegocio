import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Pressable, TextInput, Image, SafeAreaView, ImageBackground, Modal, Alert, FlatList} from 'react-native';
import {db, Timestamp} from '../../firebase';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, startAt, endAt, orderBy } from "firebase/firestore";
import { format, addHours } from 'date-fns';

export default function Busca({navigation,route}) {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);
    const [userId, setUserID] = useState(null);
    const [tpUser, setTpUser] = useState(null);
    const [userInfo, setUserInfo] = useState([]);
    const [userName, setUserName] = useState(null);
    const {height} = Dimensions.get('window');
    const auth = getAuth();

    const [listSearch, setListSearch] = useState([]);
    const [numSearch, setNumSearch] =  useState(0);

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

    useEffect(() => {
      
      const search = route.params.service;

      console.log(search)
      
      const qsearch = query(collection(db, "user"), orderBy('services'), where("payment", "==", 1), where("services", "array-contains", search));
      const unsubscribe = onSnapshot(qsearch, (querySnapshot) => {
        const searchList = [];
        querySnapshot.forEach((doc) => {
          searchList.push(doc.data());
        });


        setListSearch(searchList);
        setNumSearch(searchList.length);
        
      });

        
   
    }, [listSearch, numSearch]);

    const openPrestador = (id) =>{
      navigation.navigate("Perfil",  {idUss:  id});
      console.log("======id===>", id);
    }


    const renderItem = ({ item }) => {
      return(
      <Pressable onPress={() => openPrestador(item.id)} style={{width: '90%',  marginLeft: 'auto', marginRight: 'auto', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', marginTop: 15, padding: 10}}>
        <View style={{width: '20%'}}>
            <Image 
              source={{ uri: item.avatar }} 
              style={styles.image} 
            />
        </View>
        <View style={{width: '80%'}}>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>{item.name}</Text>
            <Text style={{fontSize: 16}}>Estado: {item.uf}</Text>
            <Text>Cidade: {item.cidade}</Text>
        </View>
      </Pressable>
    )};


  return (
    <SafeAreaView style={{height: '100%'}}>
        <Text style={{marginLeft: 10, marginTop: 10, fontSize: 18}}>Numero De Resultados ({numSearch})</Text>

        {numSearch == 0?(
          <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 15, marginLeft: 10}}>Nenhum Prestador Encontrado!</Text>
        ):(
          <FlatList
                data={listSearch}
                renderItem={renderItem}
                keyExtractor={item => item.id}
          />
        )}
        
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  image:{
    width: 60,
    height: 60
  }
});
