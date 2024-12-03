import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import JobListScreen from './JobListScreen';
import PostJobScreen from './PostJobScreen';
import NotificationsScreen from './NotificationsScreen';
import ProfileScreen from './ProfileScreen';
import axios from 'axios';
import { API_URL, JobPostStatus } from '../../common/utils/validationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#ef4444',
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  }
});

const EmployerMain = () => {
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => setUserId(id));
  }, []);

  useEffect(() => {
    const checkNewNotifications = async () => {
      if (!userId) return;
      
      try {
        const response = await axios.get(`${API_URL}/api/employer/applications/${userId}`);
        const notifications = response.data.applications;
        const lastViewedTime = await AsyncStorage.getItem('lastNotificationViewTime');
        
        const hasNew = notifications.some((notification: JobPostStatus) => {
          const notificationTime = new Date(notification.updated_at).getTime();
          return (!lastViewedTime || notificationTime > parseInt(lastViewedTime));
        });
        
        setHasNewNotifications(hasNew);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    checkNewNotifications();
    const interval = setInterval(checkNewNotifications, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
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

          return (
            <View style={styles.iconContainer}>
              <Ionicons name={iconName as any} size={size} color={color} />
              {route.name === '알림' && hasNewNotifications && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#ef4444'
                }} />
              )}
            </View>
          );
        },
        tabBarActiveTintColor: '#4a90e2',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="구인 목록" component={JobListScreen} />
      <Tab.Screen name="구인 등록" component={PostJobScreen} />
      <Tab.Screen 
        name="알림" 
        component={NotificationsScreen}
        listeners={{
          tabPress: async () => {
            await AsyncStorage.setItem('lastNotificationViewTime', Date.now().toString());
            setHasNewNotifications(false);
          }
        }}
      />
      <Tab.Screen name="프로필" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default EmployerMain;
