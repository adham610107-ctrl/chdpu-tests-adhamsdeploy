// Barcha savollarni o'z ichiga oladigan global bazalar
let allQuestions = [];
let subjectsData = {
    musiqa_nazariyasi: [],
    cholgu_ijrochiligi: [],
    vokal_ijrochiligi: [],
    metodika_repertuar: []
};

// Test holati
let currentTestQuestions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let wrongCount = 0;
let hasMistakeInRound = false;

// 1. Dastlabki yuklash
window.onload = async () => {
    generateChapterButtons();
    await loadAllJSONs();
};

async function loadAllJSONs() {
    try {
        const files = ['musiqa_nazariyasi.json', 'cholgu_ijrochiligi.json', 'vokal_ijrochiligi.json', 'metodika_repertuar.json'];
        for (let file of files) {
            let res = await fetch(file);
            let data = await res.json();
            let subjectName = file.split('.')[0];
            subjectsData[subjectName] = data;
            allQuestions = allQuestions.concat(data);
        }
    } catch (e) {
        console.error("Fayllarni yuklashda xatolik. Serverda ishlating (Live Server).", e);
    }
}

// 2. Ekranlarni boshqarish
function enterDashboard() {
    document.getElementById('welcome-screen').classList.replace('active', 'hidden');
    document.getElementById('dashboard-screen').classList.replace('hidden', 'active');
}

function backToDashboard() {
    document.getElementById('test-screen').classList.replace('active', 'hidden');
    document.getElementById('dashboard-screen').classList.replace('hidden', 'active');
}

function toggleChapters() {
    document.getElementById('chapters-grid').classList.toggle('hidden');
}

// 40 ta tugmani generatsiya qilish (Har biri 20 tadan)
function generateChapterButtons() {
    const grid = document.getElementById('chapters-grid');
    for (let i = 1; i <= 40; i++) {
        let btn = document.createElement('button');
        btn.className = 'chapter-btn';
        let start = (i - 1) * 20 + 1;
        let end = i * 20;
        btn.innerText = `${start}-${end}`;
        btn.onclick = () => startSequentialTest(i);
        grid.appendChild(btn);
    }
}

// 3. Testni boshlash mantiqlari
function startSubjectTest(subject) {
    let pool = [...subjectsData[subject]];
    currentTestQuestions = shuffleArray(pool).slice(0, 20);
    initTestUI();
}

function startRandomAllTest() {
    let pool = [...allQuestions];
    currentTestQuestions = shuffleArray(pool).slice(0, 20);
    initTestUI();
}

function startSequentialTest(chapterNum) {
    let startIdx = (chapterNum - 1) * 20;
    currentTestQuestions = allQuestions.slice(startIdx, startIdx + 20);
    initTestUI();
}

// 4. Testni ekranga chiqarish va Mantiq
function initTestUI() {
    document.getElementById('dashboard-screen').classList.replace('active', 'hidden');
    document.getElementById('test-screen').classList.replace('hidden', 'active');
    
    // Statistika nolga tushadi
    currentQuestionIndex = 0;
    correctCount = 0;
    wrongCount = 0;
    hasMistakeInRound = false;
    updateStatsBar();

    renderQuestions();
    window.scrollTo(0, 0);
}

function renderQuestions() {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';

    currentTestQuestions.forEach((qObj, index) => {
        let card = document.createElement('div');
        card.className = `question-card ${index > 0 ? 'blurred-q' : ''}`; // 1-chisi ochiq, qolgani blur
        card.id = `q-card-${index}`;

        let title = document.createElement('h3');
        title.innerText = `${index + 1}. ${qObj.q}`;
        card.appendChild(title);

        qObj.options.forEach((optText, optIdx) => {
            let btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = optText;
            btn.onclick = () => checkAnswer(btn, optIdx, qObj.answer, index);
            card.appendChild(btn);
        });

        container.appendChild(card);
    });
}

function checkAnswer(btnElement, selectedIdx, correctIdx, qIndex) {
    let card = document.getElementById(`q-card-${qIndex}`);
    let buttons = card.querySelectorAll('.option-btn');

    // Barcha tugmalarni muzlatish (qayta bosmaslik uchun)
    buttons.forEach(b => b.disabled = true);

    if (selectedIdx === correctIdx) {
        btnElement.classList.add('correct-choice');
        correctCount++;
    } else {
        btnElement.classList.add('wrong-choice'); // Faqat xato qizil bo'ladi, to'g'ri ko'rsatilmaydi!
        wrongCount++;
        hasMistakeInRound = true; // Xato qilindi
    }

    currentQuestionIndex++;
    updateStatsBar();

    // Keyingi savolni blured holatdan chiqarish
    if (currentQuestionIndex < 20) {
        document.getElementById(`q-card-${currentQuestionIndex}`).classList.remove('blurred-q');
        // Kichik avtomatik scroll
        document.getElementById(`q-card-${currentQuestionIndex}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        finishRound();
    }
}

function updateStatsBar() {
    document.getElementById('correct-count').innerText = correctCount;
    document.getElementById('wrong-count').innerText = wrongCount;
    let percent = currentQuestionIndex === 0 ? 0 : Math.round((correctCount / currentQuestionIndex) * 100);
    document.getElementById('percent-count').innerText = `${percent}%`;
    document.getElementById('progress-fill').style.width = `${(currentQuestionIndex / 20) * 100}%`;
}

function finishRound() {
    setTimeout(() => {
        if (hasMistakeInRound) {
            alert(`Sizda ${wrongCount} ta xato bor. 100% natija qayd etilmaguncha testlar aralashtirilib qayta beriladi!`);
            // O'sha 20 ta savolni o'zaro aralashtirib boshidan berish
            currentTestQuestions = shuffleArray(currentTestQuestions);
            initTestUI(); 
        } else {
            alert("MUKAMMAL! Siz barcha 20 ta savolga to'g'ri javob berdingiz.");
            backToDashboard();
        }
    }, 500);
}

// Yordamchi funksiya: Massivni aralashtirish
function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
