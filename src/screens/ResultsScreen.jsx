import { loadLeaderboard } from "../utils/helpers";


export default function ResultsScreen({
  score,
  correctCount,
  wrongCount,
  timeBonus,
  totalQuestions,
  onPlayAgain,
  onMenu,
}) {
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  // check if this score qualifies for the leaderboard
  const lb = loadLeaderboard();
  const isHighScore = lb.length < 5 || score > (lb[lb.length - 1]?.score ?? 0);

  return (
    <div className="screen">
      <div className="card">

        <div className="results-title">Quiz Complete!</div>
        <div className="results-subtitle">Performance Report</div>

        {/* big score display */}
        <div className="big-score">{score.toLocaleString()}</div>

        {/* stat breakdown cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="val green">{correctCount}</div>
            <div className="lbl">Correct</div>
          </div>
          <div className="stat-card">
            <div className="val red">{wrongCount}</div>
            <div className="lbl">Wrong</div>
          </div>
          <div className="stat-card">
            <div className="val gold">+{timeBonus}</div>
            <div className="lbl">Time Bonus</div>
          </div>
        </div>

        {/* accuracy progress bar */}
        <div className="accuracy-bar">
          <div className="accuracy-bar-label">
            <span>Accuracy</span>
            <span style={{ color: "var(--text)" }}>{accuracy}%</span>
          </div>
          <div className="accuracy-bar-track">
            <div className="accuracy-bar-fill" style={{ width: `${accuracy}%` }} />
          </div>
        </div>

        {/* badge shown only when score places in top 5 */}
        {isHighScore && (
          <div className="hs-badge">🏆 &nbsp;High Score Territory!</div>
        )}

        {/* onPlayAgain triggers leaderboard prompt in App if score qualifies */}
        <button className="btn-primary" onClick={onPlayAgain}>▶ Play Again</button>
        <button className="btn-ghost" onClick={onMenu}>← Back to Menu</button>

      </div>
    </div>
  );
}
