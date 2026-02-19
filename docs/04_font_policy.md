# 폰트 정책 / 임베딩 가이드 (v1.0)

## 1) 원칙
- 인쇄 출력물에서 **대체 폰트 치환**이 발생하면 안 됩니다.
- 따라서 PDF 생성 시 **지정된 TTF/OTF 폰트를 반드시 임베딩**해야 합니다.
- 폰트 라이선스(임베딩 허용 여부)를 반드시 확인합니다.

## 2) 레포에 폰트 바이너리를 포함하지 않는 이유
- 상용 폰트/라이선스 이슈 방지
- 프로젝트별 폰트 선정(국가/언어/브랜드)에 따라 폰트가 달라질 수 있음

## 3) 폰트 배치 위치
- 폰트 파일은 `.env`의 `FONTS_DIR` 경로로 지정합니다.
- 기본값: `./assets/fonts`

예)
- assets/fonts/NotoSans-Regular.ttf
- assets/fonts/NotoSans-Bold.ttf

## 4) 언어별 폰트 프리셋
Admin에서 언어별로 다음 값을 관리합니다.
- font_key → 실제 파일 매핑
- font_size / tracking(자간) / leading(행간)
- 베트남어 line-height 보정치(성조 고려)
