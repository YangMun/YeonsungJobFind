import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, Modal, FlatList, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// 미리 정의된 응답들
const predefinedResponses = {
  '지원 방법': '채용공고 상세페이지에서 지원하기 버튼을 클릭하시면 됩니다.',
  '로드 맵': { type: 'image', source: require('../../assets/loadMap.png') },
  '이력서': '프로필 > 이력서 수정하기에서 이력서를 작성하실 수 있습니다.',
  '면접 서류 발급처': '학생복지센터 > One-stop Service Center 에서 받을 수 있습니다.',
};

interface Message {
  id: string;
  text?: string;
  image?: any;
  isUser: boolean;
}

// 선택 메뉴 옵션 추가
const menuOptions = [
  { id: '1', icon: '➕', title: '지원 방법' },
  { id: '2', icon: '📍', title: '로드 맵' },
  { id: '3', icon: '📄', title: '이력서' },
  { id: '4', icon: 'ℹ️', title: '면접 서류 발급처' },
  // 추후에 추가
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

  // 탭이 포커스될 때마다 메시지 초기화 및 초기 메시지 설정
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

    // 봇 응답 찾기
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
              <Text style={styles.menuTitle}>궁금한 내용을 입력해 주세요.</Text>
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
                    
                    const botMessage: Message = {
                      id: (Date.now() + 1).toString(),
                      ...(typeof predefinedResponses[option.title as keyof typeof predefinedResponses] === 'object' 
                        ? { image: (predefinedResponses[option.title as keyof typeof predefinedResponses] as {source: any}).source }
                        : { text: predefinedResponses[option.title as keyof typeof predefinedResponses] as string }
                      ),
                      isUser: false,
                    };
                    
                    setMessages(prev => [...prev, userMessage, botMessage]);
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
              {item.text && (
                <Text style={[
                  styles.messageText,
                  item.isUser ? styles.userMessageText : styles.botMessageText
                ]}>{item.text}</Text>
              )}
              {item.image && (
                <TouchableOpacity onPress={() => setSelectedImage(item.image)}>
                  <Image 
                    source={item.image} 
                    style={styles.messageImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
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
      ios: 20,    // iOS는 20으로 설정
      android: 60, // Android는 60으로 설정
    }),
    paddingBottom: 20,
  },
  messageContainer: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: '70%',
  },
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#000',
    fontSize: 15,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#000000',
  },
  inputContainer: {
    padding: 10,
    backgroundColor: '#fff',
  },
  inputButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  inputButtonText: {
    color: '#666',
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
});

export default MessageScreen;