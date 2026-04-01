/**
 * Women's Health & Wellness — Main Application Entry Point
 * All managers are initialized on DOMContentLoaded.
 */

/* ============================================================
   ThemeManager
   Handles light/dark mode toggle, persistence, and OS preference.
   ============================================================ */
const ThemeManager = {
  /** Read localStorage or prefers-color-scheme, then apply. */
  init() {
    let stored = null;
    try {
      stored = localStorage.getItem('theme');
    } catch (_) { /* localStorage unavailable */ }

    if (stored === 'dark' || stored === 'light') {
      this.apply(stored);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.apply(prefersDark ? 'dark' : 'light');
    }
  },

  /** Flip the current theme and persist. */
  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    this.apply(next);
    try {
      localStorage.setItem('theme', next);
    } catch (_) { /* graceful degrade */ }
  },

  /** Set data-theme on <html> and update toggle button icon. */
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }
};

/* ============================================================
   NavManager
   Handles sticky nav, hamburger toggle, and active link via
   IntersectionObserver.
   ============================================================ */
const NavManager = {
  _observer: null,

  init() {
    this._initHamburger();
    this._initScrollSpy();
    this._initThemeToggle();
  },

  _initHamburger() {
    const btn = document.getElementById('hamburger-btn');
    const links = document.getElementById('nav-links');
    if (!btn || !links) return;

    btn.addEventListener('click', () => {
      const isOpen = links.classList.toggle('nav-open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link is clicked
    links.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('nav-open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    // Mobile/group menu toggles
    links.querySelectorAll('.nav-group-btn').forEach(groupBtn => {
      groupBtn.addEventListener('click', () => {
        const expanded = groupBtn.getAttribute('aria-expanded') === 'true';
        groupBtn.setAttribute('aria-expanded', String(!expanded));
        const submenu = groupBtn.nextElementSibling;
        if (submenu && submenu.classList.contains('nav-submenu')) {
          submenu.style.display = expanded ? 'none' : 'block';
        }
      });
    });
  },

  _initScrollSpy() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    if (!navLinks.length || !('IntersectionObserver' in window)) return;

    const sectionIds = Array.from(navLinks).map(l => l.getAttribute('href').slice(1));
    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean);

    this._observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            navLinks.forEach(l => l.classList.remove('active'));
            const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
            if (active) active.classList.add('active');
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach(s => this._observer.observe(s));
  },

  _initThemeToggle() {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.addEventListener('click', () => ThemeManager.toggle());
    }
  }
};

/* ============================================================
   WellnessTracker
   Tracks water intake, mood, and exercise. Persists to localStorage.
   ============================================================ */
const WellnessTracker = {
  state: { water: 0, mood: null, exercise: false },

  /** Load state from localStorage and sync UI. */
  load() {
    try {
      const raw = localStorage.getItem('wellness_tracker');
      if (raw) {
        const parsed = JSON.parse(raw);
        this.state = {
          water: typeof parsed.water === 'number' ? parsed.water : 0,
          mood: parsed.mood || null,
          exercise: Boolean(parsed.exercise)
        };
      }
    } catch (_) { /* graceful degrade */ }
    this.updateUI();
  },

  /** Persist current state to localStorage. */
  save() {
    try {
      localStorage.setItem('wellness_tracker', JSON.stringify(this.state));
    } catch (_) { /* graceful degrade */ }
  },

  /** Reset state to defaults and update UI. */
  reset() {
    this.state = { water: 0, mood: null, exercise: false };
    this.save();
    this.updateUI();
  },

  /** Sync DOM elements to current state. */
  updateUI() {
    // Water counter
    const waterDisplay = document.getElementById('water-count');
    if (waterDisplay) waterDisplay.textContent = this.state.water;

    // Progress bar
    const bar = document.getElementById('water-progress');
    if (bar) bar.style.width = `${Math.round((this.state.water / 8) * 100)}%`;

    // Decrement / increment button states
    const decBtn = document.getElementById('water-decrement');
    const incBtn = document.getElementById('water-increment');
    if (decBtn) decBtn.disabled = this.state.water <= 0;
    if (incBtn) incBtn.disabled = this.state.water >= 8;

    // Mood buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.mood === this.state.mood);
      btn.setAttribute('aria-pressed', String(btn.dataset.mood === this.state.mood));
    });

    // Exercise checkbox
    const exerciseCheck = document.getElementById('exercise-check');
    if (exerciseCheck) exerciseCheck.checked = this.state.exercise;
  },

  init() {
    this.load();

    // Water increment
    const incBtn = document.getElementById('water-increment');
    if (incBtn) {
      incBtn.addEventListener('click', () => {
        if (this.state.water < 8) {
          this.state.water++;
          this.save();
          this.updateUI();
        }
      });
    }

    // Water decrement
    const decBtn = document.getElementById('water-decrement');
    if (decBtn) {
      decBtn.addEventListener('click', () => {
        if (this.state.water > 0) {
          this.state.water--;
          this.save();
          this.updateUI();
        }
      });
    }

    // Mood selection
    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.mood = btn.dataset.mood;
        this.save();
        this.updateUI();
      });
    });

    // Exercise toggle
    const exerciseCheck = document.getElementById('exercise-check');
    if (exerciseCheck) {
      exerciseCheck.addEventListener('change', () => {
        this.state.exercise = exerciseCheck.checked;
        this.save();
        this.updateUI();
      });
    }

    // Reset button
    const resetBtn = document.getElementById('tracker-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    }
  }
};

/* ============================================================
   Carousel
   Auto-advancing quotes/testimonials slider with dot indicators.
   ============================================================ */
const Carousel = {
  currentIndex: 0,
  autoTimer: null,
  pauseTimer: null,

  /** Advance to next slide (wraps). */
  next() {
    const slides = document.querySelectorAll('.carousel-slide');
    if (!slides.length) return;
    this.goTo((this.currentIndex + 1) % slides.length);
  },

  /** Go to previous slide (wraps). */
  prev() {
    const slides = document.querySelectorAll('.carousel-slide');
    if (!slides.length) return;
    this.goTo((this.currentIndex - 1 + slides.length) % slides.length);
  },

  /** Navigate to a specific slide index. */
  goTo(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    if (!slides.length) return;

    slides[this.currentIndex].classList.remove('active');
    if (dots[this.currentIndex]) dots[this.currentIndex].classList.remove('active');

    this.currentIndex = index;

    slides[this.currentIndex].classList.add('active');
    if (dots[this.currentIndex]) dots[this.currentIndex].classList.add('active');
  },

  /** Start 5-second auto-advance. */
  startAuto() {
    this.stopAuto();
    this.autoTimer = setInterval(() => this.next(), 5000);
  },

  /** Pause auto-advance for 10 seconds, then resume. */
  pauseAuto() {
    this.stopAuto();
    if (this.pauseTimer) clearTimeout(this.pauseTimer);
    this.pauseTimer = setTimeout(() => this.startAuto(), 10000);
  },

  /** Clear auto-advance timer. */
  stopAuto() {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  },

  init() {
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => { this.prev(); this.pauseAuto(); });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => { this.next(); this.pauseAuto(); });
    }

    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.addEventListener('click', () => { this.goTo(i); this.pauseAuto(); });
    });

    // Show first slide
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length) {
      this.goTo(0);
      this.startAuto();
    }
  }
};

/* ============================================================
   Enhanced AI Chatbot with Conversation Memory and Smart Responses
   ============================================================ */
const AIChatbot = {
  isOpen: false,
  conversationHistory: [],
  userProfile: {
    name: null,
    wellnessData: {},
    preferences: {}
  },

  // Enhanced response patterns with context awareness
  responsePatterns: {
    greetings: [
      "Hello! I'm your wellness companion. How are you feeling today?",
      "Hi there! I'm here to support your health journey. What's on your mind?",
      "Welcome! I'm your AI wellness assistant. How can I help you today?"
    ],
    stress: [
      "I understand stress can be overwhelming. Try the 4-7-8 breathing technique: inhale for 4 seconds, hold for 7, exhale for 8.",
      "Stress management is key to wellness. Consider progressive muscle relaxation or a short meditation session.",
      "When feeling stressed, grounding techniques like naming 5 things you can see can help bring you back to the present."
    ],
    water: [
      "Hydration is crucial! Aim for 8 glasses (about 2L) of water daily. Herbal teas count too!",
      "Your body is about 60% water. Staying hydrated supports energy, digestion, and cognitive function.",
      "Track your water intake in the wellness tracker above. Small sips throughout the day add up!"
    ],
    sleep: [
      "Quality sleep is foundational for health. Adults typically need 7-9 hours per night.",
      "Create a calming bedtime routine: dim lights, avoid screens 1 hour before bed, and keep your room cool.",
      "If you're having trouble sleeping, try journaling your thoughts or practicing gentle yoga before bed."
    ],
    exercise: [
      "Movement is medicine! Even 10-15 minutes of daily activity can boost your mood and energy.",
      "Find activities you enjoy - walking, dancing, swimming, or yoga all count as exercise.",
      "Remember: consistency over intensity. Start small and build from there."
    ],
    nutrition: [
      "Focus on whole foods: colorful vegetables, lean proteins, whole grains, and healthy fats.",
      "Your body needs fuel throughout the day. Don't skip meals - they help regulate blood sugar and energy.",
      "Consider mindful eating: eat without distractions and savor each bite."
    ],
    mood: [
      "Mood fluctuations are normal. Track patterns in your wellness journal to identify triggers.",
      "Self-compassion is important. Be kind to yourself on difficult days.",
      "Small acts of self-care like a warm bath, reading, or connecting with loved ones can help lift your mood."
    ],
    cycle: [
      "Menstrual cycles vary greatly. Track your symptoms to understand your unique patterns.",
      "Common PMS symptoms include mood changes, bloating, and fatigue. These usually improve with your period.",
      "If cycle irregularities concern you, consider consulting a healthcare provider for personalized advice."
    ],
    pcos: [
      "PCOS affects about 1 in 10 women. Symptoms can include irregular periods, weight changes, and excess hair growth.",
      "Management often involves lifestyle changes, hormonal treatments, and sometimes medication.",
      "Please consult an endocrinologist for proper diagnosis and treatment. I'm here to provide general information."
    ],
    pregnancy: [
      "Pregnancy is a beautiful journey! Focus on prenatal care, nutrition, and stress management.",
      "Stay hydrated, eat nutrient-rich foods, and get regular prenatal check-ups.",
      "Every pregnancy is unique. Listen to your body and consult your healthcare provider for personalized guidance."
    ]
  },

  // AI-powered response generation
  generateResponse(userInput) {
    const input = userInput.toLowerCase();
    const context = this.analyzeContext(input);

    // Check for greetings
    if (this.isGreeting(input)) {
      return this.getRandomResponse(this.responsePatterns.greetings);
    }

    // Check for specific health topics
    for (const [topic, responses] of Object.entries(this.responsePatterns)) {
      if (input.includes(topic) || this.hasRelatedKeywords(input, topic)) {
        return this.personalizeResponse(this.getRandomResponse(responses), context);
      }
    }

    // Check wellness tracker integration
    if (this.conversationHistory.length > 0) {
      const insights = this.generateInsightsFromTracker();
      if (insights) {
        return insights;
      }
    }

    // Fallback responses
    const fallbacks = [
      "I appreciate you sharing that with me. While I can provide general wellness information, for personalized medical advice, please consult a healthcare professional.",
      "That's an important topic! I can share general wellness information, but for specific health concerns, it's best to speak with a qualified healthcare provider.",
      "I'm here to support your wellness journey with general information and self-care tips. For medical concerns, please consult your doctor or healthcare provider."
    ];

    return this.getRandomResponse(fallbacks);
  },

  // Analyze conversation context
  analyzeContext(input) {
    const context = {
      emotional: this.detectEmotion(input),
      urgency: this.detectUrgency(input),
      topics: this.extractTopics(input)
    };
    return context;
  },

  // Detect emotional state from input
  detectEmotion(input) {
    const positiveWords = ['good', 'great', 'happy', 'excited', 'wonderful', 'amazing'];
    const negativeWords = ['sad', 'worried', 'anxious', 'stressed', 'tired', 'overwhelmed'];

    const positiveCount = positiveWords.filter(word => input.includes(word)).length;
    const negativeCount = negativeWords.filter(word => input.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  },

  // Detect urgency level
  detectUrgency(input) {
    const urgentWords = ['emergency', 'urgent', 'severe', 'intense', 'immediately', 'help'];
    return urgentWords.some(word => input.includes(word)) ? 'high' : 'normal';
  },

  // Extract topics from input
  extractTopics(input) {
    const topics = [];
    const topicKeywords = {
      stress: ['stress', 'anxiety', 'worried', 'overwhelmed'],
      sleep: ['sleep', 'tired', 'insomnia', 'rest'],
      nutrition: ['food', 'eat', 'diet', 'nutrition', 'meal'],
      exercise: ['exercise', 'workout', 'fitness', 'active'],
      mental: ['mood', 'depression', 'sad', 'happy', 'emotion']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        topics.push(topic);
      }
    }
    return topics;
  },

  // Check if input is a greeting
  isGreeting(input) {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you'];
    return greetings.some(greeting => input.includes(greeting));
  },

  // Check for related keywords
  hasRelatedKeywords(input, topic) {
    const relatedKeywords = {
      stress: ['pressure', 'tension', 'nervous', 'panic'],
      water: ['hydration', 'drink', 'thirsty', 'fluid'],
      sleep: ['rest', 'bedtime', 'insomnia', 'fatigue'],
      exercise: ['movement', 'activity', 'fitness', 'walk'],
      nutrition: ['food', 'meal', 'diet', 'eating'],
      mood: ['feeling', 'emotion', 'depressed', 'happy'],
      cycle: ['period', 'menstrual', 'menstruation', 'flow'],
      pcos: ['polycystic', 'hormone', 'irregular'],
      pregnancy: ['pregnant', 'baby', 'expecting']
    };

    return relatedKeywords[topic]?.some(keyword => input.includes(keyword)) || false;
  },

  // Get random response from array
  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  },

  // Personalize response based on context
  personalizeResponse(response, context) {
    if (context.emotional === 'negative' && context.urgency === 'high') {
      return "I hear that you're going through a difficult time. While I can offer general wellness support, for urgent concerns, please reach out to a healthcare professional or emergency services. " + response;
    }
    return response;
  },

  // Generate insights from wellness tracker data
  generateInsightsFromTracker() {
    try {
      const trackerData = JSON.parse(localStorage.getItem('wellness_tracker') || '{}');
      if (!trackerData || Object.keys(trackerData).length === 0) {
        return null;
      }

      const insights = [];
      const recentEntries = Object.values(trackerData).slice(-7); // Last 7 days

      if (recentEntries.length >= 3) {
        // Analyze sleep patterns
        const avgSleep = recentEntries.reduce((sum, entry) => sum + (entry.sleep || 0), 0) / recentEntries.length;
        if (avgSleep < 7) {
          insights.push("I notice your average sleep has been less than 7 hours. Prioritizing better sleep hygiene could really help your energy levels.");
        }

        // Analyze water intake
        const avgWater = recentEntries.reduce((sum, entry) => sum + (entry.water || 0), 0) / recentEntries.length;
        if (avgWater < 6) {
          insights.push("Your water intake seems lower than recommended. Small increases throughout the day can make a big difference.");
        }

        // Analyze mood patterns
        const moodEntries = recentEntries.filter(entry => entry.mood);
        if (moodEntries.length > 0) {
          const avgMood = moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length;
          if (avgMood < 6) {
            insights.push("I've noticed some lower mood entries in your tracker. Consider incorporating more self-care activities that bring you joy.");
          }
        }
      }

      return insights.length > 0 ? "Based on your wellness tracker data: " + insights.join(" ") : null;
    } catch (e) {
      return null;
    }
  },

  // Toggle chat panel
  toggle() {
    this.isOpen = !this.isOpen;
    const panel = document.getElementById('chatbot-panel');
    const fab = document.getElementById('chatbot-fab');
    if (panel) {
      panel.classList.toggle('open', this.isOpen);
      panel.setAttribute('aria-hidden', String(!this.isOpen));
    }
    if (fab) fab.setAttribute('aria-expanded', String(this.isOpen));
  },

  // Handle user input
  handleInput(text) {
    const lower = text.toLowerCase();

    // Store conversation history
    this.conversationHistory.push({ type: 'user', message: text, timestamp: Date.now() });

    // Generate AI response
    const response = this.generateResponse(text);

    // Store bot response
    this.conversationHistory.push({ type: 'bot', message: response, timestamp: Date.now() });

    return response;
  },

  // Append message to chat
  appendMessage(text, sender) {
    const messages = document.getElementById('chatbot-messages');
    if (!messages) return;

    const msg = document.createElement('div');
    msg.className = `chat-message chat-message--${sender}`;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;

    // Add typing indicator for bot messages
    if (sender === 'bot') {
      this.showTypingIndicator();
      setTimeout(() => this.hideTypingIndicator(), 500);
    }
  },

  // Show typing indicator
  showTypingIndicator() {
    const messages = document.getElementById('chatbot-messages');
    if (!messages) return;

    const indicator = document.createElement('div');
    indicator.className = 'chat-typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    indicator.id = 'typing-indicator';
    messages.appendChild(indicator);
    messages.scrollTop = messages.scrollHeight;
  },

  // Hide typing indicator
  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  },

  // Initialize the AI chatbot
  init() {
    const fab = document.getElementById('chatbot-fab');
    if (fab) fab.addEventListener('click', () => this.toggle());

    const closeBtn = document.getElementById('chatbot-close');
    if (closeBtn) closeBtn.addEventListener('click', () => { if (this.isOpen) this.toggle(); });

    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');
    if (form && input) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        this.appendMessage(text, 'user');
        input.value = '';

        // Simulate AI thinking time
        setTimeout(() => {
          const response = this.handleInput(text);
          this.appendMessage(response, 'bot');
        }, 1000 + Math.random() * 1000); // 1-2 second delay
      });
    }

    // Load conversation history
    this.loadConversationHistory();
  },

  // Load conversation history from localStorage
  loadConversationHistory() {
    try {
      const history = JSON.parse(localStorage.getItem('chatbot_history') || '[]');
      this.conversationHistory = history.slice(-20); // Keep last 20 messages
    } catch (e) {
      this.conversationHistory = [];
    }
  },

  // Save conversation history
  saveConversationHistory() {
    try {
      localStorage.setItem('chatbot_history', JSON.stringify(this.conversationHistory));
    } catch (e) {
      // Graceful degradation
    }
  }
};

/* ============================================================
   AccordionTabs
   Handles both the Mental Wellness accordion and the
   Hormonal Health tab/accordion panels.
   ============================================================ */
const AccordionTabs = {
  init() {
    this._initAccordion('#mental-wellness-accordion');
    this._initTabs('#hormonal-health-tabs');
  },

  /** Accordion: one-open behavior for a given container. */
  _initAccordion(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.querySelectorAll('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        const content = item ? item.querySelector('.accordion-content') : null;
        if (!content) return;

        const isOpen = content.classList.contains('open');

        // Close all
        container.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('open'));
        container.querySelectorAll('.accordion-trigger').forEach(t => {
          t.setAttribute('aria-expanded', 'false');
        });

        // Open clicked (if it was closed)
        if (!isOpen) {
          content.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  },

  /** Tabs: show one panel at a time. */
  _initTabs(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;

        container.querySelectorAll('.tab-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const panel = container.querySelector(`#${target}`);
        if (panel) panel.classList.add('active');
      });
    });

    // Activate first tab by default
    const firstBtn = container.querySelector('.tab-btn');
    if (firstBtn) firstBtn.click();
  }
};

/* ============================================================
   AI Health Insights - Analyzes wellness tracker data for personalized insights
   ============================================================ */
const AIHealthInsights = {
  insights: {},

  // Generate comprehensive health insights from tracker data
  generateInsights() {
    try {
      const trackerData = JSON.parse(localStorage.getItem('wellness_tracker') || '{}');
      if (!trackerData || Object.keys(trackerData).length === 0) {
        return this.getDefaultInsights();
      }

      const entries = Object.values(trackerData);
      const recentEntries = entries.slice(-14); // Last 2 weeks

      this.insights = {
        sleep: this.analyzeSleepPatterns(recentEntries),
        water: this.analyzeHydration(recentEntries),
        mood: this.analyzeMoodPatterns(recentEntries),
        exercise: this.analyzeActivity(recentEntries),
        overall: this.generateOverallAssessment(recentEntries),
        recommendations: this.generatePersonalizedRecommendations(recentEntries)
      };

      return this.insights;
    } catch (e) {
      return this.getDefaultInsights();
    }
  },

  // Analyze sleep patterns
  analyzeSleepPatterns(entries) {
    const sleepEntries = entries.filter(entry => entry.sleep);
    if (sleepEntries.length < 3) return null;

    const avgSleep = sleepEntries.reduce((sum, entry) => sum + entry.sleep, 0) / sleepEntries.length;
    const consistency = this.calculateConsistency(sleepEntries.map(e => e.sleep));

    let assessment = '';
    let score = 0;

    if (avgSleep >= 8) {
      assessment = 'Excellent sleep quality! You\'re getting the recommended 8+ hours.';
      score = 9;
    } else if (avgSleep >= 7) {
      assessment = 'Good sleep duration. Consider quality improvements for optimal rest.';
      score = 7;
    } else if (avgSleep >= 6) {
      assessment = 'Your sleep could be improved. Aim for 7-9 hours nightly.';
      score = 5;
    } else {
      assessment = 'Sleep duration is concerning. Prioritize better sleep hygiene.';
      score = 3;
    }

    return {
      average: avgSleep.toFixed(1),
      consistency: consistency.toFixed(1),
      assessment,
      score,
      trend: this.calculateTrend(sleepEntries.map(e => e.sleep))
    };
  },

  // Analyze hydration patterns
  analyzeHydration(entries) {
    const waterEntries = entries.filter(entry => entry.water);
    if (waterEntries.length < 3) return null;

    const avgWater = waterEntries.reduce((sum, entry) => sum + entry.water, 0) / waterEntries.length;

    let assessment = '';
    let score = 0;

    if (avgWater >= 8) {
      assessment = 'Excellent hydration! You\'re meeting or exceeding daily water goals.';
      score = 9;
    } else if (avgWater >= 6) {
      assessment = 'Good hydration levels. Small increases could optimize your health.';
      score = 7;
    } else if (avgWater >= 4) {
      assessment = 'Hydration needs improvement. Aim for 8 glasses daily.';
      score = 5;
    } else {
      assessment = 'Hydration is low. Increase water intake for better health outcomes.';
      score = 3;
    }

    return {
      average: avgWater.toFixed(1),
      assessment,
      score,
      trend: this.calculateTrend(waterEntries.map(e => e.water))
    };
  },

  // Analyze mood patterns
  analyzeMoodPatterns(entries) {
    const moodEntries = entries.filter(entry => entry.mood);
    if (moodEntries.length < 3) return null;

    const avgMood = moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length;
    const moodRange = Math.max(...moodEntries.map(e => e.mood)) - Math.min(...moodEntries.map(e => e.mood));

    let assessment = '';
    let score = avgMood;

    if (avgMood >= 8) {
      assessment = 'Your mood has been consistently positive. Keep up the great work!';
    } else if (avgMood >= 6) {
      assessment = 'Generally positive mood with room for improvement. Focus on self-care.';
    } else if (avgMood >= 4) {
      assessment = 'Mood fluctuations detected. Consider stress management techniques.';
    } else {
      assessment = 'Lower mood patterns observed. Professional support may be beneficial.';
    }

    return {
      average: avgMood.toFixed(1),
      range: moodRange,
      assessment,
      score,
      trend: this.calculateTrend(moodEntries.map(e => e.mood))
    };
  },

  // Analyze activity levels
  analyzeActivity(entries) {
    const activityEntries = entries.filter(entry => entry.exercise);
    if (activityEntries.length < 3) return null;

    const avgActivity = activityEntries.reduce((sum, entry) => sum + entry.exercise, 0) / activityEntries.length;

    let assessment = '';
    let score = 0;

    if (avgActivity >= 60) {
      assessment = 'Excellent activity level! You\'re exceeding recommended exercise guidelines.';
      score = 9;
    } else if (avgActivity >= 30) {
      assessment = 'Good activity level meeting basic recommendations.';
      score = 7;
    } else if (avgActivity >= 15) {
      assessment = 'Moderate activity. Consider increasing for better health outcomes.';
      score = 5;
    } else {
      assessment = 'Low activity level. Regular movement is important for wellness.';
      score = 3;
    }

    return {
      average: avgActivity.toFixed(0),
      assessment,
      score,
      trend: this.calculateTrend(activityEntries.map(e => e.exercise))
    };
  },

  // Generate overall health assessment
  generateOverallAssessment(entries) {
    const scores = [];
    const analyses = [this.insights.sleep, this.insights.water, this.insights.mood, this.insights.exercise];

    analyses.forEach(analysis => {
      if (analysis && analysis.score) {
        scores.push(analysis.score);
      }
    });

    if (scores.length === 0) return 'Start tracking your wellness data to receive personalized AI insights!';

    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    if (avgScore >= 8) {
      return 'Outstanding wellness habits! You\'re taking excellent care of yourself.';
    } else if (avgScore >= 6) {
      return 'Good overall wellness. Small improvements in key areas could enhance your health.';
    } else if (avgScore >= 4) {
      return 'Several areas could benefit from attention. Focus on consistent healthy habits.';
    } else {
      return 'Your wellness data suggests room for improvement. Consider consulting healthcare professionals for personalized guidance.';
    }
  },

  // Generate personalized recommendations
  generatePersonalizedRecommendations(entries) {
    const recommendations = [];

    if (this.insights.sleep && this.insights.sleep.score < 6) {
      recommendations.push('Consider establishing a consistent sleep schedule and creating a relaxing bedtime routine.');
    }

    if (this.insights.water && this.insights.water.score < 6) {
      recommendations.push('Increase water intake gradually throughout the day. Keep a water bottle nearby as a reminder.');
    }

    if (this.insights.mood && this.insights.mood.score < 6) {
      recommendations.push('Incorporate daily stress-reduction practices like meditation, journaling, or gentle exercise.');
    }

    if (this.insights.exercise && this.insights.exercise.score < 6) {
      recommendations.push('Start with short, enjoyable activities. Even 10-15 minutes daily can make a difference.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Keep up your excellent wellness habits! Consider exploring advanced wellness practices.');
    }

    return recommendations;
  },

  // Helper: Calculate consistency (lower is more consistent)
  calculateConsistency(values) {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  },

  // Helper: Calculate trend (positive = improving, negative = declining)
  calculateTrend(values) {
    if (values.length < 3) return 0;
    const recent = values.slice(-3);
    const earlier = values.slice(-6, -3);

    if (earlier.length === 0) return 0;

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, val) => sum + val, 0) / earlier.length;

    return recentAvg - earlierAvg;
  },

  // Default insights when no data available
  getDefaultInsights() {
    return {
      overall: 'Start tracking your wellness data to unlock personalized AI insights!',
      recommendations: [
        'Begin with the wellness tracker above to log your sleep, water intake, mood, and activity.',
        'Consistency is key - aim to track daily for the most accurate insights.',
        'Use the AI chatbot for immediate wellness support and guidance.'
      ]
    };
  },

  // Update insights display
  updateDisplay() {
    const insights = this.generateInsights();
    const container = document.getElementById('ai-insights-container');

    if (!container) return;

    let html = '<div class="ai-insights-content">';

    // Overall assessment
    html += `<div class="insight-card overall">
      <h3>Overall Wellness Assessment</h3>
      <p>${insights.overall}</p>
    </div>`;

    // Individual metrics
    if (insights.sleep) {
      html += `<div class="insight-card">
        <h4>Sleep Analysis</h4>
        <p><strong>Average:</strong> ${insights.sleep.average} hours/night</p>
        <p>${insights.sleep.assessment}</p>
      </div>`;
    }

    if (insights.water) {
      html += `<div class="insight-card">
        <h4>Hydration Analysis</h4>
        <p><strong>Average:</strong> ${insights.water.average} glasses/day</p>
        <p>${insights.water.assessment}</p>
      </div>`;
    }

    if (insights.mood) {
      html += `<div class="insight-card">
        <h4>Mood Patterns</h4>
        <p><strong>Average Mood:</strong> ${insights.mood.average}/10</p>
        <p>${insights.mood.assessment}</p>
      </div>`;
    }

    if (insights.exercise) {
      html += `<div class="insight-card">
        <h4>Activity Level</h4>
        <p><strong>Average:</strong> ${insights.exercise.average} minutes/day</p>
        <p>${insights.exercise.assessment}</p>
      </div>`;
    }

    // Recommendations
    html += `<div class="insight-card recommendations">
      <h3>Personalized Recommendations</h3>
      <ul>`;
    insights.recommendations.forEach(rec => {
      html += `<li>${rec}</li>`;
    });
    html += `</ul></div>`;

    html += '</div>';
    container.innerHTML = html;
  },

  init() {
    // Update insights when tracker data changes
    const originalSave = WellnessTracker.saveData;
    WellnessTracker.saveData = () => {
      originalSave.call(WellnessTracker);
      setTimeout(() => this.updateDisplay(), 100);
    };

    // Initial display
    setTimeout(() => this.updateDisplay(), 500);
  }
};

/* ============================================================
   AI Symptom Checker - Provides wellness insights based on symptoms
   ============================================================ */
const AISymptomChecker = {
  selectedSymptoms: [],
  symptomDatabase: {
    // Common symptoms and their possible wellness insights
    headache: {
      common: ['stress', 'dehydration', 'lack of sleep', 'eye strain'],
      insights: 'Headaches can often be related to lifestyle factors. Consider your hydration, sleep quality, and stress levels.',
      suggestions: ['Stay hydrated (aim for 8 glasses of water daily)', 'Practice stress-reduction techniques', 'Ensure adequate sleep (7-9 hours)', 'Take regular breaks if working at a screen']
    },
    fatigue: {
      common: ['inadequate sleep', 'poor nutrition', 'dehydration', 'stress'],
      insights: 'Fatigue is your body\'s signal that it needs more care. Focus on restorative practices.',
      suggestions: ['Prioritize 7-9 hours of quality sleep', 'Eat balanced meals with complex carbohydrates', 'Stay hydrated throughout the day', 'Incorporate short rest periods into your day']
    },
    nausea: {
      common: ['digestive issues', 'stress', 'dehydration', 'hormonal changes'],
      insights: 'Nausea can have various causes. Pay attention to patterns and triggers.',
      suggestions: ['Eat small, frequent meals', 'Stay hydrated with clear fluids', 'Try ginger tea or peppermint', 'Practice deep breathing for stress-related nausea']
    },
    'mood changes': {
      common: ['hormonal fluctuations', 'stress', 'sleep issues', 'nutrition'],
      insights: 'Mood fluctuations are common and often related to hormonal cycles or lifestyle factors.',
      suggestions: ['Track patterns in your wellness journal', 'Ensure adequate sleep and nutrition', 'Practice stress management techniques', 'Consider light exercise or meditation']
    },
    'sleep issues': {
      common: ['stress', 'irregular schedule', 'caffeine', 'screen time'],
      insights: 'Quality sleep is foundational to wellness. Small changes can make a big difference.',
      suggestions: ['Maintain a consistent sleep schedule', 'Create a relaxing bedtime routine', 'Limit caffeine after 2 PM', 'Reduce screen time before bed']
    },
    bloating: {
      common: ['digestive sensitivity', 'water retention', 'food intolerances', 'stress'],
      insights: 'Bloating can be influenced by diet, hydration, and stress levels.',
      suggestions: ['Track food intake to identify triggers', 'Stay well-hydrated', 'Eat slowly and mindfully', 'Consider probiotic-rich foods']
    },
    cramps: {
      common: ['menstrual cycle', 'dehydration', 'stress', 'exercise'],
      insights: 'Menstrual cramps are common but can often be managed with lifestyle approaches.',
      suggestions: ['Apply heat to the lower abdomen', 'Stay hydrated and active', 'Try gentle stretching or yoga', 'Track patterns to understand your cycle']
    },
    anxiety: {
      common: ['stress', 'caffeine', 'sleep issues', 'hormonal changes'],
      insights: 'Anxiety can be managed through lifestyle and coping strategies.',
      suggestions: ['Practice deep breathing exercises', 'Maintain regular sleep patterns', 'Limit caffeine intake', 'Try progressive muscle relaxation']
    },
    'low energy': {
      common: ['inadequate sleep', 'poor nutrition', 'dehydration', 'stress'],
      insights: 'Low energy often responds well to basic wellness practices.',
      suggestions: ['Ensure adequate sleep and nutrition', 'Stay hydrated throughout the day', 'Take short breaks for movement', 'Practice stress management']
    }
  },

  // Add symptom to selected list
  addSymptom(symptom) {
    const cleanSymptom = symptom.toLowerCase().trim();
    if (cleanSymptom && !this.selectedSymptoms.includes(cleanSymptom)) {
      this.selectedSymptoms.push(cleanSymptom);
      this.updateSymptomDisplay();
    }
  },

  // Remove symptom from selected list
  removeSymptom(symptom) {
    this.selectedSymptoms = this.selectedSymptoms.filter(s => s !== symptom);
    this.updateSymptomDisplay();
  },

  // Update the display of selected symptoms
  updateSymptomDisplay() {
    const container = document.getElementById('selected-symptoms');
    if (!container) return;

    if (this.selectedSymptoms.length === 0) {
      container.innerHTML = '<p class="no-symptoms">No symptoms selected yet. Add symptoms above to get wellness insights.</p>';
      return;
    }

    let html = '<div class="symptom-tags">';
    this.selectedSymptoms.forEach(symptom => {
      html += `<span class="symptom-tag">
        ${symptom}
        <button onclick="AISymptomChecker.removeSymptom('${symptom}')" aria-label="Remove ${symptom}">×</button>
      </span>`;
    });
    html += '</div>';
    container.innerHTML = html;
  },

  // Analyze selected symptoms and provide insights
  analyzeSymptoms() {
    const resultsContainer = document.getElementById('analysis-results');
    if (!resultsContainer) return;

    if (this.selectedSymptoms.length === 0) {
      resultsContainer.innerHTML = '<div class="analysis-result warning"><p>Please add at least one symptom to analyze.</p></div>';
      return;
    }

    let matchedInsights = [];
    let allSuggestions = new Set();

    // Find matching symptoms in database
    this.selectedSymptoms.forEach(symptom => {
      for (const [key, data] of Object.entries(this.symptomDatabase)) {
        if (symptom.includes(key) || key.includes(symptom)) {
          matchedInsights.push(data);
          data.suggestions.forEach(suggestion => allSuggestions.add(suggestion));
          break;
        }
      }
    });

    // Generate analysis result
    let html = '<div class="analysis-result">';

    if (matchedInsights.length > 0) {
      html += '<h4>Wellness Insights</h4>';

      // Combine insights from matched symptoms
      const combinedInsights = [...new Set(matchedInsights.map(item => item.insights))];
      combinedInsights.forEach(insight => {
        html += `<p>${insight}</p>`;
      });

      html += '<h4>Suggested Wellness Practices</h4><ul>';
      Array.from(allSuggestions).forEach(suggestion => {
        html += `<li>${suggestion}</li>`;
      });
      html += '</ul>';

    } else {
      html += '<h4>General Wellness Guidance</h4>';
      html += '<p>While we don\'t have specific insights for these symptoms, here are some general wellness practices that often help:</p>';
      html += '<ul>';
      html += '<li>Ensure you\'re getting adequate sleep (7-9 hours nightly)</li>';
      html += '<li>Stay well-hydrated with water throughout the day</li>';
      html += '<li>Eat balanced meals with plenty of vegetables and protein</li>';
      html += '<li>Practice stress management techniques like deep breathing</li>';
      html += '<li>Consider light exercise or walking</li>';
      html += '</ul>';
    }

    html += '<div class="analysis-disclaimer">';
    html += '<p><strong>Remember:</strong> This analysis provides general wellness information only. ';
    html += 'For persistent or concerning symptoms, please consult a healthcare professional for proper evaluation and guidance.</p>';
    html += '</div>';

    html += '</div>';
    resultsContainer.innerHTML = html;
  },

  // Clear all symptoms and results
  clearAnalysis() {
    this.selectedSymptoms = [];
    this.updateSymptomDisplay();
    const resultsContainer = document.getElementById('analysis-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = '';
    }
  },

  init() {
    // Symptom input handling
    const input = document.getElementById('symptom-input');
    const addBtn = document.getElementById('symptom-add-btn');
    const analyzeBtn = document.getElementById('analyze-symptoms-btn');

    if (addBtn && input) {
      const addSymptomHandler = () => {
        const symptom = input.value.trim();
        if (symptom) {
          this.addSymptom(symptom);
          input.value = '';
          input.focus();
        }
      };

      addBtn.addEventListener('click', addSymptomHandler);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          addSymptomHandler();
        }
      });
    }

    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => this.analyzeSymptoms());
    }

    // Initialize display
    this.updateSymptomDisplay();
  }
};

/* ============================================================
   Social Media Feed - Community posts and wellness news
   ============================================================ */
const SocialFeed = {
  currentFilter: 'all',
  posts: [
    {
      id: 1,
      platform: 'instagram',
      author: 'WellnessWarrior',
      content: 'Starting my day with gratitude and a green smoothie! 💚 Who else is prioritizing nutrition today?',
      likes: 234,
      comments: 18,
      timestamp: Date.now() - 3600000, // 1 hour ago
      image: '🧃'
    },
    {
      id: 2,
      platform: 'twitter',
      author: 'MindfulMama',
      content: 'Remember: self-care isn\'t selfish, it\'s essential. Taking time for yourself allows you to show up better for others. 🌸 #SelfCare #Wellness',
      likes: 156,
      comments: 12,
      timestamp: Date.now() - 7200000, // 2 hours ago
      image: '🌸'
    },
    {
      id: 3,
      platform: 'facebook',
      author: 'HealthyHabits',
      content: 'Did you know? Walking 10,000 steps a day can reduce stress, improve sleep, and boost your mood! Today\'s goal: Let\'s crush it together! 🚶‍♀️',
      likes: 445,
      comments: 32,
      timestamp: Date.now() - 10800000, // 3 hours ago
      image: '🚶‍♀️'
    },
    {
      id: 4,
      platform: 'instagram',
      author: 'YogaJourney',
      content: 'Morning yoga flow complete! Starting the day with intention and movement. Namaste. 🙏 #Yoga #WellnessJourney',
      likes: 189,
      comments: 15,
      timestamp: Date.now() - 14400000, // 4 hours ago
      image: '🙏'
    },
    {
      id: 5,
      platform: 'twitter',
      author: 'NutritionNotes',
      content: 'Hydration hack: Add cucumber slices and mint to your water for a refreshing twist! Your body will thank you. 💧🥒 #Hydration #HealthyLiving',
      likes: 98,
      comments: 8,
      timestamp: Date.now() - 18000000, // 5 hours ago
      image: '💧'
    },
    {
      id: 6,
      platform: 'facebook',
      author: 'WellnessCommunity',
      content: 'Community reminder: You are worthy of care and attention. Your wellness matters. Take one small step today toward feeling your best. 💪',
      likes: 312,
      comments: 27,
      timestamp: Date.now() - 21600000, // 6 hours ago
      image: '💪'
    }
  ],

  // Filter posts by platform
  filterPosts(platform) {
    this.currentFilter = platform;
    this.renderPosts();

    // Update filter button states
    document.querySelectorAll('.feed-filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.platform === platform);
    });
  },

  // Render posts based on current filter
  renderPosts() {
    const container = document.getElementById('social-posts');
    if (!container) return;

    const filteredPosts = this.currentFilter === 'all'
      ? this.posts
      : this.posts.filter(post => post.platform === this.currentFilter);

    let html = '';
    filteredPosts.forEach(post => {
      const timeAgo = this.getTimeAgo(post.timestamp);
      const platformIcon = this.getPlatformIcon(post.platform);

      html += `
        <div class="social-post-card" data-platform="${post.platform}">
          <div class="post-header">
            <div class="post-author">
              ${platformIcon}
              <span class="author-name">@${post.author}</span>
            </div>
            <span class="post-time">${timeAgo}</span>
          </div>
          <div class="post-content">
            <p>${post.content}</p>
            <div class="post-emoji">${post.image}</div>
          </div>
          <div class="post-stats">
            <span class="stat-item">
              <i class="fa-solid fa-heart"></i> ${post.likes}
            </span>
            <span class="stat-item">
              <i class="fa-solid fa-comment"></i> ${post.comments}
            </span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  // Get platform icon
  getPlatformIcon(platform) {
    const icons = {
      instagram: '<i class="fa-brands fa-instagram"></i>',
      twitter: '<i class="fa-brands fa-twitter"></i>',
      facebook: '<i class="fa-brands fa-facebook"></i>'
    };
    return icons[platform] || '<i class="fa-solid fa-circle"></i>';
  },

  // Get time ago string
  getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      return `${hours}h ago`;
    }
  },

  // Load more posts (simulate API call)
  loadMorePosts() {
    // In a real implementation, this would fetch from an API
    const newPosts = [
      {
        id: 7,
        platform: 'instagram',
        author: 'WellnessJourney',
        content: 'Grateful for small moments of peace in a busy day. How do you find your calm? 🧘‍♀️',
        likes: 167,
        comments: 14,
        timestamp: Date.now() - 25200000,
        image: '🧘‍♀️'
      }
    ];

    this.posts.push(...newPosts);
    this.renderPosts();
  },

  init() {
    // Set up filter buttons
    document.querySelectorAll('.feed-filter').forEach(btn => {
      btn.addEventListener('click', () => this.filterPosts(btn.dataset.platform));
    });

    // Set up load more button
    const loadMoreBtn = document.getElementById('load-more-posts');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => this.loadMorePosts());
    }

    // Initial render
    this.renderPosts();
  }
};

/* ============================================================
   Daily Updates - Daily tips and wellness statistics
   ============================================================ */
const DailyUpdates = {
  dailyTips: [
    "Take 5 deep breaths when feeling stressed - it can instantly calm your nervous system.",
    "Drink water first thing in the morning to rehydrate after sleep.",
    "Spend 10 minutes in nature today - it can boost your mood and reduce stress.",
    "Practice gratitude by noting 3 things you're thankful for before bed.",
    "Move your body in a way that feels good - dance, walk, stretch, whatever brings joy.",
    "Eat a colorful plate - aim for vegetables of different colors for maximum nutrients.",
    "Set a gentle boundary today to protect your energy.",
    "Connect with someone you care about - social connection is vital for wellness.",
    "Get sunlight exposure in the morning to regulate your circadian rhythm.",
    "Practice mindful eating - savor each bite without distractions."
  ],

  // Get a random daily tip
  getRandomTip() {
    const randomIndex = Math.floor(Math.random() * this.dailyTips.length);
    return this.dailyTips[randomIndex];
  },

  // Update daily tip display
  updateDailyTip() {
    const tipElement = document.getElementById('daily-tip');
    if (tipElement) {
      tipElement.textContent = this.getRandomTip();
    }
  },

  // Calculate weekly statistics from wellness tracker
  calculateWeeklyStats() {
    try {
      const trackerData = JSON.parse(localStorage.getItem('wellness_tracker') || '{}');
      const entries = Object.values(trackerData);
      const last7Days = entries.slice(-7);

      if (last7Days.length === 0) return;

      // Calculate averages
      const avgWater = last7Days.reduce((sum, entry) => sum + (entry.water || 0), 0) / last7Days.length;
      const avgSleep = last7Days.reduce((sum, entry) => sum + (entry.sleep || 0), 0) / last7Days.length;
      const avgMood = last7Days.reduce((sum, entry) => sum + (entry.mood || 0), 0) / last7Days.length;
      const activeDays = last7Days.filter(entry => (entry.exercise || 0) > 0).length;

      // Update display
      document.getElementById('week-water').textContent = avgWater.toFixed(1);
      document.getElementById('week-sleep').textContent = avgSleep.toFixed(1);
      document.getElementById('week-mood').textContent = avgMood.toFixed(1);
      document.getElementById('week-activity').textContent = activeDays;
    } catch (e) {
      // Handle gracefully
    }
  },

  init() {
    // Set up new tip button
    const newTipBtn = document.getElementById('new-tip-btn');
    if (newTipBtn) {
      newTipBtn.addEventListener('click', () => this.updateDailyTip());
    }

    // Initial tip and stats
    this.updateDailyTip();
    this.calculateWeeklyStats();

    // Update stats when tracker data changes
    const originalSave = WellnessTracker.saveData;
    WellnessTracker.saveData = () => {
      originalSave.call(WellnessTracker);
      setTimeout(() => this.calculateWeeklyStats(), 100);
    };
  }
};

/* ============================================================
   AuthManager - Login and Sign Up (client-only, localStorage session)
   ============================================================ */
const AuthManager = {
  currentUser: null,

  get storageKey() {
    return 'womens_wellness_user';
  },

  init() {
    this.currentUser = JSON.parse(localStorage.getItem(this.storageKey) || 'null');
    this.updateAuthUI();

    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const authModal = document.getElementById('auth-modal');
    const modalClose = document.getElementById('auth-modal-close');
    const tabLogin = document.getElementById('auth-tab-login');
    const tabSignup = document.getElementById('auth-tab-signup');

    if (loginBtn) loginBtn.addEventListener('click', () => this.openModal('login'));
    if (signupBtn) signupBtn.addEventListener('click', () => this.openModal('signup'));
    if (modalClose) modalClose.addEventListener('click', () => this.closeModal());

    if (authModal) {
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) this.closeModal();
      });
    }

    if (tabLogin) tabLogin.addEventListener('click', () => this.switchTab('login'));
    if (tabSignup) tabSignup.addEventListener('click', () => this.switchTab('signup'));

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    if (signupForm) signupForm.addEventListener('submit', (e) => this.handleSignup(e));

    this.updateAuthMessage('');
  },

  openModal(tab) {
    const overlay = document.getElementById('auth-modal');
    if (!overlay) return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    this.switchTab(tab);
  },

  closeModal() {
    const overlay = document.getElementById('auth-modal');
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    this.updateAuthMessage('');
  },

  switchTab(tab) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const tabLogin = document.getElementById('auth-tab-login');
    const tabSignup = document.getElementById('auth-tab-signup');

    if (tab === 'login') {
      loginForm?.classList.add('visible');
      signupForm?.classList.remove('visible');
      tabLogin?.classList.add('active');
      tabSignup?.classList.remove('active');
      document.getElementById('auth-modal-title').textContent = 'Welcome Back';
    } else {
      loginForm?.classList.remove('visible');
      signupForm?.classList.add('visible');
      tabLogin?.classList.remove('active');
      tabSignup?.classList.add('active');
      document.getElementById('auth-modal-title').textContent = 'Create Account';
    }
    this.updateAuthMessage('');
  },

  handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email')?.value?.trim().toLowerCase();
    const password = document.getElementById('login-password')?.value;

    if (!email || !password) {
      this.updateAuthMessage('Please enter email and password.', 'error');
      return;
    }

    const accounts = JSON.parse(localStorage.getItem('womens_wellness_accounts') || '{}');
    if (!accounts[email] || accounts[email].password !== password) {
      this.updateAuthMessage('Invalid credentials. Please try again or sign up.', 'error');
      return;
    }

    this.currentUser = { name: accounts[email].name, email };
    localStorage.setItem(this.storageKey, JSON.stringify(this.currentUser));
    this.updateAuthUI();
    this.closeModal();
    alert(`Logged in as ${this.currentUser.name}.`);
  },

  handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name')?.value?.trim();
    const email = document.getElementById('signup-email')?.value?.trim().toLowerCase();
    const password = document.getElementById('signup-password')?.value;

    if (!name || !email || !password) {
      this.updateAuthMessage('All fields are required.', 'error');
      return;
    }

    const accounts = JSON.parse(localStorage.getItem('womens_wellness_accounts') || '{}');
    if (accounts[email]) {
      this.updateAuthMessage('Account already exists. Please login.', 'error');
      return;
    }

    accounts[email] = { name, password };
    localStorage.setItem('womens_wellness_accounts', JSON.stringify(accounts));

    this.currentUser = { name, email };
    localStorage.setItem(this.storageKey, JSON.stringify(this.currentUser));
    this.updateAuthUI();
    this.closeModal();
    alert(`Account created and logged in as ${name}.`);
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.storageKey);
    this.updateAuthUI();
    alert('You have logged out.');
  },

  updateAuthUI() {
    const authActions = document.querySelector('.auth-actions');
    if (!authActions) return;

    if (this.currentUser) {
      authActions.innerHTML = `<span class="user-greeting">Hi, ${this.currentUser.name}</span><button class="btn btn-outline" id="logout-btn">Logout</button>`;
      document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
    } else {
      authActions.innerHTML = '<button class="btn btn-outline" id="login-btn">Login</button><button class="btn btn-primary" id="signup-btn">Sign Up</button>';
      document.getElementById('login-btn')?.addEventListener('click', () => this.openModal('login'));
      document.getElementById('signup-btn')?.addEventListener('click', () => this.openModal('signup'));
    }
  },

  updateAuthMessage(message, type = 'info') {
    const authMsg = document.getElementById('auth-message');
    if (!authMsg) return;
    authMsg.textContent = message;
    authMsg.style.color = type === 'error' ? '#c62828' : '#2e7d32';
  }
};

/* ============================================================
   FeedbackForm - Store feedback in localStorage and show confirmation
   ============================================================ */
const FeedbackForm = {
  init() {
    const openBtn = document.getElementById('open-feedback-btn');
    const modal = document.getElementById('feedback-modal');
    const closeBtn = document.getElementById('feedback-modal-close');
    const form = document.getElementById('feedback-form');

    if (openBtn) openBtn.addEventListener('click', () => this.openModal());
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) this.closeModal(); });
    if (form) form.addEventListener('submit', (e) => this.submitFeedback(e));
  },

  openModal() {
    const modal = document.getElementById('feedback-modal');
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  },

  closeModal() {
    const modal = document.getElementById('feedback-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    this.resetForm();
  },

  submitFeedback(event) {
    event.preventDefault();
    const name = document.getElementById('feedback-name')?.value.trim();
    const email = document.getElementById('feedback-email')?.value.trim();
    const message = document.getElementById('feedback-message')?.value.trim();
    const status = document.getElementById('feedback-status');

    if (!name || !email || !message) {
      if (status) status.textContent = 'Please complete all fields.';
      return;
    }

    const feedback = JSON.parse(localStorage.getItem('womens_wellness_feedback') || '[]');
    feedback.push({ name, email, message, timestamp: Date.now() });
    localStorage.setItem('womens_wellness_feedback', JSON.stringify(feedback));

    if (status) status.textContent = 'Thank you! Your feedback has been submitted.';
    this.resetForm();

    setTimeout(() => this.closeModal(), 1500);
  },

  resetForm() {
    const form = document.getElementById('feedback-form');
    form?.reset();
    document.getElementById('feedback-status').textContent = '';
  }
};

/* ============================================================
   Help Desk - Customer support and resources
   ============================================================ */
const HelpDesk = {
  currentView: 'categories',

  faqData: [
    {
      question: "How do I use the wellness tracker?",
      answer: "The wellness tracker allows you to log daily metrics like water intake, sleep hours, mood, and exercise. Simply click on each metric and enter your data. Your information is stored locally and used to provide personalized insights."
    },
    {
      question: "Is my data private and secure?",
      answer: "Yes, all your wellness data is stored locally in your browser. We never collect or transmit your personal health information. Your privacy is our top priority."
    },
    {
      question: "How does the AI chatbot work?",
      answer: "Our AI chatbot provides general wellness information and can analyze your wellness tracker data to offer personalized insights. It's designed to complement professional healthcare advice, not replace it."
    },
    {
      question: "Can I export my wellness data?",
      answer: "Currently, your data is stored locally. We're working on export features. For now, you can view your data in the browser's developer tools under Application > Local Storage."
    },
    {
      question: "How do I reset my wellness tracker?",
      answer: "Use the 'Reset Tracker' button in the wellness tracker section. This will clear all your logged data. Note that this action cannot be undone."
    }
  ],

  resourcesData: [
    {
      title: "Menstrual Health Guide",
      description: "Comprehensive information about menstrual cycles, symptoms, and self-care.",
      type: "Guide"
    },
    {
      title: "Stress Management Techniques",
      description: "Evidence-based strategies for managing stress and anxiety.",
      type: "Article"
    },
    {
      title: "Nutrition for Women",
      description: "Nutritional needs at different life stages and healthy eating tips.",
      type: "Guide"
    },
    {
      title: "Sleep Hygiene Tips",
      description: "Practical advice for improving sleep quality and establishing healthy sleep habits.",
      type: "Article"
    }
  ],

  // Show FAQ section
  showFAQ() {
    this.currentView = 'faq';
    const content = document.getElementById('help-content');
    if (!content) return;

    let html = '<div class="help-section"><h3>Frequently Asked Questions</h3>';
    this.faqData.forEach((faq, index) => {
      html += `
        <div class="faq-item">
          <button class="faq-question" onclick="HelpDesk.toggleFAQ(${index})">
            <span>${faq.question}</span>
            <i class="fa-solid fa-chevron-down"></i>
          </button>
          <div class="faq-answer" id="faq-answer-${index}">
            <p>${faq.answer}</p>
          </div>
        </div>
      `;
    });
    html += '<button class="btn btn-outline" onclick="HelpDesk.showCategories()">Back to Categories</button></div>';
    content.innerHTML = html;
  },

  // Toggle FAQ answer visibility
  toggleFAQ(index) {
    const answer = document.getElementById(`faq-answer-${index}`);
    const question = answer.previousElementSibling;
    const icon = question.querySelector('i');

    answer.classList.toggle('open');
    icon.classList.toggle('fa-chevron-up');
    icon.classList.toggle('fa-chevron-down');
  },

  // Show contact form
  showContactForm() {
    this.currentView = 'contact';
    const content = document.getElementById('help-content');
    if (!content) return;

    const html = `
      <div class="help-section">
        <h3>Contact Support</h3>
        <form id="contact-form" class="contact-form">
          <div class="form-group">
            <label for="contact-name">Name</label>
            <input type="text" id="contact-name" required>
          </div>
          <div class="form-group">
            <label for="contact-email">Email</label>
            <input type="email" id="contact-email" required>
          </div>
          <div class="form-group">
            <label for="contact-subject">Subject</label>
            <select id="contact-subject" required>
              <option value="">Select a topic</option>
              <option value="technical">Technical Issue</option>
              <option value="wellness">Wellness Question</option>
              <option value="feedback">Feedback</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label for="contact-message">Message</label>
            <textarea id="contact-message" rows="5" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Send Message</button>
        </form>
        <button class="btn btn-outline" onclick="HelpDesk.showCategories()">Back to Categories</button>
      </div>
    `;
    content.innerHTML = html;

    // Set up form submission
    const form = document.getElementById('contact-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleContactSubmit(e));
    }
  },

  // Handle contact form submission
  handleContactSubmit(e) {
    e.preventDefault();
    // In a real implementation, this would send to a server
    alert('Thank you for your message! Our support team will respond within 24 hours.');
    this.showCategories();
  },

  // Show resources
  showResources() {
    this.currentView = 'resources';
    const content = document.getElementById('help-content');
    if (!content) return;

    let html = '<div class="help-section"><h3>Helpful Resources</h3>';
    this.resourcesData.forEach(resource => {
      html += `
        <div class="resource-card">
          <div class="resource-header">
            <h4>${resource.title}</h4>
            <span class="resource-type">${resource.type}</span>
          </div>
          <p>${resource.description}</p>
          <button class="btn btn-outline btn-small">Read More</button>
        </div>
      `;
    });
    html += '<button class="btn btn-outline" onclick="HelpDesk.showCategories()">Back to Categories</button></div>';
    content.innerHTML = html;
  },

  // Show community section
  showCommunity() {
    this.currentView = 'community';
    const content = document.getElementById('help-content');
    if (!content) return;

    const html = `
      <div class="help-section">
        <h3>Join Our Community</h3>
        <p>Connect with other women on their wellness journeys. Share experiences, get support, and learn together.</p>

        <div class="community-links">
          <a href="#" class="community-link">
            <i class="fa-brands fa-facebook"></i>
            <span>Facebook Group</span>
          </a>
          <a href="#" class="community-link">
            <i class="fa-brands fa-instagram"></i>
            <span>Instagram Community</span>
          </a>
          <a href="#" class="community-link">
            <i class="fa-brands fa-discord"></i>
            <span>Discord Server</span>
          </a>
        </div>

        <div class="community-guidelines">
          <h4>Community Guidelines</h4>
          <ul>
            <li>Be respectful and supportive of all members</li>
            <li>Share personal experiences responsibly</li>
            <li>Consult healthcare professionals for medical advice</li>
            <li>Report inappropriate content</li>
          </ul>
        </div>

        <button class="btn btn-outline" onclick="HelpDesk.showCategories()">Back to Categories</button>
      </div>
    `;
    content.innerHTML = html;
  },

  // Show main categories
  showCategories() {
    this.currentView = 'categories';
    const content = document.getElementById('help-content');
    if (!content) return;

    content.innerHTML = `
      <div class="help-welcome">
        <h3>How can we help you today?</h3>
        <p>Select a category above to get started, or use our AI chatbot for immediate assistance.</p>
      </div>
    `;
  },

  init() {
    // Initialize with welcome message
    this.showCategories();
  }
};

/* ============================================================
   NewsletterForm
   Email validation and submission handling.
   ============================================================ */
const NewsletterForm = {
  /** Basic email validation. */
  _isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  init() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      const msg = form.querySelector('.newsletter-msg');
      if (!input || !msg) return;

      const value = input.value.trim();

      if (this._isValidEmail(value)) {
        msg.textContent = 'Thank you for subscribing!';
        msg.className = 'newsletter-msg success';
        input.value = '';
      } else {
        msg.textContent = 'Please enter a valid email address.';
        msg.className = 'newsletter-msg error';
      }
    });
  }
};

/* ============================================================
   App Initialization
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS if available
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 700, once: true, offset: 80 });
  }

  // Hero CTA scroll
  const ctaBtn = document.querySelector('.cta-btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('physical-health');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  ThemeManager.init();
  NavManager.init();
  WellnessTracker.init();
  Carousel.init();
  AuthManager.init();
  AIChatbot.init();
  AIHealthInsights.init();
  AISymptomChecker.init();
  SocialFeed.init();
  DailyUpdates.init();
  FeedbackForm.init();
  HelpDesk.init();
  AccordionTabs.init();
  NewsletterForm.init();
});
