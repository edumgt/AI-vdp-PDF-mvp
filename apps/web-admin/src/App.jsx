import React, { useState } from 'react'

const API = import.meta.env.VITE_API_BASE || 'http://localhost:8081'

export default function App() {
  const [orderId, setOrderId] = useState('')
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState('')

  async function fetchOrder() {
    setMsg('')
    const r = await fetch(`${API}/api/orders/${orderId}`)
    const j = await r.json()
    if (!r.ok) return setMsg(j.error || 'failed')
    setData(j)
  }

  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 840, margin: '0 auto', padding: 24 }}>
      <h1>Joya Admin (MVP)</h1>
      <p style={{ color: '#555' }}>
        MVP 스캐폴딩: Admin CRUD(원고/템플릿/폰트 프리셋/주문)는 API 확장으로 연결되는 구조입니다.
      </p>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input placeholder="order_id" value={orderId} onChange={e=>setOrderId(e.target.value)} style={{ flex: 1 }} />
        <button onClick={fetchOrder}>주문 조회</button>
      </div>
      <div style={{ marginTop: 12, color: '#0a58ca' }}>{msg}</div>

      {data && (
        <pre style={{ marginTop: 16, background: '#f7f7f7', padding: 12, borderRadius: 8, overflow: 'auto' }}>
{JSON.stringify(data, null, 2)}
        </pre>
      )}

      <hr style={{ margin: '24px 0' }} />
      <ul style={{ color: '#666', fontSize: 13 }}>
        <li>원고/템플릿/폰트 프리셋 CRUD API는 <code>docs/05_api_spec.md</code>를 기반으로 구현 확장하세요.</li>
        <li>버전 스냅샷을 <code>pdf_outputs.source_snapshot</code>에 저장해 재현성을 확보합니다.</li>
      </ul>
    </div>
  )
}
