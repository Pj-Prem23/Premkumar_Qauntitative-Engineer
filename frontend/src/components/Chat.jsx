import { useState, useRef, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { sendChat } from '../api/client'

const SUGGESTIONS = [
  'Which titles performed best in 2025?',
  'Why is Stellar Run trending recently?',
  'Compare Dark Orbit vs Last Kingdom',
  'Which city had the strongest engagement last month?',
  'What explains weak comedy performance?',
  'What recommendations would you give for leadership?',
]

const SOURCE_COLORS = {
  'Source A': '#00d4ff',
  'Source B': '#a855f7',
  'Source C': '#00e676',
}

function SourceBadge({ source }) {
  const key = Object.keys(SOURCE_COLORS).find(k => source.startsWith(k))
  const color = SOURCE_COLORS[key] || '#8b96a5'
  const isIndented = source.startsWith('  └')
  return (
    <span style={{
      display: 'inline-block', marginRight: 4, marginBottom: 4,
      padding: isIndented ? '1px 6px' : '2px 8px',
      borderRadius: 3,
      background: `${color}15`,
      border: `1px solid ${color}40`,
      color: isIndented ? '#8b96a5' : color,
      fontSize: isIndented ? 10 : 11,
      fontFamily: 'var(--font-mono)',
    }}>
      {source}
    </span>
  )
}

function ToolTrace({ calls }) {
  const [expanded, setExpanded] = useState(false)
  if (!calls?.length) return null
  return (
    <div style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
      <button onClick={() => setExpanded(e => !e)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <span style={{ fontSize: 9 }}>{expanded ? '▼' : '▶'}</span>
        {calls.length} tool call{calls.length !== 1 ? 's' : ''} executed
      </button>
      {expanded && (
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {calls.map((call, i) => (
            <div key={i} style={{
              background: 'var(--bg-base)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '6px 10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)' }}>{call.tool_name}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{call.duration_ms}ms</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                input: {JSON.stringify(call.input)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className="animate-slide-up" style={{
      display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row',
      gap: 10, marginBottom: 16, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 6, flexShrink: 0,
        background: isUser ? 'var(--accent-glow)' : 'linear-gradient(135deg, #1c2128, #2a2f38)',
        border: `1px solid ${isUser ? 'var(--accent-dim)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, color: isUser ? 'var(--accent)' : 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
      }}>
        {isUser ? 'U' : 'AI'}
      </div>

      <div style={{
        maxWidth: '78%',
        background: isUser ? 'var(--accent-glow)' : 'var(--bg-card)',
        border: `1px solid ${isUser ? 'var(--accent-dim)' : 'var(--border)'}`,
        borderRadius: 10, padding: '10px 14px',
      }}>
        {msg.loading ? (
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
                animation: `pulse-dot 1.2s ${i * 0.2}s infinite`, display: 'inline-block',
              }} />
            ))}
            <span style={{ fontSize: 11, marginLeft: 4 }}>Querying data sources...</span>
          </div>
        ) : (
          <>
            <div className="md-content" style={{ fontSize: 13.5, lineHeight: 1.65 }}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            {msg.sources?.length > 0 && (
              <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>SOURCES USED</div>
                <div>{msg.sources.map((s, i) => <SourceBadge key={i} source={s} />)}</div>
              </div>
            )}
            {msg.toolCalls && <ToolTrace calls={msg.toolCalls} />}
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, textAlign: 'right' }}>{msg.time}</div>
          </>
        )}
      </div>
    </div>
  )
}

const selStyle = {
  width: '100%', padding: '6px 10px', background: 'var(--bg-elevated)',
  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)', fontSize: 12, outline: 'none', cursor: 'pointer',
}

export default function ChatInterface() {
  const [messages, setMessages] = useState([{
    id: 'welcome',
    role: 'assistant',
    content: `## Welcome to StreamVision AI Insights

I'm your internal analytics assistant. I query our SQL database, CSV files, and internal PDF reports to answer business questions grounded in real data.

Try one of the suggested questions, or ask me anything about titles, genres, regions, marketing, or strategy.`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [filters, setFilters] = useState({ genre: '', year: '' })
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => [
      ...prev,
      { id: Date.now() + '-user', role: 'user', content: text, time: now },
      { id: Date.now() + '-loading', role: 'assistant', loading: true, content: '', time: '' },
    ])
    setInput('')
    setLoading(true)

    const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))

    try {
      const result = await sendChat(text, history, activeFilters)
      setMessages(prev => [
        ...prev.filter(m => !m.loading),
        {
          id: Date.now() + '-ai', role: 'assistant',
          content: result.answer,
          sources: result.sources_used,
          toolCalls: result.tool_calls,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setHistory(prev => [
        ...prev.slice(-18),
        { role: 'user', content: text },
        { role: 'assistant', content: result.answer },
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev.filter(m => !m.loading),
        { id: Date.now() + '-err', role: 'assistant', content: `**Error:** ${err.message}`, time: now },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [loading, history, filters])

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
      <aside style={{
        width: 256, flexShrink: 0, background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 10 }}>FILTERS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { key: 'genre', options: ['All Genres', 'Sci-Fi', 'Drama', 'Action', 'Comedy', 'Horror', 'Romance', 'Thriller'] },
              { key: 'year', options: ['All Years', '2024', '2025'] },
            ].map(({ key, options }) => (
              <select key={key} value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value === options[0] ? '' : e.target.value }))} style={selStyle}>
                {options.map(o => <option key={o}>{o}</option>)}
              </select>
            ))}
          </div>
        </div>

        <div style={{ padding: '14px 16px', flex: 1, overflow: 'auto' }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 10 }}>SUGGESTED QUESTIONS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)} disabled={loading} style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                padding: '8px 10px', cursor: 'pointer', textAlign: 'left',
                color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.4, transition: 'var(--transition)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-dim)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <button onClick={() => { setMessages([]); setHistory([]) }} style={{
            width: '100%', padding: '7px', background: 'none',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
            fontFamily: 'var(--font-mono)', transition: 'var(--transition)',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            Clear Conversation
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          {messages.map(msg => <Message key={msg.id} msg={msg} />)}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: '12px 24px 16px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-end',
            background: 'var(--bg-card)', border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-lg)', padding: '8px 12px',
          }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--accent-dim)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about titles, genres, regions, marketing, recommendations..."
              disabled={loading}
              rows={1}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 13.5, fontFamily: 'var(--font-sans)',
                resize: 'none', maxHeight: 120, lineHeight: 1.5,
              }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
            />
            <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{
              width: 34, height: 34, borderRadius: 'var(--radius-md)',
              background: loading || !input.trim() ? 'var(--bg-elevated)' : 'var(--accent)',
              border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              color: loading || !input.trim() ? 'var(--text-muted)' : '#000',
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'var(--transition)',
            }}>
              {loading ? '⟳' : '↑'}
            </button>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
            Enter to send · Shift+Enter for new line · Powered by Claude + internal data sources
          </div>
        </div>
      </div>
    </div>
  )
}
