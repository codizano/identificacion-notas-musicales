import { useState, useCallback } from "react";
import type { FormEvent } from "react";
import Staff from "./components/Staff";
import IntervalMode from "./components/IntervalMode";
import { getRandomBassNote, getRandomTrebleNote, getOptions } from "./data/notes";
import type { IntervalClef } from "./data/intervals";
import type { NoteData, AnswerState } from "./types";
import "./App.css";

const TOTAL_QUESTIONS = 10;
const TOTAL_ANSWERS = TOTAL_QUESTIONS * 2;

function buildQuestion() {
  const trebleNote = getRandomTrebleNote();
  const bassNote = getRandomBassNote();
  const trebleOptions = getOptions(trebleNote);
  const bassOptions = getOptions(bassNote);
  return { trebleNote, bassNote, trebleOptions, bassOptions };
}

export default function App() {
  const [mode, setMode] = useState<"notes" | IntervalClef>("notes");
  const [question, setQuestion] = useState(buildQuestion);
  const [answerStateTreble, setAnswerStateTreble] = useState<AnswerState>("idle");
  const [answerStateBass, setAnswerStateBass] = useState<AnswerState>("idle");
  const [selectedTrebleId, setSelectedTrebleId] = useState<string | null>(null);
  const [selectedBassId, setSelectedBassId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [questionNum, setQuestionNum] = useState(1);
  const [screen, setScreen] = useState<"quiz" | "name" | "result">("quiz");
  const [studentName, setStudentName] = useState("");
  const [confirmedName, setConfirmedName] = useState("");
  const [attemptDate, setAttemptDate] = useState<Date | null>(null);

  const handleAnswer = useCallback(
    (clef: "treble" | "bass", chosen: NoteData) => {
      const currentState = clef === "treble" ? answerStateTreble : answerStateBass;
      if (currentState !== "idle") return;

      const correct = chosen.solfeo ===
        (clef === "treble" ? question.trebleNote.solfeo : question.bassNote.solfeo);

      if (clef === "treble") {
        setSelectedTrebleId(chosen.id);
        setAnswerStateTreble(correct ? "correct" : "wrong");
      } else {
        setSelectedBassId(chosen.id);
        setAnswerStateBass(correct ? "correct" : "wrong");
      }

      if (correct) setScore((s) => s + 1);
    },
    [answerStateBass, answerStateTreble, question]
  );

  const handleNext = useCallback(() => {
    if (questionNum >= TOTAL_QUESTIONS) {
      setAttemptDate(new Date());
      setScreen("name");
      return;
    }
    setQuestion(buildQuestion());
    setAnswerStateTreble("idle");
    setAnswerStateBass("idle");
    setSelectedTrebleId(null);
    setSelectedBassId(null);
    setQuestionNum((n) => n + 1);
  }, [questionNum]);

  const handleRestart = useCallback(() => {
    setQuestion(buildQuestion());
    setAnswerStateTreble("idle");
    setAnswerStateBass("idle");
    setSelectedTrebleId(null);
    setSelectedBassId(null);
    setScore(0);
    setQuestionNum(1);
    setStudentName("");
    setConfirmedName("");
    setAttemptDate(null);
    setScreen("quiz");
  }, []);

  const progressPercent = ((questionNum - 1) / TOTAL_QUESTIONS) * 100;
  const bothAnswered = answerStateTreble !== "idle" && answerStateBass !== "idle";
  const trimmedStudentName = studentName.trim();

  const handleShowResult = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedStudentName || !attemptDate) return;
    setConfirmedName(trimmedStudentName);
    setScreen("result");
  };

  if (mode !== "notes") {
    return (
      <IntervalMode
        key={mode}
        clef={mode}
        onBack={() => setMode("notes")}
        onSwitchClef={() => setMode(mode === "treble" ? "bass" : "treble")}
      />
    );
  }

  if (screen === "name") {
    return (
      <div className="app">
        <form className="card name-card" onSubmit={handleShowResult}>
          <h2 className="result-title">Antes de ver tu resultado</h2>
          <label className="name-label" htmlFor="student-name">
            Escribe tu nombre
          </label>
          <input
            id="student-name"
            className="name-input"
            type="text"
            autoComplete="name"
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
          />
          <button className="btn-restart" type="submit" disabled={!trimmedStudentName}>
            Ver mi resultado
          </button>
        </form>
      </div>
    );
  }

  if (screen === "result") {
    const pct = Math.round((score / TOTAL_ANSWERS) * 100);
    const emoji = pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪";
    return (
      <div className="app">
        <div className="card result-card">
          <div className="result-emoji">{emoji}</div>
          <h2 className="result-title">{confirmedName}</h2>
          <p className="result-date">
            Fecha y hora local: {attemptDate?.toLocaleString("es")}
          </p>
          <div className="result-score">
            <span className="result-score-label">Puntaje</span>
            {score} / {TOTAL_ANSWERS}
          </div>
          <div className="result-details">
            <p>Aciertos: {score}</p>
            <p>Fallos: {TOTAL_ANSWERS - score}</p>
          </div>
          <p className="result-sub">
            {pct >= 80
              ? "¡Excelente trabajo!"
              : pct >= 50
              ? "¡Buen intento, sigue practicando!"
              : "¡Practica más, tú puedes!"}
          </p>
          <p className="result-instruction">
            Tómale una foto a esta pantalla y envíala a tu profesor para registrar tu nota.
          </p>
          <button className="btn-restart" onClick={handleRestart}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">Notas en el pentagrama</h1>
        <div className="mode-header-actions">
          <span className="question-counter">
            {questionNum} / {TOTAL_QUESTIONS}
          </span>
          <button className="mode-switch" aria-label="Intervalos en clave de sol" onClick={() => setMode("treble")}>
            Int. sol
          </button>
          <button className="mode-switch" aria-label="Intervalos en clave de fa" onClick={() => setMode("bass")}>
            Int. fa
          </button>
        </div>
      </header>

      {/* Barra de progreso */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <main className="main">
        <div className="card staff-card">
          <p className="instruction">Identifica las notas en ambos pentagramas</p>
          <Staff trebleNote={question.trebleNote} bassNote={question.bassNote} />
          {bothAnswered && (
            <div className="next-row">
              <button className="btn-next" onClick={handleNext}>
                {questionNum >= TOTAL_QUESTIONS ? "Ver resultado" : "Siguiente →"}
              </button>
            </div>
          )}
        </div>

        <div className="dual-grid">
          <div className="card option-section">
            <h2 className="section-title" aria-label="Clave de fa">
              <span className="clef-symbol" aria-hidden="true">𝄢</span>
            </h2>
            <div className="options">
              {question.bassOptions.map((opt) => {
                let btnClass = "option-btn";
                if (selectedBassId === opt.id) {
                  btnClass += answerStateBass === "correct" ? " correct" : " wrong";
                } else if (answerStateBass !== "idle" && opt.id === question.bassNote.id) {
                  btnClass += " reveal";
                }
                return (
                  <button
                    key={opt.id}
                    className={btnClass}
                    onClick={() => handleAnswer("bass", opt)}
                    disabled={answerStateBass !== "idle"}
                  >
                    {opt.solfeo}
                  </button>
                );
              })}
            </div>
            {answerStateBass !== "idle" && (
              <div className="feedback-row">
                <span className={`feedback-text ${answerStateBass === "correct" ? "feedback-correct" : "feedback-wrong"}`}>
                  {answerStateBass === "correct"
                    ? `✓ ¡Correcto! Es ${question.bassNote.name}`
                    : `✗ Era ${question.bassNote.name}`}
                </span>
              </div>
            )}
          </div>

          <div className="card option-section">
            <h2 className="section-title" aria-label="Clave de sol">
              <span className="clef-symbol" aria-hidden="true">𝄞</span>
            </h2>
            <div className="options">
              {question.trebleOptions.map((opt) => {
                let btnClass = "option-btn";
                if (selectedTrebleId === opt.id) {
                  btnClass += answerStateTreble === "correct" ? " correct" : " wrong";
                } else if (answerStateTreble !== "idle" && opt.id === question.trebleNote.id) {
                  btnClass += " reveal";
                }
                return (
                  <button
                    key={opt.id}
                    className={btnClass}
                    onClick={() => handleAnswer("treble", opt)}
                    disabled={answerStateTreble !== "idle"}
                  >
                    {opt.solfeo}
                  </button>
                );
              })}
            </div>
            {answerStateTreble !== "idle" && (
              <div className="feedback-row">
                <span className={`feedback-text ${answerStateTreble === "correct" ? "feedback-correct" : "feedback-wrong"}`}>
                  {answerStateTreble === "correct"
                    ? `✓ ¡Correcto! Es ${question.trebleNote.name}`
                    : `✗ Era ${question.trebleNote.name}`}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="score-row">
          <span className="score-badge">✓ {score} correctas</span>
        </div>

      </main>
    </div>
  );
}