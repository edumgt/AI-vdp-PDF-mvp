# 시스템 아키텍처/워크플로우 (v1.0)

## 1) 구성
- Web Client: 사용자 주문/생성 요청
- Web Admin: 원고/템플릿/폰트/주문 관리
- API Server: 인증/CRUD/주문/잡 생성, 파일 서빙
- PDF Worker: 조판(Render Tree) + PDF 렌더링 + 저장
- DB(Postgres), Queue(Redis/BullMQ), Storage(Local/MinIO)

---

## 2) 전체 플로우(주문 → PDF 생성)

```mermaid
flowchart LR
  U[User Web] --> A[API Server]
  A -->|create order| DB[(Postgres)]
  A -->|enqueue job| Q[(Redis / BullMQ)]
  W[PDF Worker] -->|pickup job| Q
  W -->|load manuscript/template/font preset| DB
  W -->|compose Render Tree| LE[Layout Engine]
  LE -->|render| PE[PDF Engine]
  PE -->|save PDF| S[(Storage: Local/MinIO)]
  W -->|update status| DB
  U -->|poll status| A
  U -->|download PDF| A --> S
```

---

## 3) 개인화 치환(3페이지 한정)

```mermaid
flowchart TB
  IN[Order Input: langs + NAME/DATE] --> L1[Load Manuscript by book, page, lang]
  L1 --> T1[Load Page Template]
  T1 --> C{Is Page in Cover/Opening/Closing?}
  C -- Yes --> R1[Replace tokens NAME, DATE]
  C -- No --> R2[Skip personalization]
  R1 --> B1[Line Break by language rules]
  R2 --> B1
  B1 --> RT[Render Tree Output]
```

---

## 4) Admin 변경 → 재생성

```mermaid
sequenceDiagram
  participant Admin as Admin Web
  participant API as API Server
  participant DB as Postgres
  participant Q as Redis/BullMQ
  participant W as PDF Worker
  participant S as Storage

  Admin->>API: Update manuscript/template/font preset
  API->>DB: Save new version + audit log
  Admin->>API: Regenerate PDF (order_id)
  API->>DB: Create pdf_job (pending)
  API->>Q: Enqueue job
  W->>Q: Pick job
  W->>DB: Load versions snapshot
  W->>S: Render & store PDF
  W->>DB: Update job status + output record
  Admin->>API: View job result
  API->>DB: Return status + link
```
