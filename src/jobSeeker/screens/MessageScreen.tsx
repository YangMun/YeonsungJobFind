import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';

// 미리 정의된 응답들
const predefinedResponses = {
  '안녕하세요': '안녕하세요! 무엇을 도와드릴까요?',
  '지원 방법': '채용공고 상세페이지에서 지원하기 버튼을 클릭하시면 됩니다.',
  '이력서': '마이페이지 > 이력서 관리에서 이력서를 작성하실 수 있습니다.',
  // 더 많은 질문/답변 추가 가능
};

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const MessageScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };

    // 봇 응답 찾기
    let botResponse = '죄송합니다. 해당 질문에 대한 답변을 찾을 수 없습니다.';
    Object.entries(predefinedResponses).forEach(([question, answer]) => {
      if (inputText.includes(question)) {
        botResponse = answer;
      }
    });

    // 봇 메시지 추가
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      isUser: false,
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setInputText('');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            item.isUser ? styles.userMessage : styles.botMessage
          ]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="메시지를 입력하세요..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>전송</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
  },
});

export default MessageScreen;