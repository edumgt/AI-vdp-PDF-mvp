import React, { useMemo, useState } from 'react'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8081'

export default function App() {
  const [bookId, setBookId] = useState('JOY-001')
  const [mainLang, setMainLang] = useState('en')
  const [sub1, setSub1] = useState('ko')
  const [sub2, setSub2] = useState('fr')
  const [sub3, setSub3] = useState('vi')
  const [name, setName] = useState('Joya')
  const [date, setDate] = useState('2026-02-19')
  const [orderId, setOrderId] = useState('')
  const [status, setStatus] = useState(null)
  const [msg, setMsg] = useState('')

  const subLangs = useMemo(() => [sub1, sub2, sub3], [sub1, sub2, sub3])

  async function createOrder() {
    setMsg('')
    const r = await fetch(`${API}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id: bookId, main_lang: mainLang, sub_langs: subLangs, name, date })
    })
    const j = await r.json()
    if (!r.ok) return setMsg(j.error || 'failed')
    setOrderId(j.order_id)
    setMsg(`created: ${j.order_id}`)
  }

  async function generate() {
    setMsg('')
    if (!orderId) return setMsg('order_id가 필요합니다.')
    const r = await fetch(`${API}/api/orders/${orderId}/generate`, { method: 'POST' })
    const j = await r.json()
    if (!r.ok) return setMsg(j.error || 'failed')
    setMsg('queued')
  }

  async function refresh() {
    setMsg('')
    if (!orderId) return setMsg('order_id가 필요합니다.')
    const r = await fetch(`${API}/api/orders/${orderId}`)
    const j = await r.json()
    if (!r.ok) return setMsg(j.error || 'failed')
    setStatus(j)
  }

  function download() {
    if (!orderId) return
    window.open(`${API}/api/orders/${orderId}/pdf`, '_blank')
  }

  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 840, margin: '0 auto', padding: 24 }}>
      <h1>Joya Client (MVP)</h1>
      <p style={{ color: '#555' }}>
        언어 선택(메인 1 + 서브 3) + 개인화(NAME/DATE) → 주문 생성 → PDF 생성
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <label>Book ID <input value={bookId} onChange={e=>setBookId(e.target.value)} /></label>
        <label>Main Lang <input value={mainLang} onChange={e=>setMainLang(e.target.value)} /></label>
        <label>Sub 1 <input value={sub1} onChange={e=>setSub1(e.target.value)} /></label>
        <label>Sub 2 <input value={sub2} onChange={e=>setSub2(e.target.value)} /></label>
        <label>Sub 3 <input value={sub3} onChange={e=>setSub3(e.target.value)} /></label>
        <div />
        <label>Name <input value={name} onChange={e=>setName(e.target.value)} /></label>
        <label>Date <input value={date} onChange={e=>setDate(e.target.value)} /></label>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={createOrder}>1) 주문 생성</button>
        <button onClick={generate}>2) PDF 생성 요청</button>
        <button onClick={refresh}>3) 상태 조회</button>
        <button onClick={download}>4) PDF 다운로드</button>
      </div>

      <div style={{ marginTop: 12, color: '#0a58ca' }}>{msg}</div>

      {orderId && (
        <div style={{ marginTop: 16 }}>
          <b>order_id:</b> {orderId}
        </div>
      )}

      {status && (
        <pre style={{ marginTop: 16, background: '#f7f7f7', padding: 12, borderRadius: 8, overflow: 'auto' }}>
{JSON.stringify(status, null, 2)}
        </pre>
      )}

      <hr style={{ margin: '24px 0' }} />
      <p style={{ color: '#666', fontSize: 13 }}>
        폰트는 <code>assets/fonts</code>에 임베딩 허용 폰트를 배치한 뒤, DB의 font_preset(font_map)을 파일명으로 수정하세요.
      </p>
    </div>
  )
}
