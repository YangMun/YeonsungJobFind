import React, { useState } from 'react';
import { 
View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert,
  Platform,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';

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
};

type CertificationFormNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProfileEditView'
>;

const CertificationForm = () => {
  const navigation = useNavigation<CertificationFormNavigationProp>();
  const { userId } = useAuth();
  const [certificationName, setCertificationName] = useState('');
  const [issuingOrganization, setIssuingOrganization] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [dateText, setDateText] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // '.' 대신 '-' 사용
  };

  const onChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = formatDate(selectedDate.toISOString());
      setDateText(formattedDate);
    }
  };

  const handleDateSelect = (day: DateData) => {
    const selectedDate = day.dateString;
    setDateText(formatDate(selectedDate));
    setShowCalendar(false);
  };

  const handleSubmit = async () => {
    // 입력값 검증
    if (!certificationName || !issuingOrganization || !dateText) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    try {
      const baseURL = Platform.select({
        ios: 'http://localhost:3000',
        android: 'http://10.0.2.2:3000',
        default: 'http://localhost:3000'
      });

      const response = await axios.post(`${baseURL}/api/save-certification`, {
        jobSeekerId: userId,
        certificationName,
        issuingOrganization,
        acquisitionDate: dateText
      });

      if (response.data.success) {
        Alert.alert('성공', '자격증 정보가 저장되었습니다.', [
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>자격증 추가</Text>
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
                [dateText.replace(/\./g, '-')]: {selected: true, selectedColor: '#4a90e2'}
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
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>추가</Text>
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
});

export default CertificationForm;
