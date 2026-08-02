import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createShortLink, getLink } from '../lib/links'

const HISTORY_KEY = 'snip_my_codes'

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
  } catch {
    return []
  }
}

function saveToHistory(code) {
  const current = loadHistory()
  if (!current.includes(code)) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([code, ...current].slice(0, 30)))
  }
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [myLinks, setMyLinks] = useState([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const codes = loadHistory()
    Promise.all(codes.map(c => getLink(c))).then(links => {
      setMyLinks(links.filter(Boolean))
    })
  }, [result])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const code = await createShortLink(url.trim(), customCode.trim())
      saveToHistory(code)
      setResult(code)
      setUrl('')
      setCustomCode('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const shortUrl = result ? `${window.location.origin}/${result}` : ''

  function copyLink() {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="page">
      <nav className="nav">
        <Link to="/" className="brand">snip<span className="dot">.</span></Link>
      </nav>

      <div className="container">
        <p className="eyebrow">Link shortener</p>
        <h1>Paste a long link.<br />Get a short one.</h1>
        <p className="sub">
          Every click is logged — timestamp, browser, OS, and referrer —
          so you can see exactly who's using your links.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="url"
              placeholder="https://example.com/a-really-long-url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
            />
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Cutting…' : 'Shorten'}
            </button>
          </div>
          <div className="custom-code-row">
            <span>custom code (optional)</span>
            <input
              type="text"
              placeholder="my-link"
              value={customCode}
              onChange={e => setCustomCode(e.target.value)}
              pattern="[a-zA-Z0-9\-]+"
            />
          </div>
          {error && <p className="error">{error}</p>}
        </form>

        {result && (
          <div className="result-card">
            <a className="result-link" href={shortUrl} target="_blank" rel="noreferrer">
              {shortUrl}
            </a>
            <div className="result-actions">
              <button className="link-btn" onClick={copyLink}>
                {copied ? 'Copied ✓' : 'Copy link'}
              </button>
              <Link className="link-btn" to={`/stats/${result}`}>View stats</Link>
            </div>
          </div>
        )}

        {myLinks.length > 0 && (
          <>
            <p className="section-title">Your links</p>
            {myLinks.map(link => (
              <div className="link-row" key={link.code}>
                <div style={{ minWidth: 0 }}>
                  <Link className="link-code" to={`/stats/${link.code}`}>/{link.code}</Link>
                  <div className="link-target">{link.longUrl}</div>
                </div>
                <div className="link-meta">
                  <span className="click-count">{link.clickCount || 0} clicks</span>
                </div>
              </div>
            ))}
          </>
        )}

        {myLinks.length === 0 && !result && (
          <p className="empty">Links you create on this device will show up here.</p>
        )}
      </div>

      <p className="footer-note">Built with React + Firebase</p>
    </div>
  )
}
