/**
 * Interactive Lesson Runtime Engine (Isolated IIFE)
 * Comprehensive 12-Slide Educational Interactive System
 * Zero external dependencies. Full Web Audio API synthesizer fallback.
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
     1. AUDIO SYSTEM (HTML5 Audio + Web Audio API Synthesizer Fallback)
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
     2. LESSON RUNTIME STATE & CONTROLLER
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
      this.dom.lessonTitle = document.getElementById('il-lesson-title');
      this.dom.stage = document.getElementById('il-stage');
      this.dom.dots = document.getElementById('il-dots');
      this.dom.counter = document.getElementById('il-counter');
      this.dom.prevBtn = document.getElementById('il-prev-btn');
      this.dom.nextBtn = document.getElementById('il-next-btn');
      this.dom.soundBtn = document.getElementById('il-sound-btn');
      this.dom.subjectBadge = document.getElementById('il-subject-badge');
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

      document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') self.nextSlide();
        if (e.key === 'ArrowRight') self.prevSlide();
      });
    },

    updateSoundBtnUI: function (isOn) {
      if (!this.dom.soundBtn) return;
      if (isOn) {
        this.dom.soundBtn.innerHTML =
          '<svg class="il-svg-icon" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
      } else {
        this.dom.soundBtn.innerHTML =
          '<svg class="il-svg-icon" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
      }
    },

    addScore: function () {
      this.score++;
    },

    renderLessonShell: function () {
      var subjectLabels = {
        science: 'مادة العلوم 🔬',
        math: 'مادة الرياضيات 📐',
        arabic: 'لغتي الجميلة 📖',
        studies: 'الدراسات الاجتماعية 🌍',
        english: 'اللغة الإنجليزية 🔤',
        islamic: 'الدراسات الإسلامية 🕌'
      };

      if (this.dom.subjectBadge) {
        this.dom.subjectBadge.textContent = subjectLabels[this.data.subjectId] || 'درس تفاعلي';
      }

      if (this.dom.lessonTitle) {
        this.dom.lessonTitle.textContent = this.data.title || 'درس تفاعلي';
      }

      var self = this;
      this.dom.stage.innerHTML = '';
      this.dom.dots.innerHTML = '';

      this.data.slides.forEach(function (slide, idx) {
        var slideEl = document.createElement('div');
        slideEl.className = 'il-slide';
        slideEl.id = 'il-slide-' + idx;
        slideEl.innerHTML = self.generateSlideHTML(slide);

        self.dom.stage.appendChild(slideEl);
        self.bindSlideInteractivity(slideEl, slide, idx);

        var dot = document.createElement('div');
        dot.className = 'il-dot' + (idx === 0 ? ' active' : '');
        dot.addEventListener('click', function () { self.goToSlide(idx); });
        self.dom.dots.appendChild(dot);
      });
    },

    generateSlideHTML: function (slide) {
      var html = '';
      if (slide.eyebrow) {
        html += '<div class="il-eyebrow">' + slide.eyebrow + '</div>';
      }
      if (slide.title) {
        html += '<h2 class="il-slide-title">' + slide.title + '</h2>';
      }
      if (slide.subtitle) {
        html += '<p class="il-slide-subtitle">' + slide.subtitle + '</p>';
      }
      if (slide.mascotTip) {
        html +=
          '<div class="il-mascot-tip">' +
          '<div class="il-mascot-badge">' +
          '<svg class="il-svg-icon" viewBox="0 0 24 24"><path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>' +
          '</div>' +
          '<span>' + slide.mascotTip + '</span>' +
          '</div>';
      }

      // 12 Slide Type Renderers
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
          html += '<p>نوع الشريحة قيد التطوير: ' + slide.type + '</p>';
      }
      return html;
    },

    /* 1. Explain */
    renderExplain: function (slide) {
      var html = '';
      if (slide.traits && slide.traits.length > 0) {
        html += '<div class="il-traits-list">';
        slide.traits.forEach(function (trait) {
          html +=
            '<div class="il-trait-card">' +
            '<div class="il-check-icon-wrap">' +
            '<svg class="il-svg-icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
            '</div>' +
            '<span>' + trait + '</span>' +
            '</div>';
        });
        html += '</div>';
      }
      if (slide.examples && slide.examples.length > 0) {
        html += '<div class="il-examples-grid">';
        slide.examples.forEach(function (ex) {
          html +=
            '<div class="il-example-chip">' +
            '<span>' + (ex.emoji || '') + '</span>' +
            '<span>' + (ex.name || '') + '</span>' +
            '</div>';
        });
        html += '</div>';
      }
      return html;
    },

    /* 2. Reveal */
    renderReveal: function (slide) {
      var html = '';
      if (slide.groups && slide.groups.length > 0) {
        html += '<div class="il-groups-grid">';
        slide.groups.forEach(function (grp) {
          html +=
            '<div class="il-group-card" data-group-id="' + grp.id + '">' +
            '<div class="il-card-icon">' + (grp.emoji || '✨') + '</div>' +
            '<div class="il-card-title">' + grp.name + '</div>' +
            '<div class="il-card-detail">' + grp.detail + '</div>' +
            '</div>';
        });
        html += '</div>';
      }
      if (slide.reveal) {
        html +=
          '<div class="il-reveal-box">' +
          '<button class="il-reveal-btn" type="button">' +
          '<svg class="il-svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>' +
          '<span>' + (slide.reveal.question || 'اضغط لكشف الإجابة') + '</span>' +
          '</button>' +
          '<div class="il-reveal-answer">' + slide.reveal.answer + '</div>' +
          '</div>';
      }
      return html;
    },

    /* 3. Quiz */
    renderQuiz: function (slide) {
      var q = slide.quiz;
      if (!q) return '';
      var html = '<div class="il-quiz-box">';
      html += '<h3 class="il-quiz-question">' + (q.emoji ? q.emoji + ' ' : '') + q.question + '</h3>';
      html += '<div class="il-quiz-options">';
      (q.choices || []).forEach(function (choice) {
        html +=
          '<button class="il-quiz-btn" type="button" data-choice-id="' + choice.id + '" data-is-correct="' + (choice.isCorrect ? 'true' : 'false') + '">' +
          '<span>' + choice.text + '</span>' +
          '<svg class="il-svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle></svg>' +
          '</button>';
      });
      html += '</div>';
      html += '<div class="il-feedback-msg"></div>';
      html += '</div>';
      return html;
    },

    /* 4. True or False */
    renderTrueFalse: function (slide) {
      var tf = slide.trueFalse;
      if (!tf) return '';
      return (
        '<div class="il-tf-card">' +
        '<div class="il-tf-statement">' + tf.statement + '</div>' +
        '<div class="il-tf-actions">' +
        '<button class="il-tf-btn il-tf-btn-true" type="button" data-answer="true">' +
        '<svg class="il-svg-icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
        '<span>صح</span>' +
        '</button>' +
        '<button class="il-tf-btn il-tf-btn-false" type="button" data-answer="false">' +
        '<svg class="il-svg-icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
        '<span>خطأ</span>' +
        '</button>' +
        '</div>' +
        '<div class="il-feedback-msg"></div>' +
        '</div>'
      );
    },

    /* 5. Match Pairs */
    renderMatchPairs: function (slide) {
      var mp = slide.matchPairs;
      if (!mp || !mp.pairs) return '';
      var leftItems = [];
      var rightItems = [];
      mp.pairs.forEach(function (p) {
        leftItems.push({ id: p.id, text: p.leftText, emoji: p.leftEmoji });
        rightItems.push({ id: p.id, text: p.rightText, emoji: p.rightEmoji });
      });

      // Simple shuffle right items
      rightItems.sort(function () { return 0.5 - Math.random(); });

      var html = '<div class="il-match-container">';
      html += '<div class="il-match-col il-match-col-left">';
      leftItems.forEach(function (item) {
        html += '<div class="il-match-card" data-match-id="' + item.id + '" data-side="left">' +
                (item.emoji ? '<span>' + item.emoji + '</span>' : '') +
                '<span>' + item.text + '</span></div>';
      });
      html += '</div>';

      html += '<div class="il-match-col il-match-col-right">';
      rightItems.forEach(function (item) {
        html += '<div class="il-match-card" data-match-id="' + item.id + '" data-side="right">' +
                (item.emoji ? '<span>' + item.emoji + '</span>' : '') +
                '<span>' + item.text + '</span></div>';
      });
      html += '</div>';
      html += '</div>';
      html += '<div class="il-feedback-msg"></div>';
      return html;
    },

    /* 6. Order Sequence */
    renderOrderSequence: function (slide) {
      var os = slide.orderSequence;
      if (!os || !os.steps) return '';
      var steps = os.steps.slice().sort(function () { return 0.5 - Math.random(); });
      var html = '<div class="il-order-container">';
      steps.forEach(function (st, idx) {
        html +=
          '<div class="il-order-item" data-step-id="' + st.id + '" data-correct-order="' + st.order + '">' +
          '<div style="display: flex; align-items: center; gap: 12px;">' +
          '<div class="il-order-badge">' + (idx + 1) + '</div>' +
          '<span>' + (st.emoji ? st.emoji + ' ' : '') + st.text + '</span>' +
          '</div>' +
          '<svg class="il-svg-icon" viewBox="0 0 24 24"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline></svg>' +
          '</div>';
      });
      html += '</div>';
      html += '<div class="il-feedback-msg"></div>';
      return html;
    },

    /* 7. Fill in the Blank */
    renderFillBlank: function (slide) {
      var fb = slide.fillBlank;
      if (!fb) return '';
      var html = '<div class="il-blank-box">';
      html +=
        '<div class="il-blank-sentence">' +
        fb.sentenceBefore + ' ' +
        '<span class="il-blank-slot" data-target-answer="' + fb.blankAnswer + '">؟</span> ' +
        fb.sentenceAfter +
        '</div>';
      html += '<div class="il-word-bank">';
      (fb.wordBank || []).forEach(function (w) {
        html += '<button class="il-word-chip" type="button" data-word="' + w + '">' + w + '</button>';
      });
      html += '</div>';
      html += '<div class="il-feedback-msg"></div>';
      html += '</div>';
      return html;
    },

    /* 8. Classify & Sorting */
    renderClassify: function (slide) {
      var cs = slide.classifySorting;
      if (!cs || !cs.items || cs.items.length === 0) return '';
      var firstItem = cs.items[0];
      var html = '<div class="il-classify-stage" data-current-idx="0">';
      html +=
        '<div class="il-current-item-card" id="il-curr-classify-card">' +
        '<div class="item-emoji">' + (firstItem.emoji || '📦') + '</div>' +
        '<div class="item-name">' + firstItem.name + '</div>' +
        '</div>';
      html += '<div class="il-classify-buckets">';
      (cs.buckets || []).forEach(function (b) {
        html +=
          '<div class="il-bucket-card" data-bucket-id="' + b.id + '">' +
          '<div class="il-bucket-emoji">' + (b.emoji || '📥') + '</div>' +
          '<div class="il-bucket-title">' + b.name + '</div>' +
          '</div>';
      });
      html += '</div>';
      html += '<div class="il-feedback-msg"></div>';
      html += '</div>';
      return html;
    },

    /* 9. Hotspot Explore */
    renderHotspot: function (slide) {
      var hs = slide.hotspot;
      if (!hs || !hs.points) return '';
      var html = '<div class="il-hotspot-container">';
      html += '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 5rem; background: var(--il-paper-light);">';
      html += hs.fallbackGraphic || '🌿';
      html += '</div>';

      hs.points.forEach(function (pt, i) {
        html +=
          '<div class="il-hotspot-pin" style="top:' + pt.yPercent + '%; left:' + pt.xPercent + '%;" data-idx="' + i + '">' +
          (i + 1) +
          '</div>';
      });

      html += '<div class="il-hotspot-modal" id="il-hotspot-modal"></div>';
      html += '</div>';
      return html;
    },

    /* 10. Memory Cards */
    renderMemoryCards: function (slide) {
      var mc = slide.memoryCards;
      if (!mc || !mc.pairs) return '';
      var deck = [];
      mc.pairs.forEach(function (p) {
        deck.push({ matchId: p.id, text: p.itemA.text, emoji: p.itemA.emoji });
        deck.push({ matchId: p.id, text: p.itemB.text, emoji: p.itemB.emoji });
      });
      deck.sort(function () { return 0.5 - Math.random(); });

      var html = '<div class="il-memory-grid">';
      deck.forEach(function (c) {
        html +=
          '<div class="il-memory-card" data-match-id="' + c.matchId + '">' +
          '<div class="il-memory-inner">' +
          '<div class="il-memory-front">' +
          '<svg class="il-svg-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' +
          '</div>' +
          '<div class="il-memory-back">' +
          (c.emoji ? '<div style="font-size: 1.8rem;">' + c.emoji + '</div>' : '') +
          '<span style="font-size: 0.85rem; font-weight: 800;">' + c.text + '</span>' +
          '</div>' +
          '</div>' +
          '</div>';
      });
      html += '</div>';
      html += '<div class="il-feedback-msg"></div>';
      return html;
    },

    /* 11. Tap to Count */
    renderTapToCount: function (slide) {
      var tc = slide.tapToCount;
      if (!tc) return '';
      var count = tc.targetCount || 5;
      var html = '<div class="il-count-stage" data-target="' + count + '" data-current="0">';
      html +=
        '<div class="il-count-banner">' +
        '<span>العدد الحالي:</span>' +
        '<span class="il-count-number" id="il-count-num">0</span>' +
        '<span>من ' + count + '</span>' +
        '</div>';
      html += '<div class="il-count-grid">';
      for (var i = 0; i < count; i++) {
        html += '<div class="il-count-item" data-index="' + (i + 1) + '">' + (tc.itemEmoji || '🍎') + '</div>';
      }
      html += '</div>';
      html += '<div class="il-feedback-msg"></div>';
      html += '</div>';
      return html;
    },

    /* 12. Summary */
    renderSummary: function (slide) {
      return (
        '<div class="il-summary-card">' +
        '<div class="il-stars-row">' +
        '<svg class="il-star-icon" id="il-star-1" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' +
        '<svg class="il-star-icon" id="il-star-2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' +
        '<svg class="il-star-icon" id="il-star-3" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' +
        '</div>' +
        '<h3 style="font-size: 1.4rem; font-weight: 800; color: var(--il-ink); margin-bottom: 8px;" id="il-summary-score-line">أداء رائع!</h3>' +
        '<p style="font-size: 1.05rem; font-weight: 700; color: var(--il-ink-muted);" id="il-summary-score-desc">تم إنجاز كافة أنشطة وتحديات هذا الدرس بنجاح!</p>' +
        '</div>'
      );
    },

    /* Interactivity Dispatcher */
    bindSlideInteractivity: function (slideEl, slide, slideIndex) {
      var self = this;

      // 1. Reveal
      slideEl.querySelectorAll('.il-group-card').forEach(function (card) {
        card.addEventListener('click', function () {
          card.classList.toggle('open');
          AudioEngine.sndCardOpen();
        });
      });
      var revBtn = slideEl.querySelector('.il-reveal-btn');
      if (revBtn) {
        revBtn.addEventListener('click', function () {
          var ans = slideEl.querySelector('.il-reveal-answer');
          if (ans) { ans.classList.toggle('show'); AudioEngine.sndClick(); }
        });
      }

      // 2. Quiz
      var qBtns = slideEl.querySelectorAll('.il-quiz-btn');
      var fb = slideEl.querySelector('.il-feedback-msg');
      qBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          qBtns.forEach(function (b) { b.disabled = true; });
          var isCorrect = btn.getAttribute('data-is-correct') === 'true';
          if (isCorrect) {
            btn.classList.add('correct');
            if (fb) { fb.textContent = 'إجابة صحيحة وممتازة! أحسنت يا بطل! 🌟'; fb.style.color = 'var(--il-leaf)'; }
            self.addScore();
            AudioEngine.sndCorrect();
          } else {
            btn.classList.add('wrong');
            qBtns.forEach(function (b) {
              if (b.getAttribute('data-is-correct') === 'true') b.classList.add('correct');
            });
            if (fb) { fb.textContent = 'محاولة طيبة، لاحظ الإجابة الصحيحة المحددة بالأخضر!'; fb.style.color = 'var(--il-danger)'; }
            AudioEngine.sndWrong();
          }
        });
      });

      // 3. True / False
      var tfBtns = slideEl.querySelectorAll('.il-tf-btn');
      tfBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          tfBtns.forEach(function (b) { b.disabled = true; });
          var ans = btn.getAttribute('data-answer') === 'true';
          var isTrueTarget = slide.trueFalse ? slide.trueFalse.isTrue : true;
          if (ans === isTrueTarget) {
            btn.style.boxShadow = '0 0 0 4px var(--il-leaf)';
            if (fb) { fb.textContent = 'رائع جداً! إجابتك صحيحة 🎯'; fb.style.color = 'var(--il-leaf)'; }
            self.addScore();
            AudioEngine.sndCorrect();
          } else {
            btn.style.boxShadow = '0 0 0 4px var(--il-danger)';
            if (fb) { fb.textContent = 'إجابة غير صحيحة، راجع الشرح جيداً!'; fb.style.color = 'var(--il-danger)'; }
            AudioEngine.sndWrong();
          }
        });
      });

      // 4. Match Pairs (Tap-to-Match)
      var matchCards = slideEl.querySelectorAll('.il-match-card');
      var selectedLeft = null;
      var selectedRight = null;
      var matchedCount = 0;
      var totalPairs = (slide.matchPairs && slide.matchPairs.pairs) ? slide.matchPairs.pairs.length : 0;

      matchCards.forEach(function (card) {
        card.addEventListener('click', function () {
          if (card.classList.contains('matched')) return;
          var side = card.getAttribute('data-side');

          if (side === 'left') {
            if (selectedLeft) selectedLeft.classList.remove('selected');
            selectedLeft = card;
            card.classList.add('selected');
            AudioEngine.sndClick();
          } else {
            if (selectedRight) selectedRight.classList.remove('selected');
            selectedRight = card;
            card.classList.add('selected');
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
                if (fb) { fb.textContent = 'أحسنت! أكملت كافة التوصيلات بنجاح 👏'; fb.style.color = 'var(--il-leaf)'; }
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

      // 5. Order Sequence
      var orderItems = slideEl.querySelectorAll('.il-order-item');
      var currentOrderIdx = 1;
      orderItems.forEach(function (item) {
        item.addEventListener('click', function () {
          if (item.classList.contains('correct')) return;
          var correctNum = parseInt(item.getAttribute('data-correct-order'), 10);
          if (correctNum === currentOrderIdx) {
            item.classList.add('correct');
            item.querySelector('.il-order-badge').textContent = '✓';
            currentOrderIdx++;
            AudioEngine.sndCorrect();
            if (currentOrderIdx > orderItems.length) {
              self.addScore();
              if (fb) { fb.textContent = 'ترتيب ممتاز وصحيح 100%! 🌟'; fb.style.color = 'var(--il-leaf)'; }
            }
          } else {
            item.style.borderColor = 'var(--il-danger)';
            AudioEngine.sndWrong();
            setTimeout(function () { item.style.borderColor = ''; }, 500);
          }
        });
      });

      // 6. Fill Blank
      var wordChips = slideEl.querySelectorAll('.il-word-chip');
      var blankSlot = slideEl.querySelector('.il-blank-slot');
      if (blankSlot) {
        var correctAns = blankSlot.getAttribute('data-target-answer');
        wordChips.forEach(function (chip) {
          chip.addEventListener('click', function () {
            var word = chip.getAttribute('data-word');
            blankSlot.textContent = word;
            if (word === correctAns) {
              blankSlot.classList.add('filled');
              wordChips.forEach(function (c) { c.disabled = true; });
              if (fb) { fb.textContent = 'إجابة صحيحة! أحسنت التعبير 🌟'; fb.style.color = 'var(--il-leaf)'; }
              self.addScore();
              AudioEngine.sndCorrect();
            } else {
              blankSlot.style.borderColor = 'var(--il-danger)';
              AudioEngine.sndWrong();
              setTimeout(function () {
                blankSlot.style.borderColor = '';
                blankSlot.textContent = '؟';
              }, 700);
            }
          });
        });
      }

      // 7. Classify & Sorting
      var classifyStage = slideEl.querySelector('.il-classify-stage');
      if (classifyStage && slide.classifySorting) {
        var cItems = slide.classifySorting.items || [];
        var cIdx = 0;
        var cardEl = slideEl.querySelector('#il-curr-classify-card');
        slideEl.querySelectorAll('.il-bucket-card').forEach(function (b) {
          b.addEventListener('click', function () {
            if (cIdx >= cItems.length) return;
            var targetBucket = cItems[cIdx].targetBucketId;
            var clickedBucket = b.getAttribute('data-bucket-id');
            if (targetBucket === clickedBucket) {
              AudioEngine.sndCorrect();
              cIdx++;
              if (cIdx < cItems.length) {
                cardEl.querySelector('.item-emoji').textContent = cItems[cIdx].emoji || '📦';
                cardEl.querySelector('.item-name').textContent = cItems[cIdx].name;
              } else {
                cardEl.innerHTML = '<div style="font-size:2.5rem;">🎉</div><div style="font-weight:800;">تم فرز كل العناصر!</div>';
                self.addScore();
                if (fb) { fb.textContent = 'تصنيف دقيق وممتاز! أحسنت يا بطل! 🌟'; fb.style.color = 'var(--il-leaf)'; }
              }
            } else {
              b.style.borderColor = 'var(--il-danger)';
              AudioEngine.sndWrong();
              setTimeout(function () { b.style.borderColor = ''; }, 500);
            }
          });
        });
      }

      // 8. Hotspot
      var pins = slideEl.querySelectorAll('.il-hotspot-pin');
      var modal = slideEl.querySelector('#il-hotspot-modal');
      if (pins && modal && slide.hotspot) {
        pins.forEach(function (pin) {
          pin.addEventListener('click', function () {
            var i = parseInt(pin.getAttribute('data-idx'), 10);
            var pt = slide.hotspot.points[i];
            modal.innerHTML = '<strong>' + (pt.emoji ? pt.emoji + ' ' : '') + pt.title + ':</strong> ' + pt.detail;
            modal.classList.add('show');
            AudioEngine.sndCardOpen();
          });
        });
      }

      // 9. Memory Cards
      var memCards = slideEl.querySelectorAll('.il-memory-card');
      var flipped = [];
      var matchedPairs = 0;
      var totalMemoryPairs = (slide.memoryCards && slide.memoryCards.pairs) ? slide.memoryCards.pairs.length : 0;

      memCards.forEach(function (card) {
        card.addEventListener('click', function () {
          if (card.classList.contains('flipped') || flipped.length >= 2) return;
          card.classList.add('flipped');
          flipped.push(card);
          AudioEngine.sndClick();

          if (flipped.length === 2) {
            var id1 = flipped[0].getAttribute('data-match-id');
            var id2 = flipped[1].getAttribute('data-match-id');
            if (id1 === id2) {
              matchedPairs++;
              AudioEngine.sndCorrect();
              flipped = [];
              if (matchedPairs >= totalMemoryPairs) {
                self.addScore();
                if (fb) { fb.textContent = 'ذاكرة حديدية خارقة! طابقت كل الكروت 🏆'; fb.style.color = 'var(--il-leaf)'; }
              }
            } else {
              setTimeout(function () {
                flipped.forEach(function (c) { c.classList.remove('flipped'); });
                flipped = [];
                AudioEngine.sndWrong();
              }, 900);
            }
          }
        });
      });

      // 10. Tap to Count
      var countStage = slideEl.querySelector('.il-count-stage');
      if (countStage) {
        var countItems = slideEl.querySelectorAll('.il-count-item');
        var curCount = 0;
        var targetCount = parseInt(countStage.getAttribute('data-target'), 10);
        var numDisplay = slideEl.querySelector('#il-count-num');

        countItems.forEach(function (item) {
          item.addEventListener('click', function () {
            if (item.classList.contains('counted')) return;
            item.classList.add('counted');
            curCount++;
            if (numDisplay) numDisplay.textContent = curCount;
            AudioEngine.sndCountNote(curCount);

            if (curCount >= targetCount) {
              self.addScore();
              if (fb) { fb.textContent = 'عد صحيح ومتقن! أحسنت يا عبقري الحساب 🌟'; fb.style.color = 'var(--il-leaf)'; }
            }
          });
        });
      }
    },

    goToSlide: function (index) {
      if (!this.data || index < 0 || index >= this.data.slides.length) return;

      var slides = this.dom.stage.querySelectorAll('.il-slide');
      var dots = this.dom.dots.querySelectorAll('.il-dot');

      slides.forEach(function (s, i) { s.classList.toggle('active', i === index); });
      dots.forEach(function (d, i) { d.classList.toggle('active', i === index); });

      this.currentIndex = index;
      if (this.dom.counter) {
        this.dom.counter.textContent = (index + 1) + ' / ' + this.data.slides.length;
      }
      if (this.dom.prevBtn) this.dom.prevBtn.disabled = index === 0;
      if (this.dom.nextBtn) this.dom.nextBtn.disabled = index === this.data.slides.length - 1;

      // Summary Slide handling
      if (this.data.slides[index].type === 'summary') {
        this.updateSummarySlide(slides[index]);
        AudioEngine.sndWin();
      } else {
        AudioEngine.sndSlide();
      }
    },

    updateSummarySlide: function (slideEl) {
      var pct = Math.round((this.score / Math.max(1, this.totalActivities)) * 100);
      var s1 = slideEl.querySelector('#il-star-1');
      var s2 = slideEl.querySelector('#il-star-2');
      var s3 = slideEl.querySelector('#il-star-3');

      if (s1) s1.classList.toggle('active', pct >= 30);
      if (s2) s2.classList.toggle('active', pct >= 60);
      if (s3) s3.classList.toggle('active', pct >= 90 || this.score >= this.totalActivities);

      var scoreLine = slideEl.querySelector('#il-summary-score-line');
      var scoreDesc = slideEl.querySelector('#il-summary-score-desc');

      if (scoreLine) {
        scoreLine.textContent = 'أنجزت ' + this.score + ' من ' + this.totalActivities + ' نشاطاً بنجاح!';
      }
      if (scoreDesc) {
        if (pct >= 85) {
          scoreDesc.textContent = 'أداء أسطوري استثنائي! استحققت 3 نجوم بجدارة 🌟🌟🌟';
        } else if (pct >= 50) {
          scoreDesc.textContent = 'أداء رائع جداً! استمر في التميز والإبداع 🌟🌟';
        } else {
          scoreDesc.textContent = 'محاولة جيدة، راجع الدرس لتكسب جميع النجوم! 🌟';
        }
      }
    },

    nextSlide: function () { this.goToSlide(this.currentIndex + 1); },
    prevSlide: function () { this.goToSlide(this.currentIndex - 1); }
  };

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
