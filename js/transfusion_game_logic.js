document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    const panelAntigens = {
        'Rh-hr': ['D', 'C', 'E', 'c', 'e'],
        'Kell': ['K', 'k'],
        'Duffy': ['Fya', 'Fyb'],
        'Kidd': ['Jka', 'Jkb'],
        'MNS': ['M', 'N', 'S', 's'],
        'P': ['P1'],
        'Lewis': ['Lea', 'Leb']
    };

    // Note: Profiles are ordered according to the flat list in panelAntigensList
    const panelAntigensList = [].concat(...Object.values(panelAntigens));

    const panelCells = [
        //       D  C  E  c  e   K  k   Fya Fyb  Jka Jkb  M  N  S  s   P1  Lea Leb
        { donor: 'R1R1', profile: ['+', '+', '0', '0', '+',  '0', '+',  '+', '0',  '+', '0',  '+', '0', '+', '0',  '+', '0', '+'] },
        { donor: 'R2R2', profile: ['+', '0', '+', '+', '0',  '0', '+',  '0', '+',  '0', '+',  '0', '+', '0', '+',  '+', '+', '0'] },
        { donor: 'rr',   profile: ['0', '0', '0', '+', '+',  '0', '+',  '+', '+',  '+', '+',  '+', '+', '+', '+',  '+', '0', '+'] },
        { donor: 'rr',   profile: ['0', '0', '0', '+', '+',  '+', '+',  '0', '+',  '0', '+',  '+', '0', '0', '+',  '0', '+', '0'] },
        { donor: 'R1r',  profile: ['+', '+', '0', '+', '+',  '0', '+',  '+', '+',  '+', '0',  '0', '+', '0', '+',  '0', '0', '+'] },
        { donor: 'R2r',  profile: ['+', '0', '+', '+', '+',  '0', '+',  '0', '+',  '+', '+',  '+', '0', '+', '+',  '0', '+', '0'] },
        { donor: 'r\'r',  profile: ['0', '+', '0', '+', '+',  '0', '+',  '+', '0',  '+', '0',  '0', '+', '+', '0',  '+', '+', '0'] },
        { donor: 'r"r',  profile: ['0', '0', '+', '+', '+',  '0', '+',  '0', '+',  '0', '+',  '+', '0', '0', '+',  '0', '+', '+'] },
    ];
    
    const gameCases = [
        { 
            name: 'Easy Case 1',
            screen: { I: '2+', II: '0', III: '2+' },
            iat: ['2+', '0', '0', '2+', '2+', '0', '2+', '0'],
            enzyme: [], // Not needed
            auto: '0', 
            solution: 'Anti-K',
            notes: 'A straightforward Anti-K. The reaction pattern perfectly matches the K antigen column.'
        },
        { 
            name: 'Medium Case 1',
            screen: { I: '3+', II: '3+', III: '0' },
            iat: ['3+', '3+', '0', '0', '3+', '3+', 'w+', '0'],
            enzyme: [], // Not needed
            auto: '0', 
            solution: 'Anti-C',
            notes: 'This Anti-C shows dosage. Note the weaker reaction (w+) with cell 7, which is heterozygous for C (r\'r).'
        },
        { 
            name: 'Hard Case 1',
            screen: { I: '3+', II: '3+', III: '3+' },
            iat: ['3+', '3+', '3+', '2+', '3+', '3+', '3+', '3+'],
            enzyme: ['3+', '3+', '3+', '0', '3+', '3+', '3+', '3+'], // Enzyme results are key here
            auto: '0', 
            solution: 'Anti-E and Anti-Fya',
            notes: 'Multiple antibodies are present. The enzyme panel destroys the Fya antigen, making the reaction with cell 4 disappear. This reveals the underlying Anti-E.'
        },
    ];

    // --- ELEMENTS & STATE ---
    const elements = {
        table: document.getElementById('panel-table'),
        answerSelect: document.getElementById('answer-select'),
        submitButton: document.getElementById('submit-answer'),
        nextCaseButton: document.getElementById('next-case'),
        feedbackEl: document.getElementById('feedback'),
        scoreEl: document.getElementById('score'),
        caseNameEl: document.getElementById('case-name'),
        tutorialButton: document.getElementById('tutorial-button'),
        closeTutorialButton: document.getElementById('close-tutorial'),
        tutorialModal: document.getElementById('tutorial-modal'),
        screenButton: document.getElementById('screen-button'),
        closeScreenButton: document.getElementById('close-screen'),
        screenModal: document.getElementById('screen-modal'),
        enzymeButton: document.getElementById('enzyme-button'),
    };
    
    let state = {
        currentCaseIndex: 0,
        score: 0
    };

    // --- FUNCTIONS ---
    function renderPanelStructure() {
        elements.table.innerHTML = '';
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        
        // Top Header Row (Blood Systems)
        const topHeaderRow = document.createElement('tr');
        topHeaderRow.innerHTML = '<th>Donor</th>'; // Placeholder for Donor column
        for (const system in panelAntigens) {
            topHeaderRow.innerHTML += `<th colspan="${panelAntigens[system].length}">${system}</th>`;
        }
        topHeaderRow.innerHTML += '<th colspan="2">Reactions</th>';
        thead.appendChild(topHeaderRow);

        // Bottom Header Row (Antigens)
        const bottomHeaderRow = document.createElement('tr');
        bottomHeaderRow.innerHTML = '<th></th>'; // Placeholder for Donor column
        panelAntigensList.forEach(ag => {
            bottomHeaderRow.innerHTML += `<th class="antigen-header" data-antigen-index="${panelAntigensList.indexOf(ag)}">${ag.replace('a','<sup>a</sup>').replace('b','<sup>b</sup>')}</th>`;
        });
        bottomHeaderRow.innerHTML += '<th>IAT</th><th id="enzyme-header" class="hidden">Enzyme</th>';
        thead.appendChild(bottomHeaderRow);

        elements.table.appendChild(thead);
        elements.table.appendChild(tbody);
    }

    function loadCase(caseIndex) {
        const caseData = gameCases[caseIndex];
        const tbody = elements.table.querySelector('tbody');
        tbody.innerHTML = '';

        panelCells.forEach((cell, index) => {
            const row = document.createElement('tr');
            let rowHtml = `<td>${cell.donor}</td>`;
            cell.profile.forEach((antigenResult, antigenIndex) => {
                rowHtml += `<td data-col-index="${antigenIndex}">${antigenResult}</td>`;
            });
            rowHtml += `<td class="reaction-cell">${caseData.iat[index] || '0'}</td>`;
            rowHtml += `<td class="reaction-cell hidden" data-enzyme-result="true">${caseData.enzyme[index] || '0'}</td>`;
            row.innerHTML = rowHtml;
            tbody.appendChild(row);
        });
        
        const autoRow = document.createElement('tr');
        autoRow.innerHTML = `<td class="font-bold">Auto</td><td colspan="${panelAntigensList.length}"></td><td class="reaction-cell">${caseData.auto}</td><td class="reaction-cell hidden" data-enzyme-result="true">${caseData.auto}</td>`;
        tbody.appendChild(autoRow);

        // Update UI
        elements.caseNameEl.textContent = caseData.name;
        document.getElementById('screen-I').textContent = caseData.screen.I;
        document.getElementById('screen-II').textContent = caseData.screen.II;
        document.getElementById('screen-III').textContent = caseData.screen.III;
        elements.feedbackEl.textContent = 'A new case is ready for investigation.';
        elements.feedbackEl.className = 'mt-1 h-6 text-lg font-semibold text-gray-500';
        elements.submitButton.classList.remove('hidden');
        elements.nextCaseButton.classList.add('hidden');
        elements.answerSelect.disabled = false;
        elements.enzymeButton.disabled = false;
        document.getElementById('enzyme-header').classList.add('hidden');
        document.querySelectorAll('[data-enzyme-result]').forEach(el => el.classList.add('hidden'));
    }

    function populateAnswerOptions() {
        const allAntibodies = ['Anti-D', 'Anti-C', 'Anti-E', 'Anti-c', 'Anti-e', 'Anti-K', 'Anti-k', 'Anti-Fya', 'Anti-Fyb', 'Anti-Jka', 'Anti-Jkb', 'Anti-M', 'Anti-N', 'Anti-S', 'Anti-s', 'Anti-P1', 'Anti-Lea', 'Anti-Leb', 'Autoantibody', 'Anti-E and Anti-Fya'];
        elements.answerSelect.innerHTML = '<option value="">Select Antibody...</option>';
        allAntibodies.forEach(ab => {
            const option = document.createElement('option');
            option.value = ab;
            option.textContent = ab.replace('a', 'a').replace('b', 'b');
            elements.answerSelect.appendChild(option);
        });
    }

    function checkAnswer() {
        const selectedAnswer = elements.answerSelect.value;
        const correctAnswer = gameCases[state.currentCaseIndex].solution;

        if (selectedAnswer === correctAnswer) {
            elements.feedbackEl.textContent = 'Correct! Excellent work.';
            elements.feedbackEl.className = 'mt-1 h-6 text-lg font-semibold text-green-600';
            state.score += 10;
            elements.scoreEl.textContent = state.score;
        } else {
            elements.feedbackEl.textContent = `Not quite. The correct answer is ${correctAnswer}.`;
            elements.feedbackEl.className = 'mt-1 h-6 text-lg font-semibold text-red-600';
        }
        
        elements.submitButton.classList.add('hidden');
        elements.nextCaseButton.classList.remove('hidden');
        elements.answerSelect.disabled = true;
    }
    
    function toggleExclusion(columnIndex) {
        const th = document.querySelector(`.antigen-header[data-antigen-index="${columnIndex}"]`);
        const tds = document.querySelectorAll(`td[data-col-index="${columnIndex}"]`);
        th.classList.toggle('line-through');
        tds.forEach(td => td.classList.toggle('line-through'));
    }

    // --- EVENT LISTENERS ---
    elements.table.addEventListener('click', (e) => {
        const header = e.target.closest('.antigen-header');
        if (header) {
            toggleExclusion(header.dataset.antigenIndex);
        }
    });
    
    elements.submitButton.addEventListener('click', checkAnswer);
    
    elements.nextCaseButton.addEventListener('click', () => {
        state.currentCaseIndex = (state.currentCaseIndex + 1) % gameCases.length;
        loadCase(state.currentCaseIndex);
    });
    
    elements.enzymeButton.addEventListener('click', () => {
        document.getElementById('enzyme-header').classList.remove('hidden');
        document.querySelectorAll('[data-enzyme-result]').forEach(el => el.classList.remove('hidden'));
        elements.enzymeButton.disabled = true;
    });

    elements.tutorialButton.addEventListener('click', () => elements.tutorialModal.classList.add('active'));
    elements.closeTutorialButton.addEventListener('click', () => elements.tutorialModal.classList.remove('active'));
    elements.screenButton.addEventListener('click', () => elements.screenModal.classList.add('active'));
    elements.closeScreenButton.addEventListener('click', () => elements.screenModal.classList.remove('active'));

    // --- INITIALIZATION ---
    renderPanelStructure();
    populateAnswerOptions();
    loadCase(state.currentCaseIndex);
});
