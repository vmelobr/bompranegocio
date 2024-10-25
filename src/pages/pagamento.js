import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Pressable, TextInput, Image, SafeAreaView, Modal, Alert } from 'react-native';
import {db} from '../../firebase';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, startAt, endAt, orderBy, doc, updateDoc } from "firebase/firestore";
import { RadioButton } from 'react-native-paper';

export default function Pagamento({ navigation, route }) {
    const [user, setUser] = useState(null);
    const [initializing, setInitializing] = useState(true);
    const [checked, setChecked] = useState('');
    const auth = getAuth();
    const [modalAgenVis, setModalAgenVis] = useState(false);

    const [modalpayproc, setmodalpayproc] = useState(false);
    const [userId, setUserID] = useState(null);

    // card var

    const [numberCard, setNumberCard] = useState(null);
    const inputCardNum = useRef(null);

    const numberCardSet = (num)  =>  {
        setNumberCard(num);
    }

    const [nameCard, setNameCard] = useState(null);
    const inputCardName = useRef(null);

    const nameCardSet = (num)  =>  {
        setNameCard(num);
    }

    const [dataCard, setDataCard] = useState(null);
    const inputCardData = useRef(null);

    const dataCardSet = (num)  =>  {
        setDataCard(num);
    }

    const [cvvCard, setCvvCard] = useState(null);
    const inputCardCvv = useRef(null);

    const cvvCardSet = (num)  =>  {
        setCvvCard(num);
    }

    const [cpfCard, setCpfCard] = useState(null);
    const inputCardCpf = useRef(null);

    const cpfCardSet = (num)  =>  {
        setCpfCard(num);
    }

    const [viewCard, setViewCard] = useState('none');

    const [paymentDom, setPayDom] = useState();

    const [textpay, setTextpay] = useState('Aguarde Estamos Processando Seu Pagamento....');

    const [paydom, setpaydom] = useState(
        <View>
            <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10}}>{textpay}</Text>
            <Image
                source={require('./animationcard.gif')} // Caminho relativo para a imagem
                style={styles.image}
            />
        </View>
    );

    useEffect(() => {
        const subscriber = auth.onAuthStateChanged((userr) => {
          setUser(userr);
          if (initializing) setInitializing(false);
        });
     
      }, [initializing, user]);

      useEffect(() => {
        const q = query(collection(db, "user"), where("email", "==", route.params.user));
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userInf = [];
            querySnapshot.forEach((doc) => {
              userInf.push(doc.data());
              setUserID(doc.data().id);
            });
            
          });
        }, []);

    const confirmCard = ()  => {
        if(numberCard  ==  null){
            Alert.alert('Preencha o campo NUMERO DO CARTÃO');
            inputCardNum.current.focus();
        }else if(nameCard == ""){
            Alert.alert('Preencha o campo NOME DO CARTÃO');
            inputCardName.current.focus();
        }else if(dataCard ==  null){
            Alert.alert('Preencha o campo DATA DO CARTÃO');
            inputCardData.current.focus();
        }else if(cvvCard == null){
            Alert.alert('Preencha o campo CVV DO CARTÃO');
            inputCardCvv.current.focus();
        }else if(cpfCard == null){
            Alert.alert('Preencha o campo CPF DO CARTÃO');
            inputCardCpf.current.focus();
        }else{
            setModalAgenVis(false);
            setViewCard('block');
        }
    }


    const alterMethod = (method)  =>{
        setChecked(method);

        if(method == "card"){
            setPayDom(<View>
                <Text style={{fontSize: 18, marginBottom: 15}}>Preencha os dados do cartão de crédito:</Text>
                <View style={styles.conform}>
                    <Text style={styles.textform}>Numero Impresso no Cartão</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Numero Impresso do Cartão"
                        keyboardType="default"
                        onChangeText={numberCardSet}
                        ref={inputCardNum}
                    />
                </View>

                <View style={styles.conform}>
                    <Text style={styles.textform}>Nome Impresso no Cartão</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nome Impresso do Cartão"
                        keyboardType="default"
                        onChangeText={nameCardSet}
                        ref={inputCardName}
                    />
                </View>

                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>

                    <View style={[styles.conform, {width: '45%'}]}>
                        <Text style={styles.textform}>Data De Vencimento</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ex 03/29"
                            keyboardType="default"
                            onChangeText={dataCardSet}
                            ref={inputCardData}
                        />
                    </View>

                    <View style={[styles.conform, {width: '45%'}]}>
                        <Text style={styles.textform}>CVV</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Codigo de segurança"
                            keyboardType="default"
                            onChangeText={cvvCardSet}
                            ref={inputCardCvv}
                        />
                    </View>

                </View>

                <View style={styles.conform}>
                    <Text style={styles.textform}>CPF Do Responsável</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="CPF do Responsável do cartão"
                        keyboardType="default"
                        onChangeText={cpfCardSet}
                        ref={inputCardCpf}
                    />
                </View>
                <View style={styles.conform}>
                    <Pressable style={styles.btnCon}>
                        <Text style={styles.textCon}  onPress={()  =>  confirmCard()}>Prosseguir</Text>
                    </Pressable>
                </View>
            </View>);
            setModalAgenVis(true);
        }
    }

    const sendPay = (type) =>{
        let data = null;

        if(type == "card"){
            data = {
                numberCard: numberCard,
                nameCard: nameCard,
                dataCard: dataCard,
                cvvCard: cvvCard,
                cpfCard: cpfCard,
                value: 15,
                user: userId
            }
        }else{
            data = {
                value: 15,
                user: userId
            }
        }

        setmodalpayproc(true);


        fetch('https://carreiraecommerce.com.br/bompranegocio/payment.php', {
            method: 'POST', // Especifica o método HTTP
            headers: {
              'Content-Type': 'application/json', // Define o tipo de conteúdo como JSON
            },
            body: JSON.stringify(data) // Converte os dados para JSON
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json(); // Converte a resposta para JSON
          })
          .then(data => {
            console.log('Success:', data); // Manipula a resposta do servidor

            if(data.status == 200){
                setpaydom(
                    <View>
                        <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10}}>Pagamento Aprovado com Sucesso...</Text>
                        <Image
                            source={require('./animatepayok.gif')} // Caminho relativo para a imagem
                            style={styles.image}
                        />
                        <Pressable onPress={() => navigation.navigate('Painel')} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', borderRadius: 10, padding: 10, backgroundColor: '#2e385e'}}> <Text style={{fontSize: 18, fontWeight: 'bold', color: '#fff'}}>Ir Para o Painel</Text> </Pressable>
                    </View>
                );
            }else{
                setpaydom(
                    <View>
                        <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10}}>Houve um problema com seu pagamento, tente novamente mais tarde...</Text>
                        <Image
                            source={require('./animateerror.gif')} // Caminho relativo para a imagem
                            style={styles.image}
                        />
                        <Pressable onPress={() => navigation.navigate('Painel')} style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', borderRadius: 10, padding: 10, backgroundColor: '#2e385e'}}> <Text style={{fontSize: 18, fontWeight: 'bold', color: '#fff'}}>Ir Para o Painel</Text> </Pressable>
                    </View>
                );
            }
          })
          .catch(error => {
            console.error('There was a problem with the fetch operation:', error); // Trata erros
          });
    }

  return (
    <SafeAreaView>
        <Text style={{marginLeft: 10, fontSize: 18, marginTop: 10}}>Esolha a Forma de Pagamento:</Text>
        <View style={{marginTop: 10}}>

            <View style={styles.containerOp}>
                <RadioButton
                    value="first"
                    status={ checked === 'first' ? 'checked' : 'unchecked' }
                    onPress={() => alterMethod('card')}
                />
                <Text style={styles.textOp}>Cartão de Credito</Text>
            </View>


            <View style={{display: viewCard, width: '95%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fff', borderRadius: 10, padding: 10}}>

                <Text style={{fontSize: 18, fontWeight: 'bold'}}>{numberCard}</Text>
                <Text style={{fontSize: 16, fontWeight: 'bold'}}>{nameCard}</Text>

            </View>

            <View style={styles.containerOp}>
                <RadioButton
                    value="second"
                    status={ checked === 'second' ? 'checked' : 'unchecked' }
                    onPress={() => alterMethod('pix')}
                />
                <Text style={styles.textOp}>Pix</Text>
            </View>
        </View>

        <Pressable onPress={() => sendPay()} style={styles.btnCon}>
            <Text style={styles.textCon}>Confirma Pagamento</Text>
        </Pressable>

        <Modal
                animationType="slide"
                transparent={true}
                visible={modalAgenVis}
                onRequestClose={() => {
                Alert.alert('Modal has been closed.');
                setModalAgenVis(!modalAgenVis);
                }}>
                <View style={styles.centeredViewM}>
                <View style={styles.modalViewM}>
                    {paymentDom}
                </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalpayproc}
                onRequestClose={() => {
                Alert.alert('Modal has been closed.');
                    setmodalpayproc(!modalpayproc);
                }}>
                <View style={styles.centeredViewM}>
                <View style={styles.modalViewM}>
                        {paydom}
                </View>
                </View>
            </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    containerOp:{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    textOp:{
        fontSize: 16,
        fontWeight: 'bold'
    },
    btnCon:{
        width: '90%',
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: '#2e385e',
        height: 60,
        borderRadius: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15
    },
    textCon:{
        color: '#fff',
        fontSize: 18
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
        width: '90%',
        position: 'absolute',
        bottom: 0,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        maxHeight: '90%'
      },
      conform:{
        marginTop: 15,
        marginBottom: 15
      },
      input: {
        backgroundColor: '#f2f2f2',
        marginTop: 10
      },
      image:{
        width: '95%',
        marginRight: 'auto',
        marginLeft: 'auto',
        height: undefined,
        aspectRatio: 1
      }
});
