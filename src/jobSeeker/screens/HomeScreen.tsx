import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, SafeAreaView, RefreshControl, Modal, TouchableWithoutFeedback, Platform } from 'react-native';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { API_URL, Job } from '../../common/utils/validationUtils';



type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'JobSeekerMain'>;

const CustomCheckbox: React.FC<{ title: string; checked: boolean; onPress: () => void }> = ({ title, checked, onPress }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
    <View style={[styles.checkbox, checked && styles.checkedBox]}>
      {checked && <Ionicons name="checkmark" size={18} color="white" />}
    </View>
    <Text style={styles.checkboxLabel}>{title}</Text>
  </TouchableOpacity>
);

const HomeScreen: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const fetchJobs = useCallback(async () => {
    try {
      const departments = selectedDepartments.join(',');
      const response = await axios.get(`${API_URL}/api/all-jobs?status=${activeTab}&departments=${departments}`);
      if (response.data.success) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      console.error('API 요청 오류:', error);
    }
  }, [activeTab, selectedDepartments]);

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [fetchJobs])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  }, [fetchJobs]);

  const handleTabPress = (tab: 'active' | 'closed') => {
    setActiveTab(tab);
    fetchJobs();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const truncateContent = (content: string, maxLength: number) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  const renderJobItem = ({ item }: { item: Job }) => (
    <TouchableOpacity 
      style={styles.jobItem}
      onPress={() => navigation.navigate('JobSeekerDetail', { jobId: item.id })}
    >
      <View style={styles.jobItemContent}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <Text style={styles.jobCompany}>{item.company_name}</Text>
        <Text style={styles.jobContent}>{truncateContent(item.contents, 50)}</Text>
        <View style={styles.jobFooter}>
          <Text style={styles.jobDeadline}>마감일: {formatDate(item.recruitment_deadline)}</Text>
          <Text style={styles.jobLocation}>{item.location}</Text>
        </View>
      </View>
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>{'>'}</Text>
      </View>
    </TouchableOpacity>
  );

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/departments`);
      if (response.data.success) {
        setDepartments(response.data.departments);
      }
    } catch (error) {
      console.error('부서 목록 조회 오류:', error);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleFilterPress = () => {
    setShowFilter(!showFilter);
  };

  const handleDepartmentSelect = (department: string) => {
    setSelectedDepartments(prev => 
      prev.includes(department)
        ? prev.filter(d => d !== department)
        : [...prev, department]
    );
  };

  const applyFilter = () => {
    fetchJobs();
    setShowFilter(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          <View style={styles.tabButtonsContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'active' && styles.activeTabButton]}
              onPress={() => handleTabPress('active')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'active' && styles.activeTabButtonText]}>진행중</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'closed' && styles.activeTabButton]}
              onPress={() => handleTabPress('closed')}
            >
              <Text style={[styles.tabButtonText, activeTab === 'closed' && styles.activeTabButtonText]}>마감</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
            <Ionicons name="filter" size={24} color="#4a90e2" />
          </TouchableOpacity>
        </View>
        <Modal
          transparent={true}
          visible={showFilter}
          onRequestClose={() => setShowFilter(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowFilter(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.filterContainer}>
                  <Text style={styles.filterTitle}>부서 필터</Text>
                  {departments.map((department) => (
                    <CustomCheckbox
                      key={department}
                      title={department}
                      checked={selectedDepartments.includes(department)}
                      onPress={() => handleDepartmentSelect(department)}
                    />
                  ))}
                  <TouchableOpacity style={styles.applyFilterButton} onPress={applyFilter}>
                    <Text style={styles.applyFilterButtonText}>필터 적용</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <FlatList
          data={jobs}
          renderItem={renderJobItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#f8f9fa',
    },
    container: {
      flex: 1,
    },
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#f8f9fa',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e3e8',
    },
    tabButtonsContainer: {
      flexDirection: 'row',
    },
    filterButton: {
      padding: 8,
    },
    tabButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      borderRadius: 20,
      backgroundColor: '#e9ecef',
    },
    activeTabButton: {
      backgroundColor: '#4a90e2',
    },
    tabButtonText: {
      fontSize: 14,
      color: '#495057',
      fontWeight: '600',
    },
    activeTabButtonText: {
      color: '#ffffff',
    },
    listContainer: {
      padding: 16,
    },
    jobItem: {
      flexDirection: 'row',
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    jobItemContent: {
      flex: 1,
    },
    jobTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#212529',
    },
    jobCompany: {
      fontSize: 16,
      color: '#4a90e2',
      marginBottom: 8,
    },
    jobContent: {
      fontSize: 14,
      color: '#495057',
      marginBottom: 8,
    },
    jobFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    jobDeadline: {
      fontSize: 14,
      color: '#e74c3c',
      fontWeight: 'bold',
    },
    jobLocation: {
      fontSize: 14,
      color: '#6c757d',
      fontStyle: 'italic',
    },
    arrowContainer: {
      justifyContent: 'center',
      marginLeft: 10,
    },
    arrow: {
      fontSize: 20,
      color: '#adb5bd',
    },
    filterContainer: {
      position: 'absolute',
      top: 60,
      right: 10,
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 5,
      elevation: 5,
      zIndex: 1000,
    },
    filterTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    applyFilterButton: {
      backgroundColor: '#4a90e2',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 10,
    },
    applyFilterButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: '#4a90e2',
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    checkedBox: {
      backgroundColor: '#4a90e2',
    },
    checkboxLabel: {
      fontSize: 16,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
});

export default HomeScreen;
