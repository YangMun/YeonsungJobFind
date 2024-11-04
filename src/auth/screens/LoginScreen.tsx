import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Alert } from 'react-native';
import { login } from '../../common/utils/validationUtils';
import { useAuth } from '../../context/AuthContext';

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  JobSeekerMain: undefined;
  EmployerMain: undefined;
  ManagerMain: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { setUserId } = useAuth();
  const [userType, setUserType] = useState<'jobSeeker' | 'employer' | 'manager'>('jobSeeker');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // "manager" 타입인 경우 별도 네비게이션 처리
    if (userType === 'manager') {
      const result = await login('manager', id, password); // 타입 단언 사용
      if (result.success) {
        setUserId(id);
        navigation.navigate('ManagerMain'); // "manager"일 때는 "ManagerMain"으로 이동
      } else {
        //Alert.alert('로그인 실패', result.message);
      }
    } else {
      // 기존 로직 유지
      const result = await login(userType as 'jobSeeker' | 'employer', id, password);
      if (result.success) {
        setUserId(id);
        navigation.navigate(userType === 'jobSeeker' ? 'JobSeekerMain' : 'EmployerMain');
      } else {
        Alert.alert('로그인 실패', result.message);
      }
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleUserTypeChange = (newUserType: 'jobSeeker' | 'employer' | 'manager') => {
    if (newUserType !== userType) {
      setUserType(newUserType);
      setId('');
      setPassword('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>연성대학교 구직 사이트</Text>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/YeonsungLogo.png')}
          style={styles.logo}
        />
      </View>
      <View style={styles.content}>
        <View style={styles.userTypeContainer}>
          <TouchableOpacity
            style={[styles.userTypeButton, userType === 'jobSeeker' && styles.activeUserType]}
            onPress={() => handleUserTypeChange('jobSeeker')}
          >
            <Text style={[styles.userTypeText, userType === 'jobSeeker' && styles.activeUserTypeText]}>구직자</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.userTypeButton, userType === 'employer' && styles.activeUserType]}
            onPress={() => handleUserTypeChange('employer')}
          >
            <Text style={[styles.userTypeText, userType === 'employer' && styles.activeUserTypeText]}>구인자</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.userTypeButton, userType === 'manager' && styles.activeUserType]}
            onPress={() => handleUserTypeChange('manager')}
          >
            <Text style={[styles.userTypeText, userType === 'manager' && styles.activeUserTypeText]}>관리자</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons 
              name={userType === 'jobSeeker' ? "school-outline" : "person-outline"} 
              size={24} 
              color="#999" 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              placeholder={userType === 'jobSeeker' ? "학번" : "아이디"}
              placeholderTextColor="#999"
              value={id}
              onChangeText={setId}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={24} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  content: {
    width: '100%',
    paddingHorizontal: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#4a90e2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  userTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#4a90e2',
    borderRadius: 20,
    marginHorizontal: 10,
  },
  activeUserType: {
    backgroundColor: '#4a90e2',
  },
  userTypeText: {
    color: '#4a90e2',
    fontWeight: 'bold',
  },
  activeUserTypeText: {
    color: '#fff',
  },
});

export default LoginScreen;