import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Play, 
  Edit3, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  HelpCircle,
  Clock,
  Trophy,
  Target,
  Save,
  Gamepad2,
  BookOpen
} from 'lucide-react';
import { useQuizzes, Quiz, Question, QuestionType } from './hooks/useQuizzes';
import { useSettings } from './hooks/useSettings';

// --- Components ---

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'amber'; 
  className?: string;
  disabled?: boolean;
}) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md',
    secondary: 'bg-white text-indigo-600 border-2 border-indigo-100 hover:border-indigo-300',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600',
    ghost: 'bg-transparent hover:bg-black/5 text-slate-600',
    amber: 'bg-amber-400 text-indigo-900 hover:bg-amber-500 shadow-lg shadow-amber-200'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-2xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-tight text-sm ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </motion.button>
  );
};

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-[2rem] shadow-vibrant border-4 border-white p-8 ${className}`}>
    {children}
  </div>
);

// --- Views ---

export default function App() {
  const { quizzes, loading, addQuiz, updateQuiz, deleteQuiz } = useQuizzes();
  const { settings, updateSettings } = useSettings();
  const [view, setView] = useState<'dashboard' | 'editor' | 'player'>('dashboard');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [newQuizDraft, setNewQuizDraft] = useState<Quiz | null>(null);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  useEffect(() => {
    if (!isEditingSettings) {
      setTempSettings(settings);
    }
  }, [settings, isEditingSettings]);

  const selectedQuiz = quizzes.find(q => q.id === selectedQuizId) || null;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-indigo-600 font-medium">Cargando aula...</p>
      </div>
    </div>
  );

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

  const handleCreate = () => {
    const q: Quiz = {
      id: generateId(),
      title: 'NUEVA CLASE',
      description: 'Nuevo cuestionario para la clase',
      questions: [],
      createdAt: Date.now(),
    };
    setNewQuizDraft(q);
    setSelectedQuizId(null);
    setView('editor');
  };

  const handleDelete = (id: string) => {
    // Eliminación directa para evitar bloqueos de confirm() en ciertos navegadores
    deleteQuiz(id);
    if (selectedQuizId === id) {
      setSelectedQuizId(null);
      setView('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden flex h-screen">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-indigo-700 flex flex-col shadow-xl z-20 shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10 group relative">
            <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-indigo-900 font-bold text-xl shadow-lg">A+</div>
            {isEditingSettings ? (
              <input 
                type="text"
                autoFocus
                value={tempSettings.appName}
                onChange={(e) => setTempSettings({ ...tempSettings, appName: e.target.value })}
                className="bg-indigo-600 border-b-2 border-amber-400 text-white font-black text-xl tracking-tight outline-none w-full"
                onBlur={() => {
                  updateSettings({ appName: tempSettings.appName });
                }}
                onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              />
            ) : (
              <h1 className="text-white font-black text-xl tracking-tight">{settings.appName}</h1>
            )}
            <button 
              onClick={() => setIsEditingSettings(!isEditingSettings)}
              className="absolute -right-2 opacity-0 group-hover:opacity-50 hover:opacity-100 text-white transition-opacity"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={handleCreate} 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold mb-8 py-4 shadow-lg border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all"
          >
            <Plus className="w-5 h-5" />
            NUEVO CUESTIONARIO
          </Button>

          <nav className="space-y-2 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
            <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest px-2 mb-3">Mis Clases</p>
            <div 
              onClick={() => setView('dashboard')}
              className={`px-4 py-3 rounded-xl font-semibold cursor-pointer transition-all border-l-4 mb-4 ${view === 'dashboard' ? 'bg-indigo-600 text-white border-amber-400' : 'text-indigo-200 hover:bg-indigo-600 border-transparent'}`}
            >
              Panel Principal
            </div>
            {quizzes.map(q => (
              <div 
                key={q.id}
                onClick={() => { 
                  setNewQuizDraft(null);
                  setSelectedQuizId(q.id); 
                  setView('player'); 
                }}
                className="text-indigo-200 hover:bg-indigo-600 px-4 py-3 rounded-xl font-semibold cursor-pointer transition-colors truncate text-sm"
              >
                {q.title}
              </div>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-indigo-600/50">
          <div className="flex items-center gap-3 group relative">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
              {tempSettings.teacherName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              {isEditingSettings ? (
                <input 
                  type="text"
                  value={tempSettings.teacherName}
                  onChange={(e) => setTempSettings({ ...tempSettings, teacherName: e.target.value })}
                  className="bg-indigo-600 border-b border-indigo-400 text-white text-sm font-bold outline-none w-full"
                  onBlur={() => updateSettings({ teacherName: tempSettings.teacherName })}
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                />
              ) : (
                <>
                  <p className="text-white text-sm font-bold truncate">{settings.teacherName}</p>
                  <p className="text-indigo-300 text-xs">Configuración</p>
                </>
              )}
            </div>
            <button 
              onClick={() => setIsEditingSettings(!isEditingSettings)}
              className={`opacity-0 group-hover:opacity-50 hover:opacity-100 text-white transition-opacity ${isEditingSettings ? 'text-amber-400 opacity-100' : ''}`}
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <Dashboard 
              quizzes={quizzes} 
              onEdit={(id) => { 
                setNewQuizDraft(null);
                setSelectedQuizId(id); 
                setView('editor'); 
              }}
              onPlay={(id) => { 
                setSelectedQuizId(id); 
                setView('player'); 
              }}
              onDelete={handleDelete}
              onCreate={handleCreate}
            />
          )}

          {view === 'editor' && (selectedQuiz || newQuizDraft) && (
            <Editor 
              quiz={selectedQuiz || newQuizDraft!} 
              onSave={(updated) => { 
                updateQuiz(updated); 
                setNewQuizDraft(null);
                setSelectedQuizId(null);
                setView('dashboard'); 
              }}
              onBack={() => {
                setNewQuizDraft(null);
                setView('dashboard');
              }}
            />
          )}

          {view === 'player' && selectedQuiz && (
            <Player 
              quiz={selectedQuiz} 
              onBack={() => setView('dashboard')}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Dashboard View ---

function Dashboard({ 
  quizzes, 
  onEdit, 
  onPlay, 
  onDelete, 
  onCreate 
}: { 
  quizzes: Quiz[]; 
  onEdit: (id: string) => void; 
  onPlay: (id: string) => void; 
  onDelete: (id: string) => void; 
  onCreate: () => void;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="flex-1 overflow-y-auto p-12"
    >
      <header className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Mis Clases</h2>
          <p className="text-slate-500 mt-2 font-medium">Gestiona el contenido que proyectarás en clase.</p>
        </div>
      </header>

      {quizzes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-24 bg-indigo-50 border-dashed border-4 border-indigo-200">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl mb-6">
            <Gamepad2 className="w-20 h-20 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-black text-slate-800">Aula Vacía</h2>
          <p className="text-slate-500 mt-4 text-center max-w-sm text-lg">
            Empieza creando un cuestionario hoy mismo.
          </p>
          <Button onClick={onCreate} variant="amber" className="mt-10 px-10 py-5 text-lg">
            <Plus className="w-6 h-6" />
            CREAR AHORA
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <motion.div key={quiz.id} layout>
              <Card className="h-full flex flex-col group hover:-translate-y-1 transition-all duration-300">
                <div className="flex-1">
                  <h3 className="text-2xl font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{quiz.title}</h3>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold uppercase">
                      {quiz.questions.length} PREGUNTAS
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-8">
                  <Button 
                    className="col-span-1" 
                    onClick={() => onPlay(quiz.id)}
                    disabled={quiz.questions.length === 0}
                    variant="amber"
                  >
                    <Play className="w-4 h-4 ml-1" />
                    INICIAR
                  </Button>
                  <Button variant="secondary" onClick={() => onEdit(quiz.id)} className="col-span-1">
                    <Edit3 className="w-4 h-4" />
                    EDITAR
                  </Button>
                  <Button variant="danger" className="col-span-2 py-2 text-xs" onClick={() => onDelete(quiz.id)}>
                    <Trash2 className="w-4 h-4" />
                    ELIMINAR
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// --- Editor View ---

function Editor({ 
  quiz, 
  onSave, 
  onBack 
}: { 
  quiz: Quiz; 
  onSave: (quiz: Quiz) => void; 
  onBack: () => void;
}) {
  const [currentQuiz, setCurrentQuiz] = useState<Quiz>(JSON.parse(JSON.stringify(quiz)));

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      type,
      text: '',
      options: type === 'multiple-choice' ? ['', '', '', ''] : undefined,
      correctAnswer: '',
      alternativeAnswers: type === 'text' ? [] : undefined,
    };
    setCurrentQuiz({
      ...currentQuiz,
      questions: [...currentQuiz.questions, newQuestion]
    });
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setCurrentQuiz({
      ...currentQuiz,
      questions: currentQuiz.questions.map(q => q.id === id ? { ...q, ...updates } : q)
    });
  };

  const removeQuestion = (id: string) => {
    setCurrentQuiz({
      ...currentQuiz,
      questions: currentQuiz.questions.filter(q => q.id !== id)
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 overflow-y-auto p-12"
    >
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <Button variant="ghost" onClick={onBack} className="p-3 bg-white shadow-sm border border-slate-200">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Título del Cuestionario</label>
            <input 
              type="text"
              value={currentQuiz.title}
              onChange={(e) => setCurrentQuiz({ ...currentQuiz, title: e.target.value })}
              className="text-3xl font-black tracking-tight text-slate-800 uppercase italic bg-transparent border-b-2 border-dashed border-indigo-200 focus:border-indigo-500 outline-none w-full max-w-md"
              placeholder="Nombre de la clase..."
            />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {currentQuiz.questions.length === 0 && (
            <span className="text-rose-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
              Agrega al menos una pregunta
            </span>
          )}
          <Button 
            onClick={() => onSave(currentQuiz)} 
            variant="success" 
            className="px-10 py-5"
            disabled={currentQuiz.questions.length === 0}
          >
            <Save className="w-5 h-5" />
            GUARDAR EN MIS CLASES
          </Button>
        </div>
      </header>

      <div className="space-y-8 pb-32">
        {currentQuiz.questions.map((q, idx) => (
          <div key={q.id}>
            <Card className="relative group">
            <div className="absolute -left-4 top-10 bg-indigo-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-lg z-10">
              {idx + 1}
            </div>
            
            <div className="flex justify-between items-center mb-6 pl-6">
              <div className="flex items-center gap-4">
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg border-2 border-indigo-100">
                  {q.type === 'multiple-choice' ? 'OPCIÓN MÚLTIPLE' : 'RESPUESTA ESCRITA'}
                </span>
                
                {/* Reorder Buttons */}
                <div className="flex gap-1">
                  <button 
                    disabled={idx === 0}
                    onClick={() => {
                      const newQs = [...currentQuiz.questions];
                      [newQs[idx], newQs[idx-1]] = [newQs[idx-1], newQs[idx]];
                      setCurrentQuiz({...currentQuiz, questions: newQs});
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-20 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 rotate-90" />
                  </button>
                  <button 
                    disabled={idx === currentQuiz.questions.length - 1}
                    onClick={() => {
                      const newQs = [...currentQuiz.questions];
                      [newQs[idx], newQs[idx+1]] = [newQs[idx+1], newQs[idx]];
                      setCurrentQuiz({...currentQuiz, questions: newQs});
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-20 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 -rotate-90" />
                  </button>
                </div>
              </div>

              <Button variant="danger" className="p-2 border-0 bg-rose-50 text-rose-500 hover:bg-rose-100" onClick={() => removeQuestion(q.id)}>
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-8 pl-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Enunciado de la Pregunta</label>
                <textarea 
                  className="w-full bg-slate-50 border-4 border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] rounded-[1.5rem] px-6 py-4 text-xl font-bold focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300"
                  placeholder="¿Qué quieres preguntar hoy?"
                  rows={2}
                  value={q.text}
                  onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                />
              </div>

              {q.type === 'multiple-choice' && q.options && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex gap-4 items-center bg-slate-50/50 p-4 rounded-2xl border-2 border-white">
                      <input 
                        type="radio" 
                        name={`correct-${q.id}`}
                        checked={q.correctAnswer === opt && opt !== ''}
                        onChange={() => updateQuestion(q.id, { correctAnswer: opt })}
                        className="w-6 h-6 accent-emerald-500 shrink-0"
                      />
                      <input 
                        type="text" 
                        placeholder={`Opción ${oIdx + 1}`}
                        className={`flex-1 bg-white border-2 rounded-xl px-4 py-2 font-bold outline-none transition-all ${q.correctAnswer === opt && opt !== '' ? 'border-emerald-400 text-emerald-900 shadow-lg shadow-emerald-50' : 'border-slate-100 text-slate-600'}`}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...q.options!];
                          newOpts[oIdx] = e.target.value;
                          updateQuestion(q.id, { options: newOpts });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {q.type === 'text' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Respuesta Principal</label>
                    <input 
                      type="text" 
                      className="w-full bg-emerald-50/30 border-4 border-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] rounded-[1.5rem] px-6 py-4 text-xl font-bold text-emerald-600 focus:border-emerald-400 outline-none"
                      placeholder="La respuesta principal es..."
                      value={q.correctAnswer}
                      onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Variantes aceptadas (Opcional)</label>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          const alts = q.alternativeAnswers || [];
                          updateQuestion(q.id, { alternativeAnswers: [...alts, ''] });
                        }}
                        className="py-1 px-3 text-[10px]"
                      >
                        <Plus className="w-3 h-3" /> AGREGAR VARIANTE
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(q.alternativeAnswers || []).map((alt, altIdx) => (
                        <div key={altIdx} className="flex gap-2 items-center bg-slate-50 p-3 rounded-2xl border-2 border-white">
                          <input 
                            type="text"
                            placeholder={`Variante ${altIdx + 1}`}
                            className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2 font-bold text-slate-600 outline-none focus:border-indigo-300"
                            value={alt}
                            onChange={(e) => {
                              const newAlts = [...(q.alternativeAnswers || [])];
                              newAlts[altIdx] = e.target.value;
                              updateQuestion(q.id, { alternativeAnswers: newAlts });
                            }}
                          />
                          <button 
                            onClick={() => {
                              const newAlts = (q.alternativeAnswers || []).filter((_, i) => i !== altIdx);
                              updateQuestion(q.id, { alternativeAnswers: newAlts });
                            }}
                            className="p-2 text-rose-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      ))}

        <div className="grid grid-cols-2 gap-6 p-10 border-4 border-dashed border-indigo-100 rounded-[2.5rem] bg-indigo-50/20">
          <Button variant="secondary" onClick={() => addQuestion('multiple-choice')} className="bg-white py-6 border-indigo-200">
            <Plus className="w-5 h-5" />
            + MÚLTIPLE CHOICE
          </Button>
          <Button variant="secondary" onClick={() => addQuestion('text')} className="bg-white py-6 border-indigo-200">
            <Plus className="w-5 h-5" />
            + RESPUESTA ESCRITA
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// --- Player View ---

function Player({ 
  quiz, 
  onBack 
}: { 
  quiz: Quiz; 
  onBack: () => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [startTime] = useState(Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-indigo-50">
        <Card className="text-center p-12 max-w-xl">
          <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-rose-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4 uppercase italic">Sin contenido</h2>
          <p className="text-slate-500 mb-8 font-bold text-lg">Esta clase no tiene preguntas para proyectar. Por favor, agrega preguntas en el editor.</p>
          <Button onClick={onBack} variant="amber" className="w-full py-4 text-lg">
            VOLVER AL PANEL
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIdx];

  const handleAnswer = (answer: string) => {
    const normalize = (str: string) => 
      str.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const userAns = normalize(answer);
    const mainAns = normalize(currentQuestion.correctAnswer);
    const alts = (currentQuestion.alternativeAnswers || []).map(a => normalize(a)).filter(a => a !== "");
    
    const correct = userAns === mainAns || alts.includes(userAns);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      setTimeout(() => {
        nextQuestion();
      }, 2500);
    } else {
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
  };

  const nextQuestion = () => {
    setShowResult(false);
    setIsCorrect(null);
    setWrittenAnswer('');
    
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setEndTime(Date.now());
      setFinished(true);
    }
  };

  if (finished) {
    const durationMs = (endTime || Date.now()) - startTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    const score = Math.round((stats.correct / quiz.questions.length) * 100);

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center p-6 bg-indigo-50"
      >
        <Card className="max-w-2xl w-full text-center py-12 px-8 overflow-hidden">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Trophy className="w-12 h-12 text-emerald-500" />
          </div>
          
          <h2 className="text-4xl font-black text-slate-800 mb-2 italic uppercase tracking-tighter">¡CLASE LOGRADA!</h2>
          <p className="text-slate-500 font-bold mb-10">Has completado "<span className="text-indigo-600">{quiz.title}</span>"</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-white p-4 rounded-3xl border-2 border-indigo-50 shadow-sm">
              <Clock className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Tiempo</p>
              <p className="text-xl font-black text-slate-700">{minutes}m {seconds}s</p>
            </div>
            
            <div className="bg-white p-4 rounded-3xl border-2 border-emerald-50 shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Correctas</p>
              <p className="text-xl font-black text-emerald-600">{stats.correct}</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border-2 border-rose-50 shadow-sm">
              <XCircle className="w-6 h-6 text-rose-400 mx-auto mb-2" />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Incorrectas</p>
              <p className="text-xl font-black text-rose-600">{stats.incorrect}</p>
            </div>

            <div className="bg-white p-4 rounded-3xl border-2 border-amber-50 shadow-sm">
              <Target className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Puntaje</p>
              <p className="text-xl font-black text-amber-600">{score}%</p>
            </div>
          </div>

          <Button 
            className="w-full py-5 text-xl" 
            variant="amber"
            onClick={onBack}
          >
            VOLVER AL PANEL PRINCIPAL
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-indigo-50">
      {/* Quiz Header Area */}
      <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-10 shadow-sm shrink-0">
        <div className="flex items-center gap-6">
          <span className="px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-black uppercase tracking-widest border border-amber-200">En curso</span>
          <h2 className="text-2xl font-black text-slate-700 uppercase italic tracking-tight">{quiz.title}</h2>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Pregunta actual</p>
            <p className="text-2xl font-black text-indigo-600 tabular-nums leading-none mt-1">
              {String(currentIdx + 1).padStart(2, '0')} <span className="text-slate-300">/</span> {String(quiz.questions.length).padStart(2, '0')}
            </p>
          </div>
          <div className="h-10 w-[1px] bg-slate-200"></div>
          <Button variant="ghost" onClick={onBack} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50">
            <XCircle className="w-8 h-8" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-12 relative flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="flex-1 flex flex-col h-full"
            >
              <Card className="flex-1 flex flex-col overflow-hidden border-indigo-100 p-0 shadow-2xl">
                <div className="p-12 pb-6 flex-1">
                  <span className="inline-block bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-lg mb-6 uppercase tracking-widest shadow-md">
                    {currentQuestion.type === 'multiple-choice' ? 'MULTIPLE CHOICE' : 'RESPUESTA ESCRITA'}
                  </span>
                  <h3 className="text-4xl md:text-5xl font-black leading-tight text-slate-800 mb-12 tracking-tight">
                    {currentQuestion.text}
                  </h3>
                  
                  {/* Interaction Area */}
                  {currentQuestion.type === 'multiple-choice' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentQuestion.options?.filter(opt => opt !== '').map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => !showResult && handleAnswer(opt)}
                          disabled={showResult}
                          className={`flex items-center gap-5 p-6 rounded-3xl border-2 text-left transition-all group relative overflow-hidden ${
                            showResult 
                              ? opt === currentQuestion.correctAnswer 
                                ? 'bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-50' 
                                : isCorrect === false && writtenAnswer === opt 
                                  ? 'bg-rose-50 border-rose-500'
                                  : 'bg-slate-50 border-slate-100 opacity-40'
                              : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-xl cursor-pointer'
                          }`}
                        >
                          <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all shrink-0 ${
                            showResult && opt === currentQuestion.correctAnswer 
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className={`text-xl font-bold ${showResult && opt === currentQuestion.correctAnswer ? 'text-emerald-900' : 'text-slate-700'}`}>
                            {opt}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
                      <div className="relative group">
                        <input 
                          type="text"
                          className={`w-full bg-slate-50 border-4 rounded-[2.5rem] px-10 py-10 text-4xl font-black outline-none transition-all text-center ${
                            showResult
                              ? isCorrect 
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-900' 
                                : 'border-rose-500 bg-rose-50 text-rose-900'
                              : 'border-white focus:border-indigo-400 shadow-[inset_0_4px_10px_rgba(0,0,0,0.05)]'
                          }`}
                          placeholder="Escriban aquí..."
                          value={writtenAnswer}
                          onChange={(e) => setWrittenAnswer(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !showResult && handleAnswer(writtenAnswer)}
                          disabled={showResult}
                        />
                        {showResult && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 text-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
                          >
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-2">Respuestas válidas:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                              <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black italic border border-indigo-100">
                                {currentQuestion.correctAnswer}
                              </span>
                              {(currentQuestion.alternativeAnswers || []).filter(a => a.trim() !== "").map((alt, i) => (
                                <span key={i} className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl font-black italic border border-slate-100">
                                  {alt}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                      {!showResult && (
                        <Button 
                          variant="amber"
                          onClick={() => handleAnswer(writtenAnswer)} 
                          className="py-6 px-16 text-2xl"
                          disabled={!writtenAnswer.trim()}
                        >
                          ENVIAR RESPUESTA
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Info */}
                <div className="bg-slate-50/50 px-12 py-6 border-t border-slate-100 flex justify-between items-center mt-auto shrink-0">
                  <p className="text-slate-400 font-black italic text-sm tracking-tight">Proyección en aula: Debate y elige la respuesta correcta</p>
                  <div className="flex gap-4">
                    {!showResult ? (
                      <Button variant="ghost" onClick={nextQuestion} className="bg-slate-200/50 text-slate-500 hover:bg-slate-200">SALTAR</Button>
                    ) : (
                      <Button variant="amber" onClick={nextQuestion} className="px-12 py-4">SIGUIENTE</Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Feedback Overlay */}
      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, x: 100, rotate: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0, rotate: 12 }}
            exit={{ opacity: 0, scale: 0.5, x: -100 }}
            className={`fixed top-32 right-12 px-10 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 z-50 border-4 border-white ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}
          >
             <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg ${isCorrect ? 'bg-emerald-400' : 'bg-rose-400'}`}>
                {isCorrect ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
             </div>
             <div>
               <p className="font-black text-3xl italic uppercase leading-none">{isCorrect ? '¡Fabuloso!' : 'No exactamente'}</p>
               <p className={`text-sm font-bold mt-1 ${isCorrect ? 'text-emerald-100' : 'text-rose-100'}`}>
                {isCorrect ? '+100 PUNTOS DE CLASE' : 'Sigan intentando juntos'}
               </p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Footer */}
      <div className="h-4 bg-slate-200 w-full shrink-0 overflow-hidden">
        <motion.div 
          className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
