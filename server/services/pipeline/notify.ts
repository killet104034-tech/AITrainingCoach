// 📧 Notify: 이메일 알림 전송
import nodemailer from 'nodemailer';
import type { PersistResult } from './persist';
import type { UserProfile } from './ingest';
import type { WorkoutProgram } from './generate';

export interface NotifyResult {
  emailSent: boolean;
  recipient: string;
  subject: string;
  attachments?: string[];
}

// 📨 이메일 알림 전송
export async function notifyUser(
  persistResult: PersistResult,
  userProfile: UserProfile,
  program: WorkoutProgram,
  userEmail: string
): Promise<NotifyResult> {
  console.log('📧 Notify 단계 시작: 이메일 전송...');
  
  try {
    // 1. 이메일 내용 생성
    const emailContent = generateEmailContent(persistResult, userProfile, program);
    
    // 2. 이메일 전송
    await sendEmail(userEmail, emailContent);
    
    console.log('✅ Notify 완료: 이메일 전송 성공');
    
    return {
      emailSent: true,
      recipient: userEmail,
      subject: emailContent.subject
    };
    
  } catch (error) {
    console.log('❌ Notify 실패:', error);
    throw error;
  }
}

// 📝 이메일 내용 생성
function generateEmailContent(
  persistResult: PersistResult,
  userProfile: UserProfile,
  program: WorkoutProgram
) {
  const { spreadsheetUrl } = persistResult;
  const { demographics, goals } = userProfile;
  
  const subject = `🏋️ ${program.title} - 개인맞춤 파워리프팅 프로그램 완성!`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Malgun Gothic', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .program-info { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat { text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏋️ 시나브로 스트렝스</h1>
                <p>개인맞춤 파워리프팅 프로그램이 완성되었습니다!</p>
            </div>
            
            <div class="content">
                <div class="program-info">
                    <h2>📋 ${program.title}</h2>
                    <p><strong>대상:</strong> ${demographics.age}세, ${userProfile.experience.level} 수준</p>
                    <p><strong>목표:</strong> ${goals.primary}</p>
                    <p><strong>기간:</strong> ${program.total_weeks}주 (3개 블록)</p>
                    <p><strong>훈련 빈도:</strong> 주 ${userProfile.constraints.daysPerWeek}일</p>
                </div>
                
                <div class="stats">
                    <div class="stat">
                        <div class="stat-number">${program.total_weeks}</div>
                        <div>총 주차</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${program.training_blocks.length}</div>
                        <div>훈련 블록</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${userProfile.constraints.daysPerWeek}</div>
                        <div>주간 훈련일</div>
                    </div>
                </div>
                
                <h3>🎯 프로그램 특징</h3>
                <ul>
                    <li><strong>개인맞춤:</strong> 당신의 현재 1RM과 경험 수준을 반영</li>
                    <li><strong>과학적 접근:</strong> 피리어다이제이션 기반 체계적 진행</li>
                    <li><strong>완전한 가이드:</strong> 세트, 반복수, 중량, RPE 모두 명시</li>
                    <li><strong>진척 추적:</strong> 주차별 볼륨과 강도 차트 포함</li>
                </ul>
                
                <div style="text-align: center;">
                    <a href="${spreadsheetUrl}" class="cta-button">📊 프로그램 시작하기</a>
                </div>
                
                <div class="program-info">
                    <h3>📊 Google Sheets 기능</h3>
                    <ul>
                        <li><strong>Form 시트:</strong> 설문 응답 데이터</li>
                        <li><strong>Program 시트:</strong> 18주 완전한 훈련 프로그램</li>
                        <li><strong>Summary 시트:</strong> 진척 분석 및 차트</li>
                    </ul>
                    <p><small>💡 <strong>팁:</strong> 스프레드시트를 복사해서 개인 구글 드라이브에 저장하세요!</small></p>
                </div>
                
                <h3>🔥 시작하기 전 체크리스트</h3>
                <ul>
                    <li>✅ 현재 1RM 재확인 (필요시 테스트)</li>
                    <li>✅ 훈련 스케줄 캘린더에 등록</li>
                    <li>✅ 운동 폼 복습 (특히 약점 부위)</li>
                    <li>✅ 충분한 수면과 영양 계획</li>
                </ul>
            </div>
            
            <div class="footer">
                <p>💪 강해지는 여정을 응원합니다!</p>
                <p><small>이 프로그램은 AI를 활용하여 개인맞춤 설계되었습니다.</small></p>
            </div>
        </div>
    </body>
    </html>
  `;
  
  const textContent = `
🏋️ 시나브로 스트렝스 - ${program.title}

안녕하세요! 개인맞춤 파워리프팅 프로그램이 완성되었습니다.

📋 프로그램 정보:
- 대상: ${demographics.age}세, ${userProfile.experience.level} 수준
- 목표: ${goals.primary}
- 기간: ${program.total_weeks}주 (3개 블록)
- 훈련 빈도: 주 ${userProfile.constraints.daysPerWeek}일

📊 Google Sheets 링크:
${spreadsheetUrl}

🎯 프로그램 특징:
- 개인맞춤: 당신의 현재 1RM과 경험 수준을 반영
- 과학적 접근: 피리어다이제이션 기반 체계적 진행
- 완전한 가이드: 세트, 반복수, 중량, RPE 모두 명시
- 진척 추적: 주차별 볼륨과 강도 차트 포함

💪 강해지는 여정을 응원합니다!
  `;
  
  return {
    subject,
    html: htmlContent,
    text: textContent
  };
}

// 📨 실제 이메일 전송
async function sendEmail(to: string, content: any): Promise<void> {
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: content.subject,
      text: content.text,
      html: content.html
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 이메일 전송 완료: ${to}`);
    
  } catch (error) {
    console.log('이메일 전송 실패:', error);
    throw error;
  }
}