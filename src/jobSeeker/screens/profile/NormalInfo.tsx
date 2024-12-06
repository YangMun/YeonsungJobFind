import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Image, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { pickImage } from '../../../common/utils/imagePickerUtils';
import { validateNormalInfo, API_URL } from '../../../common/utils/validationUtils';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { Picker } from '@react-native-picker/picker'; // Picker 컴포넌트 추가 설치 필요

const emailDomains = ['gmail.com', 'naver.com', 'daum.net', 'yahoo.com'];

const NormalInfo = () => {
  const navigation = useNavigation();
  const { userId } = useAuth();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [emailLocal, setEmailLocal] = useState('');
  const [emailDomain, setEmailDomain] = useState(emailDomains[0]);
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    setEmail(`${emailLocal}@${emailDomain}`);
  }, [emailLocal, emailDomain]);

  useEffect(() => {
    if (userId) {
      fetchNormalInfo();
    }
  }, [userId]);

  const fetchNormalInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/get-normal-info/${userId}`);
      if (response.data.success) {
        const info = response.data.info;
        setName(info.name);
        setBirthDate(info.birthDate);
        setEmail(info.email);
        setPhone(info.phone.replace(/-/g, '')); // 하이픈 제거
        setGender(info.gender);
        setProfileImage(info.image ? `${API_URL}/api/uploads/${info.image}` : null);
      }
    } catch (error) {
      console.error('기본 정보 조회 오류:', error);
    }
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 3) return email;
    return `${localPart.slice(0, 3)}${'*'.repeat(localPart.length - 3)}@${domain}`;
  };

  const maskPhone = (phone: string) => {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3');
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleImagePick = async () => {
    const imageUri = await pickImage();
    if (imageUri) {
      setProfileImage(imageUri);
    }
  };

  const handleSave = async () => {
    const validationResult = validateNormalInfo({
      name,
      birthDate,
      email,
      phone
    });

    if (!validationResult.isValid) {
      Alert.alert('입력 오류', validationResult.message);
      return;
    }

    if (!userId) {
      Alert.alert('오류', '사용자 ID가 없습니다. 다시 로그인해 주세요.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('jobSeekerId', userId.toString());
      formData.append('name', name);
      formData.append('birthDate', birthDate);
      formData.append('email', email);
      formData.append('phone', phone.replace(/-/g, '')); // 하이픈 제거
      formData.append('gender', gender);

      if (profileImage && !profileImage.startsWith('http')) {
        const imageUriParts = profileImage.split('.');
        const imageType = imageUriParts[imageUriParts.length - 1];
        formData.append('image', {
          uri: profileImage,
          type: `image/${imageType}`,
          name: `profile.${imageType}`
        } as any);
      }

      const response = await axios.post(`${API_URL}/api/save-normal-info`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        Alert.alert('성공', response.data.message);
        navigation.goBack();
      } else {
        Alert.alert('오류', response.data.message);
      }
    } catch (error) {
      console.error('API 요청 오류:', error);
      Alert.alert('오류', '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>기본정보</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={profileImage ? { uri: profileImage } : require('../../../assets/default-profile.jpg')}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.cameraButton} onPress={handleImagePick}>
            <Ionicons name="camera" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>이름 (필수)</Text>
          <TextInput
            style={styles.input}
            placeholder="이름을 입력하세요"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>생년월일 (필수)</Text>
          <TextInput
            style={styles.input}
            placeholder="생년월일을 입력하세요 (예: 20011029)"
            value={birthDate}
            onChangeText={setBirthDate}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>이메일 (필수)</Text>
          <View style={styles.emailInputContainer}>
            <TextInput
              style={[styles.input, styles.emailLocalInput]}
              placeholder="이메일 ID"
              value={emailLocal}
              onChangeText={setEmailLocal}
            />
            <Text style={styles.atSymbol}>@</Text>
            <Picker
              selectedValue={emailDomain}
              onValueChange={(itemValue) => setEmailDomain(itemValue)}
              style={styles.picker}
            >
              {emailDomains.map((domain, index) => (
                <Picker.Item key={index} label={domain} value={domain} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>휴대폰 (필수)</Text>
          <TextInput
            style={styles.input}
            placeholder="'-' 없이 입력하세요"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>성별</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderButton, gender === '남자' && styles.genderButtonSelected]}
              onPress={() => setGender('남자')}
            >
              <Text style={[styles.genderButtonText, gender === '남자' && styles.genderButtonTextSelected]}>남자</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, gender === '여자' && styles.genderButtonSelected]}
              onPress={() => setGender('여자')}
            >
              <Text style={[styles.genderButtonText, gender === '여자' && styles.genderButtonTextSelected]}>여자</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>작성완료</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    right: 0,
    bottom: 0,
    top: 10,
    backgroundColor: '#4a90e2',
    borderRadius: 15,
    padding: 5,
  },
  imageHint: {
    marginTop: 10,
    color: '#666',
  },
  inputContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
  },
  infoBox: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    margin: 16,
    borderRadius: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  genderButtonSelected: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  genderButtonText: {
    fontSize: 16,
  },
  genderButtonTextSelected: {
    color: '#fff',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    borderRadius: 4,
  },
  saveButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#4a90e2',
    marginLeft: 8,
    borderRadius: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#333',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  emailLocalInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  atSymbol: {
    fontSize: 16,
    marginHorizontal: 4,
  },
  picker: {
    flex: 1,
    fontSize: 16,
  },
});

export default NormalInfo;