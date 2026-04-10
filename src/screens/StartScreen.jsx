import Leaderboard from "../components/Leaderboard";

export default function StartScreen({
  categories,
  selCategory,
  selDifficulty,
  loading,
  error,
  leaderboard,
  onCategoryChange,
  onDifficultyChange,
  onStart,
}) {
  return (
    <div className="screen">
      <div className="card">

        {/* Logo */}
        <div className="logo-row">
          <div className="logo-icon">⚡</div>
          <div className="logo-text">
            <h1>Grand Master</h1>
            <span>Trivia Engine</span>
          </div>
        </div>

        {/* Category selector — options populated from API */}
        <label className="field-label">Category</label>
        <div className="select-wrap">
          <select
            className="select-styled"
            value={selCategory}
            onChange={e => onCategoryChange(e.target.value)}
          >
            <option value="">Any Category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Difficulty selector */}
        <label className="field-label">Difficulty</label>
        <div className="select-wrap">
          <select
            className="select-styled"
            value={selDifficulty}
            onChange={e => onDifficultyChange(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* error message if question fetch failed */}
        {error && <div className="error-msg">{error}</div>}

        <button className="btn-primary" onClick={onStart} disabled={loading}>
          {loading ? <><span className="spinner" />Loading Questions…</> : "▶ Start Quiz"}
        </button>

        {/* leaderboard reads from App state passed as prop */}
        <Leaderboard entries={leaderboard} />
      </div>
    </div>
  );
}
