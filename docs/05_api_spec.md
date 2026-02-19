# API 요약 명세 (v1.0)

Base URL: `http://localhost:8081`

## 1) Orders
### POST /api/orders
주문 생성(언어 조합 + 개인화 입력)

Request
```json
{
  "book_id": "JOY-001",
  "main_lang": "en",
  "sub_langs": ["ko","fr","vi"],
  "name": "Joya",
  "date": "2026-02-19"
}
```

Response
```json
{
  "order_id": "ORD-20260219-0001",
  "status": "created"
}
```

### POST /api/orders/{id}/generate
PDF 생성 job enqueue

### GET /api/orders/{id}
주문/잡 상태 조회

### GET /api/orders/{id}/pdf
완료된 PDF 다운로드(또는 파일 경로 반환)

---

## 2) Admin(샘플)
- GET/POST/PUT/DELETE `/api/admin/manuscripts`
- GET/POST/PUT/DELETE `/api/admin/templates`
- GET/POST/PUT/DELETE `/api/admin/font-presets`
- POST `/api/admin/orders/{id}/regenerate`
