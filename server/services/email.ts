import nodemailer from 'nodemailer';

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
            <h2>📋 ${parsedProgram.program_title} 스프레드시트</h2>
            <p style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                💡 <strong>스프레드시트 사용법:</strong><br>
                1. 아래 링크를 클릭하여 구글 스프레드시트로 복사하세요<br>
                2. "파일 > 사본 만들기"로 개인 시트를 생성하세요<br>
                3. 실제 중량, 세트, 반복수를 기록하며 훈련하세요
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="display: inline-block; padding: 15px 30px; background: #4285f4; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    📊 구글 스프레드시트로 열기
                </a>
            </div>
            
            <!-- 최대중량 기록 섹션 -->
            <table class="workout-table" style="margin-bottom: 30px;">
                <tr class="week-header">
                    <td colspan="4">🏋️ 현재 최대중량 (Training Maxes)</td>
                </tr>
                <tr style="background: #f8f9fa;">
                    <th style="width: 25%;">운동</th>
                    <th style="width: 25%;">LB</th>
                    <th style="width: 25%;">KG</th>
                    <th style="width: 25%;">업데이트</th>
                </tr>
                <tr>
                    <td><strong>Squat</strong></td>
                    <td style="background: #fff3cd; border: 2px solid #ffc107;">${Math.round(parseInt(parsedProgram.user_maxes?.squat || '100') * 2.20462)}</td>
                    <td style="background: #fff3cd; border: 2px solid #ffc107;">${parsedProgram.user_maxes?.squat || '100'}</td>
                    <td style="background: #fff3cd; border: 2px solid #ffc107;"></td>
                </tr>
                <tr>
                    <td><strong>Bench</strong></td>
                    <td style="background: #fff3cd; border: 2px solid #ffc107;">${Math.round(parseInt(parsedProgram.user_maxes?.bench || '80') * 2.20462)}</td>
                    <td style="background: #fff3cd; border: 2px solid #ffc107;">${parsedProgram.user_maxes?.bench || '80'}</td>
                    <td style="background: #fff3cd; border: 2px solid #ffc107;"></td>
                </tr>
                <tr>
                    <td><strong>Deadlift</strong></td>
                    <td style="background: #fff3cd; border: 2px solid #ffc107;">${Math.round(parseInt(parsedProgram.user_maxes?.deadlift || '120') * 2.20462)}</td>
                    <td style="background: #fff3cd; border: 2px solid #ffc107;">${parsedProgram.user_maxes?.deadlift || '120'}</td>
                    <td style="background: #fff3cd; border: 2px solid #ffc107;"></td>
                </tr>
            </table>

            <!-- RPE 차트 -->
            <table class="workout-table" style="margin-bottom: 30px;">
                <tr class="week-header">
                    <td colspan="2">💪 RPE 평가 기준</td>
                </tr>
                <tr style="background: #f8f9fa;">
                    <th style="width: 15%;">RPE</th>
                    <th>설명</th>
                </tr>
                <tr><td><strong>10</strong></td><td>최대 노력 - 더 이상 불가능</td></tr>
                <tr><td><strong>9.5</strong></td><td>아마도 한 번 더 가능</td></tr>
                <tr><td><strong>9</strong></td><td>확실히 한 번 더 가능</td></tr>
                <tr><td><strong>8.5</strong></td><td>아마도 두 번 더 가능</td></tr>
                <tr><td><strong>8</strong></td><td>확실히 두 번 더 가능</td></tr>
                <tr><td><strong>7.5</strong></td><td>아마도 세 번 더 가능</td></tr>
                <tr><td><strong>7</strong></td><td>확실히 세 번 더 가능</td></tr>
                <tr><td><strong>6.5</strong></td><td>아마도 네 번 더 가능</td></tr>
                <tr><td><strong>6</strong></td><td>확실히 네 번 더 가능</td></tr>
            </table>

            <!-- 실제 훈련 스프레드시트 -->
            ${parsedProgram.training_weeks.map((week: any) => `
                <table class="workout-table" style="margin-bottom: 40px;">
                    <tr class="week-header">
                        <td colspan="10">Week ${week.week} - ${week.focus}</td>
                    </tr>
                    ${week.workouts.map((workout: any) => `
                        <tr style="background: #e8f5e8;">
                            <td colspan="10"><strong>Day ${workout.day} - ${workout.workout_name}</strong></td>
                        </tr>
                        <tr style="background: #f8f9fa; font-weight: bold;">
                            <td>운동명</td>
                            <td>목표 세트</td>
                            <td>목표 렙</td>
                            <td>목표 중량</td>
                            <td>실제 세트</td>
                            <td>실제 렙</td>
                            <td>실제 중량</td>
                            <td>RPE</td>
                            <td>볼륨</td>
                            <td>메모</td>
                        </tr>
                        ${workout.exercises.map((exercise: any) => `
                            <tr>
                                <td><strong>${exercise.exercise}</strong></td>
                                <td>${exercise.sets}</td>
                                <td>${exercise.reps}</td>
                                <td>${exercise.weight_percent}</td>
                                <td style="background: #fff3cd; border: 2px solid #ffc107;"></td>
                                <td style="background: #fff3cd; border: 2px solid #ffc107;"></td>
                                <td style="background: #fff3cd; border: 2px solid #ffc107;"></td>
                                <td style="background: #fff3cd; border: 2px solid #ffc107;"></td>
                                <td style="background: #fff3cd; border: 2px solid #ffc107;"></td>
                                <td style="background: #fff3cd; border: 2px solid #ffc107;"></td>
                            </tr>
                        `).join('')}
                        <tr style="height: 10px;"><td colspan="10"></td></tr>
                    `).join('')}
                </table>
            `).join('')}
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
