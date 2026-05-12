/**
 * TYPEFLOW - CORE ENGINE
 * Modular JavaScript for Auth, Stats, UI, and Game Logic.
 */

// ==========================================
// 1. CONFIGURATION & DATA
// ==========================================
const CONFIG = {
    MODES: {
        normal: { time: 60, hasTimer: true, hardcore: false },
        zen: { time: 0, hasTimer: false, hardcore: false },
        hardcore: { time: 0, hasTimer: false, hardcore: true }
    },
    LEVEL_XP: 1000, // XP needed per level
    MAX_HISTORY: 20,
    SOUNDS: {
        click: "https://www.soundjay.com/button/sounds/button-16.mp3"
    },
    TEXT_DATA: {
        general: [
            "The quick brown fox jumps over the lazy dog in a spectacular display of agility and speed.",
            "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "In the middle of every difficulty lies opportunity for those who are brave enough to seek it.",
            "Design is not just what it looks like and feels like. Design is how it works and interacts with the user.",
            "A person who never made a mistake never tried anything new or pushed their creative boundaries."
        ],
        code: [
            "function calculateWpm(words, time) { return Math.round((words / time) * 60); }",
            "const glassPanel = document.querySelector('.glass-panel'); glassPanel.style.backdropFilter = 'blur(12px)';",
            "async function fetchQuotes() { const response = await fetch('https://api.quotable.io/random'); return response.json(); }",
            "export default class TyperEngine { constructor(config) { this.config = config; this.isPlaying = false; } }",
            "document.addEventListener('keydown', (e) => { if(e.key === 'Escape') game.reset(); });"
        ],
        quotes: [] // Will be fetched from API
    }
};

// ==========================================
// 2. AUTHENTICATION MODULE
// ==========================================
const auth = {
    getCurrentUser: () => localStorage.getItem("loggedUser") || "guest",
    
    login: () => {
        const user = document.getElementById('logUser').value.trim().toLowerCase();
        const pass = document.getElementById('logPass').value.trim();
        const error = document.getElementById('authError');

        if (!user || !pass) { error.textContent = "Please fill all fields."; return; }
        
        const savedPass = localStorage.getItem(`user_${user}`);
        if (savedPass === pass) {
            localStorage.setItem("loggedUser", user);
            window.location.href = "index.html";
        } else {
            error.textContent = "Invalid username or password.";
        }
    },

    register: () => {
        const user = document.getElementById('regUser').value.trim().toLowerCase();
        const pass = document.getElementById('regPass').value.trim();
        const confirm = document.getElementById('regConfirm').value.trim();
        const error = document.getElementById('authError');

        if (!user || !pass || !confirm) { error.textContent = "All fields are required."; return; }
        if (pass !== confirm) { error.textContent = "Passwords do not match."; return; }
        if (localStorage.getItem(`user_${user}`)) { error.textContent = "Username already taken."; return; }

        localStorage.setItem(`user_${user}`, pass);
        // Initialize default stats
        stats.initUserData(user);
        
        alert("Account created! You can now sign in.");
        document.getElementById('regForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    },

    logout: () => {
        localStorage.removeItem("loggedUser");
        // Seamlessly update UI without redirecting
        game.updateAuthUI();
        ui.showNotification("Logged out. Switched to Guest mode.");
        
        // Close settings if open
        const modal = document.getElementById('settingsModal');
        if (modal) modal.style.display = 'none';

        // If on dashboard, refresh stats for guest
        if (window.location.pathname.includes("dashboard.html")) {
            stats.initDashboard();
        }
    },

    saveSettings: () => {
        const user = auth.getCurrentUser();
        const newName = document.getElementById('setUserName').value.trim();
        const newCountry = document.getElementById('setUserCountry').value.trim();
        const oldPassInput = document.getElementById('confirmOldPass').value.trim();
        const newPass = document.getElementById('setNewPass').value.trim();

        const data = stats.getData();
        
        // Handle Password Change Verification
        if (newPass && user !== "guest") {
            const actualOldPass = localStorage.getItem(`user_${user}`);
            if (oldPassInput !== actualOldPass) {
                ui.showNotification("Security: Old password incorrect.");
                return;
            }
            localStorage.setItem(`user_${user}`, newPass);
            ui.showNotification("Password updated successfully.");
        }

        if (newName && user !== "guest") {
            data.displayName = newName;
        }
        data.country = newCountry;

        stats.saveData(data);
        ui.showNotification("Settings saved!");
        ui.toggleSettings();
        game.updateAuthUI();
    }
};

// ==========================================
// 3. STATS & ANALYTICS MODULE
// ==========================================
const stats = {
    initUserData: (user) => {
        const defaults = {
            xp: 0,
            level: 1,
            bestWpm: 0,
            bestAcc: 0,
            history: []
        };
        localStorage.setItem(`stats_${user}`, JSON.stringify(defaults));
    },

    getData: () => {
        const user = auth.getCurrentUser();
        return JSON.parse(localStorage.getItem(`stats_${user}`)) || { xp: 0, level: 1, bestWpm: 0, bestAcc: 0, history: [] };
    },

    saveData: (data) => {
        const user = auth.getCurrentUser();
        localStorage.setItem(`stats_${user}`, JSON.stringify(data));
    },

    addMatch: (wpm, acc) => {
        const user = auth.getCurrentUser();
        
        // Initialize guest data if needed
        if (user === "guest" && !localStorage.getItem(`stats_guest`)) {
            stats.initUserData("guest");
        }

        const data = stats.getData();
        
        // XP Calculation: WPM * Accuracy
        const xpGained = Math.round(wpm * (acc / 100) * 10);
        data.xp += xpGained;

        // Level Up
        if (data.xp >= data.level * CONFIG.LEVEL_XP) {
            data.xp -= (data.level * CONFIG.LEVEL_XP);
            data.level++;
            ui.showNotification(`Level Up! You are now Level ${data.level}`);
        }

        // Bests
        if (wpm > data.bestWpm) data.bestWpm = wpm;
        if (acc > data.bestAcc) data.bestAcc = acc;

        // History
        data.history.push({ wpm, acc, date: new Date().toLocaleDateString() });
        if (data.history.length > CONFIG.MAX_HISTORY) data.history.shift();

        stats.saveData(data);
    },

    initDashboard: () => {
        const data = stats.getData();
        const user = auth.getCurrentUser();

        document.getElementById('userName').textContent = user.charAt(0).toUpperCase() + user.slice(1);
        document.getElementById('userLevel').textContent = `Level ${data.level}`;

        if (user === "guest" && document.getElementById('guestNotice')) {
            document.getElementById('guestNotice').style.display = 'block';
        }
        document.getElementById('xpText').textContent = `${data.xp} / ${data.level * CONFIG.LEVEL_XP}`;
        document.getElementById('xpFill').style.width = `${(data.xp / (data.level * CONFIG.LEVEL_XP)) * 100}%`;
        document.getElementById('bestWpm').textContent = data.bestWpm;
        document.getElementById('bestAcc').textContent = `${data.bestAcc}%`;

        // Render Activity Log
        const log = document.getElementById('activityLog');
        if (data.history.length > 0) {
            log.innerHTML = data.history.reverse().map(m => `
                <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid var(--surface-border);">
                    <span>${m.date}</span>
                    <span style="font-weight: 700;">${m.wpm} WPM <span style="color:var(--text-dim); font-weight: 400;">(${m.acc}%)</span></span>
                </div>
            `).join('');
        }

        // Render Chart
        const ctx = document.getElementById('performanceChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.history.map(h => h.date),
                datasets: [{
                    label: 'WPM',
                    data: data.history.map(h => h.wpm),
                    borderColor: '#8b5cf6',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(139, 92, 246, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
};

// ==========================================
// 4. UI MODULE
// ==========================================
const ui = {
    updateStats: (wpm, acc, streak, time) => {
        document.getElementById('wpm').textContent = wpm;
        document.getElementById('accuracy').textContent = `${acc}%`;
        document.getElementById('streak').textContent = streak;
        if (time !== null) document.getElementById('timer').textContent = `${time}s`;
    },

    highlightKey: (key) => {
        const el = document.querySelector(`.key[data-key="${key.toLowerCase()}"]`);
        if (el) {
            el.classList.add('active');
            setTimeout(() => el.classList.remove('active'), 100);
        }
    },

    createParticle: (x, y, color) => {
        const container = document.getElementById('displayContainer');
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        p.style.width = '4px';
        p.style.height = '4px';
        p.style.backgroundColor = color;
        container.appendChild(p);
        setTimeout(() => p.remove(), 600);
    },

    showNotification: (msg) => {
        const n = document.createElement('div');
        n.style.cssText = `
            position: fixed; top: 20px; right: 20px; background: var(--primary);
            color: white; padding: 15px 25px; border-radius: 12px; z-index: 3000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: slideIn 0.5s forwards;
        `;
        n.textContent = msg;
        document.body.appendChild(n);
        setTimeout(() => {
            n.style.opacity = '0';
            n.style.transition = 'opacity 0.5s';
            setTimeout(() => n.remove(), 500);
        }, 3000);
    },

    toggleSettings: () => {
        const modal = document.getElementById('settingsModal');
        if (!modal) return;
        
        if (modal.style.display === 'none') {
            const data = stats.getData();
            const user = auth.getCurrentUser();
            document.getElementById('setUserName').value = data.displayName || user;
            document.getElementById('setUserCountry').value = data.country || "";
            document.getElementById('setNewPass').value = "";
            
            if (data.profilePic) {
                document.getElementById('profilePreview').innerHTML = `<img src="${data.profilePic}">`;
            }

            modal.style.display = 'flex';
        } else {
            modal.style.display = 'none';
        }
    },

    handleProfileUpload: (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            document.getElementById('profilePreview').innerHTML = `<img src="${base64}">`;
            
            const data = stats.getData();
            data.profilePic = base64;
            stats.saveData(data);
            ui.showNotification("Profile photo updated!");
        };
        reader.readAsDataURL(file);
    }
};

// ==========================================
// 5. GAME ENGINE MODULE
// ==========================================
const game = {
    isPlaying: false,
    text: "",
    typed: "",
    timer: null,
    timeRemaining: 60,
    startTime: null,
    streak: 0,
    correctChars: 0,
    soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
    audioCtx: null,
    audioBuffer: null,

    init: () => {
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');
        const inputBox = document.getElementById('inputBox');
        const soundToggle = document.getElementById('soundToggle');

        // Initialize Web Audio on first click
        const initAudio = () => {
            if (game.audioCtx) return;
            game.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        };

        window.addEventListener('mousedown', initAudio, { once: true });
        window.addEventListener('keydown', initAudio, { once: true });

        if (soundToggle) {
            soundToggle.textContent = game.soundEnabled ? "🔊 Sound: ON" : "🔈 Sound: OFF";
            soundToggle.addEventListener('click', () => {
                game.soundEnabled = !game.soundEnabled;
                localStorage.setItem('soundEnabled', game.soundEnabled);
                soundToggle.textContent = game.soundEnabled ? "🔊 Sound: ON" : "🔈 Sound: OFF";
            });
        }

        if (!startBtn) return;

        startBtn.addEventListener('click', () => game.start());
        restartBtn.addEventListener('click', () => game.reset());
        inputBox.addEventListener('input', (e) => game.handleInput(e));
        
        // Focus redirection
        const displayContainer = document.getElementById('displayContainer');
        if (displayContainer) {
            displayContainer.addEventListener('click', () => {
                if (game.isPlaying) inputBox.focus();
            });
        }
        
        // Ensure nav links update
        game.updateAuthUI();
    },

    updateAuthUI: () => {
        const loggedUser = localStorage.getItem("loggedUser");
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const userNameDisplay = document.getElementById('userLabel'); 

        if (loggedUser) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (settingsBtn) settingsBtn.style.display = 'block';
            if (userNameDisplay) userNameDisplay.textContent = `Player: ${loggedUser}`;
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (signupBtn) signupBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (settingsBtn) settingsBtn.style.display = 'none';
            if (userNameDisplay) userNameDisplay.textContent = `Player: Guest`;
        }
    },

    start: async () => {
        const countdown = document.getElementById('countdownOverlay');
        const startBtn = document.getElementById('startBtn');
        
        // "Unlock" audio context for browser autoplay policies
        if (game.clickAudio) {
            game.clickAudio.play().then(() => {
                game.clickAudio.pause();
                game.clickAudio.currentTime = 0;
            }).catch(e => console.log("Audio unlock failed:", e));
        }

        startBtn.disabled = true;
        countdown.style.display = 'block';
        let count = 3;
        countdown.textContent = count;

        const interval = setInterval(() => {
            count--;
            countdown.textContent = count;
            if (count === 0) {
                clearInterval(interval);
                countdown.style.display = 'none';
                game.run();
            }
        }, 1000);
    },

    run: async () => {
        game.isPlaying = true;
        game.typed = "";
        game.streak = 0;
        game.correctChars = 0;
        
        const mode = document.getElementById('modeSelect').value;
        const category = document.getElementById('categorySelect').value;
        
        game.timeRemaining = CONFIG.MODES[mode].time;
        game.text = await game.getText(category);
        
        document.getElementById('textDisplay').innerHTML = game.renderText();
        document.getElementById('restartBtn').style.display = 'block';
        document.getElementById('startBtn').style.display = 'none';
        
        const inputBox = document.getElementById('inputBox');
        inputBox.value = "";
        inputBox.disabled = false;
        inputBox.focus();

        game.startTime = Date.now();

        // Ghost Mode Init
        const data = stats.getData();
        if (data.bestWpm > 0) {
            document.getElementById('pbLabel').style.opacity = "1";
            let ghostProgress = 0;
            const ghostInterval = setInterval(() => {
                if (!game.isPlaying) { clearInterval(ghostInterval); return; }
                const elapsed = (Date.now() - game.startTime) / 1000;
                // Ghost position based on bestWpm
                ghostProgress = (elapsed * (data.bestWpm / 60) * 5) / game.text.length * 100;
                document.getElementById('ghostBar').style.width = `${Math.min(ghostProgress, 100)}%`;
            }, 100);
        }

        if (CONFIG.MODES[mode].hasTimer) {
            game.timer = setInterval(() => {
                game.timeRemaining--;
                ui.updateStats(game.calculateWpm(), game.calculateAcc(), game.streak, game.timeRemaining);
                if (game.timeRemaining <= 0) game.end();
            }, 1000);
        } else {
            ui.updateStats(0, 0, 0, "--");
        }
    },

    getText: async (cat) => {
        try {
            if (cat === 'quotes') {
                const res = await fetch('https://api.quotable.io/random');
                const data = await res.json();
                return data.content;
            }
            if (cat === 'wiki') {
                const res = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
                const data = await res.json();
                return data.extract.split('.').slice(0, 2).join('.') + '.'; // Get first 2 sentences
            }
            if (cat === 'advice') {
                const res = await fetch('https://api.adviceslip.com/advice');
                const data = await res.json();
                return data.slip.advice;
            }
            if (cat === 'facts') {
                const res = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
                const data = await res.json();
                return data.text;
            }
        } catch (err) {
            console.error("API Fetch Error:", err);
            return CONFIG.TEXT_DATA.general[Math.floor(Math.random() * CONFIG.TEXT_DATA.general.length)];
        }
        const arr = CONFIG.TEXT_DATA[cat];
        return arr[Math.floor(Math.random() * arr.length)];
    },

    handleInput: (e) => {
        if (!game.isPlaying) return;
        
        const val = e.target.value;
        const lastChar = val.slice(-1);
        ui.highlightKey(lastChar);

        // Play Sound (Synthesized Click)
        if (game.soundEnabled && val.length > game.typed.length) {
            if (game.audioCtx) {
                if (game.audioCtx.state === 'suspended') game.audioCtx.resume();
                
                const osc = game.audioCtx.createOscillator();
                const gain = game.audioCtx.createGain();
                
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, game.audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(40, game.audioCtx.currentTime + 0.1);
                
                gain.gain.setValueAtTime(0.1, game.audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, game.audioCtx.currentTime + 0.1);
                
                osc.connect(gain);
                gain.connect(game.audioCtx.destination);
                
                osc.start();
                osc.stop(game.audioCtx.currentTime + 0.1);
            }
        }

        // Hardcore check
        const mode = document.getElementById('modeSelect').value;
        if (CONFIG.MODES[mode].hardcore) {
            if (val[val.length - 1] !== game.text[val.length - 1]) {
                game.end(true);
                return;
            }
        }

        // Particles on success
        if (val[val.length - 1] === game.text[val.length - 1]) {
            const container = document.getElementById('displayContainer');
            const rect = container.getBoundingClientRect();
            ui.createParticle(Math.random() * rect.width, Math.random() * rect.height, '#00ff99');
        }

        game.typed = val;
        document.getElementById('textDisplay').innerHTML = game.renderText();
        
        // Update Stats
        const wpm = game.calculateWpm();
        const acc = game.calculateAcc();
        ui.updateStats(wpm, acc, game.streak, CONFIG.MODES[mode].hasTimer ? game.timeRemaining : null);

        // Completion check
        if (game.typed.length >= game.text.length) {
            game.end();
        }
    },

    renderText: () => {
        let html = "";
        game.correctChars = 0;
        for (let i = 0; i < game.text.length; i++) {
            let charClass = "";
            if (i < game.typed.length) {
                if (game.typed[i] === game.text[i]) {
                    charClass = "char-correct";
                    game.correctChars++;
                    if (i === game.typed.length - 1) game.streak++;
                } else {
                    charClass = "char-incorrect";
                    game.streak = 0;
                }
            } else if (i === game.typed.length) {
                charClass = "char-current";
            }
            html += `<span class="${charClass}">${game.text[i]}</span>`;
        }
        return html;
    },

    calculateWpm: () => {
        const timeElapsed = (Date.now() - game.startTime) / 60000; // in minutes
        if (timeElapsed <= 0) return 0;
        const words = game.typed.length / 5;
        return Math.round(words / timeElapsed);
    },

    calculateAcc: () => {
        if (game.typed.length === 0) return 100;
        return Math.round((game.correctChars / game.typed.length) * 100);
    },

    end: (failed = false) => {
        clearInterval(game.timer);
        game.isPlaying = false;
        document.getElementById('inputBox').disabled = true;
        
        if (failed) {
            document.getElementById('textDisplay').innerHTML = `<span style="color:var(--error)">💀 FAILED (Hardcore Mode)</span>`;
        } else {
            const wpm = game.calculateWpm();
            const acc = game.calculateAcc();
            stats.addMatch(wpm, acc);
            ui.showNotification(`Great job! ${wpm} WPM attained.`);
            
            // CONFETTI!
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#8b5cf6', '#2dd4bf', '#10b981']
            });
        }

        document.getElementById('startBtn').style.display = 'block';
        document.getElementById('startBtn').disabled = false;
        document.getElementById('startBtn').textContent = "Train Again";
    },

    reset: () => {
        clearInterval(game.timer);
        game.isPlaying = false;
        game.typed = "";
        game.streak = 0;
        document.getElementById('inputBox').value = "";
        document.getElementById('inputBox').disabled = true;
        document.getElementById('textDisplay').textContent = "Select a mode and click Start to begin...";
        document.getElementById('startBtn').style.display = 'block';
        document.getElementById('startBtn').disabled = false;
        document.getElementById('startBtn').textContent = "Start Training";
        document.getElementById('restartBtn').style.display = 'none';
        ui.updateStats(0, 0, 0, 60);
    }
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    game.init();
});