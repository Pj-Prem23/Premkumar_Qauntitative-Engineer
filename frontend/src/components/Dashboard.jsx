import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts'
import { getTopTitles, getGenreTrends, getRegionalPerformance, getMarketingRoi } from '../api/client'

const FALLBACK_TITLES = [
  { name: 'Stellar Run', score: 92, genre: 'Sci-Fi' },
  { name: 'Dark Orbit', score: 88, genre: 'Action' },
  { name: 'Last Kingdom', score: 84, genre: 'Drama' },
  { name: 'Neon Hearts', score: 79, genre: 'Romance' },
  { name: 'Shadow Protocol', score: 76, genre: 'Thriller' },
]

const FALLBACK_GENRES = [
  { month: 'Jan', 'Sci-Fi': 82, Drama: 74, Action: 68, Comedy: 55 },
  { month: 'Feb', 'Sci-Fi': 85, Drama: 71, Action: 72, Comedy: 52 },
  { month: 'Mar', 'Sci-Fi': 88, Drama: 76, Action: 75, Comedy: 58 },
  { month: 'Apr', 'Sci-Fi': 91, Drama: 78, Action: 73, Comedy: 54 },
  { month: 'May', 'Sci-Fi': 92, Drama: 80, Action: 77, Comedy: 60 },
]

const FALLBACK_REGIONAL = [
  { city: 'Mumbai', engagement: 88 },
  { city: 'Delhi', engagement: 82 },
  { city: 'Bangalore', engagement: 79 },
  { city: 'Hyderabad', engagement: 75 },
  { city: 'Chennai', engagement: 71 },
]

const FALLBACK_ROI = [
  { channel: 'Social', spend: 120, revenue: 340 },
  { channel: 'Email', spend: 45, revenue: 180 },
  { channel: 'Search', spend: 200, revenue: 420 },
  { channel: 'Display', spend: 80, revenue: 110 },
]

const tooltip = {
  contentStyle: { background: '#1c2128', border: '1px solid #2a2f38', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#8b96a5' },
  itemStyle: { color: '#e8ecf0' },
}

function Card({ title, children, style = {} }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: 20, ...style,
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 16 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const [titles, setTitles] = useState(FALLBACK_TITLES)
  const [genres, setGenres] = useState(FALLBACK_GENRES)
  const [regional, setRegional] = useState(FALLBACK_REGIONAL)
  const [roi, setRoi] = useState(FALLBACK_ROI)

  useEffect(() => {
    getTopTitles().then(d => d.titles?.length && setTitles(d.titles)).catch(() => {})
    getGenreTrends().then(d => d.trends?.length && setGenres(d.trends)).catch(() => {})
    getRegionalPerformance().then(d => d.regions?.length && setRegional(d.regions)).catch(() => {})
    getMarketingRoi().then(d => d.channels?.length && setRoi(d.channels)).catch(() => {})
  }, [])

  const genreKeys = genres.length ? Object.keys(genres[0]).filter(k => k !== 'month') : []
  const GENRE_COLORS = ['#00d4ff', '#a855f7', '#00e676', '#ffd32a', '#ff8c42']

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 24, display: 'grid', gap: 20, gridTemplateColumns: 'repeat(2, 1fr)', alignContent: 'start' }}>

      {/* Top Titles */}
      <Card title="TOP PERFORMING TITLES">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={titles} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#4a5568', fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#8b96a5', fontSize: 11 }} width={90} />
            <Tooltip {...tooltip} />
            <Bar dataKey="score" fill="#00d4ff" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Regional Engagement */}
      <Card title="REGIONAL ENGAGEMENT">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={regional}>
            <XAxis dataKey="city" tick={{ fill: '#8b96a5', fontSize: 10 }} />
            <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} domain={[0, 100]} />
            <Tooltip {...tooltip} />
            <Bar dataKey="engagement" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Genre Trends */}
      <Card title="GENRE TRENDS OVER TIME" style={{ gridColumn: 'span 2' }}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={genres}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2f38" />
            <XAxis dataKey="month" tick={{ fill: '#8b96a5', fontSize: 10 }} />
            <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} domain={[40, 100]} />
            <Tooltip {...tooltip} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#8b96a5' }} />
            {genreKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={GENRE_COLORS[i % GENRE_COLORS.length]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Marketing ROI */}
      <Card title="MARKETING ROI BY CHANNEL" style={{ gridColumn: 'span 2' }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={roi}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2f38" />
            <XAxis dataKey="channel" tick={{ fill: '#8b96a5', fontSize: 10 }} />
            <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} />
            <Tooltip {...tooltip} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#8b96a5' }} />
            <Bar dataKey="spend" name="Spend ($k)" fill="#ff4757" radius={[4, 4, 0, 0]} />
            <Bar dataKey="revenue" name="Revenue ($k)" fill="#00e676" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

    </div>
  )
}
