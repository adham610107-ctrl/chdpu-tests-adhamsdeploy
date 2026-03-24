let fullBank = [];
let currentBatch = [];
let currentIndex = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let hasMistakeInRound = false;

// Oynalarni boshqarish
function showWelcome() {
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('quiz-area').classList.add('hidden');
    document.getElementById('welcome-screen').classList.remove('hidden');
    document.body.classList.remove('quiz-active');
}

function showDashboard() {
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('quiz-area').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.body.classList.remove('quiz-active');
}

// Custom Modal tizimi
let modalCallback = null;
function showModal(title, text, btnText, callback) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-text').innerText = text;
    document.getElementById('modal-btn').innerText = btnText;
    document.getElementById('custom-modal').classList.remove('hidden');
    modalCallback = callback;
}

function closeModal() {
    document.getElementById('custom-modal').classList.add('hidden');
    if (modalCallback) modalCallback();
}

// Savollarni yuklash
async function loadSubject(fileName) {
    try {
        const response = await fetch(fileName);
        if (!response.ok) throw new Error("Fayl topilmadi");
        let data = await response.json();
        
        fullBank = data;
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('quiz-area').classList.remove('hidden');
        document.body.classList.add('quiz-active');
        
        startNewRound();
    } catch (e) {
        showModal("Xatolik!", "Test bazasi topilmadi. JSON fayllar joylashuvini tekshiring.", "Qaytish", showDashboard);
    }
}

function startNewRound() {
    if (fullBank.length === 0) {
        showModal("Tugadi!", "Siz barcha testlarni yechib bo'ldingiz!", "Asosiy menyu", showDashboard);
        return;
    }
    
    currentBatch = shuffle(fullBank).slice(0, 20);
    restartBatchStats();
    renderQuestions();
}

function restartBatchStats() {
    currentIndex = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    hasMistakeInRound = false;
    updateStatsUI();
}

function renderQuestions() {
    const list = document.getElementById('questions-list');
    list.innerHTML = '';
    
    currentBatch.forEach((q, idx) => {
        const div = document.createElement('div');
        div.className = `question-card ${idx === 0 ? '' : 'blurred-q'}`;
        div.id = `q-block-${idx}`;
        
        let html = `<h3>${idx + 1}. ${q.q || q.question}</h3><div class="options-wrapper">`;
        
        q.options.forEach((opt, optIdx) => {
            html += `<button class="opt-btn" onclick="handleAnswer(${idx}, ${optIdx}, ${q.answer})">${opt}</button>`;
        });
        
        html += `</div>`;
        div.innerHTML = html;
        list.appendChild(div);
    });
    
    // Testlar tushib ketgan bo'lsa, holatini tiklash
    document.querySelectorAll('.question-card').forEach(el => el.classList.remove('gravity-fall'));
}

function handleAnswer(qIdx, selectedIdx, correctIdx) {
    if (qIdx !== currentIndex) return; // Faqat aktiv savolga javob berish mumkin
    
    const block = document.getElementById(`q-block-${qIdx}`);
    const buttons = block.querySelectorAll('.opt-btn');
    
    // Tugmalarni bloklash
    buttons.forEach(btn => btn.disabled = true);
    
    if (selectedIdx === correctIdx) {
        buttons[selectedIdx].classList.add('correct-choice');
        correctAnswers++;
    } else {
        buttons[selectedIdx].classList.add('wrong-choice');
        wrongAnswers++;
        hasMistakeInRound = false; // TRUE bo'lishi kerak. Pastda to'g'rilandi.
        hasMistakeInRound = true;
        // DIQQAT: Qat'iy talabga ko'ra, to'g'ri javob yashil bilan ko'rsatilmaydi!
    }
    
    currentIndex++;
    updateStatsUI();
    
    setTimeout(() => {
        block.classList.add('blurred-q'); // Oldingisini xiralashtirish
        
        if (currentIndex < currentBatch.length) {
            const nextBlock = document.getElementById(`q-block-${currentIndex}`);
            nextBlock.classList.remove('blurred-q');
            nextBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            evaluateRound();
        }
    }, 600);
}

function updateStatsUI() {
    let totalDone = correctAnswers + wrongAnswers;
    let percentage = totalDone > 0 ? Math.round((correctAnswers / totalDone) * 100) : 0;
    
    document.getElementById('current-q-num').innerText = `${Math.min(currentIndex + 1, currentBatch.length)}/20`;
    document.getElementById('correct-count').innerText = correctAnswers;
    document.getElementById('wrong-count').innerText = wrongAnswers;
    document.getElementById('percent-count').innerText = `${percentage}%`;
    document.getElementById('progress-fill').style.width = `${(totalDone / 20) * 100}%`;
}

function evaluateRound() {
    if (hasMistakeInRound) {
        showModal(
            "Xato topildi!", 
            "Materialni mukammal o'zlashtirish uchun ushbu 20 ta savolni qaytadan ishlashingiz kerak.", 
            "Qayta ishlash", 
            () => {
                currentBatch = shuffle(currentBatch);
                restartBatchStats();
                renderQuestions();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        );
    } else {
        // GRAVITY EFFEKTI (100% to'g'ri bo'lganda)
        document.querySelectorAll('.question-card').forEach(el => {
            el.classList.add('gravity-fall');
        });
        
        // HARFLAR YOMG'IRI (Confetti)
        var duration = 3000;
        var end = Date.now() + duration;
        (function frame() {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#4A7C59', '#68D391'] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#4A7C59', '#68D391'] });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());

        setTimeout(() => {
            showModal(
                "Mukammal!", 
                "Siz 20 ta savolga 100% to'g'ri javob berdingiz. Keyingi blokga o'tamiz.", 
                "Keyingi savollar", 
                () => {
                    // Ishlanganlarni o'chirish (agar kerak bo'lsa) yoki yangi yuklash
                    startNewRound();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            );
        }, 1500);
    }
}

function shuffle(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
