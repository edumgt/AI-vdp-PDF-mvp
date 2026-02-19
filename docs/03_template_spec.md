# 템플릿 JSON 규격 (v1.0)

본 규격은 페이지별 텍스트 박스와 스타일을 정의합니다.
- 좌표 단위: pt(포인트) 기준(72pt = 1 inch)
- 페이지 크기: 8.5 x 11 inch (612 x 792 pt)
- Bleed: 기본 0.125 inch (9 pt) 권장 (프로젝트 설정에 따라 변경 가능)

---

## 1) Template Schema (요약)
```json
{
  "book_id": "JOY-001",
  "page_id": "cover",
  "version": 1,
  "page": {
    "width_pt": 612,
    "height_pt": 792,
    "bleed_pt": 9
  },
  "boxes": [
    {
      "id": "title_main",
      "type": "text",
      "lang_role": "main",
      "x": 72,
      "y": 640,
      "w": 468,
      "h": 90,
      "style": {
        "font_key": "latin_sans",
        "font_size": 28,
        "tracking": 0,
        "leading": 34,
        "align": "center",
        "color": { "mode": "cmyk", "c": 0, "m": 0, "y": 0, "k": 100 }
      },
      "content_keys": ["COVER_TITLE"]
    }
  ]
}
```

### 필드 설명
- `lang_role`: `main | sub1 | sub2 | sub3` 중 하나
- `content_keys`: 원고 데이터(content_json)의 key 목록
- `style.color.mode`: `cmyk | rgb` (MVP는 cmyk 입력을 허용하고, 실제 CMYK 처리/ICC는 2차 고도화 포인트)

---

## 2) Manuscript(원고) Schema(요약)
```json
{
  "book_id": "JOY-001",
  "page_id": "cover",
  "lang": "en",
  "version": 1,
  "content": {
    "COVER_TITLE": "Hello, {NAME}!",
    "COVER_SUB": "Today is {DATE}."
  }
}
```

---

## 3) 개인화 토큰
- 지원 토큰: `{NAME}`, `{DATE}`
- 적용 페이지: cover/opening/closing 3페이지 한정
- 본문 페이지: 개인화 미적용(MVP 고정)

---

## 4) 언어별 줄바꿈 정책(요약)
- `space_based`: 공백 기준(영/프/스/베 등)
- `cjk`: 문자 기준(한/중/일)
- `strict`: 금칙 최소 적용(선택)

MVP는 `packages/layout-engine`에서 정책을 확장 가능하도록 설계합니다.
