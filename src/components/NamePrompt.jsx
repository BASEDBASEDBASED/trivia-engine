
export default function NamePrompt({ pendingScore, playerName, onNameChange, onSubmit, onSkip }) {
  return (
    <div className="overlay-bg">
      <div className="overlay-card">
        <h2>🏆 New High Score!</h2>
        <p>
          You scored <strong style={{ color: "var(--accent2)" }}>{pendingScore?.toLocaleString()}</strong> — enter your name for the leaderboard.
        </p>
        <input
          className="text-input"
          placeholder="Your name..."
          value={playerName}
          onChange={e => onNameChange(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onSubmit()}
          maxLength={20}
          autoFocus
        />
        <button className="btn-primary" onClick={onSubmit}>Save to Leaderboard</button>
        <button className="btn-ghost" onClick={onSkip}>Skip</button>
      </div>
    </div>
  );
}
