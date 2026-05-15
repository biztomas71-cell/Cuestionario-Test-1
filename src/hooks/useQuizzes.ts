import { useState, useEffect } from 'react';

export type QuestionType = 'multiple-choice' | 'text';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[]; // Only for multiple-choice
  correctAnswer: string;
  alternativeAnswers?: string[]; // For text-type questions
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: number;
}

const STORAGE_KEY = 'interactive_aula_quizzes';

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setQuizzes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse quizzes', e);
        setQuizzes([]);
      }
    } else {
      // Add a sample quiz if none exists
      const sampleQuiz: Quiz = {
        id: 'sample-quiz',
        title: 'Cuestionario de Bienvenida',
        description: 'Un ejemplo de cómo funciona la Aula Interactiva.',
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            text: '¿Cuál es el planeta más grande de nuestro sistema solar?',
            options: ['Marte', 'Venus', 'Júpiter', 'Saturno'],
            correctAnswer: 'Júpiter'
          },
          {
            id: 'q2',
            type: 'text',
            text: '¿Cómo se llama el proceso por el cual las plantas fabrican su propio alimento?',
            correctAnswer: 'Fotosíntesis'
          }
        ],
        createdAt: Date.now(),
      };
      saveQuizzes([sampleQuiz]);
    }
    setLoading(false);
  }, []);

  const saveQuizzes = (newQuizzes: Quiz[]) => {
    setQuizzes(newQuizzes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newQuizzes));
  };

  const addQuiz = (title: string, description: string) => {
    const newId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const newQuiz: Quiz = {
      id: newId,
      title,
      description,
      questions: [],
      createdAt: Date.now(),
    };
    
    setQuizzes(prev => {
      const updated = [...prev, newQuiz];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    
    return newQuiz;
  };

  const updateQuiz = (updatedQuiz: Quiz) => {
    setQuizzes(prev => {
      const exists = prev.some(q => q.id === updatedQuiz.id);
      const updated = exists 
        ? prev.map(q => q.id === updatedQuiz.id ? updatedQuiz : q)
        : [...prev, updatedQuiz];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteQuiz = (id: string) => {
    setQuizzes(prev => {
      const updated = prev.filter(q => q.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getQuiz = (id: string) => quizzes.find(q => q.id === id);

  return { quizzes, loading, addQuiz, updateQuiz, deleteQuiz, getQuiz };
}
