import { useState } from "react";
import IntervalStaff from "./IntervalStaff";
import { getRandomIntervalQuestion, type IntervalClef, type IntervalQuestion } from "../data/intervals";
import type { AnswerState } from "../types";

const TOTAL_QUESTIONS = 10;
const ANSWERS_PER_QUESTION = 3;
const TOTAL_ANSWERS = TOTAL_QUESTIONS * ANSWERS_PER_QUESTION;
type AnswerKey = "lower" | "upper" | "interval";
type AnswerStates = Record<AnswerKey, AnswerState>;
type SelectedAnswers = Record<AnswerKey, string | null>;

const INITIAL_ANSWER_STATES: AnswerStates = {
  lower: "idle",
  upper: "idle",
  interval: "idle",
};

interface IntervalModeProps {
  clef: IntervalClef;
  onBack: () => void;
  onSwitchClef: () => void;
}

export default function IntervalMode({ clef, onBack, onSwitchClef }: IntervalModeProps) {
  const [question, setQuestion] = useState<IntervalQuestion>(() => getRandomIntervalQuestion(clef));
  const [answerStates, setAnswerStates] = useState<AnswerStates>(INITIAL_ANSWER_STATES);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({
    lower: null,
    upper: null,
    interval: null,
  });
  const [score, setScore] = useState(0);
  const [questionNum, setQuestionNum] = useState(1);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (key: AnswerKey, selected: string, correctAnswer: string) => {
    if (answerStates[key] !== "idle") return;
    const correct = selected === correctAnswer;
    setSelectedAnswers((current) => ({ ...current, [key]: selected }));
    setAnswerStates((current) => ({ ...current, [key]: correct ? "correct" : "wrong" }));
    if (correct) setScore((currentScore) => currentScore + 1);
  };

  const allAnswered = Object.values(answerStates).every((state) => state !== "idle");

  const handleNext = () => {
    if (questionNum >= TOTAL_QUESTIONS) {
      setFinished(true);
      return;
    }
    setQuestion(getRandomIntervalQuestion(clef));
    setAnswerStates(INITIAL_ANSWER_STATES);
    setSelectedAnswers({ lower: null, upper: null, interval: null });
    setQuestionNum((currentQuestion) => currentQuestion + 1);
  };

  const handleRestart = () => {
    setQuestion(getRandomIntervalQuestion(clef));
    setAnswerStates(INITIAL_ANSWER_STATES);
    setSelectedAnswers({ lower: null, upper: null, interval: null });
    setScore(0);
    setQuestionNum(1);
    setFinished(false);
  };

  if (finished) {
    const percentage = Math.round((score / TOTAL_ANSWERS) * 100);
    const emoji = percentage >= 80 ? "🎉" : percentage >= 50 ? "👍" : "💪";

    return (
      <div className="app">
        <div className="mode-header">
          <h1 className="title">Intervalos · Clave de {clef === "treble" ? "sol" : "fa"}</h1>
          <div className="mode-header-actions">
            <button className="mode-switch" onClick={onSwitchClef}>
              Clave de {clef === "treble" ? "fa" : "sol"}
            </button>
            <button className="mode-switch" onClick={onBack}>Notas</button>
          </div>
        </div>
        <div className="card result-card">
          <div className="result-emoji">{emoji}</div>
          <h2 className="result-title">¡Terminaste!</h2>
          <div className="result-score">{score} / {TOTAL_ANSWERS}</div>
          <p className="result-sub">
            {percentage >= 80
              ? "¡Excelente trabajo!"
              : percentage >= 50
                ? "¡Buen intento, sigue practicando!"
                : "¡Practica más, tú puedes!"}
          </p>
          <button className="btn-restart" onClick={handleRestart}>Volver a intentar</button>
        </div>
      </div>
    );
  }

  const progressPercent = ((questionNum - 1) / TOTAL_QUESTIONS) * 100;

  return (
    <div className="app">
      <header className="mode-header">
        <h1 className="title">Intervalos · Clave de {clef === "treble" ? "sol" : "fa"}</h1>
        <div className="mode-header-actions">
          <span className="question-counter">{questionNum} / {TOTAL_QUESTIONS}</span>
          <button className="mode-switch" onClick={onSwitchClef}>
            Clave de {clef === "treble" ? "fa" : "sol"}
          </button>
          <button className="mode-switch" onClick={onBack}>Notas</button>
        </div>
      </header>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <main className="main">
        <div className="card staff-card">
          <p className="instruction">Identifica las dos notas y la distancia del intervalo</p>
          <IntervalStaff lowerNote={question.lowerNote} upperNote={question.upperNote} clef={clef} />
          {allAnswered && (
            <div className="next-row">
              <button className="btn-next" onClick={handleNext}>
                {questionNum >= TOTAL_QUESTIONS ? "Ver resultado" : "Siguiente →"}
              </button>
            </div>
          )}
        </div>

        <div className="dual-grid">
          {([
            {
              key: "lower" as const,
              title: "Primera nota",
              note: question.lowerNote,
              options: question.lowerOptions,
            },
            {
              key: "upper" as const,
              title: "Segunda nota",
              note: question.upperNote,
              options: question.upperOptions,
            },
          ]).map(({ key, title, note, options }) => (
            <div className="card option-section" key={key}>
              <h2 className="section-title">{title}</h2>
              <div className="options">
                {options.map((option) => {
                  let buttonClass = "option-btn";
                  if (selectedAnswers[key] === option.id) {
                    buttonClass += answerStates[key] === "correct" ? " correct" : " wrong";
                  } else if (answerStates[key] !== "idle" && option.id === note.id) {
                    buttonClass += " reveal";
                  }

                  return (
                    <button
                      key={option.id}
                      className={buttonClass}
                      onClick={() => handleAnswer(key, option.id, note.id)}
                      disabled={answerStates[key] !== "idle"}
                    >
                      {option.solfeo}
                    </button>
                  );
                })}
              </div>
              {answerStates[key] !== "idle" && (
                <div className="feedback-row">
                  <span className={`feedback-text ${answerStates[key] === "correct" ? "feedback-correct" : "feedback-wrong"}`}>
                    {answerStates[key] === "correct" ? `✓ ${note.name}` : `✗ Era ${note.name}`}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="card option-section">
          <h2 className="section-title">Distancia del intervalo</h2>
          <div className="options">
            {question.options.map((option) => {
              let buttonClass = "option-btn";
              if (selectedAnswers.interval === option) {
                buttonClass += answerStates.interval === "correct" ? " correct" : " wrong";
              } else if (answerStates.interval !== "idle" && option === question.answer) {
                buttonClass += " reveal";
              }

              return (
                <button
                  key={option}
                  className={buttonClass}
                  onClick={() => handleAnswer("interval", option, question.answer)}
                  disabled={answerStates.interval !== "idle"}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {answerStates.interval !== "idle" && (
            <div className="feedback-row">
              <span className={`feedback-text ${answerStates.interval === "correct" ? "feedback-correct" : "feedback-wrong"}`}>
                {answerStates.interval === "correct"
                  ? `✓ ${question.lowerNote.name}–${question.upperNote.name}: ${question.answer}`
                  : `✗ Era ${question.lowerNote.name}–${question.upperNote.name}: ${question.answer}`}
              </span>
            </div>
          )}
        </div>

        <div className="score-row">
          <span className="score-badge">✓ {score} / {TOTAL_ANSWERS} correctas</span>
        </div>
      </main>
    </div>
  );
}
