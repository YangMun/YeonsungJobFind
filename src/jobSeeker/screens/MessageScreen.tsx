import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, Modal, FlatList, Image, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {Message} from '../../common/utils/validationUtils';
// import bmo from '../../assets/bmo.png'
// 미리 정의된 응답들
const predefinedResponses = {
  '지원 방법': '채용공고 상세페이지에서 지원하기 버튼을 클릭하시면 됩니다.',
  '캠퍼스 지도': { type: 'image', source: require('../../assets/loadMap.png') },
  '이력서': '프로필 > 이력서 수정하기에서 이력서를 작성하실 수 있습니다.',
  '면접 서류 발급처': '학생복지센터 > One-stop Service Center 에서 받을 수 있습니다.',
  '채용 절차': '1.모집 공고 지원\n2.면접 요망시 서류 지참하여 해당 부서 방문\n3.서류 One-stop에 제출 후 안내받기',
};

// 선택 메뉴 옵션 추가
const menuOptions = [
  { id: '1', icon: '➕', title: '지원 방법' },
  { id: '2', icon: '🗺️', title: '캠퍼스 지도' },
  { id: '3', icon: '📄', title: '이력서' },
  { id: '4', icon: 'ℹ️', title: '면접 서류 발급처' },
  { id: '5', icon: '📌', title: '채용 절차' },
  // 추후에 추가
];

// 건물 옵션 추가
const buildingOptions = [
  { 
    id: 'b1', 
    title: '공학 1관',
    departments: [
      '전자공학과',
      '정보통신과',
      '전기과',
      '컴퓨터소프트웨어과'
    ]
  },
  { 
    id: 'b2', 
    title: '공학 2관',
    departments: [
      '스포츠재활과',
      '공학계열 강의실/실습실',
      '실내체육관'
    ]
  },
  { 
    id: 'b3', 
    title: '도의관',
    departments: [
      '응급구조과',
      '경찰경호보안과',
      '군사학과',
      '총학생회',
      '대의원회',
      '신문방송국',
      '동아리실'
    ]
  },
  { 
    id: 'b4', 
    title: '식품과학관',
    departments: [
      '식품영양학과',
      '카페베이커리과',
      '호텔외식조리과 (호텔조리전공)',
      '호텔외식조리과 (호텔외식경영전공)'
    ]
  },
  { 
    id: 'b5', 
    title: '대학 본관',
    departments: [
      '혁신지원사업단',
      '기획처',
      '산학협력처',
      '산학협력단',
      '현장실습지원센터',
      '창업교육지원센터',
      '교무처',
      '교육혁신본부',
      '교양교육혁신센터',
      '학사학위지원센터',
      '입학홍보처',
      '행정지원처',
      '법인사무처',
      '역사홍보관',
      '유통물류과',
      '경영학과',
      '세무회계과'
    ]
  },
  { 
    id: 'b6', 
    title: '창조관',
    departments: [
      '치위생과',
      '치기공과',
      '건축과',
      '실내건축과',
      '항공서비스과',
      '호텔관광과',
      '관광영어과',
      '보건의료행정과'
    ]
  },
  { 
    id: 'b7', 
    title: '문화 1관',
    departments: [
      '패션디자인비즈니스과',
      '뷰티스타일리스트과 (헤어디자인전공)',
      '뷰티스타일리스트과 (메이크업전공)',
      '뷰티스타일리스트과 (스킨케어전공)'
    ]
  },
  { 
    id: 'b8', 
    title: '문화 2관',
    departments: [
      '시각디자인과',
      '영상콘텐츠과',
      'K-POP과'
    ]
  },
  { 
    id: 'b9', 
    title: '학술 정보관',
    departments: [
      '도서관'
    ]
  },
  { 
    id: 'b10', 
    title: '자연 과학관',
    departments: [
      '반려동물보건과',
      '반려동물산업과'
    ]
  },
  { 
    id: 'b11', 
    title: '학생복지센터',
    departments: [
      '학생취업처',
      '학생상담센터',
      '원스톱서비스센터',
      '커리어라운지',
      '잼카페',
      'e-mart24',
      '학생식당',
      '교직원식당',
      '서점'
    ]
  },
  { 
    id: 'b12', 
    title: '연곡문화센터',
    departments: [
      '생활관',
      '평생교육원',
      '국제교류원',
      '유아교육과',
      '유아특수재활과',
      '사회복지과 (사회복지전공)',
      '사회복지과 (아동심리보육전공)',
      '게임콘텐츠과',
      '웹툰만화콘텐츠과',
      '사회복지경영과'
    ]
  },
  { 
    id: 'b13', 
    title: '창의교육센터',
    departments: [
      '교수학습지원센터',
      '카페 플래닛 37'
    ]
  }
];

const MessageScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  // 메시지가 업데이트될 때마다 스크롤 내리기
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // 탭이 포커스될 때마 메시지 초기화 및 초기 메시지 설정
  useFocusEffect(
    React.useCallback(() => {
      // 초기화
      setInputText('');
      
      // 초기 봇 메시지 설정
      const initialBotMessage: Message = {
        id: Date.now().toString(),
        text: '안녕하세요! 무엇을 도와드릴까요?',
        isUser: false,
      };
      
      setMessages([initialBotMessage]);
    }, [])
  );

  const handleSend = () => {
    if (!inputText.trim()) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };

    // 봇 응답 기
    let botResponse: string | { type: string; source: any } = '죄송합니다. 해당 질문에 대한 답변을 찾을 수 없습니다.';
    Object.entries(predefinedResponses).forEach(([question, answer]) => {
      if (inputText.includes(question)) {
        botResponse = answer;
      }
    });

    // 봇 메시지 추가
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      ...(typeof botResponse === 'string'
        ? { text: botResponse }
        : { image: (botResponse as { source: any }).source }),
      isUser: false,
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setInputText('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 이미지 모달 추가 */}
        <Modal
          visible={selectedImage !== null}
          transparent={true}
          onRequestClose={() => setSelectedImage(null)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedImage(null)}
          >
            <Image 
              source={selectedImage} 
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Modal>

        {showMenu && (
          <View style={styles.menuOverlay}>
            <View style={styles.menuHeader}>
              <TouchableOpacity onPress={() => setShowMenu(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.menuTitle}>궁금한 내용을 선택해 주세요.</Text>
            </View>
            <View style={styles.menuGrid}>
              {menuOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    const userMessage: Message = {
                      id: Date.now().toString(),
                      text: option.title,
                      isUser: true,
                    };
                    
                    if (option.title === '캠퍼스 지도') {
                      const botImageMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        image: (predefinedResponses[option.title] as {source: any}).source,
                        isUser: false,
                      };
                      
                      const botOptionsMessage: Message = {
                        id: (Date.now() + 2).toString(),
                        text: '원하시는 건물을 선택해주세요:',
                        isUser: false,
                        buildingOptions: true,
                      };
                      
                      setMessages(prev => [...prev, userMessage, botImageMessage, botOptionsMessage]);
                    } else {
                      const botMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        ...(typeof predefinedResponses[option.title as keyof typeof predefinedResponses] === 'object' 
                          ? { image: (predefinedResponses[option.title as keyof typeof predefinedResponses] as {source: any}).source }
                          : { text: predefinedResponses[option.title as keyof typeof predefinedResponses] as string }
                        ),
                        isUser: false,
                      };
                      
                      setMessages(prev => [...prev, userMessage, botMessage]);
                    }
                  }}
                >
                  <Text style={styles.menuIcon}>{option.icon}</Text>
                  <Text style={styles.menuText}>{option.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        <FlatList
          ref={flatListRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          data={messages}
          keyExtractor={(item: Message) => item.id}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }: { item: Message }) => (
            <View style={[
              styles.messageContainer,
              item.isUser ? styles.userMessage : styles.botMessage
            ]}>
              {!item.isUser && (
                <Image 
                  source={require('../../assets/bmo.png')}
                  style={styles.botIcon}
                />
              )}
              <View style={[
                styles.messageContent,
                item.isUser ? styles.userMessageContent : styles.botMessageContent
              ]}>
                {item.text && (
                  <Text style={[
                    styles.messageText,
                    item.isUser ? styles.userMessageText : styles.botMessageText
                  ]}>{item.text}</Text>
                )}
                {item.image && (
                  <View>
                    <TouchableOpacity onPress={() => setSelectedImage(item.image)}>
                      <Image 
                        source={item.image} 
                        style={styles.messageImage}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.arLinkButton}
                      onPress={() => Linking.openURL('https://vr2.dreamvrad.net/ysu/')}
                    >
                      <Text style={styles.arLinkText}>AR로 확인</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {item.buildingOptions && (
                  <View style={styles.buildingOptionsContainer}>
                    {buildingOptions.map((building) => (
                      <TouchableOpacity
                        key={building.id}
                        style={styles.buildingOption}
                        onPress={() => {
                          const userMessage: Message = {
                            id: Date.now().toString(),
                            text: building.title,
                            isUser: true,
                          };
                          
                          const departmentsList: Message = {
                            id: (Date.now() + 2).toString(),
                            text: building.departments.map(dept => `${dept}`).join('\n'),
                            isUser: false,
                          };
                          
                          setMessages(prev => [...prev, userMessage, departmentsList]);
                        }}
                      >
                        <Text style={styles.buildingOptionText}>{building.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {item.departments && (
                  <View style={styles.departmentsContainer}>
                    {item.departments.map((dept, index) => (
                      <View key={index} style={styles.departmentCard}>
                        <Text style={styles.departmentText}>{dept}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        />
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.inputButton}
            onPress={() => setShowMenu(true)}
          >
            <Text style={styles.inputButtonText}>메시지를 입력하세요...</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingTop: Platform.select({
      ios: 20,
      android: 60,
    }),
    paddingBottom: 20,
  },
  messageContainer: {
    margin: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userMessage: {
    flexDirection: 'row-reverse',
  },
  botMessage: {
    flexDirection: 'row',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#000000',
  },
  botIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  messageContent: {
    padding: 12,
    borderRadius: 15,
    maxWidth: '75%',
    marginHorizontal: 8,
  },
  userMessageContent: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  botMessageContent: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  inputContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputButtonText: {
    color: '#666',
    textAlign: 'center',
  },
  menuOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 1000,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  menuHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    fontSize: 24,
    marginRight: 15,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
  },
  menuItem: {
    width: '25%',
    alignItems: 'center',
    padding: 10,
  },
  menuIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  menuText: {
    fontSize: 12,
    textAlign: 'center',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '90%',
    height: '90%',
  },
  buildingOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  buildingOption: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buildingOptionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  departmentsContainer: {
    marginTop: 10,
    marginBottom: 5,
  },
  departmentCard: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  departmentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontWeight: '500',
  },
  arLinkButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'center',
    minWidth: 100,
  },
  arLinkText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default MessageScreen;