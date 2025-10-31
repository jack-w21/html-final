
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let particles = [];
const PARTICLE_COUNT = 100; // more particles for effect
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
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            hue: Math.random() * 360
        });
    }
}
initParticles();

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        // mouse interaction: stronger repulsion
        if (mouse.x !== null) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 150; // bigger interaction range
            if (dist < maxDist && dist > 0) {
                const force = (maxDist - dist) / maxDist;
                p.x += (dx / dist) * force * 2.5; // stronger push
                p.y += (dy / dist) * force * 2.5;
            }
        }

        // move normally
        p.x += p.vx;
        p.y += p.vy;

        // wrap edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${p.hue}, 70%, 80%)`;
        ctx.fill();
    });

    // Draw lines between nearby particles for dynamic effect
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255,255,255,${1 - dist/100})`;
                ctx.lineWidth = 0.7;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(drawParticles);
}
drawParticles();




const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

let currentAnswer = "";
let score = 0;
let lives = 5;

async function loadQuestion() {
    if (lives <= 0) return;

    questionEl.textContent = "Loading question...";
    optionsEl.innerHTML = "";

    try {
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
            btn.onclick = () => checkAnswer(btn);
            optionsEl.appendChild(btn);
        });

    } catch (err) {
        console.error(err);
        questionEl.textContent = "Failed to load question. Please try again.";
    }
}

function checkAnswer(selectedBtn) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true); // disable all

    // Highlight correct and wrong
    buttons.forEach(b => {
        if (b.textContent === currentAnswer) {
            b.style.backgroundColor = '#4CAF50'; // green
        } else if (b === selectedBtn && b.textContent !== currentAnswer) {
            b.style.backgroundColor = '#f44336'; // red
        }
    });

    // Update score and lives
    if (selectedBtn.textContent === currentAnswer) {
        score++;
        scoreEl.textContent = score;
    } else {
        lives--;
        livesEl.textContent = lives;
    }

    // Check game over
    if (lives <= 0) {
        questionEl.textContent = "💀 Game Over!";
        optionsEl.innerHTML += `<button onclick="location.reload()">Restart</button>`;
        return;
    }

    // Load next question after 1 second
    setTimeout(loadQuestion, 1000);
}



