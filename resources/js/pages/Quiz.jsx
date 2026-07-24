import { useEffect, useMemo, useState } from 'react'
import { useRouter } from '../router/Router'
import { quizzesData } from '../data/lmsData'
import { EmptyState, Modal, ProgressRing } from '../components/ui/UI'
import './pages.css'
import './lms.css'

function fmt(s) {
  const m = Math.floor(s / 60); const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function Quiz({ quizId }) {
  const { navigate } = useRouter()
  const quiz = quizzesData[quizId] || Object.values(quizzesData)[0]
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(quiz?.durationSec || 300)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted || !quiz) return
    if (timeLeft <= 0) { setSubmitted(true); return }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [timeLeft, submitted, quiz])

  const score = useMemo(() => {
    if (!quiz) return 0
    let correct = 0
    quiz.questions.forEach((q) => { if (answers[q.id] === q.answer) correct += 1 })
    return correct
  }, [answers, quiz])

  if (!quiz) {
    return <div className="page-section"><div className="wrap"><EmptyState icon="📝" title="Quiz not found" actionLabel="Back to dashboard" onAction={() => navigate('/dashboard')} /></div></div>
  }

  const q = quiz.questions[current]
  const pct = Math.round((score / quiz.questions.length) * 100)

  if (submitted) {
    return (
      <div className="page-section">
        <div className="wrap" style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className="quiz-card score-card">
            <div className="eyebrow">Quiz complete</div>
            <h2 style={{ marginTop: 8 }}>{quiz.title}</h2>
            <div className="score-ring-wrap" style={{ marginTop: 20 }}>
              <ProgressRing value={pct} size={140} stroke={12} label="Score" color={pct >= 70 ? '#1f9d57' : pct >= 40 ? 'var(--gold)' : '#c53b3b'} />
            </div>
            <p style={{ color: 'var(--muted)' }}>{score} out of {quiz.questions.length} correct</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Back to dashboard</button>
              <button className="btn btn-primary" onClick={() => { setAnswers({}); setCurrent(0); setTimeLeft(quiz.durationSec); setSubmitted(false) }}>Retake quiz</button>
            </div>

            <div className="result-list">
              {quiz.questions.map((qq) => {
                const correct = answers[qq.id] === qq.answer
                return (
                  <div className="result-row" key={qq.id}>
                    <span className={`result-icon ${correct ? 'correct' : 'wrong'}`}>{correct ? '✓' : '✕'}</span>
                    <div className="result-row-body">
                      <strong style={{ fontSize: 14 }}>{qq.text}</strong>
                      <p>Correct answer: {qq.options[qq.answer]}{!correct && answers[qq.id] !== undefined ? ` · Your answer: ${qq.options[answers[qq.id]]}` : ''}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-section">
      <div className="wrap" style={{ maxWidth: 700, margin: '0 auto' }}>
        <div className="quiz-top">
          <div>
            <div className="eyebrow">{quiz.subject}</div>
            <h2 style={{ marginTop: 6 }}>{quiz.title}</h2>
          </div>
          <span className={`quiz-timer${timeLeft <= 30 ? ' low' : ''}`}>⏱ {fmt(timeLeft)}</span>
        </div>

        <div className="quiz-progress-dots" style={{ marginBottom: 18 }}>
          {quiz.questions.map((qq, i) => (
            <button key={qq.id} className={`qd${answers[qq.id] !== undefined ? ' answered' : ''}${i === current ? ' current' : ''}`} onClick={() => setCurrent(i)}>{i + 1}</button>
          ))}
        </div>

        <div className="quiz-card">
          <h3>{q.text}</h3>
          <div className="quiz-options">
            {q.options.map((opt, i) => (
              <div key={opt} className={`quiz-option${answers[q.id] === i ? ' selected' : ''}`} onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}>
                <span className="opt-letter">{String.fromCharCode(65 + i)}</span>{opt}
              </div>
            ))}
          </div>
          <div className="quiz-nav">
            <button className="btn btn-ghost" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>← Previous</button>
            {current < quiz.questions.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setCurrent((c) => c + 1)}>Next →</button>
            ) : (
              <button className="btn btn-primary" onClick={() => setConfirmOpen(true)}>Submit quiz</button>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Submit quiz?"
        footer={(
          <>
            <button className="btn btn-ghost" onClick={() => setConfirmOpen(false)}>Keep reviewing</button>
            <button className="btn btn-primary" onClick={() => { setConfirmOpen(false); setSubmitted(true) }}>Submit</button>
          </>
        )}
      >
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          You've answered {Object.keys(answers).length} of {quiz.questions.length} questions. Once submitted, you won't be able to change your answers.
        </p>
      </Modal>
    </div>
  )
}
