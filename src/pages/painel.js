import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Pressable, TextInput, Image, SafeAreaView, ImageBackground, Modal, Alert, FlatList, PanResponder} from 'react-native';
import {db, Timestamp, storage} from '../../firebase';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, addDoc, serverTimestamp, updateDoc} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL} from "firebase/storage";
import { format, addHours } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { requestBackgroundPermissionsAsync, getCurrentPositionAsync, LocationObject, requestForegroundPermissionsAsync, watchPositionAsync, LocationAccuracy } from 'expo-location';

export default function Painel({navigation}) {
    const [selectcateg, setselectcateg] = useState("none");
    const [selectservic, setselectservic] = useState("none");

    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);
    const [userId, setUserID] = useState(null);
    const [tpUser, setTpUser] = useState(null);
    const [searchUser, setSearchuser] = useState(null);
    const [userInfo, setUserInfo] = useState([]);
    const [userName, setUserName] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(0);
    const inputsearch = useRef(null);
    const [textplacesearch, setPlaceSearch] = useState(null);
    const {height} = Dimensions.get('window');
    const auth = getAuth();
    const [userDoc, setUserDoc] = useState(0);

    const [modalAgenVis, setModalAgenVis] = useState(false);

    const [agenConfirm, setAgenConfirm] = useState([]);
    const [agenPendente, setAgenPendente] = useState([]);
    const [agenCancel, setAgenCancel] = useState([]);

    const [agendamentos, setAgendamentos] = useState([]);
    const [agenDom, setAgenDom] = useState(null);

    const [displayAgenNow, setdisplayAgenNow] = useState('none');

    const [agenNowValue, setAgenNowValue]  = useState(null);
    const [agenNowDoc, setdpcagennow] = useState(null);

    const [agenFlatList, setAgenFlatList] = useState([]);
    const [modalAgenTitle, setmodalAgenTitle] = useState("");
    const [docc, setDocc] = useState(null);
    const [location, setLocation] = useState(null);
    const [numNotify, setNumNotify] = useState(0);
    const [marginNotify, setMarginNotify] = useState(15);


    const [servicelist, setservicelist] = useState([]);
    const [categlist, setcateglist] = useState([]);

    const [categlistarr, setcateglistarr] = useState(null);

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

      setModalpostvis(false);
      setUrlImg(url);
    }

  const enviarImagem = async() => {
      uploadImage(imagepost);
  }

  const pickImage = async () => {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

  
      if (!result.canceled) {
        setImgPost(result.assets[0].uri);
      }
  }

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (event, gestureState) => {
          // Verificar se o gesto é um arrasto para baixo
          if (gestureState.dy > 0) {
            console.log('Arrasto para baixo detectado');
          }
        },
        onPanResponderRelease: () => {
          // Responder ao fim do gesto, se necessário
        },
      })
    ).current;

    const searchSet = (sea) =>{
      setSearchuser(sea);
    }

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
          second: '2-digit'
      });

      return formattedDate+' '+formattedTime;
  }

    const openModal = (val) =>{
      var dom = null;

      if(val == "agendados"){
        setAgenFlatList(agenConfirm);
        setmodalAgenTitle("Confirmados");
      }else if(val == "pendentes"){
        setAgenFlatList(agenPendente);
        setmodalAgenTitle("Pendentes");
      }else{
        setAgenFlatList(agenCancel);
        setmodalAgenTitle("Cancelados");
      }
      setAgenDom(dom);
      setModalAgenVis(true);
    }

    useEffect(() => {
      const subscriber = auth.onAuthStateChanged((userr) => {
        setUser(userr);
        if (initializing) setInitializing(false);
      });
   
    }, [initializing, user]);

    async function requestLocationPermissions() {
      const {granted} = await requestForegroundPermissionsAsync();
  
      if(granted){
        const currentPosition = await getCurrentPositionAsync();
        setLocation(currentPosition);
      }
    }

    useEffect(() => {
     
      requestLocationPermissions();

      watchPositionAsync({
        accuracy: LocationAccuracy.Highest,
        timeInterval: 25000,
        distanceInterval: 1
      },  (response)  => {
        setLocation(response);
        if(!locationUpdate){
          if(userDoc){
            const update = doc(db, "user", userDoc);
            updateDoc(update, {
              location: {
                latitude: response.coords.latitude,
                longitude: response.coords.longitude
              }
            });
          }
        }
      });

    }, []);

    useEffect(() => {


      if(user != null){

          const q = query(collection(db, "user"), where("email", "==", user.email));
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userInf = [];

            querySnapshot.forEach((doc) => {
              userInf.push(doc.data());
              setUserName(doc.data().name);
              setPaymentStatus(doc.data().payment);
              setTpUser(doc.data().type);
              setUserID(doc.data().id);
              setUserDoc(doc.id);
            });

            setUserInfo(userInf);


            // puxando notificações

            const qnotify = query(collection(db, "notificacao"), where("para", "==", userInf[0].id), where("status", "==", 0));
            const unnot = onSnapshot(qnotify, (querySnapshot) => {
              const notificat = [];
              querySnapshot.forEach((doc) => {
                notificat.push(doc.data());
              });

              if(notificat.length > 9){
                setMarginNotify(10);
              }else{
                setMarginNotify(15)
              }

              setNumNotify(notificat.length);
            });

            const now = new Date();
            const twentyFourHoursLater = new Date();
            twentyFourHoursLater.setHours(now.getHours() + 24);

            let typeQuery = "";

            if(tpUser == "cliente"){
              typeQuery =  "cliente";
            }else{
              typeQuery =  "prestador";
            }


            const qagenNow = query(collection(db, "agendamentos"), where(typeQuery, "==",  userId), where("data", ">=", now), where("data", "<=", twentyFourHoursLater), where('status', '!=', 2));
            const qagenNowS = onSnapshot(qagenNow, (querySnapshot) => {
              const agenNow = [];
              let displayagg = false;
              querySnapshot.forEach((doc) => {
                agenNow.push(doc.data());
                setAgenNowValue(doc.data().id);
                setdpcagennow(doc.id);
                if(doc.data().saida){
                  displayagg = true;
                }
              });

              

              if(displayagg){
                setdisplayAgenNow('block');
              }else{
                console.log("não saiu ainda....")
              }

            });
            
          });
      }
    }, [user, userId]);

    

    useEffect(() => {      
      if(tpUser != null){

        var tpus = null;


        if(tpUser == "cliente"){
          tpus = "cliente";
          setPlaceSearch("Busque Prestadores...");
        }else{
          tpus = "prestador";
          setPlaceSearch("Busque Por Clientes...");
        }

        const qagen = query(collection(db, "agendamentos"), where(tpus, "==", userId));
          const uns2 = onSnapshot(qagen, (querySnapshot) => {
            var ageninfo = [{
              confirmado: [],
              pendente: [],
              cancelado: []
            }];
            const arragen = [];
            const agenPendente = [];
            const agenConfirm = [];
            const agenCancel = [];

            querySnapshot.forEach((doc) => {
              if(doc.data().status == 0){
                agenPendente.push(doc.data());
              }else if(doc.data().status == 1){
                agenConfirm.push(doc.data());
              }else{
                agenCancel.push(doc.data());
              }

              arragen.push(doc.data());
            });


            setAgendamentos(arragen);

            setAgenConfirm(agenConfirm);
            setAgenPendente(agenPendente);
            setAgenCancel(agenCancel);

          });
      }


      // pegando categorias

      const qcategs = query(collection(db, "services"));
      const uncateg = onSnapshot(qcategs, (querySnapshot) => {
        const categs = [];
        const categsdom = [];
        querySnapshot.forEach((doc) => {
            categs.push(doc.data());
            categsdom.push(<Picker.Item label={doc.data().categ} value={doc.data().categ} />);
        });
        
        setcateglistarr(categs);
        setcateglist(categsdom);

      });
   
    }, [textplacesearch, tpUser, userId]);


    const openMap = () =>  {
      navigation.navigate('Mapa', {agendamento: agenNowValue, tipo: tpUser, docid: agenNowDoc});
    }

    const realizaConsulta = () => {
      
      if(selectcateg == "none"){
        Alert.alert("Selecione a categoria desejada...");
      }else if(selectservic == "none"){
        Alert.alert("Selecione o tipo de serviço desejado...");
      }else{
        navigation.navigate("Busca", {categ:  selectcateg, service: selectservic});
      }

    }

    const renderAgen = ({item}) =>{
      let displayName = "";
      
      if(tpUser == "prestador"){
        displayName = item.clienteName;
      }else{
        displayName = item.prestadorName;
      }

      let color = "";

      if(item.status == 0){
        color = 'rgba(204, 204, 204, 0.5)';
      }else if(item.status == 1){
        color = 'rgba(38, 201, 67, 0.7)';
      }else{
        color = 'rgba(207, 28, 28, 0.7)';
      }

      return(
        <Pressable onPress={() => navigation.navigate("Detalhes", {tipo: tpUser, prestadorID: item.prestador, clientID: item.cliente, agendamento: item.id})} style={{width: '100%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: color, marginTop: 15, padding: 10, borderRadius: 10}}>
          <Text style={{fontSize: 16, fontWeight: 'bold'}}>{displayName}</Text>
          <Text style={{fontSize: 16, fontWeight: 'bold'}}>{item.local.cidade}, {item.local.estado}</Text>
          <Text style={{fontSize: 18, textAlign: 'right', marginTop: 15}}>Data: {formatDate(item.data)}</Text>
        </Pressable>
      )
    }

    /*useEffect(() => {
      const updatevisto = doc(db, "user", userDoc);

      updateDoc(updatevisto, {
        visto: serverTimestamp()
      });

      console.log("atualizou", userDoc)
    }, [userDoc])*/

    const [modalPostVis, setModalpostvis] = useState(false);
    const [selectCategPost, setSelectCategPost] = useState("option1");
    const [inputPost, setInputPost] = useState("");
    const [servicesSelect, setServicesSelect] = useState([]);
    const inputPostRef = useRef(null);
    const [imagepost, setImgPost] = useState("https://i.imgur.com/UG96RRu.jpeg");
    const [urlImg, setUrlImg] = useState(null);

    const [locationUpdate, setLocationUpdate] = useState(false);


    const [listservices, setlistservices] = useState([]);
    const [listservicesarr, setlistservicesarr] = useState([]);

    const setInputPostt = (text) => {
      setInputPost(text);
    }


    const changeCategService = (categ) =>{
      setselectcateg(categ);
      let base = null;

      if(categ == "none"){
        Alert.alert("Selecione Uma Categoria de Serviços...");
      }else{
        for(var i = 0; i < categlistarr.length; i++){
        
          if(categlistarr[i].categ == categ){
            // definir dom da lista de serviços
            base = categlistarr[i].services;
          }
        }
  
        const servicesDom = [];
  
        for(var i = 0; i  < base.length; i++){
          servicesDom.push(<Picker.Item label={base[i]} value={base[i]} />);
        }
  
        setlistservices(servicesDom);
      }

     
    }


    const changeService = (service) =>{

    }
    

    const openModalPost = () =>{

      // puxando serviços

      const q = query(collection(db, "services"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const domServices = [];
        querySnapshot.forEach((doc) => {
            domServices.push(<Picker.Item label={doc.data().name} value={doc.data().name} />);
        });

        setServicesSelect(domServices);
      });

      setModalpostvis(true);
    }

    function generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    const savePost = async() => {
      if(inputPost == ""){
        Alert.alert("Preencha o campo texto!");
        inputPostRef.current.focus();
      }else if(selectCategPost == ""){
        Alert.alert("Preencha o campo categoria!");
      }else{
        // salvando

        if (!imagepost) return;

        // Criar um nome de arquivo único
        const filename = imagepost.substring(imagepost.lastIndexOf('/') + 1);
        const response = await fetch(imagepost);
        const blob = await response.blob();

        // Referência ao arquivo no Firebase Storage
        const storageRef = ref(storage, filename);

        // Upload do arquivo para o Firebase Storage
        await uploadBytes(storageRef, blob);

        // Obter a URL de download
        const url = await getDownloadURL(storageRef);

        const local =  {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }

        const address  =  [];

          const urlApi = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.coords.latitude}&lon=${location.coords.longitude}`;
        
          try {
            const response = await fetch(urlApi);
            if (!response.ok) {
              throw new Error('Erro ao buscar informações de localização');
            }
        
            const data = await response.json();
            console.log('Informações da localização:', data);

            address.push({
              cidade: data.address.city,
              estado: data.address.state
            });

          } catch (error) {
            console.error('Erro na busca da localização:', error);
          }

        // Add a new document with a generated id.
        const docRef = addDoc(collection(db, "posts"), {
          client: userId,
          data: serverTimestamp(),
          text: inputPost,
          img: url,
          location:local,
          service: selectCategPost,
          address: address[0],
          clienteName: userName,
          id: generateId()
        });

        Alert.alert("Postagem efetuada com sucesso!");
        setModalpostvis(false);
      }
    }

  return (
    <SafeAreaView style={{height: '100%'}}>
            
            <View>
            <ImageBackground source={require('./bgg.png')} style={styles.header_container}>
                <Text style={{marginLeft: 10, color: '#fff',marginTop: 10, fontSize: 20, fontWeight: 'bold'}}>Bem Vindo (a), {userName}</Text>

                <View style={styles.coninfo}>
                  <Pressable style={styles.btnconinfo} onPress={() => navigation.navigate('Notifica')}>
                    <Text style={{position: 'absolute', color: '#fff', fontSize: 18, marginLeft: marginNotify, zIndex: 1, marginTop: 7, fontWeight: 'bold'}}>{numNotify}</Text>
                    <Icon name="notifications" size={40} color="#ff2121" />
                  </Pressable>

                  <Pressable style={styles.btnconinfo} onPress={() => navigation.navigate('Config')}>
                    <Icon name="settings" size={35} color="#fff" />
                  </Pressable>
                </View>

                {tpUser == "prestador"?(
                  <Pressable onPress={() => navigation.navigate('Social', {type: tpUser})} style={{width: '90%', backgroundColor: '#fff', marginLeft: 'auto', marginRight: 'auto', borderRadius: 10, padding: 10, marginTop: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}><Text style={{fontSize: 18, fontWeight: 'bold'}}>Buscar Serviços </Text><Icon name="handyman" size={35} color="#333" /></Pressable>
                ):(
                    <View style={styles.container_search_client}>
                        <Pressable style={styles.iconBusca} onPress={() => realizaConsulta()}><Image source={require('./search.png')} style={styles.iconsearch}/></Pressable>

                        <View style={{width: '80%'}}>
                          <Picker
                                  selectedValue={selectcateg}
                                  style={styles.picker}
                                  onValueChange={(itemValue) => changeCategService(itemValue)}
                                >
                                  <Picker.Item label="Categoria" value="none" />
                                  {categlist}
                          </Picker>

                          <Picker
                                  selectedValue={selectservic}
                                  style={styles.picker}
                                  onValueChange={(itemValue) => setselectservic(itemValue)}
                                >
                                  <Picker.Item label="Selecione O Serviço" value="none" />
                                  {listservices}
                          </Picker>
                        </View>
                    </View>
                )}

            </ImageBackground>
        </View>

        <View style={styles.containergeralpainel}>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>Agenda</Text>

                <View style={styles.container_agenda}>
                    <Pressable style={styles.conagenda} onPress={() => openModal('agendados')}>
                        <Text style={styles.titleboxagenda}>Agendados</Text>
                        <Text style={styles.numberboxagenda}> {agenConfirm.length} </Text>
                    </Pressable>

                    <Pressable style={styles.conagenda} onPress={() => openModal('pendentes')}>
                        <Text style={styles.titleboxagenda}>Pendentes</Text>
                        <Text style={styles.numberboxagenda}>{agenPendente.length}</Text>
                    </Pressable>

                    <Pressable style={styles.conagenda} onPress={() => openModal('cancelados')}>
                        <Text style={styles.titleboxagenda}>Cancelados</Text>
                        <Text style={styles.numberboxagenda}>{agenCancel.length}</Text>
                    </Pressable>
                </View>
                <View style={styles.containeravalia}>
                    <Text style={{fontSize: 25, fontWeight: 'bold'}}>Suas Avaliações (0)</Text>

                    <View style={{width: '100%', padding: 5, backgroundColor: '#fff', marginTop: 25, marginBottom: 25}}>
                        <Text style={{fontSize: 20, fontWeight: 'bold'}}>Nenhuma Avaliação até o momento!</Text>
                    </View>
                </View>

                {paymentStatus == 0?(
                  <View style={styles.alertpay}>

                      <View>
                          <Text style={{fontSize: 18, fontWeight: 'bold',textTransform: 'capitalize'}}>Ative sua assinatura agora mesmo e alcance mais clientes.</Text>
                          <Text style={{fontSize: 16, color: '#f1f1f1', marginTop: 10, fontWeight: 'bold', textTransform: 'capitalize'}}>Potencialize sua visibilidade!</Text>

                          <Pressable onPress={()  => navigation.navigate('Pagamento', {user: userId})}>
                              <Text style={{marginTop: 10, fontSize: 16, textDecorationLine: 'underline', fontWeight: 'bold', color: '#333'}}>Preferencias De Pagamento</Text>
                          </Pressable>
                      </View>
                      
                  </View>
                ):(
                  <Text></Text>
                )}

            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalAgenVis}
                onRequestClose={() => {
                setModalAgenVis(!modalAgenVis);
                }}>
                <View style={styles.centeredViewM}>
                <View style={styles.modalViewM}>

                  <Pressable style={styles.btnpanclose} onPress={() => setModalAgenVis(false)}><Text style={{color: '#f1f1f1', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center'}}>Fechar</Text></Pressable>

                  <Text style={{fontSize: 18, fontWeight: 'bold', textAlign: 'left'}}>{modalAgenTitle}</Text>
                  <FlatList
                    data={agenFlatList}
                    renderItem={renderAgen}
                    keyExtractor={item => item.id}
                    style={{width: '100%'}}
                  />
                </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalPostVis}
                onRequestClose={() => {
                setModalpostvis(!modalPostVis);
                }}>
                <View style={styles.centeredViewM}>
                <View style={styles.modalViewM}>

                  <Pressable onPress={() => navigation.navigate("GerenciarPost", {client: userId})} style={{width: '90%', marginLeft: 'auto', marginRight: 'auto', padding: 10, backgroundColor: '#f1f1f1', marginBottom: 15}}>
                    <Text style={{fontSize: 18, fontWeight: 'bold', textAlign: 'center'}}>Gerenciar Postagens</Text>
                  </Pressable>

                  <Text style={{fontSize: 18, fontWeight: 'bold'}}>Adicionar Postagem</Text>
                  <Text style={{fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 15}}>Selecione a categoria:</Text>

                  <Picker
                    selectedValue={selectCategPost}
                    style={styles.picker}
                    onValueChange={(itemValue, itemIndex) => setSelectCategPost(itemValue)}
                  >
                    {servicesSelect}
                  </Picker>
                  <Text style={{fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 15}}>Mande Uma Imagem:</Text>
                  <Pressable style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}><Icon name="cloud" size={40} color="#333" style={{marginRight: 10}} /><Text style={{fontSize: 18, fontWeight: 'bold', color: '#333'}}>Upload Imagem</Text></Pressable>
                  <Pressable onPress={() => pickImage()}><Image source={{uri: imagepost}} style={styles.imgpost}/></Pressable>
                  <Text style={{fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 15}}>Descreva o serviço desejado:</Text>
                  <TextInput
                      style={styles.inputPost}
                      placeholder="Digite uma descrição do serviço desejado...."
                      keyboardType="default"
                      onChangeText={setInputPostt}
                      ref={inputPostRef}
                  />

                  <Pressable onPress={() => savePost()} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', padding: 10, borderRadius: 10, backgroundColor: '#2e385e', marginTop: 15}}><Text style={{fontSize: 18, color: '#fff', fontWeight: 'bold', textAlign: 'center'}}>Publicar</Text></Pressable>
                  <Pressable onPress={() => setModalpostvis('false')} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', padding: 10, borderRadius: 10, backgroundColor: 'transparent'}}><Text style={{fontSize: 18, color: 'red', fontWeight: 'bold', textAlign: 'center'}}>Fechar</Text></Pressable>
                </View>
                </View>
              </Modal>

            <View style={[styles.boxfixed, {display: displayAgenNow}]}>
                <Text style={{fontSize: 18, fontWeight: 'bold', color: '#fff'}}>Serviço Em Andamento...</Text>
                <Pressable  onPress={()  => openMap()}><Text style={{fontSize: 16, color: '#f2f2f2'}}>Mais Informações</Text></Pressable>
            </View>


            {tpUser === "prestador" ?(
              <Pressable style={styles.btnGaleryFlu} onPress={() => navigation.navigate("Galeria")}>
                <Icon name="image" size={40} color="#fff" />
              </Pressable>
            ):(
              <Pressable style={styles.btnAddPost} onPress={() => openModalPost()}>
                <Icon name="add" size={40} color="#fff" />
              </Pressable>
            )}

            

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  btnGaleryFlu:{
    width: 65,
    height: 65,
    backgroundColor: '#eb4335',
    borderRadius: 50,
    position: 'absolute',
    bottom: 60,
    right: 10,
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    // Sombra para Android
    elevation: 8,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnAddPost:{
    width: 65,
    height: 65,
    backgroundColor: '#2e385e',
    borderRadius: 50,
    position: 'absolute',
    bottom: 60,
    right: 10,
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    // Sombra para Android
    elevation: 8,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  boxfixed:{
    width: '100%',
    height: 70,
    backgroundColor: '#2e385e',
    position: 'absolute',
    bottom: 0,
    left:  0,
    paddingLeft: 15,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    // Sombra para Android
    elevation: 8,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  header_container:{
    height: 260,
},
inputsearch:{
    width: '100%',
    height: 50,
    borderRadius: 10,
    padding: 5,
    backgroundColor: '#54C3FA',
    color: '#f2f2f2',
    fontSize: 18,
    fontWeight: 'bold'
},
container_search_client:{
    width: '100%',
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: '6%',
},
iconsearch:{
    width: 35,
    height: 35
},
iconBusca:{
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginLeft: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
},
containergeralpainel:{
  width: '90%',
  marginLeft: 'auto',
  marginRight: 'auto',
  marginTop: 10
},
container_agenda:{
  width: '95%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 20
},
conagenda: {
  width: '31%',
  padding: 5,
  backgroundColor: '#fff',
  height: 90,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'center'
},
titleboxagenda:{
  fontSize: 16,
  color: 'black',
  fontWeight: 'bold'
},
numberboxagenda:{
  fontSize: 30,
  fontWeight: 'bold'
},
containeravalia: {
  marginTop: 20
},
alertpay: {
  padding: 10,
  backgroundColor: '#E8B211',
  borderRadius: 15
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
coninfo:{
  width: '90%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: 15,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  marginLeft: 'auto',
  marginRight: 'auto',
  borderRadius: 15,
  marginTop: 15
},
btnconinfo: {
  marginRight: 10
},
btnpanclose: {
  width: '35%',
  height: 25,
  backgroundColor: 'rgba(207, 28, 28, 0.7)',
  borderRadius: 5,
  marginLeft: 'auto',
  marginRight: 'auto',
  marginBottom: 15,
},
inputPost: {
  height: 50,
  backgroundColor: '#f1f1f1'
},
imgpost: {
  width: '80%',
  height: undefined,
  aspectRatio: 1,
  marginLeft: 'auto',
  marginRight: 'auto'
},
picker: {
  height: 25,
  width: '100%',
  backgroundColor: '#fff',
  borderRadius: 10,
  marginTop: 10
},
selectedValue: {
  marginTop: 20,
  fontSize: 16,
}
});
