import {
  doc, setDoc, getDoc, addDoc, collection, updateDoc,
  increment, serverTimestamp, query, orderBy, getDocs
} from 'firebase/firestore'
import { db } from '../firebase'

const CODE_CHARS = 'abcdefghijkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXY23456789'

function randomCode(len = 6) {
  let out = ''
  for (let i = 0; i < len; i++) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return out
}

function isValidUrl(str) {
  try {
    const u = new URL(str)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

// Create a new short link. Retries on rare code collisions.
export async function createShortLink(longUrl, customCode) {
  if (!isValidUrl(longUrl)) {
    throw new Error('Enter a full URL starting with http:// or https://')
  }

  let code = customCode?.trim()
  if (code) {
    const existing = await getDoc(doc(db, 'links', code))
    if (existing.exists()) throw new Error('That custom code is already taken')
  } else {
    for (let attempt = 0; attempt < 5; attempt++) {
      code = randomCode()
      const existing = await getDoc(doc(db, 'links', code))
      if (!existing.exists()) break
    }
  }

  await setDoc(doc(db, 'links', code), {
    longUrl,
    createdAt: serverTimestamp(),
    clickCount: 0
  })

  return code
}

export async function getLink(code) {
  const snap = await getDoc(doc(db, 'links', code))
  if (!snap.exists()) return null
  return { code: snap.id, ...snap.data() }
}

// Parses a very small set of details from the visitor's own browser.
// Nothing is fetched from a server, so this only reflects what the
// browser exposes about itself (no personally identifying info).
function detectVisitor() {
  const ua = navigator.userAgent
  let browser = 'Unknown'
  if (ua.includes('Edg/')) browser = 'Edge'
  else if (ua.includes('Chrome/') && !ua.includes('OPR')) browser = 'Chrome'
  else if (ua.includes('Firefox/')) browser = 'Firefox'
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari'
  else if (ua.includes('OPR')) browser = 'Opera'

  let os = 'Unknown'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac OS')) os = 'macOS'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  else if (ua.includes('Linux')) os = 'Linux'

  return {
    browser,
    os,
    referrer: document.referrer || 'Direct',
    language: navigator.language || 'Unknown',
    screen: `${window.screen.width}x${window.screen.height}`,
    userAgent: ua
  }
}

// Logs a visit and bumps the click counter. Call this right before redirecting.
export async function recordVisit(code) {
  const visitor = detectVisitor()
  await addDoc(collection(db, 'links', code, 'visits'), {
    ...visitor,
    timestamp: serverTimestamp()
  })
  await updateDoc(doc(db, 'links', code), {
    clickCount: increment(1)
  })
}

export async function getVisits(code) {
  const q = query(collection(db, 'links', code, 'visits'), orderBy('timestamp', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
