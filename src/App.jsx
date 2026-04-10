import { useState, useEffect, useRef, useCallback } from "react";

import StartScreen from "./screens/StartScreen";
import QuizScreen from "./screens/QuizScreen";
import ResultsScreen from "./screens/ResultsScreen";
import NamePrompt from "./components/NamePrompt";

import { shuffle, loadLeaderboard, saveLeaderboard, TIMER_MAX } from "./utils/helpers";
import { createAudioCtx, playCorrect, playWrong, playTick } from "./utils/audio";

export default function App() {
  const [gameState, setGameState]             = useState("START_SCREEN");
  const [categories, setCategories]           = useState([]);
  const [selCategory, setSelCategory]         = useState("");
  const [selDifficulty, setSelDifficulty]     = useState("medium");
  const [questions, setQuestions]             = useState([]);
  const [qIndex, setQIndex]                   = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [score, setScore]                     = useState(0);
  const [correctCount, setCorrectCount]       = useState(0);
  const [wrongCount, setWrongCount]           = useState(0);
  const [timeLeft, setTimeLeft]               = useState(TIMER_MAX);
  const [selectedAnswer, setSelectedAnswer]   = useState(null);
  const [answerStatus, setAnswerStatus]       = useState(null);
  const [flashClass, setFlashClass]           = useState("");
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState("");
  const [leaderboard, setLeaderboard]         = useState(loadLeaderboard);
  const [playerName, setPlayerName]           = useState("");
  const [namePrompt, setNamePrompt]           = useState(false);
  const [pendingScore, setPendingScore]       = useState(null);
  const [timeBonus, setTimeBonus]             = useState(0);

  // Refs don't trigger re-renders — used for audio, timer coordination, and stale closure fixes
  const audioCtxRef       = useRef(null);
  const timerRef          = useRef(null);
  const transitionRef     = useRef(false);   // prevents double-advancing on rapid events
  const questionsLengthRef = useRef(0);      // always-current questions.length, avoids stale closure in handleTimeout

  // Lazy audio init — must be triggered by a user gesture
  const ensureAudio = () => {
    if (!audioCtxRef.current) audioCtxRef.current = createAudioCtx();
  };

  // Fetch category list from Open Trivia DB on first render
  useEffect(() => {
    fetch("https://opentdb.com/api_category.php")
      .then(r => r.json())
      .then(d => setCategories(d.trivia_categories || []))
      .catch(() => {});
  }, []);

  // Keep questionsLengthRef in sync whenever questions array changes
  useEffect(() => {
    questionsLengthRef.current = questions.length;
  }, [questions]);

  // Reshuffle answers whenever the question index changes (Fisher-Yates via helpers.js)
  useEffect(() => {
    if (questions.length > 0 && qIndex < questions.length) {
      const q = questions[qIndex];
      setShuffledAnswers(shuffle([q.correct_answer, ...q.incorrect_answers]));
    }
  }, [questions, qIndex]);

  // Countdown timer — decrements every second while quiz is active
  useEffect(() => {
    if (gameState !== "QUIZ_ACTIVE" || selectedAnswer !== null) return;
    if (timeLeft <= 0) { handleTimeout(); return; }

    timerRef.current = setTimeout(() => {
      setTimeLeft(t => {
        if (t <= 4) playTick(audioCtxRef.current); // urgent ticking sound
        return t - 1;
      });
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timeLeft, gameState, selectedAnswer]);

  // Called when the timer hits 0
  const handleTimeout = useCallback(() => {
    if (transitionRef.current) return;
    transitionRef.current = true;
    clearTimeout(timerRef.current);
    setSelectedAnswer("__timeout__");
    setAnswerStatus("wrong");
    setFlashClass("shake");
    playWrong(audioCtxRef.current);
    setWrongCount(c => c + 1);
    setTimeout(() => { setFlashClass(""); advanceQuestion(); }, 1500);
  }, []);

  // Move to the next question or end the quiz
  // Uses questionsLengthRef instead of questions.length to avoid stale closure bug
  const advanceQuestion = () => {
    transitionRef.current = false;
    setQIndex(i => {
      const next = i + 1;
      if (next >= questionsLengthRef.current) {
        setTimeout(() => setGameState("RESULTS_SCREEN"), 50);
        return i;
      }
      setSelectedAnswer(null);
      setAnswerStatus(null);
      setTimeLeft(TIMER_MAX);
      return next;
    });
  };

  // User clicks an answer button
  const handleAnswer = (answer) => {
    if (selectedAnswer !== null || transitionRef.current) return;
    transitionRef.current = true;
    ensureAudio();
    clearTimeout(timerRef.current);

    const correct = questions[qIndex].correct_answer;
    const isRight = answer === correct;
    const bonus   = isRight ? timeLeft * 10 : 0;

    setSelectedAnswer(answer);

    if (isRight) {
      setAnswerStatus("correct");
      setFlashClass("flash-correct");
      setScore(s => s + 100 + bonus);
      setTimeBonus(b => b + bonus);
      setCorrectCount(c => c + 1);
      playCorrect(audioCtxRef.current);
    } else {
      setAnswerStatus("wrong");
      setFlashClass("shake");
      setWrongCount(c => c + 1);
      playWrong(audioCtxRef.current);
    }

    setTimeout(() => { setFlashClass(""); advanceQuestion(); }, 1500);
  };

  // Fetch questions from Open Trivia DB and reset all session state
  const startQuiz = async () => {
    ensureAudio();
    setLoading(true);
    setError("");
    try {
      let url = `https://opentdb.com/api.php?amount=10&type=multiple&difficulty=${selDifficulty}`;
      if (selCategory) url += `&category=${selCategory}`;
      const res  = await fetch(url);
      const data = await res.json();

      if (data.response_code !== 0 || !data.results?.length) {
        setError("Not enough questions for this combo. Try another category/difficulty.");
        setLoading(false);
        return;
      }

      setQuestions(data.results);
      setQIndex(0);
      setScore(0);
      setCorrectCount(0);
      setWrongCount(0);
      setTimeBonus(0);
      setSelectedAnswer(null);
      setAnswerStatus(null);
      setTimeLeft(TIMER_MAX);
      transitionRef.current = false;
      setGameState("QUIZ_ACTIVE");
    } catch {
      setError("Failed to fetch questions. Check your connection.");
    }
    setLoading(false);
  };

  // Save a high score to localStorage and update leaderboard state
  const submitScore = () => {
    const name = playerName.trim() || "Player";
    const lb = loadLeaderboard();
    lb.push({ name, score: pendingScore });
    lb.sort((a, b) => b.score - a.score);
    const top5 = lb.slice(0, 5);
    saveLeaderboard(top5);
    setLeaderboard(top5);
    setNamePrompt(false);
    setPlayerName("");
    setPendingScore(null);
    setGameState("START_SCREEN");
  };

  // Check if score qualifies for leaderboard before navigating away from results
  const handlePlayAgain = () => {
    const lb = loadLeaderboard();
    if (lb.length < 5 || score > lb[lb.length - 1]?.score) {
      setPendingScore(score);
      setNamePrompt(true);
    } else {
      setGameState("START_SCREEN");
    }
  };

  return (
    <>
      {/* Full-screen flash/shake overlay — driven by flashClass state */}
      <div className={`feedback-overlay ${flashClass}`} />

      {/* Name prompt overlay — shown on top of results screen when a high score is achieved */}
      {namePrompt && (
        <NamePrompt
          pendingScore={pendingScore}
          playerName={playerName}
          onNameChange={setPlayerName}
          onSubmit={submitScore}
          onSkip={() => { setNamePrompt(false); setGameState("START_SCREEN"); }}
        />
      )}

      <div className="engine-wrap">

        {/* Conditional rendering — only one screen shown at a time based on gameState */}

        {gameState === "START_SCREEN" && (
          <StartScreen
            categories={categories}
            selCategory={selCategory}
            selDifficulty={selDifficulty}
            loading={loading}
            error={error}
            leaderboard={leaderboard}
            onCategoryChange={setSelCategory}
            onDifficultyChange={setSelDifficulty}
            onStart={startQuiz}
          />
        )}

        {gameState === "QUIZ_ACTIVE" && (
          <QuizScreen
            question={questions[qIndex]}
            qIndex={qIndex}
            totalQuestions={questions.length}
            score={score}
            timeLeft={timeLeft}
            shuffledAnswers={shuffledAnswers}
            selectedAnswer={selectedAnswer}
            answerStatus={answerStatus}
            onAnswer={handleAnswer}
          />
        )}

        {gameState === "RESULTS_SCREEN" && (
          <ResultsScreen
            score={score}
            correctCount={correctCount}
            wrongCount={wrongCount}
            timeBonus={timeBonus}
            totalQuestions={questions.length}
            onPlayAgain={handlePlayAgain}
            onMenu={handlePlayAgain}
          />
        )}

      </div>
    </>
  );
}
