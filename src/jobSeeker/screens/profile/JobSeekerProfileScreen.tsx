import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

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

interface InfoItemProps {
  title: string;
  content: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ title, content }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoItemTitle}>{title}</Text>
    <Text style={styles.infoItemContent}>{content}</Text>
  </View>
);

const JobSeekerProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

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
              <Ionicons name="person-circle" size={100} color="#4a90e2" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>양문경</Text>
              <Text style={styles.details}>남자, 2001 (22세)</Text>
            </View>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>기업이 이력서 열람/제안시 개인정보는 정상 노출됩니다.</Text>
          </View>
          <View style={styles.contactInfo}>
            <ContactItem icon="call" text="010-****-4867" />
            <ContactItem icon="mail" text="yan*****@naver.com" />
            <ContactItem icon="home" text="(18407) 경기 화성시 병점2로" />
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
            <Text style={styles.sectionSubtitle}>대학교(4년) 재학중</Text>
            <View style={styles.educationItem}>
              <Text style={styles.educationName}>연성대학교</Text>
              <Text style={styles.educationPeriod}>2024.03 ~ (편입/재학중)</Text>
            </View>
            <View style={styles.educationDetails}>
              <Text style={styles.educationDetailItem}>지역    경기</Text>
              <Text style={styles.educationDetailItem}>전공    컴퓨터소프트웨어학과</Text>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>경험/활동/교육</Text>
            <View style={styles.experienceItem}>
              <View style={styles.experienceHeader}>
                <Text style={styles.experienceName}>아르바이트</Text>
                <Text style={styles.experiencePeriod}>2021.09 ~ 2022.02</Text>
              </View>
              <Text style={styles.experienceCompany}>기관/장소    NRCTech</Text>
              <Text style={styles.experienceDescription}>활동내용    C#을 이용해 통신모듈 개발</Text>
            </View>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>자격/어학/수상</Text>
            <View style={styles.certificationContainer}>
              <Text style={styles.certificationCategory}>자격/면허</Text>
              <View style={styles.certificationItem}>
                <View style={styles.certificationHeader}>
                  <Text style={styles.certificationName}>SQL개발자(SQLD자격)</Text>
                  <Text style={styles.certificationDate}>2021.06</Text>
                </View>
                <Text style={styles.certificationIssuer}>발행처/기관    한국데이터베이스진흥센터</Text>
                <Text style={styles.certificationGrade}>합격구분    최종합격</Text>
              </View>
              <View style={styles.certificationItem}>
                <View style={styles.certificationHeader}>
                  <Text style={styles.certificationName}>데이터분석준전문가(ADsP)</Text>
                  <Text style={styles.certificationDate}>2022.06</Text>
                </View>
                <Text style={styles.certificationIssuer}>발행처/기관    한국데이터베이스진흥원</Text>
                <Text style={styles.certificationGrade}>합격구분    최종합격</Text>
              </View>
              <View style={styles.certificationItem}>
                <View style={styles.certificationHeader}>
                  <Text style={styles.certificationName}> 컴퓨터활용능력 2급 </Text>
                  <Text style={styles.certificationDate}>2021.07</Text>
                </View>
                <Text style={styles.certificationIssuer}>발행처/기관    대한상공회의소</Text>
                <Text style={styles.certificationGrade}>합격구분    최종합격</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>자기소개서</Text>
            <View style={styles.introductionItem}>
              <Text style={styles.introductionTitle}>내용</Text>
              <Text style={styles.introductionContent}>
                개인 프로젝트를 할 당시 API를 이용해 Data를 DB에 저장하고 그 값을 추출하며 자동화 프로그램을 개발하는 작업을 수행���습니다. 경험을 통해 데이터 관리와 처리에 대한 이해를 높일 수 있었습니다.
              </Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>지원동기</Text>
            <View style={styles.motivationItem}>
              <Text style={styles.motivationTitle}>내용</Text>
              <Text style={styles.motivationContent}>
                개인 프로젝트를 할 당시 API를 이용해 Data를 DB에 저장하고 그 값을 추출하며 자동화 프로그램을 개발하는 작업을 수행했습니다. 경험을 통해 데이터 관리와 처리에 대한 이해를 높일 수 있었습니다.
              </Text>
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
  careerContent: {
    fontSize: 16,
    lineHeight: 24,
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
});

export default JobSeekerProfileScreen;