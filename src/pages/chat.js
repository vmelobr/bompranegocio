import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Pressable, TextInput, Image, SafeAreaView, ImageBackground, Modal, Alert, FlatList, ScrollView} from 'react-native';
import {db} from '../../firebase';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, startAt, endAt, orderBy, serverTimestamp, addDoc } from "firebase/firestore";
import { format, addHours } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

export default function Chat({navigation,route}) {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);
    const [userId, setUserID] = useState(null);
    const [tpUser, setTpUser] = useState(null);
    const [userInfo, setUserInfo] = useState([]);
    const [userName, setUserName] = useState(null);
    const {height} = Dimensions.get('window');
    const auth = getAuth();

    const [msg, setmsg] = useState('');
    const [avatar, setAvatar] = useState('');
    const [listSearch, setListSearch] = useState([]);
    const [numSearch, setNumSearch] =  useState(0);
    const [clintInfo, setClientInfo] = useState([]);
    const [prestadorInfo, setPrestadorInfo] = useState([{
      name: null,
      id: null
    }]);
    const [chatId, setChatId] = useState(null);
    const [chatDom, setChatDom] = useState(null);

    const [chatName, setChatName] = useState(null);
    const [agenarr, setAgenArr] = useState([]);
    const [chatArr, setChatArr] = useState([]);

    const [vistopor, setvistopor] = useState(null);


    const formatvistodata = (timestamp) => {
      const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    
      // Extrair dia, mês, horas e minutos
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mês começa em 0
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
    
      return `${day}/${month} às ${hours}:${minutes}`; // Formato desejado
    };


    useEffect(() => {
      const subscriber = auth.onAuthStateChanged((userr) => {
        setUser(userr);
        if (initializing) setInitializing(false);
      });
   
    }, [initializing, user]);

    useEffect(() => {

      if(user != null){

          const q = query(collection(db, "user"), where("email", "==", user.email));
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userInf = [];
            const userIdd = [];
            const userType = [];

            querySnapshot.forEach((doc) => {
              userInf.push(doc.data());
              setUserName(doc.data().name);
              setTpUser(doc.data().type);
              setUserID(doc.data().id);
              userIdd.push(doc.data().id);
              userType.push(doc.data().type);
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

    if(route.params.type == 'detail'){
      // pega os dados do agendamento

      const qagen = query(collection(db, "agendamentos"), where("id", "==", route.params.agendamento));
      const unsubscribe = onSnapshot(qagen, (querySnapshot) => {
      const ageninfo = [];
        querySnapshot.forEach((doc) => {
          ageninfo.push(doc.data());
        });

        setAgenArr(ageninfo);

        if(tpUser == "prestador"){
          // puxa dados do cliente
          const q = query(collection(db, "user"), where("id", "==", ageninfo[0].cliente));
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const clientInf = [];
            querySnapshot.forEach((doc) => {
              clientInf.push(doc.data());
              setAvatar(doc.data().avatar);
              setChatName(doc.data().name);
              setvistopor(formatvistodata(doc.data().visto));
            });
            setClientInfo(clientInf);
          });
          
          console.log("por aqui");
    
        }else{
          // puxa dados do prestador
    
          const q = query(collection(db, "user"), where("id", "==", ageninfo[0].prestador));
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const prestadorInf = [];
            querySnapshot.forEach((doc) => {
              prestadorInf.push(doc.data());
              setAvatar(doc.data().avatar);
              setChatName(doc.data().name);
              setvistopor(formatvistodata(doc.data().visto));
            });
            setPrestadorInfo(prestadorInf);
          });

          console.log("por aqui2");
    
        }

        // pegando mensagens

      var chatIDTK = ageninfo[0].cliente+"/"+ageninfo[0].prestador;
      chatIDTK = btoa(chatIDTK);

      const qchat = query(collection(db, "mensagens"), where("chatID", "==", chatIDTK), orderBy('data', 'asc'));
        const unsubscribe = onSnapshot(qchat, (querySnapshot) => {
        const chatInf = [];
          querySnapshot.forEach((doc) => {
            chatInf.push(doc.data());
          });

          setChatArr(chatInf);
        });

      });
    }else if(route.params.type == 'post'){

      // pegando post

        const qpost = query(collection(db, "posts"), where("id", "==", route.params.post));
          const unsubscribe = onSnapshot(qpost, (querySnapshot) => {
          const postinf = [];
            querySnapshot.forEach((doc) => {
              postinf.push(doc.data());
            });

            if(tpUser == "prestador"){
              // puxa dados do cliente
              const q = query(collection(db, "user"), where("id", "==", ageninfo[0].cliente));
              const unsubscribe = onSnapshot(q, (querySnapshot) => {
              const clientInf = [];
                querySnapshot.forEach((doc) => {
                  clientInf.push(doc.data());
                  setAvatar(doc.data().avatar);
                  setChatName(doc.data().name);
                  setvistopor(formatvistodata(doc.data().visto));
                });
                setClientInfo(clientInf);

                sendMsgPost(postinf[0].img, "Olá tenho interesse no serviço desejado...");
              });
        
        
            }
   
          });
    }else if(route.params.type == "notify"){

      if(tpUser == "prestador"){
        // puxa dados do cliente
        const q = query(collection(db, "user"), where("id", "==", route.params.cliente));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const clientInf = [];
          querySnapshot.forEach((doc) => {
            clientInf.push(doc.data());
            setAvatar(doc.data().avatar);
            setChatName(doc.data().name);
            setvistopor(formatvistodata(doc.data().visto));
          });
          setClientInfo(clientInf);
        });
  
  
      }else{
        // puxa dados do prestador
  
        const q = query(collection(db, "user"), where("id", "==", route.params.prestador));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const prestadorInf = [];
          querySnapshot.forEach((doc) => {
            prestadorInf.push(doc.data());
            setAvatar(doc.data().avatar);
            setChatName(doc.data().name);
            setvistopor(formatvistodata(doc.data().visto));
          });
          setPrestadorInfo(prestadorInf);
        });
  
      }

      // pegando mensagens

      var chatIDTK = route.params.cliente+"/"+route.params.prestador;
      chatIDTK = btoa(chatIDTK);

      const qchat = query(collection(db, "mensagens"), where("chatID", "==", chatIDTK), orderBy('data', 'asc'));
        const unsubscribe = onSnapshot(qchat, (querySnapshot) => {
        const chatInf = [];
          querySnapshot.forEach((doc) => {
            chatInf.push(doc.data());
          });

          setChatArr(chatInf);
        });
    }
        
    }, []);


    const sendMsgPost = async(img, mensage, cliente, prestador) => {
      var de = "";
        var para = "";

        var token = cliente+"/"+prestador;
        token = btoa(token);

        if(tpUser == "cliente"){
            de = cliente;
            para = prestador;
        }else{
            de = prestador;
            para = cliente;
        }   

        const docRef = await addDoc(collection(db, "mensagens"), {
            chatID: token,
            de: de,
            para: para,
            mensagem: mensage,
            data: serverTimestamp(),
            img: img,
            type: 'post'
        });

        const docRefN = await addDoc(collection(db, "notificacao"), {
            de: de,
            para: para,
            data: serverTimestamp(),
            status: 0,
            title: "Nova Mensagem Recebida",
            text: msg.substr(0, 10)
        });


        setmsg('');
    }

    const sendMsgNoty = async(img, mensage, cliente, prestador) => {
      var de = "";
        var para = "";

        var token = cliente+"/"+prestador;
        token = btoa(token);

        if(tpUser == "cliente"){
            de = cliente;
            para = prestador;
        }else{
            de = prestador;
            para = cliente;
        }   

        const docRef = await addDoc(collection(db, "mensagens"), {
            chatID: token,
            de: de,
            para: para,
            mensagem: mensage,
            data: serverTimestamp(),
            img: img,
            type: 'chat'
        });

        const docRefN = await addDoc(collection(db, "notificacao"), {
            de: de,
            para: para,
            data: serverTimestamp(),
            status: 0,
            title: "Nova Mensagem Recebida",
            text: msg.substr(0, 10)
        });


        setmsg('');
    }

    const sendMsg = async(img, mensage) => {

      const msg = mensage;

      setmsg('');

      var de = "";
        var para = "";

        var token = agenarr[0].cliente+"/"+agenarr[0].prestador;
        token = btoa(token);

        if(tpUser == "cliente"){
            de = agenarr[0].cliente;
            para = agenarr[0].prestador;
        }else{
            de = agenarr[0].prestador;
            para = agenarr[0].cliente;
        }   

        const docRef = await addDoc(collection(db, "mensagens"), {
            chatID: token,
            de: de,
            para: para,
            mensagem: msg,
            data: serverTimestamp(),
            img: img,
            type: 'chat'
        });

        const docRefN = await addDoc(collection(db, "notificacao"), {
            de: de,
            para: para,
            data: serverTimestamp(),
            status: 0,
            title: "Nova Mensagem Recebida",
            text: msg.substr(0, 10)
        });

    }

    const formatFirestoreTimestamp = (timestamp) => {
      const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
      return date.toLocaleString(); // Aqui você pode formatar a data como preferir
    };


    const renderItem = ({item}) => {

      let config = null;
      let textcolor = null;

      if(item.de == userId){
        config = {
          bgcolor: '#fff',
          textcolor: '#000',
          flex: 'flex-end'
        }
        textcolor = "#333";
      }else{
        config = {
          bgcolor: '#2e385e',
          textcolor: '#fff',
          flex: 'flex-start'
        }
        textcolor = '#ccc';
      }

      const datamsg = item.data;

      const formathora = formatFirestoreTimestamp(datamsg);

      return (
        <View style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: config.flex, alignItems:'center', marginTop: 10}}>
          <View style={{backgroundColor: config.bgcolor, borderRadius: 10, padding: 10}}>
            <Text style={{color: config.textcolor, fontSize: 18}}>{item.mensagem}</Text>
            <Text style={{fontSize: 14, marginTop: 10, color: textcolor, fontWeight: 'bold'}}>{formathora}</Text>
          </View>
        </View>
      )
    }


  return (
    <SafeAreaView style={{height: '100%'}}>

        <View style={styles.headerChat}>
            <Image 
                source={{ uri: avatar }} 
                style={styles.image} 
            />

            <View style={styles.conheaderChat}>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>{chatName}</Text>
              <Text>Visto Em {vistopor}</Text>
            </View>

        </View>

        <ScrollView style={styles.chatinbox}>
            <FlatList
                data={chatArr}
                renderItem={renderItem}
                keyExtractor={item => item.id}
              />
        </ScrollView>
        
        <View style={styles.chatinput}>
            <TextInput
                style={styles.input}
                onChangeText={setmsg}
                value={msg}
                placeholder="Insira sua mensagem..."
            />

            {route.params.type == "notify" ? (
              <Pressable style={styles.btnchat} onPress={() => sendMsgNoty('', msg, route.params.cliente, route.params.prestador)}><Icon name="send" size={30} color="#000" /></Pressable>
            ):(
              <Pressable style={styles.btnchat} onPress={() => sendMsg('', msg)}><Icon name="send" size={30} color="#000" /></Pressable>
            )}

        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  image:{
    width: 55,
    height: undefined,
    aspectRatio: 1
  },
  chatinput:{
    width: '100%',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    bottom: 0
  },
  input: {
    height: 50,
    width: '90%',
    fontSize: 18,
    fontWeight: 'bold'
  },
  headerChat:{
    width: '100%',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10
  },
  conheaderChat:{
    width: '80%'
  },
  msgright:{
    width: '100%',
    display: 'flex',
    flexDirection: 'row-reverse',
    marginTop: 10
},
msgleft:{
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    marginTop: 10
},
chatinbox: {
  width: '90%',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingBottom: 15,
  marginTop: 10,
  maxHeight: 550,
  backgroundColor: 'red'
}
});
