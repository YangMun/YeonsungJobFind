import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import JobListScreen from './JobListScreen';
import PostJobScreen from './PostJobScreen';
import NotificationsScreen from './NotificationsScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

const EmployerMain = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,  // 이 줄을 추가하여 헤더를 숨깁니다
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === '구인 목록') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === '구인 등록') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === '알림') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === '프로필') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4a90e2',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="구인 목록" component={JobListScreen} />
      <Tab.Screen name="구인 등록" component={PostJobScreen} />
      <Tab.Screen name="알림" component={NotificationsScreen} />
      <Tab.Screen name="프로필" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default EmployerMain;
