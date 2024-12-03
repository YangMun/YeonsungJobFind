import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import UserManagementScreen from './UserManagementScreen';
import PostManagementScreen from './PostManagementScreen';

type RootTabParamList = {
  회원관리: undefined;
  게시글관리: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const ManagerMain = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === '회원관리') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === '게시글관리') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          }
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4a90e2',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="회원관리" component={UserManagementScreen} />
      <Tab.Screen name="게시글관리" component={PostManagementScreen} />
    </Tab.Navigator>
  );
};

export default ManagerMain;
