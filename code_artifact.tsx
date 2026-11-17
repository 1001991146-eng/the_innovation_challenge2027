import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Rocket,
  Lock,
  Unlock,
  Clock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Brain,
  Cpu,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Settings,
  RefreshCw,
  ArrowLeft,
  Search,
  Download,
  Trash2,
  Users,
  TrendingUp,
  Star,
  Mail,
  Flag,
  Zap,
  Code2,
  Lightbulb,
  Award,
  UserCheck,
  Sliders,
  Check,
  X,
  Eye,
  EyeOff,
  Play,
  HelpCircle
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

// ============================================================================
// אתחול Firebase בצורה בטוחה (כולל גיבוי אוטומטי לעבודה בזיכרון אם הסביבה ללא ענן)
// ============================================================================
let firebaseApp = null;
let auth = null;
let db = null;
let isFirebaseReady = false;

const appId = typeof __app_id !== 'undefined' ? __app_id : 'innovation-challenge-9th';

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = JSON.parse(__firebase_config);
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    isFirebaseReady = true;
  }
} catch (err) {
  console.warn('Firebase config unavailable, running in local session state:', err);
  isFirebaseReady = false;
}

// ============================================================================
// קבועים ונתוני הדגמה עבור דשבורד המורה
// ============================================================================
const TOTAL_GAME_SECONDS = 15 * 60; // 15 דקות (900 שניות)
const TEACHER_PASSWORD = 'Innovation';

const GRADE_OPTIONS = ["ט'1", "ט'2", "ט'3", "ט'4", "ט'5", "ט'6"];

const STAGE_TITLES = [
  'פתיחת ההצפנה',
  'אתיקה ו-AI',
  'אלגוריתם אבטחה',
  'לוגיקה בוליאנית',
  'חיפוש בינארי',
  'זיהוי פישינג'
];

const INITIAL_DEMO_STUDENTS = [
  {
    id: 'demo_student_1',
    fullName: 'נועה לוי',
    grade: "ט'2",
    currentStage: 6,
    completedStages: 6,
    status: 'הושלם בהצלחה',
    timeRemaining: 378,
    completionTimeSeconds: 522, // 08:42
    binarySearchSteps: 3,
    countMeIn: true,
    isDemo: true,
    updatedAt: Date.now() - 3600000
  },
  {
    id: 'demo_student_2',
    fullName: 'איתי כהן',
    grade: "ט'1",
    currentStage: 6,
    completedStages: 6,
    status: 'הושלם בהצלחה',
    timeRemaining: 285,
    completionTimeSeconds: 615, // 10:15
    binarySearchSteps: 4,
    countMeIn: true,
    isDemo: true,
    updatedAt: Date.now() - 2700000
  },
  {
    id: 'demo_student_3',
    fullName: 'מאיה אברהם',
    grade: "ט'3",
    currentStage: 4,
    completedStages: 3,
    status: 'בתהליך',
    timeRemaining: 440,
    completionTimeSeconds: null,
    binarySearchSteps: null,
    countMeIn: false,
    isDemo: true,
    updatedAt: Date.now() - 900000
  },
  {
    id: 'demo_student_4',
    fullName: 'דניאל מזרחי',
    grade: "ט'2",
    currentStage: 6,
    completedStages: 6,
    status: 'הושלם בהצלחה',
    timeRemaining: 190,
    completionTimeSeconds: 710, // 11:50
    binarySearchSteps: 5,
    countMeIn: false,
    isDemo: true,
    updatedAt: Date.now() - 1800000
  }
];

// פונקציית עזר לעיצוב זמן בפורמט MM:SS
function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// ============================================================================
// רכיב אפקט קונפטי חגיגי מבוסס HTML5 Canvas
// ============================================================================
function ConfettiCelebration() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = [
      '#2563EB', // כחול חשמלי
      '#06B6D4', // טורקיז
      '#8B5CF6', // סגול בהיר
      '#FACC15', // צהוב שמש
      '#10B981', // ירוק מנטה
      '#EC4899', // ורוד שמח
      '#F97316'  // כתום אנרגטי
    ];

    const particles = [];
    for (let i = 0; i < 160; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 10 + 6,
        h: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3.5 + 2.5,
        angle: Math.random() * 360,
        spin: (Math.random() - 0.5) * 8,
        shape: Math.random() > 0.3 ? 'rect' : 'circle'
      });
    }

    const startTime = Date.now();
    const duration = 6500;

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const opacity = elapsed > duration - 1500
        ? Math.max(0, (duration - elapsed) / 1500)
        : 1;

      if (opacity <= 0) return;

      ctx.save();
      ctx.globalAlpha = opacity;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.vx += Math.sin(p.y * 0.02) * 0.04;

        if (p.y > canvas.height + 20 && elapsed < duration - 2000) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
}

// ============================================================================
// סרגל ניווט עליון קבוע (Navbar)
// ============================================================================
function TopNavbar({
  player,
  timeLeft,
  isTimerActive,
  onOpenTeacherModal,
  onLogoClick
}) {
  const isLowTime = isTimerActive && timeLeft < 300; // פחות מ-5 דקות

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-xl border-b border-indigo-100/80 shadow-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
        {/* צד ימין: שם האתגר + תגית תלמיד/ה וכיתה */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onLogoClick}
            className="flex items-center gap-2.5 text-right group focus:outline-none"
            title="אתגר החדשנות"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform shrink-0">
              <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="truncate">
              <h1 className="text-base sm:text-xl font-extrabold bg-gradient-to-l from-blue-700 via-indigo-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
                אתגר החדשנות
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
                חדר בריחה • מדעי המחשב והנדסת תוכנה
              </p>
            </div>
          </button>

          {player && (
            <div className="hidden md:flex items-center gap-1.5 bg-gradient-to-l from-indigo-50 to-cyan-50 border border-indigo-200/70 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-indigo-800 shadow-xs">
              <UserCheck className="w-4 h-4 text-cyan-600 shrink-0" />
              <span className="truncate max-w-[140px]">{player.fullName}</span>
              <span className="text-indigo-300">•</span>
              <span className="bg-white px-2 py-0.5 rounded-full text-indigo-600 text-xs">
                {player.grade}
              </span>
            </div>
          )}
        </div>

        {/* מרכז: טיימר בספירה לאחור */}
        <div className="flex items-center justify-center">
          <div
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-2xl border-2 font-mono font-extrabold text-base sm:text-xl tracking-wider transition-all ${
              isLowTime
                ? 'bg-red-50 border-red-400 text-red-600 animate-pulse shadow-md shadow-red-200'
                : isTimerActive
                ? 'bg-slate-900 border-slate-700 text-cyan-300 shadow-md'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
            dir="ltr"
            aria-label="טיימר ספירה לאחור"
          >
            <Clock
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                isLowTime ? 'text-red-600' : isTimerActive ? 'text-cyan-400' : 'text-slate-400'
              }`}
            />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* צד שמאל: כפתור כניסת מורה */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTeacherModal}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Lock className="w-4 h-4 text-indigo-500" />
            <span>כניסת מורה</span>
          </button>
        </div>
      </div>

      {/* תגית תלמיד/ה למסכי מובייל */}
      {player && (
        <div className="md:hidden bg-indigo-50/90 border-t border-indigo-100 px-4 py-1 flex items-center justify-center gap-2 text-xs font-bold text-indigo-800">
          <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
          <span>{player.fullName}</span>
          <span>•</span>
          <span>כיתה {player.grade}</span>
        </div>
      )}
    </header>
  );
}

// ============================================================================
// בר התקדמות ויזואלי בין 6 השלבים
// ============================================================================
function StageProgressBar({ currentStage }) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-6 px-2">
      <div className="bg-white/80 backdrop-blur-md border border-white/70 rounded-3xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs sm:text-sm font-extrabold text-indigo-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            שלב {currentStage} מתוך 6: {STAGE_TITLES[currentStage - 1]}
          </span>
          <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
            {Math.round(((currentStage - 1) / 6) * 100)}% הושלם
          </span>
        </div>

        <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5">
          {STAGE_TITLES.map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStage;
            const isCurrent = stepNum === currentStage;

            return (
              <div key={stepNum} className="flex flex-col items-center gap-1">
                <div
                  className={`w-full h-2.5 sm:h-3 rounded-full transition-all duration-500 ${
                    isCompleted
                      ? 'bg-gradient-to-l from-emerald-400 to-teal-500 shadow-xs'
                      : isCurrent
                      ? 'bg-gradient-to-l from-blue-600 via-cyan-500 to-purple-500 animate-pulse'
                      : 'bg-slate-200/80'
                  }`}
                />
                <span
                  className={`text-[10px] sm:text-xs font-bold text-center truncate w-full ${
                    isCompleted
                      ? 'text-emerald-700'
                      : isCurrent
                      ? 'text-indigo-700'
                      : 'text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓ ' : `${stepNum}. `}
                  <span className="hidden sm:inline">{title}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// מסך 0: מסך פתיחה (WelcomeScreen)
// ============================================================================
function WelcomeScreen({ onStartGame }) {
  const [fullName, setFullName] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [customGrade, setCustomGrade] = useState('');
  const [isCustomGrade, setIsCustomGrade] = useState(false);

  const finalGrade = isCustomGrade ? customGrade.trim() : selectedGrade;
  const isFormValid = fullName.trim().length >= 2 && finalGrade.length >= 1;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    onStartGame({
      fullName: fullName.trim(),
      grade: finalGrade
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      <div className="bg-white/85 backdrop-blur-xl border border-white/70 rounded-[2rem] shadow-2xl shadow-indigo-900/10 p-6 sm:p-10 relative overflow-hidden">
        {/* אלמנטים דקורטיביים ברקע */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-300/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-300/25 rounded-full blur-3xl pointer-events-none" />

        {/* תגית עליונה */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-l from-amber-100 to-yellow-100 border border-amber-300/80 text-amber-900 font-extrabold text-xs sm:text-sm shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-500" />
            חדר בריחה דיגיטלי לתלמידי כיתה ט׳ • ללא צורך בידע קודם!
          </span>
        </div>

        {/* כותרת מרכזית */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-4 leading-tight tracking-tight">
            ברוכים הבאים לעתיד!{' '}
            <span className="bg-gradient-to-l from-blue-600 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
              מוכנים לפצח את הקוד?
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            לרשותכם <strong className="text-indigo-700 font-extrabold">15 דקות</strong> לפתור{' '}
            <strong className="text-indigo-700 font-extrabold">6 אתגרים אינטראקטיביים</strong>{' '}
            מרתקים מעולמות ההייטק והתוכנה. אין צורך בשום ניסיון קודם בתכנות — רק סקרנות,
            יצירתיות וחשיבה מחוץ לקופסה!
          </p>
        </div>

        {/* 3 כרטיסיות תחומי המשחק */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50/80 border border-blue-200/80 rounded-3xl p-5 shadow-xs hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              סייבר ואבטחת מידע
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              פיצוח צפנים סודיים, הגנה על שרתים וזיהוי מתקפות פישינג מתוחכמות.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50/80 border border-purple-200/80 rounded-3xl p-5 shadow-xs hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-3 shadow-md shadow-purple-500/20">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              בינה מלאכותית ואתיקה
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              איך מאמנים מודל AI לקבל החלטות הוגנות ולזהות הטיות אלגוריתמיות?
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 border border-emerald-200/80 rounded-3xl p-5 shadow-xs hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-md shadow-emerald-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">
              חשיבה אלגוריתמית
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              לוגיקה בוליאנית ואלגוריתמים חכמים שמאפשרים לגוגל וטיקטוק לעבוד בשבריר שנייה.
            </p>
          </div>
        </div>

        {/* טופס פרטי שחקן */}
        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto bg-slate-50/90 border-2 border-indigo-100 rounded-3xl p-5 sm:p-7 shadow-inner"
        >
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 mb-4 text-center">
            הזינו פרטים כדי להתחיל את האתגר:
          </h3>

          <div className="space-y-4">
            {/* שדה שם מלא */}
            <div>
              <label
                htmlFor="student-name"
                className="block text-sm font-bold text-slate-700 mb-1.5"
              >
                שם מלא של התלמיד/ה <span className="text-red-500">*</span>
              </label>
              <input
                id="student-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="לדוגמה: רוני שפירא"
                className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 outline-none text-slate-900 font-bold text-base transition-all"
                required
              />
            </div>

            {/* בחירת כיתה */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                כיתה <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {GRADE_OPTIONS.map((grade) => {
                  const active = !isCustomGrade && selectedGrade === grade;
                  return (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => {
                        setIsCustomGrade(false);
                        setSelectedGrade(grade);
                      }}
                      className={`py-2.5 px-2 rounded-xl font-extrabold text-sm border-2 transition-all cursor-pointer ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 scale-105'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      {grade}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomGrade(true);
                    setSelectedGrade('');
                  }}
                  className={`py-2.5 px-2 rounded-xl font-bold text-xs border-2 transition-all cursor-pointer col-span-3 sm:col-span-1 ${
                    isCustomGrade
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  אחר
                </button>
              </div>

              {isCustomGrade && (
                <input
                  type="text"
                  value={customGrade}
                  onChange={(e) => setCustomGrade(e.target.value)}
                  placeholder="הקלידו שם כיתה (לדוגמה: ט'7 / מופת)"
                  className="mt-2.5 w-full px-4 py-2.5 rounded-2xl bg-white border-2 border-purple-300 focus:border-purple-500 outline-none text-slate-900 font-bold text-sm"
                />
              )}
            </div>

            {/* כפתור התחלה */}
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-4 px-6 rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-2.5 transition-all ${
                isFormValid
                  ? 'bg-gradient-to-l from-blue-600 via-cyan-500 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>יוצאים לדרך! 🚀</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// שלב 1/6: פתיחת ההצפנה (צופן קיסר)
// ============================================================================
function Stage1Caesar({ onComplete }) {
  const [answer, setAnswer] = useState('');
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [solved, setSolved] = useState(false);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const handleCheck = (e) => {
    e.preventDefault();
    if (solved) return;

    const cleaned = answer.trim().toUpperCase();
    if (cleaned === 'PYTHON') {
      setErrorMsg('');
      setSolved(true);
    } else {
      setShake(true);
      setErrorMsg(
        'כמעט! נסו שוב: קחו כל אות בקוד UDYMTS ולכו 5 צעדים אחורה ב-ABC (למשל: U -> T -> S -> R -> Q -> P).'
      );
      setTimeout(() => setShake(false), 550);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white/90 backdrop-blur-xl border border-white/70 rounded-[2rem] shadow-xl p-6 sm:p-9">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
              שלב 1 מתוך 6 • סייבר והצפנה
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              פתיחת ההצפנה (צופן קיסר)
            </h2>
          </div>
        </div>

        <p className="text-slate-600 text-base sm:text-lg mb-6 leading-relaxed">
          יירטנו הודעה מוצפנת משרת החדשנות! כדי לפתוח את השער הראשון, עליכם לפענח את
          מילת הקוד הסודית.
        </p>

        {/* תיבת הקוד המוצפן */}
        <div className="bg-slate-900 rounded-3xl p-6 text-center mb-6 shadow-lg border-2 border-slate-800 relative overflow-hidden">
          <div className="text-xs font-bold text-cyan-400 tracking-widest uppercase mb-2">
            ENCRYPTED CIPHERTEXT
          </div>
          <div
            className="text-4xl sm:text-6xl font-mono font-black tracking-[0.25em] text-amber-300 select-all"
            dir="ltr"
          >
            UDYMTS
          </div>
        </div>

        {/* מפתח הצפנה ודוגמה ויזואלית */}
        <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 mb-6">
          <div className="flex items-center gap-2 font-extrabold text-indigo-900 mb-2">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
            <span>מפתח הפענוח: הסטה של 5- (ללכת 5 אותיות אחורה ב-ABC)</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 my-3" dir="ltr">
            <div className="bg-white px-4 py-2 rounded-xl border border-indigo-200 font-mono font-bold text-sm sm:text-base shadow-xs">
              <span className="text-amber-600">U</span>{' '}
              <span className="text-slate-400">(-5) →</span>{' '}
              <span className="text-emerald-600 font-black">P</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-indigo-200 font-mono font-bold text-sm sm:text-base shadow-xs">
              <span className="text-amber-600">S</span>{' '}
              <span className="text-slate-400">(-5) →</span>{' '}
              <span className="text-emerald-600 font-black">N</span>
            </div>
          </div>

          {/* סרגל ABC עזר */}
          <div className="mt-3 pt-3 border-t border-indigo-200/60">
            <p className="text-xs text-slate-500 text-center mb-2 font-medium">
              סרגל אותיות לעזרה (אם עוברים את A אחורה, ממשיכים מ-Z):
            </p>
            <div
              className="flex flex-wrap justify-center gap-1 font-mono text-xs font-bold"
              dir="ltr"
            >
              {alphabet.map((letter) => {
                const isHighlighted = ['U', 'D', 'Y', 'M', 'T', 'S'].includes(letter);
                return (
                  <span
                    key={letter}
                    className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      isHighlighted
                        ? 'bg-amber-200 text-amber-900 border border-amber-400 font-black'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {letter}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* טופס קלט */}
        {!solved ? (
          <form onSubmit={handleCheck} className="space-y-4">
            <div>
              <label
                htmlFor="caesar-input"
                className="block text-sm font-bold text-slate-700 mb-1.5"
              >
                הקלידו את המילה המפוענחת (באנגלית):
              </label>
              <input
                id="caesar-input"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="הקלידו כאן..."
                dir="ltr"
                autoComplete="off"
                className={`w-full px-5 py-3.5 rounded-2xl border-2 font-mono font-black text-xl text-center tracking-widest uppercase outline-none transition-all ${
                  shake
                    ? 'border-red-500 bg-red-50 text-red-700 animate-bounce'
                    : 'border-slate-300 focus:border-blue-500 bg-white text-slate-900'
                }`}
              />
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-l from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-extrabold text-lg shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-98"
            >
              בדוק פענוח 🔓
            </button>
          </form>
        ) : (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 sm:p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
              <div>
                <h3 className="text-xl font-black">בינגו! הקוד הוא PYTHON 🎉</h3>
                <p className="text-sm font-bold text-emerald-700">
                  פיצחתם את צופן קיסר בהצלחה!
                </p>
              </div>
            </div>

            <div className="bg-white/90 rounded-2xl p-4 border border-emerald-200 text-slate-800 font-bold text-sm sm:text-base">
              💡 במגמת הנדסת תוכנה תלמדו איך הצפנה מגנה על הודעות בוואטסאפ ובאפליקציות!
            </div>

            <button
              type="button"
              onClick={onComplete}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <span>המשך לשלב 2</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// שלב 2/6: בדיקת מודל AI (אתיקה והטיה אלגוריתמית)
// ============================================================================
function Stage2AIBias({ onComplete }) {
  const [biasWarning, setBiasWarning] = useState(null);
  const [hasClickedCandidate, setHasClickedCandidate] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModelFixed, setIsModelFixed] = useState(false);

  const candidates = [
    {
      id: 'A',
      name: "מועמד א'",
      tag: 'מעיל כהה ומשקפיים',
      bg: 'from-slate-700 to-slate-900',
      accent: 'text-amber-300'
    },
    {
      id: 'B',
      name: "מועמד ב'",
      tag: 'חולצת קפוצ׳ון ואוזניות',
      bg: 'from-indigo-600 to-blue-800',
      accent: 'text-cyan-300'
    },
    {
      id: 'C',
      name: "מועמד ג'",
      tag: 'חליפה עסקית ומזוודה',
      bg: 'from-emerald-600 to-teal-800',
      accent: 'text-emerald-200'
    },
    {
      id: 'D',
      name: "מועמד ד'",
      tag: 'תיק גב וכובע מצחייה',
      bg: 'from-purple-600 to-fuchsia-800',
      accent: 'text-pink-200'
    }
  ];

  const handleCandidateClick = (candidate) => {
    if (isModelFixed) return;
    setHasClickedCandidate(true);
    setBiasWarning(
      `הטיה זוהתה! (Bias Detected) – בחירה ב${candidate.name} רק על פי מראה עלולה לנבוע מהטיה של המודל... יש לתקן את המודל בהגדרות.`
    );
  };

  const handleFixModel = () => {
    setIsSettingsOpen(false);
    setBiasWarning(null);
    setIsModelFixed(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white/90 backdrop-blur-xl border border-white/70 rounded-[2rem] shadow-xl p-6 sm:p-9 relative">
        {/* כפתור גלגל שיניים (הגדרות) בפינה השמאלית העליונה */}
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className={`absolute top-6 left-6 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
            hasClickedCandidate && !isModelFixed
              ? 'bg-red-50 border-red-300 text-slate-800 shadow-md scale-110'
              : 'bg-slate-100 hover:bg-indigo-50 border-slate-200 text-slate-600'
          }`}
          title="הגדרות מודל ה-AI"
          aria-label="הגדרות מודל ה-AI"
        >
          <Settings
            className={`w-6 h-6 ${
              hasClickedCandidate && !isModelFixed ? 'animate-spin text-indigo-600' : ''
            }`}
            style={{ animationDuration: '6s' }}
          />
          {hasClickedCandidate && !isModelFixed && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-2 border-white" />
            </span>
          )}
        </button>

        <div className="flex items-center gap-3 mb-4 pl-14">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-purple-600 uppercase tracking-wider">
              שלב 2 מתוך 6 • בינה מלאכותית ואתיקה
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              בדיקת מודל AI לזיהוי איומים
            </h2>
          </div>
        </div>

        <p className="text-slate-600 text-base sm:text-lg mb-6 leading-relaxed">
          מערכת בינה מלאכותית חדשה מבקשת מכם לסמן:{' '}
          <strong className="text-slate-900">״מי מהדמויות מהווה איום?״</strong>
          <br />
          בדקו את 4 המועמדים שהמערכת מציגה:
        </p>

        {/* כרטיסיות 4 המועמדים */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {candidates.map((cand) => (
            <button
              key={cand.id}
              type="button"
              onClick={() => handleCandidateClick(cand)}
              disabled={isModelFixed}
              className={`group rounded-3xl p-4 border-2 text-center transition-all flex flex-col items-center ${
                isModelFixed
                  ? 'bg-slate-50 border-slate-200 opacity-60 cursor-default'
                  : 'bg-white hover:bg-purple-50/50 border-slate-200 hover:border-purple-400 hover:-translate-y-1 shadow-sm cursor-pointer'
              }`}
            >
              {/* אווטאר SVG מותאם */}
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${cand.bg} flex items-center justify-center mb-3 shadow-md`}
              >
                <svg viewBox="0 0 64 64" className="w-12 h-12">
                  <circle cx="32" cy="24" r="12" fill="#FDE68A" />
                  <path
                    d="M14 54 C14 42, 50 42, 50 54"
                    fill="currentColor"
                    className={cand.accent}
                  />
                  <circle cx="28" cy="22" r="2" fill="#1E293B" />
                  <circle cx="36" cy="22" r="2" fill="#1E293B" />
                  <path
                    d="M28 28 Q32 31 36 28"
                    stroke="#1E293B"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="font-extrabold text-slate-900 text-base mb-1">
                {cand.name}
              </span>
              <span className="text-xs text-slate-500 font-medium">{cand.tag}</span>
            </button>
          ))}
        </div>

        {/* הודעת אזהרה על הטיה אלגוריתמית */}
        {biasWarning && !isModelFixed && (
          <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-amber-50 border-2 border-amber-400 text-amber-950 shadow-md flex items-start gap-3 animate-fade-in">
            <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-extrabold text-base">{biasWarning}</p>
              <p className="text-xs sm:text-sm text-amber-800 font-medium">
                רמז: שימו לב לנקודה האדומה המהבהבת על אייקון גלגל השיניים בפינת הכרטיס!
              </p>
            </div>
          </div>
        )}

        {/* חיווי הצלחה לאחר תיקון המודל */}
        {isModelFixed && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
              <div>
                <h3 className="text-xl font-black">מודל ה-AI כויל מחדש בהצלחה! 🌟</h3>
                <p className="text-sm font-bold text-emerald-700">
                  הסרתם את ההטיה מנתוני האימון של המערכת!
                </p>
              </div>
            </div>

            <div className="bg-white/90 rounded-2xl p-4 border border-emerald-200 text-slate-800 font-bold text-sm sm:text-base">
              💡 בינה מלאכותית לומדת מדוגמאות שבני אדם נותנים לה. מהנדסי תוכנה אחראים
              מוודאים שמודלי AI יהיו הוגנים, מדויקים וללא דעות קדומות!
            </div>

            <button
              type="button"
              onClick={onComplete}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <span>המשך לשלב 3</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* חלון מודאלי: תיקון נתוני אימון */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-indigo-100 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  תיקון נתוני אימון (AI Dataset)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600 mb-6">
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 font-bold">
                ⚠️ אבחון מערכת: המודל אומן על נתונים לא מאוזנים ולכן שופט אנשים לפי
                מראה חיצוני בלבד!
              </div>
              <p className="leading-relaxed">
                לחיצה על הכפתור למטה תאזן את מאגר הנתונים ותגדיר למודל להתבסס אך ורק
                על <strong>התנהגות מאומתת</strong> ולא על מראה חיצוני.
              </p>
            </div>

            <button
              type="button"
              onClick={handleFixModel}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-l from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-base shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
            >
              תקן מודל והמשך ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// שלב 3/6: אלגוריתם אבטחה (סדר פעולות לוגי - SecurityFlow.js)
// ============================================================================
function Stage3SecurityFlow({ onComplete }) {
  const commands = [
    {
      id: 'filter',
      hebrew: 'סינון תעבורה',
      english: 'Filter Traffic',
      desc: 'חסימת בקשות חשודות בכניסה לשרת'
    },
    {
      id: 'permissions',
      hebrew: 'בדיקת הרשאות',
      english: 'Check Permissions',
      desc: 'אימות שלמשתמש מותר לגשת למידע'
    },
    {
      id: 'log',
      hebrew: 'תיעוד כניסה ביומן',
      english: 'Log Access',
      desc: 'שמירת רישום מסודר ביומן האבטחה'
    },
    {
      id: 'disconnect',
      hebrew: 'ניתוק שרת',
      english: 'Disconnect Server',
      desc: 'כיבוי והשבתה מלאה של השרת'
    }
  ];

  const [selectedStack, setSelectedStack] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [solved, setSolved] = useState(false);

  const handleSelectCommand = (cmd) => {
    if (solved || selectedStack.length >= 3) return;
    if (selectedStack.some((item) => item.id === cmd.id)) return;

    const nextStack = [...selectedStack, cmd];
    setSelectedStack(nextStack);
    setFeedback(null);

    if (nextStack.length === 3) {
      const ids = nextStack.map((c) => c.id);
      if (ids[0] === 'filter' && ids[1] === 'permissions' && ids[2] === 'log') {
        setSolved(true);
      } else {
        const hasDisconnect = ids.includes('disconnect');
        setTimeout(() => {
          setFeedback(
            hasDisconnect
              ? 'אופס! ״ניתוק שרת״ יפיל את כל האפליקציה למשתמשים! נסו לבנות רצף שמגן על השרת בלי לכבות אותו.'
              : 'הסדר אינו מדויק! חשבו בהיגיון: קודם מסננים תעבורה בכניסה, אחר כך בודקים הרשאות, ורק בסוף מתעדים ביומן.'
          );
          setSelectedStack([]);
        }, 450);
      }
    }
  };

  const handleReset = () => {
    if (solved) return;
    setSelectedStack([]);
    setFeedback(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white/90 backdrop-blur-xl border border-white/70 rounded-[2rem] shadow-xl p-6 sm:p-9">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-cyan-600 uppercase tracking-wider">
              שלב 3 מתוך 6 • חשיבה אלגוריתמית
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              אלגוריתם אבטחה (SecurityFlow.js)
            </h2>
          </div>
        </div>

        <p className="text-slate-600 text-base sm:text-lg mb-6 leading-relaxed">
          הרכיבו אלגוריתם אבטחה בן <strong>3 שלבים</strong> עבור הקובץ{' '}
          <code className="bg-slate-100 px-2 py-0.5 rounded-lg font-mono text-indigo-700 font-bold">
            SecurityFlow.js
          </code>
          . לחצו על הפקודות <strong>בסדר הלוגי הנכון</strong> (שימו לב: אחת הפקודות היא
          מסיח!):
        </p>

        {/* מחסנית הקוד (3 שלבים) */}
        <div className="bg-slate-900 rounded-3xl p-5 mb-6 border-2 border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5"
              dir="ltr"
            >
              <span>SecurityFlow.js</span>
            </span>
            {!solved && selectedStack.length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>איפוס מחסנית</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {[0, 1, 2].map((slotIndex) => {
              const item = selectedStack[slotIndex];
              return (
                <div
                  key={slotIndex}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${
                    item
                      ? solved
                        ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-200'
                        : 'bg-indigo-950/90 border-indigo-500/70 text-white'
                      : 'bg-slate-800/50 border-dashed border-slate-700 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-cyan-400 font-mono font-extrabold text-sm flex items-center justify-center">
                      {slotIndex + 1}
                    </span>
                    {item ? (
                      <span className="font-extrabold text-sm sm:text-base">
                        {item.hebrew}
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm font-medium">
                        בחרו פקודה לשלב {slotIndex + 1}...
                      </span>
                    )}
                  </div>
                  {item && (
                    <span className="font-mono text-xs text-cyan-300" dir="ltr">
                      {item.english}()
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* הודעת שגיאה */}
        {feedback && (
          <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold flex items-start gap-2.5">
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <span>{feedback}</span>
          </div>
        )}

        {/* אפשרויות בחירה */}
        {!solved ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {commands.map((cmd) => {
              const isSelected = selectedStack.some((s) => s.id === cmd.id);
              return (
                <button
                  key={cmd.id}
                  type="button"
                  disabled={isSelected}
                  onClick={() => handleSelectCommand(cmd)}
                  className={`p-4 rounded-2xl border-2 text-right transition-all ${
                    isSelected
                      ? 'bg-slate-100 border-slate-200 opacity-45 cursor-not-allowed'
                      : 'bg-white hover:bg-indigo-50/70 border-slate-200 hover:border-indigo-400 shadow-xs hover:-translate-y-0.5 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-slate-900 text-base">
                      {cmd.hebrew}
                    </span>
                    <span
                      className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md"
                      dir="ltr"
                    >
                      {cmd.english}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{cmd.desc}</p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
              <div>
                <h3 className="text-xl font-black">האלגוריתם רץ בצורה מושלמת! ⚡</h3>
                <p className="text-sm font-bold text-emerald-700">
                  סינון ← בדיקת הרשאות ← תיעוד ביומן!
                </p>
              </div>
            </div>

            <div className="bg-white/90 rounded-2xl p-4 border border-emerald-200 text-slate-800 font-bold text-sm sm:text-base">
              💡 בדיוק כך מהנדסי תוכנה מתכננים מערכות גדולות: מפרקים בעיה מורכבת לצעדים
              קטנים, ברורים ומסודרים!
            </div>

            <button
              type="button"
              onClick={onComplete}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <span>המשך לשלב 4</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// שלב 4/6: מפסקים ולוגיקה בוליאנית
// ============================================================================
function Stage4BooleanLogic({ onComplete }) {
  const [switchA, setSwitchA] = useState(0);
  const [switchB, setSwitchB] = useState(0);
  const [switchC, setSwitchC] = useState(1);

  // תנאי ההפעלה: (א' וגם ב') וגם (לא ג') => A === 1 && B === 1 && C === 0
  const isConditionMet = switchA === 1 && switchB === 1 && switchC === 0;

  const switches = [
    { label: "מפסק א'", value: switchA, toggle: () => setSwitchA((v) => (v === 0 ? 1 : 0)) },
    { label: "מפסק ב'", value: switchB, toggle: () => setSwitchB((v) => (v === 0 ? 1 : 0)) },
    { label: "מפסק ג'", value: switchC, toggle: () => setSwitchC((v) => (v === 0 ? 1 : 0)) }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white/90 backdrop-blur-xl border border-white/70 rounded-[2rem] shadow-xl p-6 sm:p-9">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
              שלב 4 מתוך 6 • שערים לוגיים וחומרה
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              מפסקים ולוגיקה בוליאנית
            </h2>
          </div>
        </div>

        {/* תיבת הסבר קצרה על לוגיקה בוליאנית */}
        <div className="bg-indigo-50/90 border border-indigo-200 rounded-2xl p-4 mb-6 text-sm sm:text-base text-slate-700 leading-relaxed">
          <strong className="text-indigo-900">איך מחשבים חושבים?</strong> כל מעבד במחשב
          עובד בעזרת <strong>לוגיקה בוליאנית</strong>: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded text-emerald-700">1 = נכון / פועל</code> ו-<code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded text-slate-600">0 = שקר / כבוי</code>.
        </div>

        {/* תנאי ההפעלה */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 text-center mb-6 shadow-lg">
          <span className="text-xs font-bold text-cyan-400 block mb-1">
            תנאי ההפעלה לפתיחת השער:
          </span>
          <div className="text-xl sm:text-3xl font-black text-amber-300 tracking-wide">
            (א&apos; וגם ב&apos;) וגם (לא ג&apos;)
          </div>
        </div>

        {/* 3 המפסקים הלחיצים */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6">
          {switches.map((sw) => {
            const isOn = sw.value === 1;
            return (
              <button
                key={sw.label}
                type="button"
                onClick={sw.toggle}
                className={`rounded-3xl p-4 sm:p-6 border-2 flex flex-col items-center justify-between transition-all cursor-pointer select-none ${
                  isOn
                    ? 'bg-gradient-to-b from-emerald-50 to-teal-50 border-emerald-400 shadow-lg shadow-emerald-500/15'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span className="font-extrabold text-slate-800 text-sm sm:text-lg mb-3">
                  {sw.label}
                </span>

                {/* מתג ויזואלי */}
                <div
                  className={`w-16 sm:w-20 h-9 sm:h-11 rounded-full p-1 transition-colors duration-300 flex items-center ${
                    isOn ? 'bg-emerald-500 justify-start' : 'bg-slate-300 justify-end'
                  }`}
                >
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white shadow-md transition-transform" />
                </div>

                {/* ערך בינארי 0 / 1 */}
                <div
                  className={`mt-3 font-mono font-black text-2xl sm:text-3xl px-4 py-1 rounded-xl ${
                    isOn
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {sw.value}
                </div>
              </button>
            );
          })}
        </div>

        {/* חיווי מצב המערכת */}
        <div
          className={`rounded-3xl p-5 border-2 transition-all duration-300 ${
            isConditionMet
              ? 'bg-emerald-50 border-emerald-400 shadow-lg shadow-emerald-500/15'
              : 'bg-slate-100 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full ${
                  isConditionMet
                    ? 'bg-emerald-500 animate-ping'
                    : 'bg-slate-400'
                }`}
              />
              <span
                className={`text-lg sm:text-xl font-black ${
                  isConditionMet ? 'text-emerald-800' : 'text-slate-600'
                }`}
              >
                {isConditionMet
                  ? 'המערכת פועלת! התנאי הלוגי מתקיים ✅'
                  : 'המערכת כבויה — כוונו את המפסקים לפי התנאי'}
              </span>
            </div>

            {isConditionMet && (
              <button
                type="button"
                onClick={onComplete}
                className="w-full sm:w-auto py-3.5 px-7 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer animate-bounce"
              >
                <span>אישור והזרמת כוח ⚡</span>
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// שלב 5/6: אלגוריתם החיפוש (חיפוש בינארי - Binary Search)
// ============================================================================
function Stage5BinarySearch({ onComplete }) {
  // 15 כפולות של 7 ממוינות מימין לשמאל (7 עד 105)
  const cardsData = useMemo(
    () => Array.from({ length: 15 }, (_, idx) => (idx + 1) * 7),
    []
  );
  const TARGET = 42;

  const [revealedIndices, setRevealedIndices] = useState([]);
  const [steps, setSteps] = useState(0);
  const [found, setFound] = useState(false);
  const [hintText, setHintText] = useState('');
  const advanceTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const handleCardClick = (index) => {
    if (found || revealedIndices.includes(index)) return;

    const newSteps = steps + 1;
    const val = cardsData[index];

    setSteps(newSteps);
    setRevealedIndices((prev) => [...prev, index]);

    if (val === TARGET) {
      setFound(true);
      setHintText('');
      advanceTimerRef.current = setTimeout(() => {
        onComplete(newSteps);
      }, 2400);
    } else if (val > TARGET) {
      setHintText(
        `חשפתם את ${val} — זה גדול מ-${TARGET}! מכיוון שהרשימה ממוינת מימין לשמאל, ${TARGET} חייב להיות מימין לכרטיסייה הזו 👉`
      );
    } else {
      setHintText(
        `חשפתם את ${val} — זה קטן מ-${TARGET}! מכיוון שהרשימה ממוינת מימין לשמאל, ${TARGET} חייב להיות משמאל לכרטיסייה הזו 👈`
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white/90 backdrop-blur-xl border border-white/70 rounded-[2rem] shadow-xl p-6 sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
                שלב 5 מתוך 6 • יעילות ואלגוריתמים
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                אלגוריתם החיפוש (חיפוש בינארי)
              </h2>
            </div>
          </div>

          {/* מונה צעדים ויעד */}
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 border-2 border-amber-300 px-4 py-2 rounded-2xl text-center">
              <span className="text-xs font-bold text-amber-800 block">מספר היעד</span>
              <span className="text-2xl font-black text-amber-600">{TARGET}</span>
            </div>
            <div className="bg-indigo-50 border-2 border-indigo-200 px-4 py-2 rounded-2xl text-center">
              <span className="text-xs font-bold text-indigo-800 block">מספר צעדים</span>
              <span className="text-2xl font-black text-indigo-700">{steps}</span>
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-base sm:text-lg mb-5 leading-relaxed">
          לפניכם 15 כרטיסיות המסתירות רשימה ממוינת של מספרים (מימין לשמאל, מהקטן לגדול).
          מצאו את המספר <strong className="text-indigo-700 font-black">42</strong> בכמה
          שפחות לחיצות!
        </p>

        {/* רשת 15 הכרטיסיות (מימין לשמאל) */}
        <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 gap-2.5 sm:gap-3 mb-5">
          {cardsData.map((num, idx) => {
            const isRevealed = revealedIndices.includes(idx);
            const isTarget = isRevealed && num === TARGET;
            const isMiddle = idx === 7; // הכרטיסייה האמצעית (#8)

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleCardClick(idx)}
                disabled={isRevealed || found}
                className={`relative h-16 sm:h-20 rounded-2xl border-2 font-black text-xl sm:text-2xl transition-all flex flex-col items-center justify-center ${
                  isTarget
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white scale-105 shadow-lg shadow-emerald-500/30'
                    : isRevealed
                    ? 'bg-slate-100 border-slate-300 text-slate-600'
                    : 'bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-blue-400 text-white shadow-md hover:-translate-y-0.5 cursor-pointer'
                }`}
              >
                <span
                  className={`absolute top-1 right-2 text-[10px] font-mono ${
                    isRevealed && !isTarget ? 'text-slate-400' : 'text-blue-200'
                  }`}
                >
                  #{idx + 1}
                </span>
                {isRevealed ? num : '?'}
                {!isRevealed && isMiddle && (
                  <span className="text-[9px] font-bold text-cyan-200 mt-0.5">אמצע</span>
                )}
              </button>
            );
          })}
        </div>

        {/* רמז דינמי בזמן חיפוש */}
        {hintText && !found && (
          <div className="mb-5 p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-950 text-sm font-bold flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-cyan-600 shrink-0" />
            <span>{hintText}</span>
          </div>
        )}

        {/* חיווי הצלחה */}
        {found && (
          <div className="mb-5 p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
              <div>
                <h3 className="text-xl font-black">
                  כל הכבוד! מצאתם את 42 בתוך {steps} צעדים! 🎯
                </h3>
                <p className="text-sm font-bold text-emerald-700">
                  {steps <= 4
                    ? 'יעילות שיא! פתרתם במהירות של אלגוריתם חיפוש בינארי אמיתי!'
                    : 'מעולה! עוברים אוטומטית לשלב האחרון...'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
                onComplete(steps);
              }}
              className="py-2.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>לשלב האחרון</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* הסבר אלגוריתמי ידידותי */}
        <div className="bg-gradient-to-l from-indigo-50 to-purple-50 border border-indigo-200/80 rounded-2xl p-4 text-sm text-slate-700 leading-relaxed">
          <div className="font-extrabold text-indigo-900 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>הסוד של חיפוש בינארי (Binary Search):</span>
          </div>
          במקום לבדוק כרטיס אחרי כרטיס, מתכנתים תמיד בודקים את{' '}
          <strong>האמצע</strong> ופוסלים חצי מהאפשרויות בכל צעד! כך אפשר למצוא פריט אחד
          מתוך מיליארד סרטונים בטיקטוק או תוצאות בגוגל בפחות מ-30 צעדים!
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// שלב 6/6: זיהוי פישינג (סייבר)
// ============================================================================
function Stage6Phishing({ onComplete }) {
  const [foundFlags, setFoundFlags] = useState([]);
  const [neutralTip, setNeutralTip] = useState('');

  const flagsInfo = {
    sender: {
      id: 'sender',
      title: 'כתובת שולח מזויפת',
      detail: 'שימו לב לאפסים (00) במקום האותיות oo בכתובת g00gle-support!'
    },
    urgency: {
      id: 'urgency',
      title: 'לחץ ודחיפות מלאכותית',
      detail: 'תוקפים מנסים להלחיץ אתכם לפעול תוך 2 דקות בלי לחשוב!'
    },
    link: {
      id: 'link',
      title: 'קישור מקוצר וחשוד',
      detail: 'קישור bit.ly לאימות סיסמה מוביל לאתר מתחזה שגונב סיסמאות!'
    }
  };

  const toggleFlag = (flagKey, e) => {
    e.stopPropagation();
    setNeutralTip('');
    if (!foundFlags.includes(flagKey)) {
      setFoundFlags((prev) => [...prev, flagKey]);
    }
  };

  const handleNeutralAreaClick = () => {
    if (foundFlags.length < 3) {
      setNeutralTip(
        'החלק הזה נראה רגיל. חפשו 3 פרטים חשודים: בכתובת השולח, בלחץ הזמן ובקישור!'
      );
    }
  };

  const allFound = foundFlags.length === 3;

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white/90 backdrop-blur-xl border border-white/70 rounded-[2rem] shadow-xl p-6 sm:p-9">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-rose-600 uppercase tracking-wider">
              שלב 6 מתוך 6 • הגנת סייבר
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              זיהוי מתקפת פישינג (Phishing)
            </h2>
          </div>
        </div>

        <p className="text-slate-600 text-base sm:text-lg mb-5 leading-relaxed">
          הודעת המייל הבאה נחתה בתיבה של בית הספר. לחצו על{' '}
          <strong className="text-rose-600">3 ״דגלים אדומים״</strong> בתוך המייל שמוכיחים
          שמדובר בניסיון הונאה:
        </p>

        {/* הדמיית הודעת מייל חשודה */}
        <div
          onClick={handleNeutralAreaClick}
          className="bg-white border-2 border-slate-200 rounded-3xl shadow-lg overflow-hidden mb-6 cursor-pointer"
        >
          {/* סרגל כותרת של תוכנת מייל */}
          <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-slate-500 mr-2">
                הודעה נכנסת • תיבת דואר
              </span>
            </div>
            <span className="text-xs font-bold text-slate-400">היום, 09:41</span>
          </div>

          {/* פרטי שולח ונושא */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3 space-y-1.5">
              <div className="text-lg font-black text-slate-900">
                נושא: התראת אבטחה חמורה בחשבון שלך!
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-slate-500 font-bold">מאת:</span>
                <span className="font-bold text-slate-800">צוות התמיכה</span>
                {/* דגל אדום 1: כתובת שולח מזויפת */}
                <button
                  type="button"
                  onClick={(e) => toggleFlag('sender', e)}
                  dir="ltr"
                  className={`px-2.5 py-1 rounded-xl font-mono text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    foundFlags.includes('sender')
                      ? 'bg-red-100 text-red-700 ring-2 ring-red-500 shadow-xs'
                      : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700'
                  }`}
                >
                  &lt;security@g00gle-support.com&gt;
                </button>
              </div>
            </div>

            {/* גוף המייל */}
            <div className="text-slate-700 text-base leading-relaxed space-y-3">
              <p>שלום תלמיד/ה יקר/ה,</p>
              <p>
                זיהינו ניסיון התחברות חריג לחשבון האישי שלך ממכשיר לא מוכר. כדי למנוע
                את מחיקת כל הקבצים והתמונות שלך לצמיתות, עליך לאמת את הסיסמה שלך{' '}
                {/* דגל אדום 2: לחץ ודחיפות מלאכותית */}
                <button
                  type="button"
                  onClick={(e) => toggleFlag('urgency', e)}
                  className={`inline px-2 py-0.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                    foundFlags.includes('urgency')
                      ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                      : 'bg-amber-50/80 hover:bg-rose-50 text-slate-900 hover:text-rose-700 underline decoration-dotted decoration-slate-400'
                  }`}
                >
                  באופן מיידי תוך 2 דקות
                </button>
                .
              </p>

              <div className="pt-2">
                <p className="text-sm font-bold text-slate-600 mb-1.5">
                  לחצו על הקישור הבא לאימות הסיסמה:
                </p>
                {/* דגל אדום 3: קישור מקוצר וחשוד */}
                <button
                  type="button"
                  onClick={(e) => toggleFlag('link', e)}
                  dir="ltr"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold transition-all cursor-pointer ${
                    foundFlags.includes('link')
                      ? 'bg-red-100 text-red-700 ring-2 ring-red-500'
                      : 'bg-blue-50 hover:bg-rose-50 text-blue-600 hover:text-rose-700 underline'
                  }`}
                >
                  <span>http://bit.ly/secure-login-now</span>
                </button>
              </div>

              <p className="text-sm text-slate-500 pt-2">
                בברכה,
                <br />
                מחלקת אבטחת מידע
              </p>
            </div>
          </div>
        </div>

        {/* רמז בלחיצה על אזור ניטרלי */}
        {neutralTip && !allFound && (
          <div className="mb-4 p-3 rounded-2xl bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold text-center">
            {neutralTip}
          </div>
        )}

        {/* פירוט הדגלים שנמצאו */}
        {foundFlags.length > 0 && (
          <div className="space-y-2 mb-5">
            {foundFlags.map((key) => (
              <div
                key={key}
                className="p-3 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm"
              >
                <Flag className="w-4 h-4 text-red-600 shrink-0 mt-0.5 fill-red-600" />
                <div>
                  <span className="font-extrabold text-red-800">
                    {flagsInfo[key].title}:{' '}
                  </span>
                  <span className="text-red-700 font-medium">
                    {flagsInfo[key].detail}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* סרגל תחתון: 3 נוריות חיווי */}
        <div className="bg-slate-900 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm font-extrabold text-white">
            דגלים אדומים שאותרו: {foundFlags.length} מתוך 3
          </span>

          <div className="flex items-center gap-3">
            {[1, 2, 3].map((num) => {
              const isLit = foundFlags.length >= num;
              return (
                <div
                  key={num}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all ${
                    isLit
                      ? 'bg-red-950 border-red-500 text-red-300 shadow-md shadow-red-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isLit ? 'bg-red-500 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  <span>דגל {num}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* כפתור סיום חדר הבריחה */}
        {allFound && (
          <div className="mt-6 bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-5 text-center space-y-4 animate-fade-in">
            <h3 className="text-xl sm:text-2xl font-black text-emerald-900">
              מדהים! זיהיתם את כל 3 סימני הפישינג והגנתם על המערכת! 🛡️
            </h3>
            <button
              type="button"
              onClick={onComplete}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-l from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-700 hover:to-cyan-600 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 transition-all cursor-pointer"
            >
              <span>סיום וקבלת תעודת הצטיינות 🏆</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// מסך סיום חגיגי (SuccessScreen)
// ============================================================================
function SuccessScreen({ player, onCountMeIn, onPlayAgain }) {
  const completionSeconds =
    player?.completionTimeSeconds ?? TOTAL_GAME_SECONDS - (player?.timeRemaining || 0);

  const efficiencyScore =
    player?.binarySearchSteps && player.binarySearchSteps <= 4
      ? 100
      : player?.binarySearchSteps && player.binarySearchSteps <= 6
      ? 92
      : 85;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 relative">
      <ConfettiCelebration />

      <div className="bg-white/95 backdrop-blur-xl border-2 border-amber-200/80 rounded-[2.2rem] shadow-2xl p-6 sm:p-10 relative overflow-hidden">
        {/* תעודת הצטיינות אישית */}
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 rounded-3xl p-6 sm:p-8 text-white text-center shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-300/20 rounded-full blur-2xl" />

          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-300 text-amber-950 flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3">
            <Award className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-amber-200 font-extrabold text-xs sm:text-sm mb-3 tracking-wide">
            תעודת הצטיינות • אתגר החדשנות
          </span>

          <h2 className="text-2xl sm:text-4xl font-black leading-snug mb-2">
            כל הכבוד {player?.fullName} מכיתה {player?.grade}!
          </h2>
          <p className="text-lg sm:text-2xl font-extrabold text-amber-200">
            הוכחת שיש לך ראש של מהנדס/ת תוכנה 🌟
          </p>
        </div>

        {/* רשת 2 כרטיסים: למה לבחור בהנדסת תוכנה + סיכום ביצועים */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* כרטיס: למה לבחור בהנדסת תוכנה בתיכון? */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50/80 border border-purple-200/80 rounded-3xl p-6">
            <h3 className="text-xl font-black text-indigo-950 mb-4 flex items-center gap-2">
              <Rocket className="w-6 h-6 text-purple-600" />
              <span>למה לבחור בהנדסת תוכנה בתיכון?</span>
            </h3>

            <ul className="space-y-3.5 text-sm sm:text-base text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  <strong className="text-slate-900">פיתוח אפליקציות ומשחקים מאפס:</strong>{' '}
                  לומדים להפוך רעיונות יצירתיים למוצרים אמיתיים שעובדים על המסך.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  <strong className="text-slate-900">עבודה בצוותים יצירתיים:</strong>{' '}
                  פותרים תעלומות, מתכננים פרויקטים וחושבים יחד באווירה מעצימה.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  <strong className="text-slate-900">פתיחת דלתות לעולם הטכנולוגיה:</strong>{' '}
                  מתאים לכל מי שאוהב/ת לחשוב וליצור — <strong>גם בלי שום רקע קודם!</strong>
                </span>
              </li>
            </ul>
          </div>

          {/* כרטיס: סיכום ביצועים */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                  <span>סיכום ביצועים</span>
                </h3>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold">
                  זמן סיום: {formatTime(completionSeconds)}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                    <span>פיצוח בעיות מורכבות</span>
                    <span className="text-blue-600 font-extrabold">{efficiencyScore}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-blue-600 to-cyan-400 rounded-full transition-all duration-1000"
                      style={{ width: `${efficiencyScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                    <span>חשיבה יצירתית ואתיקה דיגיטלית</span>
                    <span className="text-purple-600 font-extrabold">100%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-purple-600 to-pink-400 rounded-full transition-all duration-1000"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                    <span>פוטנציאל לחדשנות והייטק</span>
                    <span className="text-emerald-600 font-extrabold">100%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {player?.binarySearchSteps && (
              <div className="mt-5 pt-3 border-t border-slate-200 text-xs sm:text-sm text-slate-600 font-bold text-center">
                אתגר החיפוש הבינארי נפתר ב-
                <span className="text-indigo-700 font-black">
                  {player.binarySearchSteps} צעדים
                </span>
                !
              </div>
            )}
          </div>
        </div>

        {/* כפתורי פעולה: Count Me In + שחק שוב */}
        <div className="space-y-4">
          {!player?.countMeIn ? (
            <button
              type="button"
              onClick={onCountMeIn}
              className="w-full py-4 sm:py-5 px-6 rounded-3xl bg-gradient-to-l from-amber-400 via-orange-500 to-pink-500 hover:from-amber-500 hover:to-pink-600 text-white font-black text-lg sm:text-2xl shadow-xl shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2.5"
            >
              <span>!Count Me In – מעניין אותי לשמוע עוד על המגמה 🚀</span>
            </button>
          ) : (
            <div className="w-full py-4 px-6 rounded-3xl bg-emerald-100 border-2 border-emerald-400 text-emerald-900 font-black text-base sm:text-xl text-center flex items-center justify-center gap-2.5 shadow-md animate-fade-in">
              <Star className="w-6 h-6 text-amber-500 fill-amber-400 shrink-0" />
              <span>
                מעולה! סימנו עבור רכז/ת המגמה שתרצה/י לקבל פרטים נוספים 🎉
              </span>
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={onPlayAgain}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm sm:text-base transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>שחק שוב (תלמיד/ה הבא/ה)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// מסך סיום זמן (TimeoutScreen)
// ============================================================================
function TimeoutScreen({ player, onRestart }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white/95 backdrop-blur-xl border-2 border-red-200 rounded-[2rem] shadow-2xl p-7 sm:p-10 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <Clock className="w-11 h-11" />
        </div>

        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">
            הזמן נגמר! ⏱️
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            כל הכבוד על המאמץ, <strong>{player?.fullName}</strong>! בעולם ההייטק והפיתוח
            לפעמים צריך ספרינט נוסף כדי לפצח את הקוד. הגעת לשלב{' '}
            <strong>{player?.currentStage} מתוך 6</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-l from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
        >
          <RefreshCw className="w-5 h-5" />
          <span>התחלה מחדש</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// חלון מודאלי כניסת מורה
// ============================================================================
function TeacherLoginModal({ isOpen, onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === TEACHER_PASSWORD) {
      setPassword('');
      setError('');
      onSuccess();
    } else {
      setError('סיסמה שגויה. נסו שוב (שימו לב לאות גדולה בתחילת המילה).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-indigo-100 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">כניסת מורה</h3>
              <p className="text-xs text-slate-500 font-medium">
                גישה לדשבורד ניהול ומעקב תלמידים
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setError('');
              setPassword('');
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="teacher-pwd"
              className="block text-sm font-bold text-slate-700 mb-1.5"
            >
              סיסמת גישה:
            </label>
            <div className="relative">
              <input
                id="teacher-pwd"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="הזינו סיסמת מורה..."
                dir="ltr"
                autoFocus
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 outline-none font-mono text-base text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              כניסה לדשבורד
            </button>
            <button
              type="button"
              onClick={() => {
                setError('');
                setPassword('');
                onClose();
              }}
              className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// דשבורד מורה (TeacherDashboard)
// ============================================================================
function TeacherDashboard({
  students,
  onClose,
  onResetAllData,
  onRestoreDemoData
}) {
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // חישוב מדדי KPI עליונים
  const kpis = useMemo(() => {
    const total = students.length;
    const completedList = students.filter((s) => s.status === 'הושלם בהצלחה');
    const successRate =
      total > 0 ? Math.round((completedList.length / total) * 100) : 0;

    const validCompletionTimes = completedList
      .map((s) => s.completionTimeSeconds)
      .filter((t) => typeof t === 'number' && t > 0);

    const avgSeconds =
      validCompletionTimes.length > 0
        ? Math.round(
            validCompletionTimes.reduce((acc, cur) => acc + cur, 0) /
              validCompletionTimes.length
          )
        : 0;

    const interestedCount = students.filter((s) => s.countMeIn).length;

    return {
      total,
      successRate,
      avgTimeFormatted: validCompletionTimes.length > 0 ? formatTime(avgSeconds) : '--:--',
      interestedCount
    };
  }, [students]);

  // רשימת כיתות דינמית לסינון
  const availableGrades = useMemo(() => {
    const set = new Set(GRADE_OPTIONS);
    students.forEach((s) => {
      if (s.grade) set.add(s.grade);
    });
    return Array.from(set);
  }, [students]);

  // סינון וחיפוש בזיכרון
  const filteredStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .filter((s) => {
        const matchesGrade = gradeFilter === 'ALL' || s.grade === gradeFilter;
        const matchesSearch =
          !searchQuery.trim() ||
          s.fullName?.toLowerCase().includes(searchQuery.trim().toLowerCase());
        return matchesGrade && matchesSearch;
      });
  }, [students, gradeFilter, searchQuery]);

  // ייצוא נתונים לקובץ CSV תואם אקסל בעברית (עם UTF-8 BOM)
  const handleExportCSV = () => {
    const headers = [
      'שם מלא',
      'כיתה',
      'שלבים שהושלמו',
      'סטטוס',
      'זמן סיום / נותר',
      'צעדים בחיפוש בינארי',
      'מעוניין במגמה'
    ];

    const rows = filteredStudents.map((s) => {
      const progress = `${s.completedStages ?? 0}/6`;
      const timeStr =
        s.status === 'הושלם בהצלחה' && s.completionTimeSeconds
          ? formatTime(s.completionTimeSeconds)
          : `${formatTime(s.timeRemaining)} נותר`;
      const stepsStr = s.binarySearchSteps ? `${s.binarySearchSteps} צעדים` : '-';
      const interestStr = s.countMeIn ? 'כן - מעוניין/ת במגמה' : 'לא סומן';

      return [
        s.fullName,
        s.grade,
        progress,
        s.status,
        timeStr,
        stepsStr,
        interestStr
      ]
        .map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`)
        .join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `אתגר_החדשנות_דוח_תלמידים.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm overflow-y-auto p-3 sm:p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-2xl border border-indigo-100 overflow-hidden my-2">
        {/* כותרת דשבורד המורה */}
        <div className="bg-gradient-to-l from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black">
                דשבורד מורה — אתגר החדשנות
              </h2>
              <p className="text-xs sm:text-sm text-cyan-200 font-medium">
                מעקב בזמן אמת אחר התקדמות תלמידי כיתה ט׳ ומתעניינים במגמת הנדסת תוכנה
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>חזרה למשחק</span>
          </button>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          {/* כרטיסי סיכום עליונים (KPIs) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-bold text-blue-900">
                  סה״כ משתתפים
                </span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-blue-700">
                {kpis.total}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-bold text-emerald-900">
                  סיימו בהצלחה
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700">
                {kpis.successRate}%
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-200 rounded-3xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-bold text-purple-900">
                  זמן סיום ממוצע
                </span>
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div
                className="text-3xl sm:text-4xl font-black text-purple-700 font-mono"
                dir="ltr"
              >
                {kpis.avgTimeFormatted}
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-300 rounded-3xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-bold text-amber-900">
                  מתעניינים במגמה ⭐
                </span>
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-600">
                {kpis.interestedCount}
              </div>
            </div>
          </div>

          {/* סרגל סינון, חיפוש ופעולות ניהול */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
              {/* סינון לפי כיתה */}
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-4 py-2.5 rounded-2xl bg-white border border-slate-300 font-bold text-sm text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                aria-label="סינון לפי כיתה"
              >
                <option value="ALL">כל הכיתות</option>
                {availableGrades.map((g) => (
                  <option key={g} value={g}>
                    כיתה {g}
                  </option>
                ))}
              </select>

              {/* חיפוש לפי שם תלמיד */}
              <div className="relative flex-1 min-w-[180px] max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חיפוש לפי שם תלמיד/ה..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* כפתורי פעולות ניהול */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>ייצוא CSV (אקסל)</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmResetOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>איפוס נתונים</span>
              </button>
            </div>
          </div>

          {/* טבלת מעקב תלמידים */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 shadow-xs">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 text-xs sm:text-sm font-extrabold border-b border-slate-200">
                  <th className="py-3.5 px-4">שם מלא</th>
                  <th className="py-3.5 px-3">כיתה</th>
                  <th className="py-3.5 px-4">התקדמות</th>
                  <th className="py-3.5 px-3">סטטוס</th>
                  <th className="py-3.5 px-3">זמן סיום / נותר</th>
                  <th className="py-3.5 px-3">יעילות (שלב 5)</th>
                  <th className="py-3.5 px-4">עניין במגמה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500 font-bold">
                      לא נמצאו תלמידים התואמים לסינון הנוכחי.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const completedCount = student.completedStages ?? 0;
                    const progressPercent = Math.round((completedCount / 6) * 100);

                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-indigo-50/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">
                          {student.fullName}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs">
                            {student.grade}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  completedCount === 6
                                    ? 'bg-emerald-500'
                                    : 'bg-blue-500'
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <span className="text-xs font-extrabold text-slate-700 whitespace-nowrap">
                              {completedCount}/6 שלבים
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                              student.status === 'הושלם בהצלחה'
                                ? 'bg-emerald-100 text-emerald-800'
                                : student.status === 'הזמן נגמר'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td
                          className="py-3.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap"
                          dir="ltr"
                        >
                          {student.status === 'הושלם בהצלחה' &&
                          student.completionTimeSeconds
                            ? formatTime(student.completionTimeSeconds)
                            : `${formatTime(student.timeRemaining)} נותר`}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {student.binarySearchSteps ? (
                            <span
                              className={`text-xs font-extrabold px-2.5 py-1 rounded-xl ${
                                student.binarySearchSteps <= 4
                                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {student.binarySearchSteps} צעדים
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">טרם הושלם</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {student.countMeIn ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-l from-amber-200 to-yellow-200 border border-amber-400 text-amber-950 font-black text-xs shadow-xs">
                              מעוניין/ת במגמה! ⭐
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">
                              טרם סומן
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* חלון אישור איפוס נתונים מותאם אישית */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
              <span>איפוס נתוני הטבלה</span>
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              בחרו כיצד תרצו לאפס את רשומות התלמידים בדשבורד:
            </p>
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  onResetAllData();
                  setConfirmResetOpen(false);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm cursor-pointer"
              >
                מחיקת כל הנתונים (טבלה ריקה)
              </button>
              <button
                type="button"
                onClick={() => {
                  onRestoreDemoData();
                  setConfirmResetOpen(false);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-extrabold text-sm cursor-pointer"
              >
                איפוס והחזרת 4 רשומות ההדגמה
              </button>
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm cursor-pointer"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// הרכיב הראשי של האפליקציה (App)
// ============================================================================
export default function App() {
  // ניהול אימות וחיבור למסד הנתונים (Firestore + גיבוי בזיכרון)
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState(INITIAL_DEMO_STUDENTS);
  const demoSeededRef = useRef(false);

  // מצב המשחק והשחקן הנוכחי
  const [screen, setScreen] = useState('welcome'); // 'welcome' | 'playing' | 'success' | 'timeout'
  const [currentStage, setCurrentStage] = useState(1);
  const [timeLeft, setTimeLeft] = useState(TOTAL_GAME_SECONDS);
  const [activePlayer, setActivePlayer] = useState(null);

  // מודאלים של מורה
  const [teacherLoginOpen, setTeacherLoginOpen] = useState(false);
  const [teacherDashboardOpen, setTeacherDashboardOpen] = useState(false);

  // טעינת הפונט Rubik מ-Google Fonts והגדרת כיוון RTL
  useEffect(() => {
    document.documentElement.lang = 'he';
    document.documentElement.dir = 'rtl';

    const existingLink = document.getElementById('rubik-google-font');
    if (!existingLink) {
      const link = document.createElement('link');
      link.id = 'rubik-google-font';
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800;900&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // שלב 1 בהגדרת Firebase: אימות ראשוני (Auth First)
  useEffect(() => {
    if (!isFirebaseReady || !auth) return;

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn('Auth warning:', err);
      }
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // שלב 2 בהגדרת Firebase: האזנה בזמן אמת לנתוני התלמידים
  useEffect(() => {
    if (!isFirebaseReady || !db || !user) return;

    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');

    const unsubscribe = onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty && !demoSeededRef.current) {
          demoSeededRef.current = true;
          try {
            for (const demo of INITIAL_DEMO_STUDENTS) {
              await setDoc(
                doc(db, 'artifacts', appId, 'public', 'data', 'students', demo.id),
                demo
              );
            }
          } catch (seedErr) {
            console.warn('Seed demo error:', seedErr);
          }
          return;
        }

        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        setStudents(list);
      },
      (error) => {
        console.warn('Firestore snapshot error:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // פונקציית שמירה ועדכון רשומת שחקן בזמן אמת
  const persistPlayerRecord = async (record) => {
    setActivePlayer(record);

    // עדכון מיידי של המצב המקומי
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === record.id);
      if (exists) {
        return prev.map((s) => (s.id === record.id ? record : s));
      }
      return [record, ...prev];
    });

    // סנכרון לענן (Firestore)
    if (isFirebaseReady && db && user) {
      try {
        await setDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'students', record.id),
          record,
          { merge: true }
        );
      } catch (err) {
        console.warn('Failed to sync student record:', err);
      }
    }
  };

  // טיימר ספירה לאחור (רץ רק בזמן משחק פעיל)
  useEffect(() => {
    if (screen !== 'playing') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // הזמן נגמר!
          setScreen('timeout');
          if (activePlayer) {
            persistPlayerRecord({
              ...activePlayer,
              status: 'הזמן נגמר',
              timeRemaining: 0,
              updatedAt: Date.now()
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [screen, activePlayer]);

  // התחלת משחק חדש מתוך מסך הפתיחה
  const handleStartGame = ({ fullName, grade }) => {
    const newPlayer = {
      id: `player_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      fullName,
      grade,
      currentStage: 1,
      completedStages: 0,
      status: 'בתהליך',
      timeRemaining: TOTAL_GAME_SECONDS,
      completionTimeSeconds: null,
      binarySearchSteps: null,
      countMeIn: false,
      updatedAt: Date.now()
    };

    setTimeLeft(TOTAL_GAME_SECONDS);
    setCurrentStage(1);
    setScreen('playing');
    persistPlayerRecord(newPlayer);
  };

  // מעבר שלב בתוך המשחק
  const handleAdvanceStage = (nextStageNum, extraFields = {}) => {
    setCurrentStage(nextStageNum);
    if (activePlayer) {
      persistPlayerRecord({
        ...activePlayer,
        ...extraFields,
        currentStage: nextStageNum,
        completedStages: nextStageNum - 1,
        timeRemaining: timeLeft,
        updatedAt: Date.now()
      });
    }
  };

  // סיום כל 6 השלבים בהצלחה
  const handleFinishGame = () => {
    const completionTimeSeconds = TOTAL_GAME_SECONDS - timeLeft;
    setScreen('success');
    if (activePlayer) {
      persistPlayerRecord({
        ...activePlayer,
        currentStage: 6,
        completedStages: 6,
        status: 'הושלם בהצלחה',
        timeRemaining: timeLeft,
        completionTimeSeconds,
        updatedAt: Date.now()
      });
    }
  };

  // לחיצה על כפתור Count Me In במסך הסיום
  const handleCountMeIn = () => {
    if (!activePlayer) return;
    persistPlayerRecord({
      ...activePlayer,
      countMeIn: true,
      updatedAt: Date.now()
    });
  };

  // איפוס למשחק חדש (תלמיד/ה הבא/ה)
  const handleResetGameSession = () => {
    setActivePlayer(null);
    setCurrentStage(1);
    setTimeLeft(TOTAL_GAME_SECONDS);
    setScreen('welcome');
  };

  // מחיקת כל נתוני התלמידים בדשבורד המורה
  const handleResetAllData = async () => {
    const currentList = [...students];
    setStudents([]);
    if (isFirebaseReady && db && user) {
      try {
        for (const item of currentList) {
          await deleteDoc(
            doc(db, 'artifacts', appId, 'public', 'data', 'students', item.id)
          );
        }
      } catch (err) {
        console.warn('Reset delete error:', err);
      }
    }
  };

  // שחזור נתוני ההדגמה בדשבורד המורה
  const handleRestoreDemoData = async () => {
    await handleResetAllData();
    setStudents(INITIAL_DEMO_STUDENTS);
    if (isFirebaseReady && db && user) {
      try {
        for (const demo of INITIAL_DEMO_STUDENTS) {
          await setDoc(
            doc(db, 'artifacts', appId, 'public', 'data', 'students', demo.id),
            demo
          );
        }
      } catch (err) {
        console.warn('Restore demo error:', err);
      }
    }
  };

  return (
    <div
      dir="rtl"
      style={{ fontFamily: "'Rubik', sans-serif" }}
      className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 text-slate-900 flex flex-col selection:bg-cyan-200 selection:text-indigo-950"
    >
      {/* אנימציות מותאמות */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.35s ease-out forwards;
        }
      `}</style>

      {/* סרגל ניווט עליון קבוע */}
      <TopNavbar
        player={activePlayer}
        timeLeft={timeLeft}
        isTimerActive={screen === 'playing'}
        onOpenTeacherModal={() => setTeacherLoginOpen(true)}
        onLogoClick={() => {
          if (screen === 'welcome') return;
        }}
      />

      {/* תוכן מרכזי */}
      <main className="flex-1 py-5 sm:py-8">
        {screen === 'welcome' && <WelcomeScreen onStartGame={handleStartGame} />}

        {screen === 'playing' && (
          <div>
            <StageProgressBar currentStage={currentStage} />

            {currentStage === 1 && (
              <Stage1Caesar onComplete={() => handleAdvanceStage(2)} />
            )}

            {currentStage === 2 && (
              <Stage2AIBias onComplete={() => handleAdvanceStage(3)} />
            )}

            {currentStage === 3 && (
              <Stage3SecurityFlow onComplete={() => handleAdvanceStage(4)} />
            )}

            {currentStage === 4 && (
              <Stage4BooleanLogic onComplete={() => handleAdvanceStage(5)} />
            )}

            {currentStage === 5 && (
              <Stage5BinarySearch
                onComplete={(stepsTaken) =>
                  handleAdvanceStage(6, { binarySearchSteps: stepsTaken })
                }
              />
            )}

            {currentStage === 6 && <Stage6Phishing onComplete={handleFinishGame} />}
          </div>
        )}

        {screen === 'success' && (
          <SuccessScreen
            player={activePlayer}
            onCountMeIn={handleCountMeIn}
            onPlayAgain={handleResetGameSession}
          />
        )}

        {screen === 'timeout' && (
          <TimeoutScreen
            player={activePlayer}
            onRestart={handleResetGameSession}
          />
        )}
      </main>

      {/* כותרת תחתונה עדינה */}
      <footer className="py-4 text-center text-xs font-bold text-slate-500/80">
        אתגר החדשנות • חשיפה חווייתית למדעי המחשב והנדסת תוכנה לכיתה ט׳ ✨
      </footer>

      {/* מודאל כניסת מורה */}
      <TeacherLoginModal
        isOpen={teacherLoginOpen}
        onClose={() => setTeacherLoginOpen(false)}
        onSuccess={() => {
          setTeacherLoginOpen(false);
          setTeacherDashboardOpen(true);
        }}
      />

      {/* דשבורד מורה */}
      {teacherDashboardOpen && (
        <TeacherDashboard
          students={students}
          onClose={() => setTeacherDashboardOpen(false)}
          onResetAllData={handleResetAllData}
          onRestoreDemoData={handleRestoreDemoData}
        />
      )}
    </div>
  );
}
