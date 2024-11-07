import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MessageScreen = () => {
  return (
    <View style={styles.container}>
      <Text>메시지 화면</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessageScreen;

