/**
 * NotificationsScreen.tsx
 * 
 * 이 컴포넌트는 구인자에게 전달되는 알림을 표시하는 화면입니다.
 * 새로운 지원자, 메시지, 시스템 알림 등이 이 화면에 표시됩니다.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView,Modal,ScrollView,Alert,RefreshControl} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { JobPostStatus, JobPostDetail, API_URL } from '../../common/utils/validationUtils';

const NotificationsScreen = () => {
  const { userId } = useAuth();
  const [applications, setApplications] = useState<JobPostStatus[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<JobPostDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/employer/applications/${userId}`);
      if (response.data.success) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      console.error('지원자 목록 조회 실패:', error);
    }
  }, [userId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchApplications();
    setRefreshing(false);
  }, [fetchApplications]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const fetchApplicantDetail = async (jobSeekerId: string, jobId: number) => {
    try {
      const response = await axios.get(`${API_URL}/api/employer/applicant-detail/${jobSeekerId}/${jobId}`);
      if (response.data.success && response.data.detail) {
        // id 확인
        if (!response.data.detail.id) {
          console.error('상세 정보에 id가 없습니다:', response.data.detail);
          return;
        }
        setSelectedApplicant(response.data.detail);
        setShowModal(true);
      }
    } catch (error) {
      console.error('지원자 상세정보 조회 실패:', error);
    }
  };
  
  const updateApplicationStatus = async (applicationId: number, status: '합격' | '불합격') => {
    if (!applicationId) {
      console.error('applicationId가 없습니다');
      Alert.alert('오류', '지원 정보를 찾을 수 없습니다.');
      return;
    }
  
    try {
      const response = await axios.put(`${API_URL}/api/employer/update-status/${applicationId}`, {
        status
      });

      if (response.data.success) {
        await fetchApplications(); // 목록 새로고침
        Alert.alert('성공', `지원자를 ${status}처리하였습니다.`);
        setShowModal(false);
      }
    } catch (error: any) {
      console.error('상태 업데이트 실패:', error.response?.data || error);
      Alert.alert('오류', error.response?.data?.message || '처리 중 문제가 발생했습니다.');
    }
  };

  const renderApplication = ({ item }: { item: JobPostStatus }) => (
    <TouchableOpacity 
      style={styles.applicationItem}
      onPress={() => fetchApplicantDetail(item.jobSeeker_id, item.job_id)}
    >
      <View style={styles.statusIndicator}>
        <Ionicons 
          name={
            item.application_status === '합격' ? 'checkmark-circle' :
            item.application_status === '불합격' ? 'close-circle' : 
            'time'
          } 
          size={24} 
          color={
            item.application_status === '합격' ? '#4CAF50' :
            item.application_status === '불합격' ? '#F44336' :
            '#FFC107'
          } 
        />
      </View>
      <View style={styles.applicationInfo}>
        <Text style={styles.statusText}>{item.application_status}</Text>
        <Text style={styles.dateText}>지원일: {new Date(item.applied_at).toLocaleDateString()}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  const ApplicantModal = () => (
  <Modal
    visible={showModal}
    animationType="slide"
    onRequestClose={() => setShowModal(false)}
  >
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={() => setShowModal(false)}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>지원자 정보</Text>
        <View style={styles.placeholder} />
      </View>

      {selectedApplicant && (
        <ScrollView style={styles.modalContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>공고 정보</Text>
            <Text style={styles.jobTitle}>{selectedApplicant.jobPost?.title || '정보 없음'}</Text>
            <Text style={styles.companyName}>{selectedApplicant.jobPost?.company_name || '정보 없음'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>지원자 정보</Text>
            <Text style={styles.infoText}>이름: {selectedApplicant.applicant?.name || '정보 없음'}</Text>
            <Text style={styles.infoText}>이메일: {selectedApplicant.applicant?.email || '정보 없음'}</Text>
            <Text style={styles.infoText}>연락처: {selectedApplicant.applicant?.phone || '정보 없음'}</Text>
            <Text style={styles.infoText}>생년월일: {selectedApplicant.applicant?.birthDate || '정보 없음'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>학력 사항</Text>
            <Text style={styles.infoText}>대학: {selectedApplicant.applicant?.education?.university_type || '정보 없음'}</Text>
            <Text style={styles.infoText}>학교명: {selectedApplicant.applicant?.education?.school_name || '정보 없음'}</Text>
            <Text style={styles.infoText}>전공: {selectedApplicant.applicant?.education?.major || '정보 없음'}</Text>
            <Text style={styles.infoText}>상태: {selectedApplicant.applicant?.education?.graduation_status || '정보 없음'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>자기소개서</Text>
            <View style={styles.statementSection}>
              <Text style={styles.statementTitle}>성장과정</Text>
              <Text style={styles.statementContent}>{selectedApplicant.applicant?.careerStatement?.growth_process || '정보 없음'}</Text>
            </View>
            <View style={styles.statementSection}>
              <Text style={styles.statementTitle}>성격(장단점)</Text>
              <Text style={styles.statementContent}>{selectedApplicant.applicant?.careerStatement?.personality || '정보 없음'}</Text>
            </View>
            <View style={styles.statementSection}>
              <Text style={styles.statementTitle}>지원동기</Text>
              <Text style={styles.statementContent}>{selectedApplicant.applicant?.careerStatement?.motivation || '정보 없음'}</Text>
            </View>
            <View style={styles.statementSection}>
              <Text style={styles.statementTitle}>입사 후 포부</Text>
              <Text style={styles.statementContent}>{selectedApplicant.applicant?.careerStatement?.aspiration || '정보 없음'}</Text>
            </View>
            <View style={styles.statementSection}>
              <Text style={styles.statementTitle}>경력사항</Text>
              <Text style={styles.statementContent}>{selectedApplicant.applicant?.careerStatement?.career_history || '정보 없음'}</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => updateApplicationStatus(selectedApplicant.id, '불합격')}
            >
              <Text style={styles.buttonText}>불합격</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => updateApplicationStatus(selectedApplicant.id, '합격')}
            >
              <Text style={styles.buttonText}>합격</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  </Modal>
);



  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={applications}
        renderItem={renderApplication}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 지원자가 없습니다.</Text>
          </View>
        }
      />
      <ApplicantModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  applicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statusIndicator: {
    marginRight: 12,
  },
  applicationInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24, // ionicons 크기와 동일하게 맞춤
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    marginBottom: 8,
    color: '#444',
  },
  statementSection: {
    marginBottom: 16,
  },
  statementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#444',
  },
  statementContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    margin: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  refreshIndicator: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 모달 내 스크롤뷰 스타일
  scrollViewContent: {
    flexGrow: 1,
  },
  // 지원자 정보 섹션 구분선
  sectionDivider: {
    height: 8,
    backgroundColor: '#f5f5f5',
    marginVertical: 16,
  },
  // 상태 뱃지 스타일
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // 상태별 뱃지 색상
  pendingBadge: {
    backgroundColor: '#FFC107',
  },
  acceptedBadge: {
    backgroundColor: '#4CAF50',
  },
  rejectedBadge: {
    backgroundColor: '#F44336',
  },
  // 정보 레이블 스타일
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  // 자기소개서 내용 스타일
  statementBox: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  // 하단 버튼 컨테이너
  bottomButtonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  }
 });

export default NotificationsScreen;