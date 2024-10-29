import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, SafeAreaView, Platform } from 'react-native';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import { validatePostJob, API_URL } from '../../common/utils/validationUtils';
import axios from 'axios';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';  // 이 줄을 추가하세요

// LocaleConfig 설정은 PostJobScreen과 동일

type EditJobScreenRouteProp = RouteProp<RootStackParamList, 'EditJob'>;
type EditJobScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditJob'>;

type Props = {
  route: EditJobScreenRouteProp;
  navigation: EditJobScreenNavigationProp;
};

const EditJobScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params;
  const scrollViewRef = useRef<ScrollView>(null);

  const [title, setTitle] = useState('');
  const [contents, setContents] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [qualificationType, setQualificationType] = useState('');
  const [workPeriodStart, setWorkPeriodStart] = useState('');
  const [workPeriodEnd, setWorkPeriodEnd] = useState('');
  const [recruitmentDeadline, setRecruitmentDeadline] = useState('');
  const [hourlyWage, setHourlyWage] = useState('');
  const [applicationMethod, setApplicationMethod] = useState('');
  const [contactNumber1, setContactNumber1] = useState('');
  const [contactNumber2, setContactNumber2] = useState('');
  const [contactNumber3, setContactNumber3] = useState('');

  const [showWorkPeriodCalendar, setShowWorkPeriodCalendar] = useState(false);
  const [showRecruitmentDeadlineCalendar, setShowRecruitmentDeadlineCalendar] = useState(false);

  const maxLengths = {
    title: 30,
    contents: 500,
    companyName: 15,
    location: 15,
    hourlyWage: 10,
    applicationMethod: 15,
  };

  // 날짜 포맷팅 함수 추가
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 반환
  };

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/job-detail/${jobId}`);
        if (response.data.success) {
          const job = response.data.job;
          setTitle(job.title);
          setContents(job.contents);
          setCompanyName(job.company_name);
          setLocation(job.location);
          setQualificationType(job.qualification_type);
          setWorkPeriodStart(formatDate(job.work_period_start));
          setWorkPeriodEnd(formatDate(job.work_period_end));
          setRecruitmentDeadline(formatDate(job.recruitment_deadline));
          setHourlyWage(job.hourly_wage.toString());
          setApplicationMethod(job.application_method);
          const [num1, num2, num3] = job.contact_number.split('-');
          setContactNumber1(num1);
          setContactNumber2(num2);
          setContactNumber3(num3);
        }
      } catch (error) {
        console.error('API 요청 오류:', error);
        Alert.alert('오류', '공고 정보를 불러오는데 실패했습니다.');
      }
    };

    fetchJobDetail();
  }, [jobId]);

  const renderInputWithCounter = (value: string, setValue: (text: string) => void, placeholder: string, maxLength: number, multiline: boolean = false) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={(text) => setValue(text.slice(0, maxLength))}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
      <Text style={styles.counter}>{`${value.length}/${maxLength}`}</Text>
    </View>
  );

  const handleSubmit = async () => {
    const fullContactNumber = `${contactNumber1}-${contactNumber2}-${contactNumber3}`;
    const editJobData = {
      title,
      contents,
      companyName,
      location,
      qualificationType,
      workPeriodStart,
      workPeriodEnd,
      recruitmentDeadline,
      hourlyWage,
      applicationMethod,
      contactNumber: fullContactNumber,
    };

    const validationResult = validatePostJob(editJobData);

    if (validationResult.isValid) {
      try {
        const response = await axios.put(`${API_URL}/api/update-job/${jobId}`, editJobData);
        if (response.data.success) {
          Alert.alert('성공', '구인 공고가 성공적으로 수정되었습니다.');
          navigation.goBack();
        } else {
          Alert.alert('오류', response.data.message);
        }
      } catch (error) {
        console.error('API 요청 오류:', error);
        Alert.alert('오류', '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.');
      }
    } else {
      Alert.alert('입력 오류', validationResult.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>구인 공고 수정</Text>
        
        <Text style={styles.label}>공고 제목</Text>
        {renderInputWithCounter(title, setTitle, "공고 제목을 입력하세요", maxLengths.title)}

        <Text style={styles.label}>상세 내용</Text>
        {renderInputWithCounter(contents, setContents, "상세 내용을 입력하세요", maxLengths.contents, true)}

        <Text style={styles.label}>회사명</Text>
        {renderInputWithCounter(companyName, setCompanyName, "회사명을 입력하세요", maxLengths.companyName)}

        <Text style={styles.label}>근무 위치</Text>
        {renderInputWithCounter(location, setLocation, "근무 위치를 입력하세요", maxLengths.location)}

        <Text style={styles.label}>지원 자격</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, qualificationType === '근로 장학생' && styles.selectedButton]}
            onPress={() => setQualificationType('근로 장학생')}
          >
            <Text style={styles.buttonText}>근로 장학생</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, qualificationType === '교비' && styles.selectedButton]}
            onPress={() => setQualificationType('교비')}
          >
            <Text style={styles.buttonText}>교비</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>근무 기간</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowWorkPeriodCalendar(!showWorkPeriodCalendar)}>
          <Text>{workPeriodStart ? `${workPeriodStart} ~ ${workPeriodEnd}` : '근무 기간을 선택하세요'}</Text>
        </TouchableOpacity>
        {showWorkPeriodCalendar && (
          <Calendar
            onDayPress={(day: DateData) => {
              if (!workPeriodStart || (workPeriodStart && workPeriodEnd)) {
                setWorkPeriodStart(day.dateString);
                setWorkPeriodEnd('');
              } else {
                setWorkPeriodEnd(day.dateString);
                setShowWorkPeriodCalendar(false);
              }
            }}
            markedDates={{
              [workPeriodStart]: {startingDay: true, color: '#4a90e2', textColor: 'white'},
              [workPeriodEnd]: {endingDay: true, color: '#4a90e2', textColor: 'white'}
            }}
            markingType={'period'}
          />
        )}

        <Text style={styles.label}>모집 기한</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowRecruitmentDeadlineCalendar(!showRecruitmentDeadlineCalendar)}>
          <Text>{recruitmentDeadline || '모집 기한을 선택하세요'}</Text>
        </TouchableOpacity>
        {showRecruitmentDeadlineCalendar && (
          <Calendar
            onDayPress={(day: DateData) => {
              setRecruitmentDeadline(day.dateString);
              setShowRecruitmentDeadlineCalendar(false);
            }}
            markedDates={{
              [recruitmentDeadline]: {selected: true, selectedColor: '#4a90e2'}
            }}
          />
        )}

        <Text style={styles.label}>시급</Text>
        <TextInput
          style={styles.input}
          value={hourlyWage}
          onChangeText={setHourlyWage}
          placeholder="시급을 입력하세요"
          keyboardType="numeric"
        />

        <Text style={styles.label}>지원 방법</Text>
        {renderInputWithCounter(applicationMethod, setApplicationMethod, "지원 방법을 입력하세요", maxLengths.applicationMethod)}

        <Text style={styles.label}>연락처</Text>
        <View style={styles.phoneInputContainer}>
          <TextInput
            style={styles.phoneInput}
            value={contactNumber1}
            onChangeText={setContactNumber1}
            placeholder="010"
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.phoneSeparator}>-</Text>
          <TextInput
            style={styles.phoneInput}
            value={contactNumber2}
            onChangeText={setContactNumber2}
            placeholder="1234"
            keyboardType="numeric"
            maxLength={4}
          />
          <Text style={styles.phoneSeparator}>-</Text>
          <TextInput
            style={styles.phoneInput}
            value={contactNumber3}
            onChangeText={setContactNumber3}
            placeholder="5678"
            keyboardType="numeric"
            maxLength={4}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>공고 수정</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // PostJobScreen과 동일한 스타일
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  counter: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    fontSize: 12,
    color: '#888',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#4a90e2',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  dateButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    textAlign: 'center',
  },
  phoneSeparator: {
    paddingHorizontal: 5,
    fontSize: 18,
  },
});

export default EditJobScreen;