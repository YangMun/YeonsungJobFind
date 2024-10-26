import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Alert } from 'react-native';
import { validateJobSeeker, validateEmployer, signUpJobSeeker, signUpEmployer } from '../../common/utils/validationUtils';

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;
type SignUpScreenRouteProp = RouteProp<RootStackParamList, 'SignUp'>;

type Props = {
  navigation: SignUpScreenNavigationProp;
  route: SignUpScreenRouteProp;
};

const SignUpScreen = ({ navigation }: Props) => {
  const [isJobSeeker, setIsJobSeeker] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [departmentName, setDepartmentName] = useState('');

  const resetFields = () => {
    setStudentId('');
    setEmail('');
    setId('');
    setPassword('');
    setConfirmPassword('');
    setDepartmentName('');
  };

  const handleUserTypeChange = (newIsJobSeeker: boolean) => {
    if (isJobSeeker !== newIsJobSeeker) {
      setIsJobSeeker(newIsJobSeeker);
      resetFields();
    }
  };

  const handleSignUp = async () => {
    let validationResult;
    if (isJobSeeker) {
      validationResult = await validateJobSeeker(studentId, email, password, confirmPassword);
    } else {
      validationResult = await validateEmployer(id, departmentName, password, confirmPassword);
    }
  
    if (!validationResult.isValid) {
      Alert.alert('회원가입 오류', validationResult.message);
      return;
    }
  
    let signUpResult;
    if (isJobSeeker) {
      signUpResult = await signUpJobSeeker(studentId, email, password);
    } else {
      signUpResult = await signUpEmployer(id, password, departmentName);
    }
  
    if (signUpResult.success) {
      Alert.alert('회원가입 성공', signUpResult.message, [
        { text: '확인', onPress: () => navigation.navigate('Login') }
      ]);
    } else {
      Alert.alert('회원가입 실패', signUpResult.message);
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
            style={[styles.userTypeButton, isJobSeeker && styles.activeUserType]}
            onPress={() => handleUserTypeChange(true)}
          >
            <Text style={[styles.userTypeText, isJobSeeker && styles.activeUserTypeText]}>구직자</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.userTypeButton, !isJobSeeker && styles.activeUserType]}
            onPress={() => handleUserTypeChange(false)}
          >
            <Text style={[styles.userTypeText, !isJobSeeker && styles.activeUserTypeText]}>구인자</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          {isJobSeeker ? (
            <>
              <View style={styles.inputWrapper}>
                <Ionicons name="school-outline" size={24} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="학번"
                  placeholderTextColor="#999"
                  value={studentId}
                  onChangeText={setStudentId}
                />
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={24} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="이메일"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={24} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="아이디"
                  placeholderTextColor="#999"
                  value={id}
                  onChangeText={setId}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={24} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="부서 이름"
                  placeholderTextColor="#999"
                  value={departmentName}
                  onChangeText={setDepartmentName}
                />
              </View>
            </>
          )}
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
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={24} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="비밀번호 확인"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>회원가입</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.goBack()}>
          <Text style={styles.loginButtonText}>이미 계정이 있으신가요? 로그인</Text>
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
    width: 200,
    height: 200,
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
  loginButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginButtonText: {
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

export default SignUpScreen;