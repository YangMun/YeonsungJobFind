import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Modal, Alert, Platform} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { formatExperienceDate, ActivityItem, API_URL } from '../../../common/utils/validationUtils';

type RootStackParamList = {
  ProfileEditView: undefined;
  ExperienceActivityEducationForm: { mode: 'add' | 'edit'; activity?: ActivityItem };
};

type ExperienceActivityEducationFormNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ExperienceActivityEducationForm'
>;

const ExperienceActivityEducationForm = () => {
  const navigation = useNavigation<ExperienceActivityEducationFormNavigationProp>();
  const route = useRoute();
  const { userId } = useAuth();
  const [activityType, setActivityType] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [organization, setOrganization] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [activityId, setActivityId] = useState<number | null>(null);

  const { mode, activity } = route.params as { mode: 'add' | 'edit'; activity?: ActivityItem };

  useEffect(() => {
    if (mode === 'edit' && activity) {
      setActivityType(activity.activity_type);
      setOrganization(activity.organization);
      setStartDate(activity.start_date);
      setEndDate(activity.end_date);
      setDescription(activity.description);
      setActivityId(activity.id);
    }
  }, [mode, activity]);

  const activityTypes = [
    '교내활동', '인턴', '자원봉사', '동아리', '아르바이트', 
    '사회활동', '수행과제', '해외연수'
  ];

  const handleOrganizationChange = (text: string) => {
    if (text.length <= 20) {
      setOrganization(text);
    }
  };

  const handleDescriptionChange = (text: string) => {
    if (text.length <= 270) {
      setDescription(text);
    }
  };

  const handleSubmit = async () => {
    if (!activityType || !organization || !startDate || !endDate || !description) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    try {
      let response;
      if (mode === 'add') {
        response = await axios.post(`${API_URL}/api/save-experience-activity`, {
          jobSeekerId: userId,
          activityType,
          organization,
          startDate,
          endDate,
          description
        });
      } else {
        response = await axios.put(`${API_URL}/api/update-experience-activity/${activityId}`, {
          jobSeekerId: userId,
          activityType,
          organization,
          startDate,
          endDate,
          description
        });
      }

      if (response.data.success) {
        Alert.alert('성공', `경험/활동/교육 정보가 ${mode === 'add' ? '저장' : '수정'}되었습니다.`);
        navigation.goBack();
      } else {
        Alert.alert('오류', response.data.message);
      }
    } catch (error) {
      console.error('API 요청 오류:', error);
      Alert.alert('오류', '서버 오류가 발생했습니다.');
    }
  };

  const handleStartDateChange = (text: string) => {
    const formattedDate = formatExperienceDate(text);
    setStartDate(formattedDate);
  };

  const handleEndDateChange = (text: string) => {
    const formattedDate = formatExperienceDate(text);
    setEndDate(formattedDate);
  };

  const handleDelete = async () => {
    try {

      Alert.alert(
        '삭제 확인',
        '이 활동을 삭제하시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel'
          },
          {
            text: '삭제',
            style: 'destructive',
            onPress: async () => {
              const response = await axios.delete(
                `${API_URL}/api/delete-experience-activity/${activityId}/${userId}`
              );
              if (response.data.success) {
                Alert.alert('성공', '활동이 삭제되었습니다.');
                navigation.goBack();
              } else {
                Alert.alert('오류', response.data.message);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('API 요청 오류:', error);
      Alert.alert('오류', '서버 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {mode === 'add' ? '경험/활동/교육 추가' : '경험/활동/교육 수정'}
        </Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.label}>활동구분 선택</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Text style={styles.dropdownButtonText}>
            {activityType || '활동구분 선택'}
          </Text>
          <Ionicons
            name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#000"
          />
        </TouchableOpacity>

        <Modal
          visible={isDropdownOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsDropdownOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIsDropdownOpen(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.dropdownList}>
                <ScrollView>
                  {activityTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setActivityType(type);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{type}</Text>
                      {activityType === type && (
                        <MaterialIcons name="check" size={24} color="#4a90e2" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        <Text style={styles.label}>기관/장소</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={organization}
            onChangeText={handleOrganizationChange}
            placeholder="기관/장소를 입력하세요"
            maxLength={20}
          />
          <Text style={styles.charCount}>{organization.length}/20자</Text>
        </View>

        <Text style={styles.label}>활동기록</Text>
        <View style={styles.dateInputContainer}>
          <TextInput
            style={styles.dateInput}
            value={startDate}
            onChangeText={handleStartDateChange}
            placeholder="YYYYMM"
            keyboardType="numeric"
            maxLength={7}
          />
          <Text style={styles.dateSeparator}>~</Text>
          <TextInput
            style={styles.dateInput}
            value={endDate}
            onChangeText={handleEndDateChange}
            placeholder="YYYYMM"
            keyboardType="numeric"
            maxLength={7}
          />
        </View>

        <Text style={styles.label}>활동내역</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={handleDescriptionChange}
            placeholder="활동내역을 입력하세요"
            multiline
            numberOfLines={4}
            maxLength={270}
          />
          <Text style={styles.charCount}>{description.length}/500자</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        {mode === 'edit' ? (
          <TouchableOpacity style={[styles.cancelButton, { backgroundColor: '#ff4444' }]} onPress={handleDelete}>
            <Text style={[styles.cancelButtonText, { color: '#fff' }]}>삭제</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{mode === 'add' ? '추가' : '수정'}</Text>
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    flex: 1,
    padding: 8,
    fontSize: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  activeDateButton: {
    backgroundColor: '#4a90e2',
  },
  dateButtonText: {
    color: '#000',
  },
  activeDateButtonText: {
    color: '#fff',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
  },
  dateSeparator: {
    paddingHorizontal: 8,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#4a90e2',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  dropdownButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    padding: 8,
    fontSize: 16,
  },
  charCount: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
    marginRight: 8,
    marginBottom: 4,
  },
});

export default ExperienceActivityEducationForm;
