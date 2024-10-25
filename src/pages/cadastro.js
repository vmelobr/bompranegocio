import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Pressable, TextInput, Image, SafeAreaView, ImageBackground, Modal, Alert, FlatList, ScrollView, TouchableOpacity} from 'react-native';
import {db, Timestamp, storage} from '../../firebase';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, createUserWithEmailAndPassword  } from "firebase/auth";
import { collection, query, where, onSnapshot, startAt, endAt, orderBy, addDoc } from "firebase/firestore";
import { format, addHours } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject} from "firebase/storage";
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';


export default function Cadastro({navigation,route}) {

    const [cadStep, setCadStep] = useState(0);
    const [btntextstate, setbtntextstate] = useState("Avançar");
    const [cadTp, setCadTp] = useState("");
    const [displayPass, setdisplayPass] = useState('none');
    const [selfie, setSelfie] = useState('https://i.imgur.com/1rTSzm9.gif');
    const [modalProcess, setModalPro] = useState(false);
    const [contentDom, setContentDom] = useState(<View>
        <Text style={{fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, marginTop: 15}}>Aguarde Estamos Processando Sua Soliclitação...</Text>
                    <Image 
                        source={require('./animatedoc.gif')}
                        style={{width: '90%', marginLeft: 'auto', marginRight: 'auto', height: undefined, aspectRatio: 1}} 
                    />
    </View>);

    const [comparisonResult, setComparisonResult] = useState(null);
    const [resultAuth, setResultAuth] = useState(false);

    const [facetk1, setFacetk1] = useState(null);
    const [facetk2, setFacetk2] = useState(null);

    const [upres, setupres] = useState(false);
    const [upnum, setupnum] = useState(0);
    const [selectcategservices, setselectcategservices] = useState("none");
    const [categlist, setcateglist] = useState([]);
    const [categlistarr, setcateglistarr] = useState(null);

    const [modalSMS, setModalSms] = useState(false);

    const [celular, setCelular] = useState(null);
    const inputCel = useRef(null);

    const [codesms, setcodesms] = useState(null);
    const inputcodesms = useRef(null);

    const [codesmssistem, setcodesmssistem] = useState();
    const [listservicesdivdisplay, setlistservicesdivdisplay] = useState('none');

    const [servicelistcheckox, setservicelistcheckox] = useState([]);
    const [isChecked, setChecked] = useState(false);
    const [servicesselected, setservicesselected] = useState([]);
    const [servicesselecteddom, setservicesselecteddom] = useState([]);

    const [numserviceselected, setnumserviceselected] = useState(0);

    const [modalservices, setmodalservices] = useState(false);


    const [codesms1, setcodesms1] = useState(0);
    const [codesms2, setcodesms2] = useState(0);
    const [codesms3, setcodesms3] = useState(0);
    const [codesms4, setcodesms4] = useState(0);

    const [codesmsstatus, setcodesmsstatus] = useState('#fff');

    const [statuspass, setstatuspass] = useState("");



    const changeSelectedCheck = (service) => {

        this.backgroundColor = '#428BCA';
        this.color = "#fff";

        console.log("=======>", service);


        const baseArr = servicesselected;


        const exist = baseArr.includes(service);

        if(!exist){
            baseArr.push(service);
        }

        setservicesselected(baseArr);

        const dom = [];

        baseArr.map((item) => {
            dom.push(
                <Pressable style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 10, marginTop: 15}}>
                    <Icon name="close" size={35} color="red" onPress={() => removeServiceSelected(item)}/>
                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>{item}</Text>
                </Pressable>
            );
        });

        setservicesselecteddom(dom);
        setnumserviceselected(baseArr.length);

        if(baseArr.length){
            setlistservicesdivdisplay('block');
        }

    }


    const removeServiceSelected = (service) =>{
        const baseArr = servicesselected;

        const updatedItems = baseArr.filter(item => item !== service);

        setservicesselected(updatedItems);

        const dom = [];

        updatedItems.map((item) => {
            dom.push(
                <Pressable style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 10, marginTop: 15}}>
                    <Icon name="close" size={35} color="red" onPress={() => removeServiceSelected(item)}/>
                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>{item}</Text>
                </Pressable>
            );
        });

        setservicesselecteddom(dom);

        setnumserviceselected(updatedItems.length);

        if(!baseArr.length){
            setlistservicesdivdisplay('none');
        }
    }


    const celularset = (cel) =>{
        setCelular(cel);
    }

    const codesmsset = (code) =>{
        setcodesms(code);


        const nindex = code.length;

        const arr = code.split('');

        for(var i =0; i < nindex; i++){
            if(i == 0){
                setcodesms1(arr[0]);
            }else if(i == 1){
                setcodesms2(arr[1]);
            }else if(i == 2){
                setcodesms3(arr[2]);
            }else if(i == 3){
                setcodesms4(arr[3]);
            }
            
        }

    }

    const changeCategService = (categ) =>{
        setselectcategservices(categ);
        let base = null;

        if(categ == "none"){
            Alert.alert("Selecione uma categoria de serviços");
        }else{
            for(var i = 0; i < categlistarr.length; i++){
          
                if(categlistarr[i].categ == categ){
                  // definir dom da lista de serviços
                  base = categlistarr[i].services;
                }
              }

              //console.log("aa===a=a==a>", base);
        
              const servicesDom = [];


              base.map((item) => {
                servicesDom.push(
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
                        <Pressable onPress={() => changeSelectedCheck(item)} style={{backgroundColor: this.backgroundColor, padding: 10, borderRadius: 10, marginTop: 10, marginBottom: 10}}><Text style={{fontSize: 16, fontWeight: 'bold', textTransform: 'capitalize'}}>{item}</Text></Pressable>
                    </View>
                );
              });
        
              setservicelistcheckox(servicesDom);
        }
  
        
      }

    useEffect(() => {
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
      
        if(facetk1 && facetk2){
            console.log("atualizou token");

            const confidence = compareFaces(facetk1, facetk2);

            //console.log(confidence);
        }
          
     
      }, [facetk1, facetk2]);

      useEffect(() => {

        if(selfielink && rgfrentelink){
            console.log("tudo certo com os link");
            compareTwoImages(selfielink, rgfrentelink);
        }
          
     
      }, [upres]);


      useEffect(() => {
      
        if(resultAuth == 1){
            setContentDom(
                <View>
                        <Text style={{fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, marginTop: 15}}>Usuário Authenticado com sucesso!</Text>
                        <Image 
                            source={require('./animatesuccess.gif')}
                            style={{width: '90%', marginLeft: 'auto', marginRight: 'auto', height: undefined, aspectRatio: 1}} 
                        />
                </View>
              )

              savePrestador();
        }else if(resultAuth == 2){
            setContentDom(
                <View>
                        <Text style={{fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, marginTop: 15}}>Ocorreu Um Problema nas suas fotos, tente novamente...</Text>
                        <Image 
                            source={require('./animateerror.gif')}
                            style={{width: '90%', marginLeft: 'auto', marginRight: 'auto', height: undefined, aspectRatio: 1}} 
                        />
                </View>
              )
        }
          
     
      }, [resultAuth]);

    const savePrestador = async() =>{
        function generateUniqueId() {
            const timestamp = Date.now().toString(36); // Convert timestamp to base-36 string
            const randomStr = Math.random().toString(36).substr(2, 5); // Generate random string
            return `${timestamp}${randomStr}`; // Concatenate timestamp and random string
        }

        function gerarNumeroAleatorio() {
            return Math.floor(1000 + Math.random() * 9000); // Garante que o número terá 4 dígitos
        }


        const cod = gerarNumeroAleatorio();

        setcodesmssistem(cod);

        const resultservices = servicesselected.join(',');

        const docRef = addDoc(collection(db, "user"), {
            avatar: 'https://i.imgur.com/yNwesB2.png',
            name: name,
            email: email,
            cpf: cpf,
            cep: cep,
            estado: estado,
            cidade: cidade,
            bairro: bairro,
            rua: rua,
            num: numero,
            type: "prestador",
            id: generateUniqueId(),
            rgfoto: rgfrentelink,
            selfie: selfielink,
            codesms: cod,
            verify: false,
            services: servicesselected
          });


        const auth = getAuth();

        createUserWithEmailAndPassword(auth, email, senha)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
        });

        Alert.alert('Registro Realizado com sucesso!');
        setModalSms(true);
        
    }

    const upload = async(uri, tp) =>{
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
        const urlink = await getDownloadURL(storageRef);

        if(tp == "selfie"){
            setselfielink(urlink);
        }else{
            setRgFrenteLink(urlink);
        }

        const newv = upnum+1;

        console.log("num up", newv);

        setupnum(newv);

        return 1;
        
    }

    const uploadImage = async(uri) =>{
        const link = [];

        if (!uri) return;

        

        uri.map(item => {

            upload(item.img, item.type);

        });

        setTimeout(function(){
            setupres(1);
            
        }, 15000);

        
    }

    async function compareFaces(faceToken1, faceToken2) {
        const apiKey = 'TelEz4rgpifxIpcx4h5BlPwPzBhxD73T';
        const apiSecret = 'Bp2vpQycmnV4u9wn-F8xYDtLgbck0KG4';

        try {
          const response = await fetch("https://api-us.faceplusplus.com/facepp/v3/compare", {
            method: 'POST',
            body: new URLSearchParams({
                'api_key': apiKey,
                'api_secret': apiSecret,
                'face_token1': faceToken1, // ou 'image_base64': <image_base64>
                'face_token2': faceToken2,
              }).toString(),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });
      
          const data = await response.json();

          if(data.confidence > 70){
            setResultAuth(1);
          }else{
            setResultAuth(2);
          }

          return data;
        } catch (error) {
          console.error('Erro na comparação de rostos:', error);
          throw error;
        }
      }

    async function detectFace(imageUrl, num) {

        const apiKey = 'TelEz4rgpifxIpcx4h5BlPwPzBhxD73T';
        const apiSecret = 'Bp2vpQycmnV4u9wn-F8xYDtLgbck0KG4';

        fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              'api_key': apiKey,
              'api_secret': apiSecret,
              'image_url': imageUrl, // ou 'image_base64': <image_base64>
              'return_attributes': 'age,gender,smiling,headpose,facequality,blur,eyestatus,emotion',
            }).toString(),
          })
            .then(response => response.json())
            .then(data => {
              console.log('Detect result:', data);
              const faceToken = data.faces[0].face_token;
              console.log('Face Token:', faceToken);
              if(num == 1){
                setFacetk1(faceToken);
              }else{
                setFacetk2(faceToken);
              }
              
            })
            .catch(error => {
              console.error('Error:', error);
            });
      }

    const compareTwoImages = async (img1, img2) => {

        try {
    
          const faceToken1 = await detectFace(img1, 1);

          setTimeout(async function(){
            const faceToken2 = await detectFace(img2, 2);  
          }, 5000);

            
          
          //savePrestador();
        } catch (error) {
          console.error('Error comparing images:', error);
          setContentDom(
            <View>
                    <Text style={{fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, marginTop: 15}}>Ocorreu Um Problema na sua solicitação, tente novamente...</Text>
                    <Image 
                        source={require('./animateerror.gif')}
                        style={{width: '90%', marginLeft: 'auto', marginRight: 'auto', height: undefined, aspectRatio: 1}} 
                    />
            </View>
          )
        }
      };
    
      async function compareFacesDeepAIFetch(imageUrl1, imageUrl2) {
        const apiKey = 'e539cfd5-a6db-4bab-88a6-869b5b52bfd0';
        const deepaiEndpoint = 'https://api.deepai.org/api/face-recognition';
      
        try {
          // Enviar a primeira imagem para análise
          let response1 = await fetch(deepaiEndpoint, {
            method: 'POST',
            headers: {
              'api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: imageUrl1,
            }),
          });
      
          response1 = await response1.json();
      
          // Verifica se o rosto foi detectado na primeira imagem
          if (!response1.output || !response1.output.faces || response1.output.faces.length === 0) {
            return 'Nenhum rosto detectado na primeira imagem';
          }
      
          // Enviar a segunda imagem para análise
          let response2 = await fetch(deepaiEndpoint, {
            method: 'POST',
            headers: {
              'api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: imageUrl2,
            }),
          });
      
          response2 = await response2.json();
      
          // Verifica se o rosto foi detectado na segunda imagem
          if (!response2.output || !response2.output.faces || response2.output.faces.length === 0) {
            return 'Nenhum rosto detectado na segunda imagem';
          }
      
          // Pegar as bounding boxes das faces detectadas
          const face1 = response1.output.faces[0].bounding_box;
          const face2 = response2.output.faces[0].bounding_box;
      
          // Aqui você pode usar a lógica para comparar as bounding boxes ou similaridade das faces
          const areSamePerson = JSON.stringify(face1) === JSON.stringify(face2);
      
          if (areSamePerson) {
            return `As faces parecem ser da mesma pessoa.`;
          } else {
            return `As faces parecem ser de pessoas diferentes.`;
          }
        } catch (error) {
          console.error('Erro ao comparar rostos:', error);
          return 'Erro ao comparar rostos';
        }
      }

    const cadTpSet = (tpcad) =>{
        setCadTp(tpcad);
        setdisplayPass("block");
    }

    function buscarEndereco(cep) {
        // Remove qualquer caractere não numérico do CEP
        cep = cep.replace(/\D/g, '');
    
        // Verifica se o CEP tem 8 dígitos
        if (cep.length !== 8) {
            console.error('CEP inválido.');
            return;
        }
    
        // Faz a requisição à API ViaCEP
        const url = `https://viacep.com.br/ws/${cep}/json/`;
    
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar o endereço.');
                }
                return response.json();
            })
            .then(data => {
                if (data.erro) {
                    console.error('CEP não encontrado.');
                } else {
                    console.log('Endereço encontrado:', data);
                    // Aqui você pode manipular o DOM ou usar os dados do endereço como preferir
                    console.log(`Logradouro: ${data.logradouro}`);
                    console.log(`Bairro: ${data.bairro}`);
                    console.log(`Cidade: ${data.localidade}`);
                    console.log(`Estado: ${data.uf}`);

                    setEstado(data.uf);
                    setCidade(data.localidade);
                    setBairro(data.bairro);
                    setRua(data.logradouro);

                    inputNum.current.focus()
                }
            })
            .catch(error => {
                console.error('Erro:', error.message);
            });
    }

    // inputs

    const [name, setName] = useState("");
    const inputName = useRef(null);

    const nameSet = (name) =>{
        setName(name);
    }

    const [email, setEmail] = useState("");
    const inputEmail = useRef(null);

    const emailSet = (em) =>{
        setEmail(em);
    }

    const [cpf, setCpf] = useState("");
    const inputCpf = useRef(null);

    const cpfCet = (cpf) =>{
        setCpf(cpf);
    }

    const [dociduser, setdociduser] = useState('');

    const changecpf = (cpf) =>{
        if(cpf.length > 11){
            const qcpf = query(collection(db, "user"), where("cpf", "==", cpf));
            const unsubscribe = onSnapshot(qcpf, (querySnapshot) => {
            const cpfusers = [];
            querySnapshot.forEach((doc) => {
                cpfusers.push(doc.data());
                setdociduser(doc.id);
            });
    
            if(cpfusers.length > 0){
                Alert.alert('CPF/CNPJ Já Cadastrado!');
                inputCpf.current.focus();
                setCpf("");
            }
            });
        }
    }

    const changeemail = (em) =>{

    }

    const [cep, setCep] = useState("");
    const inputCep = useRef(null);

    const cepSet = (cep) =>{
        setCep(cep);

        if(cep.length == 8){
            buscarEndereco(cep);
        }
    }

    const [estado, setEstado] = useState("SP");
    const inputEstado = useRef(null);

    const estadoSet = (uf) =>{
        setEstado(uf);
    }

    const [cidade, setCidade] = useState("");
    const inputCidade = useRef(null);

    const cidadeSet = (city) =>{
        setCidade(city);
    }

    const [bairro, setBairro] = useState("");
    const inputBairro = useRef(null);

    const bairroSet = (bairro) =>{
        setBairro(bairro);
    }

    const [rua, setRua] = useState("");
    const inputRua = useRef(null);

    const ruaSet = (rua) =>{
        setRua(rua);
    }

    const [numero, setNum] = useState("");
    const inputNum = useRef(null);

    const numSet = (num) =>{
        setNum(num);
    }

    const [complemento, setComplemento] = useState("");
    const inputComplemento = useRef(null);

    const complementoSet = (comp) =>{
        setComplemento(comp);
    }

    const [senha, setSenha] = useState("");
    const inputSenha = useRef(null);

    const senhaSet = (pass) =>{

        if(pass.length < 6){
            setstatuspass("Senha Deve Conter 6 Caracteres....");
        }else{
            setstatuspass("Senha Válida!");
        }

        setSenha(pass);
    }

    const [senharep, setSenharep] = useState("");
    const inputSenharep = useRef(null);

    const senharepSet = (pass) =>{

        if(pass.length < 6){
            setstatuspass("Confirmação da Senha Deve Conter 6 Caracteres....");
        }else{
            setstatuspass("Senha Válida!");
        }

        setSenharep(pass);
    }

    const [rgnum, setRgNum] = useState("");
    const inputRg = useRef(null);

    const rgnumSet = (rg) =>{
        setRgNum(rg);
    }

    const [datanas, setDataNas] = useState("");
    const inputData = useRef(null);

    const datanasSet = (data) =>{
        setDataNas(data);
    }

    const [rgfrente, setRgFrente] = useState('https://i.imgur.com/rD9wbsQ.png');
    const [rgverso, setRgVerso] = useState('https://i.imgur.com/BtOsRLi.png');

    const [rgfrentelink, setRgFrenteLink] = useState(null);
    const [rgversolink, setrgversolink] = useState(null);
    const [selfielink, setselfielink] = useState(null);

    const [statusmsgcode, setstatusmsgcode] = useState("SMS Não Enviado");

    const pickImage = async (tp) => {
        // No permissions request is necessary for launching the image library

        var aspect = "";

        if(tp != "selfie"){
            aspect = [16, 9];
        }else{
            aspect = [4, 3];
        }

        console.log(aspect);



        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: false,
          aspect: aspect,
          quality: 1,
          includeBase64: true,
        });
    
        if (!result.canceled) {

            console.log("===================>", result.assets);

            if(tp == "frente"){
                setRgFrente(result.assets[0].uri)
            }else if(tp == "verso"){
                setRgVerso(result.assets[0].uri);
            }else{
                setSelfie(result.assets[0].uri);
            }
          
        }
    }

    

    //const [cadDom, setCadDom] = useState();


    const validaServicesselected = () =>{

        if(!servicesselected.length){
            Alert.alert('Nenhum Serviço Selecionado, selecione os serviços para continuar....');
        }else{
            setmodalservices(false);
        }
    }


const avan = () =>{
    if(cadStep == 0){
        // verificando infos digitadas

        if(name == ""){
            Alert.alert('Preencha o campo Nome Completo');
            inputName.current.focus();
        }else if(email == ""){
            Alert.alert('Preencha o campo E-mail');
            inputEmail.current.focus();
        }else if(cpf == ""){
            Alert.alert('Preencha o campo CPF/CNPJ');
            inputCpf.current.focus();
        }else if(cep == ""){
            Alert.alert('Preencha o campo Cep');
            inputCep.current.focus();
        }else if(estado == ""){
            Alert.alert('Preencha o campo Estado');
            inputEstado.current.focus();
        }else if(cidade == ""){
            Alert.alert('Preencha o campo Cidade');
            inputCidade.current.focus();
        }else if(bairro == ""){
            Alert.alert('Preencha o campo Bairro');
            inputBairro.current.focus();
        }else if(rua == ""){
            Alert.alert('Preencha o campo Bairro');
            inputBairro.current.focus();
        }else if(numero == ""){
            Alert.alert('Preencha o campo Numero');
            inputName.current.focus();
        }else{
            setCadStep(1);
        }
    }else if(cadStep == 1){

        if(senha == ""){
            Alert.alert('Preencha o campo Senha');
            inputSenha.current.focus();
        }else if(senharep != senha){
            Alert.alert('Confirme sua senha corretamente!');
            inputSenharep.current.focus();
        }else if(senha.length < 6){
            Alert.alert('Senha Deve Conter 6 Caracteres...');
            inputSenha.current.focus();
        }else if(cadTp == ""){
            Alert.alert('Selecione o tipo de conta!');
        }else{
            if(cadTp == "prestador"){    
                setCadStep(3);
                setmodalservices(true);
            }else{

                if(servicesselected.length){

                    // realiza o registro

                    function generateUniqueId() {
                        const timestamp = Date.now().toString(36); // Convert timestamp to base-36 string
                        const randomStr = Math.random().toString(36).substr(2, 5); // Generate random string
                        return `${timestamp}${randomStr}`; // Concatenate timestamp and random string
                    }

                    function gerarNumeroAleatorio() {
                        return Math.floor(1000 + Math.random() * 9000); // Garante que o número terá 4 dígitos
                    }


                    const cod = gerarNumeroAleatorio();

                    setcodesmssistem(cod);

                    const docRef = addDoc(collection(db, "user"), {
                        avatar: 'https://i.imgur.com/yNwesB2.png',
                        name: name,
                        email: email,
                        cpf: cpf,
                        cep: cep,
                        estado: estado,
                        cidade: cidade,
                        bairro: bairro,
                        rua: rua,
                        num: numero,
                        type: "cliente",
                        id: generateUniqueId(),
                        codesms: cod,
                        verify: false
                    });


                    const auth = getAuth();

                    createUserWithEmailAndPassword(auth, email, senha)
                    .then((userCredential) => {
                        // Signed up 
                        const user = userCredential.user;

                        
                        // ...
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        // ..
                    });

                    Alert.alert('Registro Realizado com sucesso!');

                    setTimeout(function(){
                        navigation.navigate("Login");
                    }, 5000)
                }else{
                    Alert.alert('Nenhum Serviço Selecionado!');
                }
            }
        }
        
    }else if(cadStep == 3){

        // processando pedido do prestador

        setModalPro(true);

       

        const arrUp = [{type: 'rgfrente', img: rgfrente}, {type: 'selfie', img: selfie}];
        
        uploadImage(arrUp);
        

    }
}

const sendSms = async () => {
    try {
      const username = 'carreiraecommerce1@gmail.com';
      const apiKey = 'EDDBFDCC-AC31-B4E8-77AE-098B901CB9BD';

      const response = await fetch('https://rest.clicksend.com/v3/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${username}:${apiKey}`)}`, // Autenticação básica
        },
        body: JSON.stringify({
          messages: [
            {
              to: celular,
              body: 'Código de verificação Bom Pra Negocios: '+codesms,
            },
          ],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setstatusmsgcode("SMS Enviado Com Sucesso!")
      } else {
        setstatusmsgcode(`Erro ao enviar SMS: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      setstatusmsgcode('Falha ao enviar SMS');
    }
  };


  const verifycon = async(code) => {
    if(code != codesmssistem){
        Alert.alert('Codigo Inválido...');
        setcodesmsstatus("red");
    }else{

        setcodesmsstatus("green");

        // atualiza a verificação no bd

        const dbup = doc(db, "user", dociduser);

        // Set the "capital" field of the city 'DC'
        await updateDoc(dbup, {
            verifycon: true
         });

         navigation.navigate("Login");
    }
  }



  return (
    <SafeAreaView style={{height: '100%', padding: 10, backgroundColor: '#13182B'}}>
        <ScrollView>
        {cadStep == 0?(
            <View>
            <Text style={{fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize', marginBottom: 15, color: '#fff', marginTop: 10, marginBottom: 10}}>Bem vindo(a), </Text>
            <Text style={{fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize', marginBottom: 15, color: '#fff', marginTop: 10, marginBottom: 10}}>Vamos começar seu cadastro:</Text>
            <View>
                <Text style={styles.label}>Nome completo</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite Seu Nome Completo..."
                    keyboardType="default"
                    onChangeText={nameSet}
                    ref={inputName}
                />
            </View>
    
            <View>
                <Text style={styles.label}>CPF/CNPJ</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite CPF OU CNPJ..."
                    keyboardType="default"
                    onChangeText={cpfCet}
                    ref={inputCpf}
                    onBlur={changecpf}
                />
            </View>
    
            <View>
                <Text style={styles.label}>E-mail:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite Seu E-mail Principal..."
                    keyboardType="default"
                    onChangeText={emailSet}
                    ref={inputEmail}
                    onBlur={changeemail}
                />
            </View>

            <View>
                <Text style={styles.label}>Celular:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite Seu Numero De Celular"
                    keyboardType="numeric"
                    onChangeText={celularset}
                    ref={inputCel}
                />
            </View>
    
            <Text style={{fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize', marginBottom: 15, color: '#fff', marginTop: 15}}>Endereço:</Text>
            <View>
                <Text style={styles.label}>Cep:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite Seu Cep..."
                    keyboardType="default"
                    onChangeText={cepSet}
                    ref={inputCep}
                />
            </View>
    
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
    
                <View style={{width: '48%'}}>
                    <Text style={styles.label}>Estado:</Text>
                    <TextInput
                        value={estado}
                        style={styles.input}
                        placeholder="Digite Seu Estado..."
                        keyboardType="default"
                        onChangeText={(est) => setEstado(est)}
                        ref={inputEstado}
                    />
                </View>
    
                <View style={{width: '48%'}}>
                    <Text style={styles.label}>Cidade:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite Sua Cidade..."
                        keyboardType="default"
                        onChangeText={cidadeSet}
                        ref={inputCidade}
                        value={cidade}
                    />
                </View>
    
            </View>
    
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
    
                <View style={{width: '48%'}}>
                    <Text style={styles.label}>Bairro:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite Seu Bairro..."
                        keyboardType="default"
                        onChangeText={bairroSet}
                        ref={inputBairro}
                        value={bairro}
                    />
                </View>
    
                <View style={{width: '48%'}}>
                    <Text style={styles.label}>Rua:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite Sua Rua..."
                        keyboardType="default"
                        onChangeText={ruaSet}
                        ref={inputRua}
                        value={rua}
                    />
                </View>
    
            </View>
    
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
    
                <View style={{width: '48%'}}>
                    <Text style={styles.label}>Numero:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite Seu Numero..."
                        keyboardType="default"
                        onChangeText={numSet}
                        ref={inputNum}
                    />
                </View>
    
                <View style={{width: '48%'}}>
                    <Text style={styles.label}>Complemento:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite Seu Complemento..."
                        keyboardType="default"
                        onChangeText={complementoSet}
                        ref={inputComplemento}
                    />
                </View>
    
            </View>
        </View>
        ): cadStep === 1?(
            <View>
                <Text style={{fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize', marginBottom: 15}}>Selecione o tipo de conta:</Text>

                <Pressable onPress={() => cadTpSet("prestador")} style={styles.btnop}><Icon name="handshake" size={35} color="#0dcaf0" /><Text style={{fontSize: 16, fontWeight: 'bold', color: '#333', textTransform: 'capitalize'}}>Prestador</Text></Pressable>
                <Pressable onPress={() => cadTpSet("Cliente")} style={styles.btnop}><Icon name="person" size={35} color="#0dcaf0" /><Text style={{fontSize: 16, fontWeight: 'bold', color: '#333', textTransform: 'capitalize'}}>Cliente</Text></Pressable>

                <View style={{display: displayPass, backgroundColor: '#fff', padding: 10, borderRadius: 10, margin: 15}}>
                    <Text style={{fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize', marginBottom: 15, color: '#fff'}}>Preencha informações de segurança:</Text>

                    <View>
                        <Text style={styles.label}>Senha:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite Sua Senha desejada..."
                            keyboardType="numeric"
                            onChangeText={senhaSet}
                            ref={inputSenha}
                            secureTextEntry={true}
                        />
                    </View>

                    <View>
                        <Text style={styles.label}>Confirme Sua Senha:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirme Sua Senha Desejada..."
                            keyboardType="numeric"
                            onChangeText={senharepSet}
                            ref={inputSenharep}
                            secureTextEntry={true}
                        />
                    </View>

                    <Text style={{fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 10}}>Digite Uma Senha com 6 caracteres:</Text>
                    <Text style={{fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 10}}>{statuspass}</Text>
                </View>
                
            </View>
        ):(
            <ScrollView style={{backgroundColor: '#fff', padding: 10}}>
                    <Pressable style={[styles.btncon, {marginBottom: 15, width: '95%'}]} onPress={() => setmodalservices(true)}><Text style={{fontSize: 18, fontWeight: 'bold', color: '#fff', textTransform: 'capitalize'}}>Editar Serviços Prestados ({numserviceselected})</Text></Pressable>
                    <Text style={{fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize', marginBottom: 15}}>Valide Sua Indentidade:</Text>
                    <View>
                        <Text style={styles.label}>Numero do RG:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite Seu Numero Do RG..."
                            keyboardType="default"
                            onChangeText={rgnumSet}
                            ref={inputRg}
                        />
                    </View>
    
                    <View>
                        <Text style={styles.label}>Data De Nascimento:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite Sua Data De Nascimento..."
                            keyboardType="default"
                            onChangeText={datanasSet}
                            ref={inputData}
                        />
                    </View>
    
                    <Text style={{fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize', marginBottom: 15}}>Envie Seus Documentos:</Text>
    
                    <View style={{width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Pressable style={styles.btnrg} onPress={() => pickImage('frente')}>
                                <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginTop: 15}}>RG Frente:</Text>
                                <Image 
                                    source={{uri: rgfrente}}
                                    style={styles.image} 
                                />
                        </Pressable>
                        <Pressable style={styles.btnrg} onPress={() => pickImage('verso')}>
                            <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginTop: 15}}>RG Verso:</Text>
                            <Image 
                                source={{uri: rgverso}}
                                style={styles.image} 
                            />
                        </Pressable>
                    </View>
    
                    <Text style={{fontSize: 18, fontWeight: 'bold', textTransform: 'capitalize', marginBottom: 15}}>Envie Uma Selfie:</Text>
    
                    <Pressable style={styles.btnselfie} onPress={() => pickImage('selfie')}>
                        <Icon name="face" size={30} color="#fff" />
                        <Text style={{fontSize: 16, fontWeight: 'bold', color: '#fff', textTransform: 'uppercase'}}>Tirar Selfie</Text>
                    </Pressable>

                    <Image 
                        source={{uri: selfie}}
                        style={{width: '80%', marginLeft: 'auto', marginRight: 'auto', height: undefined, aspectRatio: 1}} 
                    />
                    
                </ScrollView>
        )}

        <Pressable style={styles.btncon} onPress={() => avan()}><Text style={{fontSize: 18, fontWeight: 'bold', color: '#fff', textTransform: 'capitalize'}}>{btntextstate}</Text></Pressable>
        <Modal
                animationType="slide"
                transparent={true}
                visible={modalProcess}
                onRequestClose={() => {
                setModalPro(!modalProcess);
                }}>
                <View style={styles.centeredViewM}>
                <View style={styles.modalViewM}>

                    {contentDom}

                </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalSMS}
                onRequestClose={() => {
                setModalSms(!modalSMS);
                }}>
                <View style={styles.centeredViewM}>
                <View style={styles.modalViewMSMS}>

                    <Pressable onPress={() => sendSms()} style={{marginTop: 10, marginBottom: 10}}><Text style={{fontSize: 18}}>Enviar SMS Para ({celular})</Text></Pressable>
                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>{statusmsgcode}</Text>
                    <Text style={{fontSize: 16}}>Insira o codigo recebido:</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="ex 0000"
                        keyboardType="numeric"
                        onChangeText={codesmsset}
                        ref={inputcodesms}
                    />

                    <View style={{width: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#ccc', borderRadius: 10, padding: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Text style={{backgroundColor: '#fff', borderRadius: 10, padding: 10, fontSize:  18, fontWeight: 'bold'}}>{codesms1}</Text>
                        <Text style={{backgroundColor: '#fff', borderRadius: 10, padding: 10, fontSize:  18, fontWeight: 'bold'}}>{codesms2}</Text>
                        <Text style={{backgroundColor: '#fff', borderRadius: 10, padding: 10, fontSize:  18, fontWeight: 'bold'}}>{codesms3}</Text>
                        <Text style={{backgroundColor: '#fff', borderRadius: 10, padding: 10, fontSize:  18, fontWeight: 'bold'}}>{codesms4}</Text>
                    </View>

                    <Pressable onPress={() => verifycon()} style={styles.btncon}><Text style={{fontSize: 18, fontWeight: 'bold', color: '#fff', textTransform: 'capitalize'}}>Confirmar</Text></Pressable>

                    <Pressable><Text style={{fontSize: 18, fontWeight: 'bold'}}>Re-Enviar...</Text></Pressable>

                </View>
                </View>
            </Modal>

            {cadTp == "prestador" ?(


            <Modal
                animationType="slide"
                transparent={true}
                visible={modalservices}
                onRequestClose={() => {
                setmodalservices(!modalservices);
            }}>
                <View style={styles.centeredViewM}>
                    <View style={styles.modalViewM}>

                        <View>
                            <Text style={styles.label2}>Serviços Prestados:</Text>
                            <Picker
                                    selectedValue={selectcategservices}
                                    style={styles.picker}
                                    onValueChange={(itemValue) => changeCategService(itemValue)}
                                    >
                                    <Picker.Item label="Categoria" value="none" />
                                    {categlist}
                            </Picker>

                            <ScrollView style={{width: '95%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#ccc', borderRadius: 10, padding: 10, display: listservicesdivdisplay, position: 'relative', marginBottom: 15, height: 300}}>
                                <Text style={styles.label2}>Serviços Selecionados ({numserviceselected})</Text>
                                {servicesselecteddom}
                            </ScrollView>
                        </View>

                        <ScrollView style={{marginTop: 20, height: 300}}>
                            <Text style={styles.label2}>Selecione os serviços prestados:</Text>
                            {servicelistcheckox}
                        </ScrollView>


                        <Pressable style={styles.btncon} onPress={() => validaServicesselected()}><Text style={{fontSize: 18, fontWeight: 'bold', color: '#fff', textTransform: 'capitalize'}}>Confirmar</Text></Pressable>
                    
                    </View>
                </View>
            </Modal>

            ):(
            <Text></Text>
            )}
            
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  image:{
    width: '90%',
    height: undefined,
    aspectRatio: 1,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  input:{
    backgroundColor: '#fff',
    height: 50,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
    fontWeight: 'bold',
    fontSize: 16
  },
  btncon:{
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    height: 60,
    backgroundColor: '#2e385e',
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  btnop: {
    width: '95%',
    marginLeft: 'auto',
    marginRight: 'auto',
    height: 45,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 15,
    borderRadius: 10
  },
  btnrg:{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '95%',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  btnselfie:{
    width: '100%',
    padding: 5,
    borderRadius: 10,
    backgroundColor: '#0a58ca',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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
  modalViewMSMS: {
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
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    maxHeight: '100%',
    height: '100%'
  },
  label: {
    color: '#fff',
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10
  },
  label2: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10
  },
  picker: {
    height: 25,
    width: '100%',
    backgroundColor: '#ccc',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20
  },
  checkbox: {
    margin: 8,
  }
});
