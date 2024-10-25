import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Pressable, TextInput, Image, SafeAreaView, ImageBackground, Modal, Alert, FlatList} from 'react-native';
import {db, Timestamp} from '../../firebase';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, startAt, endAt, orderBy, doc, updateDoc } from "firebase/firestore";
import { format, addHours } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';


export default function Notifica({navigation,route}) {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);
    const [userId, setUserID] = useState(null);
    const [tpUser, setTpUser] = useState(null);
    const [userInfo, setUserInfo] = useState([]);
    const [userName, setUserName] = useState(null);
    const {height} = Dimensions.get('window');
    const auth = getAuth();

    const [notification, setNot] = useState([]);

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
      
        //♣ puxando notificações
        const q = query(collection(db, "notificacao"), where("para", "==", userId), orderBy("data", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const notifi = [];
          querySnapshot.forEach((doc) => {
            let test = [];

            test.push(doc.data());
            test[0]['docidd'] = doc.id;

            notifi.push(test[0]);
          });

          setNot(notifi);
          
        });
      }, [notification]);

    const convertFirestoreTimestampToDate = (timestamp) => {
        return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    };

    const redirect = async(type, val, docidd) => {

      // atualizando notificacao

      const notifupdate = doc(db, "notificacao", docidd);


      // Set the "capital" field of the city 'DC'
      await updateDoc(notifupdate, {
        status: 1
      });

      console.log(type);


      if(type == "agendamento"){
        navigation.navigate("Detalhes", {tipo: tpUser, prestadorID: userId, clientID: val.client, agendamento: val.agendamento})
      }else if(type == "chat"){
        navigation.navigate("Chat", {prestador: val.prestador, cliente: val.cliente, type: 'notify'});
        console.log("==== aqui")
      }
    }


      const renderItem = ({ item }) => {
        const dateF = convertFirestoreTimestampToDate(item.data);
        const dataFormatada = format(dateF, 'dd/MM/yyyy HH:mm');

        let stateVis = null;

        if(item.status == 0){
          stateVis = "#fff";
        }else{
          stateVis = "#bfbfbf";
        }

        let values = null;
        let icon = null;

        if(item.type == "agendamento"){
           values = {
            client: item.de,
            agendamento: item.idAgen
          }
          icon = 'notifications';
        }else if(item.type == "chat"){

          if(tpUser == "prestador"){
            values = {
              cliente: item.de,
              prestador: item.para
            }
          }else{
            values = {
              cliente: item.para,
              prestador: item.de
            }
          }

          
          icon = 'chat'
        }

        

        return(
            <Pressable onPress={() =>  redirect(item.type, values, item.docidd)} style={[styles.connotifi, {backgroundColor: stateVis}]}>
                <Icon name={icon} size={40} color="#000" style={{marginRight: 10}}/>

                <View style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', width: '80%'}}>
                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>{item.title}</Text>
                    <Text style={{fontSize: 17, marginTop: 10}}>{item.text}</Text>
                    <Text style={{marginTop: 15, textAlign: 'right', fontWeight: 'bold', fontSize: 16}}>{dataFormatada}</Text>
                </View>
            </Pressable>
        )
      }

   

  return (
    <SafeAreaView style={{height: '100%'}}>
        <FlatList
                data={notification}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  image:{
    width: 60,
    height: 60
  },
  connotifi:{
    width: '95%',
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
    padding: 10,
    borderRadius: 10
  }
});
