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
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../common/utils/validationUtils';

interface JobPost {
  id: number;
  title: string;
  recruitment_deadline: string;
  applicants: Application[];
}

interface Application {
  application_id: number;
  jobSeeker_id: string;
  job_title: string;
  application_status: string;
  applied_at: string;
  name: string;
  school_name: string | null;
  normal_info?: {
    email: string;
    phone: string;
    birthDate: string;
    gender: string;
  };
  education_info?: {
    school_name: string;
    major: string;
    graduation_status: string;
    admission_date: string;
    graduation_date: string;
  };
}

const NotificationsScreen = () => {
  const { userId } = useAuth();
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [showApplicantModal, setShowApplicantModal] = useState(false);

  const fetchJobPostsAndApplications = async () => {
    if (!userId) return;
  
    try {
      const [jobsResponse, applicationsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/job-list/${userId}?status=active`),
        axios.get(`${API_URL}/api/employer/all-applicants/${userId}`)
      ]);
  
      if (jobsResponse.data.success && applicationsResponse.data.success) {
        const posts = jobsResponse.data.jobs.map((post: any) => ({
          ...post,
          applicants: applicationsResponse.data.applications.filter(
            (app: Application) => app.job_id === post.id
          )
        }));
        setJobPosts(posts);
      }
    } catch (error) {
      Alert.alert('오류', '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicantDetails = async (jobSeekerId: string) => {
    try {
      const [normalInfo, educationInfo] = await Promise.all([
        axios.get(`${API_URL}/api/get-normal-info/${jobSeekerId}`),
        axios.get(`${API_URL}/api/get-education-info/${jobSeekerId}`)
      ]);

      return {
        normal_info: normalInfo.data.success ? normalInfo.data.info : null,
        education_info: educationInfo.data.success ? educationInfo.data.info : null
      };
    } catch (error) {
      console.error('지원자 상세 정보 조회 오류:', error);
      return null;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchJobPostsAndApplications();
    }
  }, [userId]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchJobPostsAndApplications();
    setRefreshing(false);
  }, []);

  const renderStatusBadge = (status: string) => {
    let color;
    switch (status) {
      case '합격':
        color = '#4CAF50';
        break;
      case '불합격':
        color = '#F44336';
        break;
      default:
        color = '#2196F3';
    }
    
    return (
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{status}</Text>
      </View>
    );
  };

  const handleApplicantPress = async (applicant: Application) => {
    const details = await fetchApplicantDetails(applicant.jobSeeker_id);
    setSelectedApplicant({ ...applicant, ...details });
    setShowApplicantModal(true);
  };
  const ApplicantDetailModal = () => {
    if (!selectedApplicant) return null;
  
    const handleViewFullProfile = async () => {
      try {
        // 경력사항
        const careerResponse = await axios.get(`${API_URL}/api/get-career-statement/${selectedApplicant.jobSeeker_id}`);
        // 경험/활동
        const experienceResponse = await axios.get(`${API_URL}/api/get-experience-activities/${selectedApplicant.jobSeeker_id}`);
        // 자격증
        const certificationsResponse = await axios.get(`${API_URL}/api/get-certifications/${selectedApplicant.jobSeeker_id}`);
  
        // 구직자의 전체 이력서 화면으로 이동
        navigation.navigate('JobSeekerProfileView', {
          jobSeekerId: selectedApplicant.jobSeeker_id,
          profile: {
            ...selectedApplicant,
            careerStatement: careerResponse.data.success ? careerResponse.data.careerStatement : null,
            experienceActivities: experienceResponse.data.success ? experienceResponse.data.activities : [],
            certifications: certificationsResponse.data.success ? certificationsResponse.data.certifications : []
          }
        });
        
        setShowApplicantModal(false);
      } catch (error) {
        console.error('프로필 조회 오류:', error);
        Alert.alert('오류', '프로필 정보를 불러오는데 실패했습니다.');
      }
    };
  
    return (
      <Modal
        visible={showApplicantModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowApplicantModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>지원자 상세 정보</Text>
              <TouchableOpacity 
                onPress={() => setShowApplicantModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
  
            <ScrollView style={styles.modalBody}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>지원자 정보</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>이름</Text>
                  <Text style={styles.infoValue}>{selectedApplicant.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>학번</Text>
                  <Text style={styles.infoValue}>{selectedApplicant.jobSeeker_id}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>지원일</Text>
                  <Text style={styles.infoValue}>
                    {new Date(selectedApplicant.applied_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>상태</Text>
                  <View style={styles.infoValue}>
                    {renderStatusBadge(selectedApplicant.application_status)}
                  </View>
                </View>
              </View>
  
              {selectedApplicant.normal_info && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>연락처 정보</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>이메일</Text>
                    <Text style={styles.infoValue}>{selectedApplicant.normal_info.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>전화번호</Text>
                    <Text style={styles.infoValue}>{selectedApplicant.normal_info.phone}</Text>
                  </View>
                </View>
              )}
  
              {selectedApplicant.education_info && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>학력 정보</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>학교</Text>
                    <Text style={styles.infoValue}>
                      {selectedApplicant.education_info.school_name}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>전공</Text>
                    <Text style={styles.infoValue}>
                      {selectedApplicant.education_info.major}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>학적상태</Text>
                    <Text style={styles.infoValue}>
                      {selectedApplicant.education_info.graduation_status}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderApplicantItem = (applicant: Application) => (
    <TouchableOpacity 
      key={applicant.application_id} 
      style={styles.applicantItem}
      onPress={() => handleApplicantPress(applicant)}
    >
      <View style={styles.applicantHeader}>
        <View style={styles.applicantInfo}>
          <Text style={styles.applicantName}>{applicant.name}</Text>
          <Text style={styles.applicantId}>({applicant.jobSeeker_id})</Text>
        </View>
        {renderStatusBadge(applicant.application_status)}
      </View>
      <Text style={styles.appliedDate}>
        지원일: {new Date(applicant.applied_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const renderJobPost = (post: JobPost) => (
    <View key={post.id} style={styles.card}>
      <View style={styles.postHeader}>
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.applicantCount}>
          지원자: {post.applicants.length}명
        </Text>
      </View>

      {post.applicants.length > 0 ? (
        <View style={styles.applicantList}>
          {post.applicants.map(renderApplicantItem)}
        </View>
      ) : (
        <Text style={styles.noApplicants}>아직 지원자가 없습니다.</Text>
      )}
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>공고 및 지원자 관리</Text>
        <Text style={styles.headerSubtitle}>
          총 {jobPosts.length}개의 진행중인 공고
        </Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {jobPosts.length > 0 ? (
          jobPosts.map(renderJobPost)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>진행중인 공고가 없습니다.</Text>
          </View>
        )}
      </ScrollView>
      <ApplicantDetailModal />
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
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a90e2',
    flex: 1,
  },
  applicantCount: {
    fontSize: 14,
    color: '#666',
  },
  applicantList: {
    marginTop: 8,
  },
  applicantItem: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  applicantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  applicantId: {
    fontSize: 14,
    color: '#666',
  },
  appliedDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noApplicants: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
   modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    margin: 20,  
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4a90e2',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  infoLabel: {
    width: 70,
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
  },
});

export default NotificationsScreen;