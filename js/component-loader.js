<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chemistry Case Challenge - SGC</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"></script>
    <style>
        body { font-family: 'Inter', sans-serif; }
        .nhs-blue { background-color: #005EB8; }
        .nhs-dark-blue { background-color: #003087; }
        .nhs-light-grey { background-color: #F0F4F5; }
        .nhs-text-blue { color: #005EB8; }
        .nhs-text-dark-blue { color: #003087; }
        .result-table th, .result-table td { padding: 0.5rem 1rem; border-bottom: 1px solid #e5e7eb; }
        .result-abnormal { color: #dc2626; font-weight: bold; }
        .diagnosis-option-btn:disabled { background-color: #d1d5db; cursor: not-allowed; opacity: 0.7; }
        .diagnosis-option-btn {
             transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
        }
        .diagnosis-option-btn:hover:not(:disabled) {
            background-color: #e5e7eb;
        }
         .diagnosis-option-btn:active:not(:disabled) {
            transform: scale(0.98);
        }
    </style>
</head>
<body class="bg-gray-50 text-gray-800 flex flex-col min-h-screen">

    <div id="header-placeholder"></div>

    <main class="py-12 md:py-16 bg-nhs-light-grey flex-grow">
        <div class="container mx-auto px-4 sm:px-6 max-w-4xl">
            <div class="text-center">
                <a href="games.html" class="inline-flex items-center nhs-text-blue font-semibold mb-8 hover:underline">
                    <i data-feather="arrow-left" class="w-4 h-4 mr-2"></i>Back to Games
                </a>
                <h2 class="text-3xl md:text-4xl font-bold nhs-text-dark-blue mb-4">Clinical Chemistry Case Challenge</h2>
                <p class="text-gray-600 mb-8 max-w-2xl mx-auto">Analyse the patient's case notes and biochemistry results to determine the most likely diagnosis.</p>
            </div>

            <div class="bg-white p-6 md:p-8 rounded-lg shadow-lg text-left">
                <h3 class="text-xl font-bold nhs-text-dark-blue mb-4 border-b-2 border-gray-200 pb-2">Case Study</h3>
                <p id="case-scenario" class="text-gray-700 mb-6 min-h-[60px]"></p>

                <h3 class="text-xl font-bold nhs-text-dark-blue mb-4 border-b-2 border-gray-200 pb-2">Results</h3>
                <div class="overflow-x-auto">
                    <table id="results-table" class="w-full result-table mb-4">
                        </table>
                </div>

                <div class="mt-8">
                    <h3 class="text-xl font-bold nhs-text-dark-blue mb-4">What is the most likely diagnosis?</h3>
                    <div id="diagnosis-options" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        </div>
                </div>
            </div>
            
            <div id="case-feedback" class="mt-6 p-4 rounded-lg text-lg font-semibold text-center hidden"></div>
            <div class="text-center">
                <button id="next-question-btn" class="mt-6 bg-gray-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition duration-300 hidden">Next Case</button>
            </div>
        </div>
    </main>

    <div id="footer-placeholder"></div>

    <script src="js/component-loader.js"></script>
    
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // --- DOM Element References ---
            const caseScenarioEl = document.getElementById('case-scenario');
            const resultsTableEl = document.getElementById('results-table');
            const diagnosisOptionsEl = document.getElementById('diagnosis-options');
            const caseFeedbackEl = document.getElementById('case-feedback');
            const nextCaseBtn = document.getElementById('next-question-btn');

            // --- Game Data ---
            const cases = [
                {
                    scenario: "A 68-year-old man presents to A&E with severe abdominal pain radiating to his back. He admits to heavy alcohol consumption.",
                    results: [
                        { test: 'Amylase', value: '1250 U/L', ref: '25-125', abnormal: true },
                        { test: 'Sodium', value: '138 mmol/L', ref: '135-145', abnormal: false },
                        { test: 'Urea', value: '6.5 mmol/L', ref: '2.5-7.8', abnormal: false },
                        { test: 'ALT', value: '45 U/L', ref: '<50', abnormal: false },
                    ],
                    options: ['Myocardial Infarction', 'Acute Pancreatitis', 'Diabetic Ketoacidosis', 'Appendicitis'],
                    answer: 'Acute Pancreatitis'
                },
                {
                    scenario: "A 45-year-old woman presents with fatigue, weight gain, and feeling cold. Her GP suspects a thyroid issue.",
                    results: [
                        { test: 'TSH', value: '12.5 mU/L', ref: '0.4-4.0', abnormal: true },
                        { test: 'Free T4', value: '8.0 pmol/L', ref: '10-22', abnormal: true },
                        { test: 'Sodium', value: '140 mmol/L', ref: '135-145', abnormal: false },
                    ],
                    options: ['Hyperthyroidism', 'Hypothyroidism', 'Cushing\'s Syndrome', 'Normal Thyroid Function'],
                    answer: 'Hypothyroidism'
                },
                {
                    scenario: "A 55-year-old man with known type 2 diabetes presents with confusion. He has been unwell with a chest infection for 3 days.",
                    results: [
                        { test: 'Glucose', value: '35.2 mmol/L', ref: '4.0-7.0', abnormal: true },
                        { test: 'Ketones', value: 'Negative', ref: 'Negative', abnormal: false },
                        { test: 'Sodium', value: '155 mmol/L', ref: '135-145', abnormal: true },
                        { test: 'Osmolality (calc)', value: '350 mOsmol/kg', ref: '275-295', abnormal: true },
                    ],
                    options: ['Diabetic Ketoacidosis (DKA)', 'Hypoglycaemia', 'Hyperosmolar Hyperglycaemic State (HHS)', 'Sepsis'],
                    answer: 'Hyperosmolar Hyperglycaemic State (HHS)'
                },
                {
                    scenario: "A 24-year-old female presents with central chest pain. An ECG is performed.",
                    results: [
                        { test: 'Troponin I', value: '1500 ng/L', ref: '<15', abnormal: true },
                        { test: 'CK', value: '350 U/L', ref: '<145', abnormal: true },
                        { test: 'Potassium', value: '4.1 mmol/L', ref: '3.5-5.3', abnormal: false },
                    ],
                    options: ['Acute Pancreatitis', 'Pulmonary Embolism', 'Myocardial Infarction', 'Stable Angina'],
                    answer: 'Myocardial Infarction'
                },
                {
                    scenario: "A 72-year-old male with a history of bone pain and frequent infections presents with fatigue.",
                    results: [
                        { test: 'Total Protein', value: '105 g/L', ref: '60-80', abnormal: true },
                        { test: 'Albumin', value: '30 g/L', ref: '35-50', abnormal: true },
                        { test: 'Adjusted Calcium', value: '2.95 mmol/L', ref: '2.2-2.6', abnormal: true },
                        { test: 'Creatinine', value: '180 umol/L', ref: '64-104', abnormal: true },
                        { test: 'Serum Free Light Chains', value: 'Kappa:Lambda ratio 5.60', ref: '0.26-1.65', abnormal: true },
                    ],
                    options: ['Liver Disease', 'Dehydration', 'Multiple Myeloma', 'Hyperparathyroidism'],
                    answer: 'Multiple Myeloma'
                },
                {
                    scenario: "A 35-year-old female presents with jaundice, dark urine, and right upper quadrant pain. She denies alcohol use.",
                    results: [
                        { test: 'Bilirubin', value: '85 umol/L', ref: '<21', abnormal: true },
                        { test: 'ALT', value: '450 U/L', ref: '<40', abnormal: true },
                        { test: 'AST', value: '380 U/L', ref: '<30', abnormal: true },
                        { test: 'Alkaline Phosphatase', value: '150 U/L', ref: '30-130', abnormal: true },
                    ],
                    options: ['Acute Pancreatitis', 'Acute Hepatitis', 'Gilbert\'s Syndrome', 'Gallstones'],
                    answer: 'Acute Hepatitis'
                },
                {
                    scenario: "A 60-year-old male is reviewed in the renal clinic. He has a long history of hypertension and type 2 diabetes.",
                    results: [
                        { test: 'Creatinine', value: '250 umol/L', ref: '64-104', abnormal: true },
                        { test: 'eGFR', value: '25 mL/min/1.73m²', ref: '>60', abnormal: true },
                        { test: 'Urea', value: '15.2 mmol/L', ref: '2.5-7.8', abnormal: true },
                        { test: 'Potassium', value: '5.6 mmol/L', ref: '3.5-5.3', abnormal: true },
                    ],
                    options: ['Acute Kidney Injury', 'Chronic Kidney Disease', 'Nephrotic Syndrome', 'Urinary Tract Infection'],
                    answer: 'Chronic Kidney Disease'
                },
                {
                    scenario: "A 30-year-old female presents with muscle weakness, hypertension, and weight gain, particularly around her abdomen.",
                    results: [
                        { test: 'Cortisol (9am)', value: '750 nmol/L', ref: '102-535', abnormal: true },
                        { test: 'Overnight Dexamethasone Suppression', value: 'Cortisol 600 nmol/L', ref: '<50', abnormal: true },
                        { test: 'Potassium', value: '3.1 mmol/L', ref: '3.5-5.3', abnormal: true },
                    ],
                    options: ['Addison\'s Disease', 'Hypothyroidism', 'Cushing\'s Syndrome', 'Conn\'s Syndrome'],
                    answer: 'Cushing\'s Syndrome'
                },
                {
                    scenario: "A patient presents with severe dehydration, hypotension, and confusion following a bout of vomiting and diarrhoea.",
                    results: [
                        { test: 'Sodium', value: '122 mmol/L', ref: '133-146', abnormal: true },
                        { test: 'Potassium', value: '2.8 mmol/L', ref: '3.5-5.3', abnormal: true },
                        { test: 'Urea', value: '18.1 mmol/L', ref: '2.5-7.8', abnormal: true },
                        { test: 'Creatinine', value: '160 umol/L', ref: '64-104', abnormal: true },
                    ],
                    options: ['Diabetes Insipidus', 'Acute Kidney Injury (Pre-renal)', 'SIADH', 'Primary Polydipsia'],
                    answer: 'Acute Kidney Injury (Pre-renal)'
                },
                {
                    scenario: "An 18-year-old presents to A&E with confusion, vomiting and a Kussmaul breathing pattern. A fingerprick glucose is very high.",
                    results: [
                        { test: 'Glucose', value: '25.6 mmol/L', ref: '4.0-7.0', abnormal: true },
                        { test: 'Ketones (Blood)', value: '4.1 mmol/L', ref: '<0.6', abnormal: true },
                        { test: 'Bicarbonate', value: '12 mmol/L', ref: '22-29', abnormal: true },
                        { test: 'pH (venous)', value: '7.15', ref: '7.32-7.42', abnormal: true },
                    ],
                    options: ['Hyperosmolar Hyperglycaemic State (HHS)', 'Alcoholic Ketoacidosis', 'Diabetic Ketoacidosis (DKA)', 'Lactic Acidosis'],
                    answer: 'Diabetic Ketoacidosis (DKA)'
                },
                {
                    scenario: "A 40-year-old man presents with extreme fatigue, skin hyperpigmentation, and postural hypotension.",
                    results: [
                        { test: 'Sodium', value: '128 mmol/L', ref: '133-146', abnormal: true },
                        { test: 'Potassium', value: '5.9 mmol/L', ref: '3.5-5.3', abnormal: true },
                        { test: 'Cortisol (9am)', value: '45 nmol/L', ref: '102-535', abnormal: true },
                        { test: 'ACTH', value: '850 ng/L', ref: '7.2-63.3', abnormal: true },
                    ],
                    options: ['Cushing\'s Syndrome', 'Addison\'s Disease', 'Hypopituitarism', 'Conn\'s Syndrome'],
                    answer: 'Addison\'s Disease'
                },
                {
                    scenario: "A 58-year-old woman is investigated for persistent bone pain. Her GP notes a raised alkaline phosphatase.",
                    results: [
                        { test: 'Alkaline Phosphatase', value: '550 U/L', ref: '30-130', abnormal: true },
                        { test: 'Adjusted Calcium', value: '2.4 mmol/L', ref: '2.2-2.6', abnormal: false },
                        { test: 'Phosphate', value: '1.1 mmol/L', ref: '0.8-1.5', abnormal: false },
                        { test: 'Gamma GT', value: '40 U/L', ref: '<40', abnormal: false },
                    ],
                    options: ['Primary Hyperparathyroidism', 'Liver disease', 'Vitamin D Deficiency', 'Paget\'s Disease of Bone'],
                    answer: 'Paget\'s Disease of Bone'
                },
                {
                    scenario: "A 65-year-old male presents with jaundice and pruritus (itching). He notes his stools have become pale.",
                    results: [
                        { test: 'Bilirubin', value: '120 umol/L', ref: '<21', abnormal: true },
                        { test: 'Alkaline Phosphatase', value: '800 U/L', ref: '30-130', abnormal: true },
                        { test: 'Gamma GT', value: '950 U/L', ref: '<55', abnormal: true },
                        { test: 'ALT', value: '95 U/L', ref: '<50', abnormal: true },
                    ],
                    options: ['Acute Hepatitis', 'Haemolytic Anaemia', 'Obstructive Jaundice', 'Gilbert\'s Syndrome'],
                    answer: 'Obstructive Jaundice'
                }
            ];

            // --- Game State ---
            let currentCase = {};
            let usedCaseIndices = [];

            // --- Game Logic Functions ---
            function loadNewCase() {
                if (usedCaseIndices.length === cases.length) {
                    usedCaseIndices = []; 
                }
                let availableCases = cases.filter((c, index) => !usedCaseIndices.includes(index));
                const caseIndexInAvailable = Math.floor(Math.random() * availableCases.length);
                currentCase = availableCases[caseIndexInAvailable];
                const actualIndex = cases.indexOf(currentCase);
                usedCaseIndices.push(actualIndex);
                
                caseScenarioEl.textContent = currentCase.scenario;
                caseFeedbackEl.classList.add('hidden');
                nextCaseBtn.classList.add('hidden');

                let resultsHTML = '<thead><tr class="text-left"><th class="font-semibold pb-2">Test</th><th class="font-semibold pb-2 text-right">Result</th><th class="font-semibold pb-2 text-right">Reference Range</th></tr></thead><tbody>';
                currentCase.results.forEach(res => {
                    resultsHTML += `<tr><td class="font-semibold py-1">${res.test}</td><td class="text-right py-1 ${res.abnormal ? 'result-abnormal' : ''}">${res.value}</td><td class="text-xs text-gray-500 text-right py-1">${res.ref}</td></tr>`;
                });
                resultsHTML += '</tbody>';
                resultsTableEl.innerHTML = resultsHTML;

                diagnosisOptionsEl.innerHTML = '';
                const shuffledOptions = [...currentCase.options].sort(() => Math.random() - 0.5);
                shuffledOptions.forEach(opt => {
                    const button = document.createElement('button');
                    button.className = 'diagnosis-option-btn w-full text-left p-4 bg-gray-100 rounded-lg hover:bg-gray-200';
                    button.textContent = opt;
                    button.addEventListener('click', checkCaseAnswer);
                    diagnosisOptionsEl.appendChild(button);
                });
            }

            function checkCaseAnswer(event) {
                const selectedAnswer = event.target.textContent;
                caseFeedbackEl.classList.remove('hidden');
                nextCaseBtn.classList.remove('hidden');
                
                if (selectedAnswer === currentCase.answer) {
                    caseFeedbackEl.textContent = 'Correct! Well done.';
                    caseFeedbackEl.className = 'mt-6 p-4 rounded-lg text-lg font-semibold bg-green-100 text-green-800 text-center';
                } else {
                    caseFeedbackEl.textContent = `Not quite. The correct diagnosis is: ${currentCase.answer}.`;
                    caseFeedbackEl.className = 'mt-6 p-4 rounded-lg text-lg font-semibold bg-red-100 text-red-800 text-center';
                }

                document.querySelectorAll('.diagnosis-option-btn').forEach(btn => {
                    btn.disabled = true;
                    if (btn.textContent === currentCase.answer) {
                        btn.classList.add('bg-green-200');
                    } else if (btn.textContent === selectedAnswer) {
                        btn.classList.add('bg-red-200');
                    }
                });
            }

            // --- Initialisation ---
            if (nextCaseBtn) {
                nextCaseBtn.addEventListener('click', loadNewCase);
            }
            loadNewCase();
            
            // Re-render any Feather icons in the main body content.
            // Your component-loader will handle icons in the header/footer.
            if (typeof feather !== 'undefined') {
                feather.replace();
            }
        });
    </script>
</body>
</html>
