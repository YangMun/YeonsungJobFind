import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/AppNavigator';

type DetailScreenRouteProp = RouteProp<RootStackParamList, 'JobSeekerDetail'>;
type DetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'JobSeekerDetail'>;

type Props = {
  route: DetailScreenRouteProp;
  navigation: DetailScreenNavigationProp;
};

interface JobDetail {
  id: number;
  title: string;
  contents: string;
  company_name: string;
  location: string;
  qualification_type: string;
  work_period_start: string;
  work_period_end: string;
  recruitment_deadline: string;
  hourly_wage: number;
  application_method: string;
  contact_number: string;
}

const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000' 
  : 'http://localhost:3000';

const DetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { jobId } = route.params;
  const [jobDetail, setJobDetail] = useState<JobDetail | null>(null);
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const baseURL = Platform.select({
          ios: 'http://localhost:3000',
          android: 'http://10.0.2.2:3000',
          default: 'http://localhost:3000'
        });
        const response = await axios.get(`${baseURL}/api/job-detail/${jobId}`);
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
        </View>
      </ScrollView>
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
  });

export default DetailScreen;
