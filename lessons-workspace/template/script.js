/**
 * Interactive Lesson Runtime Engine (Isolated IIFE)
 * Warm Paper & Cardboard Edition + Universal Drag & Drop System
 * Featuring Mascot Faseeh, Stitch-Border Cards, and Dual Touch/Mouse Interaction.
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
    var root = targetContainer || document.getElementById('interactive-lesson-root') || document.body;
    var colors = ['#C1502E', '#4F7942', '#3E92B0', '#E8A93B', '#1B3B36', '#EF4444'];
    for (var i = 0; i < 30; i++) {
      var flake = document.createElement('div');
      flake.className = 'confetti-particle';
      flake.style.left = (Math.random() * 95) + '%';
      flake.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      flake.style.animationDelay = (Math.random() * 0.6) + 's';
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
     3. UNIVERSAL DRAG & DROP ENGINE (TOUCH + MOUSE + TAP-TO-PLACE FALLBACK)
     ========================================================================== */
  var DragDropEngine = {
    selectedItem: null,

    makeDraggable: function (element, options) {
      // options: {
      //   zoneSelector: '.drop-zone',
      //   onDrop: function(draggedEl, targetZone) {}
      // }
      var isDragging = false;
      var startX = 0;
      var startY = 0;
      var origTransform = '';
      var activeZone = null;
      var self = this;

      element.classList.add('draggable-item');

      function onPointerDown(e) {
        // Only primary click/touch
        if (e.button !== undefined && e.button !== 0) return;
        startX = e.clientX;
        startY = e.clientY;
        origTransform = element.style.transform || '';
        isDragging = false;

        element.setPointerCapture(e.pointerId);
        element.addEventListener('pointermove', onPointerMove);
        element.addEventListener('pointerup', onPointerUp);
        element.addEventListener('pointercancel', onPointerCancel);
      }

      function onPointerMove(e) {
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;

        if (!isDragging && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
          isDragging = true;
          element.classList.add('is-dragging');
          // Clear any tap selection
          if (self.selectedItem) {
            self.selectedItem.classList.remove('selected-for-drop');
            self.selectedItem = null;
          }
        }

        if (isDragging) {
          element.style.transform = 'translate3d(' + dx + 'px, ' + dy + 'px, 0) scale(1.08) rotate(3deg)';

          // Find zone under pointer
          element.style.pointerEvents = 'none';
          var elemBelow = document.elementFromPoint(e.clientX, e.clientY);
          element.style.pointerEvents = '';

          var zone = elemBelow ? elemBelow.closest(options.zoneSelector) : null;
          if (activeZone && activeZone !== zone) {
            activeZone.classList.remove('drag-over');
          }
          if (zone) {
            zone.classList.add('drag-over');
            activeZone = zone;
          } else {
            activeZone = null;
          }
        }
      }

      function onPointerUp(e) {
        element.removeEventListener('pointermove', onPointerMove);
        element.removeEventListener('pointerup', onPointerUp);
        element.removeEventListener('pointercancel', onPointerCancel);
        try { element.releasePointerCapture(e.pointerId); } catch (err) {}

        if (isDragging) {
          element.classList.remove('is-dragging');
          element.style.transform = origTransform;

          if (activeZone) {
            activeZone.classList.remove('drag-over');
            if (options.onDrop) {
              options.onDrop(element, activeZone);
            }
            activeZone = null;
          }
        } else {
          // Tap-to-select fallback for touch/small screens
          self.handleTapSelect(element, options);
        }
      }

      function onPointerCancel() {
        element.classList.remove('is-dragging');
        element.style.transform = origTransform;
        if (activeZone) activeZone.classList.remove('drag-over');
        activeZone = null;
      }

      element.addEventListener('pointerdown', onPointerDown);
    },

    handleTapSelect: function (element, options) {
      var self = this;
      if (this.selectedItem === element) {
        element.classList.remove('selected-for-drop');
        this.selectedItem = null;
        return;
      }

      if (this.selectedItem) {
        this.selectedItem.classList.remove('selected-for-drop');
      }

      this.selectedItem = element;
      element.classList.add('selected-for-drop');
      AudioEngine.sndClick();

      // Ensure drop zones listen for tap-to-place
      var slide = element.closest('.il-slide') || document;
      slide.querySelectorAll(options.zoneSelector).forEach(function (zone) {
        if (!zone.__tapPlaceBound) {
          zone.__tapPlaceBound = true;
          zone.addEventListener('click', function () {
            if (self.selectedItem) {
              var item = self.selectedItem;
              item.classList.remove('selected-for-drop');
              self.selectedItem = null;
              if (options.onDrop) {
                options.onDrop(item, zone);
              }
            }
          });
        }
      });
    }
  };

  /* ==========================================================================
     4. LESSON RUNTIME STATE & CONTROLLER
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
      this.dom.mascotChar = document.getElementById('il-faseeh-character');
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
          var isNowOn = AudioEngine.toggleSound();
          self.updateSoundBtnUI(isNowOn);
        });
      }

      // Mascot Interactive Click
      if (this.dom.mascotChar) {
        this.dom.mascotChar.addEventListener('click', function (e) {
          e.stopPropagation();
          AudioEngine.sndRobotChirp();
          if (self.dom.mascotBubble && self.dom.mascotBubble.classList.contains('bubble-visible')) {
            self.hideMascotBubble();
          } else {
            var curSlide = (self.data && self.data.slides && self.data.slides[self.currentSlide]) || {};
            var tip = curSlide.mascotTip || self.getFallbackTipForSlide(curSlide);
            self.setMascotBubble(tip || 'أنا معك خطوة بخطوة! استكشف واستمتع بالدرس 💡', true);
          }
        });
      }

      // Keyboard arrow navigation
      document.addEventListener('keydown', function (e) {
        if (['INPUT', 'TEXTAREA'].indexOf(e.target.tagName) !== -1) return;
        if (e.key === 'ArrowLeft' || e.key === 'PageDown') self.nextSlide();
        if (e.key === 'ArrowRight' || e.key === 'PageUp') self.prevSlide();
      });
    },

    updateSoundBtnUI: function (isOn) {
      if (!this.dom.soundBtn) return;
      if (isOn) {
        this.dom.soundBtn.style.background = 'var(--sky)';
        this.dom.soundBtn.style.opacity = '1';
        this.dom.soundBtn.innerHTML =
          '<svg class="sound-nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:22px; height:22px;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
        this.dom.soundBtn.title = 'الصوت مفعّل (اضغط للكتم)';
      } else {
        this.dom.soundBtn.style.background = '#6B7280';
        this.dom.soundBtn.style.opacity = '0.6';
        this.dom.soundBtn.innerHTML =
          '<svg class="sound-nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:22px; height:22px;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
        this.dom.soundBtn.title = 'الصوت مكتوم (اضغط للتفعيل)';
      }
    },

    getFallbackTipForSlide: function (slide) {
      if (!slide) return 'أهلًا بكم! أنا فَصيح المُستَكشِف 🧭 هيا نكتشف أسرار هذا الدرس معًا!';
      switch (slide.type) {
        case 'explain': return 'اقرأ الشرح بتركيز يا بطل لتفهم فكرة الدرس الأساسية! 💡';
        case 'interactive_reveal': return 'اضغط على البطاقات لكشف الأسرار والمعلومات المخفية! 🔍';
        case 'quiz': return 'تأمل السؤال جيداً واختر الإجابة الصحيحة! 🌟';
        case 'true_false': return 'هل العبارة صحيحة أم خاطئة؟ فكر في معلوماتك العلمية! 🤔';
        case 'match_pairs': return 'وصّل كل كائن مع مأواه وبيئته المناسبة! 🏡';
        case 'order_sequence': return 'رتّب خطوات النمو بالترتيب العلمي الصحيح! 🌱';
        case 'fill_blank': return 'اسحب الكلمة المناسبة من بنك الكلمات وضعها في الفراغ! ✏️';
        case 'classify_sorting': return 'صنّف العناصر التالية في الصندوق المناسب بدقة! 📦';
        case 'hotspot_explore': return 'اضغط على الأزرار النباضة لتستكشف أجزاء النبتة! 🪴';
        case 'memory_cards': return 'اقلب البطاقات وطابق كل حيوان مع صغيره يا صاحب الذاكرة القوية! 🧠';
        case 'tap_to_count': return 'المس حبات التفاح واحدة تلو الأخرى واستمع لنغمات العد! 🍎';
        case 'summary': return 'مبروك يا بطل! لقد أتممت الدرس بنجاح وجمعت كل النجوم! 🏆';
        default: return 'أهلًا بكم! أنا فَصيح المُستَكشِف 🧭 هيا نكتشف أسرار هذا الدرس معًا!';
      }
    },

    setMascotBubble: function (textHtml, isCelebrating) {
      var self = this;
      if (this.dom.mascotBubble) {
        this.dom.mascotBubble.innerHTML = textHtml;
        this.dom.mascotBubble.classList.add('bubble-visible');
        if (this.dom.mascotWrap) this.dom.mascotWrap.classList.add('toast-active');
        this.dom.mascotBubble.style.transform = 'scale(1.05)';
        var b = this.dom.mascotBubble;
        setTimeout(function () { b.style.transform = ''; }, 220);

        if (this._bubbleTimer) clearTimeout(this._bubbleTimer);
        this._bubbleTimer = setTimeout(function () {
          self.hideMascotBubble();
        }, 4500);
      }
      if (this.dom.mascotChar) {
        if (isCelebrating) {
          this.dom.mascotChar.classList.add('celebrating');
          var c = this.dom.mascotChar;
          setTimeout(function () { c.classList.remove('celebrating'); }, 2000);
        } else {
          this.dom.mascotChar.classList.remove('celebrating');
        }
      }
    },

    hideMascotBubble: function () {
      if (this.dom.mascotBubble) this.dom.mascotBubble.classList.remove('bubble-visible');
      if (this.dom.mascotWrap) this.dom.mascotWrap.classList.remove('toast-active');
      if (this._bubbleTimer) {
        clearTimeout(this._bubbleTimer);
        this._bubbleTimer = null;
      }
    },

    addScore: function () {
      this.score++;
    },

    renderLessonShell: function () {
      var self = this;
      this.dom.stage.innerHTML = '';
      if (this.dom.dots) this.dom.dots.innerHTML = '';

      this.data.slides.forEach(function (slide, idx) {
        var slideEl = document.createElement('div');
        slideEl.className = 'slide il-slide';
        slideEl.id = 'il-slide-' + idx;
        slideEl.innerHTML = self.generateSlideHTML(slide, idx);

        self.dom.stage.appendChild(slideEl);
        self.bindSlideInteractivity(slideEl, slide, idx);

        if (self.dom.dots) {
          var dot = document.createElement('div');
          dot.className = 'dot' + (idx === 0 ? ' active' : '');
          dot.title = 'شريحة ' + (idx + 1);
          dot.addEventListener('click', function () { self.goToSlide(idx); });
          self.dom.dots.appendChild(dot);
        }
      });
    },

    generateSlideHTML: function (slide, idx) {
      var html = '';
      if (slide.eyebrow) {
        html += '<div class="eyebrow">' + slide.eyebrow + '</div>';
      }
      if (slide.title) {
        html += '<h1 class="title">' + slide.title + '</h1>';
      }
      if (slide.subtitle) {
        html += '<p class="subtitle">' + slide.subtitle + '</p>';
      }

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

    /* 1. Explain: Concept Cards with Stitch-Border & Stamps */
    renderExplain: function (slide) {
      var html = '';
      var themes = [
        {
          key: 'theme-water',
          stamp: '<svg class="concept-stamp-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>',
          label: 'الماء العذب',
          color: 'var(--sky)'
        },
        {
          key: 'theme-air',
          stamp: '<svg class="concept-stamp-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>',
          label: 'الهواء النقي',
          color: 'var(--leaf)'
        },
        {
          key: 'theme-food',
          stamp: '<svg class="concept-stamp-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-9"/><path d="M12 13c0-4.418 3.582-8 8-8 0 4.418-3.582 8-8 8z"/><path d="M12 9C8.686 9 6 6.314 6 3c3.314 0 6 2.686 6 6z"/></svg>',
          label: 'الغذاء والمأوى',
          color: 'var(--clay)'
        }
      ];

      var examples = (slide.examples && slide.examples.length > 0) ? slide.examples : [
        { name: 'الكائنات البحرية تحتاج الماء' },
        { name: 'الحيوان يحتاج الغذاء' },
        { name: 'النبات يحتاج الضوء' }
      ];

      if (slide.traits && slide.traits.length > 0) {
        html += '<div class="concept-cards-grid">';
        slide.traits.forEach(function (trait, i) {
          var t = themes[i % themes.length];
          var ex = examples[i % examples.length];
          var parts = trait.split(':');
          var title = parts.length > 1 ? parts[0] : t.label;
          var desc = parts.length > 1 ? parts.slice(1).join(':') : trait;

          html +=
            '<div class="card stitch-border concept-card ' + t.key + '">' +
            '<div class="stamp" style="color:' + t.color + '">' + t.stamp + '</div>' +
            '<h3 class="concept-card-title">' + title + '</h3>' +
            '<p class="concept-card-desc">' + desc + '</p>' +
            '<div class="concept-card-example"><span><svg class="inline-tag-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-8"/><path d="M12 14c0-3.5 3-6 7-6 0 3.5-3 6-7 6z"/></svg> مثال:</span> <span>' + ex.name + '</span></div>' +
            '</div>';
        });
        html += '</div>';
      }
      return html;
    },

    /* 2. Interactive Reveal: Tactile Groups */
    renderReveal: function (slide) {
      var html = '';
      if (slide.groups && slide.groups.length > 0) {
        html += '<div class="group-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px,1fr)); gap:14px; width:100%; max-width:780px;">';
        slide.groups.forEach(function (grp, i) {
          html +=
            '<div class="card group-chip" data-idx="' + i + '" style="cursor:pointer; text-align:center;">' +
            '<div style="font-size:2.4rem; margin-bottom:6px;">' + (grp.emoji || '✨') + '</div>' +
            '<h3 style="font-size:1.1rem; color:var(--ink);">' + grp.name + '</h3>' +
            '<div class="chip-detail" style="font-size:0.85rem; color:#40564F; margin-top:6px; display:none;">' + grp.detail + '</div>' +
            '</div>';
        });
        html += '</div>';
      }
      if (slide.reveal) {
        html +=
          '<div class="card reveal-q" style="margin-top:14px; cursor:pointer; text-align:center; border:2px solid var(--clay); width:100%; max-width:640px;">' +
          '<div class="qtext" style="color:var(--clay); font-weight:800; font-family:\'Baloo 2\';">' + (slide.reveal.question || 'اضغط لكشف الإجابة') + '</div>' +
          '<div class="atext" style="margin-top:8px; color:var(--ink); display:none;">' + slide.reveal.answer + '</div>' +
          '</div>';
      }
      return html;
    },

    /* 3. Quiz: Game Card */
    renderQuiz: function (slide) {
      var q = slide.quiz;
      if (!q) return '';
      var html = '<div class="card game-card">';
      html += '<div class="game-q">' + (q.emoji ? q.emoji + ' ' : '') + q.question + '</div>';
      html += '<div class="game-options-grid">';
      (q.choices || []).forEach(function (choice, i) {
        html +=
          '<button class="quiz-opt-btn" type="button" data-choice-id="' + choice.id + '" data-is-correct="' + (choice.isCorrect ? 'true' : 'false') + '">' +
          choice.text +
          '</button>';
      });
      html += '</div>';
      html += '<div class="feedback-msg"></div>';
      html += '</div>';
      return html;
    },

    /* 4. True or False */
    renderTrueFalse: function (slide) {
      var tf = slide.trueFalse;
      if (!tf) return '';
      return (
        '<div class="card game-card">' +
        '<div class="game-q">' + tf.statement + '</div>' +
        '<div class="game-options-grid" style="max-width:380px; margin:0 auto;">' +
        '<button class="quiz-opt-btn tf-btn" type="button" data-answer="true" style="background:var(--leaf); font-size:1.15rem; display:inline-flex; align-items:center; justify-content:center; gap:8px;">' +
        '  <svg class="opt-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
        '  <span>صح</span>' +
        '</button>' +
        '<button class="quiz-opt-btn tf-btn" type="button" data-answer="false" style="background:var(--clay); font-size:1.15rem; display:inline-flex; align-items:center; justify-content:center; gap:8px;">' +
        '  <svg class="opt-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
        '  <span>خطأ</span>' +
        '</button>' +
        '</div>' +
        '<div class="feedback-msg"></div>' +
        '</div>'
      );
    },

    /* 5. Match Pairs: Drag & Drop Enabled */
    renderMatchPairs: function (slide) {
      var mp = slide.matchPairs;
      if (!mp || !mp.pairs) return '';
      var leftItems = [];
      var rightItems = [];
      mp.pairs.forEach(function (p) {
        leftItems.push({ id: p.id, text: p.leftText, emoji: p.leftEmoji });
        rightItems.push({ id: p.id, text: p.rightText, emoji: p.rightEmoji });
      });
      rightItems.sort(function () { return 0.5 - Math.random(); });

      var html = '<div class="match-pairs-wrap">';
      html += '<div class="match-col" style="display:flex; flex-direction:column; gap:10px;">';
      leftItems.forEach(function (item) {
        html +=
          '<div class="match-card drag-match-item" data-match-id="' + item.id + '">' +
          (item.emoji ? '<span style="font-size:1.4rem;">' + item.emoji + '</span>' : '') +
          '<span>' + item.text + '</span>' +
          '</div>';
      });
      html += '</div>';

      html += '<div class="match-col" style="display:flex; flex-direction:column; gap:10px;">';
      rightItems.forEach(function (item) {
        html +=
          '<div class="match-card drop-zone drop-match-target" data-match-id="' + item.id + '">' +
          (item.emoji ? '<span style="font-size:1.4rem;">' + item.emoji + '</span>' : '') +
          '<span>' + item.text + '</span>' +
          '</div>';
      });
      html += '</div>';
      html += '</div>';
      html += '<div class="feedback-msg"></div>';
      return html;
    },

    /* 6. Order Sequence: Drag & Drop Slots */
    renderOrderSequence: function (slide) {
      var os = slide.orderSequence;
      if (!os || !os.steps) return '';
      var steps = os.steps.slice().sort(function () { return 0.5 - Math.random(); });

      var html = '<div style="width:100%; max-width:760px; display:flex; flex-direction:column; align-items:center; gap:14px;">';
      html += '<div class="order-tray" style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">';
      steps.forEach(function (st) {
        html +=
          '<div class="card drag-order-item" data-step-id="' + st.id + '" data-order="' + st.order + '" style="padding:10px 18px; cursor:grab; font-weight:800;">' +
          (st.emoji ? st.emoji + ' ' : '') + st.text +
          '</div>';
      });
      html += '</div>';

      html += '<div class="order-slots-row" style="display:grid; grid-template-columns:repeat(' + steps.length + ', 1fr); gap:10px; width:100%;">';
      for (var i = 1; i <= steps.length; i++) {
        html +=
          '<div class="card stitch-border drop-zone drop-order-slot" data-slot-order="' + i + '" style="min-height:70px; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center;">' +
          '<span style="font-family:\'Baloo 2\'; font-weight:900; color:var(--clay); font-size:1.2rem;">' + i + '</span>' +
          '<div class="slot-content"></div>' +
          '</div>';
      }
      html += '</div>';
      html += '<div class="feedback-msg"></div>';
      html += '</div>';
      return html;
    },

    /* 7. Fill in the Blank: Drag Word Pill into Slot */
    renderFillBlank: function (slide) {
      var fb = slide.fillBlank;
      if (!fb) return '';
      var html = '<div style="width:100%; max-width:720px; display:flex; flex-direction:column; align-items:center;">';
      html += '<div class="puzzle-sentence-box">';
      html += '<span>' + fb.sentenceBefore + '</span> ';
      html += '<span class="drop-slot drop-zone" data-target-answer="' + fb.blankAnswer + '">اسحب الكلمة هنا</span> ';
      html += '<span>' + fb.sentenceAfter + '</span>';
      html += '</div>';

      html += '<div class="words-bank-tray">';
      (fb.wordBank || []).forEach(function (w) {
        html += '<div class="word-drag-pill" data-word="' + w + '">' + w + '</div>';
      });
      html += '</div>';
      html += '<div class="feedback-msg"></div>';
      html += '</div>';
      return html;
    },

    /* 8. Classify & Sorting: Drag Items into Buckets */
    renderClassify: function (slide) {
      var cs = slide.classifySorting;
      if (!cs || !cs.items || cs.items.length === 0) return '';

      var html = '<div class="classify-drag-wrap">';
      // Top Draggable Items Tray
      html += '<div class="classify-tray" id="classify-tray">';
      cs.items.forEach(function (item) {
        html +=
          '<div class="drag-item-chip" data-item-id="' + item.id + '" data-target-bucket="' + item.targetBucketId + '">' +
          '<span>' + (item.emoji || '📦') + '</span> ' +
          '<span>' + item.name + '</span>' +
          '</div>';
      });
      html += '</div>';

      // Drop Target Buckets Row
      html += '<div class="drop-buckets-row">';
      (cs.buckets || []).forEach(function (b) {
        html +=
          '<div class="card stitch-border drop-zone drop-bucket" data-bucket-id="' + b.id + '">' +
          '<div class="drop-bucket-title">' + (b.emoji ? b.emoji + ' ' : '') + b.name + '</div>' +
          '<div class="bucket-items-list"></div>' +
          '</div>';
      });
      html += '</div>';
      html += '<div class="feedback-msg"></div>';
      html += '</div>';
      return html;
    },

    /* 9. Hotspot Explore */
    renderHotspot: function (slide) {
      var hs = slide.hotspot;
      if (!hs || !hs.points) return '';
      var html = '<div class="hotspot-diagram-card">';

      // Canvas with rich SVG Plant illustration
      html += '<div class="hotspot-canvas-wrap">';
      html += '<svg class="hotspot-plant-svg" viewBox="0 0 600 270" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">';
      html += '<defs>';
      html += '  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E8F4F8"/><stop offset="100%" stop-color="#D7EFE0"/></linearGradient>';
      html += '  <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#A0724C"/><stop offset="100%" stop-color="#5E3725"/></linearGradient>';
      html += '  <linearGradient id="stemGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#4CAF50"/><stop offset="100%" stop-color="#2E7D32"/></linearGradient>';
      html += '  <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FFF176"/><stop offset="100%" stop-color="#F57F17"/></radialGradient>';
      html += '</defs>';

      // Sun in the corner
      html += '<circle cx="530" cy="45" r="28" fill="url(#sunGrad)"/>';
      html += '<path d="M530,8 L530,14 M530,76 L530,82 M493,45 L499,45 M561,45 L567,45 M504,19 L508,23 M552,67 L556,71 M504,71 L508,67 M552,23 L556,19" stroke="#F57F17" stroke-width="3" stroke-linecap="round"/>';

      // Soil ground layer (bottom 38%)
      html += '<path d="M0,165 Q150,160 300,165 T600,165 L600,270 L0,270 Z" fill="url(#soilGrad)"/>';
      html += '<path d="M0,165 Q150,160 300,165 T600,165" stroke="#3E2723" stroke-width="3.5" fill="none"/>';
      // Soil texture dots
      html += '<circle cx="120" cy="200" r="3" fill="#D7CCC8" opacity="0.4"/>';
      html += '<circle cx="210" cy="235" r="4" fill="#D7CCC8" opacity="0.3"/>';
      html += '<circle cx="420" cy="210" r="3.5" fill="#D7CCC8" opacity="0.4"/>';
      html += '<circle cx="500" cy="245" r="2.5" fill="#D7CCC8" opacity="0.3"/>';

      // Roots network (Underground)
      html += '<g stroke="#EFEBE9" stroke-linecap="round" fill="none">';
      html += '  <path d="M300,165 Q300,195 295,235" stroke="#FF7043" stroke-width="8"/>';
      html += '  <path d="M298,180 Q250,195 210,215" stroke="#EFEBE9" stroke-width="3.5"/>';
      html += '  <path d="M300,190 Q345,205 385,220" stroke="#EFEBE9" stroke-width="3.5"/>';
      html += '  <path d="M296,210 Q265,225 240,245" stroke="#EFEBE9" stroke-width="2.5"/>';
      html += '  <path d="M296,220 Q330,235 355,250" stroke="#EFEBE9" stroke-width="2.5"/>';
      html += '  <path d="M230,205 Q215,220 200,230" stroke="#EFEBE9" stroke-width="1.8"/>';
      html += '  <path d="M365,212 Q385,228 405,236" stroke="#EFEBE9" stroke-width="1.8"/>';
      html += '</g>';

      // Green Stem (Above ground)
      html += '<path d="M300,165 Q296,110 300,68" stroke="url(#stemGrad)" stroke-width="11" stroke-linecap="round" fill="none"/>';

      // Leaves
      html += '<g transform="translate(300, 130) rotate(-22)">';
      html += '  <path d="M0,0 Q-55,-35 -95,-15 Q-70,25 0,0" fill="#43A047" stroke="#1B5E20" stroke-width="2"/>';
      html += '  <path d="M0,0 Q-45,-12 -88,-13" stroke="#2E7D32" stroke-width="2" fill="none"/>';
      html += '</g>';
      html += '<g transform="translate(300, 105) rotate(18)">';
      html += '  <path d="M0,0 Q55,-35 95,-15 Q70,25 0,0" fill="#66BB6A" stroke="#1B5E20" stroke-width="2"/>';
      html += '  <path d="M0,0 Q45,-12 88,-13" stroke="#2E7D32" stroke-width="2" fill="none"/>';
      html += '</g>';

      // Blooming Flower at top
      html += '<g transform="translate(300, 60)">';
      html += '  <circle cx="0" cy="-22" r="14" fill="#F06292" stroke="#C2185B" stroke-width="2"/>';
      html += '  <circle cx="21" cy="-7" r="14" fill="#F06292" stroke="#C2185B" stroke-width="2"/>';
      html += '  <circle cx="13" cy="18" r="14" fill="#F06292" stroke="#C2185B" stroke-width="2"/>';
      html += '  <circle cx="-13" cy="18" r="14" fill="#F06292" stroke="#C2185B" stroke-width="2"/>';
      html += '  <circle cx="-21" cy="-7" r="14" fill="#F06292" stroke="#C2185B" stroke-width="2"/>';
      html += '  <circle cx="0" cy="0" r="16" fill="#FDD835" stroke="#F57F17" stroke-width="2.5"/>';
      html += '  <circle cx="-4" cy="-4" r="3" fill="#FFF" opacity="0.6"/>';
      html += '</g>';

      html += '</svg>';

      // Hotspot Buttons positioned on coordinates
      hs.points.forEach(function (pt, idx) {
        var topVal = (pt.yPercent !== undefined) ? pt.yPercent + '%' : (pt.top || '50%');
        var leftVal = (pt.xPercent !== undefined) ? pt.xPercent + '%' : (pt.left || '50%');
        html +=
          '<button class="hotspot-pin" type="button" data-idx="' + idx + '" style="top:' + topVal + '; left:' + leftVal + ';" title="' + pt.title + '">' +
          '<span class="pin-radar"></span>' +
          '<span style="font-size:1.1rem;">' + (pt.emoji || '📍') + '</span>' +
          '<span>' + pt.title + '</span>' +
          '</button>';
      });

      html += '</div>'; // close .hotspot-canvas-wrap

      // Hotspot detail info box below the diagram
      html +=
        '<div class="hotspot-detail-box" id="hotspot-detail-box">' +
        '<div class="hotspot-detail-icon">' +
        '  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--leaf)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-9"/><path d="M12 13c0-4.418 3.582-8 8-8 0 4.418-3.582 8-8 8z"/><path d="M12 9C8.686 9 6 6.314 6 3c3.314 0 6 2.686 6 6z"/></svg>' +
        '</div>' +
        '<div class="hotspot-detail-text">' +
        '<div class="hotspot-detail-title">استكشف أجزاء النبتة</div>' +
        '<div class="hotspot-detail-desc">اضغط على أي زر من الأزرار النباضة بالأعلى لتكتشف وظيفة هذا الجزء وسرّه العلمي!</div>' +
        '</div>' +
        '</div>';

      html += '</div>'; // close .hotspot-diagram-card
      return html;
    },

    /* 10. Memory Cards */
    renderMemoryCards: function (slide) {
      var mc = slide.memoryCards;
      if (!mc || !mc.pairs) return '';
      var cards = [];
      mc.pairs.forEach(function (p, pIdx) {
        var matchId = p.id || ('pair_' + pIdx);

        // Safe extraction of Item A
        var aObj = p.itemA || p.item1 || p.left || p;
        var aEmoji = (p.itemA && p.itemA.emoji) || p.leftEmoji || p.emoji || (typeof aObj === 'object' ? aObj.emoji || aObj.icon : '') || '🦁';
        var aText = (p.itemA && (p.itemA.text || p.itemA.name)) || p.leftText || p.name || p.text || (typeof aObj === 'object' ? aObj.text || aObj.name : '') || 'حيوان';

        // Safe extraction of Item B
        var bObj = p.itemB || p.item2 || p.right || p;
        var bEmoji = (p.itemB && p.itemB.emoji) || p.rightEmoji || p.matchEmoji || (typeof bObj === 'object' ? bObj.emoji || bObj.icon : '') || aEmoji;
        var bText = (p.itemB && (p.itemB.text || p.itemB.name)) || p.rightText || p.matchName || (typeof bObj === 'object' ? bObj.text || bObj.name : '') || 'صغيره';

        cards.push({ matchId: matchId, emoji: aEmoji, name: aText });
        cards.push({ matchId: matchId, emoji: bEmoji, name: bText });
      });

      cards.sort(function () { return 0.5 - Math.random(); });

      var html = '<div class="memory-cards-grid">';
      cards.forEach(function (c, idx) {
        html +=
          '<div class="mem-card" data-idx="' + idx + '" data-match-id="' + c.matchId + '" role="button" aria-label="بطاقة ذاكرة">' +
          '<div class="mem-card-inner">' +
          '  <div class="mem-card-face mem-back">' +
          '    <div class="mem-back-icon">' +
          '      <svg class="lordicon-mystery-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17" stroke-width="3.5"></line></svg>' +
          '    </div>' +
          '  </div>' +
          '  <div class="mem-card-face mem-front">' +
          '    <div class="mem-emoji">' + c.emoji + '</div>' +
          '    <div class="mem-label">' + c.name + '</div>' +
          '  </div>' +
          '</div>' +
          '</div>';
      });
      html += '</div>';
      html += '<div class="feedback-msg" id="mem-feedback-msg"></div>';
      return html;
    },

    /* 11. Tap to Count */
    renderTapToCount: function (slide) {
      var tc = slide.tapToCount;
      if (!tc) return '';
      var total = tc.targetCount || 6;
      var html = '<div class="tap-count-container">';

      // Header score badge
      html +=
        '<div class="tap-count-badge">' +
        '<span>🍎 التفاح المقطوف:</span> ' +
        '<span id="tap-count-num" style="color:var(--leaf); margin:0 4px;">0</span> / ' + total +
        '</div>';

      // Apple Tree Branch Scene
      html += '<div class="apple-branch-scene">';
      html += '<svg class="apple-branch-svg" viewBox="0 0 600 270" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">';
      html += '<defs>';
      html += '  <linearGradient id="treeSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#E1F5FE"/><stop offset="100%" stop-color="#F1F8E9"/></linearGradient>';
      html += '  <linearGradient id="woodBark" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#8D6E63"/><stop offset="50%" stop-color="#5D4037"/><stop offset="100%" stop-color="#3E2723"/></linearGradient>';
      html += '  <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FFF59D"/><stop offset="100%" stop-color="#FBC02D"/></radialGradient>';
      html += '</defs>';

      // Sun in top left corner
      html += '<circle cx="65" cy="45" r="28" fill="url(#sunGlow)"/>';

      // Main thick wooden branch stretching across
      html += '<path d="M620,40 Q450,75 320,82 T-20,95 L-20,128 Q320,115 460,105 T620,85 Z" fill="url(#woodBark)" stroke="#3E2723" stroke-width="3"/>';
      // Branch texture lines
      html += '<path d="M540,68 Q440,88 320,95" stroke="#3E2723" stroke-width="2" fill="none"/>';
      html += '<path d="M280,98 Q180,105 40,110" stroke="#3E2723" stroke-width="2" fill="none"/>';

      // Twigs hanging down to hold each apple
      html += '<path d="M85,108 Q83,122 85,135" stroke="#4E342E" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
      html += '<path d="M170,102 Q172,120 170,136" stroke="#4E342E" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
      html += '<path d="M255,95 Q252,116 255,130" stroke="#4E342E" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
      html += '<path d="M340,90 Q342,112 340,128" stroke="#4E342E" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
      html += '<path d="M425,82 Q422,106 425,124" stroke="#4E342E" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
      html += '<path d="M510,75 Q512,98 510,118" stroke="#4E342E" stroke-width="3.5" fill="none" stroke-linecap="round"/>';

      // Leaves clusters
      html += '<g transform="translate(60, 95)"><ellipse cx="0" cy="0" rx="22" ry="12" fill="#43A047" stroke="#1B5E20" stroke-width="1.8" transform="rotate(-30)"/><ellipse cx="14" cy="5" rx="18" ry="10" fill="#66BB6A" stroke="#2E7D32" stroke-width="1.8" transform="rotate(15)"/></g>';
      html += '<g transform="translate(145, 90)"><ellipse cx="0" cy="0" rx="24" ry="13" fill="#66BB6A" stroke="#2E7D32" stroke-width="1.8" transform="rotate(25)"/><ellipse cx="-12" cy="6" rx="19" ry="10" fill="#43A047" stroke="#1B5E20" stroke-width="1.8" transform="rotate(-15)"/></g>';
      html += '<g transform="translate(230, 85)"><ellipse cx="0" cy="0" rx="26" ry="14" fill="#43A047" stroke="#1B5E20" stroke-width="1.8" transform="rotate(-20)"/><ellipse cx="16" cy="4" rx="20" ry="11" fill="#81C784" stroke="#2E7D32" stroke-width="1.8" transform="rotate(20)"/></g>';
      html += '<g transform="translate(320, 80)"><ellipse cx="0" cy="0" rx="25" ry="13" fill="#66BB6A" stroke="#2E7D32" stroke-width="1.8" transform="rotate(18)"/><ellipse cx="-14" cy="5" rx="20" ry="10" fill="#43A047" stroke="#1B5E20" stroke-width="1.8" transform="rotate(-25)"/></g>';
      html += '<g transform="translate(405, 75)"><ellipse cx="0" cy="0" rx="26" ry="14" fill="#43A047" stroke="#1B5E20" stroke-width="1.8" transform="rotate(-22)"/><ellipse cx="16" cy="6" rx="21" ry="11" fill="#66BB6A" stroke="#2E7D32" stroke-width="1.8" transform="rotate(25)"/></g>';
      html += '<g transform="translate(490, 70)"><ellipse cx="0" cy="0" rx="25" ry="13" fill="#66BB6A" stroke="#2E7D32" stroke-width="1.8" transform="rotate(20)"/><ellipse cx="-15" cy="5" rx="19" ry="10" fill="#43A047" stroke="#1B5E20" stroke-width="1.8" transform="rotate(-18)"/></g>';

      html += '</svg>';

      // Positions for the 6 apples
      var applePositions = [
        { left: '14.2%', top: '56%' },
        { left: '28.3%', top: '57%' },
        { left: '42.5%', top: '55%' },
        { left: '56.7%', top: '54%' },
        { left: '70.8%', top: '53%' },
        { left: '85.0%', top: '51%' }
      ];

      for (var i = 0; i < total; i++) {
        var pos = applePositions[i] || { left: ((i + 1) * 14) + '%', top: '52%' };
        html +=
          '<button class="apple-item-btn" type="button" data-count-idx="' + (i + 1) + '" style="left:' + pos.left + '; top:' + pos.top + ';" title="المس التفاحة لقطفها وعدّها">' +
          '  <div class="apple-body">' +
          '    <div class="apple-stem"></div>' +
          '    <div class="apple-leaf"></div>' +
          '    <div class="apple-shine"></div>' +
          '    <span class="apple-number-badge">' + (i + 1) + '</span>' +
          '  </div>' +
          '</button>';
      }

      html += '</div>'; // close .apple-branch-scene

      html += '<div class="feedback-msg" id="tap-count-feedback"></div>';
      html += '<button class="tap-count-reset-btn" id="tap-count-reset" type="button" style="display:none;">' +
              '  <svg class="lordicon-refresh-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>' +
              '  <span>أعد قطف التفاح</span>' +
              '</button>';
      html += '</div>'; // close .tap-count-container
      return html;
    },

    /* 12. Summary Slide */
    renderSummary: function (slide) {
      return (
        '<div class="card result-card" style="text-align:center; max-width:620px; padding:32px 24px;">' +
        '<div class="trophy-stamp">' +
        '  <svg class="lordicon-trophy-svg" viewBox="0 0 64 64" fill="none">' +
        '    <path d="M24 54h16v4H24z" fill="#D97706"/>' +
        '    <path d="M18 58h28v3H18z" fill="#92400E" rx="1.5"/>' +
        '    <path d="M30 44h4v10h-4z" fill="#F59E0B"/>' +
        '    <path d="M27 42h10v2H27z" fill="#D97706"/>' +
        '    <path d="M19 18H13a5 5 0 0 0-5 5v3a5 5 0 0 0 5 5h6" stroke="#D97706" stroke-width="3.5" stroke-linecap="round"/>' +
        '    <path d="M45 18h6a5 5 0 0 1 5 5v3a5 5 0 0 1-5 5h-6" stroke="#D97706" stroke-width="3.5" stroke-linecap="round"/>' +
        '    <path d="M18 14h28v13c0 7.732-6.268 14-14 14s-14-6.268-14-14V14z" fill="url(#trophyGoldGrad)"/>' +
        '    <rect x="16" y="12" width="32" height="4" rx="2" fill="#FDE68A" stroke="#D97706" stroke-width="1.5"/>' +
        '    <polygon points="32,22 33.8,26.2 38.3,26.6 34.8,29.7 35.8,34.2 32,31.8 28.2,34.2 29.2,29.7 25.7,26.6 30.2,26.2" fill="#FFFFFF" opacity="0.95"/>' +
        '    <defs>' +
        '      <linearGradient id="trophyGoldGrad" x1="18" y1="14" x2="46" y2="41" gradientUnits="userSpaceOnUse">' +
        '        <stop stop-color="#FCD34D"/>' +
        '        <stop offset="0.5" stop-color="#F59E0B"/>' +
        '        <stop offset="1" stop-color="#D97706"/>' +
        '      </linearGradient>' +
        '    </defs>' +
        '  </svg>' +
        '</div>' +
        '<h1>مبروك يا بطل! أتممت الدرس بنجاح</h1>' +
        '<div class="summary-stars-container" id="sum-stars">' +
        '  <svg class="star-badge-svg" viewBox="0 0 24 24" fill="#F59E0B" stroke="#D97706" stroke-width="1.5" stroke-linejoin="round">' +
        '    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' +
        '  </svg>' +
        '  <svg class="star-badge-svg" viewBox="0 0 24 24" fill="#FBBF24" stroke="#D97706" stroke-width="1.5" stroke-linejoin="round">' +
        '    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' +
        '  </svg>' +
        '  <svg class="star-badge-svg" viewBox="0 0 24 24" fill="#F59E0B" stroke="#D97706" stroke-width="1.5" stroke-linejoin="round">' +
        '    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' +
        '  </svg>' +
        '</div>' +
        '<p class="subtitle" id="sum-desc" style="margin:0 auto 18px;">لقد أظهرت ذكاءً وتميزاً رائعاً في حل كافة الأنشطة والتحديات!</p>' +
        '<button class="summary-reload-btn" type="button" onclick="location.reload()" aria-label="إعادة الدرس من البداية">' +
        '  <svg class="lordicon-refresh-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
        '    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>' +
        '  </svg>' +
        '  <span>إعادة الدرس من البداية</span>' +
        '</button>' +
        '</div>'
      );
    },

    /* ==========================================================================
       5. SLIDE INTERACTIVITY & DRAG-AND-DROP BINDINGS
       ========================================================================== */
    bindSlideInteractivity: function (slideEl, slide, idx) {
      var self = this;
      var fb = slideEl.querySelector('.feedback-msg');

      // 1. Reveal Details
      slideEl.querySelectorAll('.group-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
          var detail = chip.querySelector('.chip-detail');
          if (detail) {
            var isHidden = detail.style.display === 'none';
            detail.style.display = isHidden ? 'block' : 'none';
            AudioEngine.sndCardOpen();
          }
        });
      });
      var revQ = slideEl.querySelector('.reveal-q');
      if (revQ) {
        revQ.addEventListener('click', function () {
          var ans = revQ.querySelector('.atext');
          if (ans) {
            var isHidden = ans.style.display === 'none';
            ans.style.display = isHidden ? 'block' : 'none';
            AudioEngine.sndCardOpen();
          }
        });
      }

      // 2. Quiz Click
      slideEl.querySelectorAll('.quiz-opt-btn:not(.tf-btn)').forEach(function (btn) {
        btn.addEventListener('click', function () {
          slideEl.querySelectorAll('.quiz-opt-btn').forEach(function (b) { b.disabled = true; });
          var isCorrect = btn.getAttribute('data-is-correct') === 'true';
          if (isCorrect) {
            btn.classList.add('correct');
            if (fb) { fb.textContent = 'إجابة صحيحة وممتازة! أحسنت يا بطل! 🌟'; fb.style.color = 'var(--leaf)'; }
            self.addScore();
            AudioEngine.sndCorrect();
            launchConfetti(slideEl);
            self.setMascotBubble('إجابة ذكية ورائعة! النبات الأخضر يصنع غذاءه بنفسه من ضوء الشمس والماء والهواء 💡', true);
          } else {
            btn.classList.add('wrong');
            slideEl.querySelectorAll('.quiz-opt-btn').forEach(function (b) {
              if (b.getAttribute('data-is-correct') === 'true') b.classList.add('correct');
            });
            if (fb) { fb.textContent = 'إجابة غير صحيحة، فكر في القاعدة العلمية!'; fb.style.color = 'var(--clay)'; }
            AudioEngine.sndWrong();
            self.setMascotBubble('تذكر يا بطل: النبات يحتاج عناصر طبيعية تصنع الغذاء في أوراقه الخضراء 💡', false);
          }
        });
      });

      // 3. True or False Click
      slideEl.querySelectorAll('.tf-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          slideEl.querySelectorAll('.tf-btn').forEach(function (b) { b.disabled = true; });
          var ans = btn.getAttribute('data-answer') === 'true';
          var isTrueTarget = slide.trueFalse ? slide.trueFalse.isTrue : true;
          if (ans === isTrueTarget) {
            btn.classList.add('correct');
            if (fb) { fb.textContent = 'رائع جداً! إجابتك صحيحة 🎯'; fb.style.color = 'var(--leaf)'; }
            self.addScore();
            AudioEngine.sndCorrect();
            launchConfetti(slideEl);
            self.setMascotBubble('أحسنت يا عبقري! الصخور جمادات غير حية فلا تنمو ولا تتنفس ولا تحتاج للغذاء 💡', true);
          } else {
            btn.classList.add('wrong');
            slideEl.querySelectorAll('.tf-btn').forEach(function (b) {
              if ((b.getAttribute('data-answer') === 'true') === isTrueTarget) b.classList.add('correct');
            });
            if (fb) { fb.textContent = 'إجابة غير صحيحة، راجع طبيعة الجمادات!'; fb.style.color = 'var(--clay)'; }
            AudioEngine.sndWrong();
            self.setMascotBubble('تأمل الصخور حولك: هل تكبر أو تجوع؟ إنها غير حية فلا تحتاج إلى غذاء 💡', false);
          }
        });
      });

      // 4. Activity: Classify Drag & Drop
      var dragChips = slideEl.querySelectorAll('.drag-item-chip');
      var totalToClassify = dragChips.length;
      var classifiedCount = 0;

      dragChips.forEach(function (chip) {
        DragDropEngine.makeDraggable(chip, {
          zoneSelector: '.drop-bucket',
          onDrop: function (draggedEl, targetZone) {
            var targetBucketId = draggedEl.getAttribute('data-target-bucket');
            var bucketId = targetZone.getAttribute('data-bucket-id');

            if (targetBucketId === bucketId) {
              // Success Drop
              targetZone.classList.add('dropped-success');
              AudioEngine.sndCorrect();
              var list = targetZone.querySelector('.bucket-items-list');
              if (list) list.appendChild(draggedEl);
              draggedEl.style.cursor = 'default';
              draggedEl.style.pointerEvents = 'none';
              draggedEl.style.fontSize = '0.9rem';
              draggedEl.style.padding = '6px 12px';

              classifiedCount++;
              if (classifiedCount >= totalToClassify) {
                self.addScore();
                if (fb) { fb.textContent = 'تصنيف عبقري متكامل! أحسنت يا بطل! 🌟'; fb.style.color = 'var(--leaf)'; }
                launchConfetti(slideEl);
                self.setMascotBubble('تصنيف عبقري ومتقن! لقد وزعت جميع الكائنات والأشياء بدقة واحتراف 💡', true);
              }
            } else {
              AudioEngine.sndWrong();
              targetZone.style.borderColor = 'var(--clay)';
              setTimeout(function () { targetZone.style.borderColor = ''; }, 450);
              self.setMascotBubble('فكر جيداً في خصائص هذا العنصر قبل إفلاته في الصندوق 💡', false);
            }
          }
        });
      });

      // 5. Activity: Fill in the Blank Drag & Drop
      var wordPills = slideEl.querySelectorAll('.word-drag-pill');
      var dropSlot = slideEl.querySelector('.drop-slot');
      if (dropSlot) {
        var correctAns = dropSlot.getAttribute('data-target-answer');
        wordPills.forEach(function (pill) {
          DragDropEngine.makeDraggable(pill, {
            zoneSelector: '.drop-slot',
            onDrop: function (draggedEl, targetZone) {
              var word = draggedEl.getAttribute('data-word');
              targetZone.textContent = word;
              if (word === correctAns) {
                targetZone.classList.add('filled', 'dropped-success');
                wordPills.forEach(function (p) { p.style.pointerEvents = 'none'; p.style.opacity = '0.5'; });
                draggedEl.style.display = 'none';
                if (fb) { fb.textContent = 'إجابة صحيحة! أحسنت التعبير 🌟'; fb.style.color = 'var(--leaf)'; }
                self.addScore();
                AudioEngine.sndCorrect();
                launchConfetti(slideEl);
                self.setMascotBubble('أحسنت التعبير العلمي! الخياشيم تساعد الأسماك على استخلاص الأكسجين من الماء 💡', true);
              } else {
                targetZone.style.borderColor = 'var(--clay)';
                AudioEngine.sndWrong();
                setTimeout(function () {
                  targetZone.style.borderColor = '';
                  targetZone.textContent = 'اسحب الكلمة هنا';
                }, 650);
              }
            }
          });
        });
      }

      // 6. Activity: Match Pairs Drag & Drop
      var matchItems = slideEl.querySelectorAll('.drag-match-item');
      var totalMatchPairs = matchItems.length;
      var matchedPairsCount = 0;
      matchItems.forEach(function (item) {
        DragDropEngine.makeDraggable(item, {
          zoneSelector: '.drop-match-target',
          onDrop: function (draggedEl, targetZone) {
            var id1 = draggedEl.getAttribute('data-match-id');
            var id2 = targetZone.getAttribute('data-match-id');
            if (id1 === id2) {
              draggedEl.classList.add('matched');
              targetZone.classList.add('matched', 'dropped-success');
              draggedEl.style.pointerEvents = 'none';
              targetZone.style.pointerEvents = 'none';
              AudioEngine.sndCorrect();
              matchedPairsCount++;
              if (matchedPairsCount >= totalMatchPairs) {
                self.addScore();
                if (fb) { fb.textContent = 'توصيل متقن وصحيح 100%! 👏'; fb.style.color = 'var(--leaf)'; }
                launchConfetti(slideEl);
                self.setMascotBubble('توصيل رائع! كل مخلوق يعيش في بيئة تناسبه وتوفر له الغذاء والأمان 💡', true);
              }
            } else {
              AudioEngine.sndWrong();
              draggedEl.classList.add('wrong');
              targetZone.classList.add('wrong');
              setTimeout(function () {
                draggedEl.classList.remove('wrong');
                targetZone.classList.remove('wrong');
              }, 450);
            }
          }
        });
      });

      // 7. Activity: Order Sequence Drag & Drop
      var orderItems = slideEl.querySelectorAll('.drag-order-item');
      var totalOrderSteps = orderItems.length;
      var orderedCount = 0;
      orderItems.forEach(function (item) {
        DragDropEngine.makeDraggable(item, {
          zoneSelector: '.drop-order-slot',
          onDrop: function (draggedEl, targetZone) {
            var correctOrder = parseInt(draggedEl.getAttribute('data-order'), 10);
            var slotOrder = parseInt(targetZone.getAttribute('data-slot-order'), 10);

            if (correctOrder === slotOrder) {
              targetZone.classList.add('dropped-success');
              targetZone.style.borderColor = 'var(--leaf)';
              var content = targetZone.querySelector('.slot-content');
              if (content) content.appendChild(draggedEl);
              draggedEl.style.pointerEvents = 'none';
              AudioEngine.sndCorrect();
              orderedCount++;
              if (orderedCount >= totalOrderSteps) {
                self.addScore();
                if (fb) { fb.textContent = 'ترتيب علمي دقيق وممتاز! 🌟'; fb.style.color = 'var(--leaf)'; }
                launchConfetti(slideEl);
                self.setMascotBubble('ترتيب علمي متقن! تبدأ دورة نمو النبات بالبذرة ثم النبتة الصغيرة فالأزهار 💡', true);
              }
            } else {
              AudioEngine.sndWrong();
              targetZone.style.borderColor = 'var(--clay)';
              setTimeout(function () { targetZone.style.borderColor = ''; }, 450);
            }
          }
        });
      });

      // 8. Hotspot Exploration
      var exploredHotspots = {};
      var totalHotspots = (slide.hotspot && slide.hotspot.points) ? slide.hotspot.points.length : 0;
      slideEl.querySelectorAll('.hotspot-pin').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var i = parseInt(btn.getAttribute('data-idx'), 10);
          var pt = slide.hotspot ? slide.hotspot.points[i] : null;
          var detailBox = slideEl.querySelector('#hotspot-detail-box');

          slideEl.querySelectorAll('.hotspot-pin').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');

          if (pt && detailBox) {
            exploredHotspots[i] = true;
            detailBox.classList.add('has-content');
            var iconEl = detailBox.querySelector('.hotspot-detail-icon');
            var titleEl = detailBox.querySelector('.hotspot-detail-title');
            var descEl = detailBox.querySelector('.hotspot-detail-desc');
            if (iconEl) iconEl.textContent = pt.emoji || '🌱';
            if (titleEl) titleEl.textContent = pt.title + ':';
            if (descEl) descEl.textContent = pt.detail;
            AudioEngine.sndCardOpen();

            self.setMascotBubble('رائع! ' + pt.title + ': ' + pt.detail + ' 💡', false);

            if (Object.keys(exploredHotspots).length >= totalHotspots) {
              self.addScore();
              launchConfetti(slideEl);
              AudioEngine.sndWin();
              self.setMascotBubble('أحسنت يا عبقري! لقد استكشفت جميع أجزاء النبتة وتعرفت على أسرارها كاملة 🌟', true);
            }
          }
        });
      });

      // 9. Memory Cards
      var memCards = slideEl.querySelectorAll('.mem-card');
      var flipped = [];
      var matchedMemPairs = 0;
      var totalPairsTarget = (slide.memoryCards && slide.memoryCards.pairs) ? slide.memoryCards.pairs.length : 0;
      var memFeedback = slideEl.querySelector('#mem-feedback-msg') || slideEl.querySelector('.feedback-msg');

      memCards.forEach(function (card) {
        card.addEventListener('click', function () {
          if (card.classList.contains('flipped') || card.classList.contains('matched') || flipped.length >= 2) return;

          card.classList.add('flipped');
          flipped.push(card);
          AudioEngine.sndClick();

          if (flipped.length === 2) {
            var id1 = flipped[0].getAttribute('data-match-id');
            var id2 = flipped[1].getAttribute('data-match-id');

            if (id1 && id2 && id1 === id2) {
              matchedMemPairs++;
              flipped[0].classList.add('matched');
              flipped[1].classList.add('matched');
              AudioEngine.sndCorrect();
              flipped = [];

              if (matchedMemPairs >= totalPairsTarget) {
                self.addScore();
                if (memFeedback) {
                  memFeedback.textContent = 'ذاكرة خارقة يا بطل! طابقت جميع البطاقات بنجاح 🏆';
                  memFeedback.style.color = 'var(--leaf)';
                }
                launchConfetti(slideEl);
                AudioEngine.sndWin();
                self.setMascotBubble('ذاكرة قوية وممتازة يا عبقري! طابقت بين كل الحيوانات وصغارها بدقة 🌟', true);
              }
            } else {
              AudioEngine.sndWrong();
              var toUnflip = [flipped[0], flipped[1]];
              flipped = [];
              setTimeout(function () {
                toUnflip.forEach(function (c) {
                  c.classList.remove('flipped');
                });
              }, 750);
            }
          }
        });
      });

      // 10. Tap to Count (Apple Tree Branch)
      var countBtns = slideEl.querySelectorAll('.apple-item-btn');
      var curCount = 0;
      var targetNum = slide.tapToCount ? (slide.tapToCount.targetCount || 6) : 6;
      var countDisplay = slideEl.querySelector('#tap-count-num');
      var countFb = slideEl.querySelector('#tap-count-feedback') || slideEl.querySelector('.feedback-msg');
      var resetBtn = slideEl.querySelector('#tap-count-reset');

      countBtns.forEach(function (b) {
        b.addEventListener('click', function () {
          if (b.classList.contains('counted')) return;
          b.classList.add('counted');
          curCount++;
          if (countDisplay) countDisplay.textContent = curCount;
          AudioEngine.sndCountNote(curCount);

          if (curCount >= targetNum) {
            self.addScore();
            if (countFb) {
              countFb.textContent = '🎉 عد متقن وصحيح 100%! قطفت جميع التفاحات بنجاح 🌟';
              countFb.style.color = 'var(--leaf)';
            }
            if (resetBtn) resetBtn.style.display = 'inline-flex';
            launchConfetti(slideEl);
            AudioEngine.sndWin();
            self.setMascotBubble('عد ممتاز ورائع! قطفت 6 تفاحات لذيذة من الغصن بنجاح يا عبقري 🍎🌟', true);
          }
        });
      });

      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          curCount = 0;
          if (countDisplay) countDisplay.textContent = '0';
          if (countFb) countFb.textContent = '';
          resetBtn.style.display = 'none';
          countBtns.forEach(function (b) {
            b.classList.remove('counted');
          });
          AudioEngine.sndSlide();
          self.setMascotBubble('هيا اقطف التفاحات الشهية مرة أخرى واستمتع بالنغمات! 🎵', false);
        });
      }
    },

    /* ==========================================================================
       6. SLIDE NAVIGATION & MASCOT FASEEH DYNAMICS
       ========================================================================== */
    goToSlide: function (index) {
      if (!this.data || index < 0 || index >= this.data.slides.length) return;

      var slides = this.dom.stage.querySelectorAll('.il-slide');
      var dots = this.dom.dots ? this.dom.dots.querySelectorAll('.dot') : [];
      var currentSlideData = this.data.slides[index];

      slides.forEach(function (s, i) { s.classList.toggle('active', i === index); });
      dots.forEach(function (d, i) { d.classList.toggle('active', i === index); });

      this.currentIndex = index;

      // Strict LTR Counter to avoid Arabic fraction flipping
      if (this.dom.counter) {
        this.dom.counter.innerHTML = '<bdi dir="ltr">' + (index + 1) + ' / ' + this.data.slides.length + '</bdi>';
      }
      if (this.dom.prevBtn) this.dom.prevBtn.disabled = index === 0;
      if (this.dom.nextBtn) this.dom.nextBtn.disabled = index === this.data.slides.length - 1;

      var tip = currentSlideData.mascotTip;
      if (!tip) {
        switch (currentSlideData.type) {
          case 'explain': tip = 'اقرأ الشرح بتركيز يا بطل لتفهم فكرة الدرس الأساسية! 💡'; break;
          case 'interactive_reveal': tip = 'اضغط على البطاقات لكشف الأسرار والمعلومات المخفية! 🔍'; break;
          case 'quiz': tip = 'تأمل السؤال جيداً واختر الإجابة الصحيحة! 🌟'; break;
          case 'true_false': tip = 'هل العبارة صحيحة أم خاطئة؟ فكر في معلوماتك العلمية! 🤔'; break;
          case 'match_pairs': tip = 'وصّل كل كائن مع مأواه وبيئته المناسبة! 🏡'; break;
          case 'order_sequence': tip = 'رتّب خطوات النمو بالترتيب العلمي الصحيح! 🌱'; break;
          case 'fill_blank': tip = 'اسحب الكلمة المناسبة من بنك الكلمات وضعها في الفراغ! ✏️'; break;
          case 'classify_sorting': tip = 'صنّف العناصر التالية في الصندوق المناسب بدقة! 📦'; break;
          case 'hotspot_explore': tip = 'اضغط على الأزرار النباضة لتستكشف أجزاء النبتة! 🪴'; break;
          case 'memory_cards': tip = 'اقلب البطاقات وطابق كل حيوان مع صغيره يا صاحب الذاكرة القوية! 🧠'; break;
          case 'tap_to_count': tip = 'المس حبات التفاح واحدة تلو الأخرى واستمع لنغمات العد! 🍎'; break;
          case 'summary': tip = 'مبروك يا بطل! لقد أتممت الدرس بنجاح وجمعت كل النجوم! 🏆'; break;
          default: tip = 'أهلًا بكم! أنا فَصيح المُستَكشِف 🧭 هيا نكتشف أسرار هذا الدرس معًا!'; break;
        }
      }
      this.setMascotBubble(tip, currentSlideData.type === 'summary');

      if (currentSlideData.type === 'summary') {
        AudioEngine.sndWin();
        launchConfetti(slides[index]);
      } else {
        AudioEngine.sndSlide();
      }
    },

    nextSlide: function () { this.goToSlide(this.currentIndex + 1); },
    prevSlide: function () { this.goToSlide(this.currentIndex - 1); }
  };

  /* ==========================================================================
     7. PUBLIC API & AUTO-BOOTSTRAP
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
