import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../auth/screens/LoginScreen';
import SignUpScreen from '../auth/screens/SignUpScreen';
import JobSeekerMainScreen from '../jobSeeker/screens/JobSeekerMain';
import EmployerMainScreen from '../employer/screens/EmployerMain';
import JobDetailScreen from '../employer/screens/JobDetailScreen';
import EditJobScreen from '../employer/screens/EditJobScreen';
import DetailScreen from '../jobSeeker/screens/DetailScreen';
import JobSeekerProfileScreen from '../jobSeeker/screens/profile/JobSeekerProfileScreen';
import ProfileEditView from '../jobSeeker/screens/profile/ProfileEditView';
import NormalInfo from '../jobSeeker/screens/profile/NormalInfo';
import MyCareerEditView from '../jobSeeker/screens/profile/MyCareerEditView';
import GradInfo from '../jobSeeker/screens/profile/GradInfo';
import ExperienceActivityEducationForm from '../jobSeeker/screens/profile/ExperienceActivity';
import CertificationForm from '../jobSeeker/screens/profile/CertificationForm';
import ManagerMain from '../manager/screens/ManagerMain';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  JobSeekerMain: undefined;
  EmployerMain: undefined;
  JobSeekerDetail: { jobId: number };
  EmployerJobDetail: { jobId: number };
  EditJob: { jobId: number };
  JobSeekerProfile: undefined;
  ProfileEditView: undefined;
  NormalInfo: undefined;
  MyCareerEditView: undefined;
  GradInfo: undefined;
  ExperienceActivityEducationForm: undefined;
  CertificationForm: undefined;
  ManagerMain: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Login');
  const { setUserId } = useAuth();

  useEffect(() => {
    // 앱 시작 시 저장된 로그인 정보 확인
    const checkLoginStatus = async () => {
      try {
        const storedUserType = await AsyncStorage.getItem('userType');
        const storedUserId = await AsyncStorage.getItem('userId');

        if (storedUserType && storedUserId) {
          setUserId(storedUserId);
          if (storedUserType === 'jobSeeker') {
            setInitialRoute('JobSeekerMain');
          } else if (storedUserType === 'employer') {
            setInitialRoute('EmployerMain');
          }
        }
      } catch (error) {
        console.error('자동 로그인 확인 중 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {
    return null; // 또는 로딩 스피너 표시
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="JobSeekerMain" component={JobSeekerMainScreen} />
        <Stack.Screen name="EmployerMain" component={EmployerMainScreen} />
        <Stack.Screen 
          name="JobSeekerDetail" 
          component={DetailScreen} 
          options={{ gestureEnabled: true }}
        />
        <Stack.Screen 
          name="EmployerJobDetail" 
          component={JobDetailScreen} 
          options={{ gestureEnabled: true }}
        />
        <Stack.Screen 
          name="EditJob" 
          component={EditJobScreen} 
          options={{ gestureEnabled: true }}
        />
        <Stack.Screen 
          name="JobSeekerProfile" 
          component={JobSeekerProfileScreen} 
          options={{ gestureEnabled: true }}
        />
        <Stack.Screen 
          name="ProfileEditView" 
          component={ProfileEditView} 
          options={{ gestureEnabled: true }}
        />
        <Stack.Screen 
          name="NormalInfo" 
          component={NormalInfo} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MyCareerEditView" 
          component={MyCareerEditView} 
          options={{ headerShown: false }}
        />
        <Stack.Screen name="GradInfo" component={GradInfo} options={{ headerShown: false }} />
        <Stack.Screen 
          name="ExperienceActivityEducationForm" 
          component={ExperienceActivityEducationForm} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CertificationForm" 
          component={CertificationForm} 
          options={{ headerShown: false }}
        />
        <Stack.Screen name="ManagerMain" component={ManagerMain} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
