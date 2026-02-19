# 다국어 맞춤형 자동 조판(VDP) 시스템 — MVP Monorepo

본 레포는 맞춤형 자동 조판 시스템 MVP를 위한 **풀 스캐폴딩**입니다.

- 사용자: **4개 언어(메인 1 + 서브 3)** 선택 + 개인화 데이터 `{
  NAME, DATE
}` 입력
- 서버: 원고/템플릿/폰트 프리셋을 매핑하여 **Render Tree(조판 결과)** 생성 → 인쇄용 PDF 생성
- 개인화 범위: **Cover / Opening / Closing 3페이지 한정**
- 인쇄 조건(요구사항): 8.5x11 inch, 300dpi 이상 품질 목표, CMYK 대응 설계, Bleed(도련) 적용, 폰트 Full Embedding(지정 TTF/OTF)

> ⚠️ 주의(중요): PDF/X 완전 준수(PDF/X-1a/X-4) 및 CMYK ICC/오버프린트 등 프리프레스 고급 항목은 **인쇄소 워크플로우/툴체인 영향이 큰 영역**입니다. 본 MVP는 **PDF/X 대응 가능한 구조 + Preflight 리포트(검사 스크립트)**까지 포함하며, 완전 준수는 2차 범위로 확장 권장합니다. 자세한 내용은 `docs/06_preflight_checklist.md` 참고.

---

## 빠른 시작(로컬)

### 1) 요구사항
- Node.js 18+
- Docker / Docker Compose

### 2) 실행
```bash
# 1) 환경변수 준비
cp .env.example .env

# 2) 인프라(POSTGRES/REDIS/MINIO) 올리기
npm run dev

# 3) DB 마이그레이션/샘플 데이터 시드
npm run db:migrate
npm run db:seed

# 4) API / Worker / Web 실행(기본은 docker compose로 같이 올라옵니다)
# - API: http://localhost:8081
# - Client: http://localhost:3001
# - Admin: http://localhost:3002
```

### 3) 샘플 주문 → PDF 생성
```bash
curl -X POST http://localhost:8081/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": "JOY-001",
    "main_lang": "en",
    "sub_langs": ["ko","fr","vi"],
    "name": "Joya",
    "date": "2026-02-19"
  }'
```

응답에서 `order_id`를 확인 후:
```bash
curl -X POST http://localhost:8081/api/orders/<ORDER_ID>/generate
curl http://localhost:8081/api/orders/<ORDER_ID>
curl -L http://localhost:8081/api/orders/<ORDER_ID>/pdf -o output.pdf
```

---

## 문서
- 프로젝트 개요/범위/수용 기준: `docs/01_requirements.md`
- 아키텍처/워크플로우(mermaid 포함): `docs/02_architecture.md`
- 템플릿 JSON 규격: `docs/03_template_spec.md`
- 폰트 정책(임베딩/라이선스): `docs/04_font_policy.md`
- API 명세(요약): `docs/05_api_spec.md`
- Preflight 체크리스트: `docs/06_preflight_checklist.md`
- 배포 가이드(Docker): `docs/07_deploy_guide.md`

---

## 레포 구조
- `apps/api-server` : 주문/원고/템플릿 CRUD + PDF 생성 Job enqueue
- `apps/pdf-worker` : BullMQ Worker(조판 + PDF 생성)
- `apps/web-client` : 사용자 웹(언어 선택/개인화/생성/다운로드)
- `apps/web-admin` : 관리자 웹(원고/템플릿/폰트 프리셋/주문 관리)
- `packages/layout-engine` : 줄바꿈/레이아웃(Render Tree) 생성
- `packages/pdf-engine` : PDF 생성(폰트 임베딩/bleed/box) 스캐폴딩
- `infra/docker/docker-compose.yml` : Postgres/Redis/MinIO/API/Worker/Web 구성

---

## 라이선스/폰트
본 레포는 **폰트 바이너리(.ttf/.otf)를 포함하지 않습니다.**
- 회사/프로젝트에서 사용 가능한 **임베딩 허용 폰트**를 `assets/fonts`에 배치하세요.
- 자세한 정책은 `docs/04_font_policy.md` 참고.

