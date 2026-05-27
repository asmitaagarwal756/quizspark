let audioCtx = null;
let audioUnlocked = false;


function unlockAudio() {
    if (audioUnlocked) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Play a silent buffer to fully unlock the context
        const buf = audioCtx.createBuffer(1, 1, 22050);
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        src.connect(audioCtx.destination);
        src.start(0);
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        audioUnlocked = true;
    } catch (e) {}
}


document.addEventListener('mousedown',  unlockAudio, { once: false });
document.addEventListener('touchstart', unlockAudio, { once: false });
document.addEventListener('keydown',    unlockAudio, { once: false });

function playTone(freq, type, duration, volume = 0.25, delaySeconds = 0) {
    try {
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc  = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = type;
        const t = audioCtx.currentTime + delaySeconds;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.start(t);
        osc.stop(t + duration + 0.01);
    } catch (e) {}
}

function playClick() {
    playTone(440, 'sine', 0.08, 0.2);
}

function playCorrect() {
    // Ascending chime — scheduled with Web Audio time, no setTimeout needed
    playTone(523, 'sine', 0.15, 0.28, 0.00);
    playTone(659, 'sine', 0.15, 0.28, 0.12);
    playTone(784, 'sine', 0.25, 0.32, 0.24);
}

function playWrong() {
    // Descending buzz
    playTone(330, 'sawtooth', 0.12, 0.22, 0.00);
    playTone(260, 'sawtooth', 0.20, 0.22, 0.13);
}

function playTick() {
    playTone(700, 'square', 0.04, 0.07);
}

//  Timer 
const TIMER_START = 30;
let timeLeft = TIMER_START;
let answered = false;

const timerEl = document.getElementById('timer');

function startTimer() {
    if (!timerEl) return;
    const countdown = setInterval(() => {
        if (answered) { clearInterval(countdown); return; }
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 10) {
            timerEl.classList.add('urgent');
            if (timeLeft > 0) playTick();
        }
        if (timeLeft <= 0) {
            clearInterval(countdown);
            autoSubmit();
        }
    }, 1000);
}

function autoSubmit() {
    if (answered) return;
    answered = true;
    playWrong();
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
    const correct = document.getElementById('correctAnswerData')?.dataset.correct;
    if (correct) highlightCorrect(correct);
    setTimeout(() => document.getElementById('quizForm')?.submit(), 1400);
}

//  Answer selection 
function submitAnswer(selectedOption) {
    if (answered) return;
    answered = true;

    // Unlock + resume audio SYNCHRONOUSLY right here inside the click
    unlockAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

    const correctAnswer = document.getElementById('correctAnswerData')?.dataset.correct;
    const allBtns = document.querySelectorAll('.option-btn');
    const hiddenInput = document.getElementById('selectedOption');
    if (hiddenInput) hiddenInput.value = selectedOption;

    allBtns.forEach(btn => btn.disabled = true);

    const isCorrect = selectedOption === correctAnswer;

    
    playClick();

    // Schedule correct/wrong sound via Web Audio time offsets — no setTimeout
    if (isCorrect) {
        playCorrect();   // starts at audioCtx.currentTime
    } else {
        playWrong();
        highlightCorrect(correctAnswer);
    }

    
    allBtns.forEach(btn => {
        if (btn.dataset.value === selectedOption) {
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
        }
    });

    
    setTimeout(() => document.getElementById('quizForm')?.submit(), 1300);
}

function highlightCorrect(correctText) {
    document.querySelectorAll('.option-btn').forEach(btn => {
        if (btn.dataset.value === correctText) btn.classList.add('correct');
    });
}

//  Result page
function animateScoreRing() {
    const fill  = document.querySelector('.score-ring-fill');
    const pctEl = document.getElementById('percentValue');
    if (!fill || !pctEl) return;
    const pct  = parseFloat(pctEl.dataset.pct || 0);
    const offset = 339.3 - (pct / 100) * 339.3;
    requestAnimationFrame(() => {
        setTimeout(() => { fill.style.strokeDashoffset = offset; }, 80);
    });
}

//  Progress bar 
function initProgressBar() {
    const fill  = document.getElementById('progressFill');
    const qno   = document.getElementById('qnoData');
    const total = document.getElementById('totalData');
    if (!fill || !qno || !total) return;
    const pct = ((parseInt(qno.dataset.qno) - 1) / parseInt(total.dataset.total)) * 100;
    setTimeout(() => { fill.style.width = pct + '%'; }, 100);
}


function addRipple(e) {
    const card   = e.currentTarget;
    const circle = document.createElement('span');
    const rect   = card.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    circle.style.cssText = `
        position:absolute; border-radius:50%; pointer-events:none;
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top  - size/2}px;
        background:rgba(255,107,157,0.15);
        transform:scale(0); animation:ripple 0.5s ease-out forwards;
    `;
    if (!document.getElementById('ripple-style')) {
        const s = document.createElement('style');
        s.id = 'ripple-style';
        s.textContent = '@keyframes ripple{to{transform:scale(2.5);opacity:0}}';
        document.head.appendChild(s);
    }
    card.appendChild(circle);
    setTimeout(() => circle.remove(), 500);
}

//  Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('timer')) {
        initProgressBar();
        startTimer();
    }
    animateScoreRing();
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', addRipple);
    });
    document.querySelectorAll('.option-btn').forEach((btn, i) => {
        btn.style.animation = `slideUp 0.35s ${i * 0.07}s cubic-bezier(0.34,1.56,0.64,1) both`;
    });
});
