/**
 * Interactive Lesson Runtime Engine (Isolated IIFE)
 * Zero external dependencies.
 * Full Web Audio API synthesizer fallback with audit logging.
 */
(function () {
  'use strict';

  // Global audit log container for future Admin Ingestion review
  window.__IL_AUDIT_LOGS__ = window.__IL_AUDIT_LOGS__ || [];

  function recordAuditLog(type, message, details) {
    var entry = {
      timestamp: new Date().toISOString(),
      type: type, // 'INFO' | 'WARN' | 'ERROR'
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
          recordAuditLog('WARN', 'Asset audio failed to play, switching to Synthesizer Fallback', {
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
        if (soundOn) {
          playTone(560, 0.08, 'sine', 0, 0.12);
        }
        return soundOn;
      },
      isSoundOn: function () {
        return soundOn;
      },
      sndClick: function () {
        playTone(580, 0.06, 'triangle', 0, 0.1);
      },
      sndSlide: function () {
        playTone(440, 0.09, 'sine', 0, 0.1);
        playTone(660, 0.11, 'sine', 0.04, 0.08);
      },
      sndCardOpen: function () {
        playTone(520, 0.08, 'sine', 0, 0.1);
        playTone(740, 0.1, 'sine', 0.05, 0.09);
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
    dom: {},

    init: function (lessonData) {
      if (!lessonData || !lessonData.slides || lessonData.slides.length === 0) {
        recordAuditLog('ERROR', 'Invalid lesson data provided to init()', lessonData);
        return;
      }
      this.data = lessonData;
      this.currentIndex = 0;
      this.cacheDom();
      this.bindEvents();
      this.renderLessonShell();
      this.goToSlide(0);
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
    },

    bindEvents: function () {
      var self = this;
      if (this.dom.prevBtn) {
        this.dom.prevBtn.addEventListener('click', function () {
          self.prevSlide();
        });
      }
      if (this.dom.nextBtn) {
        this.dom.nextBtn.addEventListener('click', function () {
          self.nextSlide();
        });
      }
      if (this.dom.soundBtn) {
        this.dom.soundBtn.addEventListener('click', function () {
          var state = AudioEngine.toggleSound();
          self.updateSoundBtnUI(state);
        });
      }

      // Keyboard navigation (RTL: ArrowLeft moves Next, ArrowRight moves Prev)
      document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') self.nextSlide();
        if (e.key === 'ArrowRight') self.prevSlide();
      });
    },

    updateSoundBtnUI: function (isOn) {
      if (!this.dom.soundBtn) return;
      var path = this.dom.soundBtn.querySelector('path');
      if (isOn) {
        this.dom.soundBtn.innerHTML =
          '<svg class="il-svg-icon" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
      } else {
        this.dom.soundBtn.innerHTML =
          '<svg class="il-svg-icon" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
      }
    },

    renderLessonShell: function () {
      if (this.dom.lessonTitle) {
        this.dom.lessonTitle.textContent = this.data.title || 'درس تفاعلي';
      }

      // Render Stage Slides
      var self = this;
      this.dom.stage.innerHTML = '';
      this.dom.dots.innerHTML = '';

      this.data.slides.forEach(function (slide, idx) {
        var slideEl = document.createElement('div');
        slideEl.className = 'il-slide';
        slideEl.id = 'il-slide-' + idx;
        slideEl.innerHTML = self.generateSlideHTML(slide);

        self.dom.stage.appendChild(slideEl);
        self.bindSlideInteractivity(slideEl, slide);

        // Dot
        var dot = document.createElement('div');
        dot.className = 'il-dot' + (idx === 0 ? ' active' : '');
        dot.addEventListener('click', function () {
          self.goToSlide(idx);
        });
        self.dom.dots.appendChild(dot);
      });
    },

    generateSlideHTML: function (slide) {
      var html = '';

      // Eyebrow badge
      if (slide.eyebrow) {
        html += '<div class="il-eyebrow">' + slide.eyebrow + '</div>';
      }

      // Title & Subtitle
      if (slide.title) {
        html += '<h2 class="il-slide-title">' + slide.title + '</h2>';
      }
      if (slide.subtitle) {
        html += '<p class="il-slide-subtitle">' + slide.subtitle + '</p>';
      }

      // Mascot Tip
      if (slide.mascotTip) {
        html +=
          '<div class="il-mascot-tip">' +
          '<div class="il-mascot-badge">' +
          '<svg class="il-svg-icon" viewBox="0 0 24 24"><path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>' +
          '</div>' +
          '<span>' + slide.mascotTip + '</span>' +
          '</div>';
      }

      // Type-specific bodies
      if (slide.type === 'explain') {
        html += this.generateExplainBody(slide);
      } else if (slide.type === 'interactive_reveal') {
        html += this.generateRevealBody(slide);
      } else if (slide.type === 'quiz') {
        html += this.generateQuizBody(slide);
      } else if (slide.type === 'summary') {
        html += this.generateSummaryBody(slide);
      }

      return html;
    },

    generateExplainBody: function (slide) {
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

    generateRevealBody: function (slide) {
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

    generateQuizBody: function (slide) {
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
      html += '<div class="il-quiz-feedback"></div>';
      html += '</div>';
      return html;
    },

    generateSummaryBody: function (slide) {
      return (
        '<div class="il-summary-card">' +
        '<div class="il-stars-row">' +
        '<svg class="il-star-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' +
        '<svg class="il-star-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' +
        '<svg class="il-star-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' +
        '</div>' +
        '<p style="font-size: 1.15rem; font-weight: 700; color: var(--il-ink-muted); margin-top: 10px;">تم تسجيل إنجازك في هذا الدرس بنجاح!</p>' +
        '</div>'
      );
    },

    bindSlideInteractivity: function (slideEl, slide) {
      // Interactive cards reveal
      var cards = slideEl.querySelectorAll('.il-group-card');
      cards.forEach(function (card) {
        card.addEventListener('click', function () {
          card.classList.toggle('open');
          AudioEngine.sndCardOpen();
        });
      });

      // Reveal button
      var revealBtn = slideEl.querySelector('.il-reveal-btn');
      if (revealBtn) {
        var answer = slideEl.querySelector('.il-reveal-answer');
        revealBtn.addEventListener('click', function () {
          if (answer) {
            answer.classList.toggle('show');
            AudioEngine.sndClick();
          }
        });
      }

      // Quiz options
      var quizButtons = slideEl.querySelectorAll('.il-quiz-btn');
      var feedback = slideEl.querySelector('.il-quiz-feedback');
      quizButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          quizButtons.forEach(function (b) { b.disabled = true; });
          var isCorrect = btn.getAttribute('data-is-correct') === 'true';
          if (isCorrect) {
            btn.classList.add('correct');
            if (feedback) {
              feedback.textContent = 'إجابة صحيحة وممتازة! أحسنت يا بطل! 🌟';
              feedback.style.color = 'var(--il-leaf)';
            }
            AudioEngine.sndCorrect();
          } else {
            btn.classList.add('wrong');
            // Highlight the correct one
            quizButtons.forEach(function (b) {
              if (b.getAttribute('data-is-correct') === 'true') {
                b.classList.add('correct');
              }
            });
            if (feedback) {
              feedback.textContent = 'محاولة طيبة، لاحظ الإجابة الصحيحة المحددة بالأخضر!';
              feedback.style.color = 'var(--il-danger)';
            }
            AudioEngine.sndWrong();
          }
        });
      });
    },

    goToSlide: function (index) {
      if (!this.data || index < 0 || index >= this.data.slides.length) return;

      var slides = this.dom.stage.querySelectorAll('.il-slide');
      var dots = this.dom.dots.querySelectorAll('.il-dot');

      slides.forEach(function (s, i) {
        s.classList.toggle('active', i === index);
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === index);
      });

      this.currentIndex = index;
      if (this.dom.counter) {
        this.dom.counter.textContent = (index + 1) + ' / ' + this.data.slides.length;
      }

      // Button states
      if (this.dom.prevBtn) {
        this.dom.prevBtn.disabled = index === 0;
      }
      if (this.dom.nextBtn) {
        this.dom.nextBtn.disabled = index === this.data.slides.length - 1;
      }

      // Trigger win sound on summary slide
      if (this.data.slides[index].type === 'summary') {
        AudioEngine.sndWin();
      } else {
        AudioEngine.sndSlide();
      }
    },

    nextSlide: function () {
      this.goToSlide(this.currentIndex + 1);
    },

    prevSlide: function () {
      this.goToSlide(this.currentIndex - 1);
    }
  };

  // Expose engine instance globally for external controllers / preview
  window.InteractiveLesson = {
    load: function (lessonJson) {
      LessonEngine.init(lessonJson);
    },
    audio: AudioEngine,
    getAuditLogs: function () {
      return window.__IL_AUDIT_LOGS__;
    }
  };

  // Auto-init if template/lesson.json is loaded via script tag or inline
  document.addEventListener('DOMContentLoaded', function () {
    if (window.__INITIAL_LESSON_DATA__) {
      LessonEngine.init(window.__INITIAL_LESSON_DATA__);
    } else {
      // Attempt to fetch local lesson.json (works in web server environment)
      fetch('lesson.json')
        .then(function (res) { return res.json(); })
        .then(function (data) { LessonEngine.init(data); })
        .catch(function (err) {
          recordAuditLog('INFO', 'Direct fetch of lesson.json skipped or blocked (normal in file:/// preview mode)', {
            error: err.message
          });
        });
    }
  });
})();
