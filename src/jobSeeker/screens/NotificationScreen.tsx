import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL, formatDate, NotificationItem} from '../../common/utils/validationUtils';
import { useAuth } from '../../context/AuthContext';

const getStatusColor = (status: string) => {
  switch (status) {
    case '합격':
      return '#4CAF50';  // 초록색
    case '불합격':
      return '#FF4444';  // 빨간색
    case '면접 요망':
      return '#87CEEB';  // 하늘색
    default:
      return '#FFC107';  // 회색 (지원 완료/검토중)
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case '합격':
      return 'checkmark-circle';  // O 표시
    case '불합격':
      return 'close-circle';      // X 표시
    case '면접 요망':
      return 'calendar';      // 캘린더 아이콘
    default:
      return 'time';             // 시계 아이콘 (지원 완료/검토중)
  }
};

const NotificationScreen = () => {
  const [applications, setApplications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { userId } = useAuth();

  const fetchApplications = async () => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`${API_URL}/api/jobseeker/applications/${userId}`);
      setApplications(response.data.applications);
    } catch (error) {
      console.error('지원 현황 조회 실패:', error);
    }
  };

  // 수동 새로고침을 위한 함수
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchApplications();
    setRefreshing(false);
  }, [userId]);

  useEffect(() => {
    fetchApplications(); // 초기 데이터 로드

    // 10초마다 데이터 자동 업데이트
    const intervalId = setInterval(() => {
      fetchApplications();
    }, 10000); // 10초 간격

    // 컴포넌트가 언마운트되면 인터벌 정리
    return () => clearInterval(intervalId);
  }, [userId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        <Text style={styles.title}>지원 현황</Text>
        {applications.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.leftContent}>
              <View style={styles.statusContainer}>
                <Ionicons 
                  name={getStatusIcon(item.application_status)} 
                  size={24} 
                  color={getStatusColor(item.application_status)} 
                />
                <Text style={styles.status}>{item.title}</Text>
              </View>
              <Text style={styles.date}>지원일: {formatDate(item.applied_at)}</Text>
              <View style={styles.companyContainer}>
                <Text style={styles.company}>{item.company_name}</Text>
                <Text style={styles.qualification}> · {item.qualification_type}</Text>
              </View>
            </View>
            <View style={styles.rightContent}>
              <Text style={[
                styles.applicationStatus, 
                { color: getStatusColor(item.application_status) }
              ]}>
                {item.application_status}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: Platform.OS === 'ios' ? 10 : 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftContent: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  date: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  company: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  companyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qualification: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  rightContent: {
    alignItems: 'center',
  },
  applicationStatus: {
    fontSize: 15,
    fontWeight: '600',
  }
});

export default NotificationScreen;

