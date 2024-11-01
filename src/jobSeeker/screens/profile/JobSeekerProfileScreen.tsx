import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { API_URL, NormalInfoDisplay, maskPhoneNumber, maskEmail, convertGradInfo, GradInfoDisplay, ExperienceActivityData, convertExperienceActivity, CertificationData, convertCertification, CareerStatement } from '../../../common/utils/validationUtils';

interface ContactItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

const ContactItem: React.FC<ContactItemProps> = ({ icon, text }) => (
  <View style={styles.contactItem}>
    <Ionicons name={icon} size={24} color="#4a90e2" style={styles.contactIcon} />
    <Text style={styles.contactText}>{text}</Text>
  </View>
);

const JobSeekerProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { userId } = useAuth();
  const [profileInfo, setProfileInfo] = useState<NormalInfoDisplay | null>(null);
  const [gradInfo, setGradInfo] = useState<GradInfoDisplay | null>(null);
  const [experienceActivities, setExperienceActivities] = useState<ExperienceActivityData[]>([]);
  const [certifications, setCertifications] = useState<CertificationData[]>([]);
  const [careerStatement, setCareerStatement] = useState<CareerStatement | null>(null);

  // 한국 나이 계산 함수
  const calculateKoreanAge = (birthYear: string) => {
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(birthYear) + 1;
  };

  const fetchProfileInfo = async () => {
    try {
      const [normalResponse, gradResponse, experienceResponse, certificationResponse, careerResponse] = await Promise.all([
        axios.get(`${API_URL}/api/get-normal-info/${userId}`),
        axios.get(`${API_URL}/api/get-education-info/${userId}`),
        axios.get(`${API_URL}/api/get-experience-activities/${userId}`),
        axios.get(`${API_URL}/api/get-certifications/${userId}`),
        axios.get(`${API_URL}/api/get-career-statement/${userId}`)
      ]);

      if (normalResponse.data.success) {
        setProfileInfo(normalResponse.data.info);
      }
      if (gradResponse.data.success) {
        setGradInfo(convertGradInfo(gradResponse.data.info));
      }
      if (experienceResponse.data.success) {
        setExperienceActivities(experienceResponse.data.activities.map(convertExperienceActivity));
      }
      if (certificationResponse.data.success) {
        setCertifications(certificationResponse.data.certifications.map(convertCertification));
      }
      if (careerResponse.data.success) {
        setCareerStatement(careerResponse.data.careerStatement);
      }
    } catch (error) {
      console.error('프로필 정보 조회 실패:', error);
    }
  };

  // useEffect를 useFocusEffect로 변경
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        fetchProfileInfo();
      }
    }, [userId])
  );

  const handleEditProfile = () => {
    navigation.navigate('ProfileEditView');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>[보충역 지원] 지속적인 도전을 통해 한 층 ...</Text>
          </View>
          <View style={styles.profileContainer}>
            <View style={styles.profileImageContainer}>
              {profileInfo?.image ? (
                <Image
                  source={{ uri: `${API_URL}/uploads/${profileInfo.image}` }}
                  style={styles.profileImage}
                />
              ) : (
                <Ionicons name="person-circle" size={100} color="#4a90e2" />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profileInfo?.name || '이름 없음'}</Text>
              <Text style={styles.details}>
                {profileInfo ? 
                  `${profileInfo.gender}, ${profileInfo.birthDate.substring(0, 4)} (${calculateKoreanAge(profileInfo.birthDate.substring(0, 4))}세)` 
                  : '정보 없음'}
              </Text>
            </View>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>기업이 이력서 열람/제안시 개인정보는 정상 노출됩니다.</Text>
          </View>
          <View style={styles.contactInfo}>
            <ContactItem 
              icon="call" 
              text={profileInfo?.phone ? 
                maskPhoneNumber(profileInfo.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')) : 
                '전화번호 없음'
              } 
            />
            <ContactItem 
              icon="mail" 
              text={profileInfo?.email ? maskEmail(profileInfo.email) : '이메일 없음'} 
            />

          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My career</Text>
            <Text style={styles.careerContent}>
              SQL 및 Python 기술을 보유한 신입입니다. 연성대학교에서 컴퓨터 소프트웨어과를 전공하여 2024년 2월에 졸업 예정입니다.{'\n\n'}
              2024년 3월 전공 심화반으로 4학년 재학 예정이며, sqld를 취득하고 현재 sqlp에 도전하고 있습니다.
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>학력</Text>
            <Text style={styles.sectionSubtitle}>
              {gradInfo ? `${gradInfo.universityType} ${gradInfo.graduationStatus}` : '학력 정보 없음'}
            </Text>
            <View style={styles.educationItem}>
              <Text style={styles.educationName}>
                {gradInfo?.schoolName || '학교명 없음'}
              </Text>
              <Text style={styles.educationPeriod}>
                {gradInfo ? 
                  `${gradInfo.admissionDate} ~ ${gradInfo.graduationDate || '정보 없음'}` : 
                  '기간 정보 없음'}
              </Text>
            </View>
            <View style={styles.educationDetails}>
              <Text style={styles.educationDetailItem}>
                지역    {gradInfo?.region || '지역 정보 없음'}
              </Text>
              <Text style={styles.educationDetailItem}>
                전공    {gradInfo?.major || '전공 정보 없음'}
              </Text>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>경험/활동/교육</Text>
            {experienceActivities.map((activity, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.experienceName}>{activity.activityType}</Text>
                  <Text style={styles.experiencePeriod}>{`${activity.startDate} ~ ${activity.endDate}`}</Text>
                </View>
                <View style={styles.experienceDetails}>
                  <View style={styles.experienceRow}>
                    <Text style={styles.experienceLabel}>기관/장소</Text>
                    <Text style={styles.experienceValue}>{activity.organization}</Text>
                  </View>
                  <View style={styles.experienceRow}>
                    <Text style={styles.experienceLabel}>활동내용</Text>
                    <Text style={styles.experienceValue}>{activity.description}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>자격/어학/수상</Text>
            <View style={styles.certificationContainer}>
              <Text style={styles.certificationCategory}>자격/면허</Text>
              {certifications.map((cert, index) => (
                <View key={index} style={styles.certificationItem}>
                  <View style={styles.certificationHeader}>
                    <Text style={styles.certificationName}>{cert.certificationName}</Text>
                    <Text style={styles.certificationDate}>{cert.acquisitionDate}</Text>
                  </View>
                  <Text style={styles.certificationIssuer}>
                    발행처/기관    {cert.issuingOrganization}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>자기소개서</Text>
            <View style={styles.careerStatementContainer}>
              {careerStatement && (
                <>
                  <View style={styles.statementSection}>
                    <Text style={styles.statementTitle}>성장과정</Text>
                    <View style={styles.statementContent}>
                      <Text style={styles.statementText}>{careerStatement.growth_process}</Text>
                    </View>
                  </View>

                  <View style={styles.statementSection}>
                    <Text style={styles.statementTitle}>성격(장단점)</Text>
                    <View style={styles.statementContent}>
                      <Text style={styles.statementText}>{careerStatement.personality}</Text>
                    </View>
                  </View>

                  <View style={styles.statementSection}>
                    <Text style={styles.statementTitle}>지원동기</Text>
                    <View style={styles.statementContent}>
                      <Text style={styles.statementText}>{careerStatement.motivation}</Text>
                    </View>
                  </View>

                  <View style={styles.statementSection}>
                    <Text style={styles.statementTitle}>입사 후 포부</Text>
                    <View style={styles.statementContent}>
                      <Text style={styles.statementText}>{careerStatement.aspiration}</Text>
                    </View>
                  </View>

                  <View style={styles.statementSection}>
                    <Text style={styles.statementTitle}>경력사항</Text>
                    <View style={styles.statementContent}>
                      <Text style={styles.statementText}>{careerStatement.career_history}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.fixedButton}>
          <Text style={styles.fixedButtonText}>희망근무조건 수정</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.fixedButton, styles.primaryButton]}
          onPress={handleEditProfile}
        >
          <Text style={[styles.fixedButtonText, styles.primaryButtonText]}>이력서 수정하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100, // 하단 버튼을 가리지 않도록 여백 추가
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 16,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: '#e6f3ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    color: '#4a90e2',
  },
  contactInfo: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
    marginRight: 12,
  },
  contactText: {
    fontSize: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItemTitle: {
    fontSize: 16,
    color: '#666',
  },
  infoItemContent: {
    fontSize: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#4a90e2',
    marginBottom: 12,
  },
  educationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  educationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  educationPeriod: {
    fontSize: 14,
    color: '#666',
  },
  educationDetails: {
    marginTop: 8,
  },
  educationDetailItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  experienceContent: {
    fontSize: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillItem: {
    backgroundColor: '#e6f3ff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  skillText: {
    color: '#4a90e2',
    fontSize: 14,
  },
  experienceItem: {
    marginBottom: 16,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  experienceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  experiencePeriod: {
    fontSize: 14,
    color: '#666',
  },
  experienceCompany: {
    fontSize: 14,
    marginBottom: 4,
  },
  experienceDescription: {
    fontSize: 14,
  },
  certificationContainer: {
    marginTop: 8,
  },
  certificationCategory: {
    fontSize: 16,
    color: '#4a90e2',
    marginBottom: 12,
  },
  certificationItem: {
    marginBottom: 16,
  },
  certificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  certificationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  certificationDate: {
    fontSize: 14,
    color: '#666',
  },
  certificationIssuer: {
    fontSize: 14,
    marginBottom: 4,
  },
  certificationGrade: {
    fontSize: 14,
  },
  introductionItem: {
    marginBottom: 16,
  },
  introductionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  introductionContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  motivationItem: {
    marginBottom: 16,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  motivationContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  fixedButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  fixedButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#4a90e2',
  },
  primaryButtonText: {
    color: 'white',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  experienceDetails: {
    marginTop: 8,
  },
  experienceRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  experienceLabel: {
    width: 80,
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  experienceValue: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  careerStatementContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statementSection: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  statementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 8,
  },
  statementContent: {
    backgroundColor: 'white',
    borderRadius: 4,
  },
  statementText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
});

export default JobSeekerProfileScreen;