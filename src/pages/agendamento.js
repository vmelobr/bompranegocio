import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, ImageBackground, TextInput, ScrollView, Dimensions,TouchableOpacity, Image, Alert, Modal, Pressable, FlatList } from 'react-native';
import {db} from '../../firebase';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, Timestamp, updateDoc, doc} from "firebase/firestore";
import { requestBackgroundPermissionsAsync, getCurrentPositionAsync, LocationObject, requestForegroundPermissionsAsync } from 'expo-location';
import { differenceInHours, format } from 'date-fns';


const DetalService = ({navigation,route}) => {

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
    }, []);

    const redirectCon = () =>{
        navigation.navigate("Agendamento", {tipo: data.params.type, prestadorID: data.params.prestadorID, clientID: data.params.clientID});
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
            text: "Infelizmente não conseguimos atender sua solicitação, tente com outro prestador...",
            idAgen: route.params.agendamento,
            type: "agendamento",
            docid: id
        });

        Alert.alert('Serviço Recusado', 'Cliente será notificado....', [
            {text: 'OK', onPress: () => navigation.navigate('Painel')},
        ]);
    }

    // Função para converter o objeto timestamp em um objeto Date
    const convertFirestoreTimestampToDate = (timestamp) => {
        return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    };

    // Função para confirmar saida para o serviço

    const confirmSaida = async(docid) =>{
        const updateAgen = doc(db, "agendamentos", docid);

        // Set the "capital" field of the city 'DC'
        await updateDoc(updateAgen, {
            saida: true
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
            type: "acompanhamento",
        });

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

        const dataAgen = info[0].data;

        console.log("========", info);

        setCepAgen(info[0].local.cep);
        setCidadeAgen(info[0].local.cidade);
        setBairroAgen(info[0].local.bairro);
        setRuaAgen(info[0].local.rua);
        setNumAgen(info[0].local.num);

        const timestamp = info[0].data;

        // Converter o timestamp para objeto Date
        const date = timestamp.toDate();

        // Obter a data e hora atual
        const now = new Date();

        // Calcular a diferença em horas entre a data do registro e a data atual
        const hoursDifference = differenceInHours(date, now);

        var horadom = null;

        // Verificar se falta 1 hora para a data marcada
        if (hoursDifference === 1) {
            horadom = <Pressable onPress={() => confirmSaida(docidd)} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', padding: 5, borderRadius: 5, marginTop: 10, backgroundColor: '#13182B', marginBottom:15}}><Text style={{fontSize:20, fontWeight: 'bold', textAlign: 'center', color: '#fff'}}>Confirmar Saida</Text></Pressable>;
            console.log("falta 1 hora")
        }else{
            console.log("falta mais de 1 hota")
            console.log(hoursDifference)
        }

        if(data.params.type == "prestador"){

            if(info[0].status == 0){
                setActionDom(<View>

                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Pressable onPress={() => aceitarServico(docidd)} style={{width: '48%', marginLeft: 'auto', marginRight: 'auto', padding: 5, borderRadius: 5, marginTop: 10, backgroundColor: '#249938'}}><Text style={{fontSize:20, textAlign: 'center', color: '#fff'}}>Aceitar Serviço</Text></Pressable>
                        <Pressable onPress={() => recusarServico(docidd)} style={{width: '48%', marginLeft: 'auto', marginRight: 'auto', padding: 5, borderRadius: 5, marginTop: 10, backgroundColor: 'red'}}><Text style={{fontSize:20, textAlign: 'center', color: '#fff'}}>Recusar Serviço</Text></Pressable>
                    </View>
                    
                    <Pressable onPress={() => redirectCon()} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', padding: 5, borderRadius: 5, marginTop: 10, backgroundColor: '#fff'}}><Text style={{fontSize:20, fontWeight: 'bold', textAlign: 'center', color: '#000'}}>Conversar Com Cliente</Text></Pressable>
                </View>);
            }else if(info[0].status == 1){
                setActionDom(<View>

                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Pressable onPress={() => aceitarServico(docidd)} style={{width: '48%', marginLeft: 'auto', marginRight: 'auto', padding: 5, borderRadius: 5, marginTop: 10, backgroundColor: '#249938'}}><Text style={{fontSize:20, textAlign: 'center', color: '#fff'}}>Estou Caminho...</Text></Pressable>
                        <Pressable onPress={() => recusarServico(docidd)} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', padding: 5, borderRadius: 5, marginTop: 10, backgroundColor: 'red'}}><Text style={{fontSize:20, textAlign: 'center', color: '#fff'}}>Cancelar Serviço</Text></Pressable>
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

        if(data.params.type == "prestador"){

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
            ):(
                <Text style={{backgroundColor: '#ff0d4e', color: '#fff', padding: 5, borderRadius: 10, fontSize: 20, fontWeight: 'bold', width: 'auto', textAlign: 'center', textTransform: 'uppercase', marginTop: 10}}>Cancelado!</Text>
            )}

            {route.params.type == "prestador"?(
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

            <Dialog.Container visible={dialogVisible}>
                <Dialog.Title>Saida Confirmada</Dialog.Title>
                <Dialog.Description>
                    Seu Cliente receberá uma notificação informando que você está a caminho e poderá ver seu trajeto e auxiliar você a encontrar o destino...
                </Dialog.Description>
                <Dialog.Button label="Fechar" onPress={() => setDialogVisible(false)} />
            </Dialog.Container>

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
    }

});

export default DetalService;