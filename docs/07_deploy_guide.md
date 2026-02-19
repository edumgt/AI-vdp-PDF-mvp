# Docker 기반 배포 가이드 (v1.0)

## 1) 구성
- Postgres: 원고/템플릿/주문/잡
- Redis: BullMQ Queue
- MinIO: (옵션) S3 호환 저장소
- API Server, PDF Worker, Web Client, Web Admin

## 2) 실행
```bash
cp .env.example .env
npm run dev
npm run db:migrate
npm run db:seed
```

## 3) 운영 팁
- Worker 동시성: `.env`의 `WORKER_CONCURRENCY`
- 재시도: pdf_jobs.retry_count 기반
- 스토리지:
  - MVP 기본: local 디렉터리 저장(`storage/pdfs`)
  - 확장: MinIO/S3 저장으로 전환 가능
