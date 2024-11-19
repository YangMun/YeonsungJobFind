import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, Platform, Alert } from 'react-native';
import axios from 'axios';
import { API_URL, EmployerInfo, JobSeekerInfo, UserFilterType } from '../../common/utils/validationUtils';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';

const UserManagementScreen = () => {
  const [userFilter, setUserFilter] = useState<UserFilterType>('all');
  const [employers, setEmployers] = useState<EmployerInfo[]>([]);
  const [jobSeekers, setJobSeekers] = useState<JobSeekerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSwipeableId, setOpenSwipeableId] = useState<string | null>(null);
  let prevOpenedSwipeable: Swipeable | null = null;

  useEffect(() => {
    fetchUsers();
  }, [userFilter]);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/users?type=${userFilter}`);
      if (data.success) {
        setEmployers(data.users.employers);
        setJobSeekers(data.users.jobSeekers);
      }
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeOpen = (id: string, ref: Swipeable | null) => {
    if (ref) {
      if (prevOpenedSwipeable && openSwipeableId !== id) {
        prevOpenedSwipeable.close();
      }
      prevOpenedSwipeable = ref;
      setOpenSwipeableId(id);
    }
  };

  const handleDelete = async (id: string, type: 'employer' | 'jobSeeker') => {
    try {
      Alert.alert(
        '사용자 삭제',
        '정말 이 사용자를 삭제하시겠습니까?',
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '삭제',
            style: 'destructive',
            onPress: async () => {
              const response = await axios.delete(`${API_URL}/api/users/${type}/${id}`);
              if (response.data.success) {
                // 삭제 성공 시 목록 새로고침
                fetchUsers();
                // 열려있는 스와이프 닫기
                if (prevOpenedSwipeable) {
                  prevOpenedSwipeable.close();
                }
              } else {
                Alert.alert('오류', '사용자 삭제에 실패했습니다.');
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      Alert.alert('오류', '사용자 삭제 중 오류가 발생했습니다.');
    }
  };

  const renderItem = ({ item }: { item: EmployerInfo | JobSeekerInfo }) => {
    const isEmployer = 'department_name' in item;
    return (
      <Swipeable
        ref={(ref) => openSwipeableId === item.id && ref && (prevOpenedSwipeable = ref)}
        renderRightActions={() => (
          <TouchableOpacity 
            style={styles.deleteContainer}
            onPress={() => handleDelete(item.id, isEmployer ? 'employer' : 'jobSeeker')}
          >
            <View style={styles.deleteButton}>
              <Ionicons name="close-outline" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        )}
        onSwipeableOpen={() => handleSwipeOpen(item.id, prevOpenedSwipeable)}
        overshootRight={false}
        rightThreshold={40}
      >
        <View style={styles.userCard}>
          <View style={styles.userHeader}>
            <Ionicons 
              name={isEmployer ? "business" : "person"} 
              size={24} 
              color="#4a90e2" 
            />
            <Text style={styles.userId}>{item.id}</Text>
          </View>
          <View style={styles.userInfo}>
            {isEmployer ? (
              <>
                <Text style={styles.infoText}>부서: {item.department_name}</Text>
                <Text style={styles.infoText}>연락처: {item.phone_number || '없음'}</Text>
              </>
            ) : null}
            <Text style={styles.infoText}>이메일: {item.email || '없음'}</Text>
          </View>
        </View>
      </Swipeable>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.filterContainer}>
            {['all', 'employer', 'jobSeeker'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.filterButton, userFilter === type && styles.filterButtonActive]}
                onPress={() => setUserFilter(type as UserFilterType)}
              >
                <Text style={[
                  styles.filterButtonText,
                  userFilter === type && styles.filterButtonTextActive
                ]}>
                  {type === 'all' ? '전체' : type === 'employer' ? '구인자' : '구직자'}
                </Text>
                {userFilter === type && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={userFilter === 'jobSeeker' ? jobSeekers : 
                  userFilter === 'employer' ? employers :
                  [...employers, ...jobSeekers]}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? 15 : 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: Platform.OS === 'android' ? 10 : 0,
  },
  filterButton: {
    position: 'relative',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 15,
  },
  filterButtonActive: { backgroundColor: 'transparent' },
  filterButtonText: { fontSize: 16, color: '#999', fontWeight: '500' },
  filterButtonTextActive: { color: '#4a90e2', fontWeight: '600' },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#4a90e2',
    borderRadius: 1,
  },
  listContainer: { padding: 15, backgroundColor: '#f5f7fa' },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  userHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userId: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, color: '#333' },
  userInfo: { marginLeft: 34 },
  infoText: { fontSize: 16, color: '#666', marginBottom: 5 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  deleteContainer: { width: 80, height: '100%', justifyContent: 'center', alignItems: 'center' },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});

export default UserManagementScreen; 