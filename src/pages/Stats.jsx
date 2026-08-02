import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLink, getVisits } from '../lib/links'

function formatTime(ts) {
  if (!ts) return '—'
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return date.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

export default function Stats() {
  const { code } = useParams()
  const [link, setLink] = useState(undefined)
  const [visits, setVisits] = useState([])

  useEffect(() => {
    getLink(code).then(setLink)
    getVisits(code).then(setVisits)
  }, [code])

  if (link === undefined) {
    return <div className="container"><p className="sub">Loading…</p></div>
  }

  if (link === null) {
    return (
      <div className="page">
        <div className="container">
          <p className="eyebrow">404</p>
          <h1 style={{ fontSize: 24 }}>No link found for /{code}</h1>
          <Link className="link-btn" to="/">Go back home</Link>
        </div>
      </div>
    )
  }

  const browserCounts = visits.reduce((acc, v) => {
    acc[v.browser] = (acc[v.browser] || 0) + 1
    return acc
  }, {})
  const topBrowser = Object.entries(browserCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  return (
    <div className="page">
      <nav className="nav">
        <Link to="/" className="brand">snip<span className="dot">.</span></Link>
      </nav>

      <div className="container">
        <div className="stats-header">
          <p className="eyebrow">Stats for /{code}</p>
          <h1 style={{ fontSize: 26 }}>{link.longUrl}</h1>
        </div>

        <div className="stat-grid">
          <div className="stat-box">
            <div className="stat-num">{link.clickCount || 0}</div>
            <div className="stat-label">Total visits</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{topBrowser}</div>
            <div className="stat-label">Top browser</div>
          </div>
        </div>

        <p className="section-title">Visit log</p>
        {visits.length === 0 ? (
          <p className="empty">No visits yet — share your link to see activity here.</p>
        ) : (
          <table className="visits">
            <thead>
              <tr>
                <th>Time</th>
                <th>Browser</th>
                <th>OS</th>
                <th>Referrer</th>
                <th>Language</th>
              </tr>
            </thead>
            <tbody>
              {visits.map(v => (
                <tr key={v.id}>
                  <td>{formatTime(v.timestamp)}</td>
                  <td>{v.browser}</td>
                  <td>{v.os}</td>
                  <td>{v.referrer === 'Direct' ? 'Direct' : new URL(v.referrer).hostname}</td>
                  <td>{v.language}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
