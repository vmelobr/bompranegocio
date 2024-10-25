import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Pressable, TextInput, Image, SafeAreaView, ImageBackground, Modal, Alert, FlatList, ScrollView} from 'react-native';
import {db} from '../../firebase';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, startAt, endAt, orderBy, addDoc, serverTimestamp, Timestamp} from "firebase/firestore";
import { format, addHours } from 'date-fns';
import { Calendar } from 'react-native-calendars';
import { RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

const formatDate = (dateString) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `Dia ${day} de ${month}`;
};

export default function Perfil({navigation,route}) {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState(null);
    const [userId, setUserID] = useState(null);
    const [tpUser, setTpUser] = useState(null);
    const [userInfo, setUserInfo] = useState([]);
    const [userName, setUserName] = useState(null);
    const {height} = Dimensions.get('window');
    const auth = getAuth();

    const [prestadorInfo, setPrestadorInfo] = useState([]);
    const [modalGaleryVis, setModalGalery] = useState(false);
    const [modalAgendamento, setmodalAgendamento] = useState(false);
    const [imgselected, setImgSelected] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [displayHorarios, setDisplayHorarios] = useState(false);
    const [dataescrita, setDataEscrita] = useState();
    const [stateTextBtn, setStateBtnText] = useState("Confirmar Data");
    const [modalAgenDom, setModalAgenDom] = useState([]);
    const [modalAgenTitle, setModalAgenTitle] = useState("Selecione a Data Desejada:");
    const [calendarDisplay, setCalendarDisplay] = useState('block');
    const [stateModalAgen, setStateModalAgen] = useState(1);
    const [horarioselected, setHorarioSelected] = useState(null);
    const [infoExtraAgendamento, setInfoExtraAgendamento] = useState(null);
    const [selectedLocal, setSelectedLocal] = useState(null);
    const [msgcliente, setmsgcliente] = useState('');
    const [dataagenda, setDataAgen] = useState('');
    const [horaagenda, setHoraAgenda] = useState('');
    

    const [checked, setChecked] = useState('local1');

    // Obter a data atual
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const [cep, setCep] = useState('');
    const [address, setAddress] = useState(null);
    const [location, setLocation] = useState(null);
    const [imagemCapa, setImagemCapa] = useState(null);

    const getAddressFromCep = async (cep) => {
      try {
          const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const data = await response.json();

          console.log("ViaCEP Response:", data); // Verifique a resposta aqui

          if (data.erro) {
              Alert.alert('Erro', 'CEP não encontrado');
              return;
          }

          const fullAddress = `${data.logradouro, data.localidade}`;
          setAddress(fullAddress);
          getLocationFromAddress(fullAddress);

      } catch (error) {
          console.error("Erro ao buscar endereço no ViaCEP:", error);
          Alert.alert('Erro', 'Não foi possível obter o endereço');
      }
  };

  const getLocationFromAddress = async (address) => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

      try {
          const response = await fetch(url);
          const data = await response.json();

          console.log("Nominatim Response:", data); // Verifique a resposta aqui

          if (data.length > 0) {
              const { lat, lon } = data[0];
              setLocation({ latitude: lat, longitude: lon });
          } else {
              Alert.alert('Erro', 'Localização não encontrada');
          }
      } catch (error) {
          console.error("Erro ao buscar localização no Nominatim:", error);
          Alert.alert('Erro', 'Não foi possível obter a localização');
      }
  };


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

            const local = {
              cep: userInf[0].cep,
              cidade: userInf[0].cidade,
              bairro: userInf[0].bairro,
              estado: userInf[0].estado,
              rua: userInf[0].rua,
              numero: userInf[0].num
            };

            setSelectedLocal(local);
            
          });
      }
    }, [user, tpUser, userId]);


    useEffect(() => {

      console.log("=====xxxx=>", selectedLocal);
      
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
      
      const id = route.params.idUss;
      
      const qprest = query(collection(db, "user"), where("id", "==", id));
      const unsubscribe = onSnapshot(qprest, (querySnapshot) => {
        const prestadorInfo = [];
        querySnapshot.forEach((doc) => {
            prestadorInfo.push(doc.data());
            setImagemCapa(doc.data().capa);
        });

        setPrestadorInfo(prestadorInfo);
      });

        
   
    }, [prestadorInfo]);

    const renderItem = ({ item }) => {
        const dom = [];

        if(item.fotos){
          item.fotos.map((item2) => {
            dom.push(<Pressable onPress={() => openZoom(item2)} style={{width: 60}}>
              <Image 
                  source={{ uri: item2 }} 
                  style={styles.imgzoom} 
              />
          </Pressable>);
          });
        }

        return(
        <View>
            <View style={styles.headerPerfil}>
                {imagemCapa ?(
                  <ImageBackground source={{uri: imagemCapa}} style={styles.header_container}>
                      <Pressable onPress={() => openZoom(item.avatar)} style={{width: '22%', height: 200, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                          <Image 
                              source={{ uri: item.avatar }} 
                              style={styles.image} 
                          />
                      </Pressable>
                      <View style={{width: '80%', height: 200, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                          <Text style={{fontSize: 18, color: '#fff'}}>{item.name}</Text>
                          <Text style={{fontSize: 16, color: '#fff'}}>Estado: {item.uf}</Text>
                          <Text style={{fontSize: 16, color: '#fff'}}>{item.cidade}</Text>
                      </View>
                  </ImageBackground>
                ):(
                  <ImageBackground source={require('./bgg.png')} style={styles.header_container}>
                    <Pressable onPress={() => openZoom(item.avatar)} style={{width: '22%', height: 200, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                        <Image 
                            source={{ uri: item.avatar }} 
                            style={styles.image} 
                        />
                    </Pressable>
                    <View style={{width: '80%', height: 200, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: 18, color: '#fff'}}>{item.name}</Text>
                        <Text style={{fontSize: 16, color: '#fff'}}>Estado: {item.uf}</Text>
                        <Text style={{fontSize: 16, color: '#fff'}}>{item.cidade}</Text>
                    </View>
                  </ImageBackground>
                )}

      
            </View>

            <View style={styles.apresenta}>
                <Text style={{fontSize: 18}}>Galeria:</Text>
                <View style={styles.containerGalery}>
                  {dom}
                </View>
            </View>

            <View style={styles.apresenta}>
                <Text style={{fontSize: 18}}>Apresentação:</Text>
                <Text style={{marginTop: 10}}>{item.bio}</Text>
            </View>
        </View>
      )};

      const openZoom = (img) => {
        if(img){
            setImgSelected(img);
            setModalGalery(true);
        }
      }

      function generateHourlySchedule(startHour, endHour) {
        let schedule = [];
        for (let hour = startHour; hour <= endHour; hour++) {
          let formattedHour = `${hour}:00`;
          schedule.push(formattedHour);
        }
        return schedule;
      }

      const selecionarHorario = (hora) => {
        setHorarioSelected(hora);
        setHoraAgenda('As '+hora);
      }

      const selecionarLocal = (local) => {
        setChecked(local);

        console.log(local)

        if(local == "local2"){
          setSelectedLocal({
            cep: null,
            cidade: null,
            bairro: null,
            estado: null
          });
          console.log('aqui');
        }
      }


      const onChangeValue = (key, val) =>{

      }

      function generateUniqueId() {
        const timestamp = Date.now().toString(36); // Convert timestamp to base-36 string
        const randomStr = Math.random().toString(36).substr(2, 5); // Generate random string
        return `${timestamp}${randomStr}`; // Concatenate timestamp and random string
    }

      const avancAgendamento = async (step) =>{
        if(step == 1){
          // checando data selecionada

          if(selectedDate == ""){
            Alert.alert('Selecione A Data Desejada');
          }else{

            // buscando horarios disponiveis para o dia

            const startHour = 8;
            const endHour = 18;
            const hourlySchedule = generateHourlySchedule(startHour, endHour);

            const arr = [];

            hourlySchedule.map(function(number) {
              arr.push(
                 <Pressable key={number} onPress={() => selecionarHorario(number)} style={[styles.marketHorario, {backgroundColor: horarioselected === number ? '#249938' : '#2e385e'}]}><Text style={{fontSize: 18, color: '#fff'}}>{number}</Text></Pressable>
              );
            });

            setModalAgenDom(arr);


            setModalAgenTitle("Selecione o horario Desejado:");
            setStateModalAgen(2);
            setCalendarDisplay("none");
            setStateBtnText("Confirmar Horário");
          }
        }else if(step == 2){
          // verificando se selecionou o horario

          if(horarioselected == null){
            Alert.alert('Selecione A Hora Desejada');
          }else{

            // criando array

            

            console.log('=========>', selectedLocal);

            const arr = [];

            arr.push(
              <View>
                <View style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                  <View style={{width: '50%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    <RadioButton
                      value="first"
                      status={ checked === 'local1' ? 'checked' : 'unchecked' }
                      onPress={() => selecionarLocal('local1')}
                    />
                    <Text style={{fontSize: 16}}>Local Registrado</Text>
                  </View>

                  <View style={{width: '50%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    <RadioButton
                      value="second"
                      status={ checked === 'local2' ? 'checked' : 'unchecked' }
                      onPress={() => selecionarLocal('local2')}
                    />
                    <Text style={{fontSize: 16}}>Outro Local</Text>
                  </View>

                </View>

                <ScrollView style={{height: 220}}>

                  <Text style={{fontSize: 18}}>Local:</Text>

                  <View style={styles.conEnd}>
                    <Text style={{fontSize: 16, fontWeight: 'bold'}}>Cep:</Text>
                    <TextInput
                      style={styles.input}
                      onChangeText={onChangeValue}
                      value={selectedLocal.cep}
                    />
                  </View>

                  <View style={styles.conEnd}>
                    <Text style={{fontSize: 16, fontWeight: 'bold'}}>Cidade:</Text>
                    <TextInput
                      style={styles.input}
                      onChangeText={onChangeValue}
                      value={selectedLocal.cidade}
                    />
                  </View>

                  <View style={styles.conEnd}>
                    <Text style={{fontSize: 16, fontWeight: 'bold'}}>Bairro:</Text>
                    <TextInput
                      style={styles.input}
                      onChangeText={onChangeValue}
                      value={selectedLocal.bairro}
                    />
                  </View>

                  <View style={styles.conEnd}>
                    <Text style={{fontSize: 16, fontWeight: 'bold'}}>Rua:</Text>
                    <TextInput
                      style={styles.input}
                      onChangeText={onChangeValue}
                      value={selectedLocal.rua}
                    />
                  </View>

                  <View style={styles.conEnd}>
                    <Text style={{fontSize: 16, fontWeight: 'bold'}}>Numero:</Text>
                    <TextInput
                      style={styles.input}
                      onChangeText={onChangeValue}
                      value={selectedLocal.numero}
                    />
                  </View>

                  <View style={styles.conEnd}>
                    <Text style={{fontSize: 16, fontWeight: 'bold'}}>Estado:</Text>
                    <TextInput
                      style={styles.input}
                      onChangeText={onChangeValue}
                      value={selectedLocal.estado}
                    />
                  </View>
                  
                </ScrollView>
              </View>
            );

            setModalAgenDom(arr);
            setModalAgenTitle("Selecione o Local Desejado:");
            setStateModalAgen(3);
            //setCalendarDisplay("none");
            setStateBtnText("Confirmar Agendamento");

          }

        }else{
          // confirmando agendamento

            // pegando cordenada do local do serviço

            getAddressFromCep(selectedLocal.cep);

            console.log("xxxxx", location);

          const arrhorario = horarioselected.split(':');

          const hora = arrhorario[0];
          const min = arrhorario[1];
          

          

          // tratando mes

          let mesmarcado = selectedDate.mes.toString().padStart(2, '0');


          try{

            const idagen = generateUniqueId();

            const docRef = await addDoc(collection(db, "agendamentos"), {
              cliente: userInfo[0].id,
              clienteName: userInfo[0].name,
              data: Timestamp.fromDate(new Date(selectedDate.ano, mesmarcado, selectedDate.dia, hora, min, 0)),
              id: idagen,
              local: selectedLocal,
              msgclient: msgcliente,
              prestador: prestadorInfo[0].id,
              prestadorName: prestadorInfo[0].name,
              status: 0
  
            });

            // notificando

            const docnot = await addDoc(collection(db, "notificacao"), {
              de: userInfo[0].id,
              idAgen: idagen,
              data: serverTimestamp(),
              docid: generateUniqueId(),
              para: prestadorInfo[0].id,
              status: 0,
              text: "Você possui nova oportunidade de trabalho, veja os detalhes...",
              title: "Novo Agendamento!",
              type: "agendamento"
  
            });

            Alert.alert('Agendamento Realizado com sucesso!');
            setmodalAgendamento(false);
            navigation.navigate("Painel");
          }catch{
            Alert.alert('Erro ao agendar o serviço');
            setmodalAgendamento(false);
          }


          
        }
      }

      const handleDayPress = (day) => {
        const dia = day.day;
        const mes = day.month;

        const months = [
          'ola','Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        return 'Dia '+dia+' De '+months[mes]
      };

  return (
    <SafeAreaView style={{height: '100%'}}>
            {prestadorInfo.length > 0 ?(
              <FlatList
                data={prestadorInfo}
                renderItem={renderItem}
                keyExtractor={item => item.id}
              />
            ):(
              <View>
                <Text>Carregando....</Text>
              </View>
            )}
            

            <Pressable style={styles.btnrealiza} onPress={() => setmodalAgendamento(true)}>
                <Text style={{fontSize: 18, color: '#333', fontWeight: 'bold'}}>Solicitar Agendamento</Text>
            </Pressable>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalGaleryVis}
                onRequestClose={() => {
                setModalGalery(!modalGaleryVis);
                }}>
                <View style={styles.centeredViewM}>
                <View style={styles.modalViewM}>
                    <Image 
                        source={{ uri: imgselected }} 
                        style={styles.imgzoom} 
                    />
                    <Pressable onPress={() => setModalGalery(false)} style={{marginTop: 15}}><Text style={{fontSize: 18, color: 'red'}}>X Fechar</Text></Pressable>
                </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalAgendamento}
                onRequestClose={() => {
                setmodalAgendamento(!modalAgendamento);
                }}>
                <View style={styles.centeredViewCreateAgendamento}>
                    <View style={styles.modalViewCreateAgendamento }>
                        <Text style={{fontSize: 16}}>{modalAgenTitle}</Text>
                        <Calendar
                            // Define a data mínima como a data atual
                            minDate={todayString}
                            // Callback que é chamado quando um dia é pressionado
                            onDayPress={(day) => {
                            setSelectedDate({dia: day.day, mes: day.month, ano: day.year});
                            setDataEscrita(formatDate(day.dateString));
                            setDataAgen(handleDayPress(day));
                            console.log("===========", day);
                            }}
                            // Marcação das datas
                            markedDates={{
                            [selectedDate]: { selected: true, marked: true, selectedColor: 'blue' }
                            }}

                            style={{width: '100%', display: calendarDisplay}}
                        />

                        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems:'center', flexWrap: 'wrap', marginTop: 15}}>
                          {modalAgenDom}
                        </View>

                        <Text style={{fontSize: 18, marginTop: 15, marginBottom: 15}}>{dataagenda} - {horaagenda}</Text>

                        <Pressable onPress={() => avancAgendamento(stateModalAgen)} style={styles.btnavanagen}><Text style={{fontSize: 18, fontWeight: 'bold', color: '#fff'}}>{stateTextBtn}</Text></Pressable>

                    </View>
                </View>
            </Modal>

            <Pressable style={styles.btnchat} onPress={() => navigation.navigate('Chat', {prestador: prestadorInfo[0].id})}>
                    <Image 
                        source={require('./chat.png')} 
                        style={styles.imgchat} 
                    />
            </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    headerPerfil:{
        width: '100%'
    },
    header_container: {
        height: 250,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    image:{
        width: '100%',
        height: undefined,
        aspectRatio: 1
    },
    apresenta:{
        width: '90%',
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: '#f2f2f2',
        padding: 10,
        marginTop: 10
    },
    containerGalery:{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    itemImg:{
        width: 60,
        height: 60,
        marginRight: 5
    },
    imgzoom: {
        width: '100%',
        height: undefined,
        aspectRatio: 1
    },
    centeredViewM: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
      },
      modalViewM: {
        margin: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 20,
        alignItems: 'center',
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
        maxHeight: '95%',
        minHeight: '60%'
      },
      imgchat: {
        width: 45,
        height: undefined,
        aspectRatio: 1
      },
      btnchat: {
        width: 70,
        height: 70,
        backgroundColor: '#d6d6d6',
        borderRadius: 50,
        position: 'absolute',
        right: 15,
        bottom: 60,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      },
      btnrealiza: {
        width: '98%',
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: '#ffff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 15,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        // iOS Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        // Android Shadow
        elevation: 5,
      },
      centeredViewCreateAgendamento: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
      },
      modalViewCreateAgendamento: {
        margin: 0,
        backgroundColor: 'white',
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
        width: '99%',
        position: 'absolute',
        bottom: 0,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        maxHeight: '90%',
        minHeight: '60%'
      },
      btnavanagen:{
        width: '99%',
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: '#249938',
        padding: 10,
        borderRadius: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      },
      marketHorario: {
        padding: 10,
        borderRadius: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 10,
      },
      conEnd:{
        width: '95%',
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: '#f6f6f6',
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
        marginBottom: 10
      }
});
