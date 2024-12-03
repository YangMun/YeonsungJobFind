import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_URL } from '../../common/utils/validationUtils';

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

  // 각 항목을 렌더링하는 함수
  const renderItem = ({ item }: { item: PostData }) => (
    <View style={styles.item}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>제목: {item.title}</Text>
        <Text style={styles.contents}>내용: {item.contents}</Text>
        <Text style={styles.company}>회사: {item.company_name}</Text>
      </View>
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
});

export default PostManagementScreen;


