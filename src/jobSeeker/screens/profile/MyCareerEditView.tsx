import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  ProfileEditView: { updatedCareerText: string } | undefined;
  MyCareerEditView: { initialCareerText: string };
};

type MyCareerEditViewRouteProp = RouteProp<RootStackParamList, 'MyCareerEditView'>;

const MyCareerEditView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<MyCareerEditViewRouteProp>();
  const [careerText, setCareerText] = useState(route.params?.initialCareerText || '');
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);

  useEffect(() => {
    setIsDeleteDisabled(careerText.trim().length === 0);
  }, [careerText]);

  const handleSave = () => {
    navigation.navigate('ProfileEditView', { updatedCareerText: careerText });
  };

  const handleDelete = () => {
    if (isDeleteDisabled) return;

    Alert.alert(
      "삭제 확인",
      "정말로 내용을 삭제하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel"
        },
        { 
          text: "삭제", 
          onPress: () => {
            setCareerText('');
            navigation.navigate('ProfileEditView', { updatedCareerText: '' });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My career</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>커리어 소개와 핵심역량을 입력해보세요</Text>
        <TextInput
          style={styles.careerInput}
          multiline
          placeholder="커리어 정보 입력"
          value={careerText}
          onChangeText={setCareerText}
        />
        <Text style={styles.characterCount}>{careerText.length}/270자</Text>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.footerButton, 
            styles.deleteButton,
            isDeleteDisabled && styles.disabledButton
          ]} 
          onPress={handleDelete}
          disabled={isDeleteDisabled}
        >
          <Text style={[
            styles.footerButtonText, 
            styles.deleteButtonText,
            isDeleteDisabled && styles.disabledButtonText
          ]}>삭제</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerButton, styles.saveButton]} onPress={handleSave}>
          <Text style={[styles.footerButtonText, styles.saveButtonText]}>작성완료</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  careerInput: {
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4a90e2',
  },
  saveButtonText: {
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  deleteButtonText: {
    color: '#ff3b30',
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
    borderColor: '#d0d0d0',
  },
  disabledButtonText: {
    color: '#a0a0a0',
  },
});

export default MyCareerEditView;
