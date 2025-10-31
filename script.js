
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let particles = [];
const PARTICLE_COUNT = 70;
let mouse = { x: null, y: null };
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });

function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
        });
    }
}
initParticles();

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fill();

        // simple mouse effect
        if (mouse.x !== null) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                p.x += (dx / dist) * 0.5;
                p.y += (dy / dist) * 0.5;
            }
        }

        // wrap edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        p.x += p.vx;
        p.y += p.vy;
    });
    requestAnimationFrame(drawParticles);
}
drawParticles();


const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
let currentAnswer = '';

async function loadQuestion() {
    if (!questionEl || !optionsEl) return;

    questionEl.textContent = "Loading question...";
    optionsEl.innerHTML = "";

    try {
        // CORS-safe fetch via AllOrigins
        const apiURL = "https://api.allorigins.win/get?url=" +
            encodeURIComponent("https://opentdb.com/api.php?amount=1&type=multiple");
        const res = await fetch(apiURL);
        const wrapped = await res.json();
        const data = JSON.parse(wrapped.contents);

        const q = data.results[0];

        const parser = new DOMParser();
        const decode = t => parser.parseFromString(t, "text/html").body.textContent;

        currentAnswer = decode(q.correct_answer);

        const options = [...q.incorrect_answers.map(decode), currentAnswer];
        options.sort(() => Math.random() - 0.5);

        questionEl.textContent = decode(q.question);
        optionsEl.innerHTML = '';

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => checkAnswer(opt);
            optionsEl.appendChild(btn);
        });

    } catch (err) {
        console.error(err);
        questionEl.textContent = "Failed to load question. Please try again.";
    }
}

function checkAnswer(selected) {
    if (!selected) return;

    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);

    if (selected === currentAnswer) {
        alert('✅ Correct!');
    } else {
        alert(`❌ Wrong! Correct answer: ${currentAnswer}`);
    }

    setTimeout(loadQuestion, 300); // auto-load next question
}

// load first question
loadQuestion();

