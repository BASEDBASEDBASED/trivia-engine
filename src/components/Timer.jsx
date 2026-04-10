import { TIMER_MAX } from "../utils/helpers";


export default function Timer({ timeLeft }) {
  const pct = timeLeft / TIMER_MAX;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  // Color shifts: cyan → yellow → red as time decreases
  const color = timeLeft > 8 ? "#00e5ff" : timeLeft > 4 ? "#ffd600" : "#ff1744";
  const urgent = timeLeft <= 5;

  return (
    <div className="timer-wrap">
      <div className={`timer-ring ${urgent ? "timer-urgent" : ""}`}>
        <svg viewBox="0 0 90 90" width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
          <circle className="track" cx="45" cy="45" r={radius} />
          <circle
            className="prog"
            cx="45" cy="45" r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
          />
        </svg>
        <div className="timer-inner">
          <span className="timer-num" style={{ color }}>{timeLeft}</span>
          <span className="timer-label">sec</span>
        </div>
      </div>
    </div>
  );
}
