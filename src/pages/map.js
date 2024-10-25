import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, ImageBackground, TextInput, ScrollView, Dimensions,TouchableOpacity, Image, Alert, Modal, Pressable, FlatList, SafeAreaView, Animated  } from 'react-native';
import {db} from '../../firebase';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, Timestamp, updateDoc, doc} from "firebase/firestore";
import { format, addHours } from 'date-fns';
import { requestBackgroundPermissionsAsync, getCurrentPositionAsync, LocationObject, requestForegroundPermissionsAsync, watchPositionAsync, LocationAccuracy } from 'expo-location';
import MapView, {Marker} from 'react-native-maps';

const MapaView = ({navigation, route}) => {
    // Calcula a região para ajustar o zoom
    const [region, setRegion] = useState(null);
    const mapRef = useRef(null);
    const { width, height } = Dimensions.get('window');
    const LATITUDE_DELTA = 0.0922;
    const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);
    const [localPrimary, setLocalPrimary] = useState({
      latitude: 0,
      longitude: 0
    });
    const [localSecundary, setLocalSecundary] = useState([]);
    const [modalDetalVisibility, setModalDetailVis] = useState(false);
    const [location, setLocation] = useState([]);
    const [locationPresta, setLocationPresta] = useState({
      latitude: 0,
      longitude: 0
    });

    const [prestador, setPrestador] = useState(null);
    const [prestadorID, setPrestadorID] = useState(null);
    const [clientID, setClientID] = useState(null);
    const [tempmin, setTempMin] = useState(0);
    const [kmtemp, setKmTemp] = useState(0);

    const [infomapLoad, setInfoMapLoad] = useState(false);

    const [avatar, setAvatar] = useState('https://i.imgur.com/UG96RRu.jpeg');

    const [agendamentoID, setAgendamentoID] = useState(null);
    const [docagenid, setdocagenid] = useState(null);

    // Criação dos valores de animação
    const fadeAnim = useRef(new Animated.Value(0)).current; // Para fade-in
    const moveAnim = useRef(new Animated.Value(50)).current; // Para movimento para cima

    const confirmChegada = async(docid) =>{

      Alert.alert(
        "Confirmação",
        "Você Confirma Sua Chegada Ao Local?",
        [
          {
            text: "Cancelar",
            onPress: () => console.log("Cancelado"),
            style: "cancel"
          },
          {
            text: "Confirmar",
            onPress: async() => {
              const agenup = doc(db, "agendamentos", docid);
              await updateDoc(agenup, {
                  chegada: 1
              });

              const docRefN = await addDoc(collection(db, "notificacao"), {
                      de: prestadorID,
                      para: clientID,
                      data: serverTimestamp(),
                      status: 0,
                      title: "Prestador Chegou!",
                      text: "Prestador de serviço está te esperando na localidade agendada!",
                      idAgen: agendamentoID,
                      type: "agendamento",
                      docid: docagenid
              });
            }
          }
        ],
        { cancelable: false } // Define se a caixa de diálogo pode ser fechada tocando fora dela
      );


      
    }

    const [infoGeral, setInfoGeral] = useState([]);
    const [clientName, setClientName] = useState('');
    const [datamarcada, setdatamarcada] = useState('');
    const [chegadavar, setchegadavar] = useState(false);
    const [modalAjuda, setModalAjuda] = useState(false);

    const formatTimestamp = (timestamp) => {
      const date = timestamp.toDate();
      return format(date, 'dd/MM/yyyy HH:mm:ss'); // Você pode ajustar o formato conforme necessário
    };

    const ajudapresta = () => {
      setModalAjuda(true);
    }

    const ajudaset = async(motive) => {
      if(motive == "natendido"){
        const docRefN = await addDoc(collection(db, "notificacao"), {
                de: prestadorID,
                para: clientID,
                data: serverTimestamp(),
                status: 0,
                title: "Prestador Chegou e Não Foi Atendido",
                text: "Prestador de serviço não foi atendido então serviço será cancelado",
                idAgen: agendamentoID,
                type: "agendamento",
                docid: docagenid
        });

        const locationUp = doc(db, "agendamentos", docagenid);
        await updateDoc(locationUp, {
            status: 2
        });

        Alert.alert(
          'Serviço Cancelado Com Sucesso!',
          '',
          [{ text: 'OK' }]
        );
        navigation.navigate('Painel');
      }else if(motive == "prestaproblema"){
        const docRefN = await addDoc(collection(db, "notificacao"), {
                de: prestadorID,
                para: clientID,
                data: serverTimestamp(),
                status: 0,
                title: "Prestador Teve Problemas",
                text: "Prestador de serviço teve problemas ao chegar na sua localidade, o serviço será cancelado",
                idAgen: agendamentoID,
                type: "agendamento",
                docid: docagenid
        });

        const locationUp = doc(db, "agendamentos", docagenid);
        await updateDoc(locationUp, {
            status: 2
        });

        Alert.alert(
          'Serviço Cancelado Com Sucesso!',
          '',
          [{ text: 'OK' }]
        );
        navigation.navigate('Painel');
      }else{
        const docRefN = await addDoc(collection(db, "notificacao"), {
                de: prestadorID,
                para: clientID,
                data: serverTimestamp(),
                status: 0,
                title: "Desacordo com Prestador",
                text: "Prestador relatou desacordo e o agendamento será cancelado!",
                idAgen: agendamentoID,
                type: "agendamento",
                docid: docagenid
        });

        const locationUp = doc(db, "agendamentos", docagenid);
        await updateDoc(locationUp, {
            status: 2
        });

        Alert.alert(
          'Serviço Cancelado Com Sucesso!',
          '',
          [{ text: 'OK' }]
        );
        navigation.navigate('Painel');
      }
    }

    const markers = [
        {
          id: 1,
          title: 'Localização 1',
          description: 'Descrição 1',
          coordinate: {
            latitude: localPrimary.latitude,
            longitude: localPrimary.longitude,
          },
        },
        {
          id: 2,
          title: 'Localização 2',
          description: 'Descrição 2',
          coordinate: {
            latitude: locationPresta.latitude,
            longitude: locationPresta.longitude,
          },
          icon: require('./iconmap.png')
        },
      ];

      

      useEffect(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(moveAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start();
      }, [fadeAnim, moveAnim]);

      const animatedStyle = {
        opacity: fadeAnim,
        transform: [{ translateY: moveAnim }],
      };

    useEffect(() => {
        const q = query(collection(db, "agendamentos"), where("id", "==", route.params.agendamento));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const agendamento = [];
          querySnapshot.forEach((doc) => {
            agendamento.push(doc.data());
            setPrestador(doc.data().prestadorName);
            setPrestadorID(doc.data().prestador);
            setClientID(doc.data().cliente);
            setAgendamentoID(doc.data().id);
            setdocagenid(doc.id);
            setClientName(doc.data().clienteName);
            setdatamarcada(formatTimestamp(doc.data().data));

            if(doc.data().chegada){
              setchegadavar(true);
            }
          });
        
          setInfoGeral(agendamento);

          setLocalPrimary(agendamento[0].locationService);
          setLocalSecundary(agendamento[0].locationPrestador);
          setLocationPresta(agendamento[0].locationPrestador);

          const locationPrest = {
            latitude: agendamento[0].locationPrestador.latitude,
            longitude: agendamento[0].locationPrestador.longitude
          }

          setLocation(locationPrest);
          setInfoMapLoad(true);

          const point1 = { latitude: agendamento[0].locationService.latitude, longitude: agendamento[0].locationService.longitude};
          const point2 = { latitude: agendamento[0].locationPrestador.latitude, longitude: agendamento[0].locationPrestador.longitude};
          const distance = haversineDistance(point1, point2);

          const km = distance.toFixed(2);

          const speed = 40; // Velocidade média em km/h
          const time = calculateTravelTime(distance, speed);

          const timeTotal = time.toFixed(2);
          let timeTotalFormated = (timeTotal * 100).toString();
          setTempMin(timeTotalFormated);
          setKmTemp(km);

          let zoom = 0;
            if(kmtemp >= 18){
              zoom = 11;
            }else{
              zoom = 15;
            }            

            mapRef.current?.animateCamera({
              pitch: 50,
              center: {
                latitude: (agendamento[0].locationService.latitude + agendamento[0].locationPrestador.latitude) / 2,
                longitude: (agendamento[0].locationService.longitude + agendamento[0].locationPrestador.longitude) / 2
              },
              heading: 10,
              altitude: 5,
              zoom: 12,
            });


            //☺ puxando info do prestador

        const qpresta = query(collection(db, "user"), where("id", "==", agendamento[0].prestador));
        const unsubscribepresta = onSnapshot(qpresta, (querySnapshot) => {
          const infopresta = [];
          querySnapshot.forEach((doc) => {
            infopresta.push(doc.data());
          });
          setAvatar(infopresta[0].avatar);
        });
        });
     
    }, [kmtemp, infomapLoad]);


    async function requestLocationPermissions() {
        const {granted} = await requestForegroundPermissionsAsync();
    
        if(granted){
          const currentPosition = await getCurrentPositionAsync();
          setLocation(currentPosition);
        }
      }

    async function updateLocation(latitude, longitude, docid){

      console.log('================', docid)

        const locationUp = doc(db, "agendamentos", docid);
        

        await updateDoc(locationUp, {
            "locationPrestador.latitude": latitude,
            "locationPrestador.longitude": longitude
        });

    }

      useEffect(() => {
        requestLocationPermissions();
      }, []);


      useEffect(() => {

        if(route.params.tipo == "prestador"){
          watchPositionAsync({
            accuracy: LocationAccuracy.Highest,
            timeInterval: 15000,
            distanceInterval: 1
          },  (response)  => {
            setLocation(response);

            if(route.params.docid){
              updateLocation(response.coords.latitude, response.coords.longitude, route.params.docid);
            }
          });
        }

      }, []);

      const toRad = (value) => {
        return value * Math.PI / 180;
      };
      
      const haversineDistance = (point1, point2) => {
        const R = 6371; // Raio da Terra em quilômetros
        const dLat = toRad(point2.latitude - point1.latitude);
        const dLon = toRad(point2.longitude - point1.longitude);
        const lat1 = toRad(point1.latitude);
        const lat2 = toRad(point2.latitude);
      
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      
        return R * c; // Distância em quilômetros
      };

      const calculateTravelTime = (distance, speed) => {
        return distance / speed; // Tempo em horas
      };

      const redirectChat = ()=>{
        navigation.navigate("Agendamento", {tipo: route.params.tipo, prestadorID: prestadorID, clientID: clientID});
      }


      return(
        <SafeAreaView>            
            <View style={styles.containerMap}>
            { infomapLoad &&
                <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: (localPrimary.latitude + locationPresta.latitude) / 2,
                  longitude: (localPrimary.longitude + locationPresta.longitude) / 2,
                  latitudeDelta: Math.abs(localPrimary.latitude - locationPresta.latitude) * 2,
                  longitudeDelta: Math.abs(localPrimary.longitude - locationPresta.longitude) * 2,
                }}
                >
                    {markers.map(marker => (
                        <Marker
                            key={marker.id}
                            coordinate={marker.coordinate}
                            title={marker.title}
                            description={marker.description}
                            image={marker.icon} 
                        />
                    ))}
                </MapView>
            }
            
            </View>


            <Animated.View style={[styles.containerDetail, animatedStyle]}>
              {route.params.tipo == "prestador"?(
                <View>
                    <View style={styles.rowcontainer}>
                      <View style={{width: '90%', marginLeft: 'auto', marginRight: 'auto'}}>
                          <Text style={{fontSize: 22, fontWeight: 'bold', textTransform: 'capitalize'}}>{clientName}</Text>
                          <Text style={{fontSize: 18, textTransform: 'capitalize', fontWeight: 'bold', marginTop: 15, marginBottom: 15}}>Cliente Te Aguarda no Destino....</Text>
                          <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 15}}>Data Marcada: {datamarcada}</Text>
                          
                          {chegadavar ?(
                            <View>
                                <Text style={{fontSize: 22, fontWeight: 'bold', textTransform: 'uppercase'}}>Cliente notificado!</Text>
                                <Text style={{fontSize: 16, textTransform: 'capitalize'}}>Aguarde O Cliente Atender...</Text>

                                <Pressable onPress={() => ajudapresta()} style={{width: '100%'}}><Text style={{textAlign: 'center', fontSize: 18, color: 'blue', textTransform: 'capitalize'}}>Preciso de Ajuda!</Text></Pressable>
                            </View>
                            
                          ):(
                            <Pressable onPress={() => confirmChegada(route.params.docid)} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', borderRadius: 10, padding: 10, backgroundColor: '#2e385e'}}> 
                              <Text style={{fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#fff', textTransform: 'uppercase'}}>Cheguei Ao Local!</Text>
                            </Pressable>
                          )}
                          
                          
                      </View>
                  </View>
                </View>
              ):(
                <View>
                    <View style={styles.rowcontainer}>
                      <View style={{width: '30%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                          <Image
                              style={styles.avatar}
                              source={{ uri: avatar }}
                              resizeMode="cover" // Ajuste o modo de redimensionamento conforme necessário
                          />
                      </View>
                      <View style={{width: '70%'}}>
                          <Text> <Text style={{fontSize: 18, fontWeight: 'bold'}}>{prestador}</Text> Está a Caminho, e Chegará </Text>
                          <Text style={{fontSize: 16, fontWeight: 'bold'}}>Em {tempmin} Minutos...</Text>
                      </View>
                  </View>
                </View>
              )}
               
            </Animated.View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalAjuda}
                onRequestClose={() => {
                setModalAjuda(!modalAjuda);
                }}>
                <View style={styles.centeredViewM}>
                  <View style={styles.modalViewM}>
                      <Text style={{fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize'}}>Nos Informe o problema:</Text>

                      <Pressable onPress={() => ajudaset('natendido')} style={styles.btnlist}><Text style={styles.textlist}>Cliente Não Atendeu!</Text></Pressable>
                      <Pressable onPress={() => ajudaset('prestaproblema')} style={styles.btnlist}><Text style={styles.textlist}>Tive Um Problema</Text></Pressable>
                      <Pressable onPress={() => ajudaset('desacordo')} style={styles.btnlist}><Text style={styles.textlist}>Desacordo Com O Cliente</Text></Pressable>
                  </View>
                </View>
            </Modal>
            
        </SafeAreaView>
      )
}

const styles = StyleSheet.create({
    
    containerMap: {
        width: '100%',
        height: '100%'
    },
    containerDetail: {
        width: '98%',
        height: 200,
        maxHeight: 400,
        backgroundColor: '#fff',
        position: 'absolute',
        marginLeft: 4,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        bottom: 0,
        // Sombras para iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        // Sombras para Android
        elevation: 10,
        
    },
    rowcontainer:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10
    },
    map: {
        width: '100%',
        flex: 1
    },
    campochat: {
        backgroundColor: '#f2f2f2',
        marginTop: 15,
        padding: 10,
        borderRadius: 10,
        width: '95%',
        marginLeft: 'auto',
        marginRight: 'auto'
    },
    avatar: {
        width: 80,
        height: 80
    },
    centeredViewM: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },
    modalViewM: {
      margin: 0,
      backgroundColor: 'white',
      padding: 20,
      alignItems: 'left',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      width: '95%',
      position: 'absolute',
      bottom: 0,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      maxHeight: '100%'
    },
    btnlist: {
      width: '95%',
      marginLeft: 'auto',
      marginRight: 'auto',
      backgroundColor: '#f2f2f2',
      padding: 10,
      borderRadius: 10,
      marginTop: 15
    },
    textlist: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      textAlign: 'center'
    }
});


export default MapaView;