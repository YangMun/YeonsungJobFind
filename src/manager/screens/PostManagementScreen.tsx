import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, FlatList, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { API_URL } from '../../common/utils/validationUtils';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNPickerSelect from 'react-native-picker-select';


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

interface ParentProps {
}

const DataList: React.FC<ParentProps> = () => {
  const [data, setData] = useState<PostData[]>([]); // PostData 배열 타입으로 설정
  const [loading, setLoading] = useState<boolean>(true); // 로딩 상태 타입을 boolean으로 설정

  // API 데이터 호출 함수
  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/postManagement/selectManagerPostJob`);
      const applications = response.data.results;
      setData(applications);
      // console.log('데이터 가져오기 성공:', response.data); // 데이터 확인
    } catch (error) {
      console.error('데이터를 가져오는 중 오류 발생:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    //console.log('데이터가 변경되었습니다:', data);  // 데이터 상태가 변경될 때마다 출력
    // console.log(Array.isArray(data));
    setLoading(false);
  }, [data]);  // data가 변경될 때마다 실행

  const deletePost = async (id: number) => {
    try {
      console.log(`삭제 요청 시작: ID=${id}`);
      const response = await axios.delete(`${API_URL}/api/postManagement/deleteManagerPostJob/${id}`);
      console.log('서버 응답:', response.status);
  
      if (response.status === 200) {
        setData((prevData) => prevData.filter((item) => item.id !== id));
        Alert.alert('삭제 성공', '글이 성공적으로 삭제되었습니다.');
      } else {
        Alert.alert('삭제 실패', `서버 응답 코드: ${response.status}`);
      }
    } catch (error) {
      console.error('삭제 중 오류 발생:', error);
      Alert.alert('삭제 실패', '글을 삭제하는 중 오류가 발생했습니다.');
    }
  };

  // 삭제 버튼 클릭 시 확인 알림
  const handleDelete = (id: number) => {
    Alert.alert(
      '글 삭제',
      '정말 이 글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', onPress: () => deletePost(id) }, // 삭제 함수 호출
      ]
    );
  };

  const changeData = (listData: PostData[]) => {
    setData(listData);
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
      <ConditionBar changeData={changeData} />
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

interface ChildProps {
  changeData: (listData: PostData[]) => void;
}

const ConditionBar: React.FC<ChildProps> = ({changeData}) => {
  const [selectedValue, setSelectedValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [pointerEvents, setPointerEvents] = useState<'none' | 'auto'>('none'); // TextInput의 pointerEvents 상태

  const handleSearch = async () => {
    setLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}/api/postManagement/selectManagerPostJob`, {
        params: {
          category: selectedValue,
          keyword: keyword,
        },
      });

      // API 호출 성공 시
      const applications = response.data.results;
      setLoading(false);
      // console.log('조회된 데이터:', response.data);
      changeData(applications);

    } catch (error) {
      // API 호출 실패 시
      setLoading(false);
      console.error('API 호출 오류:', error);
      Alert.alert('조회 실패', '데이터를 가져오는 데 오류가 발생했습니다.');
    }
  };

  const handlePickerChange = (value: string) => {
    setSelectedValue(value);
    // 조건에 따라 pointerEvents 변경
    if (value) {
      setPointerEvents('auto'); // 값이 선택되면 입력 가능
    } else {
      setPointerEvents('none'); // 값이 없으면 입력 비활성화
    }
  };

  return (
    <View style={styles.contContainer}>
      <View style={styles.pickerContainer}>
        {/* 조건 선택 */}
        <RNPickerSelect
          onValueChange={handlePickerChange}
          items={[
            { label: '제목', value: '1' },
            { label: '내용', value: '2' },
            { label: '회사명', value: '3' },
          ]}
          placeholder={{
            label: '전체',
            value: '',
            color: '#9EA0A4',
          }}
          style={{
            inputIOS: styles.picker,
            inputAndroid: styles.picker,
          }}
        />
      </View>
      {/* 검색어 입력 */}
      <View style={styles.companyInputContainer}>
        <TextInput
          style={styles.contInput}
          placeholder="검색"
          value={keyword}
          onChangeText={setKeyword}
          pointerEvents={pointerEvents}
        />
      </View>
      {/* 조회 버튼 */}
      <TouchableOpacity style={styles.buttonContainer} onPress={handleSearch}>
        <Text style={styles.buttonText}>조회</Text>
      </TouchableOpacity>
    </View>
  );
};

const PostManagementScreen = () => {
  return (

    <View style={styles.container}>
      <Header />
      <DataList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 10,
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
  contContainer: {
    flexDirection: 'row', // 가로 배치
    alignItems: 'center', // 세로 정렬
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  pickerContainer: {
    marginRight: 10, // 간격 조정
    width: 70,
  },
  picker: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#333',
  },
  companyInputContainer: {
    flex: 1, // 동일한 크기를 위한 flex 설정
    flexDirection: 'row', // "회사:"와 입력창을 가로로 배치
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginRight: 5,
    color: '#333',
  },
  contInput: {
    flex: 1, // 동일한 크기를 위한 flex 설정
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#333',
  },
  buttonContainer: {
    width: 55, // 버튼의 고정 너비 설정
    backgroundColor: '#007BFF', // 파란색 배경
    borderRadius: 8, // 둥근 모서리
    alignItems: 'center', // 텍스트 가운데 정렬
    justifyContent: 'center', // 버튼 텍스트 수직 가운데 정렬
    paddingVertical: 10, // 버튼 높이 설정
    margin: 10,
  },
  buttonText: {
    color: '#fff', // 흰색 텍스트
    fontSize: 16, // 텍스트 크기
    fontWeight: 'bold', // 굵은 텍스트
  },
});

export default PostManagementScreen;


