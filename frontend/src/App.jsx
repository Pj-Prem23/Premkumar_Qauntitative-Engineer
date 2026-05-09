import { useState, useEffect } from 'react'
import ChatInterface from './components/Chat'
import Dashboard from './components/Dashboard'
import { healthCheck } from './api/client'

const TABS = [
  { id: 'chat', label: 'AI Assistant', icon: '◈' },
  { id: 'dashboard', label: 'Analytics Dashboard', icon: '◉' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('chat')
  const [serverStatus, setServerStatus] = useState('checking')

  useEffect(() => {
    healthCheck()
      .then(() => setServerStatus('ok'))
      .catch(() => setServerStatus('error'))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 52, background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)', flexShrink: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, fontSize: 14, fontWeight: 700,
            background: 'linear-gradient(135deg, var(--accent), var(--purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>S</div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>StreamVision</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI Insights</div>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: 4 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px',
              borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
              transition: 'var(--transition)',
              background: activeTab === tab.id ? 'var(--accent-glow)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              outline: activeTab === tab.id ? '1px solid var(--accent-dim)' : 'none',
            }}>
              <span style={{ fontSize: 10 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: serverStatus === 'ok' ? 'var(--green)' : serverStatus === 'error' ? 'var(--red)' : 'var(--yellow)',
            animation: serverStatus === 'checking' ? 'pulse-dot 1.2s infinite' : undefined,
          }} />
          {serverStatus === 'ok' ? 'Connected' : serverStatus === 'error' ? 'Backend Offline' : 'Connecting...'}
        </div>
      </header>

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <div style={{ display: activeTab === 'chat' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
          <ChatInterface />
        </div>
        <div style={{ display: activeTab === 'dashboard' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
          <Dashboard />
        </div>
      </main>
    </div>
  )
}
