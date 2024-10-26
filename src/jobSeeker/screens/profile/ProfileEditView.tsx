import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Image, ScrollView, Modal, TouchableWithoutFeedback, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { ActivityItem } from '../../../common/utils/validationUtils';

type RootStackParamList = {
  NormalInfo: undefined;
  MyCareerEditView: { initialCareerText: string };
  GradInfo: { mode: 'add' | 'edit'; educationInfo?: {
    universityType: string;
    schoolName: string;
    region: string;
    admissionDate: string;
    graduationDate: string;
    graduationStatus: string;
    major: string;
  } };
  ExperienceActivityEducationForm: { 
    mode: 'add' | 'edit'; 
    activity?: ActivityItem 
  };
};

const ProfileEditView = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { userId } = useAuth();
  const [resumeTitle, setResumeTitle] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [careerText, setCareerText] = useState('');
  const [educationSummary, setEducationSummary] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [graduationDate, setGraduationDate] = useState('');
  const [hasEducationInfo, setHasEducationInfo] = useState(false);
  const [experienceActivities, setExperienceActivities] = useState<ActivityItem[]>([]);
  const [activityCount, setActivityCount] = useState(0);

  useEffect(() => {
    fetchProfileSummary();
    fetchEducationInfo();
    fetchExperienceActivities();
  }, []);

  const fetchProfileSummary = async () => {
    if (!userId) return;

    try {
      const response = await axios.get(`http://localhost:3000/api/jobseeker-profile-summary/${userId}`);
      if (response.data.success) {
        setProfileName(response.data.profile.name || '이름 없음');
        setProfileImage(response.data.profile.image ? `http://localhost:3000/uploads/${response.data.profile.image}` : null);
      }
    } catch (error) {
      console.error('프로필 요약 정보 조회 오류:', error);
    }
  };

  const fetchEducationInfo = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await axios.get(`http://localhost:3000/api/get-education-info/${userId}`);
      if (response.data.success) {
        const { university_type, graduation_status, school_name, admission_date, graduation_date } = response.data.info;
        setEducationSummary(`${university_type} ${graduation_status}`);
        setSchoolName(school_name);
        setAdmissionDate(admission_date);
        setGraduationDate(graduation_date);
        setHasEducationInfo(true);
      } else {
        setHasEducationInfo(false);
      }
    } catch (error) {
      console.error('교육 정보 조회 오류:', error);
      setHasEducationInfo(false);
    }
  }, [userId]);

  const fetchExperienceActivities = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await axios.get(`http://localhost:3000/api/get-experience-activities/${userId}`);
      if (response.data.success) {
        setExperienceActivities(response.data.activities);
        setActivityCount(response.data.count);
      }
    } catch (error) {
      console.error('경험/활동/교육 정보 조회 오류:', error);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchEducationInfo();
      fetchExperienceActivities();
    }, [fetchEducationInfo, fetchExperienceActivities])
  );

  const handleNavigateToNormalInfo = () => {
    navigation.navigate('NormalInfo');
  };

  const handleAddEducation = () => {
    navigation.navigate('GradInfo', { mode: 'add' });
  };

  const handleEditEducation = () => {
    navigation.navigate('GradInfo', { 
      mode: 'edit',
      educationInfo: {
        universityType: educationSummary.split(' ')[0],
        schoolName: schoolName,
        region: '', // 지역 정보가 없다면 빈 문자열로 설정
        admissionDate: admissionDate,
        graduationDate: graduationDate,
        graduationStatus: educationSummary.split(' ')[1],
        major: '', // 전공 정 없다면 빈 문자열로 설정
      }
    });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const updatedCareerText = (route.params as { updatedCareerText?: string })?.updatedCareerText;
      if (updatedCareerText !== undefined) {
        setCareerText(updatedCareerText);
      }
    });

    return unsubscribe;
  }, [navigation, route.params]);

  const handleNavigateToMyCareerEdit = () => {
    navigation.navigate('MyCareerEditView', { initialCareerText: careerText });
  };

  const handleAddExperienceActivityEducation = () => {
    navigation.navigate('ExperienceActivityEducationForm', { mode: 'add' });
  };

  const handleEditExperienceActivityEducation = (activity: ActivityItem) => {
    navigation.navigate('ExperienceActivityEducationForm', { mode: 'edit', activity });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>이력서 수정</Text>
        </View>
        <View style={styles.resumeTitleContainer}>
          <Text style={styles.resumeTitleLabel}>이력서 제목</Text>
          <TextInput
            style={styles.resumeTitleInput}
            placeholder="제목을 입력하세요"
            value={resumeTitle}
            onChangeText={setResumeTitle}
          />
        </View>
        <TouchableOpacity style={styles.profileContainer} onPress={handleNavigateToNormalInfo}>
          <Image
            source={profileImage ? { uri: profileImage } : require('../../../assets/default-profile.jpg')}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileName}</Text>
            <Text style={styles.profileStatus}>작성중</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.careerSection}>
          <View style={styles.careerHeader}>
            <Text style={styles.careerTitle}>My career</Text>
            <Text style={styles.careerSubtitle}>커리어 소개와 핵심역량을 입력해보세요</Text>
          </View>
          <View style={styles.careerContent}>
            <View style={styles.careerContentHeader}>
              <TouchableOpacity 
                style={styles.moreButton}
                onPress={handleNavigateToMyCareerEdit}
              >
                <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.careerTextContainer}>
              <Text style={styles.careerText}>{careerText || '커리어 정보를 입력해주세요.'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.educationSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>학력</Text>
              <Text style={styles.requiredText}>필수</Text>
            </View>
            {!hasEducationInfo && (
              <TouchableOpacity style={styles.addButton} onPress={handleAddEducation}>
                <Ionicons name="add" size={24} color="#4a90e2" />
              </TouchableOpacity>
            )}
          </View>
          {hasEducationInfo ? (
            <View style={styles.educationInfoContainer}>
              <View style={styles.educationDetailContainer}>
                <Text style={styles.educationLabel}>최종학력</Text>
                <Text style={styles.educationValue}>{schoolName}</Text>
                <TouchableOpacity onPress={handleEditEducation}>
                  <Ionicons name="ellipsis-vertical" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <Text style={styles.educationPeriod}>{`${admissionDate} ~ ${graduationDate}`}</Text>
              <Text style={styles.educationSummary}>{educationSummary}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.experienceSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>경험/활동/교육</Text>
              <Text style={styles.itemCount}>{experienceActivities.length}</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddExperienceActivityEducation}>
              <Ionicons name="add" size={24} color="#4a90e2" />
            </TouchableOpacity>
          </View>
          {experienceActivities.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityHeader}>
                <View style={styles.activityTitleContainer}>
                  <Text style={styles.activityOrganization}>{activity.organization}</Text>
                  <Text style={styles.activityType}>({activity.activity_type})</Text>
                </View>
                <TouchableOpacity 
                  style={styles.moreButton}
                  onPress={() => handleEditExperienceActivityEducation(activity)}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <Text style={styles.activityPeriod}>{`${activity.start_date} ~ ${activity.end_date}`}</Text>
              <Text style={styles.activityDescription} numberOfLines={2}>{activity.description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resumeTitleContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resumeTitleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resumeTitleInput: {
    fontSize: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileStatus: {
    top: 5,
    fontSize: 14,
    color: '#666',
  },
  careerSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  careerHeader: {
    marginBottom: 16,
  },
  careerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  careerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  careerContent: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
  },
  careerContentHeader: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  moreButton: {
    padding: 4,
  },
  careerTextContainer: {
    minHeight: 100,
  },
  careerText: {
    fontSize: 16,
    color: '#333',
  },
  educationSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  requiredText: {
    fontSize: 14,
    color: 'red',
    fontWeight: 'bold',
  },
  addButton: {
    padding: 4,
  },
  educationInfoContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  educationDetailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  educationLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  educationValue: {
    fontSize: 16,
    flex: 1,
    marginLeft: 8,
  },
  educationPeriod: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  educationSummary: {
    fontSize: 14,
    color: '#4a90e2',
    marginTop: 4,
  },
  experienceSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemCount: {
    fontSize: 18,
    color: '#666',
  },
  activityItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityOrganization: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityType: {
    fontSize: 14,
    color: '#4a90e2',
    marginLeft: 4,
  },
  activityPeriod: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#333',
  },
});

export default ProfileEditView;
