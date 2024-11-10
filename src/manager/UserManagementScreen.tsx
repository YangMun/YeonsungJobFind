import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import axios from 'axios';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { API_URL } from '../common/utils/validationUtils';
import { useAuth } from '../context/AuthContext';

type User = {
  id: number;
  name: string;
  email: string;
};

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'JobSeekerDetail'>;
type DetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'JobSeekerDetail'>;

type Props = {
  route: DetailScreenRouteProp;
  navigation: DetailScreenNavigationProp;
};

const UserManagementScreen: React.FC<Props> = ({ route }) => {
  const { jobId } = route.params;  // jobSeekerId를 route에서 받아옵니다.
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // API 데이터를 가져오는 함수
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/save-grad-info`, {
        params: {
          jobSeekerId: jobId,  // jobSeekerId를 API 호출 시 전달합니다.
        },
      });

      if (response.status === 200 && response.data.success) {
        setUsers(response.data.users);
      } else {
        console.error('API 응답에 유효한 데이터가 없습니다.');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('API 요청 중 오류 발생:', error.message);
      } else {
        console.error('알 수 없는 오류 발생:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // 초기 로딩 시 API 호출
  useEffect(() => {
    fetchUserData();
  }, []);

  // 사용자 목록 렌더링
  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text>데이터를 불러오는 중입니다...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContainer: {
    padding: 16,
  },
  userItem: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  userEmail: {
    fontSize: 16,
    color: '#495057',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserManagementScreen;
