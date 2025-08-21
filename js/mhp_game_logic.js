document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const elements = {
        startScreen: document.getElementById('start-screen'),
        gameScreen: document.getElementById('game-screen'),
        endScreen: document.getElementById('end-screen'),
        startButton: document.getElementById('start-button'),
        restartButton: document.getElementById('restart-button'),
        scenarioTitle: document.getElementById('scenario-title'),
        scenarioDesc: document.getElementById('scenario-description'),
        timer: document.getElementById('timer'),
        score: document.getElementById('score'),
        taskDesc: document.getElementById('task-description'),
        choicesContainer: document.getElementById('choices-container'),
        feedback: document.getElementById('feedback'),
        finalScore: document.getElementById('final-score'),
    };

    // --- Game Data & State ---
    const allComponents = [
        { id: 'o_neg_rbc', name: 'O Neg RBC' }, { id: 'o_pos_rbc', name: 'O Pos RBC' },
        { id: 'a_pos_rbc', name: 'A Pos RBC' }, { id: 'k_neg_rbc', name: 'K-Neg RBC' },
        { id: 'ffp', name: 'FFP' }, { id: 'platelets', name: 'Platelets' }, { id: 'cryo', name: 'Cryo' }
    ];

    const scenarios = [
        {
            title: 'Trauma Case',
            description: '32 year old Female, Major Trauma from RTA.',
            patientGroup: 'A Positive',
            specialReq: 'None',
            stages: [
                { type: 'choice', task: 'MHP Activated! First, confirm the dedicated phone line has been given to the clinical team.', choices: [{ text: 'Confirm Phone Line Given', correct: true }], solution: ['Confirm Phone Line Given'] },
                { type: 'pack', task: 'Select components for TRAUMA PACK 1.', components: ['o_neg_rbc', 'o_pos_rbc', 'ffp', 'platelets'], solution: ['o_neg_rbc', 'ffp'], counts: { o_neg_rbc: 4, ffp: 4 }, feedback: "Correct! O Neg RBCs are used for females of child-bearing age in trauma." },
                { type: 'pack', task: 'Sample arrived: Patient is A Positive. Select components for TRAUMA PACK 2.', components: ['a_pos_rbc', 'o_neg_rbc', 'ffp', 'platelets', 'cryo'], solution: ['a_pos_rbc', 'ffp', 'platelets'], counts: { a_pos_rbc: 6, ffp: 4, platelets: 1 }, feedback: "Correct! Group-specific blood is now used." }
            ]
        },
        {
            title: 'Non-Trauma Case',
            description: '75 year old Male, post-operative bleed. A valid sample is in the lab.',
            patientGroup: 'B Negative',
            specialReq: 'Anti-K',
            stages: [
                { type: 'pack', task: 'MHP Activated for a non-trauma bleed with a valid sample. Issue the first wave of red cells.', components: ['o_neg_rbc', 'o_pos_rbc', 'group_rbc'], solution: ['group_rbc'], counts: { group_rbc: 6 }, feedback: 'Correct! With a valid sample, we can issue group-specific blood immediately.' },
                { type: 'choice', task: "The patient's record shows they have Anti-K. What must you ensure for all subsequent red cell units?", choices: [{ text: 'Select K-Negative Red Cells', correct: true }, { text: 'Irradiate all units', correct: false }, { text: 'Call the consultant', correct: false }], solution: ['Select K-Negative Red Cells'] },
                { type: 'pack', task: 'The clinical team requests FFP and Platelets.', components: ['ffp', 'platelets', 'cryo'], solution: ['ffp', 'platelets'], counts: { ffp: 4, platelets: 1 }, feedback: 'Correct! Components are issued as requested and guided by the clinical team.' }
            ]
        }
    ];

    let state = { score: 0, timer: 30, timerInterval: null, currentScenario: null, currentStage: 0 };

    // --- Functions ---
    const startGame = () => {
        state.score = 0;
        state.currentScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        state.currentStage = 0;
        elements.score.textContent = state.score;
        
        elements.startScreen.classList.add('hidden');
        elements.endScreen.classList.add('hidden');
        elements.gameScreen.classList.remove('hidden');
        loadStage();
    };

    const loadStage = () => {
        const stage = state.currentScenario.stages[state.currentStage];
        elements.scenarioTitle.textContent = state.currentScenario.title;
        elements.scenarioDesc.textContent = state.currentScenario.description;
        elements.taskDesc.textContent = stage.task;
        elements.feedback.textContent = '';
        elements.choicesContainer.innerHTML = '';

        if (stage.type === 'choice') {
            stage.choices.forEach(choice => {
                const button = document.createElement('button');
                button.textContent = choice.text;
                button.className = 'w-full mt-2 p-3 bg-gray-200 rounded-lg hover:bg-gray-300';
                button.onclick = () => checkAnswer([choice.text]);
                elements.choicesContainer.appendChild(button);
            });
        }

        if (stage.type === 'pack') {
            elements.choicesContainer.className = 'grid grid-cols-2 md:grid-cols-3 gap-4';
            stage.components.forEach(compId => {
                const comp = allComponents.find(c => c.id.startsWith(compId.split('_')[0]));
                if (comp) {
                    const button = document.createElement('button');
                    const count = stage.counts[compId] || stage.counts[comp.id];
                    let btnText = comp.id === 'group_rbc' ? `${state.currentScenario.patientGroup} RBC` : comp.name;
                    button.textContent = `${btnText} (x${count})`;
                    button.dataset.component = compId;
                    button.className = 'component-btn p-4 border-2 rounded-lg font-semibold';
                    button.addEventListener('click', () => button.classList.toggle('selected'));
                    elements.choicesContainer.appendChild(button);
                }
            });
            const submitButton = document.createElement('button');
            submitButton.id = 'submit-pack-button';
            submitButton.textContent = 'Dispatch Pack';
            submitButton.className = 'w-full mt-4 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 col-span-full';
            submitButton.onclick = () => {
                const selected = Array.from(elements.choicesContainer.querySelectorAll('.selected')).map(btn => btn.dataset.component);
                checkAnswer(selected);
            };
            elements.choicesContainer.appendChild(submitButton);
        }
        startTimer();
    };

    const startTimer = () => {
        clearInterval(state.timerInterval);
        state.timer = 30;
        elements.timer.textContent = state.timer;
        state.timerInterval = setInterval(() => {
            state.timer--;
            elements.timer.textContent = state.timer;
            if (state.timer <= 0) {
                clearInterval(state.timerInterval);
                handleResult(false, 0, "Time's up!");
            }
        }, 1000);
    };

    const checkAnswer = (selectedAnswers) => {
        clearInterval(state.timerInterval);
        const stage = state.currentScenario.stages[state.currentStage];
        const solution = stage.solution;
        const isCorrect = selectedAnswers.length === solution.length && selectedAnswers.every(val => solution.includes(val));
        
        const points = isCorrect ? state.timer : 0;
        const feedbackText = isCorrect ? (stage.feedback || 'Correct!') : 'Incorrect. Reviewing procedure...';
        handleResult(isCorrect, points, feedbackText);
    };

    const handleResult = (correct, points, text) => {
        if (correct) {
            state.score += points;
            elements.score.textContent = state.score;
            elements.feedback.className = 'mt-4 h-12 text-lg font-semibold text-center text-green-600';
        } else {
            elements.feedback.className = 'mt-4 h-12 text-lg font-semibold text-center text-red-600';
        }
        elements.feedback.textContent = text;
        elements.choicesContainer.querySelectorAll('button').forEach(btn => btn.disabled = true);
        setTimeout(nextStage, 2500);
    };

    const nextStage = () => {
        state.currentStage++;
        if (state.currentStage >= state.currentScenario.stages.length) {
            endGame();
        } else {
            loadStage();
        }
    };

    const endGame = () => {
        elements.gameScreen.classList.add('hidden');
        elements.endScreen.classList.remove('hidden');
        elements.finalScore.textContent = state.score;
    };

    // --- Event Listeners ---
    elements.startButton.addEventListener('click', startGame);
    elements.restartButton.addEventListener('click', startGame);
});
