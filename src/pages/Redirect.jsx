import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLink, recordVisit } from '../lib/links'

export default function Redirect() {
  const { code } = useParams()
  const [status, setStatus] = useState('loading') // loading | notfound | redirecting

  useEffect(() => {
    let cancelled = false

    async function go() {
      const link = await getLink(code)
      if (cancelled) return
      if (!link) {
        setStatus('notfound')
        return
      }
      setStatus('redirecting')
      await recordVisit(code)
      if (!cancelled) {
        window.location.replace(link.longUrl)
      }
    }

    go()
    return () => { cancelled = true }
  }, [code])

  if (status === 'notfound') {
    return (
      <div className="redirect-page">
        <p className="eyebrow">404</p>
        <h1 style={{ fontSize: 24 }}>This link doesn't exist</h1>
        <Link className="link-btn" to="/">Go back home</Link>
      </div>
    )
  }

  return (
    <div className="redirect-page">
      <div className="spinner" />
      <p className="sub" style={{ margin: 0 }}>Redirecting you now…</p>
    </div>
  )
}
