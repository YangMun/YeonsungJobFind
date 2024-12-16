import { CLADUEKEY } from '@env';
import Anthropic from '@anthropic-ai/sdk';

interface ClaudeResponse {
  success: boolean;
  data?: string;
  error?: string;
}

interface ContentBlock {
  type: string;
  text: string;
}

export const requestClaudeResponse = async (
  prompt: string,
  sectionTitle: string
): Promise<ClaudeResponse> => {
  try {
    // 약간의 지연을 추가하되, 로그는 제거
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!CLADUEKEY) {
      console.error('Anthropic API Key is not defined');
      return {
        success: false,
        error: 'API 키가 설정되지 않았습니다.'
      };
    }

    console.log('Sending request to Anthropic API...');

    const anthropic = new Anthropic({
      apiKey: CLADUEKEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `당신은 자기소개서 작성을 도와주는 전문가입니다. 
          다음 조건을 반드시 지켜주세요:
          1. 응답은 반드시 500자 이내여야 합니다
          2. 응답은 한글로 작성해주세요
          3. 응답은 구체적이고 명확해야 합니다
          4. 응답은 질문에 대한 답만 말해야 합니다
          5. 응답은 띄어쓰기를 무조건 지켜주세요.
          6. 인사말이나 설명 없이 바로 본문 내용만 작성해주세요
          
          자기소개서 ${sectionTitle} 항목에 대해 다음 요청사항을 처리해주세요: ${prompt}`
        }
      ],
      temperature: 0.7,
    });

    // content[0]를 ContentBlock으로 타입 단언하고 text 속성 접근
    const content = message.content[0] as ContentBlock;
    const generatedText = content.text;

    // 500자 제한 확인
    if (generatedText.length > 500) {
      return {
        success: false,
        error: '생성된 텍스트가 500자를 초과합니다. 다시 시도해주세요.'
      };
    }

    return {
      success: true,
      data: generatedText
    };

  } catch (error: any) {
    console.error('Claude API Error:', error);
    return {
      success: false,
      error: error.message || '요청 처리 중 오류가 발생했습니다.'
    };
  }
};