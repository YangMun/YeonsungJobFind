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
import { JobPostStatus, GroupedJobPost, JobPostDetail, API_URL } from '../../common/utils/validationUtils';



const NotificationsScreen = () => {
  const { userId } = useAuth();
  const [groupedApplications, setGroupedApplications] = useState<GroupedJobPost[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<JobPostDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/employer/applications/${userId}`);
      if (response.data.success) {
        const groupedData = new Map<number, GroupedJobPost>();
        
        await Promise.all(response.data.applications.map(async (application: JobPostStatus) => {
          try {
            const jobResponse = await axios.get(`${API_URL}/api/job-detail/${application.job_id}`);
            const applicantResponse = await axios.get(
              `${API_URL}/api/employer/applicant-detail/${application.jobSeeker_id}/${application.job_id}`
            );
            
            const jobData = jobResponse.data.job;
            const applicantData = applicantResponse.data.detail;
            const applicantName = applicantData.applicant?.name || '이름 없음';
            
            let qualificationType = '지원자격 정보 없음';
            
            if (applicantData.jobApplication?.qualification_type) {
              qualificationType = applicantData.jobApplication.qualification_type;
            } else if (applicantData.application?.qualification_type) {
              qualificationType = applicantData.application.qualification_type;
            } else if (application.qualification_type) {
              qualificationType = application.qualification_type;
            } else if (jobData.qualification_type) {
              qualificationType = jobData.qualification_type;
            }
  
            if (!groupedData.has(jobData.id)) {
              groupedData.set(jobData.id, {
                jobTitle: jobData.title,
                jobId: jobData.id,
                applicants: []
              });
            }
  
            const group = groupedData.get(jobData.id)!;
            group.applicants.push({
              ...application,
              applicantName,
              qualification_type: qualificationType
            });
          } catch (error) {
            console.error('데이터 조회 실패:', error);
          }
        }));
  
        setGroupedApplications(Array.from(groupedData.values()));
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

  const updateApplicationStatus = async (applicationId: number, status: '합격' | '불합격' | '면접 요망') => {
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
        await fetchApplications();
        Alert.alert('성공', `지원자를 ${status}처리하였습니다.`);
        setShowModal(false);
      }
    } catch (error: any) {
      console.error('상태 업데이트 실패:', error.response?.data || error);
      Alert.alert('오류', error.response?.data?.message || '처리 중 문제가 발생했습니다.');
    }
  };

  const renderApplicant = (applicant: JobPostStatus & { applicantName?: string }) => (
    <TouchableOpacity
      style={styles.applicationItem}
      onPress={() => fetchApplicantDetail(applicant.jobSeeker_id, applicant.job_id)}
    >
      <View style={styles.applicantInfo}>
        <Ionicons
          name={
            applicant.application_status === '합격' ? 'checkmark-circle' :
            applicant.application_status === '불합격' ? 'close-circle' :
            applicant.application_status === '면접 요망' ? 'calendar' :
            'time'
          }
          size={20}
          color={
            applicant.application_status === '합격' ? '#4CAF50' :
            applicant.application_status === '불합격' ? '#F44336' :
            applicant.application_status === '면접 요망' ? '#87CEEB' :
            '#FFC107'
          }
        />
        <View style={styles.textContainer}>
          <Text style={styles.applicantName}>{applicant.applicantName}</Text>
          <View style={styles.detailsContainer}>
            <Text style={styles.dateText}>
              지원일: {new Date(applicant.applied_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                formatMatcher: 'best fit'
              }).replace(/\. /g, '-').replace('.', '')}
            </Text>
            <View style={styles.qualificationBadge}>
              <Text style={styles.qualificationText}>
                {applicant.qualification_type || '지원자격 정보 없음'}
              </Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
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
            <Text style={styles.modalJobTitle}>{selectedApplicant.jobPost?.title || '정보 없음'}</Text>
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
              style={[styles.actionButton, styles.interviewButton]}
              onPress={() => updateApplicationStatus(selectedApplicant.id, '면접 요망')}
            >
              <Text style={styles.buttonText}>면접 요망</Text>
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
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>지원자</Text>
        {groupedApplications.map((group) => (
          <View key={group.jobId} style={styles.jobGroup}>
            <Text style={styles.jobGroupTitle}>{group.jobTitle}</Text>
            {group.applicants.map((applicant) => (
              <View key={applicant.id} style={styles.applicantContainer}>
                {renderApplicant(applicant)}
              </View>
            ))}
          </View>
        ))}
        {groupedApplications.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 지원자가 없습니다</Text>
          </View>
        )}
      </ScrollView>
      <ApplicantModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
  },
  jobGroup: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobGroupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  applicantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  applicationItem: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  applicantInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  qualificationTag: {
    backgroundColor: '#E3F2FD', 
    color: '#1976D2',          
    fontSize: 12,               
    marginLeft: 8,              
    paddingVertical: 2,         
    paddingHorizontal: 8,       
    borderRadius: 4,            
  },
  nameStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  applicationStatus: { 
    fontSize: 14,
    color: '#666',
  },
  tagText: { 
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 24,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalJobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
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
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
  },
  statementSection: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  statementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  statementContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    margin: 4,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  interviewButton: {
    backgroundColor: '#87CEEB',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  qualificationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,        
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  qualificationText: {
    fontSize: 14,
    color: '#666',
  },
});

export default NotificationsScreen;