import Timer from "../components/Timer";
import AnswerButton from "../components/AnswerButton";
import { decodeHTML } from "../utils/helpers";


export default function QuizScreen({
  question,
  qIndex,
  totalQuestions,
  score,
  timeLeft,
  shuffledAnswers,
  selectedAnswer,
  answerStatus,
  onAnswer,
}) {
  if (!question) return null;

  return (
    <div className="screen">
      <div className="card">

        {/* question counter + running score */}
        <div className="quiz-header">
          <div className="q-counter">
            Question <span>{qIndex + 1}</span> / {totalQuestions}
          </div>
          <div className="q-score">⚡ {score.toLocaleString()}</div>
        </div>

        {/* countdown ring, delegates color & animation to Timer */}
        <Timer timeLeft={timeLeft} />

        {/* feedback badge shown after an answer is locked in */}
        {answerStatus && (
          <div className={`status-badge ${answerStatus}`}>
            {answerStatus === "correct"
              ? <>✅ Correct! <span style={{ opacity: 0.8 }}>+{100 + timeLeft * 10} pts</span></>
              : <>❌ {selectedAnswer === "__timeout__" ? "Time's up!" : "Wrong!"}</>
            }
          </div>
        )}

        {/* category tag + question text */}
        <div className="q-category">{decodeHTML(question.category)}</div>
        <div className="q-text">{decodeHTML(question.question)}</div>

        {/* 2×2 answer grid,each button manages its own reveal state  */}
        <div className="answers-grid">
          {shuffledAnswers.map((ans, i) => (
            <AnswerButton
              key={i}
              answer={ans}
              index={i}
              correctAnswer={question.correct_answer}
              selectedAnswer={selectedAnswer}
              onClick={onAnswer}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
