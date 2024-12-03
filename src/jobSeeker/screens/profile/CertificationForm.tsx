import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import { Certification, API_URL } from '../../../common/utils/validationUtils';

// 한국어 설정
LocaleConfig.locales['kr'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
};
LocaleConfig.defaultLocale = 'kr';

type RootStackParamList = {
  ProfileEditView: undefined;
  CertificationForm: {
    mode: 'add' | 'edit';
    certification?: Certification;
  };
};

type CertificationFormNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CertificationForm'
>;

const CertificationForm = () => {
  const navigation = useNavigation<CertificationFormNavigationProp>();
  const route = useRoute();
  const { mode, certification } = route.params as { 
    mode: 'add' | 'edit';
    certification?: Certification;
  };
  const { userId } = useAuth();

  // 초기값 설정
  const [certificationName, setCertificationName] = useState(
    certification?.certification_name || ''
  );
  const [issuingOrganization, setIssuingOrganization] = useState(
    certification?.issuing_organization || ''
  );
  const [dateText, setDateText] = useState(
    certification?.acquisition_date || ''
  );
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateSelect = (day: DateData) => {
    setDateText(day.dateString);
    setShowCalendar(false);
  };

  const handleSubmit = async () => {
    if (!certificationName || !issuingOrganization || !dateText) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    try {
      const endpoint = mode === 'add' 
        ? '/api/save-certification'
        : '/api/update-certification';

      const payload = {
        jobSeekerId: userId,
        certificationName,
        issuingOrganization,
        acquisitionDate: dateText,
        ...(mode === 'edit' && { certificationId: certification?.id })
      };

      const response = await axios.post(`${API_URL}${endpoint}`, payload);

      if (response.data.success) {
        Alert.alert('성공', `자격증 정보가 ${mode === 'add' ? '저장' : '수정'}되었습니다.`, [
          {
            text: '확인',
            onPress: () => navigation.goBack()
          }
        ]);
      } else {
        Alert.alert('오류', response.data.message);
      }
    } catch (error) {
      console.error('API 요청 오류:', error);
      Alert.alert('오류', '서버 오류가 발생했습니다.');
    }
  };

  // 삭제 핸들러 추가
  const handleDelete = async () => {
    try {
      Alert.alert(
        '삭제 확인',
        '정말로 이 자격증을 삭제하시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel'
          },
          {
            text: '삭제',
            style: 'destructive',
            onPress: async () => {
              try {
                const response = await axios.delete(
                  `${API_URL}/api/delete-certification/${certification?.id}/${userId}`
                );

                if (response.data.success) {
                  Alert.alert('성공', '자격증이 삭제되었습니다.', [
                    {
                      text: '확인',
                      onPress: () => navigation.goBack()
                    }
                  ]);
                }
              } catch (error) {
                console.error('API 요청 오류:', error);
                Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('삭제 처리 오류:', error);
      Alert.alert('오류', '삭제 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'add' ? '자격증 추가' : '자격증 수정'}
        </Text>
      </View>

      <View style={styles.mainContainer}>
        <ScrollView style={styles.content}>
          <Text style={styles.label}>자격증명</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={certificationName}
              onChangeText={setCertificationName}
              placeholder="자격증명을 입력하세요"
              maxLength={50}
            />
          </View>

          <Text style={styles.label}>발행처/기관</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={issuingOrganization}
              onChangeText={setIssuingOrganization}
              placeholder="발행처/기관을 입력하세요"
              maxLength={50}
            />
          </View>

          <Text style={styles.label}>취득일</Text>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Text style={[
              styles.dateText,
              !dateText && styles.placeholderText
            ]}>
              {dateText || '취득일을 선택하세요'}
            </Text>
            <Ionicons name="calendar-outline" size={24} color="#666" />
          </TouchableOpacity>

          {showCalendar && (
            <Calendar
              onDayPress={handleDateSelect}
              maxDate={new Date().toISOString().split('T')[0]}
              monthFormat={'yyyy년 MM월'}
              markedDates={{
                [dateText]: {selected: true, selectedColor: '#4a90e2'}
              }}
              theme={{
                selectedDayBackgroundColor: '#4a90e2',
                todayTextColor: '#4a90e2',
                arrowColor: '#4a90e2',
                textMonthFontSize: 16,
                textMonthFontWeight: 'bold',
                textDayFontSize: 14,
                textDayFontWeight: '400',
              }}
            />
          )}
        </ScrollView>

        <View style={styles.footer}>
          {mode === 'edit' ? (
            <TouchableOpacity 
              style={[styles.cancelButton, styles.deleteButton]} 
              onPress={handleDelete}
            >
              <Text style={[styles.cancelButtonText, styles.deleteButtonText]}>삭제</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {mode === 'add' ? '추가' : '수정'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
  },
  input: {
    padding: 8,
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a90e2',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  deleteButtonText: {
    color: 'white',
  },
});

export default CertificationForm;
