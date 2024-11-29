import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert, AppState, AppStateStatus, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { API_URL, validateCareerSections } from '../../../common/utils/validationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { requestClaudeResponse } from '../../utils/ClaudeUtils'
import { AiHelpModal } from '../../components/AiHelpModal';

type RootStackParamList = {
  ProfileEditView: { updatedCareerText: string } | undefined;
  MyCareerEditView: { initialCareerText: string };
};

type MyCareerEditViewRouteProp = RouteProp<RootStackParamList, 'MyCareerEditView'>;

type CareerSection = {
  title: string;
  text: string;
};

const MyCareerEditView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<MyCareerEditViewRouteProp>();
  const { userId } = useAuth();
  const [careerSections, setCareerSections] = useState<CareerSection[]>([
    { title: "성장과정", text: "" },
    { title: "성격(장단점)", text: "" },
    { title: "지원동기", text: "" },
    { title: "입사 후 포부", text: "" },
    { title: "경력사항", text: "" },
  ]);
  const [isDeleteDisabled, setIsDeleteDisabled] = useState(true);
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);
  const [aiInputText, setAiInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        // 1. 먼저 임시저장된 데이터가 있는지 확인
        const tempDataString = await AsyncStorage.getItem(`@temp_career_${userId}`);
        if (tempDataString) {
          const tempData = JSON.parse(tempDataString);
          // 임시저장 데이터가 비어있는지 확인
          const hasContent = tempData.sections.some((section: CareerSection) => section.text.trim().length > 0);
          
          if (!hasContent) {
            // 임시저장 데이터가 비어으면 삭제하고 서버 데이터 로드
            await AsyncStorage.removeItem(`@temp_career_${userId}`);
            if (route.params?.initialCareerText) {
              loadInitialContent();
            }
            return;
          }

          const tempTimestamp = new Date(tempData.timestamp);
          const now = new Date();
          const hoursDiff = (now.getTime() - tempTimestamp.getTime()) / (1000 * 60 * 60);

          // 임시저장된 데이터가 24시간 이내인 경우
          if (hoursDiff < 24) {
            // 2. 임시저장 데이터가 있다면, 사용자에게 선택권 제공
            Alert.alert(
              '임시저장된 내용 발견',
              '이전에 임시저장된 내용이 있습니다. 불러오시겠습니까?',
              [
                {
                  text: '아니오',
                  onPress: () => {
                    // 기존 서버 데이터 사용
                    if (route.params?.initialCareerText) {
                      loadInitialContent();
                    }
                    // 임시저장 데이터 삭제
                    AsyncStorage.removeItem(`@temp_career_${userId}`);
                  },
                  style: 'cancel'
                },
                {
                  text: '예',
                  onPress: () => {
                    // 임시저장 데이터 사용
                    setCareerSections(tempData.sections);
                  }
                }
              ]
            );
            return;
          }
        }

        // 3. 임시저장 데이터가 없거나 24시간이 지났다면 서버 데이터 사용
        if (route.params?.initialCareerText) {
          loadInitialContent();
        }
      } catch (error) {
        console.error('데이터 로드 오류:', error);
        if (route.params?.initialCareerText) {
          loadInitialContent();
        }
      }
    };

    const loadInitialContent = () => {
      const sections = route.params.initialCareerText.split('\n\n');
      const updatedSections = [...careerSections];
      
      sections.forEach(section => {
        const match = section.match(/\[(.*?)\]\n(.*)/s);
        if (match) {
          const [, title, content] = match;
          const index = careerSections.findIndex(s => s.title === title);
          if (index !== -1) {
            updatedSections[index].text = content;
          }
        }
      });
      
      setCareerSections(updatedSections);
    };

    loadContent();
  }, []);

  useEffect(() => {
    const isEmpty = careerSections.every(section => section.text.trim().length === 0);
    setIsDeleteDisabled(isEmpty);
  }, [careerSections]);

  const handleSave = async () => {
    try {
      const validationResult = validateCareerSections(careerSections);
      if (!validationResult.isValid) {
        Alert.alert('입력 오류', validationResult.message);
        return;
      }

      const endpoint = route.params?.initialCareerText 
        ? `${API_URL}/api/update-career-statement/${userId}`
        : `${API_URL}/api/save-career-statement`;
      
      const method = route.params?.initialCareerText ? 'put' : 'post';
      
      const response = await axios({
        method,
        url: endpoint,
        data: {
          jobSeekerId: userId,
          growthProcess: careerSections[0].text,
          personality: careerSections[1].text,
          motivation: careerSections[2].text,
          aspiration: careerSections[3].text,
          careerHistory: careerSections[4].text
        }
      });

      if (response.data.success) {
        Alert.alert(
          route.params?.initialCareerText ? '수정 완료' : '저장 완료',
          route.params?.initialCareerText ? '자기소개서가 수정되었습니다.' : '자기소개서가 저장되었습니다.',
          [
            {
              text: '확인',
              onPress: () => {
                const combinedText = careerSections
                  .map(section => `[${section.title}]\n${section.text}`)
                  .join('\n\n');
                navigation.navigate('ProfileEditView', { updatedCareerText: combinedText });
              }
            }
          ]
        );
      } else {
        Alert.alert('저장 실패', response.data.message);
      }
    } catch (error) {
      console.error('API 오류:', error);
      Alert.alert('오류', '자기소개서 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (isDeleteDisabled) return;

    Alert.alert(
      "삭제 확인",
      "정말로 모든 내용을 제하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel"
        },
        { 
          text: "삭제", 
          onPress: async () => {
            try {
              const response = await axios.delete(`${API_URL}/api/delete-career-statement/${userId}`);
              
              if (response.data.success) {
                const clearedSections = careerSections.map(section => ({
                  ...section,
                  text: ""
                }));
                setCareerSections(clearedSections);
                navigation.navigate('ProfileEditView', { updatedCareerText: '' });
              } else {
                Alert.alert('삭제 실패', response.data.message);
              }
            } catch (error) {
              console.error('API 오류:', error);
              Alert.alert('오류', '자소개서 삭제 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  const updateSectionText = (index: number, newText: string) => {
    if (newText.length <= 500) {
      const updatedSections = [...careerSections];
      updatedSections[index] = {
        ...updatedSections[index],
        text: newText
      };
      setCareerSections(updatedSections);
      autoSaveTempData();
    }
  };

  const handleTempSave = async () => {
    try {
      const tempData = {
        sections: careerSections,
        timestamp: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(`@temp_career_${userId}`, JSON.stringify(tempData));
      
      Alert.alert(
        '임시저장 완료',
        '작성하신 내용이 임시저장되었습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('임시저장 오류:', error);
      Alert.alert('오류', '임시저장 중 문제가 발생했습니다.');
    }
  };

  const autoSaveTempData = async () => {
    try {
      const tempData = {
        sections: careerSections,
        timestamp: new Date().toISOString()
      };
      await AsyncStorage.setItem(`@temp_career_${userId}`, JSON.stringify(tempData));
    } catch (error) {
      console.error('자동 임시저장 오류:', error);
    }
  };

  useEffect(() => {
    const autoSaveInterval = setInterval(autoSaveTempData, 60000);
    return () => clearInterval(autoSaveInterval);
  }, [careerSections]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        autoSaveTempData();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [careerSections]);

  const handleAiHelp = (sectionIndex: number) => {
    setSelectedSectionIndex(sectionIndex);
    setIsAiModalVisible(true);
  };

  const handleAiSubmit = async () => {
    if (selectedSectionIndex === null || !aiInputText.trim()) {
      Alert.alert('입력 오류', '요청할 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const section = careerSections[selectedSectionIndex];
      const response = await requestClaudeResponse(aiInputText, section.title);

      if (response.success && response.data) {
        updateSectionText(selectedSectionIndex, response.data);
        setIsAiModalVisible(false);
        setAiInputText('');
      } else {
        Alert.alert('오류', response.error || '요청 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('AI 요청 오류:', error);
      Alert.alert('오류', 'AI 요청 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>자기소개서</Text>
        <TouchableOpacity 
          style={styles.tempSaveButton} 
          onPress={handleTempSave}
        >
          <Text style={styles.tempSaveText}>임시저장</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        {careerSections.map((section, index) => (
          <View key={index} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.characterCount}>{section.text.length}/500자</Text>
            </View>
            <TextInput
              style={styles.careerInput}
              multiline
              placeholder={`${section.title}을(를) 입력하세요`}
              value={section.text}
              onChangeText={(text) => updateSectionText(index, text)}
              maxLength={500}
            />
            <TouchableOpacity 
              style={styles.aiHelpButton}
              onPress={() => handleAiHelp(index)}
            >
              <MaterialIcons name="add" size={16} color="#4a90e2" />
              <Text style={styles.aiHelpText}>AI 도움받기</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        {route.params?.initialCareerText && (
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
        )}
        <TouchableOpacity 
          style={[
            styles.footerButton, 
            styles.saveButton,
            !route.params?.initialCareerText && styles.fullWidthButton
          ]} 
          onPress={handleSave}
        >
          <Text style={[styles.footerButtonText, styles.saveButtonText]}>
            {route.params?.initialCareerText ? '수정하기' : '작성완료'}
          </Text>
        </TouchableOpacity>
      </View>
      {selectedSectionIndex !== null && (
        <AiHelpModal
          visible={isAiModalVisible}
          onClose={() => setIsAiModalVisible(false)}
          sectionTitle={careerSections[selectedSectionIndex].title}
          inputText={aiInputText}
          onInputChange={setAiInputText}
          onSubmit={handleAiSubmit}
          isLoading={isLoading}
          currentSectionText={careerSections[selectedSectionIndex].text}
        />
      )}
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
  tempSaveButton: {
    padding: 8,
  },
  tempSaveText: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
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
    marginBottom: 8,
  },
  aiHelpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#f0f8ff',
  },
  aiHelpText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '500',
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
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  deleteButtonText: {
    color: '#ff3b30',
  },
  saveButton: {
    backgroundColor: '#4a90e2',
  },
  saveButtonText: {
    color: '#fff',
  },
  fullWidthButton: {
    flex: 2,
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