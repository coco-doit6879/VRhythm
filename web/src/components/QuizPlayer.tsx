import React, { useState } from 'react';
import { Award, CheckCircle2, ChevronRight, HelpCircle, RefreshCw, Sparkles, XCircle } from 'lucide-react';
import { mockQuizData, QuizData } from '../data/mock';

interface QuizPlayerProps {
  quizData?: QuizData;
  onComplete?: (score: number, passed: boolean) => void;
}

export function QuizPlayer({ quizData = mockQuizData, onComplete }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = quizData.questions[currentIndex];
  const totalQuestions = quizData.questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSelectOption = (optionId: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    quizData.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctOptionId) {
        correctCount++;
      }
    });
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= quizData.passPercentage;
    return { correctCount, percentage, passed };
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const { percentage, passed } = calculateScore();
    if (onComplete) {
      onComplete(percentage, passed);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setCurrentIndex(0);
  };

  const selectedOptionId = selectedAnswers[currentQuestion?.id];

  if (submitted) {
    const { correctCount, percentage, passed } = calculateScore();
    return (
      <div className="quiz-result-card">
        <div className="quiz-result-header">
          <span className="quiz-badge">
            <Sparkles size={16} /> Kết quả thử thách
          </span>
          <h2>{passed ? 'Xuất sắc! Bạn đã đạt bài thi' : 'Tiếc quá! Chưa đạt yêu cầu'}</h2>
        </div>

        <div className="quiz-score-circle" style={{ borderColor: passed ? '#4f8f83' : '#e06c75' }}>
          <div className="score-number">{percentage}%</div>
          <small>{correctCount} / {totalQuestions} câu đúng</small>
        </div>

        <div className="quiz-result-details">
          <div className="result-stat">
            <Award className="stat-icon" />
            <div>
              <strong>+{passed ? quizData.xpReward : 20} XP</strong>
              <span>{passed ? 'Phần thưởng hoàn thành' : 'Kinh nghiệm tham gia'}</span>
            </div>
          </div>
          <div className="result-stat">
            <CheckCircle2 className="stat-icon success" />
            <div>
              <strong>{quizData.passPercentage}% điểm chuẩn</strong>
              <span>Yêu cầu để qua môn</span>
            </div>
          </div>
        </div>

        <div className="quiz-review-section">
          <h3>Xem lại đáp án câu hỏi</h3>
          {quizData.questions.map((q, idx) => {
            const userChoice = selectedAnswers[q.id];
            const isCorrect = userChoice === q.correctOptionId;
            return (
              <div key={q.id} className={`review-item ${isCorrect ? 'correct' : 'wrong'}`}>
                <div className="review-question">
                  <strong>Câu {idx + 1}: {q.prompt}</strong>
                  {isCorrect ? <CheckCircle2 size={18} className="icon-correct" /> : <XCircle size={18} className="icon-wrong" />}
                </div>
                <p className="review-explanation">
                  💡 {q.explanation}
                </p>
              </div>
            );
          })}
        </div>

        <div className="quiz-actions">
          <button className="primary" onClick={handleReset}>
            <RefreshCw size={16} /> Làm lại bài kiểm tra
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-card">
      <div className="quiz-top-bar">
        <div className="quiz-title">
          <HelpCircle size={18} />
          <span>{quizData.title}</span>
        </div>
        <div className="quiz-progress-indicator">
          Câu {currentIndex + 1} / {totalQuestions}
        </div>
      </div>

      <div className="quiz-question-container">
        <h2 className="quiz-prompt">
          <span>{currentIndex + 1}.</span> {currentQuestion.prompt}
        </h2>

        <div className="quiz-options-grid">
          {currentQuestion.options.map((opt, oIdx) => {
            const isSelected = selectedOptionId === opt.id;
            const labelLetter = String.fromCharCode(65 + oIdx);
            return (
              <button
                key={opt.id}
                className={`quiz-option-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectOption(opt.id)}
              >
                <span className="option-letter">{labelLetter}</span>
                <span className="option-text">{opt.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="quiz-bottom-controls">
        <button
          className="text-button"
          disabled={currentIndex === 0}
          onClick={handlePrev}
        >
          Quay lại
        </button>

        {!isLastQuestion ? (
          <button
            className="primary"
            disabled={selectedOptionId === undefined}
            onClick={handleNext}
          >
            Câu tiếp theo <ChevronRight size={16} />
          </button>
        ) : (
          <button
            className="primary submit-btn"
            disabled={selectedOptionId === undefined}
            onClick={handleSubmit}
          >
            Nộp bài thi <Sparkles size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
