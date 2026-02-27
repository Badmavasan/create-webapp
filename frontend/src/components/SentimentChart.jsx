// Composant d'exemple : affiche la répartition des sentiments des avis
// Les données `sentiments` viennent de votre endpoint d'analyse NLP côté backend
// Format attendu : { positive: number, neutral: number, negative: number }

export default function SentimentChart({ sentiments }) {
  const total = sentiments.positive + sentiments.neutral + sentiments.negative
  if (total === 0) return <p className="no-data">Aucun avis analysé.</p>

  const pct = (val) => Math.round((val / total) * 100)

  const bars = [
    { label: 'Positif', value: sentiments.positive, pct: pct(sentiments.positive), color: '#22c55e' },
    { label: 'Neutre', value: sentiments.neutral, pct: pct(sentiments.neutral), color: '#f59e0b' },
    { label: 'Négatif', value: sentiments.negative, pct: pct(sentiments.negative), color: '#ef4444' },
  ]

  return (
    <div className="sentiment-chart">
      <h4>Répartition des sentiments des avis</h4>
      {bars.map((bar) => (
        <div key={bar.label} className="sentiment-row">
          <span className="sentiment-label">{bar.label}</span>
          <div className="sentiment-bar-bg">
            <div
              className="sentiment-bar-fill"
              style={{ width: `${bar.pct}%`, backgroundColor: bar.color }}
            />
          </div>
          <span className="sentiment-pct">{bar.pct}% ({bar.value})</span>
        </div>
      ))}
    </div>
  )
}
