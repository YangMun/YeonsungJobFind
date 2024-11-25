import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_URL } from '../../common/utils/validationUtils';
import Icon from 'react-native-vector-icons/MaterialIcons';

//헤더
const Header = () => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>게시글 관리</Text>
    </View>
  );
};

// 데이터 타입 정의
interface PostData {
  id: number;
  title: string;
  contents: string;
  company_name: string;
}

const DataList: React.FC = () => {
  const [data, setData] = useState<PostData[]>([]); // PostData 배열 타입으로 설정
  const [loading, setLoading] = useState<boolean>(true); // 로딩 상태 타입을 boolean으로 설정

  // API 데이터 호출 함수
  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/postManagement/getAllPostJob`);
      const applications = response.data.applications;
      setData(applications);
      console.log('데이터 가져오기 성공:', response.data); // 데이터 확인
    } catch (error) {
      console.error('데이터를 가져오는 중 오류 발생:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log('데이터가 변경되었습니다:', data);  // 데이터 상태가 변경될 때마다 출력
    console.log(Array.isArray(data));
    setLoading(false);
  }, [data]);  // data가 변경될 때마다 실행

  // 글 삭제 요청
  const deletePost = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/postManagement/deleteManagerPostJob/${id}`); // DELETE 요청
      setData((prevData) => prevData.filter((item) => item.id !== id)); // UI에서 글 제거
      Alert.alert('삭제 성공', '글이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('삭제 중 오류 발생:', error);
      Alert.alert('삭제 실패', '글을 삭제하는 중 오류가 발생했습니다.');
    }
  };

  // 삭제 버튼 클릭 시 확인 알림
  const handleDelete = (id: number) => {
    deletePost(id);
    Alert.alert(
      '글 삭제',
      '정말 이 글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', onPress: () => deletePost(id) }, // 삭제 함수 호출
      ]
    );
  };

  // 각 항목을 렌더링하는 함수
  const renderItem = ({ item }: { item: PostData }) => (
      <View style={styles.item}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>제목: {item.title}</Text>
          <Text style={styles.contents}>내용: {item.contents}</Text>
          <Text style={styles.company}>회사: {item.company_name}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
        <Icon name="delete" size={24} color="#fff" />
      </TouchableOpacity>
      </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />  // 로딩 스피너 표시
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString() || item.title}
          ListEmptyComponent={<Text>No data available</Text>}
        />
      )}
    </View>
  );
};

interface SearchConditions {
  category: string;
}

interface ConditionBarProps {
  onSearch: (conditions: SearchConditions) => void; // onSearch의 매개변수 타입을 정의
}

const ConditionBar: React.FC<ConditionBarProps> = ({ onSearch }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSearch = () => {
    onSearch({ category: selectedCategory });
  };

  return (
    <View style={styles.conditionBar}>
      <Text style={styles.label}>조건</Text>

      <Picker
        selectedValue={selectedCategory}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
      >
        <Picker.Item label="전체" value="0" />
        <Picker.Item label="구인" value="1" />
        <Picker.Item label="구직" value="2" />
      </Picker>

      <Button title="조회" onPress={handleSearch} />
    </View>
  );
};

const PostManagementScreen = () => {
  const handleSearch = (conditions: any) => {
    console.log('조회 조건:', conditions);
    // 조회 조건에 따라 데이터를 불러오는 로직 추가
  };
  return (

    <View style={styles.container}>
      <Header />
      <ConditionBar onSearch={handleSearch} />
      <DataList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  conditionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f2f2f2',
  },
  label: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  picker: {
    height: 40,
    width: 150,
    marginRight: 10,
  },
  item: {
    margin: 10,  // 항목 간의 간격
    padding: 20,  // 항목 내부 여백
    backgroundColor: '#fff',  // 항목 배경색
    borderRadius: 10,  // 모서리 둥글게
    borderWidth: 1,  // 경계선 추가
    borderColor: '#ddd',  // 경계선 색상
    shadowColor: '#000',  // 그림자 색상
    shadowOffset: { width: 0, height: 2 },  // 그림자 오프셋
    shadowOpacity: 0.1,  // 그림자 투명도
    shadowRadius: 4,  // 그림자 반경
    elevation: 3,  // 안드로이드에서 그림자 효과를 위해
  },
  textContainer: {
    flexDirection: 'column',  // 세로로 항목 나열
    alignItems: 'flex-start',  // 텍스트가 왼쪽에 정렬되도록
  },
  contents: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,  // 각 항목 사이의 간격을 추가
  },
  title: {
    fontSize: 18,
    marginVertical: 5,
  },
  company: {
    fontSize: 14,
    color: 'gray',
  },
  headerContainer: {
    height: 60,
    backgroundColor: '#f5f5f5', // 밝은 배경색
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd', // 연한 하단 테두리
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a73e8', // 파란색 강조 텍스트
  },
  deleteButton: {
    backgroundColor: '#ff4d4f', // 빨간색 버튼
    padding: 4,
    borderRadius: 16, // 둥근 모서리
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3, // Android 그림자
  },
});

export default PostManagementScreen;


