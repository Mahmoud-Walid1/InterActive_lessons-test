import { LessonData } from '@/types/lesson';

export const PRIMARY_GRADES = [
  { id: 'grade_1', name: 'الصف الأول الابتدائي', icon: 'Sparkles', color: 'from-amber-500 to-amber-600' },
  { id: 'grade_2', name: 'الصف الثاني الابتدائي', icon: 'BookOpen', color: 'from-emerald-500 to-emerald-600' },
  { id: 'grade_3', name: 'الصف الثالث الابتدائي', icon: 'Compass', color: 'from-sky-500 to-sky-600' },
  { id: 'grade_4', name: 'الصف الرابع الابتدائي', icon: 'Award', color: 'from-purple-500 to-purple-600' },
  { id: 'grade_5', name: 'الصف الخامس الابتدائي', icon: 'Globe', color: 'from-rose-500 to-rose-600' },
  { id: 'grade_6', name: 'الصف السادس الابتدائي', icon: 'GraduationCap', color: 'from-indigo-500 to-indigo-600' }
];

export const SUBJECTS_LIST = [
  { id: 'science', name: 'العلوم', icon: 'Microscope', color: 'from-emerald-600 to-teal-700' },
  { id: 'math', name: 'الرياضيات', icon: 'Calculator', color: 'from-amber-500 to-orange-600' },
  { id: 'arabic', name: 'اللغة العربية', icon: 'BookMarked', color: 'from-sky-600 to-blue-700' },
  { id: 'studies', name: 'الدراسات الاجتماعية', icon: 'MapPin', color: 'from-purple-600 to-indigo-700' },
  { id: 'english', name: 'اللغة الإنجليزية', icon: 'Languages', color: 'from-rose-500 to-pink-600' }
];

export const SAMPLE_LESSONS: Record<string, LessonData> = {
  'lesson_animals_group': {
    id: 'lesson_animals_group',
    title: 'مجموعات الحيوانات - عرض تفاعلي',
    gradeId: 'grade_4',
    subjectId: 'science',
    description: 'رحلة تفاعلية ممتعة للتعرف على تصنيف الحيوانات (الثدييات، الطيور، الزواحف، البرمائيات، الأسماك).',
    slides: [
      {
        id: 'slide_intro',
        type: 'explain',
        eyebrow: 'مقدمة الاستكشاف',
        title: 'رحلة في عالم الحيوانات 🦁🦅',
        subtitle: 'تتنوع الحيوانات في أشكالها وأحجامها وبيئاتها! دعنا نتعرف على المجموعات الرئيسية التي صنفها العلماء.',
        mascotTip: 'أهلاً بك يا بطل! أنا الروبوت فطين، سأرافقك في هذه المغامرة العلمية الشيقة!',
        sceneAnimation: 'bounce',
        traits: [
          'تصنف الحيوانات حسب طريقة التنفس وغطاء الجسم والتكاثر',
          'هناك 5 مجموعات رئيسية من الفقاريات سنستكشفها معاً',
          'كل مجموعة تتميز بصفات فريدة تساعدها على البقاء'
        ]
      },
      {
        id: 'slide_mammals',
        type: 'interactive_reveal',
        eyebrow: 'المجموعة الأولى',
        title: 'الثدييات (Mammals) 🐻🍼',
        subtitle: 'اضغط على البطاقات لتستكشف خصائص وأمثلة الثدييات:',
        mascotTip: 'هل تعلم أن الخفاش من الثدييات رغم أنه يطير؟ والحوت من الثدييات رغم أنه يسبح!',
        sceneAnimation: 'pulse',
        groups: [
          { id: 'm1', emoji: '🦁', name: 'الأسد والنمور', detail: 'تلد وتُرضع صغارها الحليب، ويغطي جسمها الشعر أو الفراء.' },
          { id: 'm2', emoji: '🐬', name: 'الدلفين والحوت', detail: 'تنفس الهواء الجوي بالرئتين وتلد صغارها وتعيش في الماء.' },
          { id: 'm3', emoji: '🦇', name: 'الخفاش', detail: 'الثدييات الوحيدة القادرة على الطيران الحقيقي!' }
        ],
        reveal: {
          question: 'سؤال ذكاء: كيف تتنفس الثدييات المائية مثل الحوت والدلفين؟',
          answer: 'تتخصي بالتنفس عبر الرئتين، وتصعد لسطح الماء بين الحين والآخر لاستنشاق الهواء!'
        }
      },
      {
        id: 'slide_birds',
        type: 'explain',
        eyebrow: 'المجموعة الثانية',
        title: 'الطيور (Birds) 🦅🪶',
        subtitle: 'حيوانات يغطي جسمها الريش ولها أجنحة ومناقير وتتثر بالبيض.',
        mascotTip: 'لاحظ كيف تساعد العظام المجوفة الطيور على خفة الوزن أثناء الطيران!',
        sceneAnimation: 'flap',
        examples: [
          { emoji: '🦅', name: 'النسر' },
          { emoji: '🦜', name: 'الببغاء' },
          { emoji: '🐧', name: 'البطريق' }
        ],
        traits: [
          'يغطي جسمها الريش الخفيف والمقاوم للماء',
          'تتكاثر بوضع البيض ذي القشرة الصلبة',
          'ليس لها أسنان بل مناقير مصممة لنوع طعامها'
        ]
      },
      {
        id: 'slide_quiz',
        type: 'quiz',
        eyebrow: 'التحدي التفاعلي',
        title: 'اختبر معلوماتك يا بطل! 🎯',
        subtitle: 'اختر المجموعات الصحيحة لتكسب النجوم والمكافآت:',
        quiz: {
          id: 'q1',
          emoji: '🐸',
          name: 'الضفدع',
          question: 'إلى أي مجموعة ينتمي الضفدع الذي يبدأ حياته بالماء ويستكملها على اليابسة؟',
          choices: [
            { id: 'c1', text: 'الزواحف', isCorrect: false },
            { id: 'c2', text: 'البرمائيات', isCorrect: true },
            { id: 'c3', text: 'الأسماك', isCorrect: false }
          ]
        }
      },
      {
        id: 'slide_summary',
        type: 'summary',
        title: 'أحسنت الإنجاز! 🎉🌟',
        subtitle: 'لقد أكملت درس مجموعات الحيوانات بنجاح وتعلمت كيفية تصنيفها!'
      }
    ]
  },
  'lesson_fractions_basic': {
    id: 'lesson_fractions_basic',
    title: 'مفهوم الكسور الاعتيادية',
    gradeId: 'grade_4',
    subjectId: 'math',
    description: 'تعلم تقسيم الأشكال والقطع إلى أجزاء متساوية وفهم البسط والمقام.',
    slides: [
      {
        id: 'f_intro',
        type: 'explain',
        eyebrow: 'مقدمة الرياضيات',
        title: 'ما هو الكسر؟ 🍕',
        subtitle: 'الكسر يمثل جزءاً من بيتزا كاملة أو مجموعة أشكال متساوية.',
        mascotTip: 'عندما تقسم فطيرة إلى 4 أجزاء وتأكل جزءاً واحداً، فأنت أكلت 1 من 4 (1/4)!',
        sceneAnimation: 'float',
        traits: [
          'البسط (العدد العلوي): يمثل عدد الأجزاء المأخوذة',
          'المقام (العدد السفلي): يمثل العدد الكلي للأجزاء المتساوية',
          'شرط الكسر أن تكون جميع الأجزاء متساوية تماماً'
        ]
      },
      {
        id: 'f_quiz',
        type: 'quiz',
        eyebrow: 'تحدي الكسور',
        title: 'احسب الكسر المظلل 📐',
        subtitle: 'اختر الإجابة الصحيحة للكسر الممثل:',
        quiz: {
          id: 'fq1',
          emoji: '🥧',
          name: 'فطيرة مقسمة 3 أجزاء',
          question: 'إذا قسمنا فطيرة إلى 3 أجزاء متساوية وأكلنا جزءين، فما الكسر المتبقي؟',
          choices: [
            { id: 'fc1', text: '1/3 (ثلث واحد)', isCorrect: true },
            { id: 'fc2', text: '2/3 (ثلثان)', isCorrect: false },
            { id: 'fc3', text: '3/3 (فطيرة كاملة)', isCorrect: false }
          ]
        }
      },
      {
        id: 'f_summary',
        type: 'summary',
        title: 'عبقري الرياضيات! 🌟',
        subtitle: 'أتقنت مفهوم البسط والمقام والكسور الاعتيادية بنجاح!'
      }
    ]
  }
};
