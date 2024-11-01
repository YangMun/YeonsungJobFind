/**
 * NotificationsScreen.tsx
 * 
 * 이 컴포넌트는 구인자에게 전달되는 알림을 표시하는 화면입니다.
 * 새로운 지원자, 메시지, 시스템 알림 등이 이 화면에 표시됩니다.
 */

/**
 * NotificationsScreen.tsx
 * 
 * 이 컴포넌트는 구인자에게 전달되는 알림을 표시하는 화면입니다.
 * 새로운 지원자, 메시지, 시스템 알림 등이 이 화면에 표시됩니다.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../common/utils/validationUtils';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

interface Applicant {
  application_id: number;
  jobSeeker_id: string;
  job_id: number;
  job_title: string;
  name: string;
  status: '검토중' | '합격' | '불합격';
  application_date: string;
  school_name: string;
}

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { userId } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllApplicants();
  }, []);

  // 모든 공고의 지원자 목록 조회
  const fetchAllApplicants = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/employer/all-applicants/${userId}`);
      if (response.data.success) {
        setApplicants(response.data.applications);
      }
    } catch (error) {
      setApplicants([]); // 에러 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId: number, newStatus: string) => {
    try {
      const response = await axios.put(`${API_URL}/api/employer/update-application-status`, {
        applicationId,
        status: newStatus
      });

      if (response.data.success) {
        fetchAllApplicants(); // 상태 업데이트 후 목록 새로고침
      }
    } catch (error) {
      console.error('상태 업데이트 오류:', error);
      Alert.alert('오류', '상태 업데이트에 실패했습니다.');
    }
  };

  const showStatusOptions = (applicationId: number) => {
    Alert.alert(
      '지원 상태 변경',
      '새로운 상태를 선택하세요',
      [
        { text: '검토중', onPress: () => updateStatus(applicationId, '검토중') },
        { text: '합격', onPress: () => updateStatus(applicationId, '합격') },
        { text: '불합격', onPress: () => updateStatus(applicationId, '불합격') },
        { text: '취소', style: 'cancel' }
      ]
    );
  };

  const viewProfile = (jobSeekerId: string, jobId: number) => {
    navigation.navigate('JobSeekerProfile', {
      jobSeekerId,
      jobId
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case '합격':
        return styles.statusAccepted;
      case '불합격':
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };

  const renderApplicant = ({ item }: { item: Applicant }) => (
    <View style={styles.applicantCard}>
      <Text style={styles.jobTitle}>{item.job_title}</Text>
      <TouchableOpacity 
        style={styles.applicantInfo}
        onPress={() => viewProfile(item.jobSeeker_id, item.job_id)}
      >
        <View style={styles.headerRow}>
          <Text style={styles.name}>{item.name}</Text>
          <TouchableOpacity
            style={[styles.statusButton, getStatusStyle(item.status)]}
            onPress={() => showStatusOptions(item.application_id)}
          >
            <Text style={styles.statusText}>{item.status}</Text>
            <Ionicons name="chevron-down" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.school}>{item.school_name}</Text>
        <Text style={styles.date}>
          지원일: {new Date(item.application_date).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {applicants.length > 0 ? (
        <FlatList
          data={applicants}
          renderItem={renderApplicant}
          keyExtractor={(item) => item.application_id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>아직 지원자가 없습니다</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  applicantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 12,
  },
  applicantInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  school: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 4,
    fontSize: 12,
  },
  statusPending: {
    backgroundColor: '#f0ad4e',
  },
  statusAccepted: {
    backgroundColor: '#5cb85c',
  },
  statusRejected: {
    backgroundColor: '#d9534f',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default NotificationsScreen;















// 구인자의 모든 공고 지원자 목록 조회 API
app.get('/api/employer/all-applicants/:employerId', async (req, res) => {
  const { employerId } = req.params;
  
  try {
    const [applications] = await pool.query(`
      SELECT 
        ja.id as application_id,
        ja.jobSeeker_id,
        ja.job_id,
        ja.status,
        ja.application_date,
        pj.title as job_title,
        ni.name,
        gi.school_name
      FROM job_applications ja
      JOIN PostJob pj ON ja.job_id = pj.id
      LEFT JOIN NormalInformation ni ON ja.jobSeeker_id = ni.jobSeeker_id
      LEFT JOIN GradeInformation gi ON ja.jobSeeker_id = gi.jobSeeker_id
      WHERE pj.employer_id = ?
      ORDER BY ja.application_date DESC
    `, [employerId]);

    console.log('Query result:', applications); // 쿼리 결과 확인용

    res.json({
      success: true,
      applications: applications || []
    });
  } catch (error) {
    console.error('지원자 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});
