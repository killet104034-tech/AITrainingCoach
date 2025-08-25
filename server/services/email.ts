import nodemailer from 'nodemailer';
import { createWorkoutSpreadsheet, type WorkoutProgramData } from './googleSheets.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  pool: true,
  maxConnections: 1,
  rateDelta: 20000,
  rateLimit: 5
});

export async function sendTrainingProgram(
  email: string, 
  name: string | undefined, 
  program: string
): Promise<void> {
  try {
    const parsedProgram = JSON.parse(program);
    
    // 구글 스프레드시트 생성
    console.log('구글 스프레드시트 생성 중...');
    const spreadsheetUrl = await createWorkoutSpreadsheet(parsedProgram, email);
    console.log('스프레드시트 생성 완료:', spreadsheetUrl);
    
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sinabro Strength 맞춤 훈련 프로그램</title>
        <style>
            body { font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; line-height: 1.5; color: #333; max-width: 1000px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: white; padding: 30px; text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            h1 { margin: 0; font-size: 28px; font-weight: 300; }
            h2 { color: #000; font-weight: 500; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; }
            .workout-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .workout-table th { background: #f8f9fa; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: 600; }
            .workout-table td { border: 1px solid #ddd; padding: 10px; }
            .week-header { background: #000; color: white; text-align: center; font-weight: 600; }
            .workout-header { background: #f1f3f4; font-weight: 600; }
            .footer { text-align: center; margin-top: 40px; padding: 20px; background: #f8f9fa; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .info-box { padding: 15px; background: #f8f9fa; border-radius: 5px; }
            @media (max-width: 768px) { 
                .info-grid { grid-template-columns: 1fr; }
                .workout-table { font-size: 14px; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>SINABRO STRENGTH</h1>
            <p>${name ? `${name}님을 위한` : '당신을 위한'} 개인 맞춤형 파워리프팅 프로그램</p>
        </div>

        <div class="section">
            <h2>${parsedProgram.program_title}</h2>
            <p>${parsedProgram.overview}</p>
        </div>

        <div class="section">
            <h2>📋 구글 스프레드시트 훈련 프로그램</h2>
            <p style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                💡 <strong>훈련 기록 방법:</strong><br>
                1. 아래 링크를 클릭하여 구글 스프레드시트를 여세요<br>
                2. 각 운동별로 실제 수행한 세트, 횟수, 중량을 기록하세요<br>
                3. RPE(체감강도)와 메모를 남겨 진행상황을 추적하세요<br>
                4. "진행상황 추적" 시트에서 최고기록을 업데이트하세요
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${spreadsheetUrl}" target="_blank" style="display: inline-block; padding: 15px 30px; background: #4285f4; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    📊 구글 스프레드시트로 훈련하기
                </a>
            </div>
            
            <p style="text-align: center; font-size: 14px; color: #666; margin-top: 20px;">
                ※ 구글 스프레드시트에서 실제 훈련 기록을 작성하고 진행상황을 추적하세요!
            </p>
        </div>

        <div class="info-grid">
            <div class="info-box">
                <h3>📈 주차별 진행 방법</h3>
                <p>${parsedProgram.progression_notes}</p>
            </div>
            <div class="info-box">
                <h3>🔥 웜업 프로토콜</h3>
                <p>${parsedProgram.warmup_protocol}</p>
            </div>
            <div class="info-box">
                <h3>😌 쿨다운 프로토콜</h3>
                <p>${parsedProgram.cooldown_protocol}</p>
            </div>
            <div class="info-box">
                <h3>⚠️ 안전 수칙</h3>
                <p>${parsedProgram.safety_guidelines}</p>
            </div>
        </div>

        <div class="info-grid">
            <div class="info-box">
                <h3>🥗 영양 가이드라인</h3>
                <p>${parsedProgram.nutrition_guidelines}</p>
            </div>
            <div class="info-box">
                <h3>💤 회복 가이드라인</h3>
                <p>${parsedProgram.recovery_guidelines}</p>
            </div>
        </div>

        <div class="footer">
            <p><strong>SINABRO STRENGTH</strong></p>
            <p>질문이 있으시면 언제든 연락주세요.</p>
        </div>
    </body>
    </html>
    `;

    const fromEmail = process.env.SMTP_FROM || `Sinabro Strength <${process.env.SMTP_USER}>`;
    
    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: `💪 ${name ? `${name}님의` : '당신의'} Sinabro Strength 맞춤형 파워리프팅 프로그램`,
      html: htmlContent
    });

    console.log('훈련 프로그램 이메일 전송 완료:', email);
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    throw new Error('이메일 전송에 실패했습니다: ' + (error as Error).message);
  }
}
