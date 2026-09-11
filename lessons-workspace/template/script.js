/**
 * Interactive Lesson Runtime Engine (Isolated IIFE)
 * UI/UX Pro Max Edition: Zero external dependencies, pure Web Standards.
 * Flawless 3D Flip System, Centered Capsule Dock, and True Vector SVGs.
 */
(function () {
  'use strict';

  window.__IL_AUDIT_LOGS__ = window.__IL_AUDIT_LOGS__ || [];

  function recordAuditLog(type, message, details) {
    var entry = {
      timestamp: new Date().toISOString(),
      type: type,
      message: message,
      details: details || {}
    };
    window.__IL_AUDIT_LOGS__.push(entry);
    if (type === 'WARN') {
      console.warn('[InteractiveLesson WARN]', message, details);
    } else if (type === 'ERROR') {
      console.error('[InteractiveLesson ERROR]', message, details);
    }
  }

  /* ==========================================================================
     1. AUDIO ENGINE (HTML5 Audio + Web Audio API Synthesizer Fallback)
     ========================================================================== */
  var AudioEngine = (function () {
    var soundOn = true;
    var audioCtx = null;

    function getAudioContext() {
      if (!audioCtx) {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function playTone(freq, duration, type, delay, vol) {
      if (!soundOn) return;
      var ctx = getAudioContext();
      if (!ctx) return;

      var t0 = ctx.currentTime + (delay || 0);
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);

      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(vol || 0.15, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.03);
    }

    function playAudioFile(path, fallbackSynth) {
      if (!soundOn) return;
      if (!path) {
        if (fallbackSynth) fallbackSynth();
        return;
      }

      var audio = new Audio(path);
      var playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch(function (err) {
          recordAuditLog('WARN', 'Audio asset failed, fallback to Synthesizer', {
            path: path,
            error: err.message
          });
          if (fallbackSynth) fallbackSynth();
        });
      }
    }

    return {
      toggleSound: function () {
        soundOn = !soundOn;
        getAudioContext();
        if (soundOn) playTone(560, 0.08, 'sine', 0, 0.12);
        return soundOn;
      },
      isSoundOn: function () { return soundOn; },
      sndClick: function () { playTone(580, 0.06, 'triangle', 0, 0.1); },
      sndSlide: function () {
        playTone(440, 0.08, 'sine', 0, 0.1);
        playTone(660, 0.1, 'sine', 0.04, 0.08);
      },
      sndCardOpen: function () {
        playTone(520, 0.08, 'sine', 0, 0.1);
        playTone(740, 0.1, 'sine', 0.05, 0.09);
      },
      sndRobotChirp: function () {
        playTone(600, 0.06, 'square', 0, 0.08);
        playTone(900, 0.08, 'sine', 0.07, 0.1);
      },
      sndCountNote: function (step) {
        var baseFreqs = [261.6, 293.6, 329.6, 349.2, 392.0, 440.0, 493.8, 523.2];
        var freq = baseFreqs[(step - 1) % baseFreqs.length] || 523.2;
        playTone(freq, 0.15, 'triangle', 0, 0.16);
      },
      sndCorrect: function (audioPath) {
        playAudioFile(audioPath, function () {
          [523, 659, 784].forEach(function (f, i) {
            playTone(f, 0.18, 'triangle', i * 0.09, 0.18);
          });
        });
      },
      sndWrong: function (audioPath) {
        playAudioFile(audioPath, function () {
          playTone(220, 0.25, 'sawtooth', 0, 0.14);
          playTone(180, 0.25, 'sawtooth', 0.06, 0.12);
        });
      },
      sndWin: function (audioPath) {
        playAudioFile(audioPath, function () {
          [523, 659, 784, 1046].forEach(function (f, i) {
            playTone(f, 0.22, 'triangle', i * 0.1, 0.18);
          });
        });
      }
    };
  })();

  /* ==========================================================================
     2. CELEBRATION EFFECTS (CONFETTI GENERATOR)
     ========================================================================== */
  function launchConfetti(targetContainer) {
    var root = targetContainer || document.getElementById('interactive-lesson-root');
    if (!root) return;
    var colors = ['#C1502E', '#3D6A35', '#0284C7', '#E8A93B', '#F59E0B', '#EF4444', '#10B981'];
    for (var i = 0; i < 35; i++) {
      var flake = document.createElement('div');
      flake.className = 'confetti-particle';
      flake.style.left = (Math.random() * 95) + '%';
      flake.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      flake.style.animationDelay = (Math.random() * 0.7) + 's';
      flake.style.animationDuration = (2 + Math.random() * 1.5) + 's';
      root.appendChild(flake);
      (function (el) {
        setTimeout(function () {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 3600);
      })(flake);
    }
  }

  /* ==========================================================================
     3. LESSON RUNTIME STATE & CONTROLLER
     ========================================================================== */
  var LessonEngine = {
    data: null,
    currentIndex: 0,
    score: 0,
    totalActivities: 0,
    dom: {},

    init: function (lessonData) {
      if (!lessonData || !lessonData.slides || lessonData.slides.length === 0) {
        recordAuditLog('ERROR', 'Invalid lesson data provided to init()', lessonData);
        return;
      }
      this.data = lessonData;
      this.currentIndex = 0;
      this.score = 0;
      this.calculateTotalActivities();
      this.cacheDom();
      this.bindEvents();
      this.renderLessonShell();
      this.goToSlide(0);
    },

    calculateTotalActivities: function () {
      var count = 0;
      (this.data.slides || []).forEach(function (s) {
        if (['quiz', 'true_false', 'match_pairs', 'order_sequence', 'fill_blank', 'classify_sorting', 'memory_cards', 'tap_to_count'].indexOf(s.type) !== -1) {
          count++;
        }
      });
      this.totalActivities = Math.max(1, count);
    },

    cacheDom: function () {
      this.dom.root = document.getElementById('interactive-lesson-root');
      this.dom.stage = document.getElementById('il-stage');
      this.dom.dots = document.getElementById('il-dots');
      this.dom.counter = document.getElementById('il-counter');
      this.dom.prevBtn = document.getElementById('il-prev-btn');
      this.dom.nextBtn = document.getElementById('il-next-btn');
      this.dom.soundBtn = document.getElementById('il-sound-btn');
      this.dom.mascotWrap = document.getElementById('il-mascot-wrap');
      this.dom.robertCharacter = document.getElementById('il-robert-character');
      this.dom.mascotBubble = document.getElementById('il-mascot-bubble');
    },

    bindEvents: function () {
      var self = this;
      if (this.dom.prevBtn) {
        this.dom.prevBtn.addEventListener('click', function () { self.prevSlide(); });
      }
      if (this.dom.nextBtn) {
        this.dom.nextBtn.addEventListener('click', function () { self.nextSlide(); });
      }
      if (this.dom.soundBtn) {
        this.dom.soundBtn.addEventListener('click', function () {
          var state = AudioEngine.toggleSound();
          self.updateSoundBtnUI(state);
        });
      }

      // Robert Mascot Interactive Click
      if (this.dom.robertCharacter) {
        this.dom.robertCharacter.addEventListener('click', function () {
          AudioEngine.sndRobotChirp();
          if (self.dom.mascotBubble) {
            self.dom.mascotBubble.style.transform = 'scale(1.08)';
            setTimeout(function () {
              self.dom.mascotBubble.style.transform = '';
            }, 300);
          }
        });
      }

      document.addEventListener('keydown', function (e) {
        if (['INPUT', 'TEXTAREA'].indexOf(e.target.tagName) !== -1) return;
        if (e.key === 'ArrowLeft' || e.key === 'PageDown') self.nextSlide();
        if (e.key === 'ArrowRight' || e.key === 'PageUp') self.prevSlide();
      });
    },

    updateSoundBtnUI: function (isOn) {
      if (!this.dom.soundBtn) return;
      if (isOn) {
        this.dom.soundBtn.innerHTML =
          '<svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
        this.dom.soundBtn.style.opacity = '1';
      } else {
        this.dom.soundBtn.innerHTML =
          '<svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
        this.dom.soundBtn.style.opacity = '0.6';
      }
    },

    addScore: function () {
      this.score++;
    },

    renderLessonShell: function () {
      var self = this;
      this.dom.stage.innerHTML = '';
      this.dom.dots.innerHTML = '';

      this.data.slides.forEach(function (slide, idx) {
        var slideEl = document.createElement('div');
        slideEl.className = 'il-slide';
        slideEl.id = 'il-slide-' + idx;
        slideEl.innerHTML = self.generateSlideHTML(slide, idx);

        self.dom.stage.appendChild(slideEl);
        self.bindSlideInteractivity(slideEl, slide, idx);

        var dot = document.createElement('div');
        dot.className = 'dot' + (idx === 0 ? ' active' : '');
        dot.title = 'شريحة ' + (idx + 1);
        dot.addEventListener('click', function () { self.goToSlide(idx); });
        self.dom.dots.appendChild(dot);
      });
    },

    generateSlideHTML: function (slide, idx) {
      var html = '<div class="slide-header">';
      if (slide.eyebrow) {
        html += '<div class="eyebrow">' + slide.eyebrow + '</div>';
      }
      if (slide.title) {
        html += '<h1 class="title">' + slide.title + '</h1>';
      }
      if (slide.subtitle) {
        html += '<p class="subtitle">' + slide.subtitle + '</p>';
      }
      html += '</div>';

      // 12 Slide Type Renderers with UI/UX Pro Max Architecture
      switch (slide.type) {
        case 'explain': html += this.renderExplain(slide); break;
        case 'interactive_reveal': html += this.renderReveal(slide); break;
        case 'quiz': html += this.renderQuiz(slide); break;
        case 'true_false': html += this.renderTrueFalse(slide); break;
        case 'match_pairs': html += this.renderMatchPairs(slide); break;
        case 'order_sequence': html += this.renderOrderSequence(slide); break;
        case 'fill_blank': html += this.renderFillBlank(slide); break;
        case 'classify_sorting': html += this.renderClassify(slide); break;
        case 'hotspot_explore': html += this.renderHotspot(slide); break;
        case 'memory_cards': html += this.renderMemoryCards(slide); break;
        case 'tap_to_count': html += this.renderTapToCount(slide); break;
        case 'summary': html += this.renderSummary(slide); break;
        default:
          html += '<p style="text-align:center; font-weight:bold; color:var(--clay);">نوع الشريحة قيد التطوير: ' + slide.type + '</p>';
      }
      return html;
    },

    /* 1. Explain: Animated Avatar + Traits with SVG checks + Examples chips */
    renderExplain: function (slide) {
      var animClass = slide.sceneAnimation || 'bounce';
      var mainEmoji = slide.sceneEmoji || (slide.examples && slide.examples[0] ? slide.examples[0].emoji : '🌱');

      var html = '<div class="scene">';
      html += '<div class="animal-avatar ' + animClass + '">' + mainEmoji + '</div>';

      if (slide.traits && slide.traits.length > 0) {
        html += '<div class="traits">';
        slide.traits.forEach(function (trait) {
          html +=
            '<div class="trait">' +
            '<svg class="trait-check-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
            '<span>' + trait + '</span>' +
            '</div>';
        });
        html += '</div>';
      }
      html += '</div>';

      if (slide.examples && slide.examples.length > 0) {
        html += '<div class="examples-row">';
        slide.examples.forEach(function (ex) {
          html +=
            '<div class="ex-chip">' +
            (ex.emoji ? '<span style="font-size:1.3rem;">' + ex.emoji + '</span>' : '') +
            '<span>' + (ex.name || '') + '</span>' +
            '</div>';
        });
        html += '</div>';
      }

      if (slide.revealQuestion && slide.revealAnswer) {
        html +=
          '<div class="reveal-q">' +
          '<div class="q-btn" id="exp-q-btn"><span>' + slide.revealQuestion + '</span></div>' +
          '<div class="q-ans" id="exp-q-ans">' + slide.revealAnswer + '</div>' +
          '</div>';
      }

      return html;
    },

    /* 2. Reveal: 3D tactile chips + challenge box */
    renderReveal: function (slide) {
      var html = '';
      if (slide.groups && slide.groups.length > 0) {
        html += '<div class="group-grid">';
        slide.groups.forEach(function (grp, i) {
          html +=
            '<div class="group-chip" data-idx="' + i + '">' +
            '<span class="chip-ico">' + (grp.emoji || '✨') + '</span>' +
            '<span class="chip-name">' + grp.name + '</span>' +
            '<div class="chip-detail">' + grp.detail + '</div>' +
            '</div>';
        });
        html += '</div>';
      }
      if (slide.reveal) {
        html +=
          '<div class="reveal-q">' +
          '<div class="q-btn"><span>' + (slide.reveal.question || 'اضغط لكشف الإجابة') + '</span></div>' +
          '<div class="q-ans">' + slide.reveal.answer + '</div>' +
          '</div>';
      }
      return html;
    },

    /* 3. Quiz: Game card with tactile option buttons */
    renderQuiz: function (slide) {
      var q = slide.quiz;
      if (!q) return '';
      var html = '<div class="game-card">';
      html += '<div class="game-q">' + (q.emoji ? q.emoji + ' ' : '') + q.question + '</div>';
      html += '<div class="game-options">';
      (q.choices || []).forEach(function (choice) {
        html +=
          '<button class="opt-btn" type="button" data-choice-id="' + choice.id + '" data-is-correct="' + (choice.isCorrect ? 'true' : 'false') + '">' +
          '<span>' + choice.text + '</span>' +
          '<svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"></circle></svg>' +
          '</button>';
      });
      html += '</div>';
      html += '<div class="feedback-msg"></div>';
      html += '</div>';
      return html;
    },

    /* 4. True or False: Statement card with large ergonomic pills */
    renderTrueFalse: function (slide) {
      var tf = slide.trueFalse;
      if (!tf) return '';
      return (
        '<div class="tf-card">' +
        '<div class="tf-statement">' + tf.statement + '</div>' +
        '<div class="tf-actions">' +
        '<button class="tf-btn tf-btn-true" type="button" data-answer="true">' +
        '<svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
        '<span>صح</span>' +
        '</button>' +
        '<button class="tf-btn tf-btn-false" type="button" data-answer="false">' +
        '<svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
        '<span>خطأ</span>' +
        '</button>' +
        '</div>' +
        '<div class="feedback-msg"></div>' +
        '</div>'
      );
    },

    /* 5. Match Pairs: Two-column tactile connector */
    renderMatchPairs: function (slide) {
      var mp = slide.matchPairs;
      if (!mp || !mp.pairs) return '';
      var leftItems = [];
      var rightItems = [];
      mp.pairs.forEach(function (p) {
        leftItems.push({ id: p.id, text: p.leftText, emoji: p.leftEmoji });
        rightItems.push({ id: p.id, text: p.rightText, emoji: p.rightEmoji });
      });

      // Shuffle right items
      rightItems.sort(function () { return 0.5 - Math.random(); });

      var html = '<div class="match-grid">';
      html += '<div class="match-col">';
      leftItems.forEach(function (item) {
        html +=
          '<div class="match-chip" data-match-id="' + item.id + '" data-side="left">' +
          (item.emoji ? '<span style="font-size:1.3rem;">' + item.emoji + '</span>' : '') +
          '<span>' + item.text + '</span>' +
          '</div>';
      });
      html += '</div>';

      html += '<div class="match-col">';
      rightItems.forEach(function (item) {
        html +=
          '<div class="match-chip" data-match-id="' + item.id + '" data-side="right">' +
          (item.emoji ? '<span style="font-size:1.3rem;">' + item.emoji + '</span>' : '') +
          '<span>' + item.text + '</span>' +
          '</div>';
      });
      html += '</div>';
      html += '</div>';
      html += '<div class="feedback-msg"></div>';
      return html;
    },

    /* 6. Order Sequence: Step timeline cards */
    renderOrderSequence: function (slide) {
      var os = slide.orderSequence;
      if (!os || !os.steps) return '';
      var steps = os.steps.slice().sort(function () { return 0.5 - Math.random(); });

      var html = '<div class="order-list">';
      steps.forEach(function (st, idx) {
        html +=
          '<div class="order-card" data-step-id="' + st.id + '" data-correct-order="' + st.order + '">' +
          '<span>' + (st.emoji ? st.emoji + ' ' : '') + st.text + '</span>' +
          '<div class="order-num">' + (idx + 1) + '</div>' +
          '</div>';
      });
      html += '</div>';
      html += '<div class="feedback-msg"></div>';
      return html;
    },

    /* 7. Fill in the Blank: Storybook sentence card & word bank pills */
    renderFillBlank: function (slide) {
      var fb = slide.fillBlank;
      if (!fb) return '';
      var html = '<div class="puzzle-sentence">';
      html += '<span>' + fb.sentenceBefore + '</span> ';
      html += '<span class="puzzle-slot" data-target-answer="' + fb.blankAnswer + '">؟</span> ';
      html += '<span>' + fb.sentenceAfter + '</span>';
      html += '</div>';

      html += '<div class="word-bank">';
      (fb.wordBank || []).forEach(function (w) {
        html += '<button class="word-pill" type="button" data-word="' + w + '">' + w + '</button>';
      });
      html += '</div>';
      html += '<div class="feedback-msg"></div>';
      return html;
    },

    /* 8. Classify & Sorting: Target card + wooden chest 3D buckets */
    renderClassify: function (slide) {
      var cs = slide.classifySorting;
      if (!cs || !cs.items || cs.items.length === 0) return '';
      var firstItem = cs.items[0];

      var html = '<div class="classify-box" data-current-idx="0">';
      html +=
        '<div class="classify-target-card" id="curr-classify-card">' +
        '<div class="target-emoji">' + (firstItem.emoji || '📦') + '</div>' +
        '<div class="target-name">' + firstItem.name + '</div>' +
        '</div>';

      html += '<div class="classify-buckets-row">';
      (cs.buckets || []).forEach(function (b) {
        html +=
          '<div class="bucket-chest" data-bucket-id="' + b.id + '">' +
          '<span class="bucket-ico">' + (b.emoji || '📥') + '</span>' +
          '<span class="bucket-label">' + b.name + '</span>' +
          '</div>';
      });
      html += '</div>';
      html += '<div class="feedback-msg"></div>';
      html += '</div>';
      return html;
    },

    /* 9. Hotspot Explore: Botanical Plant Vector SVG with Pulsing Beacons */
    renderHotspot: function (slide) {
      var hs = slide.hotspot;
      if (!hs || !hs.points) return '';

      var html = '<div class="hotspot-stage">';
      // Scientific Botanical Plant Vector SVG
      html +=
        '<svg class="hotspot-diagram" viewBox="0 0 500 360" preserveAspectRatio="xMidYMid meet">' +
        '<defs>' +
        '  <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">' +
        '    <stop offset="0%" stop-color="#8B5A2B"/>' +
        '    <stop offset="100%" stop-color="#5C3A1E"/>' +
        '  </linearGradient>' +
        '  <linearGradient id="stemGrad" x1="0" y1="0" x2="1" y2="0">' +
        '    <stop offset="0%" stop-color="#3D6A35"/>' +
        '    <stop offset="100%" stop-color="#2D4F27"/>' +
        '  </linearGradient>' +
        '</defs>' +
        '<!-- Soil Base -->' +
        '<rect x="40" y="260" width="420" height="90" rx="16" fill="url(#soilGrad)" opacity="0.95"/>' +
        '<!-- Roots -->' +
        '<path d="M250 260 Q235 295 210 330 M250 260 Q265 295 290 335 M250 275 Q195 290 170 315 M250 285 Q305 305 330 325" stroke="#E8A93B" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
        '<!-- Stem -->' +
        '<path d="M250 260 C250 190 246 150 250 100" stroke="url(#stemGrad)" stroke-width="14" fill="none" stroke-linecap="round"/>' +
        '<!-- Left Leaf -->' +
        '<path d="M248 180 C180 165 140 185 125 215 C160 225 210 215 248 190" fill="#3D6A35" stroke="#2D4F27" stroke-width="2.5"/>' +
        '<!-- Right Leaf -->' +
        '<path d="M250 150 C320 135 360 155 375 185 C340 195 290 185 250 160" fill="#3D6A35" stroke="#2D4F27" stroke-width="2.5"/>' +
        '<!-- Flower Petals -->' +
        '<circle cx="250" cy="90" r="48" fill="#E8A93B" opacity="0.25"/>' +
        '<circle cx="215" cy="72" r="24" fill="#C1502E"/>' +
        '<circle cx="285" cy="72" r="24" fill="#C1502E"/>' +
        '<circle cx="215" cy="108" r="24" fill="#C1502E"/>' +
        '<circle cx="285" cy="108" r="24" fill="#C1502E"/>' +
        '<circle cx="250" cy="52" r="24" fill="#C1502E"/>' +
        '<circle cx="250" cy="128" r="24" fill="#C1502E"/>' +
        '<circle cx="250" cy="90" r="24" fill="#E8A93B"/>' +
        '</svg>';

      // Pulsing Interactive Beacons
      hs.points.forEach(function (pt, i) {
        html +=
          '<button class="hotspot-beacon" type="button" style="top:' + pt.yPercent + '%; left:' + pt.xPercent + '%;" data-idx="' + i + '">' +
          (i + 1) +
          '</button>';
      });

      html += '<div class="hotspot-info-popup"></div>';
      html += '</div>';
      return html;
    },

    /* 10. Memory Cards: 100% Bug-Free 3D Flip System */
    renderMemoryCards: function (slide) {
      var mc = slide.memoryCards;
      if (!mc || !mc.pairs) return '';
      var deck = [];
      mc.pairs.forEach(function (p) {
        deck.push({ matchId: p.id, text: p.itemA.text, emoji: p.itemA.emoji });
        deck.push({ matchId: p.id, text: p.itemB.text, emoji: p.itemB.emoji });
      });
      deck.sort(function () { return 0.5 - Math.random(); });

      var html = '<div class="memory-grid">';
      deck.forEach(function (c) {
        html +=
          '<div class="mem-card" data-match-id="' + c.matchId + '">' +
          '<div class="mem-inner">' +
          '<!-- Front Face (Closed) -->' +
          '<div class="mem-face mem-front">' +
          '<svg class="card-crest-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
          '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>' +
          '</svg>' +
          '</div>' +
          '<!-- Back Face (Revealed) -->' +
          '<div class="mem-face mem-back">' +
          '<span class="card-emoji-box">' + (c.emoji || '✨') + '</span>' +
          '<span class="card-title-text">' + c.text + '</span>' +
          '</div>' +
          '</div>' +
          '</div>';
      });
      html += '</div>';
      html += '<div class="feedback-msg"></div>';
      return html;
    },

    /* 11. Tap to Count: Musical bounce bubbles with count badge */
    renderTapToCount: function (slide) {
      var tc = slide.tapToCount;
      if (!tc) return '';
      var count = tc.targetCount || 5;

      var html = '<div class="count-stage" data-target="' + count + '" data-current="0">';
      html +=
        '<div>' +
        '<span class="count-badge-pill">العدد الحالي: <strong id="curr-count-num">0</strong> من ' + count + ' ' + (tc.itemName || '') + '</span>' +
        '</div>';

      html += '<div class="count-items-grid">';
      for (var i = 0; i < count; i++) {
        html +=
          '<button class="count-bubble" type="button" data-index="' + (i + 1) + '">' +
          (tc.itemEmoji || '🍎') +
          '</button>';
      }
      html += '</div>';
      html += '<div class="feedback-msg"></div>';
      html += '</div>';
      return html;
    },

    /* 12. Summary: Award certificate with glowing SVG stars and confetti */
    renderSummary: function (slide) {
      return (
        '<div class="summary-box">' +
        '<div class="stars-row">' +
        '<svg class="star-svg" id="sum-star-1" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' +
        '<svg class="star-svg" id="sum-star-2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' +
        '<svg class="star-svg" id="sum-star-3" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' +
        '</div>' +
        '<h2 style="font-family:\'Baloo 2\',sans-serif; font-size:1.8rem; font-weight:800; color:var(--ink); margin-bottom:8px;" id="sum-title">أداء رائع ومميز!</h2>' +
        '<p style="font-size:1.05rem; font-weight:700; color:var(--ink-light);" id="sum-desc">لقد أكملت جميع الأنشطة والتمارين بنجاح واستحققت وسام البطل الذكي!</p>' +
        '</div>'
      );
    },

    /* ==========================================================================
       4. INTERACTIVITY DISPATCHER & LOGIC HANDLERS
       ========================================================================== */
    bindSlideInteractivity: function (slideEl, slide, slideIndex) {
      var self = this;

      // 1. Explain Toggle
      var expBtn = slideEl.querySelector('#exp-q-btn');
      if (expBtn) {
        expBtn.addEventListener('click', function () {
          var ans = slideEl.querySelector('#exp-q-ans');
          if (ans) { ans.classList.toggle('show'); AudioEngine.sndClick(); }
        });
      }

      // 2. Reveal Groups & Challenge Question
      slideEl.querySelectorAll('.group-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
          chip.classList.toggle('open');
          AudioEngine.sndCardOpen();
        });
      });
      var revBtn = slideEl.querySelector('.reveal-q .q-btn');
      if (revBtn) {
        revBtn.addEventListener('click', function () {
          var ans = slideEl.querySelector('.reveal-q .q-ans');
          if (ans) { ans.classList.toggle('show'); AudioEngine.sndClick(); }
        });
      }

      // 3. Quiz
      var qBtns = slideEl.querySelectorAll('.opt-btn');
      var fb = slideEl.querySelector('.feedback-msg');
      qBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          qBtns.forEach(function (b) { b.disabled = true; });
          var isCorrect = btn.getAttribute('data-is-correct') === 'true';
          if (isCorrect) {
            btn.classList.add('correct');
            if (fb) { fb.textContent = 'إجابة صحيحة وممتازة! أحسنت يا بطل! 🌟'; fb.style.color = 'var(--leaf)'; }
            self.addScore();
            AudioEngine.sndCorrect();
            launchConfetti(slideEl);
          } else {
            btn.classList.add('wrong');
            qBtns.forEach(function (b) {
              if (b.getAttribute('data-is-correct') === 'true') b.classList.add('correct');
            });
            if (fb) { fb.textContent = 'محاولة طيبة، لاحظ الإجابة الصحيحة المحددة بالأخضر!'; fb.style.color = 'var(--danger)'; }
            AudioEngine.sndWrong();
          }
        });
      });

      // 4. True or False
      var tfBtns = slideEl.querySelectorAll('.tf-btn');
      tfBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          tfBtns.forEach(function (b) { b.disabled = true; });
          var ans = btn.getAttribute('data-answer') === 'true';
          var isTrueTarget = slide.trueFalse ? slide.trueFalse.isTrue : true;
          if (ans === isTrueTarget) {
            btn.style.boxShadow = '0 0 0 4px var(--leaf)';
            if (fb) { fb.textContent = 'رائع جداً! إجابتك صحيحة 🎯'; fb.style.color = 'var(--leaf)'; }
            self.addScore();
            AudioEngine.sndCorrect();
            launchConfetti(slideEl);
          } else {
            btn.style.boxShadow = '0 0 0 4px var(--danger)';
            if (fb) { fb.textContent = 'إجابة غير صحيحة، فكر جيداً في السؤال!'; fb.style.color = 'var(--danger)'; }
            AudioEngine.sndWrong();
          }
        });
      });

      // 5. Match Pairs
      var matchChips = slideEl.querySelectorAll('.match-chip');
      var selectedLeft = null;
      var selectedRight = null;
      var matchedCount = 0;
      var totalPairs = (slide.matchPairs && slide.matchPairs.pairs) ? slide.matchPairs.pairs.length : 0;

      matchChips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          if (chip.classList.contains('matched')) return;
          var side = chip.getAttribute('data-side');

          if (side === 'left') {
            if (selectedLeft) selectedLeft.classList.remove('selected');
            selectedLeft = chip;
            chip.classList.add('selected');
            AudioEngine.sndClick();
          } else {
            if (selectedRight) selectedRight.classList.remove('selected');
            selectedRight = chip;
            chip.classList.add('selected');
            AudioEngine.sndClick();
          }

          if (selectedLeft && selectedRight) {
            var idLeft = selectedLeft.getAttribute('data-match-id');
            var idRight = selectedRight.getAttribute('data-match-id');

            if (idLeft === idRight) {
              selectedLeft.classList.remove('selected');
              selectedRight.classList.remove('selected');
              selectedLeft.classList.add('matched');
              selectedRight.classList.add('matched');
              matchedCount++;
              AudioEngine.sndCorrect();
              selectedLeft = null;
              selectedRight = null;
              if (matchedCount >= totalPairs) {
                self.addScore();
                if (fb) { fb.textContent = 'أحسنت! أكملت كافة التوصيلات بنجاح 👏'; fb.style.color = 'var(--leaf)'; }
                launchConfetti(slideEl);
              }
            } else {
              var leftEl = selectedLeft;
              var rightEl = selectedRight;
              leftEl.classList.add('wrong');
              rightEl.classList.add('wrong');
              AudioEngine.sndWrong();
              setTimeout(function () {
                leftEl.classList.remove('wrong', 'selected');
                rightEl.classList.remove('wrong', 'selected');
              }, 600);
              selectedLeft = null;
              selectedRight = null;
            }
          }
        });
      });

      // 6. Order Sequence
      var orderCards = slideEl.querySelectorAll('.order-card');
      var currentOrderIdx = 1;
      orderCards.forEach(function (card) {
        card.addEventListener('click', function () {
          if (card.classList.contains('correct')) return;
          var correctNum = parseInt(card.getAttribute('data-correct-order'), 10);
          if (correctNum === currentOrderIdx) {
            card.classList.add('correct');
            card.querySelector('.order-num').textContent = '✓';
            currentOrderIdx++;
            AudioEngine.sndCorrect();
            if (currentOrderIdx > orderCards.length) {
              self.addScore();
              if (fb) { fb.textContent = 'ترتيب ممتاز وصحيح 100%! 🌟'; fb.style.color = 'var(--leaf)'; }
              launchConfetti(slideEl);
            }
          } else {
            card.classList.add('wrong');
            AudioEngine.sndWrong();
            setTimeout(function () { card.classList.remove('wrong'); }, 500);
          }
        });
      });

      // 7. Fill in the Blank
      var wordPills = slideEl.querySelectorAll('.word-pill');
      var puzzleSlot = slideEl.querySelector('.puzzle-slot');
      if (puzzleSlot) {
        var correctAns = puzzleSlot.getAttribute('data-target-answer');
        wordPills.forEach(function (pill) {
          pill.addEventListener('click', function () {
            var word = pill.getAttribute('data-word');
            puzzleSlot.textContent = word;
            if (word === correctAns) {
              puzzleSlot.classList.add('filled');
              wordPills.forEach(function (p) { p.disabled = true; });
              if (fb) { fb.textContent = 'إجابة صحيحة! أحسنت التعبير 🌟'; fb.style.color = 'var(--leaf)'; }
              self.addScore();
              AudioEngine.sndCorrect();
              launchConfetti(slideEl);
            } else {
              puzzleSlot.style.borderColor = 'var(--danger)';
              AudioEngine.sndWrong();
              setTimeout(function () {
                puzzleSlot.style.borderColor = '';
                puzzleSlot.textContent = '؟';
              }, 700);
            }
          });
        });
      }

      // 8. Classify & Sorting
      var classifyBox = slideEl.querySelector('.classify-box');
      if (classifyBox && slide.classifySorting) {
        var cItems = slide.classifySorting.items || [];
        var cIdx = 0;
        var cardEl = slideEl.querySelector('#curr-classify-card');
        slideEl.querySelectorAll('.bucket-chest').forEach(function (b) {
          b.addEventListener('click', function () {
            if (cIdx >= cItems.length) return;
            var targetBucket = cItems[cIdx].targetBucketId;
            var clickedBucket = b.getAttribute('data-bucket-id');
            if (targetBucket === clickedBucket) {
              AudioEngine.sndCorrect();
              cIdx++;
              if (cIdx < cItems.length) {
                cardEl.querySelector('.target-emoji').textContent = cItems[cIdx].emoji || '📦';
                cardEl.querySelector('.target-name').textContent = cItems[cIdx].name;
              } else {
                cardEl.innerHTML = '<div style="font-size:2.4rem;">🎉</div><div style="font-weight:800; color:var(--ink);">تم فرز جميع العناصر!</div>';
                self.addScore();
                if (fb) { fb.textContent = 'تصنيف دقيق وممتاز! أحسنت يا بطل! 🌟'; fb.style.color = 'var(--leaf)'; }
                launchConfetti(slideEl);
              }
            } else {
              b.style.borderColor = 'var(--danger)';
              AudioEngine.sndWrong();
              setTimeout(function () { b.style.borderColor = ''; }, 500);
            }
          });
        });
      }

      // 9. Hotspot Explore
      var beacons = slideEl.querySelectorAll('.hotspot-beacon');
      var popup = slideEl.querySelector('.hotspot-info-popup');
      if (beacons && popup && slide.hotspot) {
        beacons.forEach(function (beacon) {
          beacon.addEventListener('click', function () {
            var i = parseInt(beacon.getAttribute('data-idx'), 10);
            var pt = slide.hotspot.points[i];
            popup.innerHTML = '<strong>' + (pt.emoji ? pt.emoji + ' ' : '') + pt.title + ':</strong> ' + pt.detail;
            popup.classList.add('show');
            AudioEngine.sndCardOpen();
          });
        });
      }

      // 10. Memory Cards (True 3D Flip Execution)
      var memCards = slideEl.querySelectorAll('.mem-card');
      var flipped = [];
      var matchedPairs = 0;
      var totalMemoryPairs = (slide.memoryCards && slide.memoryCards.pairs) ? slide.memoryCards.pairs.length : 0;

      memCards.forEach(function (card) {
        card.addEventListener('click', function () {
          if (card.classList.contains('flipped') || card.classList.contains('matched') || flipped.length >= 2) return;
          card.classList.add('flipped');
          flipped.push(card);
          AudioEngine.sndClick();

          if (flipped.length === 2) {
            var id1 = flipped[0].getAttribute('data-match-id');
            var id2 = flipped[1].getAttribute('data-match-id');
            if (id1 === id2) {
              matchedPairs++;
              flipped[0].classList.add('matched');
              flipped[1].classList.add('matched');
              AudioEngine.sndCorrect();
              flipped = [];
              if (matchedPairs >= totalMemoryPairs) {
                self.addScore();
                if (fb) { fb.textContent = 'ذاكرة حديدية خارقة! طابقت كل الكروت 🏆'; fb.style.color = 'var(--leaf)'; }
                launchConfetti(slideEl);
              }
            } else {
              setTimeout(function () {
                flipped.forEach(function (c) { c.classList.remove('flipped'); });
                flipped = [];
                AudioEngine.sndWrong();
              }, 800);
            }
          }
        });
      });

      // 11. Tap to Count
      var countStage = slideEl.querySelector('.count-stage');
      if (countStage) {
        var countBubbles = slideEl.querySelectorAll('.count-bubble');
        var curCount = 0;
        var targetCount = parseInt(countStage.getAttribute('data-target'), 10);
        var numDisplay = slideEl.querySelector('#curr-count-num');

        countBubbles.forEach(function (bubble) {
          bubble.addEventListener('click', function () {
            if (bubble.classList.contains('counted')) return;
            bubble.classList.add('counted');
            curCount++;
            if (numDisplay) numDisplay.textContent = curCount;
            AudioEngine.sndCountNote(curCount);

            if (curCount >= targetCount) {
              self.addScore();
              if (fb) { fb.textContent = 'عد صحيح ومتقن! أحسنت يا عبقري الحساب 🌟'; fb.style.color = 'var(--leaf)'; }
              launchConfetti(slideEl);
            }
          });
        });
      }
    },

    /* ==========================================================================
       5. SLIDE NAVIGATION & MASCOT BUBBLE SYNC
       ========================================================================== */
    goToSlide: function (index) {
      if (!this.data || index < 0 || index >= this.data.slides.length) return;

      var slides = this.dom.stage.querySelectorAll('.il-slide');
      var dots = this.dom.dots.querySelectorAll('.dot');
      var currentSlideData = this.data.slides[index];

      slides.forEach(function (s, i) { s.classList.toggle('active', i === index); });
      dots.forEach(function (d, i) { d.classList.toggle('active', i === index); });

      this.currentIndex = index;

      // Strict LTR Counter to avoid Arabic fraction flipping (e.g. renders "10 / 12", never "12 / 10")
      if (this.dom.counter) {
        this.dom.counter.innerHTML = '<bdi dir="ltr">' + (index + 1) + ' / ' + this.data.slides.length + '</bdi>';
      }
      if (this.dom.prevBtn) this.dom.prevBtn.disabled = index === 0;
      if (this.dom.nextBtn) this.dom.nextBtn.disabled = index === this.data.slides.length - 1;

      // Update Robert Mascot Companion Speech Bubble
      if (this.dom.mascotBubble) {
        if (currentSlideData.mascotTip) {
          this.dom.mascotBubble.textContent = currentSlideData.mascotTip;
        } else {
          this.dom.mascotBubble.textContent = 'أهلاً بك يا بطل! استكشف معنا أسرار هذا الدرس الممتع!';
        }
      }

      // Summary Slide handling
      if (currentSlideData.type === 'summary') {
        this.updateSummarySlide(slides[index]);
        AudioEngine.sndWin();
        launchConfetti(slides[index]);
      } else {
        AudioEngine.sndSlide();
      }
    },

    updateSummarySlide: function (slideEl) {
      var pct = Math.round((this.score / Math.max(1, this.totalActivities)) * 100);
      var s1 = slideEl.querySelector('#sum-star-1');
      var s2 = slideEl.querySelector('#sum-star-2');
      var s3 = slideEl.querySelector('#sum-star-3');

      if (s1) s1.classList.toggle('active', pct >= 30);
      if (s2) s2.classList.toggle('active', pct >= 60);
      if (s3) s3.classList.toggle('active', pct >= 90 || this.score >= this.totalActivities);

      var titleEl = slideEl.querySelector('#sum-title');
      var descEl = slideEl.querySelector('#sum-desc');

      if (titleEl) {
        titleEl.textContent = 'أنجزت ' + this.score + ' من ' + this.totalActivities + ' نشاطاً بنجاح!';
      }
      if (descEl) {
        if (pct >= 85) {
          descEl.textContent = 'أداء أسطوري استثنائي! استحققت وسام البطل الذكي و 3 نجوم بجدارة!';
        } else if (pct >= 50) {
          descEl.textContent = 'أداء رائع جداً! استمر في التميز والإبداع لتصل إلى القمة!';
        } else {
          descEl.textContent = 'محاولة طيبة، راجع الدرس لتكسب جميع النجوم والوسام!';
        }
      }
    },

    nextSlide: function () { this.goToSlide(this.currentIndex + 1); },
    prevSlide: function () { this.goToSlide(this.currentIndex - 1); }
  };

  /* ==========================================================================
     6. PUBLIC API & AUTO-BOOTSTRAP
     ========================================================================== */
  window.InteractiveLesson = {
    load: function (lessonJson) { LessonEngine.init(lessonJson); },
    audio: AudioEngine,
    getAuditLogs: function () { return window.__IL_AUDIT_LOGS__; }
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (window.__INITIAL_LESSON_DATA__) {
      LessonEngine.init(window.__INITIAL_LESSON_DATA__);
    } else {
      fetch('lesson.json')
        .then(function (res) { return res.json(); })
        .then(function (data) { LessonEngine.init(data); })
        .catch(function (err) {
          recordAuditLog('INFO', 'Direct fetch of lesson.json skipped (normal in file:/// preview mode)', { error: err.message });
        });
    }
  });
})();
