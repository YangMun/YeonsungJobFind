/**
 * JobListScreen.tsx
 * 
 * 이 컴포넌트는 구인자가 등록한 구인 목록을 표시하는 화면입니다.
 * 구인자는 이 화면에서 자신이 등록한 구인 정보를 확인하고 관리할 수 있습니다.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, SafeAreaView, RefreshControl, Platform } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // AuthContext import 추가
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { API_URL, Job } from '../../common/utils/validationUtils';

type JobListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EmployerMain'>;

const JobListScreen: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const { userId } = useAuth(); // AuthContext에서 userId 가져오기
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<JobListScreenNavigationProp>();

  const fetchJobs = useCallback(async () => {
    if (!userId) return; // userId가 없으면 함수 종료
    try {
      const response = await axios.get(`${API_URL}/api/job-list/${userId}?status=${activeTab}`);
      if (response.data.success) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      console.error('API 요청 오류:', error);
    }
  }, [userId, activeTab]);

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [fetchJobs])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  }, [fetchJobs]);

  const handleTabPress = (tab: 'active' | 'closed') => {
    setActiveTab(tab);
    fetchJobs(); // 탭을 누를 때마다 데이터를 새로 불러옵니다.
  };

  // 날짜 포맷팅 함수 추가
  const formatDate = (dateString: string) => {
    if (!dateString) return '';

    // 이미 YYYY-MM-DD 형식이면 그대로 반환
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // UTC 시간을 로컬 시간으로 변환
    const date = new Date(dateString);
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const localDate = new Date(utc + (9 * 60 * 60 * 1000)); // KST (+9)

    return localDate.toISOString().split('T')[0];
  };

  const truncateContent = (content: string, maxLength: number) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  const renderJobItem = ({ item }: { item: Job }) => (
    <TouchableOpacity 
      style={styles.jobItem}
      onPress={() => navigation.navigate('EmployerJobDetail', { jobId: item.id })}
    >
      <View style={styles.jobItemContent}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobCompany}>{item.company_name}</Text>
        <Text style={styles.jobContent}>{truncateContent(item.contents, 50)}</Text>
        <View style={styles.jobFooter}>
          <Text style={styles.jobDeadline}>마감일: {formatDate(item.recruitment_deadline)}</Text>
          <Text style={styles.jobLocation}>{item.location}</Text>
        </View>
      </View>
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>{'>'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'active' && styles.activeTabButton]}
            onPress={() => handleTabPress('active')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'active' && styles.activeTabButtonText]}>공고중</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'closed' && styles.activeTabButton]}
            onPress={() => handleTabPress('closed')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'closed' && styles.activeTabButtonText]}>마감 공고</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={jobs}
          renderItem={renderJobItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa', // 전체 배경색과 동일하게 변경
    borderBottomWidth: 1,
    borderBottomColor: '#e0e3e8',
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
  },
  activeTabButton: {
    backgroundColor: '#4a90e2',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 16,
  },
  jobItem: {
    flexDirection: 'row', // 변경: 가로 방향으로 내용 배치
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobItemContent: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#212529',
  },
  jobCompany: {
    fontSize: 16,
    color: '#4a90e2',
    marginBottom: 8,
  },
  jobContent: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  jobDeadline: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  jobLocation: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  arrowContainer: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  arrow: {
    fontSize: 20,
    color: '#adb5bd',
  },
});

export default JobListScreen;
