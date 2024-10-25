import React, { useState, useEffect, useRef } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions, Pressable, TextInput, Image, SafeAreaView, ImageBackground, Modal, Alert, FlatList} from 'react-native';
import {db, Timestamp} from '../../firebase';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";
import { format, addHours } from 'date-fns';

export default function Cadprof({route}) {
    
    const professions = [
        'Advogado',
        'Açougueiro',
        'Administrador',
        'Agrônomo',
        'Alfaiate',
        'Almoxarife',
        'Analista de Sistemas',
        'Arquiteto',
        'Artista Plástico',
        'Assistente Social',
        'Atendente',
        'Auditor',
        'Bancário',
        'Barbeiro',
        'Barman',
        'Bibliotecário',
        'Biomédico',
        'Biólogo',
        'Cabeleireiro',
        'Caixa',
        'Caminhoneiro',
        'Carpinteiro',
        'Chef de Cozinha',
        'Cientista',
        'Cientista de Dados',
        'Comissário de Bordo',
        'Contador',
        'Cozinheiro',
        'Dentista',
        'Designer Gráfico',
        'Designer de Interiores',
        'Designer de Moda',
        'Economista',
        'Editor',
        'Eletricista',
        'Encanador',
        'Enfermeiro',
        'Engenheiro Civil',
        'Engenheiro de Produção',
        'Engenheiro Eletricista',
        'Engenheiro Mecânico',
        'Engenheiro Químico',
        'Esteticista',
        'Farmacêutico',
        'Fisioterapeuta',
        'Fotógrafo',
        'Garçom',
        'Gerente de Projetos',
        'Gestor de Recursos Humanos',
        'Guia de Turismo',
        'Instrutor de Autoescola',
        'Jardineiro',
        'Jornalista',
        'Juiz',
        'Lavador de Carros',
        'Mágico',
        'Marceneiro',
        'Mecânico',
        'Médico Cardiologista',
        'Médico Clínico Geral',
        'Médico Dermatologista',
        'Médico Ginecologista',
        'Médico Neurologista',
        'Médico Oftalmologista',
        'Médico Ortopedista',
        'Médico Pediatra',
        'Médico Psiquiatra',
        'Motorista',
        'Nutricionista',
        'Odontólogo',
        'Operador de Caixa',
        'Operador de Máquinas',
        'Padeiro',
        'Pedreiro',
        'Personal Trainer',
        'Pintor',
        'Policial',
        'Professor',
        'Programador',
        'Promotor de Vendas',
        'Psicólogo',
        'Recepcionista',
        'Representante Comercial',
        'Secretária',
        'Segurança',
        'Soldador',
        'Supervisor',
        'Taxista',
        'Telefonista',
        'Técnico de Enfermagem',
        'Técnico de Informática',
        'Técnico de Segurança do Trabalho',
        'Técnico Eletrônico',
        'Técnico em Edificações',
        'Técnico em Radiologia',
        'Terapeuta Ocupacional',
        'Tradutor',
        'Vendedor',
        'Veterinário',
        'Vigilante',
        'Zelador'
      ];

      const cad =async () =>{

        for(var i =0; i < professions.length; i++){
            const docRef = await addDoc(collection(db, "services"), {
                name: professions[i].toLocaleLowerCase()
            });
            console.log("Document written with ID: ", docRef.id);
        }

        
      }

  return (
    <SafeAreaView style={{height: '100%'}}>
        <Pressable onPress={() =>  cad()}><Text>Cadastrar</Text></Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

});
