1. Technical Report & User Manual (18 pts) 
1.1 Project Overview (3 pts) 
The Grand Master Trivia Engine is an exciting, time pressured quiz app that is built with React. The layout uses CSS flexbox and grid and mobile breakpoint at 500px that switches the two column answer grid into a single column. It gets different multiple choice questions across different difficulties and categories fetched from the Open Trivia DB API. Each quiz is 10 questions, with each question giving the user 15 seconds to answer correctly. The app solves the problem of low engagement, boring quizzes by adding time pressure, bonuses for fast answers, sound feedback, and a highscore leaderboard to make it competitive. Additionally, this app is a cure for boredom!
1.2 Component Architecture (5 pts) 
List your components and explain how data flows between them. Use the following format: 
App.jsx - This holds all global state like gameState, questions, score, timeLeft, and the session counters. Contains all handler functions (startQuiz,  submitScore, …) and passes data and callbacks as props. Manages three useEffect hooks (fetch categories on mount, reshuffle when question index changes, run  timer). Timer useEffect returns a clean up function () => clearTimeoutRef.current to prevent timer from running after state changes. 
StartScreen.jsx - Receives categories, selCategory, selDifficulty, loading, leaderboard as props from App.jsx. Renders the category and difficulty dropdowns and start button. User selections are then lifted back up to App.jsx  through onCategoryChange and onDifficulty callbacks. 
QuizScreen.jsx - Receives question, score, timeLeft, shuffledAnswers, selectedAnswer, and answerStatus as props. Delegates each timer ring to Timer and each answer button to AnswerButton. Renders question text and 2x2 answer grid. It has no logic or state of its own. Rendered when gameState is quiz_active.
ResultsScreen.jsx - Receives score, correctCount, wrongCount, timeBonus, and totalQuestions as props. Calculates and displays accuracy bar. Rendered when gameState is results_screen
Timer.jsx - Receives timeLeft as a prop from QuizScreen. Calculates SVG rings stroke-dashoffset from timeLeft and timer_max and changes the color from cyan to yellow to red as time left is approaching 0.
AnswerButton.jsx - Receives answer, correctAnswer, and selectedAnswer as props. Applies either correct-ans or wrong-ans css classes after the user picks a answer. Disabled once answer is selected.
Leaderboard.jsx - Receives entries array as prop from StartScreen. Shows top 5 scores.
NamePrompt.jsx - Receives pendingScore, playerName, onSubmit, and onSkip as props. Renders an overlay when a high score is achieved. The name input lifts its value to to App through onNameChange
These below aren't components but I figured to add them here:
Utils/helpers.js  - Exports functions localStorage access and the timer_max constant.
Audio.js - Exports playCorrect, playWrong(), and playTick() using web Audio API. The audio context is stored in a useRef in App so it persists across renders without triggering re-renders.
1.3 Detailed Functionality (5 pts) 
For each "Sophisticated" requirement, explain how you implemented it: 

Feature 1: 15 second Timer: The timer is in a useEffect that depends on [timeLeft, gamestate, selectedAwnser]. When timeLeft changes, the effect sets a 1 second setTimeout that decrements timeLeft by 1. This only runs when the gameState is “quiz_active” and the selectedAwnser is null. When timeLeft hits 0, handleTimeout() is used and sets the selectedAnswer as wrong and plays the sound and calls advanceQuestion(). advanceQuestion(0 resets the timeLeft back to the timer max and triggers useEffect for the next question.

Feature 2: External API: The app makes 2 API calls to opentdb.com. On mount, useEffect with an empty array fetches https://opentdb.com/api_category.php to get categories for the category drop down menu on landing screen. When the user starts the quiz, startQuiz() fetches https://opentdb.com/api.php?amount=10&type=multiple&difficulty={difficulty}&category={id}. From the JSON response, the question, correct_answer, incorrect_answer, category, and difficulty is extracted from each of the JSON response. The startQuiz function uses a loading state that shows a spinner while the API call is taking place, if the fetch fails or something goes wrong there will be an error message displayed below they dropdowns. The decodeHTML() in helpers.js handles HTML encoding that the API returns. 

Feature 3: LocalStorage Persistence: The leaderboard is stored in localStorage under gm)trivia_leaderboard as a JSON string. loadLeaderboard() is called when App initializes its leaderboard state. When the session ends, ResultsScreen checks if the score would land in the top 5 highest. If the score is in the top 5 highest, the NamePrompt overlay will appear. When a user submits a name, sibmitScore() reads the current leaderboard, pushes the new score, sorts the score by descending, cuts it to top 5, and calls saveLeaderboard() to write it back to local Storage. 

1.4 User Manual (How to Navigate) (5 pts) 
• Step 1: Go to the link  
• Step 2:  Choose your category (if any in specific) and choose desired difficulty
• Step 3: Click Start Quiz
• Step 4: Read the question in the middle of the screen and pick 1 of 4 responses
• Step 5: Click play again or return to main menu, you will need to give a name
• Step 6: The score associated with the given name will be displayed if in top 5 scores
• Step 7: High score leaderboard will be displayed on the menu screen.
• Step 8: Have fun!


2. Technical Challenges & Solutions (5 pts) 
The biggest challenge was getting the timer to work correctly with React's state system. I was originally using setInterval with a direct reference to timeLeft inside the callback, but because of how js closures work, the callback would get the initial value of timeLeft and would never see it update, the timer would end up getting stuck and not working as it should be. The fix was switching to a chained setTimeout in a useEffect that reruns every time timeLeft changes, using setTimeLeft(t => t-1) reads the latest state value.
The second big challenge came from the same root cause. handleTimeout was defined using useCallback with an empty dependency array, meaning it captured questions.length from the first render when the array is still empty. When the timer would get to 0, the app thought that the quiz had ended and would skip all remaining questions left and would go to the results page instead of the next question (if any). The fix was storing questions.length in a ref with a useEffect to keep it in sync. Refs being mutable makes it always return the current value, so advanceQuestion can read the ref and always get the correct length.  
