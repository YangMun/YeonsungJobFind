import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Modal } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { API_URL, JobDetail } from '../../common/utils/validationUtils';
import { useAuth } from '../../context/AuthContext';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'JobSeekerDetail'>;
type DetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'JobSeekerDetail'>;

type Props = {
  route: DetailScreenRouteProp;
  navigation: DetailScreenNavigationProp;
};

const DetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params;
  const [jobDetail, setJobDetail] = useState<JobDetail | null>(null);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const { userId } = useAuth();

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/job-detail/${jobId}`);
        if (response.data.success) {
          setJobDetail(response.data.job);
        }
      } catch (error) {
        console.error('API 요청 오류:', error);
      }
    };

    fetchJobDetail();
  }, [jobId]);

  if (!jobDetail) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>로딩 중...</Text>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatCurrency = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const toggleContent = () => {
    setIsContentExpanded(!isContentExpanded);
  };

  // 공고가 진행중인지 확인하는 함수 추가
  const isActiveJob = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);
    return deadlineDate >= today;
  };

  // 지원하기 버튼 핸들 추가
  const handleApplyPress = () => {
    setShowModal(true);
  };

  // 지원하기 API 호출 함수 추가
  const handleInsertJobStatus = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/job-status-insert`, {
        jobId: jobId,
        jobSeekerId: userId
      });

      if (response.data.success) {
        setResultMessage('지원이 완료되었습니다.');
      } else {
        setResultMessage('이미 지원한 공고입니다.');
      }
    } catch (error) {
      console.error('API 요청 오류:', error);
      setResultMessage('지원 중 오류가 발생했습니다.');
    }
    setShowModal(false);
    setShowResultModal(true);
  };

  // 결과 모달 닫기 함수 추가
  const handleCloseResult = () => {
    setShowResultModal(false);
    if (resultMessage === '지원이 완료되었습니다.') {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>채용 공고</Text>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{jobDetail.title}</Text>
          <Text style={styles.companyName} numberOfLines={1} ellipsizeMode="tail">{jobDetail.company_name}</Text>
          
          <View style={styles.highlightSection}>
            <HighlightItem label="근무 지역" value={jobDetail.location} isLocation={true} />
            <HighlightItem label="시급" value={`${formatCurrency(jobDetail.hourly_wage)}원`} />
            <HighlightItem label="지원 마감일" value={formatDate(jobDetail.recruitment_deadline)} />
          </View>

          <View style={styles.section}>
            <SectionTitle title="모집 내용" />
            <InfoItem label="지원 자격" value={jobDetail.qualification_type} />
            <InfoItem label="근무 기간" value={`${formatDate(jobDetail.work_period_start)} ~ ${formatDate(jobDetail.work_period_end)}`} />
          </View>

          <View style={styles.section}>
            <SectionTitle title="지원 방법" />
            <InfoItem label="접수 방법" value={jobDetail.application_method} />
            <InfoItem label="문의 연락처" value={jobDetail.contact_number} />
          </View>

          <View style={styles.section}>
            <SectionTitle title="상세 내용" />
            <Text style={styles.contents}>
              {isContentExpanded
                ? jobDetail.contents
                : jobDetail.contents.slice(0, 100) + '...'}
            </Text>
            <TouchableOpacity onPress={toggleContent} style={styles.toggleButton}>
              <Text style={styles.toggleButtonText}>
                {isContentExpanded ? '접기' : '더 보기'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 진행중인 공고일 때만 지원하기 버튼 표시 */}
          {isActiveJob(jobDetail.recruitment_deadline) && (
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyPress}>
              <Text style={styles.applyButtonText}>지원하기</Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>

      {/* 모달 추가 */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>지원하시겠습니까?</Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleInsertJobStatus}
              >
                <Text style={styles.modalButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 결과 표시 모달 */}
      <Modal
        visible={showResultModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseResult}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseResult}
        >
          <View style={styles.resultModalContent}>
            <Text style={styles.resultText}>{resultMessage}</Text>
            <TouchableOpacity 
              style={styles.resultButton}
              onPress={handleCloseResult}
            >
              <Text style={styles.resultButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const HighlightItem: React.FC<{ label: string; value: string; isLocation?: boolean }> = ({ label, value, isLocation }) => {
  const formatLocationValue = (text: string) => {
    if (isLocation && text.length > 10) {
      const words = text.split(' ');
      const midIndex = Math.ceil(words.length / 2);
      return (
        <>
          <Text style={styles.highlightValue}>{words.slice(0, midIndex).join(' ')}</Text>
          <Text style={styles.highlightValue}>{words.slice(midIndex).join(' ')}</Text>
        </>
      );
    }
    return <Text style={styles.highlightValue}>{value}</Text>;
  };

  return (
    <View style={styles.highlightItem}>
      <Text style={styles.highlightLabel}>{label}</Text>
      {formatLocationValue(value)}
    </View>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#4a90e2',
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#ffffff',
      marginLeft: 16,
    },
    contentContainer: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333333',
      marginBottom: 8,
    },
    companyName: {
      fontSize: 18,
      color: '#4a90e2',
      marginBottom: 24,
      fontWeight: '600',
    },
    highlightSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 16,
      marginBottom: 24,
      elevation: 2,
    },
    highlightItem: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    highlightLabel: {
      fontSize: 14,
      color: '#777777',
      marginBottom: 4,
      textAlign: 'center',
    },
    highlightValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333333',
      textAlign: 'center',
    },
    section: {
      backgroundColor: '#ffffff',
      borderRadius: 8,
      padding: 16,
      marginBottom: 24,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333333',
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
      paddingBottom: 8,
    },
    infoItem: {
      marginBottom: 12,
    },
    infoLabel: {
      fontSize: 14,
      color: '#777777',
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 16,
      color: '#333333',
    },
    contents: {
      fontSize: 16,
      lineHeight: 24,
      color: '#555555',
    },
    toggleButton: {
      marginTop: 8,
      alignSelf: 'flex-start',
    },
    toggleButtonText: {
      color: '#4a90e2',
      fontWeight: 'bold',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 24,
      marginBottom: 32,
      paddingHorizontal: 16,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editButton: {
      backgroundColor: '#4a90e2',
      marginRight: 8,
    },
    deleteButton: {
      backgroundColor: '#e74c3c',
      marginLeft: 8,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    applyButton: {
      backgroundColor: '#4a90e2',
      paddingVertical: 16,
      borderRadius: 8,
      marginHorizontal: 16,
      marginTop: 8,
      marginBottom: 24,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    applyButtonText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 20,
      width: '80%',
      maxWidth: 300,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#333',
    },
    modalButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      marginHorizontal: 5,
    },
    cancelButton: {
      backgroundColor: '#e0e0e0',
    },
    confirmButton: {
      backgroundColor: '#4a90e2',
    },
    modalButtonText: {
      color: '#fff',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
    },
    resultModalContent: {
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 20,
      width: '80%',
      maxWidth: 300,
      alignItems: 'center',
      elevation: 5,
    },
    resultText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 20,
      textAlign: 'center',
    },
    resultButton: {
      backgroundColor: '#4a90e2',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
    },
    resultButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default DetailScreen;
