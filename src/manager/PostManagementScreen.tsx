import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PostManagementScreen = () => {
  return (
    <View style={styles.container}>
      <Text>게시글 관리화면</Text>
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

export default PostManagementScreen;

