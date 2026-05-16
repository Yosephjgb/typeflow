/**
 * TYPEFLOW - CORE ENGINE v2.0
 * Upgraded with: Achievements, Themes, Sound Engine, Better Stats, More Modes
 */

// ==========================================
// 1. CONFIGURATION & DATA
// ==========================================
const CONFIG = {
    MODES: {
        normal:   { time: 60,  hasTimer: true,  hardcore: false, label: '⏱ Timed' },
        zen:      { time: 0,   hasTimer: false, hardcore: false, label: '🧘 Zen' },
        hardcore: { time: 0,   hasTimer: false, hardcore: true,  label: '🎯 Hardcore' },
        words:    { time: 0,   hasTimer: false, hardcore: false, wordMode: true, label: '📝 Word Count' }
    },
    LEVEL_XP: 1000,
    MAX_HISTORY: 50,
    WORD_COUNTS: [10, 25, 50, 100],
    TIMER_OPTIONS: [15, 30, 60, 120],
    TEXT_DATA: {
        general: [
            "The quick brown fox jumps over the lazy dog in a spectacular display of agility and speed.",
            "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "In the middle of every difficulty lies opportunity for those who are brave enough to seek it.",
            "Design is not just what it looks like and feels like. Design is how it works and interacts with the user.",
            "A person who never made a mistake never tried anything new or pushed their creative boundaries.",
            "The future belongs to those who believe in the beauty of their dreams and work tirelessly to achieve them.",
            "Technology is best when it brings people together and creates meaningful connections across the world.",
            "Creativity is intelligence having fun, and the most innovative ideas come from those who dare to imagine.",
            "Every expert was once a beginner, and every master was once a disaster who refused to give up.",
            "The only way to do great work is to love what you do and pursue it with unwavering passion."
        ],
        code: [
            "function calculateWpm(words, time) { return Math.round((words / time) * 60); }",
            "const glassPanel = document.querySelector('.glass-panel'); glassPanel.style.backdropFilter = 'blur(12px)';",
            "async function fetchQuotes() { const response = await fetch('https://api.quotable.io/random'); return response.json(); }",
            "export default class TyperEngine { constructor(config) { this.config = config; this.isPlaying = false; } }",
            "document.addEventListener('keydown', (e) => { if(e.key === 'Escape') game.reset(); });",
            "const debounce = (fn, ms) => { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => fn(...args), ms); }; };",
            "const [state, setState] = useState({ wpm: 0, accuracy: 100, streak: 0, isPlaying: false });",
            "SELECT u.username, s.best_wpm FROM stats s JOIN users u ON u.id = s.user_id ORDER BY s.best_wpm DESC LIMIT 10;"
        ],
        quotes: []
    },
    FINGER_MAP: {
        '`':'l-pinky','1':'l-pinky','q':'l-pinky','a':'l-pinky','z':'l-pinky',
        '2':'l-ring','w':'l-ring','s':'l-ring','x':'l-ring',
        '3':'l-middle','e':'l-middle','d':'l-middle','c':'l-middle',
        '4':'l-index','5':'l-index','r':'l-index','t':'l-index','f':'l-index','g':'l-index','v':'l-index','b':'l-index',
        '6':'r-index','7':'r-index','y':'r-index','u':'r-index','h':'r-index','j':'r-index','n':'r-index','m':'r-index',
        '8':'r-middle','i':'r-middle','k':'r-middle',',':'r-middle',
        '9':'r-ring','o':'r-ring','l':'r-ring','.':'r-ring',
        '0':'r-pinky','-':'r-pinky','=':'r-pinky','p':'r-pinky','[':'r-pinky',']':'r-pinky','\\':'r-pinky','enter':'r-pinky','backspace':'r-pinky',';':'r-pinky',"'":'r-pinky','/':'r-pinky',
        ' ':'r-thumb'
    }
};

// ==========================================
// THEMES MODULE
// ==========================================
const themes = {
    list: {
        default: {
            name: '🌌 Default',
            '--bg-color': '#0f172a',
            '--surface-color': 'rgba(30, 41, 59, 0.7)',
            '--surface-border': 'rgba(255, 255, 255, 0.1)',
            '--primary': '#8b5cf6',
            '--primary-glow': 'rgba(139, 92, 246, 0.5)',
            '--secondary': '#2dd4bf',
            '--success': '#10b981',
            '--error': '#ef4444',
            '--text-main': '#f8fafc',
            '--text-dim': '#94a3b8',
            '--bg-gradient': 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #0f172a 100%)'
        },
        ocean: {
            name: '🌊 Ocean',
            '--bg-color': '#0c1a2e',
            '--surface-color': 'rgba(10, 30, 60, 0.7)',
            '--surface-border': 'rgba(56, 189, 248, 0.15)',
            '--primary': '#38bdf8',
            '--primary-glow': 'rgba(56, 189, 248, 0.4)',
            '--secondary': '#06b6d4',
            '--success': '#10b981',
            '--error': '#f43f5e',
            '--text-main': '#e0f2fe',
            '--text-dim': '#7dd3fc',
            '--bg-gradient': 'radial-gradient(circle at 50% 50%, #0c2a4a 0%, #050e1a 100%)'
        },
        forest: {
            name: '🌿 Forest',
            '--bg-color': '#0a1a10',
            '--surface-color': 'rgba(15, 35, 20, 0.75)',
            '--surface-border': 'rgba(74, 222, 128, 0.15)',
            '--primary': '#4ade80',
            '--primary-glow': 'rgba(74, 222, 128, 0.4)',
            '--secondary': '#a3e635',
            '--success': '#22c55e',
            '--error': '#ef4444',
            '--text-main': '#f0fdf4',
            '--text-dim': '#86efac',
            '--bg-gradient': 'radial-gradient(circle at 50% 50%, #14291a 0%, #060f09 100%)'
        },
        sunset: {
            name: '🌅 Sunset',
            '--bg-color': '#1a0a0a',
            '--surface-color': 'rgba(40, 15, 15, 0.75)',
            '--surface-border': 'rgba(251, 146, 60, 0.15)',
            '--primary': '#fb923c',
            '--primary-glow': 'rgba(251, 146, 60, 0.4)',
            '--secondary': '#f472b6',
            '--success': '#10b981',
            '--error': '#ef4444',
            '--text-main': '#fff7ed',
            '--text-dim': '#fdba74',
            '--bg-gradient': 'radial-gradient(circle at 50% 30%, #2d0f05 0%, #0f0505 100%)'
        },
        monochrome: {
            name: '⬛ Monochrome',
            '--bg-color': '#0a0a0a',
            '--surface-color': 'rgba(20, 20, 20, 0.8)',
            '--surface-border': 'rgba(255, 255, 255, 0.08)',
            '--primary': '#ffffff',
            '--primary-glow': 'rgba(255, 255, 255, 0.2)',
            '--secondary': '#aaaaaa',
            '--success': '#ffffff',
            '--error': '#666666',
            '--text-main': '#ffffff',
            '--text-dim': '#888888',
            '--bg-gradient': 'radial-gradient(circle at 50% 50%, #111 0%, #000 100%)'
        },
        neon: {
            name: '⚡ Neon',
            '--bg-color': '#050010',
            '--surface-color': 'rgba(10, 0, 30, 0.8)',
            '--surface-border': 'rgba(255, 0, 255, 0.2)',
            '--primary': '#ff00ff',
            '--primary-glow': 'rgba(255, 0, 255, 0.5)',
            '--secondary': '#00ffff',
            '--success': '#00ff88',
            '--error': '#ff0055',
            '--text-main': '#ffffff',
            '--text-dim': '#cc88ff',
            '--bg-gradient': 'radial-gradient(circle at 50% 50%, #1a0030 0%, #050010 100%)'
        }
    },

    apply: (themeKey) => {
        const theme = themes.list[themeKey];
        if (!theme) return;
        const root = document.documentElement;
        Object.entries(theme).forEach(([k, v]) => {
            if (k.startsWith('--')) root.style.setProperty(k, v);
        });
        if (theme['--bg-gradient']) {
            document.body.style.background = theme['--bg-gradient'];
        }
        localStorage.setItem('theme', themeKey);

        // Update active button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeKey);
        });
    },

    init: () => {
        const saved = localStorage.getItem('theme') || 'default';
        themes.apply(saved);
    }
};

// ==========================================
// ACHIEVEMENTS MODULE
// ==========================================
const achievements = {
    list: [
        { id: 'first_test',    icon: '🎯', name: 'First Steps',      desc: 'Complete your first test',           check: (s) => s.history.length >= 1 },
        { id: 'wpm_50',        icon: '⚡', name: 'Speed Demon',      desc: 'Reach 50 WPM',                      check: (s) => s.bestWpm >= 50 },
        { id: 'wpm_80',        icon: '🚀', name: 'Rocket Fingers',   desc: 'Reach 80 WPM',                      check: (s) => s.bestWpm >= 80 },
        { id: 'wpm_100',       icon: '💎', name: 'Century Club',     desc: 'Reach 100 WPM',                     check: (s) => s.bestWpm >= 100 },
        { id: 'wpm_120',       icon: '👑', name: 'Typing God',       desc: 'Reach 120 WPM',                     check: (s) => s.bestWpm >= 120 },
        { id: 'acc_100',       icon: '🎖️', name: 'Perfectionist',    desc: 'Achieve 100% accuracy',              check: (s) => s.bestAcc >= 100 },
        { id: 'acc_95',        icon: '🔬', name: 'Sharp Shooter',    desc: 'Achieve 95%+ accuracy',              check: (s) => s.bestAcc >= 95 },
        { id: 'tests_10',      icon: '🔥', name: 'On A Roll',        desc: 'Complete 10 tests',                  check: (s) => s.history.length >= 10 },
        { id: 'tests_50',      icon: '🏅', name: 'Dedicated',        desc: 'Complete 50 tests',                  check: (s) => s.history.length >= 50 },
        { id: 'level_5',       icon: '⭐', name: 'Leveling Up',      desc: 'Reach Level 5',                     check: (s) => s.level >= 5 },
        { id: 'level_10',      icon: '🌟', name: 'Veteran',          desc: 'Reach Level 10',                    check: (s) => s.level >= 10 },
        { id: 'streak_20',     icon: '💫', name: 'In The Zone',      desc: 'Get a 20-character streak',          check: (s, g) => g && g.streak >= 20 },
    ],

    getUnlocked: () => JSON.parse(localStorage.getItem('achievements') || '[]'),

    check: async (statsData, gameRef) => {
        const unlocked = achievements.getUnlocked();
        const newlyUnlocked = [];

        for (const ach of achievements.list) {
            if (!unlocked.includes(ach.id) && ach.check(statsData, gameRef)) {
                unlocked.push(ach.id);
                newlyUnlocked.push(ach);
            }
        }

        if (newlyUnlocked.length > 0) {
            localStorage.setItem('achievements', JSON.stringify(unlocked));
            for (const ach of newlyUnlocked) {
                await achievements.showPopup(ach);
            }
        }
    },

    showPopup: (ach) => {
        return new Promise(resolve => {
            const popup = document.createElement('div');
            popup.style.cssText = `
                position: fixed; bottom: 30px; right: 30px;
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                color: white; padding: 20px 25px; border-radius: 16px; z-index: 9999;
                box-shadow: 0 10px 40px rgba(0,0,0,0.6);
                animation: slideInRight 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                max-width: 300px; display: flex; align-items: center; gap: 15px;
            `;
            popup.innerHTML = `
                <div style="font-size: 2.5rem; line-height:1;">${ach.icon}</div>
                <div>
                    <div style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.85;">Achievement Unlocked!</div>
                    <div style="font-weight: 800; font-size: 1rem;">${ach.name}</div>
                    <div style="font-size: 0.8rem; opacity: 0.85;">${ach.desc}</div>
                </div>
            `;
            document.body.appendChild(popup);
            setTimeout(() => {
                popup.style.opacity = '0';
                popup.style.transition = 'opacity 0.5s';
                setTimeout(() => { popup.remove(); resolve(); }, 500);
            }, 3500);
        });
    },

    renderPanel: () => {
        const unlocked = achievements.getUnlocked();
        const container = document.getElementById('achievementsGrid');
        if (!container) return;

        container.innerHTML = achievements.list.map(ach => {
            const done = unlocked.includes(ach.id);
            return `
                <div style="
                    background: ${done ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)'};
                    border: 1px solid ${done ? 'var(--primary)' : 'var(--surface-border)'};
                    border-radius: 16px; padding: 18px; text-align: center;
                    opacity: ${done ? '1' : '0.4'}; transition: all 0.3s;
                    filter: ${done ? 'none' : 'grayscale(1)'};
                ">
                    <div style="font-size: 2rem; margin-bottom: 8px;">${ach.icon}</div>
                    <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 4px;">${ach.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-dim);">${ach.desc}</div>
                    ${done ? '<div style="font-size:0.7rem; color:var(--primary); margin-top:6px;">✓ Unlocked</div>' : ''}
                </div>
            `;
        }).join('');
    }
};

// ==========================================
// SOUND ENGINE MODULE
// ==========================================
const soundEngine = {
    ctx: null,
    enabled: localStorage.getItem('soundEnabled') !== 'false',
    volume: parseFloat(localStorage.getItem('soundVolume') || '0.5'),
    profile: localStorage.getItem('soundProfile') || 'mechanical',

    profiles: {
        mechanical: { freq: 800, type: 'square', decay: 0.08, gain: 0.12 },
        soft:       { freq: 600, type: 'sine',   decay: 0.12, gain: 0.08 },
        typewriter: { freq: 300, type: 'sawtooth',decay: 0.06, gain: 0.15 },
        silent:     null
    },

    init: () => {
        const initCtx = () => {
            if (soundEngine.ctx) return;
            soundEngine.ctx = new (window.AudioContext || window.webkitAudioContext)();
        };
        window.addEventListener('mousedown', initCtx, { once: true });
        window.addEventListener('keydown', initCtx, { once: true });
    },

    playClick: (isCorrect = true) => {
        if (!soundEngine.enabled || soundEngine.profile === 'silent') return;
        if (!soundEngine.ctx) return;
        if (soundEngine.ctx.state === 'suspended') soundEngine.ctx.resume();

        const p = soundEngine.profiles[soundEngine.profile];
        if (!p) return;

        const now = soundEngine.ctx.currentTime;
        const osc = soundEngine.ctx.createOscillator();
        const gainNode = soundEngine.ctx.createGain();
        const masterGain = soundEngine.ctx.createGain();

        osc.type = p.type;
        const baseFreq = isCorrect ? p.freq : p.freq * 0.4;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, now + p.decay);

        gainNode.gain.setValueAtTime(p.gain * soundEngine.volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + p.decay);
        masterGain.gain.value = soundEngine.volume;

        osc.connect(gainNode);
        gainNode.connect(masterGain);
        masterGain.connect(soundEngine.ctx.destination);
        osc.start(now);
        osc.stop(now + p.decay + 0.01);
    },

    playSuccess: () => {
        if (!soundEngine.enabled || !soundEngine.ctx) return;
        if (soundEngine.ctx.state === 'suspended') soundEngine.ctx.resume();
        const now = soundEngine.ctx.currentTime;
        [523, 659, 784].forEach((freq, i) => {
            const osc = soundEngine.ctx.createOscillator();
            const g = soundEngine.ctx.createGain();
            osc.frequency.value = freq;
            osc.type = 'sine';
            g.gain.setValueAtTime(0.15 * soundEngine.volume, now + i * 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
            osc.connect(g); g.connect(soundEngine.ctx.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.3);
        });
    },

    playError: () => {
        if (!soundEngine.enabled || !soundEngine.ctx) return;
        if (soundEngine.ctx.state === 'suspended') soundEngine.ctx.resume();
        const now = soundEngine.ctx.currentTime;
        const osc = soundEngine.ctx.createOscillator();
        const g = soundEngine.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        g.gain.setValueAtTime(0.2 * soundEngine.volume, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(g); g.connect(soundEngine.ctx.destination);
        osc.start(now); osc.stop(now + 0.15);
    }
};

// ==========================================
// 2. AUTHENTICATION MODULE
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
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect');
                window.location.href = redirect ? redirect + '.html' : 'dashboard.html';
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
            } else { error.textContent = result.message; }
        } catch (e) { error.textContent = "Registration server error."; }
    },

    logout: async () => {
        await fetch('auth.php?action=logout');
        currentUser = null;
        game.updateAuthUI();
        ui.showNotification("Logged out. Switched to Guest mode.");
        if (window.location.pathname.includes("dashboard.html")) window.location.href = "index.html";
    },

    saveSettings: async () => {
        const user = auth.getCurrentUser();
        const newPass = document.getElementById('setNewPass').value.trim();
        const oldPass = document.getElementById('confirmOldPass').value.trim();
        if (user === "guest") { ui.showNotification("Guests cannot change settings."); return; }
        try {
            const res = await fetch('auth.php?action=update_profile', {
                method: 'POST',
                body: JSON.stringify({ newPassword: newPass, oldPassword: oldPass })
            });
            const result = await res.json();
            if (result.success) { ui.showNotification("Settings saved!"); ui.toggleSettings(); }
            else { ui.showNotification("Error: " + result.message); }
        } catch (e) { ui.showNotification("Server error while saving settings."); }
    },

    uploadAvatar: async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const allowed = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowed.includes(file.type)) { ui.showNotification('Invalid file type.'); return; }
        if (file.size > 2 * 1024 * 1024) { ui.showNotification('File too large (max 2MB).'); return; }
        ui.showNotification('Uploading...');
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            const res = await fetch('upload.php', { method: 'POST', body: formData });
            const result = await res.json();
            if (result.success) {
                await auth.checkSession();
                game.updateAuthUI();
                ui.showNotification('Profile picture updated!');
            } else { ui.showNotification('Upload failed: ' + result.message); }
        } catch (e) { ui.showNotification('Server error during upload.'); }
    }
};

// ==========================================
// 3. STATS & ANALYTICS MODULE
// ==========================================
const stats = {
    getData: async () => {
        const user = auth.getCurrentUser();
        if (user === "guest") {
            return JSON.parse(localStorage.getItem('stats_guest')) || { xp: 0, level: 1, bestWpm: 0, bestAcc: 0, history: [] };
        }
        try {
            const res = await fetch('stats.php?action=load');
            const result = await res.json();
            if (result.success) return result.data;
        } catch (e) { console.error("Failed to load stats", e); }
        return { xp: 0, level: 1, bestWpm: 0, bestAcc: 0, history: [] };
    },

    saveData: async (data) => {
        const user = auth.getCurrentUser();
        if (user === "guest") { localStorage.setItem('stats_guest', JSON.stringify(data)); return; }
        try {
            await fetch('stats.php?action=save', { method: 'POST', body: JSON.stringify(data) });
        } catch (e) { console.error("Failed to save stats", e); }
    },

    addMatch: async (wpm, acc, consistency) => {
        const data = await stats.getData();
        const xpGained = Math.round(wpm * (acc / 100) * 10);
        data.xp += xpGained;

        if (data.xp >= data.level * CONFIG.LEVEL_XP) {
            data.xp -= (data.level * CONFIG.LEVEL_XP);
            data.level++;
            soundEngine.playSuccess();
            ui.showNotification(`⭐ Level Up! You are now Level ${data.level}`);
        }

        if (wpm > data.bestWpm) data.bestWpm = wpm;
        if (acc > data.bestAcc) data.bestAcc = acc;

        data.history.push({
            wpm, acc,
            consistency: consistency || 0,
            date: new Date().toLocaleDateString(),
            timestamp: Date.now()
        });
        if (data.history.length > CONFIG.MAX_HISTORY) data.history.shift();

        await stats.saveData(data);
        await achievements.check(data, game);
        return data;
    },

    getConsistency: (wpmHistory) => {
        if (wpmHistory.length < 2) return 100;
        const avg = wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length;
        const variance = wpmHistory.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / wpmHistory.length;
        const stdDev = Math.sqrt(variance);
        const cv = avg > 0 ? (stdDev / avg) * 100 : 0;
        return Math.max(0, Math.round(100 - cv));
    },

    initDashboard: async () => {
        const data = await stats.getData();
        const user = auth.getCurrentUser();

        document.getElementById('userName').textContent = user.charAt(0).toUpperCase() + user.slice(1);
        document.getElementById('userLevel').textContent = `Level ${data.level}`;
        document.getElementById('xpText').textContent = `${data.xp} / ${data.level * CONFIG.LEVEL_XP}`;
        document.getElementById('xpFill').style.width = `${(data.xp / (data.level * CONFIG.LEVEL_XP)) * 100}%`;
        document.getElementById('bestWpm').textContent = data.bestWpm;
        document.getElementById('bestAcc').textContent = `${data.bestAcc}%`;

        const totalTests = data.history.length;
        const avgWpm = totalTests > 0 ? Math.round(data.history.reduce((a, b) => a + b.wpm, 0) / totalTests) : 0;
        const avgAcc = totalTests > 0 ? Math.round(data.history.reduce((a, b) => a + b.acc, 0) / totalTests) : 0;
        const avgConsistency = totalTests > 0 ? Math.round(data.history.filter(h => h.consistency).reduce((a, b) => a + b.consistency, 0) / totalTests) : 0;

        if (document.getElementById('totalTests')) document.getElementById('totalTests').textContent = totalTests;
        if (document.getElementById('avgWpm')) document.getElementById('avgWpm').textContent = avgWpm;
        if (document.getElementById('avgAcc')) document.getElementById('avgAcc').textContent = avgAcc + '%';
        if (document.getElementById('avgConsistency')) document.getElementById('avgConsistency').textContent = avgConsistency + '%';

        // Activity Log
        const log = document.getElementById('activityLog');
        if (data.history && data.history.length > 0) {
            log.innerHTML = [...data.history].reverse().slice(0, 10).map(m => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid var(--surface-border); border-radius:8px; margin-bottom:4px; background:rgba(255,255,255,0.02);">
                    <span style="color:var(--text-dim); font-size:0.85rem;">${m.date}</span>
                    <div style="display:flex; gap:20px; align-items:center;">
                        <span style="font-weight:700; color:var(--primary);">${m.wpm} <span style="font-size:0.75rem; font-weight:400; color:var(--text-dim);">WPM</span></span>
                        <span style="color:var(--secondary);">${m.acc}%</span>
                        ${m.consistency ? `<span style="color:var(--text-dim); font-size:0.8rem;">${m.consistency}% cons.</span>` : ''}
                    </div>
                </div>
            `).join('');
        }

        // Performance Chart
        if (document.getElementById('performanceChart')) {
            const ctx = document.getElementById('performanceChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.history.map(h => h.date),
                    datasets: [
                        {
                            label: 'WPM',
                            data: data.history.map(h => h.wpm),
                            borderColor: '#8b5cf6',
                            tension: 0.4, fill: true,
                            backgroundColor: 'rgba(139,92,246,0.1)',
                            yAxisID: 'y'
                        },
                        {
                            label: 'Accuracy',
                            data: data.history.map(h => h.acc),
                            borderColor: '#2dd4bf',
                            tension: 0.4, fill: false,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        y:  { beginAtZero: false, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                        y1: { beginAtZero: false, position: 'right', grid: { display: false }, ticks: { color: '#2dd4bf' } },
                        x:  { grid: { display: false }, ticks: { color: '#94a3b8', maxTicksLimit: 8 } }
                    },
                    plugins: { legend: { labels: { color: '#94a3b8' } } }
                }
            });
        }

        achievements.renderPanel();
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
        if (time !== null && time !== undefined) document.getElementById('timer').textContent = typeof time === 'number' ? `${time}s` : time;
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
        if (!container) return;
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.cssText = `position:absolute; left:${x}px; top:${y}px; width:4px; height:4px; border-radius:50%; background:${color}; pointer-events:none; animation: particleFly 0.6s forwards;`;
        container.appendChild(p);
        setTimeout(() => p.remove(), 600);
    },

    showNotification: (msg, type = 'info') => {
        const colors = { info: 'var(--primary)', success: 'var(--success)', error: 'var(--error)' };
        const n = document.createElement('div');
        n.style.cssText = `
            position:fixed; top:20px; right:20px; background:${colors[type] || colors.info};
            color:white; padding:15px 25px; border-radius:12px; z-index:3000;
            box-shadow:0 10px 30px rgba(0,0,0,0.5); font-weight:600;
            animation: slideInRight 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
            max-width: 320px;
        `;
        n.textContent = msg;
        document.body.appendChild(n);
        setTimeout(() => {
            n.style.opacity = '0'; n.style.transition = 'opacity 0.4s';
            setTimeout(() => n.remove(), 400);
        }, 3000);
    },

    toggleSettings: () => {
        const modal = document.getElementById('settingsModal');
        if (!modal) return;
        if (modal.style.display === 'none' || !modal.style.display) {
            const user = auth.getCurrentUser();
            if (document.getElementById('setUserName')) document.getElementById('setUserName').value = user !== 'guest' ? user : '';
            if (document.getElementById('setNewPass')) document.getElementById('setNewPass').value = '';
            modal.style.display = 'flex';
        } else {
            modal.style.display = 'none';
        }
    },

    handleProfileUpload: (e) => { auth.uploadAvatar(e); },

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
            <div style="display:flex;gap:4px;margin-bottom:4px;justify-content:center;">
                ${row.map(k => {
                    const lookup = k === ' ' ? ' ' : k.toLowerCase();
                    const count = missedKeys[lookup] || 0;
                    const intensity = count / maxMisses;
                    const bg = count > 0 ? `rgba(239,68,68,${0.2 + intensity * 0.8})` : 'rgba(255,255,255,0.03)';
                    const border = count > 0 ? `rgba(239,68,68,${0.4 + intensity * 0.6})` : 'rgba(255,255,255,0.1)';
                    const label = k === ' ' ? 'SPACE' : k;
                    const minW = extraWide.has(k) ? '100px' : wideKeys.has(k) ? '48px' : '28px';
                    const title = count > 0 ? `title="${label}: ${count} miss${count>1?'es':''}"` : '';
                    return `<div ${title} style="min-width:${minW};height:28px;background:${bg};border:1px solid ${border};border-radius:4px;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:0.6rem;color:${count>0?'#fff':'#94a3b8'};position:relative;padding:0 3px;cursor:default;">
                        ${label}${count > 0 ? `<span style="position:absolute;top:-5px;right:-3px;background:#ef4444;color:#fff;border-radius:6px;font-size:0.45rem;padding:1px 3px;">${count}</span>` : ''}
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
    missedKeys: {},
    wpmHistory: [],
    wpmHistoryTimer: null,
    wordCount: 25,

    init: () => {
        soundEngine.init();
        themes.init();

        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');
        const inputBox = document.getElementById('inputBox');

        game.updateAuthUI();

        // Mode + timer select sync
        const modeSelect = document.getElementById('modeSelect');
        const timerSelect = document.getElementById('timerSelect');
        const wordSelect = document.getElementById('wordSelect');
        const modeDesc = document.getElementById('modeDescription');

        const descriptions = {
            normal:   '⏱ <strong>Timed:</strong> Race against the clock. Choose 15 to 120 seconds.',
            zen:      '🧘 <strong>Zen:</strong> Untimed, relaxed practice with no pressure.',
            hardcore: '🎯 <strong>Hardcore:</strong> One wrong key and you fail immediately.',
            words:    '📝 <strong>Word Count:</strong> Type a fixed number of words as fast as you can.'
        };

        const syncModeUI = () => {
            const mode = modeSelect.value;
            if (timerSelect) timerSelect.style.display = CONFIG.MODES[mode].hasTimer ? '' : 'none';
            if (wordSelect) wordSelect.style.display = CONFIG.MODES[mode].wordMode ? '' : 'none';
        };

        if (modeSelect) {
            modeSelect.addEventListener('change', syncModeUI);
            modeSelect.addEventListener('mouseenter', () => {
                if (modeDesc) { modeDesc.innerHTML = descriptions[modeSelect.value]; modeDesc.style.display = 'block'; }
            });
            modeSelect.addEventListener('mouseleave', () => {
                if (modeDesc) modeDesc.style.display = 'none';
            });
            syncModeUI();
        }

        if (startBtn) startBtn.addEventListener('click', () => game.start());
        if (restartBtn) restartBtn.addEventListener('click', () => game.reset());
        if (inputBox) inputBox.addEventListener('input', (e) => game.handleInput(e));

        const displayContainer = document.getElementById('displayContainer');
        if (displayContainer) displayContainer.addEventListener('click', () => { if (game.isPlaying) inputBox.focus(); });
    },

    updateAuthUI: () => {
        const user = auth.getCurrentUser();
        const loginBtn    = document.getElementById('loginBtn');
        const signupBtn   = document.getElementById('signupBtn');
        const logoutBtn   = document.getElementById('logoutBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const dashboardBtn= document.getElementById('dashboardBtn');
        const userNameDisplay = document.getElementById('userNameSpan');
        const avatar = auth.getAvatar();
        const avatarUrl = avatar === 'default-avatar.png' ? null : 'uploads/' + avatar;

        document.querySelectorAll('.profile-img-lg, .profile-img').forEach(el => {
            el.innerHTML = avatarUrl
                ? `<img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
                : `<i class="fas fa-user-circle"></i>`;
        });

        if (user !== "guest") {
            if (loginBtn)     loginBtn.style.display = 'none';
            if (signupBtn)    signupBtn.style.display = 'none';
            if (logoutBtn)    logoutBtn.style.display = 'block';
            if (settingsBtn)  settingsBtn.style.display = 'block';
            if (dashboardBtn) dashboardBtn.style.display = 'block';
            if (userNameDisplay) userNameDisplay.textContent = `Player: ${user}`;
        } else {
            if (loginBtn)     loginBtn.style.display = 'block';
            if (signupBtn)    signupBtn.style.display = 'block';
            if (logoutBtn)    logoutBtn.style.display = 'none';
            if (settingsBtn)  settingsBtn.style.display = 'none';
            if (dashboardBtn) dashboardBtn.style.display = 'none';
            if (userNameDisplay) userNameDisplay.textContent = 'Player: Guest';
        }
    },

    start: async () => {
        const countdown = document.getElementById('countdownOverlay');
        const startBtn  = document.getElementById('startBtn');
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
        game.isPlaying  = true;
        game.typed      = "";
        game.streak     = 0;
        game.correctChars = 0;
        game.missedKeys = {};
        game.wpmHistory = [];
        clearInterval(game.wpmHistoryTimer);

        const mode     = document.getElementById('modeSelect').value;
        const category = document.getElementById('categorySelect').value;
        const timerSelect = document.getElementById('timerSelect');
        const wordSelect  = document.getElementById('wordSelect');
        const customTime  = timerSelect ? parseInt(timerSelect.value) : 60;
        game.wordCount = wordSelect ? parseInt(wordSelect.value) : 25;

        game.timeRemaining = CONFIG.MODES[mode].hasTimer ? customTime : 0;
        game.text = await game.getText(category, mode);

        document.getElementById('textDisplay').innerHTML = game.renderText();
        document.getElementById('restartBtn').style.display = 'block';
        document.getElementById('startBtn').style.display = 'none';

        const inputBox = document.getElementById('inputBox');
        inputBox.value = "";
        inputBox.disabled = false;
        inputBox.focus();

        game.startTime = Date.now();

        // WPM snapshot every 2s
        game.wpmHistoryTimer = setInterval(() => {
            if (!game.isPlaying) { clearInterval(game.wpmHistoryTimer); return; }
            game.wpmHistory.push(game.calculateWpm());
        }, 2000);

        if (CONFIG.MODES[mode].hasTimer) {
            game.timer = setInterval(() => {
                game.timeRemaining--;
                ui.updateStats(game.calculateWpm(), game.calculateAcc(), game.streak, game.timeRemaining);
                if (game.timeRemaining <= 0) game.end();
            }, 1000);
        } else {
            ui.updateStats(0, 0, 0, CONFIG.MODES[mode].wordMode ? `${game.wordCount}w` : '--');
        }
    },

    getText: async (cat, mode) => {
        const wordMode = CONFIG.MODES[mode] && CONFIG.MODES[mode].wordMode;

        // Word count mode: generate random word list
        if (wordMode) {
            const wordList = ["the","be","to","of","and","a","in","that","have","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us"];
            const count = game.wordCount;
            const words = [];
            for (let i = 0; i < count; i++) words.push(wordList[Math.floor(Math.random() * wordList.length)]);
            return words.join(' ');
        }

        try {
            if (cat === 'quotes') {
                const res = await fetch('https://api.quotable.io/random');
                const data = await res.json();
                return data.content;
            }
            if (cat === 'wiki') {
                const res = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
                const data = await res.json();
                return data.extract.split('.').slice(0, 2).join('.') + '.';
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
            return CONFIG.TEXT_DATA.general[Math.floor(Math.random() * CONFIG.TEXT_DATA.general.length)];
        }
        const arr = CONFIG.TEXT_DATA[cat] || CONFIG.TEXT_DATA.general;
        return arr[Math.floor(Math.random() * arr.length)];
    },

    handleInput: (e) => {
        if (!game.isPlaying) return;
        const val = e.target.value;
        const lastChar = val.slice(-1);
        ui.highlightKey(lastChar);

        const isCorrect = val[val.length - 1] === game.text[val.length - 1];
        soundEngine.playClick(isCorrect);

        if (!isCorrect && val.length > game.typed.length) {
            soundEngine.playError();
        }

        const mode = document.getElementById('modeSelect').value;
        if (CONFIG.MODES[mode].hardcore && !isCorrect) {
            game.end(true);
            return;
        }

        // Track missed keys
        const typedChar = val[val.length - 1];
        const expectedChar = game.text[val.length - 1];
        if (typedChar && expectedChar && typedChar !== expectedChar) {
            const key = expectedChar.toLowerCase();
            game.missedKeys[key] = (game.missedKeys[key] || 0) + 1;
        }

        // Particles on correct char
        if (isCorrect) {
            const container = document.getElementById('displayContainer');
            if (container) {
                const rect = container.getBoundingClientRect();
                ui.createParticle(Math.random() * rect.width, Math.random() * rect.height, 'var(--success)');
            }
        }

        game.typed = val;
        document.getElementById('textDisplay').innerHTML = game.renderText();

        const wpm = game.calculateWpm();
        const acc = game.calculateAcc();
        ui.updateStats(wpm, acc, game.streak, CONFIG.MODES[mode].hasTimer ? game.timeRemaining : null);

        if (game.typed.length >= game.text.length) game.end();
    },

    renderText: () => {
        let html = "";
        game.correctChars = 0;
        for (let i = 0; i < game.text.length; i++) {
            let cls = "";
            if (i < game.typed.length) {
                if (game.typed[i] === game.text[i]) {
                    cls = "char-correct"; game.correctChars++;
                    if (i === game.typed.length - 1) game.streak++;
                } else {
                    cls = "char-incorrect"; game.streak = 0;
                }
            } else if (i === game.typed.length) {
                cls = "char-current";
            }
            const char = game.text[i] === ' ' ? '&nbsp;' : game.text[i];
            html += `<span class="${cls}">${char}</span>`;
        }
        return html;
    },

    calculateWpm: () => {
        const timeElapsed = (Date.now() - game.startTime) / 60000;
        if (timeElapsed <= 0) return 0;
        return Math.round((game.typed.length / 5) / timeElapsed);
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
            soundEngine.playError();
            document.getElementById('textDisplay').innerHTML = `<span style="color:var(--error); font-size:1.2rem;">💀 FAILED — Hardcore Mode. One mistake and you're out!</span>`;
        } else {
            const wpm = game.calculateWpm();
            const acc = game.calculateAcc();
            const consistency = stats.getConsistency(game.wpmHistory);
            const xpGained = Math.round(wpm * (acc / 100) * 10);
            const updatedStats = await stats.addMatch(wpm, acc, consistency);

            if (typeof confetti !== 'undefined' && wpm > 0) {
                confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#8b5cf6','#2dd4bf','#10b981'] });
            }
            soundEngine.playSuccess();

            const modal = document.getElementById('resultsModal');
            if (modal) {
                document.getElementById('resWpm').textContent = wpm;
                document.getElementById('resAcc').textContent = `${acc}%`;
                document.getElementById('resXp').textContent = `+${xpGained}`;
                if (document.getElementById('resConsistency')) {
                    document.getElementById('resConsistency').textContent = `${consistency}%`;
                }

                const isNewBest = wpm >= updatedStats.bestWpm;
                document.getElementById('resultsSubtitle').textContent = isNewBest
                    ? `🏆 New Personal Best! Amazing run, ${auth.getCurrentUser()}!`
                    : `Keep pushing! Your best is ${updatedStats.bestWpm} WPM.`;

                // WPM over time chart
                const ctx = document.getElementById('resultsChart');
                if (ctx) {
                    if (window._resultsChart) window._resultsChart.destroy();
                    window._resultsChart = new Chart(ctx.getContext('2d'), {
                        type: 'line',
                        data: {
                            labels: game.wpmHistory.map((_, i) => `${(i + 1) * 2}s`),
                            datasets: [{
                                label: 'WPM',
                                data: game.wpmHistory,
                                borderColor: 'var(--primary)',
                                tension: 0.4, fill: true,
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

                ui.renderHeatmap(game.missedKeys);
                modal.style.display = 'flex';
            }
        }

        document.getElementById('startBtn').style.display = 'block';
        document.getElementById('startBtn').disabled = false;
        document.getElementById('startBtn').textContent = 'Train Again';
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
        document.getElementById('startBtn').textContent = 'Start Training';
        document.getElementById('restartBtn').style.display = 'none';
        ui.updateStats(0, 0, 0, 60);
    }
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    await auth.checkSession();
    game.init();
});
