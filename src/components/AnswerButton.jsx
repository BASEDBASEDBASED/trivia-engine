import { decodeHTML } from "../utils/helpers";

const LETTERS = ["A", "B", "C", "D"];


export default function AnswerButton({ answer, index, correctAnswer, selectedAnswer, onClick }) {
  const locked = selectedAnswer !== null;
  const isCorrect = answer === correctAnswer;
  const isWrongPick = answer === selectedAnswer && !isCorrect;

  let cls = "answer-btn";
  if (locked) {
    if (isCorrect) cls += " correct-ans";
    else if (isWrongPick) cls += " wrong-ans";
  }

  return (
    <button
      className={cls}
      onClick={() => onClick(answer)}
      disabled={locked}
    >
      <span className="letter">{LETTERS[index]}</span>
      {decodeHTML(answer)}
    </button>
  );
}
