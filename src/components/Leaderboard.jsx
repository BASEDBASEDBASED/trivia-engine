
export default function Leaderboard({ entries }) {
  return (
    <div className="leaderboard">
      <div className="lb-header">🏆 &nbsp;High Scores</div>

      {entries.length === 0 ? (
        <div className="lb-empty">No scores yet — be the first!</div>
      ) : (
        entries.map((entry, i) => {
          const rankClass = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
          return (
            <div className="lb-row" key={i}>
              <span className={`lb-rank ${rankClass}`}>{medal}</span>
              <span className="lb-name">{entry.name}</span>
              <span className="lb-score">{entry.score.toLocaleString()}</span>
            </div>
          );
        })
      )}
    </div>
  );
}
