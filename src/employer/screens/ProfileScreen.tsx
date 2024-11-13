/**
 * ProfileScreen.tsx
 * 
 * 이 컴포넌트는 구인자의 프로필 정보를 표시하고 관리하는 화면입니다.
 * 구인자는 이 화면에서 자신의 정보를 확인하고 수정할 수 있습니다.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { API_URL, ProfileData } from '../../common/utils/validationUtils';



// RootStackParamList 타입을 정의합니다. 실제 네비게이션 구조에 맞게 조정해야 합니다.
type RootStackParamList = {
  Login: undefined;
};

const ProfileScreen: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPhone, setEditedPhone] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const { userId, logout } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (userId) {  // userId가 존재할 때만 프로필 데이터를 가져옵니다.
      fetchProfileData();
    }
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/employer-profile/${userId}`);
      if (response.data.success) {
        setProfileData(response.data.profile);
        setEditedPhone(response.data.profile.phone_number);
        setEditedEmail(response.data.profile.email);
      } else {
        console.error('프로필 데이터를 가져오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 데이터를 가져오는 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (isEditing) {
      try {
        const response = await axios.put(`${API_URL}/api/update-employer-profile/${userId}`, {
          phone_number: editedPhone,
          email: editedEmail,
        });
        if (response.data.success) {
          setProfileData(prevData => ({
            ...prevData!,
            phone_number: editedPhone,
            email: editedEmail,
          }));
          console.log('프로필이 성공적으로 업데이트되었습니다.');
        } else {
          console.error('프로필 업데이트에 실패했습니다.');
        }
      } catch (error) {
        console.error('프로필 업데이트 중 오류 발생:', error);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleDelete = () => {
    Alert.alert(
      "계정 삭제",
      "정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 구인 공고도 함께 삭제됩니다.",
      [
        {
          text: "취소",
          style: "cancel"
        },
        { 
          text: "삭제", 
          onPress: async () => {
            try {
              const response = await axios.delete(`${API_URL}/api/delete-employer/${userId}`);
              if (response.data.success) {
                Alert.alert("삭제 완료", "계정이 성공적으로 삭제되었습니다.", [
                  {
                    text: "확인",
                    onPress: () => {
                      logout(); // AuthContext의 logout 함수 호출
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                      });
                    }
                  }
                ]);
              } else {
                Alert.alert("오류", "계정 삭제 중 문제가 발생했습니다.");
              }
            } catch (error) {
              console.error('계정 삭제 중 오류 발생:', error);
              Alert.alert("오류", "서버 오류가 발생했습니다.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "로그아웃",
      "정말로 로그아웃 하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel"
        },
        {
          text: "로그아웃",
          onPress: () => {
            logout(); // AuthContext의 logout 함수 호출
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Ionicons name="person-circle-outline" size={100} color="#777" />
        </View>
        <Text style={styles.department}>{profileData?.department_name}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <InfoItem 
          icon="call-outline" 
          label="전화번호" 
          value={profileData?.phone_number || '없음'} 
          isEditing={isEditing}
          editedValue={editedPhone}
          onChangeText={setEditedPhone}
        />
        <InfoItem 
          icon="mail-outline" 
          label="이메일" 
          value={profileData?.email || '없음'} 
          isEditing={isEditing}
          editedValue={editedEmail}
          onChangeText={setEditedEmail}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isEditing ? styles.confirmButton : styles.editButton]} 
          onPress={handleEdit}
        >
          <Text style={styles.buttonText}>{isEditing ? '확인' : '편집'}</Text>
        </TouchableOpacity>
        
        {isEditing ? (
          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]} 
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>삭제</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]} 
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>로그아웃</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const InfoItem: React.FC<{ 
  icon: string; 
  label: string; 
  value: string;
  isEditing: boolean;
  editedValue: string;
  onChangeText: (text: string) => void;
}> = ({ icon, label, value, isEditing, editedValue, onChangeText }) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={24} color="#777" style={styles.infoIcon} />
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.infoInput}
          value={editedValue}
          onChangeText={onChangeText}
        />
      ) : (
        <Text style={styles.infoValue}>{value}</Text>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  department: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoIcon: {
    marginRight: 15,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#777',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 2,
  },
  infoInput: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: '#FF9500',
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
});

export default ProfileScreen;
