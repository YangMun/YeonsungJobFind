import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_URL } from '../common/utils/validationUtils';


// 데이터 타입 정의
interface DataItem {
  id: number;
  title: string;
  company_name: string;
}

const DataList: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]); // DataItem 배열 타입으로 설정
  const [loading, setLoading] = useState<boolean>(true); // 로딩 상태 타입을 boolean으로 설정

  // API 데이터 호출 함수
  const fetchData = async () => {
    try {
      const response = await axios.get<DataItem[]>(`${API_URL}/api/postManagement/getAllPostJob`); // 실제 API URL로 변경
      setData(response.data);
      console.log(response.data);
      setLoading(false);
    } catch (error) {
      console.error('데이터를 가져오는 중 오류 발생:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 각 항목을 렌더링하는 함수
  const renderItem = ({ item }: { item: DataItem }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.company}>{item.company_name}</Text>
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
          keyExtractor={(item) => item.id.toString()}
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
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  company: {
    fontSize: 14,
    color: '#555',
  },
});

export default PostManagementScreen;


