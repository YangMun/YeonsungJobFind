import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './HomeScreen';
import NotificationScreen from './NotificationScreen';
import MessageScreen from './MessageScreen';
import JobSeekerProfileScreen from './profile/JobSeekerProfileScreen';

type RootTabParamList = {
  홈: undefined;
  알림: undefined;
  메시지: undefined;
  이력서: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const JobSeekerMainScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === '홈') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === '알림') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === '메시지') {
            iconName = focused ? 'mail' : 'mail-outline';
          } else if (route.name === '이력서') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4a90e2',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="홈" component={HomeScreen} />
      <Tab.Screen name="알림" component={NotificationScreen} />
      <Tab.Screen name="메시지" component={MessageScreen} />
      <Tab.Screen name="이력서" component={JobSeekerProfileScreen} />
    </Tab.Navigator>
  );
};

export default JobSeekerMainScreen;
