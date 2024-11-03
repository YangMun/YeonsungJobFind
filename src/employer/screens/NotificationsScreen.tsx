/**
 * NotificationsScreen.tsx
 * 
 * 이 컴포넌트는 구인자에게 전달되는 알림을 표시하는 화면입니다.
 * 새로운 지원자, 메시지, 시스템 알림 등이 이 화면에 표시됩니다.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NotificationsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>알림</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default NotificationsScreen;
