
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // run once on load


let particles = [];
const particleCount = 120;
const mouse = { x: null, y: null };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('mousemove', e => {
    mouse.x = e.x;
    mouse.y = e.y;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = Math.random() * 30 + 1;
    }
    draw() {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
    update() {
        if (mouse.x && mouse.y) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            let maxDist = 120;
            if (dist < maxDist) {
                let force = (maxDist - dist) / maxDist;
                this.x -= dx / 10 * force * this.density;
                this.y -= dy / 10 * force * this.density;
            } else {
                this.x += (this.baseX - this.x) / 20;
                this.y += (this.baseY - this.y) / 20;
            }
        }
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();


let score = 0;
let wrongCount = 0;
const maxWrong = 5;
let questions = [];

const API_URL = "https://api.allorigins.win/get?url=" +
    encodeURIComponent("https://opentdb.com/api.php?amount=50&type=multiple&encode=url3986");

async function loadQuestions() {
    const res = await fetch(API_URL);
    const wrapped = await res.json();
    const data = JSON.parse(wrapped.contents);
    questions = data.results;
    shuffleArray(questions);
    showQuestion();
}

function showQuestion() {
    if (!document.getElementById("question")) return; // skip if on homepage
    if (wrongCount >= maxWrong) {
        document.querySelector(".container").innerHTML = `
            <h1>Game Over!</h1>
            <p>You got ${wrongCount} wrong answers. Your score: ${score}</p>
            <a class="btn" href="quiz.html">Play Again</a>
            <a class="btn" href="index.html">Home</a>
        `;
        return;
    }
    if (questions.length === 0) {
        loadQuestions();
        return;
    }

    const randomIndex = Math.floor(Math.random() * questions.length);
    const q = questions.splice(randomIndex, 1)[0];
    const questionText = decodeURIComponent(q.question);
    const correct = decodeURIComponent(q.correct_answer);
    const options = q.incorrect_answers.map(a => decodeURIComponent(a));
    options.push(correct);
    shuffleArray(options);

    document.getElementById("question").innerHTML = questionText;
    document.getElementById("scoreDisplay").innerText = `Score: ${score} | Wrong: ${wrongCount}/${maxWrong}`;

    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";

    options.forEach(option => {
        const btn = document.createElement("button");
        btn.classList.add("option-btn");
        btn.innerHTML = option;

        btn.onclick = () => {
            if (option === correct) {
                btn.style.background = "green";
                score++;
            } else {
                btn.style.background = "red";
                wrongCount++;
            }
            document.querySelectorAll(".option-btn").forEach(b => b.disabled = true);
            document.getElementById("scoreDisplay").innerText = `Score: ${score} | Wrong: ${wrongCount}/${maxWrong}`;
        };

        optionsDiv.appendChild(btn);
    });
}


document.getElementById("nextBtn")?.addEventListener("click", showQuestion);


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


if (document.getElementById("question")) {
    loadQuestions();
}


