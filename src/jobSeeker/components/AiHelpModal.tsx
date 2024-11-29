import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface AiHelpModalProps {
  visible: boolean;
  onClose: () => void;
  sectionTitle: string;
  inputText: string;
  onInputChange: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  currentSectionText: string;
}

export const AiHelpModal: React.FC<AiHelpModalProps> = ({
  visible,
  onClose,
  sectionTitle,
  inputText,
  onInputChange,
  onSubmit,
  isLoading,
  currentSectionText,
}) => {
  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 32,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000',
      flex: 1,
      marginRight: 16,
    },
    closeButton: {
      padding: 4,
    },
    modalSubtitle: {
      fontSize: 16,
      color: '#666',
      marginTop: 20,
      marginBottom: 16,
    },
    aiOptionsGrid: {
      marginBottom: 20,
    },
    aiOptionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    aiOptionButton: {
      flex: 0.48,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
    },
    aiOptionText: {
      fontSize: 16,
      color: '#333',
      fontWeight: '500',
    },
    aiInput: {
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 8,
      padding: 16,
      minHeight: 120,
      marginBottom: 16,
      fontSize: 16,
      textAlignVertical: 'top',
      backgroundColor: '#f8f8f8',
    },
    aiSubmitButton: {
      backgroundColor: '#4a90e2',
      borderRadius: 8,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitIcon: {
      marginRight: 8,
    },
    aiSubmitText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    aiSubmitButtonDisabled: {
      backgroundColor: '#a0a0a0',
    },
    aiOptionButtonDisabled: {
      backgroundColor: '#f5f5f5',
      borderColor: '#e0e0e0',
    },
    aiOptionTextDisabled: {
      color: '#999',
    },
  });

  const handleOptionClick = (option: string) => {
    let promptText = '';
    
    switch (option) {
      case '글 전체 작성':
        promptText = '초안을 작성해줘';
        break;
      case '문장 다듬기':
        promptText = `다음 내용을 다듬어줘:\n${currentSectionText}`;
        break;
      case '키워드 추천':
        promptText = '해당 항목에 어울릴만한 추천 키워드를 5개 나열해줘';
        break;
      case '맞춤법 검사':
        promptText = `다음 내용의 맞춤법을 검사해줘:\n${currentSectionText}`;
        break;
    }
    
    onInputChange(promptText);
  };

  const isTextRequired = (option: string) => {
    return ['문장 다듬기', '맞춤법 검사'].includes(option);
  };

  const renderOptionButton = (option: string) => {
    const disabled = isTextRequired(option) && !currentSectionText.trim();
    
    return (
      <TouchableOpacity 
        style={[
          styles.aiOptionButton,
          disabled && styles.aiOptionButtonDisabled
        ]}
        onPress={() => handleOptionClick(option)}
        disabled={disabled}
      >
        <Text style={[
          styles.aiOptionText,
          disabled && styles.aiOptionTextDisabled
        ]}>
          {option}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {sectionTitle} AI 작성 도우미
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>어떤 도움이 필요하신가요?</Text>
          
          <View style={styles.aiOptionsGrid}>
            <View style={styles.aiOptionsRow}>
              {renderOptionButton('글 전체 작성')}
              {renderOptionButton('문장 다듬기')}
            </View>
            <View style={styles.aiOptionsRow}>
              {renderOptionButton('키워드 추천')}
              {renderOptionButton('맞춤법 검사')}
            </View>
          </View>
          
          <TextInput
            style={styles.aiInput}
            placeholder="AI에게 구체적으로 요청할 내용을 입력하세요"
            value={inputText}
            onChangeText={onInputChange}
            multiline
          />
          
          <TouchableOpacity 
            style={[styles.aiSubmitButton, isLoading && styles.aiSubmitButtonDisabled]}
            onPress={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" style={styles.submitIcon} />
            ) : (
              <MaterialIcons name="send" size={20} color="#fff" style={styles.submitIcon} />
            )}
            <Text style={styles.aiSubmitText}>
              {isLoading ? '요청 처리 중...' : 'AI에게 요청하기'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
