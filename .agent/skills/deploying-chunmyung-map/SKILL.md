# Deploying Chunmyung Map (Full Guide)

이 스킬은 프로젝트 생성부터 GitHub 연동, 그리고 Firebase App Hosting을 통한 최종 배포까지 전 과정을 다루는 'A to Z' 배포 매뉴얼입니다.

## 1단계: Firebase 프로젝트 생성 (Console)
가장 먼저 배포할 공간을 마련해야 합니다.
1. [Firebase Console](https://console.firebase.google.com/)에 접속합니다.
2. **'프로젝트 추가'**를 클릭하고 프로젝트 이름을 설정합니다 (예: `chunmyung-map`).
3. Google Analytics 설정 여부를 선택하고 프로젝트 생성을 완료합니다.
4. 요금제를 **'Blaze(종량제)'**로 업그레이드해야 합니다. (App Hosting은 Cloud Run을 사용하므로 무료 등급인 Spark에서는 작동하지 않습니다. 하지만 무료 할당량 내에서는 비용이 거의 발생하지 않습니다.)

## 2단계: GitHub 저장소 준비
App Hosting은 코드를 자동으로 가져오기 위해 GitHub 저장소가 필요합니다.
1. [GitHub](https://github.com/)에서 새로운 저장소(Repository)를 생성합니다.
2. 로컬 프로젝트를 GitHub에 푸시합니다:
   ```bash
   git remote add origin [저장소_URL]
   git branch -M main
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

## 3단계: Firebase App Hosting 설정
실제 배포 파이프라인을 구축합니다.
1. Firebase Console 왼쪽 메뉴에서 **'Build' > 'App Hosting'**을 선택합니다.
2. **'시작하기'**를 클릭하고 GitHub 계정을 연결합니다.
3. 방금 만든 **GitHub 저장소와 브랜치(main)**를 선택합니다.
4. **'배포 설정'**에서 프로젝트 ID와 지역(Region)을 선택합니다 (가까운 `asia-northeast3` 서울 리전 추천).
5. **'배포 완료'** 버튼을 누르면 첫 번째 빌드가 시작됩니다.

## 4단계: 환경 변수(Secret) 등록
Gemini API 키와 같은 민감한 정보는 안전하게 별도로 등록해야 합니다.
1. Firebase Console의 App Hosting 대시보드에서 **'설정(Settings)'** 탭으로 이동합니다.
2. **'환경 변수(Environment Variables)'** 섹션에서 `GEMINI_API_KEY`를 추가합니다.
3. 이때 **'Secret Manager'**를 사용하여 값을 안전하게 저장하도록 선택합니다.
4. `apphosting.yaml` 파일의 `env` 설정과 이름이 일치하는지 확인합니다.

## 5단계: 배포 확인 및 업데이트
- 첫 배포가 완료되면 App Hosting 대시보드 상단에 **'도메인 URL'**이 생성됩니다.
- 이후에는 로컬에서 `git push`만 하면 Firebase가 자동으로 감지하여 **무중단 배포**를 수행합니다.

## 핵심 체크리스트
- [ ] `apphosting.yaml` 파일이 루트에 존재하는가?
- [ ] Firebase 요금제가 'Blaze'인가?
- [ ] GitHub에 최신 코드가 푸시되었는가?
- [ ] Secret Manager에 API 키가 등록되었는가?

## 관련 문서
- [Firebase App Hosting 공식 문서](https://firebase.google.com/docs/app-hosting)
- [Next.js 배포 가이드](https://nextjs.org/docs/app/building-your-application/deploying)
