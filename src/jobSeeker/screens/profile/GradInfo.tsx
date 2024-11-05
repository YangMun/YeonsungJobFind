import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Modal, Dimensions, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatDate, validateDate, validateGradInfo, GradInfoData, API_URL } from '../../../common/utils/validationUtils';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const GradInfo = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = useAuth();

  const mode = (route.params as { mode?: string })?.mode;
  const educationInfo = (route.params as { educationInfo?: any })?.educationInfo;

  const [isUniversityDropdownOpen, setIsUniversityDropdownOpen] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [isGraduationDropdownOpen, setIsGraduationDropdownOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(educationInfo?.universityType || '대학(2,3년)');
  const [selectedRegion, setSelectedRegion] = useState(educationInfo?.region || '지역 선택');
  const [selectedGraduation, setSelectedGraduation] = useState(educationInfo?.graduationStatus || '졸업예정');
  const [schoolName, setSchoolName] = useState(educationInfo?.schoolName || '');
  const [startDate, setStartDate] = useState(educationInfo?.admissionDate || '');
  const [endDate, setEndDate] = useState(educationInfo?.graduationDate || '');
  const [major, setMajor] = useState(educationInfo?.major || '');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [dropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('down');
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const universityDropdownRef = useRef<TouchableOpacity>(null);
  const regionDropdownRef = useRef<TouchableOpacity>(null);
  const graduationDropdownRef = useRef<TouchableOpacity>(null);

  const universityOptions = [
    '대학(2,3년)',
    '대학교(4년)',
    '대학원(석사)',
    '대학원(박사)'
  ];

  const regionOptions = [
    '지역 선택',
    '서울', '경기', '광주', '대구', '대전', '부산', '울산', '인천', '강원', '경남', '경북', '전남', '전북', '충남', '충북', '제주', '세종'
  ];

  const graduationOptions = [
    '졸업',
    '재학중',
    '휴학중',
    '수료',
    '중퇴',
    '자퇴',
    '졸업예정'
  ];

  const toggleDropdown = (type: 'university' | 'region' | 'graduation') => {
    const isOpen = type === 'university' ? isUniversityDropdownOpen : type === 'region' ? isRegionDropdownOpen : isGraduationDropdownOpen;
    const setIsOpen = type === 'university' ? setIsUniversityDropdownOpen : type === 'region' ? setIsRegionDropdownOpen : setIsGraduationDropdownOpen;
    const ref = type === 'university' ? universityDropdownRef : type === 'region' ? regionDropdownRef : graduationDropdownRef;

    if (!isOpen && ref.current) {
      const windowHeight = Dimensions.get('window').height;
      ref.current.measure((fx, fy, width, height, px, py) => {
        const adjustedPy = py - scrollOffset; // 스크롤 위치를 고려하여 조정
        const spaceBelow = windowHeight - adjustedPy - height;
        const direction = spaceBelow > 250 ? 'down' : 'up';
        setDropdownDirection(direction);
        
        if (direction === 'down') {
          setDropdownPosition({ top: adjustedPy + height, left: px, width: width });
        } else {
          setDropdownPosition({ top: adjustedPy - 250, left: px, width: width });
        }
      });
    }
    setIsOpen(!isOpen);
  };

  const selectOption = (type: 'university' | 'region' | 'graduation', option: string) => {
    if (type === 'university') {
      setSelectedUniversity(option);
      setIsUniversityDropdownOpen(false);
    } else if (type === 'region') {
      setSelectedRegion(option);
      setIsRegionDropdownOpen(false);
    } else {
      setSelectedGraduation(option);
      setIsGraduationDropdownOpen(false);
    }
  };

  const handleDateChange = (text: string, setter: (value: string) => void) => {
    // 숫자만 추출
    const numbers = text.replace(/[^0-9]/g, '');

    if (numbers.length <= 6) {
      if (numbers.length > 4) {
        const year = numbers.slice(0, 4);
        let month = numbers.slice(4);

        // 월 처리 로직
        if (month.length === 1) {
          // 한 자리 숫자일 경우 그대로 표시
          setter(`${year}.${month}`);
        } else if (month.length === 2) {
          const monthNum = parseInt(month);
          if (monthNum > 12) {
            // 12를 초과하는 경우 마지막 입력된 숫자만 사용
            month = month[1];
          }
          // 01~12 사이의 값으로 설정
          setter(`${year}.${month.padStart(2, '0')}`);
        }
      } else {
        setter(numbers);
      }
    }
  };

  const handleComplete = async () => {
    if (!userId) {
      Alert.alert('오류', '사용자 ID가 없습니다. 다시 로그인해 주세요.');
      return;
    }

    const gradInfoData: GradInfoData = {
      jobSeekerId: userId,
      universityType: selectedUniversity,
      schoolName: schoolName,
      region: selectedRegion,
      admissionDate: startDate,
      graduationDate: endDate,
      graduationStatus: selectedGraduation,
      major: major
    };

    const validationResult = validateGradInfo(gradInfoData);
    if (validationResult.isValid) {
      try {
        let response;
        response = await axios.post(`${API_URL}/api/save-grad-info`, gradInfoData);
        
        if (response.data.success) {
          console.log(mode === 'edit' ? "학력 정보가 성공적으로 수정되었습니다." : "학력 정보가 성공적으로 저장되었습니다.");
          navigation.goBack();
        } else {
          Alert.alert('오류', response.data.message);
        }
      } catch (error) {
        console.error('서버 오류:', error);
        Alert.alert('오류', '서버와의 통신 중 오류가 발생했습니다.');
      }
    } else {
      Alert.alert('입력 오류', validationResult.message);
    }
  };

  const handleDelete = async () => {
    if (!userId) {
      Alert.alert('오류', '사용자 ID가 없습니다. 다시 로그인해 주세요.');
      return;
    }

    Alert.alert(
      '학력 정보 삭제',
      '정말로 이 학력 정보를 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel'
        },
        {
          text: '삭제',
          onPress: async () => {
            try {
              const response = await axios.delete(`${API_URL}/api/delete-grad-info/${userId}`);
              if (response.data.success) {
                Alert.alert('성공', '학력 정보가 성공적으로 삭제되었습니다.');
                navigation.goBack();
              } else {
                Alert.alert('오류', response.data.message);
              }
            } catch (error) {
              console.error('서버 오류:', error);
              Alert.alert('오류', '서버와의 통신 중 오류가 발생했습니다.');
            }
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
        <Text style={styles.headerTitle}>{mode === 'edit' ? '학력사항 수정' : '학력사항 추가'}</Text>
      </View>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        onScroll={(event) => {
          setScrollOffset(event.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>대학 <Text style={styles.requiredText}>(필수)</Text></Text>
          <TouchableOpacity 
            ref={universityDropdownRef}
            style={styles.dropdown} 
            onPress={() => toggleDropdown('university')}
          >
            <Text>{selectedUniversity}</Text>
            <Ionicons name={isUniversityDropdownOpen ? "chevron-up" : "chevron-down"} size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>학교명 <Text style={styles.requiredText}>(필수)</Text></Text>
          <View style={styles.searchInput}>
            <TextInput 
              placeholder="대학교명 입력" 
              style={styles.input} 
              value={schoolName}
              onChangeText={setSchoolName}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>지역</Text>
          <TouchableOpacity 
            ref={regionDropdownRef}
            style={styles.dropdown} 
            onPress={() => toggleDropdown('region')}
          >
            <Text>{selectedRegion}</Text>
            <Ionicons name={isRegionDropdownOpen ? "chevron-up" : "chevron-down"} size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>재학기간 <Text style={styles.requiredText}>(필수)</Text></Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              placeholder="YYYY.MM"
              style={[styles.dateInput, !validateDate(startDate) && styles.invalidInput]}
              value={startDate}
              onChangeText={(text) => handleDateChange(text, setStartDate)}
              keyboardType="numeric"
              maxLength={7}
            />
            <Text style={styles.dateSeparator}>~</Text>
            <TextInput
              placeholder="YYYY.MM"
              style={[styles.dateInput, !validateDate(endDate) && styles.invalidInput]}
              value={endDate}
              onChangeText={(text) => handleDateChange(text, setEndDate)}
              keyboardType="numeric"
              maxLength={7}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>졸업여부 <Text style={styles.requiredText}>(필수)</Text></Text>
          <TouchableOpacity 
            ref={graduationDropdownRef}
            style={styles.dropdown}
            onPress={() => toggleDropdown('graduation')}
          >
            <Text>{selectedGraduation}</Text>
            <Ionicons name={isGraduationDropdownOpen ? "chevron-up" : "chevron-down"} size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>전공 <Text style={styles.requiredText}>(필수)</Text></Text>
          <View style={styles.textFieldContainer}>
            <TextInput
              style={styles.textField}
              placeholder="전공학과 입력"
              value={major}
              onChangeText={setMajor}
            />
          </View>
        </View>

        {/* 추가 공간을 위한 빈 View */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 고정된 하단 버튼 */}
      <View style={styles.bottomButtons}>
        {mode === 'edit' ? (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>삭제</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>작성완료</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isUniversityDropdownOpen || isRegionDropdownOpen || isGraduationDropdownOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => {
          setIsUniversityDropdownOpen(false);
          setIsRegionDropdownOpen(false);
          setIsGraduationDropdownOpen(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setIsUniversityDropdownOpen(false);
            setIsRegionDropdownOpen(false);
            setIsGraduationDropdownOpen(false);
          }}
        >
          <View style={[
            styles.dropdownOptions,
            { 
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width
            }
          ]}>
            <View style={[
              styles.dropdownArrow,
              dropdownDirection === 'down' ? styles.dropdownArrowUp : styles.dropdownArrowDown
            ]} />
            <ScrollView style={styles.optionsScrollView}>
              {(isUniversityDropdownOpen ? universityOptions :
                isRegionDropdownOpen ? regionOptions :
                isGraduationDropdownOpen ? graduationOptions : []).map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownOption,
                    (isUniversityDropdownOpen && option === selectedUniversity) ||
                    (isRegionDropdownOpen && option === selectedRegion) ||
                    (isGraduationDropdownOpen && option === selectedGraduation)
                      ? styles.selectedOption
                      : null
                  ]}
                  onPress={() => selectOption(
                    isUniversityDropdownOpen ? 'university' :
                    isRegionDropdownOpen ? 'region' : 'graduation',
                    option
                  )}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    (isUniversityDropdownOpen && option === selectedUniversity) ||
                    (isRegionDropdownOpen && option === selectedRegion) ||
                    (isGraduationDropdownOpen && option === selectedGraduation)
                      ? styles.selectedOptionText
                      : null
                  ]}>
                    {option}
                  </Text>
                  {((isUniversityDropdownOpen && option === selectedUniversity) ||
                    (isRegionDropdownOpen && option === selectedRegion) ||
                    (isGraduationDropdownOpen && option === selectedGraduation)) && (
                    <Ionicons name="checkmark" size={24} color="#007AFF" style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  content: {
    flex: 1,
    marginBottom: 70,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  requiredText: {
    color: 'red',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
  },
  input: {
    flex: 1,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    width: '45%',
  },
  dateSeparator: {
    fontSize: 18,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownOptions: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 10,
    maxHeight: 250, // 드롭다운의 최대 높이를 250px로 제한합니다.
  },
  dropdownArrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
  },
  dropdownArrowUp: {
    top: -10,
    borderBottomColor: '#fff',
  },
  dropdownArrowDown: {
    bottom: -10,
    transform: [{ rotate: '180deg' }],
    borderBottomColor: '#fff',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  dropdownOptionText: {
    marginLeft: 8,
    fontSize: 16,
  },
  optionsScrollView: {
    maxHeight: 300,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1, 
    borderColor: '#007AFF', 
    borderRadius: 5, 
    marginRight: 8, 
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  textFieldContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  textField: {
    padding: 12,
    fontSize: 16,
  },
  invalidInput: {
    borderColor: '#e0e0e0'
  },
  deleteButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 5,
    marginRight: 8,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedOption: {
    backgroundColor: '#F0F0F0',
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  checkIcon: {
    position: 'absolute',
    right: 12,
  },
});

export default GradInfo;
