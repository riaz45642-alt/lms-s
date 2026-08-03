import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { errorMessage } from '../services/api'
import './Portal.css'

export default function WorksheetDetails({ worksheetId }) {
  const { api } = useApp()
  const [item, setItem] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { api.get(`/worksheets/${worksheetId}`).then(({ data }) => setItem(data)).catch((e) => setError(errorMessage(e))) }, [worksheetId])
  const download = async () => {
    try {
      const response = await api.get(`/worksheets/${worksheetId}/download`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data); const anchor = document.createElement('a')
      anchor.href = url; anchor.download = item.original_filename; anchor.click(); URL.revokeObjectURL(url)
    } catch (e) { setError(errorMessage(e)) }
  }
  if (error) return <main className="portal"><div className="portal-error">{error}</div></main>
  if (!item) return <main className="portal"><p>Loading worksheet...</p></main>
  return <main className="portal narrow"><span className="eyebrow">{item.subject} · {item.grade_level}</span><h1>{item.title}</h1><p>{item.description || 'No description provided.'}</p><p>{item.instructions}</p><button className="btn btn-primary" onClick={download}>Download {item.original_filename}</button></main>
}
