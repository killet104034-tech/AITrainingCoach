import { operationalGuard } from './operationalGuard';

// 🧹 운영 가드 정리 작업 (정기 실행)

// 24시간마다 실행되는 정리 작업
export async function scheduleCleanupJob(): Promise<void> {
  console.log('🧹 운영 가드 정리 작업 스케줄링...');
  
  // 즉시 한 번 실행
  await runCleanup();
  
  // 24시간마다 반복 실행 (1440분 = 24시간)
  setInterval(async () => {
    await runCleanup();
  }, 24 * 60 * 60 * 1000); // 24시간 = 86,400,000ms
  
  console.log('✅ 운영 가드 정리 작업 스케줄링 완료 (24시간 주기)');
}

// 정리 작업 실행
async function runCleanup(): Promise<void> {
  try {
    console.log('🧹 운영 가드 정리 작업 시작...');
    const startTime = Date.now();
    
    await operationalGuard.cleanup();
    
    const duration = Date.now() - startTime;
    console.log(`✅ 운영 가드 정리 작업 완료 (${duration}ms)`);
    
  } catch (error) {
    console.error('❌ 운영 가드 정리 작업 실패:', error);
  }
}

// 서버 시작 시 한 번 호출
scheduleCleanupJob();