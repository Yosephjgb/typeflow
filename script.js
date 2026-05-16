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
    },
    FINGER_MAP: {
        '`': 'l-pinky', '1': 'l-pinky', 'q': 'l-pinky', 'a': 'l-pinky', 'z': 'l-pinky',
        '2': 'l-ring', 'w': 'l-ring', 's': 'l-ring', 'x': 'l-ring',
        '3': 'l-middle', 'e': 'l-middle', 'd': 'l-middle', 'c': 'l-middle',
        '4': 'l-index', '5': 'l-index', 'r': 'l-index', 't': 'l-index', 'f': 'l-index', 'g': 'l-index', 'v': 'l-index', 'b': 'l-index',
        '6': 'r-index', '7': 'r-index', 'y': 'r-index', 'u': 'r-index', 'h': 'r-index', 'j': 'r-index', 'n': 'r-index', 'm': 'r-index',
        '8': 'r-middle', 'i': 'r-middle', 'k': 'r-middle', ',': 'r-middle',
        '9': 'r-ring', 'o': 'r-ring', 'l': 'r-ring', '.': 'r-ring',
        '0': 'r-pinky', '-': 'r-pinky', '=': 'r-pinky', 'p': 'r-pinky', '[': 'r-pinky', ']': 'r-pinky', '\\': 'r-pinky', 'enter': 'r-pinky', 'backspace': 'r-pinky', ';': 'r-pinky', "'": 'r-pinky', '/': 'r-pinky',
        ' ': 'r-thumb'
    }
};

// ==========================================
// 2. AUTHENTICATION MODULE
// ==========================================
// ==========================================
// 2. AUTHENTICATION MODULE (PHP VERSION)
// ==========================================
let currentUser = null;
let currentAvatar = 'default-avatar.png';

const auth = {
    checkSession: async () => {
        try {
            const res = await fetch('auth.php?action=check');
            const data = await res.json();
            if (data.loggedIn) {
                currentUser = data.username;
                currentAvatar = data.avatar || 'default-avatar.png';
            } else {
                currentUser = null;
                currentAvatar = 'default-avatar.png';
            }
            game.updateAuthUI();
        } catch (e) { console.error("Session check failed", e); }
    },

    getCurrentUser: () => currentUser || "guest",
    getAvatar: () => currentAvatar,
    
    login: async () => {
        const user = document.getElementById('logUser').value.trim().toLowerCase();
        const pass = document.getElementById('logPass').value.trim();
        const error = document.getElementById('authError');

        if (!user || !pass) { error.textContent = "Please fill all fields."; return; }
        
        try {
            const res = await fetch('auth.php?action=login', {
                method: 'POST',
                body: JSON.stringify({ username: user, password: pass })
            });
            const result = await res.json();
            if (result.success) {
                currentUser = result.username;
                window.location.href = "index.html";
            } else {
                error.textContent = result.message;
            }
        } catch (e) { error.textContent = "Login server error."; }
    },

    register: async () => {
        const user = document.getElementById('regUser').value.trim().toLowerCase();
        const pass = document.getElementById('regPass').value.trim();
        const confirm = document.getElementById('regConfirm').value.trim();
        const error = document.getElementById('authError');

        if (!user || !pass || !confirm) { error.textContent = "All fields are required."; return; }
        if (pass !== confirm) { error.textContent = "Passwords do not match."; return; }

        try {
            const res = await fetch('auth.php?action=register', {
                method: 'POST',
                body: JSON.stringify({ username: user, password: pass })
            });
            const result = await res.json();
            if (result.success) {
                alert("Account created! You can now sign in.");
                document.getElementById('regForm').style.display = 'none';
                document.getElementById('loginForm').style.display = 'block';
            } else {
                error.textContent = result.message;
            }
        } catch (e) { error.textContent = "Registration server error."; }
    },

    logout: async () => {
        await fetch('auth.php?action=logout');
        currentUser = null;
        game.updateAuthUI();
        ui.showNotification("Logged out. Switched to Guest mode.");
        
        if (window.location.pathname.includes("dashboard.html")) {
            window.location.href = "index.html";
        }
    },

    saveSettings: async () => {
        const user = auth.getCurrentUser();
        const newName = document.getElementById('setUserName').value.trim();
        const newPass = document.getElementById('setNewPass').value.trim();
        const oldPass = document.getElementById('confirmOldPass').value.trim();

        if (user === "guest") {
            ui.showNotification("Guests cannot change settings.");
            return;
        }

        try {
            const res = await fetch('auth.php?action=update_profile', {
                method: 'POST',
                body: JSON.stringify({
                    displayName: newName,
                    newPassword: newPass,
                    oldPassword: oldPass
                })
            });
            const result = await res.json();
            
            if (result.success) {
                ui.showNotification("Settings saved successfully!");
                ui.toggleSettings();
            } else {
                ui.showNotification("Error: " + result.message);
            }
        } catch (e) {
            ui.showNotification("Server error while saving settings.");
        }
    },

    uploadAvatar: async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await fetch('upload.php', {
                method: 'POST',
                body: formData
            });
            const result = await res.json();
            if (result.success) {
                currentAvatar = result.avatar;
                game.updateAuthUI();
                ui.showNotification("Profile picture updated!");
            } else {
                ui.showNotification("Upload failed: " + result.message);
            }
        } catch (e) {
            ui.showNotification("Server error during upload.");
        }
    }
};

// ==========================================
// 3. STATS & ANALYTICS MODULE
// ==========================================
// ==========================================
// 3. STATS & ANALYTICS MODULE (PHP VERSION)
// ==========================================
const stats = {
    cachedData: null,

    getData: async () => {
        const user = auth.getCurrentUser();
        if (user === "guest") {
            return JSON.parse(localStorage.getItem(`stats_guest`)) || { xp: 0, level: 1, bestWpm: 0, bestAcc: 0, history: [] };
        }

        try {
            const res = await fetch('stats.php?action=load');
            const result = await res.json();
            if (result.success) {
                return result.data;
            }
        } catch (e) { console.error("Failed to load stats", e); }
        
        return { xp: 0, level: 1, bestWpm: 0, bestAcc: 0, history: [] };
    },

    saveData: async (data) => {
        const user = auth.getCurrentUser();
        if (user === "guest") {
            localStorage.setItem(`stats_guest`, JSON.stringify(data));
            return;
        }

        try {
            await fetch('stats.php?action=save', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        } catch (e) { console.error("Failed to save stats", e); }
    },

    addMatch: async (wpm, acc) => {
        const data = await stats.getData();
        
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

        await stats.saveData(data);
    },

    initDashboard: async () => {
        const data = await stats.getData();
        const user = auth.getCurrentUser();

        document.getElementById('userName').textContent = user.charAt(0).toUpperCase() + user.slice(1);
        document.getElementById('userLevel').textContent = `Level ${data.level}`;

        if (user === "guest" && document.getElementById('guestNotice')) {
            document.getElementById('guestNotice').style.display = 'block';
        } else if (document.getElementById('guestNotice')) {
            document.getElementById('guestNotice').style.display = 'none';
        }

        document.getElementById('xpText').textContent = `${data.xp} / ${data.level * CONFIG.LEVEL_XP}`;
        document.getElementById('xpFill').style.width = `${(data.xp / (data.level * CONFIG.LEVEL_XP)) * 100}%`;
        document.getElementById('bestWpm').textContent = data.bestWpm;
        document.getElementById('bestAcc').textContent = `${data.bestAcc}%`;

        // Render Activity Log
        const log = document.getElementById('activityLog');
        if (data.history && data.history.length > 0) {
            log.innerHTML = [...data.history].reverse().map(m => `
                <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid var(--surface-border);">
                    <span>${m.date}</span>
                    <span style="font-weight: 700;">${m.wpm} WPM <span style="color:var(--text-dim); font-weight: 400;">(${m.acc}%)</span></span>
                </div>
            `).join('');
        }

        // Render Chart
        if (document.getElementById('performanceChart')) {
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
    }
};

// ==========================================
// 4. UI MODULE
// ==========================================
const ui = {
    updateStats: (wpm, acc, streak, time) => {
        document.getElementById('wpm').textContent = wpm;
        document.getElementById('accuracy').textContent = `${acc}%`;
        const streakEl = document.getElementById('streak');
        if (streakEl) streakEl.textContent = streak;
        if (time !== null) document.getElementById('timer').textContent = `${time}s`;
    },

    highlightKey: (key) => {
        const k = key.toLowerCase();
        const el = document.querySelector(`.key[data-key="${k}"]`);
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
        auth.uploadAvatar(e);
    },

    renderHeatmap: (missedKeys) => {
        const container = document.getElementById('heatmapKeyboard');
        if (!container) return;

        const maxMisses = Math.max(...Object.values(missedKeys), 1);
        const rows = [
            ['`','1','2','3','4','5','6','7','8','9','0','-','=','BS'],
            ['Tab','q','w','e','r','t','y','u','i','o','p','[',']','\\'],
            ['Caps','a','s','d','f','g','h','j','k','l',';',"'",'Enter'],
            ['Shift','z','x','c','v','b','n','m',',','.','/','Shift'],
            ['Ctrl','Alt',' ','Alt','Ctrl']
        ];
        const wideKeys = new Set(['BS','Tab','Caps','Enter','Shift','Ctrl','Alt']);
        const extraWide = new Set([' ']);

        container.innerHTML = rows.map(row => `
            <div style="display:flex; gap:5px; margin-bottom:5px; justify-content:center; flex-wrap:nowrap;">
                ${row.map(k => {
                    const lookup = k.toLowerCase() === 'space' ? ' ' : k.toLowerCase();
                    const count = missedKeys[lookup] || 0;
                    const intensity = count / maxMisses;
                    const bg = count > 0
                        ? `rgba(239,68,68,${0.2 + intensity * 0.8})`
                        : 'rgba(255,255,255,0.03)';
                    const border = count > 0 ? `rgba(239,68,68,${0.4 + intensity * 0.6})` : 'rgba(255,255,255,0.1)';
                    const label = k === ' ' ? 'SPACE' : k;
                    const minW = extraWide.has(k) ? '120px' : wideKeys.has(k) ? '52px' : '32px';
                    const title = count > 0 ? `title="${label}: ${count} miss${count>1?'es':''}"` : '';
                    return `<div ${title} style="min-width:${minW}; height:32px; background:${bg}; border:1px solid ${border}; border-radius:5px; display:flex; align-items:center; justify-content:center; font-family:'JetBrains Mono',monospace; font-size:0.65rem; color:${count>0?'#fff':'#94a3b8'}; position:relative; cursor:default; white-space:nowrap; padding:0 4px;">
                        ${label}${count > 0 ? `<span style="position:absolute;top:-6px;right:-4px;background:#ef4444;color:#fff;border-radius:8px;font-size:0.5rem;padding:1px 3px;">${count}</span>` : ''}
                    </div>`;
                }).join('')}
            </div>
        `).join('');
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
    missedKeys: {},       // NEW: track missed key counts
    wpmHistory: [],       // NEW: wpm snapshots for results chart
    wpmHistoryTimer: null,// NEW: interval for wpm snapshots

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

        // Ensure nav links update
        game.updateAuthUI();

        // Mode descriptions
        const modeSelect = document.getElementById('modeSelect');
        const modeDesc = document.getElementById('modeDescription');
        
        const descriptions = {
            normal: "⏱ **Timed:** Test your speed in a standard 60-second sprint.",
            zen: "🧘 **Untimed:** Relaxed practice with no timer. Focus on your rhythm.",
            hardcore: "🎯 **Perfect:** The ultimate challenge. One wrong character and you fail immediately."
        };

        modeSelect.addEventListener('mouseenter', () => {
            modeDesc.innerHTML = descriptions[modeSelect.value];
            modeDesc.style.display = 'block';
        });

        modeSelect.addEventListener('mouseleave', () => {
            modeDesc.style.display = 'none';
        });

        modeSelect.addEventListener('change', () => {
            modeDesc.innerHTML = descriptions[modeSelect.value];
            const timerSelect = document.getElementById('timerSelect');
            if (timerSelect) {
                timerSelect.style.display = CONFIG.MODES[modeSelect.value].hasTimer ? '' : 'none';
            }
        });

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
    },

    updateAuthUI: () => {
        const user = auth.getCurrentUser();
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const userNameDisplay = document.getElementById('userNameSpan'); 
        const avatar = auth.getAvatar();

        // Update all profile images on the page
        const avatarUrl = avatar === 'default-avatar.png' ? null : 'uploads/' + avatar;
        const profileElements = document.querySelectorAll('.profile-img-lg, .profile-img');
        
        profileElements.forEach(el => {
            if (avatarUrl) {
                el.innerHTML = `<img src="${avatarUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            } else {
                el.innerHTML = `<i class="fas fa-user-circle"></i>`;
            }
        });

        if (user !== "guest") {
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (settingsBtn) settingsBtn.style.display = 'block';
            if (userNameDisplay) userNameDisplay.textContent = `Player: ${user}`;
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
        game.missedKeys = {};
        game.wpmHistory = [];
        clearInterval(game.wpmHistoryTimer);
        
        const mode = document.getElementById('modeSelect').value;
        const category = document.getElementById('categorySelect').value;
        const timerSelect = document.getElementById('timerSelect');
        const customTime = timerSelect ? parseInt(timerSelect.value) : 60;
        
        // Override MODES time with user-selected duration for timed mode
        game.timeRemaining = CONFIG.MODES[mode].hasTimer ? customTime : 0;
        game.text = await game.getText(category);
        
        document.getElementById('textDisplay').innerHTML = game.renderText();
        document.getElementById('restartBtn').style.display = 'block';
        document.getElementById('startBtn').style.display = 'none';
        
        const inputBox = document.getElementById('inputBox');
        inputBox.value = "";
        inputBox.disabled = false;
        inputBox.focus();

        game.startTime = Date.now();

        // Sample WPM every 2 seconds for results chart
        game.wpmHistoryTimer = setInterval(() => {
            if (!game.isPlaying) { clearInterval(game.wpmHistoryTimer); return; }
            game.wpmHistory.push(game.calculateWpm());
        }, 2000);

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

        // Play Sound (Local MP3 with Synthesis Fallback)
        if (game.soundEnabled && val.length > game.typed.length) {
            const clack = new Audio("./clack.mp3");
            clack.volume = 0.5;
            clack.play().catch(e => {
                // FALLBACK: If local file is missing, use synthesized clack
                if (game.audioCtx) {
                    if (game.audioCtx.state === 'suspended') game.audioCtx.resume();
                    const now = game.audioCtx.currentTime;
                    const osc = game.audioCtx.createOscillator();
                    const g = game.audioCtx.createGain();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
                    g.gain.setValueAtTime(0.1, now);
                    g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.connect(g); g.connect(game.audioCtx.destination);
                    osc.start(now); osc.stop(now + 0.1);
                }
            });
        }

        // Hardcore check
        const mode = document.getElementById('modeSelect').value;
        if (CONFIG.MODES[mode].hardcore) {
            if (val[val.length - 1] !== game.text[val.length - 1]) {
                game.end(true);
                return;
            }
        }

        // Track missed keys
        const typedChar = val[val.length - 1];
        const expectedChar = game.text[val.length - 1];
        if (typedChar && expectedChar && typedChar !== expectedChar) {
            const key = expectedChar.toLowerCase();
            game.missedKeys[key] = (game.missedKeys[key] || 0) + 1;
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

    end: async (failed = false) => {
        clearInterval(game.timer);
        clearInterval(game.wpmHistoryTimer);
        game.isPlaying = false;
        document.getElementById('inputBox').disabled = true;
        
        if (failed) {
            document.getElementById('textDisplay').innerHTML = `<span style="color:var(--error)">💀 FAILED (Hardcore Mode)</span>`;
        } else {
            const wpm = game.calculateWpm();
            const acc = game.calculateAcc();
            const xpGained = Math.round(wpm * (acc / 100) * 10);
            await stats.addMatch(wpm, acc);

            // Confetti
            if (typeof confetti !== 'undefined') {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#8b5cf6', '#2dd4bf', '#10b981'] });
            }

            // Show results modal
            const modal = document.getElementById('resultsModal');
            if (modal) {
                document.getElementById('resWpm').textContent = wpm;
                document.getElementById('resAcc').textContent = `${acc}%`;
                document.getElementById('resXp').textContent = `+${xpGained}`;

                const bestData = await stats.getData();
                const isNewBest = wpm >= bestData.bestWpm;
                document.getElementById('resultsSubtitle').textContent = isNewBest
                    ? `🏆 New Personal Best! Amazing run, ${auth.getCurrentUser()}!`
                    : `Keep pushing! Your best is ${bestData.bestWpm} WPM.`;

                // WPM over time chart
                const ctx = document.getElementById('resultsChart');
                if (ctx) {
                    if (window._resultsChart) window._resultsChart.destroy();
                    const labels = game.wpmHistory.map((_, i) => `${(i + 1) * 2}s`);
                    window._resultsChart = new Chart(ctx.getContext('2d'), {
                        type: 'line',
                        data: {
                            labels,
                            datasets: [{
                                label: 'WPM',
                                data: game.wpmHistory,
                                borderColor: '#8b5cf6',
                                tension: 0.4,
                                fill: true,
                                backgroundColor: 'rgba(139,92,246,0.15)',
                                pointRadius: 3
                            }]
                        },
                        options: {
                            responsive: true, maintainAspectRatio: false,
                            scales: {
                                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                            },
                            plugins: { legend: { display: false } }
                        }
                    });
                }

                // Missed keys heatmap
                ui.renderHeatmap(game.missedKeys);

                modal.style.display = 'flex';
            } else {
                ui.showNotification(`Great job! ${wpm} WPM attained.`);
            }
        }

        document.getElementById('startBtn').style.display = 'block';
        document.getElementById('startBtn').disabled = false;
        document.getElementById('startBtn').textContent = "Train Again";
    },

    reset: () => {
        clearInterval(game.timer);
        clearInterval(game.wpmHistoryTimer);
        game.isPlaying = false;
        game.typed = "";
        game.streak = 0;
        game.missedKeys = {};
        game.wpmHistory = [];
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
// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    await auth.checkSession();
    game.init();
});