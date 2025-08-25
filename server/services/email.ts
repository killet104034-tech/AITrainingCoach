import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER || 'default_user',
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || 'default_pass'
  }
});

export async function sendTrainingProgram(
  email: string, 
  name: string | undefined, 
  program: string
): Promise<void> {
  try {
    const parsedProgram = JSON.parse(program);
    
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI 파워리프팅 맞춤 훈련 프로그램</title>
        <style>
            body { font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1F2937, #374151); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 30px; padding: 20px; border-left: 4px solid #F97316; background: #f9f9f9; border-radius: 5px; }
            .exercise { margin: 10px 0; padding: 10px; background: white; border-radius: 5px; border: 1px solid #e0e0e0; }
            .day-title { color: #1F2937; font-size: 18px; font-weight: bold; margin: 20px 0 10px 0; }
            h1 { margin: 0; font-size: 28px; }
            h2 { color: #1F2937; border-bottom: 2px solid #F97316; padding-bottom: 10px; }
            .footer { text-align: center; margin-top: 40px; padding: 20px; background: #1F2937; color: white; border-radius: 10px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏋️ AI 파워리프팅 맞춤 훈련 프로그램</h1>
            <p>${name ? `${name}님을 위한` : '당신을 위한'} 개인 맞춤형 프로그램입니다</p>
        </div>

        <div class="section">
            <h2>${parsedProgram.program_title}</h2>
            <p>${parsedProgram.overview}</p>
        </div>

        <div class="section">
            <h2>📅 주간 훈련 스케줄</h2>
            ${parsedProgram.weekly_schedule.map(day => `
                <div class="day-title">${day.day}</div>
                ${day.exercises.map(exercise => `
                    <div class="exercise">
                        <strong>${exercise.name}</strong><br>
                        세트/반복: ${exercise.sets_reps}<br>
                        중량: ${exercise.weight_percentage}<br>
                        ${exercise.notes ? `💡 ${exercise.notes}` : ''}
                    </div>
                `).join('')}
            `).join('')}
        </div>

        <div class="section">
            <h2>📈 점진적 과부하 계획</h2>
            <p>${parsedProgram.progression_scheme}</p>
        </div>

        <div class="section">
            <h2>🔥 웜업 루틴</h2>
            <p>${parsedProgram.warmup_routine}</p>
        </div>

        <div class="section">
            <h2>😌 쿨다운 루틴</h2>
            <p>${parsedProgram.cooldown_routine}</p>
        </div>

        <div class="section">
            <h2>🥗 영양 조언</h2>
            <p>${parsedProgram.nutrition_tips}</p>
        </div>

        <div class="section">
            <h2>💤 회복 조언</h2>
            <p>${parsedProgram.recovery_tips}</p>
        </div>

        <div class="section">
            <h2>⚠️ 안전 주의사항</h2>
            <p>${parsedProgram.safety_notes}</p>
        </div>

        <div class="footer">
            <p>💪 AI 파워리프팅으로 더 강해지세요!</p>
            <p>질문이 있으시면 언제든 연락주세요.</p>
        </div>
    </body>
    </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.EMAIL_FROM || 'AI 파워리프팅 <noreply@aipowerlifting.com>',
      to: email,
      subject: `🏋️ ${name ? `${name}님의` : '당신의'} AI 맞춤형 파워리프팅 프로그램`,
      html: htmlContent
    });

    console.log('훈련 프로그램 이메일 전송 완료:', email);
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    throw new Error('이메일 전송에 실패했습니다: ' + error.message);
  }
}
