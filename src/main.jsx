import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Stats from './pages/Stats'
import Redirect from './pages/Redirect'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stats/:code" element={<Stats />} />
        <Route path="/:code" element={<Redirect />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
