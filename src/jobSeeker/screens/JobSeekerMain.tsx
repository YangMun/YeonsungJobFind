import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import HomeScreen from './HomeScreen';
import NotificationScreen from './NotificationScreen';
import MessageScreen from './MessageScreen';
import JobSeekerProfileScreen from './profile/JobSeekerProfileScreen';
import axios from 'axios';
import { API_URL, NotificationItem } from '../../common/utils/validationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootTabParamList = {
  홈: undefined;
  알림: undefined;
  메시지: undefined;
  이력서: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: '#ef4444',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  }
});

function JobSeekerMainScreen() {
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => setUserId(id));
  }, []);

  useEffect(() => {
    const checkNewNotifications = async () => {
      if (!userId) return;
      
      try {
        const response = await axios.get(`${API_URL}/api/jobseeker/applications/${userId}`);
        const notifications = response.data.applications;
        const lastViewedTime = await AsyncStorage.getItem('lastNotificationViewTime');
        
        const hasNew = notifications.some((notification: NotificationItem) => {
          const notificationTime = new Date(notification.updated_at).getTime();
          return !lastViewedTime || notificationTime > parseInt(lastViewedTime);
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

          if (route.name === '홈') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === '알림') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === '메시지') {
            iconName = focused ? 'mail' : 'mail-outline';
          } else if (route.name === '이력서') {
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
      <Tab.Screen name="홈" component={HomeScreen} />
      <Tab.Screen 
        name="알림" 
        component={NotificationScreen}
        listeners={{
          tabPress: async () => {
            await AsyncStorage.setItem('lastNotificationViewTime', Date.now().toString());
            setHasNewNotifications(false);
          }
        }}
      />
      <Tab.Screen name="메시지" component={MessageScreen} />
      <Tab.Screen name="이력서" component={JobSeekerProfileScreen} />
    </Tab.Navigator>
  );
}

export default JobSeekerMainScreen;