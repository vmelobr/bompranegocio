import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Pressable, TextInput, Image, SafeAreaView, ImageBackground, Modal, Alert, FlatList} from 'react-native';
import {db, Timestamp} from '../../firebase';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, startAt, endAt, orderBy } from "firebase/firestore";
import { format, addHours } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { requestBackgroundPermissionsAsync, getCurrentPositionAsync, LocationObject, requestForegroundPermissionsAsync, watchPositionAsync, LocationAccuracy } from 'expo-location';


export default function Social({navigation,route}) {
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
     
      requestLocationPermissions();

      let latitude =  null;
      let longitude = null;

      watchPositionAsync({
        accuracy: LocationAccuracy.Highest,
        timeInterval: 25000,
        distanceInterval: 1
      },  (response)  => {
        setLocation(response);

        if(!updateLoc){

          // buscandos posts perto

          const R = 6371; // Raio da Terra em km
          const maxDistance = 30; // Raio de 30 km

          const latDiff = maxDistance / R;
          const lngDiff = maxDistance / (R * Math.cos((Math.PI * response.coords.latitude) / 180));

          const latMin = response.coords.latitude - latDiff;
          const latMax = response.coords.latitude + latDiff;
          const lngMin = response.coords.longitude - lngDiff;
          const lngMax = response.coords.longitude + lngDiff;

          const q = query(collection(db, "posts"), 
            where("location.latitude", ">=", latMin),
            where("location.latitude", "<=", latMax),
            where("location.longitude", ">=", lngMin),
            where("location.longitude", "<=", lngMax)
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const posts = [];
            querySnapshot.forEach((doc) => {
                posts.push(doc.data());
            });
            setPost(posts);
          });

          setUpdateLoc(true);
        }
        console.log(response)
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
            <Pressable onPress={() => navigation.navigate('Chat', {prestador: userId})}><Text>Tenho Interesse</Text></Pressable>
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

            <Pressable onPress={() => navigation.navigate('Chat', {type:  'post',})} style={{width: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor:'#2e385e', padding: 15, borderRadius: 10, marginTop:15}}><Text style={{fontSize:  18, color: '#fff', textAlign: 'center'}}>Tenho Interesse</Text></Pressable>
        </View>
      )
    }

  return (
    <SafeAreaView style={{height: '100%', backgroundColor: '#fff'}}>
        <Text style={{fontSize: 18, fontWeight: 'bold', margin: 15}}>Oportunidades De Trabalho ({post.length}):</Text>
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
