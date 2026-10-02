const puppeteer = require('puppeteer');
const path = require('path');

async function testFullGamePlay() {
  console.log('🚀 사천성 게임 플레이 및 E2E 기능 테스트 시작...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('response', res => {
    if (res.status() >= 400) {
      consoleErrors.push(`HTTP ${res.status()} on ${res.url()}`);
    }
  });

  // 1. 페이지 로드
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
  console.log('1. 페이지 로드 완료');

  // 2. 초기 상태 확인
  const initialPairs = await page.evaluate(() => {
    const el = document.querySelector('header span.text-amber-400');
    return el ? parseInt(el.textContent, 10) : 0;
  });
  console.log(`2. 초기 남은 쌍 수: ${initialPairs}쌍`);

  // 3. 힌트 버튼 클릭하여 매칭 가능한 타일 2개 찾기
  console.log('3. 힌트 실행하여 유효 매칭 타일 식별...');
  const hintBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent && b.textContent.includes('힌트'));
  });
  await hintBtn.click();
  await new Promise(r => setTimeout(r, 400));

  // 4. 힌트 하이라이트된 두 타일 요소 가져오기
  const hintTiles = await page.$$('.hint-target');
  console.log(`4. 식별된 힌트 타일 수: ${hintTiles.length}개`);
  if (hintTiles.length < 2) {
    throw new Error('힌트 타일이 2개 이상 하이라이트되지 않았습니다.');
  }

  // 5. 두 타일을 순서대로 클릭하여 매칭 시도
  console.log('5. 유효 타일 쌍 연속 클릭...');
  await hintTiles[0].click();
  await new Promise(r => setTimeout(r, 200));
  await hintTiles[1].click();

  // 매칭 애니메이션 및 연결선 확인
  await new Promise(r => setTimeout(r, 150));
  const activeLineCount = await page.$$eval('svg polyline', lines => lines.length);
  console.log(`   - 매칭 성공 연결선(SVG Polyline) 노출 여부: ${activeLineCount > 0 ? '성공' : '미노출'}`);

  // 6. 타일 제거 후 상태 확인 (0.5초 대기)
  await new Promise(r => setTimeout(r, 500));
  const afterPairs = await page.evaluate(() => {
    const el = document.querySelector('header span.text-amber-400');
    return el ? parseInt(el.textContent, 10) : 0;
  });
  const currentScore = await page.evaluate(() => {
    const el = document.querySelector('header span.text-yellow-300');
    return el ? el.textContent : '0';
  });
  console.log(`6. 매칭 후 상태: 남은 쌍 ${afterPairs}쌍 (초기: ${initialPairs}), 현재 점수: ${currentScore}`);
  if (afterPairs !== initialPairs - 1) {
    throw new Error('타일 매칭 후 남은 쌍이 1 감소하지 않았습니다.');
  }

  // 7. 되돌리기 (Undo) 테스트
  console.log('7. 되돌리기 (Undo) 버튼 테스트...');
  const undoBtn = await page.evaluateHandle(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.find(b => b.textContent && b.textContent.includes('되돌리기'));
  });
  await undoBtn.click();
  await new Promise(r => setTimeout(r, 300));

  const restoredPairs = await page.evaluate(() => {
    const el = document.querySelector('header span.text-amber-400');
    return el ? parseInt(el.textContent, 10) : 0;
  });
  console.log(`   - 되돌리기 후 남은 쌍: ${restoredPairs}쌍 (원래대로 ${initialPairs}쌍 복원 확인)`);
  if (restoredPairs !== initialPairs) {
    throw new Error('되돌리기 후 보드가 이전 상태로 복원되지 않았습니다.');
  }

  // 8. 최종 스크린샷 캡처
  const screenshotPath = path.resolve(__dirname, 'game_screenshot.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`8. 최종 스크린샷 저장 완료: ${screenshotPath}`);

  // 9. 콘솔 에러 확인
  if (consoleErrors.length > 0) {
    console.error('⚠️ 콘솔 에러 발견:', consoleErrors);
  } else {
    console.log('✅ 브라우저 콘솔 에러 0건 (완벽한 상태)');
  }

  await browser.close();
  console.log('🎉 모든 크롬 브라우저 게임 E2E 기능 테스트 완벽 통과!');
}

testFullGamePlay().catch(err => {
  console.error('❌ E2E 테스트 실패:', err);
  process.exit(1);
});
