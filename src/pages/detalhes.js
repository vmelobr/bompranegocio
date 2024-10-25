import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, ImageBackground, TextInput, ScrollView, Dimensions,TouchableOpacity, Image, Alert, Modal, Pressable, FlatList } from 'react-native';
import { useNavigation, useRoute, Link } from '@react-navigation/native';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, Timestamp, updateDoc, doc} from "firebase/firestore";
import { requestBackgroundPermissionsAsync, getCurrentPositionAsync, LocationObject, requestForegroundPermissionsAsync } from 'expo-location';
import { differenceInHours, format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';


const DetalService = ({navigation, route}) => {

    const position = [51.505, -0.09];

    const [clientName, setClienteName] = useState(null);
    const [clientMail, setClienteMail] = useState(null);

    const [clientInfo, setClientInfo] = useState([]);
    const [dataAg, setData] = useState(null);

    const [actionDom, setActionDom] = useState(null);
    const [textAgen, setTextAgen] = useState(null);
    const [agendamentoInfo, setAgendamentoInfo] = useState([]);
    const [dataAgendamento, setDataAgendamento] = useState(null);

    // local

    const [cepAgen, setCepAgen] = useState(null);
    const [cidadeAgen, setCidadeAgen] = useState(null);
    const [bairroAgen, setBairroAgen] = useState(null);
    const [ruaAgen, setRuaAgen] = useState(null);
    const [numAgen, setNumAgen] = useState(null);

    // state

    const [stateAgen, setStateAgen] = useState(null);
    const [horaState, setHoraState] = useState(0);


    // localização

    const [location, setLocation] = useState();
    const [modalVisibleMap, setModalMapView] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);

    const [modalAvavis, setmodalAvavis] = useState(false);
    const [avalia, setAvalia] = useState('');
    const [namePrest, setNamePrest] = useState(null);

    const [starDom, setStarDom] = useState([]);
    const [starNum, setStarNum] = useState(0);
    const [starArr, setStarArr] = useState([1,2,3,4,5]);
    const [docIdAgen, setDocIdAgen] = useState(null);
    const [avaliaSt, setAvaliaSt] = useState(0);
    const [avaliaBD, setAvaliaBD] = useState([]);
    const [dados, setDados] = useState([]);

    const markAvalia = (index) => {
        var domAv2 = [];



        starArr.map((item) => {

            if(item <= index){
                domAv2.push(<Pressable onPress={() => markAvalia(item)}><Icon name="star" size={30} color="#ffb900" /></Pressable>);
            }else{
                domAv2.push(<Pressable onPress={() => markAvalia(item)}><Icon name="star" size={30} color="#000" /></Pressable>);
            }

        });

        setStarNum(index);
        setStarDom(domAv2);

    }

    const sendAvalia = () =>{
        if(starNum == 0){
            Alert.alert("Preencha o numero de estrelas");
        }else{
            const updateDBD = doc(db, "agendamentos", docIdAgen);
            updateDoc(updateDBD, {
                status: 3,
                "avalia.numStar": starNum,
                "avalia.text": avalia
            });

            Alert.alert("Avaliação Enviada Com Sucesso!");
        }
    }

    async function requestLocationPermissions(){
        const [granted] = await requestForegroundPermissionsAsync();

        if(granted){
            const currentPosition = await getCurrentPositionAsync();
            setLocation(currentPosition);

            console.log("LOCAL ALTUAL =>", currentPosition);
        }
    }

    const openModalEnd = () =>{
        setModalMapView(true);
    }

    useEffect(() => {
        requestLocationPermissions();

        var domAv = [];

        /*for(var i =0; i < 5; i++){
            domAv.push(<Pressable onPress={() => markAvalia(i)}><Text>{i}</Text><Icon name="star" size={30} color="#000" /></Pressable>);
        }*/

        starArr.map((item) => {
            domAv.push(<Pressable onPress={() => markAvalia(item)}><Icon name="star" size={30} color="#000" /></Pressable>); 
        });

        setStarDom(domAv);
    }, []);

    const redirectCon = () =>{
        navigation.navigate('Chat', {agendamento: route.params.agendamento, type: 'detail'});
    }

    const aceitarServico = async(id)=>{
        const updateDBD = doc(db, "agendamentos", id);

        // Set the "capital" field of the city 'DC'
        await updateDoc(updateDBD, {
            status: 1
        });

        // notificando

        const docRefN = await addDoc(collection(db, "notificacao"), {
                de: route.params.prestadorID,
                para: route.params.clientID,
                data: serverTimestamp(),
                status: 0,
                title: "Agendamento Aceito",
                text: "Prestador de serviço aceitou sua solicitação, qualquer duvida entre em contato pelo chat!",
                idAgen: route.params.agendamento,
                type: "agendamento",
                docid: id
        });

        Alert.alert('Serviço Aceito Com Sucesso', 'Entre em contato com o cliente pelo chat para combinar melhor...', [
            {text: 'OK', onPress: () => navigation.navigate('Painel')},
          ]);
    }

    const recusarServico = async(id)=>{
        const updateDBD = doc(db, "agendamentos", id);

        // Set the "capital" field of the city 'DC'
        await updateDoc(updateDBD, {
            status: 2
        });

        // notificando

        const docRefN = await addDoc(collection(db, "notificacao"), {
            de: route.params.prestadorID,
            para: route.params.clientID,
            data: serverTimestamp(),
            status: 0,
            title: "Agendamento Recusado",
            text: "Infelizmente não conseguimos atender sua solicitação, tente com outro prestador",
            idAgen: route.params.agendamento,
            type: "agendamento",
            docid: id
        });

        if(route.params.tipo == "prestador"){
            Alert.alert('Serviço Recusado', 'Cliente será notificado....', [
                {text: 'OK', onPress: () => navigation.navigate('Painel')},
            ]);
        }else{
            Alert.alert('Serviço Cancelado', 'Prestador será notificado....', [
                {text: 'OK', onPress: () => navigation.navigate('Painel')},
            ]);
        } 
    }

    // Função para converter o objeto timestamp em um objeto Date
    const convertFirestoreTimestampToDate = (timestamp) => {
        return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    }

    // Função para confirmar saida para o serviço

    const confirmSaida = async(docid) =>{

        console.log(docid);

        const updateAgen = doc(db, "agendamentos", docid);

        // Set the "capital" field of the city 'DC'
        await updateDoc(updateAgen, {
            saida: 1
        });

        setDialogVisible(true);

        // notificando

        const addnotify = await addDoc(collection(db, "notificacao"), {
            de: route.params.prestadorID,
            para: route.params.clientID,
            data: serverTimestamp(),
            status: 0,
            title: "Prestador a caminho",
            text: "Fique atento prestador está a caminho do serviço",
            idAgen: docid,
            type: "agendamento",
        });

    }

    const openAvalia = () =>{
        setmodalAvavis(true);
    }
   
    useEffect(() => {

       
        
        // buscando serviço agendado

        const q = query(collection(db, "agendamentos"), where("id", "==", route.params.agendamento));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const info = [];
        var docidd = null;
        querySnapshot.forEach((doc) => {
            info.push(doc.data());
            docidd = doc.id;
        });

        setDados(info);

        console.log("=====>", route)

        const dataAgen = info[0].data;

        

        setCepAgen(info[0].local.cep);
        setCidadeAgen(info[0].local.cidade);
        setBairroAgen(info[0].local.bairro);
        setRuaAgen(info[0].local.rua);
        setNumAgen(info[0].local.num);
        setNamePrest(info[0].prestadorName);
        setDocIdAgen(docidd);
        
        if(info[0].avalia){
            setAvaliaSt(1);
            setAvaliaBD(info[0].avalia);
        }

        const timestamp = info[0].data;

        // Converter o timestamp para objeto Date
        const date = timestamp.toDate();

        // Obter a data e hora atual
        const now = new Date();

        // Calcular a diferença em horas entre a data do registro e a data atual
        const hoursDifference = differenceInHours(date, now);

        var horadom = null;

        console.log('==================>', hoursDifference);

        // Verificar se falta 1 hora para a data marcada
        if (hoursDifference === 0) {
            horadom = <Pressable onPress={() => confirmSaida(docidd)} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', padding: 5, borderRadius: 5, marginTop: 10, backgroundColor: '#13182B', marginBottom:15}}><Text style={{fontSize:20, fontWeight: 'bold', textAlign: 'center', color: '#fff'}}>Estou A Caminho!</Text></Pressable>;
            console.log("falta 1 hora")
        }else if(hoursDifference < -11){
            console.log('=====xxxxx====>', hoursDifference);

            if(info[0].status == 3){
                horadom = <Pressable style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', padding: 10, borderRadius: 5, marginTop: 10, backgroundColor: '#249938'}}><Text style={{fontSize:19, textTransform: 'uppercase', fontWeight: 'bold', textAlign: 'center', color: '#ffff'}}>Serviço Finalizado</Text></Pressable>
            }else{
                horadom = <Pressable onPress={() => openAvalia()} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', padding: 10, borderRadius: 5, marginTop: 10, backgroundColor: '#249938'}}><Text style={{fontSize:19, textTransform: 'uppercase', fontWeight: 'bold', textAlign: 'center', color: '#ffff'}}>Finalizar Serviço</Text></Pressable>
            }
        }

        if(route.params.tipo == "prestador"){

            

            if(info[0].status == 0){
                setActionDom(<View>

                    <View style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Pressable onPress={() => aceitarServico(docidd)} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', padding: 5, borderRadius: 5, marginTop: 10, backgroundColor: '#249938'}}><Text style={{fontSize:20, textAlign: 'center', color: '#fff'}}>Aceitar Serviço</Text></Pressable>
                        <Pressable onPress={() => recusarServico(docidd)} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', padding: 5, borderRadius: 5, marginTop: 10, backgroundColor: '#f2f2f2'}}><Text style={{fontSize:20, textAlign: 'center', color: '#333', fontWeight: 'bold'}}>Recusar Serviço</Text></Pressable>
                    </View>
                    
                    <Pressable onPress={() => redirectCon()} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', padding: 5, borderRadius: 5, marginTop: 10, backgroundColor: '#fff'}}>
                        <Text style={{fontSize:20, fontWeight: 'bold', textAlign: 'center', color: '#000'}}>Conversar Com Cliente</Text>
                    </Pressable>
                </View>);
            }else if(info[0].status == 1){
                setActionDom(<View>

                    <View style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
                        {horadom}
                        <Pressable onPress={() => recusarServico(docidd)} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', padding: 5, borderRadius: 5, marginTop: 10, backgroundColor: '#f2f2f2'}}><Text style={{fontSize:20, textAlign: 'center', color: '#333', fontWeight: 'bold'}}>Cancelar Serviço</Text></Pressable>
                    </View>
                    <Pressable onPress={() => redirectCon()} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', padding: 5, borderRadius: 5, marginTop: 10, backgroundColor: '#fff'}}><Text style={{fontSize:20, fontWeight: 'bold', textAlign: 'center', color: '#000'}}>Conversar Com Cliente</Text></Pressable>
                    
                </View>);
            }else if(info[0].status == 3){
                setActionDom(<View>

                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Pressable onPress={() => aceitarServico(docidd)} style={{width: '48%', marginLeft: 'auto', marginRight: 'auto', padding: 5, borderRadius: 5, marginTop: 10, backgroundColor: '#249938'}}><Text style={{fontSize:20, textAlign: 'center', color: '#fff'}}>Finalizar</Text></Pressable>
                    </View>
                    <Pressable onPress={() => redirectCon()} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', padding: 5, borderRadius: 5, marginTop: 10, backgroundColor: '#fff'}}><Text style={{fontSize:20, fontWeight: 'bold', textAlign: 'center', color: '#000'}}>Conversar Com Cliente</Text></Pressable>
                    {horadom}
                </View>);
            }else{
                setActionDom(<View>
                    <Text style={{fontSize: 20, fontWeight: 'bold', backgroundColor: '#f2f2f2', padding: 5, borderRadius: 5, textAlign: 'center'}}>Serviço Cancelado!</Text>
                </View>);
            }

            
        }else{
            if(info[0].status != 2){
                setActionDom(<View>
                    <Pressable onPress={() => redirectCon()} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', padding: 5, borderRadius: 5, marginTop: 10, backgroundColor: '#54c3fa'}}><Text style={{fontSize:20, fontWeight: 'bold', textAlign: 'center', color: '#fff'}}>Conversar Com Prestador</Text></Pressable>
                    <Pressable onPress={() => recusarServico(docidd)} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', padding: 5, borderRadius: 5, marginTop: 10, backgroundColor: 'red'}}><Text style={{fontSize:20, fontWeight: 'bold', textAlign: 'center', color: '#fff'}}>Cancelar Serviço</Text></Pressable>
                    {horadom}
                </View>);
            }else{
                setActionDom(<View>
                    <Text style={{fontSize: 20, fontWeight: 'bold', backgroundColor: '#f2f2f2', padding: 5, borderRadius: 5, textAlign: 'center'}}>Serviço Cancelado!</Text>
                </View>);
            }
            
        }

        setStateAgen(info[0].status);

        const dateF = convertFirestoreTimestampToDate(dataAgen);
        const dataFormatada = format(dateF, 'dd/MM/yyyy HH:mm');

        setDataAgendamento(dataFormatada);

        navigation.setOptions({ title: 'Detalhes do serviço #'+info[0].id });

        //const dateFormat = format(info[0].data, 'dd/MM/yyyy HH:mm:ss');
        
        setTextAgen(<Text style={{fontSize: 18, textTransform: 'capitalize'}}>{info[0].msgclient}</Text>);

        // buscando info do cliente ou prestador

        if(route.params.tipo == "prestador"){

            const qclient = query(collection(db, "user"), where("id", "==", info[0].cliente));
            const qcl = onSnapshot(qclient, (querySnapshot) => {
            const infoClient = [];
            querySnapshot.forEach((doc) => {
                infoClient.push(doc.data());
            });
            
            setClientInfo(infoClient);

            });

        }else{
            const qclient = query(collection(db, "user"), where("id", "==", info[0].prestador));
            const qcl = onSnapshot(qclient, (querySnapshot) => {
            const infoClient = [];
            querySnapshot.forEach((doc) => {
                infoClient.push(doc.data());
            });
            
            setClientInfo(infoClient);

            // buscando info do cliente
            });
        }

        });

        
    }, []);


    /*const redirectChat = (val,clientid) => {
        console.log(val);

        if(val == "agendamento"){
            navigation.navigate("Agendamento", {tipo: data.params.type, prestadorID: data.params.id, clientID: clientid});
        }else if(val == "msg"){
            navigation.navigate("Agendamento", {tipo: data.params.type, prestadorID: data.params.id, clientID: clientid});
        }

    }*/


    return (
        <ScrollView style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', padding: 5, borderRadius: 10, backgroundColor: '#fff', marginTop: 20}}>

            <Text style={{fontSize: 22, fontWeight: 'bold'}}>Serviço #{route.params.agendamento}</Text>

            {stateAgen == 0?(
                <Text style={{backgroundColor: '#ffd333', color: '#fff', padding: 5, borderRadius: 10, fontSize: 20, fontWeight: 'bold', width: 'auto', textAlign: 'center', textTransform: 'uppercase', marginTop: 10}}>Pendente!</Text>
            ): stateAgen == 1 ?(
                <Text style={{backgroundColor: '#249938', color: '#fff', padding: 5, borderRadius: 10, fontSize: 20, fontWeight: 'bold', width: 'auto', textAlign: 'center', textTransform: 'uppercase', marginTop: 10}}>Confirmado!</Text>
            ): stateAgen == 3 ?(
                <Text style={{backgroundColor: '#249938', color: '#fff', padding: 5, borderRadius: 10, fontSize: 20, fontWeight: 'bold', width: 'auto', textAlign: 'center', textTransform: 'uppercase', marginTop: 10}}>Finalizado!</Text>
            ):(
                <Text style={{backgroundColor: '#ff0d4e', color: '#fff', padding: 5, borderRadius: 10, fontSize: 20, fontWeight: 'bold', width: 'auto', textAlign: 'center', textTransform: 'uppercase', marginTop: 10}}>Cancelado!</Text>  
            )}

            {route.params.tipo == "prestador"?(
                <Text style={{marginTop:10, marginBottom: 10, fontSize: 22, fontWeight: 'bold'}}>Informações do Cliente:</Text>
            ):(
                <Text style={{marginTop:10, marginBottom: 10, fontSize: 22, fontWeight: 'bold'}}>Informações do Prestador:</Text>
            )}
            
            

            {clientInfo.map((item, index) => (
                <View key={index} style={{marginTop: 10}}>
                    <Text style={styles.textinfo}>Nome: {item.name}</Text>
                    <Text style={styles.textinfo}>E-mail: {item.email}</Text>
                    <Text style={styles.textinfo}>Contato: {item.tel}</Text>
                </View>
            ))}

            <Text style={{marginTop:10, marginBottom: 10, fontSize: 22, fontWeight: 'bold'}}>Local Do Serviço:</Text>
            
            <View style={{backgroundColor: '#f2f2f2', padding: 5, borderRadius: 10, marginTop: 10, marginBottom: 10}}>
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10}}>
                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>Cep: </Text>
                    <Text style={{fontSize: 16}}> {cepAgen} </Text>
                </View>

                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10}}>
                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>Cidade: </Text>
                    <Text style={{fontSize: 16}}> {cidadeAgen} </Text>
                </View>

                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10}}>
                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>Bairro: </Text>
                    <Text style={{fontSize: 16}}> {bairroAgen} </Text>
                </View>

                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10}}>
                    <Text style={{fontSize: 16}}> {ruaAgen} </Text>
                </View>

                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10}}>
                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>Numero: </Text>
                    <Text style={{fontSize: 18, fontWeight: 'bold'}}> {numAgen} </Text>
                </View>

                
            </View>
            
            <Text style={{marginTop:10, marginBottom: 10, fontSize: 18, fontWeight: 'bold'}}>Data: {dataAgendamento}</Text>

            <Text style={{marginTop:10, marginBottom: 10, fontSize: 22, fontWeight: 'bold'}}>Descrição:</Text>

            <View style={{width: '99%', marginLeft: 'auto', marginRight: 'auto', padding: 10, borderRadius: 5, backgroundColor: '#f5f5f5', marginTop: 10, marginBottom: 10}}>
                {textAgen}
            </View>

            {avaliaSt ?(
                <View>
                    <Text style={{marginTop:10, marginBottom: 10, fontSize: 22, fontWeight: 'bold'}}>Avaliação:</Text>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                        {
                            starArr.map((item) => {

                                if(item <= avaliaBD.numStar){
                                    return(<Pressable onPress={() => markAvalia(item)}><Icon name="star" size={30} color="#ffb900" /></Pressable>)
                                }else{
                                    return(<Pressable onPress={() => markAvalia(item)}><Icon name="star" size={30} color="#000" /></Pressable>)
                                }

                            })
                        }
                    </View>
                    <Text style={{marginTop:10, marginBottom: 10, fontSize: 18, fontWeight: 'bold'}}>Comentário:</Text>
                    <Text style={{marginTop:10, marginBottom: 10, fontSize: 16, fontWeight: 'bold'}}>
                        {avaliaBD.text}
                    </Text>
                </View>
            ):(
                <Text></Text>
            )}
            
            <View style={{width: '99%', marginLeft: 'auto', marginRight: 'auto', padding: 10, borderRadius: 5, backgroundColor: '#f5f5f5', marginTop: 10, marginBottom: 10}}>
                {textAgen}
            </View>

            <View style={{padding: 10}}>
                {actionDom}
            </View>
            

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisibleMap}
                onRequestClose={() => {
                setModalVisible(!modalVisibleMap);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>

                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalAvavis}
                onRequestClose={() => {
                setmodalAvavis(!modalAvavis);
                }}>
                <View style={styles.centeredView2}>
                <View style={styles.modalView2}>


                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>Avalie o serviço de {namePrest}</Text>

                    <Text style={{fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 15}}>Numero de Estrelas:</Text>

                    <View style={styles.containerStar}>
                        {starDom}
                    </View>

                    <TextInput
                        style={styles.input}
                        onChangeText={setAvalia}
                        value={avalia}
                        placeholder="Insira sua mensagem sobre o serviço..."
                    />

                    <Pressable onPress={() => sendAvalia()} style={styles.btnupload}><Text style={{fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'center'}}>Confirmar Avaliação</Text></Pressable>
                    
                    <Pressable
                      onPress={() => setmodalAvavis(!modalAvavis)}>
                      <Text style={{fontSize: 16, color: 'red', fontWeight: 'bold'}}>Cancelar</Text>
                    </Pressable>
                </View>
                </View>
        </Modal>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    
    textinfo:{
        fontSize: 18,
        fontWeight: 'bold'
    },
    map: {
        width: '100%',
        flex: 1
    },
    btndetailend: {
        width: '95%',
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: '#2e385e',
        padding: 10,
        borderRadius: 10
    },
    centeredView2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
      },
      modalView2: {
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
      input:{
        padding: 10,
        fontSize: 16,
        height: 150,
        width: '100%',
        backgroundColor: '#f1f1f1',
        marginTop: 15,
        marginBottom: 15,
        borderRadius: 10
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
      containerStar:{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }

});

export default DetalService;