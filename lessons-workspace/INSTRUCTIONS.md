# 📘 دليل مهندس المحتوى والمعلم (Content Workspace Guide)

مرحباً بك في مستودع إعداد وتطوير الدروس التفاعلية!
تم تصميم هذه البيئة لتكون **معزولة، خفيفة، وسهلة الاستخدام تماماً**؛ لا تتطلب منك تثبيت أي برامج وسيطة أو حزم برمجية (`node_modules`)، وتعمل بالكامل بمعايير الويب القياسية لضمان أقصى سرعة وأعلى توافق.

---

## 📁 هيكل المستودع (Workspace Structure)

```text
lessons-workspace/
├── template/                  # القالب الأساسي النموذجي للدرس
│   ├── index.html            # صفحة العرض المعزولة
│   ├── style.css             # التنسيقات البصرية
│   ├── script.js             # المحرك التفاعلي ونظام الصوتيات
│   ├── lesson.json           # ملف بيانات الدرس
│   └── assets/
│       ├── audio/            # ملفات الأصوات (.mp3, .wav)
│       └── images/           # ملفات الصور والأيقونات (.svg, .png, .webp)
├── lessons/                   # مجلدات تسليم الدروس مصنفة حسب الصفوف
│   ├── grade-1/ ... grade-6/ # الصف الأول حتى السادس
├── preview/
│   └── index.html            # أداة المعاينة الفورية وفحص الجاهزية
├── .gitignore                # استبعاد الملفات غير الضرورية
└── INSTRUCTIONS.md           # هذا الدليل الإرشادي
```

---

## 📱 إرشادات التجاوب وشاشات الموبايل (Mobile & Screen Guidelines)
> [!TIP]
> **القالب مبرمج ليتكيف تلقائياً مع كافة مقاسات الشاشات (الهواتف والتابلت والكمبيوتر) في الوضعين الأفقي والرأسي.**
> **المطلوب منك فقط:**
> 1. اجعل نصوص البطاقات والأسئلة موجزة ومباشرة لتناسب مدارك تلاميذ الابتدائي وتكون مريحة للقراءة على شاشات الهواتف.
> 2. يمكنك إضافة أي عدد تريده من الشرائح (6، 8، 12 شريحة)، وتكرار الأنشطة التفاعلية في أي موضع بالدرس.

---

## 🚀 خطوات إنشاء درس جديد (خطوة بخطوة)

### الخطوة 1: نسخ مجلد القالب
1. انسخ مجلد `template` كاملاً.
2. توجّه إلى مجلد الصف المستهدف داخل `lessons/` (مثال: `lessons/grade-2/`).
3. الصق المجلد وأعد تسميته باسم الدرس بالإنجليزية (مثال: `living-things-needs`).

### الخطوة 2: تعديل محتوى `lesson.json`
- `"id"`: معرف فريد للدرس (مثال: `"g2_sci_l1_needs"`).
- `"title"`: عنوان الدرس بالعربية (مثال: `"حاجات الكائنات الحية"`).
- `"gradeId"`: الصف المخصص (`"grade_1"` إلى `"grade_6"`).
- `"subjectId"`: المادة (`"science"`, `"math"`, `"arabic"`, `"studies"`, `"english"`).
- `"description"`: نبذة توضيحية عن الدرس.
- `"slides"`: مصفوفة الشرائح التفاعلية (12 نمطاً مدعوماً).

---

## 🎨 موسوعة الأنماط التفاعلية الـ 12 المدعومة (Slide Types)

### 1. الشرح والاستكشاف (`"type": "explain"`)
```json
{
  "id": "s1",
  "type": "explain",
  "eyebrow": "مقدمة الدرس",
  "title": "حاجات الكائنات الحية",
  "subtitle": "تحتاج الكائنات الحية إلى أشياء أساسية للنمو والبقاء.",
  "mascotTip": "مرحباً يا بطل! راقب النقاط التالية بتركيز:",
  "sceneAnimation": "bounce",
  "traits": [
    "الماء: ضروري للشرب ونقل العناصر داخل الجسم.",
    "الهواء: للتنفس وتوليد الطاقة."
  ],
  "examples": [
    { "emoji": "🌱", "name": "النبات يحتاج الضوء" },
    { "emoji": "🦁", "name": "الحيوان يحتاج الغذاء" }
  ]
}
```

### 2. البطاقات الاستكشافية (`"type": "interactive_reveal"`)
```json
{
  "id": "s2",
  "type": "interactive_reveal",
  "title": "بطاقات حاجات المخلوقات",
  "groups": [
    { "id": "g1", "emoji": "☀️", "name": "ضوء الشمس", "detail": "يستخدمه النبات لصنع غذائه." },
    { "id": "g2", "emoji": "💧", "name": "الماء", "detail": "يروي العطش ويدعم دورة الحياة." }
  ],
  "reveal": {
    "question": "اضغط هنا لسؤال التحدي",
    "answer": "لا يمكن لأي كائن حي العيش بدون ماء!"
  }
}
```

### 3. سؤال متعدد الخيارات (`"type": "quiz"`)
```json
{
  "id": "s3",
  "type": "quiz",
  "title": "اختبر معلوماتك",
  "quiz": {
    "id": "q1",
    "question": "ماذا يستخدم النبات ليصنع غذاءه في أوراقه؟",
    "choices": [
      { "id": "c1", "text": "العصير المحلى", "isCorrect": false },
      { "id": "c2", "text": "ضوء الشمس والماء", "isCorrect": true }
    ]
  }
}
```

### 4. صح أم خطأ (`"type": "true_false"`)
```json
{
  "id": "s4",
  "type": "true_false",
  "title": "تحدي الصواب والخطأ",
  "trueFalse": {
    "id": "tf1",
    "statement": "تحتاج الصخور للأكل والشرب حتى تنمو!",
    "isTrue": false,
    "explanation": "الصخور أشياء غير حية فلا تحتاج للغذاء."
  }
}
```

### 5. المطابقة والتوصيل (`"type": "match_pairs"`)
```json
{
  "id": "s5",
  "type": "match_pairs",
  "title": "وصّل الكائن مع مأواه",
  "matchPairs": {
    "pairs": [
      { "id": "m1", "leftText": "العصفور", "leftEmoji": "🐦", "rightText": "العش", "rightEmoji": "🪺" },
      { "id": "m2", "leftText": "النحلة", "leftEmoji": "🐝", "rightText": "الخلية", "rightEmoji": "🍯" }
    ]
  }
}
```

### 6. الترتيب والتسلسل (`"type": "order_sequence"`)
```json
{
  "id": "s6",
  "type": "order_sequence",
  "title": "رتّب مراحل نمو النبات",
  "orderSequence": {
    "steps": [
      { "id": "st1", "order": 1, "text": "وضع البذرة في التربة", "emoji": "🌱" },
      { "id": "st2", "order": 2, "text": "ظهور النبتة والأوراق", "emoji": "🌿" },
      { "id": "st3", "order": 3, "text": "تفتح الأزهار وإنتاج الثمار", "emoji": "🌸" }
    ]
  }
}
```

### 7. بنك الكلمات وإكمال الفراغ (`"type": "fill_blank"`)
```json
{
  "id": "s7",
  "type": "fill_blank",
  "title": "أكمل الجملة العلمية",
  "fillBlank": {
    "id": "fb1",
    "sentenceBefore": "تتنفس الأسماك بواسطة",
    "blankAnswer": "الخياشيم",
    "sentenceAfter": "تحت الماء.",
    "wordBank": ["الخياشيم", "الرئتين", "الأجنحة"]
  }
}
```

### 8. التصنيف والفرز في سلات (`"type": "classify_sorting"`)
```json
{
  "id": "s8",
  "type": "classify_sorting",
  "title": "فرز الكائنات والأشياء",
  "classifySorting": {
    "buckets": [
      { "id": "b_live", "name": "كائنات حية", "emoji": "🌱" },
      { "id": "b_non", "name": "أشياء غير حية", "emoji": "🧱" }
    ],
    "items": [
      { "id": "ci1", "name": "الفراشة", "emoji": "🦋", "targetBucketId": "b_live" },
      { "id": "ci2", "name": "القلم", "emoji": "✏️", "targetBucketId": "b_non" }
    ]
  }
}
```

### 9. الاستكشاف التفاعلي بالنقاط (`"type": "hotspot_explore"`)
```json
{
  "id": "s9",
  "type": "hotspot_explore",
  "title": "استكشف أجزاء النبات",
  "hotspot": {
    "fallbackGraphic": "🪴",
    "points": [
      { "id": "p1", "xPercent": 50, "yPercent": 25, "title": "الزهرة", "detail": "تنتج البذور وتجذب النحل.", "emoji": "🌸" },
      { "id": "p2", "xPercent": 50, "yPercent": 85, "title": "الجذور", "detail": "تمتص الماء وتثبت النبتة.", "emoji": "🥕" }
    ]
  }
}
```

### 10. كروت الذاكرة والمطابقة (`"type": "memory_cards"`)
```json
{
  "id": "s10",
  "type": "memory_cards",
  "title": "لعبة كروت الذاكرة",
  "memoryCards": {
    "pairs": [
      { "id": "p1", "itemA": { "text": "أسد", "emoji": "🦁" }, "itemB": { "text": "شبل", "emoji": "🦁" } },
      { "id": "p2", "itemA": { "text": "ضفدع", "emoji": "🐸" }, "itemB": { "text": "أبو ذنيبة", "emoji": "🐸" } }
    ]
  }
}
```

### 11. العد التفاعلي الممتع (`"type": "tap_to_count"`)
```json
{
  "id": "s11",
  "type": "tap_to_count",
  "title": "كم تفاحة لذيذة؟",
  "tapToCount": {
    "targetCount": 5,
    "itemName": "تفاحات",
    "itemEmoji": "🍎"
  }
}
```

### 12. شاشة التكريم والنجوم (`"type": "summary"`)
```json
{
  "id": "s12",
  "type": "summary",
  "title": "أحسنت يا بطل! أتممت الدرس بنجاح",
  "subtitle": "لقد جمعت النجوم بناءً على حلك للتحديات والأنشطة التفاعلية!"
}
```

---

## 🔍 المعاينة والتجربة الفورية
1. افتح ملف `preview/index.html` في أي متصفح.
2. اسحب ملف `lesson.json` في الصفحة.
3. تأكد من ظهور علامات الصح الخضراء، وجرب حل الأنشطة وسماع نغمات النجاح.

---

## 📤 رفع الشغل وتسليمه (Git Workflow)
```bash
git checkout -b content/grade-2-science-lesson-1
git add lessons/grade-2/your-lesson-name/
git commit -m "feat(grade-2): add science lesson 1"
git push origin content/grade-2-science-lesson-1
```
ثم افتح Pull Request على GitHub ليراجعه المدير ويدمجه للمنصة فوراً.
