// ===== Global Variables =====
let ctcBreakdownChart = null;

// ===== Professional Tax Data =====
const professionalTax = {
    'maharashtra': { monthly: 200, annualExtra: 300, total: 2500 },
    'karnataka': { monthly: 200, total: 2400 },
    'west-bengal': { monthly: 200, total: 2400 },
    'tamil-nadu': { monthly: 208, total: 2500 },
    'telangana': { monthly: 200, total: 2400 },
    'andhra-pradesh': { monthly: 200, total: 2400 },
    'gujarat': { monthly: 200, total: 2400 },
    'kerala': { monthly: 200, total: 2400 },
    'madhya-pradesh': { monthly: 208, total: 2500 },
    'delhi': { monthly: 0, total: 0 },
    'uttar-pradesh': { monthly: 0, total: 0 },
    'punjab': { monthly: 0, total: 0 },
    'haryana': { monthly: 0, total: 0 },
    'rajasthan': { monthly: 0, total: 0 },
    'other': { monthly: 0, total: 0 }
};

// ===== New Tax Regime Slabs (FY 2025-26) =====
const newTaxSlabs = [
    { min: 0, max: 400000, rate: 0 },
    { min: 400000, max: 800000, rate: 0.05 },
    { min: 800000, max: 1200000, rate: 0.10 },
    { min: 1200000, max: 1600000, rate: 0.15 },
    { min: 1600000, max: 2000000, rate: 0.20 },
    { min: 2000000, max: 2400000, rate: 0.25 },
    { min: 2400000, max: Infinity, rate: 0.30 }
];

// ===== Old Tax Regime Slabs =====
const oldTaxSlabs = [
    { min: 0, max: 250000, rate: 0 },
    { min: 250000, max: 500000, rate: 0.05 },
    { min: 500000, max: 1000000, rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 }
];

// ===== Utility Functions =====
function formatCurrency(amount) {
    return '₹' + Math.round(amount).toLocaleString('en-IN');
}

function parseNumber(value) {
    return parseFloat(value) || 0;
}

// ===== Tax Calculation Functions =====
function calculateTaxBySlabs(taxableIncome, slabs) {
    let tax = 0;
    for (const slab of slabs) {
        if (taxableIncome > slab.min) {
            const taxableInSlab = Math.min(taxableIncome, slab.max) - slab.min;
            tax += taxableInSlab * slab.rate;
        }
    }
    return tax;
}

function calculateNewRegimeTax(grossSalary) {
    const standardDeduction = 75000;
    const taxableIncome = Math.max(0, grossSalary - standardDeduction);
    let tax = calculateTaxBySlabs(taxableIncome, newTaxSlabs);

    // Apply rebate u/s 87A (for income up to 12L)
    if (taxableIncome <= 1200000) {
        tax = Math.max(0, tax - 60000);
    }

    // Add 4% cess
    tax = tax * 1.04;

    return { tax, taxableIncome };
}

function calculateOldRegimeTax(grossSalary, deductions) {
    const standardDeduction = 50000;
    const totalDeductions = standardDeduction + deductions.total;
    const taxableIncome = Math.max(0, grossSalary - totalDeductions);
    let tax = calculateTaxBySlabs(taxableIncome, oldTaxSlabs);

    // Apply rebate u/s 87A (for income up to 5L)
    if (taxableIncome <= 500000) {
        tax = Math.max(0, tax - 12500);
    }

    // Add 4% cess
    tax = tax * 1.04;

    return { tax, taxableIncome };
}

// ===== HRA Exemption Calculator =====
function calculateHRAExemption(basic, da, hraReceived, rentPaid, isMetro) {
    const basicPlusDA = basic + da;
    const actualHRA = hraReceived;
    const rentMinus10Percent = Math.max(0, rentPaid - (0.10 * basicPlusDA));
    const percentageOfBasic = (isMetro ? 0.50 : 0.40) * basicPlusDA;

    const exemption = Math.min(actualHRA, rentMinus10Percent, percentageOfBasic);
    return Math.max(0, exemption);
}

// ===== EPF Calculation =====
function calculateEPF(basic, pfType = 'full') {
    if (pfType === 'capped') {
        const cappedBasic = Math.min(basic, 15000);
        return cappedBasic * 0.12;
    }
    return basic * 0.12;
}

// ===== ESI Calculation =====
function calculateESI(grossMonthly) {
    if (grossMonthly <= 21000) {
        return {
            applicable: true,
            employee: grossMonthly * 0.0075,
            employer: grossMonthly * 0.0325
        };
    }
    return { applicable: false, employee: 0, employer: 0 };
}

// ===== Main Salary Calculation =====
function calculateSalary() {
    // Get input values
    const annualCTC = parseNumber(document.getElementById('annualCTC').value);
    const variablePay = parseNumber(document.getElementById('variablePay').value);
    const includeVariableMonthly = document.getElementById('includeVariableMonthly').checked;
    const cityType = document.getElementById('cityType').value;
    const state = document.getElementById('state').value;
    const taxRegime = document.querySelector('input[name="taxRegime"]:checked').value;

    if (annualCTC === 0) {
        alert('Please enter your Annual CTC');
        return;
    }

    // Basic salary calculation
    const basicType = document.querySelector('input[name="basicType"]:checked').value;
    let annualBasic;
    if (basicType === 'percentage') {
        const basicPercentage = parseNumber(document.getElementById('basicPercentage').value);
        annualBasic = (annualCTC * basicPercentage) / 100;
    } else {
        annualBasic = parseNumber(document.getElementById('basicAbsolute').value);
    }

    const monthlyBasic = annualBasic / 12;

    // Calculate HRA
    const isMetro = cityType === 'metro';
    const hraPercentage = isMetro ? 0.50 : 0.40;
    const annualHRA = annualBasic * hraPercentage;
    const monthlyHRA = annualHRA / 12;

    // Calculate employer contributions (part of CTC but not in gross)
    const employerPF = calculateEPF(monthlyBasic, 'standard') * 12;
    const gratuity = annualBasic * 0.0481;

    // Calculate gross salary (CTC minus employer contributions)
    const annualGross = annualCTC - employerPF - gratuity;

    // Calculate special allowance (balancing figure)
    const annualSpecial = annualGross - annualBasic - annualHRA - variablePay;
    const monthlySpecial = annualSpecial / 12;

    // Monthly calculations
    const monthlyVariable = includeVariableMonthly ? variablePay / 12 : 0;
    const grossMonthly = monthlyBasic + monthlyHRA + monthlySpecial + monthlyVariable;

    // Employee PF
    const monthlyEmployeePF = calculateEPF(monthlyBasic, 'full');
    const annualEmployeePF = monthlyEmployeePF * 12;

    // Professional Tax
    const ptData = professionalTax[state];
    const monthlyPT = ptData.monthly;
    const annualPT = ptData.total;

    // ESI Calculation
    const esiData = calculateESI(grossMonthly);
    const monthlyESI = esiData.employee;
    const annualESI = monthlyESI * 12;

    // Show/hide ESI row
    const esiRow = document.getElementById('monthlyESIRow');
    if (esiRow) {
        esiRow.style.display = esiData.applicable ? 'flex' : 'none';
        if (esiData.applicable) {
            document.getElementById('monthlyESIAmount').textContent = '-' + formatCurrency(monthlyESI);
        }
    }

    // Tax calculation based on regime
    let monthlyTax, annualTax, taxableIncome;

    if (taxRegime === 'new') {
        const newTaxResult = calculateNewRegimeTax(annualGross);
        annualTax = newTaxResult.tax;
        taxableIncome = newTaxResult.taxableIncome;
        monthlyTax = annualTax / 12;
    } else {
        // Old regime with deductions
        const monthlyRent = parseNumber(document.getElementById('monthlyRent').value);
        const annualRent = monthlyRent * 12;

        // HRA exemption
        const hraExemption = calculateHRAExemption(
            annualBasic, 0, annualHRA, annualRent, isMetro
        );

        // Other deductions
        const section80C = parseNumber(document.getElementById('section80C').value);
        const section80D = parseNumber(document.getElementById('section80D').value);
        const section80CCD1B = parseNumber(document.getElementById('section80CCD1B').value);
        const homeLoanInterest = parseNumber(document.getElementById('homeLoanInterest').value);
        const otherDeductions = parseNumber(document.getElementById('otherDeductions').value);

        // Total 80C (including EPF)
        const total80C = Math.min(section80C + annualEmployeePF, 150000);

        const totalDeductions = {
            hraExemption,
            section80C: total80C,
            section80D: Math.min(section80D, 100000),
            section80CCD1B: Math.min(section80CCD1B, 50000),
            homeLoanInterest: Math.min(homeLoanInterest, 200000),
            otherDeductions,
            total: 0
        };

        totalDeductions.total =
            totalDeductions.hraExemption +
            totalDeductions.section80C +
            totalDeductions.section80D +
            totalDeductions.section80CCD1B +
            totalDeductions.homeLoanInterest +
            totalDeductions.otherDeductions;

        const oldTaxResult = calculateOldRegimeTax(annualGross, totalDeductions);
        annualTax = oldTaxResult.tax;
        taxableIncome = oldTaxResult.taxableIncome;
        monthlyTax = annualTax / 12;
    }

    // Calculate both regimes for comparison
    const newRegimeResult = calculateNewRegimeTax(annualGross);
    let oldRegimeResult;

    if (taxRegime === 'old') {
        oldRegimeResult = { tax: annualTax, taxableIncome };
    } else {
        const monthlyRent = parseNumber(document.getElementById('monthlyRent').value);
        const annualRent = monthlyRent * 12;
        const hraExemption = calculateHRAExemption(annualBasic, 0, annualHRA, annualRent, isMetro);

        const totalDeductions = {
            hraExemption,
            section80C: Math.min(annualEmployeePF, 150000),
            section80D: 0,
            section80CCD1B: 0,
            homeLoanInterest: 0,
            otherDeductions: 0,
            total: 0
        };

        totalDeductions.total = totalDeductions.hraExemption + totalDeductions.section80C;
        oldRegimeResult = calculateOldRegimeTax(annualGross, totalDeductions);
    }

    // Total monthly deductions
    const totalMonthlyDeductions = monthlyEmployeePF + monthlyPT + monthlyTax + monthlyESI;

    // In-hand salary
    const monthlyInHand = grossMonthly - totalMonthlyDeductions;
    const annualTakeHome = (monthlyInHand * 12) + (includeVariableMonthly ? 0 : variablePay);

    // Display results
    displayResults({
        monthlyInHand,
        annualTakeHome,
        monthlyBasic,
        monthlyHRA,
        monthlySpecial,
        monthlyVariable,
        grossMonthly,
        monthlyEmployeePF,
        monthlyPT,
        monthlyTax,
        monthlyESI,
        totalMonthlyDeductions,
        annualCTC,
        annualBasic,
        annualHRA,
        annualSpecial,
        variablePay,
        employerPF,
        gratuity,
        annualEmployeePF,
        annualPT,
        annualTax,
        newRegimeResult,
        oldRegimeResult,
        annualGross
    });

    // Update charts
    updateCharts({
        annualBasic,
        annualHRA,
        annualSpecial,
        variablePay,
        employerPF,
        gratuity,
        annualEmployeePF,
        annualPT,
        annualTax
    });
}

// ===== Display Results =====
function displayResults(data) {
    // Main results
    document.getElementById('monthlyInHand').textContent = Math.round(data.monthlyInHand).toLocaleString('en-IN');
    document.getElementById('annualInHand').textContent = formatCurrency(data.annualTakeHome);

    // Effective tax rate
    const effectiveTaxRate = ((data.annualTax / data.annualGross) * 100).toFixed(1);
    document.getElementById('effectiveTaxRate').textContent = effectiveTaxRate + '%';

    // Monthly breakdown
    document.getElementById('monthlyBasic').textContent = formatCurrency(data.monthlyBasic);
    document.getElementById('monthlyHRA').textContent = formatCurrency(data.monthlyHRA);
    document.getElementById('monthlySpecial').textContent = formatCurrency(data.monthlySpecial);
    document.getElementById('grossMonthly').textContent = formatCurrency(data.grossMonthly);
    document.getElementById('monthlyPF').textContent = '-' + formatCurrency(data.monthlyEmployeePF);
    document.getElementById('monthlyPT').textContent = '-' + formatCurrency(data.monthlyPT);
    document.getElementById('monthlyTax').textContent = '-' + formatCurrency(data.monthlyTax);

    // Annual breakdown
    document.getElementById('displayCTC').textContent = formatCurrency(data.annualCTC);
    document.getElementById('displayBasic').textContent = formatCurrency(data.annualBasic);
    document.getElementById('displayHRA').textContent = formatCurrency(data.annualHRA);

    const otherAllowances = data.annualSpecial + (data.variablePay || 0);
    document.getElementById('displayOtherAllowances').textContent = formatCurrency(otherAllowances);

    document.getElementById('displayEPF').textContent = '-' + formatCurrency(data.annualEmployeePF);
    document.getElementById('displayPT').textContent = '-' + formatCurrency(data.annualPT);
    document.getElementById('displayTax').textContent = '-' + formatCurrency(data.annualTax);

    // Regime comparison
    const newTakeHome = data.annualGross - data.annualEmployeePF - data.annualPT - data.newRegimeResult.tax;
    const oldTakeHome = data.annualGross - data.annualEmployeePF - data.annualPT - data.oldRegimeResult.tax;

    document.getElementById('newRegimeTax').textContent = formatCurrency(data.newRegimeResult.tax);
    document.getElementById('oldRegimeTax').textContent = formatCurrency(data.oldRegimeResult.tax);

    // Show savings
    const savings = Math.abs(newTakeHome - oldTakeHome);
    if (newTakeHome > oldTakeHome) {
        document.getElementById('newRegimeSaving').textContent = 'Saves ' + formatCurrency(savings);
        document.getElementById('newRegimeSaving').style.color = 'var(--success-color)';
        document.getElementById('oldRegimeSaving').textContent = '';
    } else if (oldTakeHome > newTakeHome) {
        document.getElementById('oldRegimeSaving').textContent = 'Saves ' + formatCurrency(savings);
        document.getElementById('oldRegimeSaving').style.color = 'var(--success-color)';
        document.getElementById('newRegimeSaving').textContent = '';
    } else {
        document.getElementById('newRegimeSaving').textContent = 'Same';
        document.getElementById('oldRegimeSaving').textContent = 'Same';
    }

    // Recommendation
    const recommendationDiv = document.getElementById('taxRecommendation');

    if (newTakeHome > oldTakeHome) {
        recommendationDiv.innerHTML = `
            ✓ <strong>New Tax Regime</strong> recommended - Save ${formatCurrency(savings)} annually
        `;
        recommendationDiv.style.display = 'block';
    } else if (oldTakeHome > newTakeHome) {
        recommendationDiv.innerHTML = `
            ✓ <strong>Old Tax Regime</strong> recommended - Save ${formatCurrency(savings)} annually
        `;
        recommendationDiv.style.display = 'block';
    } else {
        recommendationDiv.innerHTML = `
            Both regimes result in the same take-home salary
        `;
        recommendationDiv.style.display = 'block';
    }

    // Show tax comparison section
    document.getElementById('taxComparisonSection').style.display = 'block';

    // Show results section
    document.getElementById('results').style.display = 'block';

    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// ===== Update Charts =====
function updateCharts(data) {
    const ctcCtx = document.getElementById('salaryChart').getContext('2d');

    if (ctcBreakdownChart) {
        ctcBreakdownChart.destroy();
    }

    ctcBreakdownChart = new Chart(ctcCtx, {
        type: 'doughnut',
        data: {
            labels: ['Basic Salary', 'HRA', 'Special Allowance', 'Variable Pay', 'Employer PF', 'Gratuity'],
            datasets: [{
                data: [
                    data.annualBasic,
                    data.annualHRA,
                    data.annualSpecial,
                    data.variablePay,
                    data.employerPF,
                    data.gratuity
                ],
                backgroundColor: [
                    '#2563eb',
                    '#10b981',
                    '#f59e0b',
                    '#8b5cf6',
                    '#ec4899',
                    '#06b6d4'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'CTC Breakdown',
                    font: { size: 16 }
                },
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + formatCurrency(context.parsed);
                        }
                    }
                }
            }
        }
    });
}

// ===== Hike Calculator =====
function calculateHike() {
    const currentCTC = parseNumber(document.getElementById('currentCTC').value);
    const hikeType = document.querySelector('input[name="hikeType"]:checked').value;
    const hikePercentage = parseNumber(document.getElementById('hikePercentage').value);
    const hikeAbsolute = parseNumber(document.getElementById('hikeAbsolute').value);

    if (currentCTC === 0) {
        alert('Please enter your current CTC');
        return;
    }

    let newCTCValue;
    if (hikeType === 'absolute' && hikeAbsolute > 0) {
        newCTCValue = currentCTC + hikeAbsolute;
    } else if (hikePercentage > 0) {
        newCTCValue = currentCTC * (1 + hikePercentage / 100);
    } else {
        alert('Please enter hike percentage or amount');
        return;
    }

    // Use proper calculation instead of simplified 70%
    const currentMonthlyInHand = estimateMonthlyInHand(currentCTC);
    const newMonthlyInHand = estimateMonthlyInHand(newCTCValue);
    const increment = newMonthlyInHand - currentMonthlyInHand;

    document.getElementById('newCTC').textContent = formatCurrency(newCTCValue);
    document.getElementById('newMonthlyInHand').textContent = formatCurrency(newMonthlyInHand);
    document.getElementById('increaseAmount').textContent = '+' + formatCurrency(increment) + '/month';

    document.getElementById('hikeResults').style.display = 'block';
}

// ===== Estimate Monthly In-Hand (for hike/compare) =====
function estimateMonthlyInHand(ctc) {
    const basic = ctc * 0.4;
    const monthlyBasic = basic / 12;
    const employerPF = monthlyBasic * 0.12 * 12;
    const gratuity = basic * 0.0481;
    const gross = ctc - employerPF - gratuity;
    const employeePF = monthlyBasic * 0.12 * 12;
    const pt = 2500; // Assume Maharashtra
    const taxResult = calculateNewRegimeTax(gross);
    return (gross - employeePF - pt - taxResult.tax) / 12;
}

// ===== Compare Offers =====
function compareOffers() {
    const offers = [];

    for (let i = 1; i <= 3; i++) {
        const ctc = parseNumber(document.getElementById(`offer${i}CTC`).value);
        if (ctc > 0) {
            const company = document.getElementById(`company${i}`).value || `Offer ${i}`;
            const basicPercent = parseNumber(document.getElementById(`offer${i}Basic`).value) || 40;
            const variable = parseNumber(document.getElementById(`offer${i}Variable`).value);
            const city = document.getElementById(`offer${i}City`).value;

            const basic = (ctc * basicPercent) / 100;
            const isMetro = city === 'metro';
            const hra = basic * (isMetro ? 0.50 : 0.40);
            const employerPF = (basic / 12) * 0.12 * 12;
            const gratuity = basic * 0.0481;
            const gross = ctc - employerPF - gratuity;

            // Proper in-hand calculation
            const employeePF = employerPF;
            const pt = 2500;
            const taxResult = calculateNewRegimeTax(gross);
            const inHand = (gross - employeePF - pt - taxResult.tax) / 12;

            offers.push({
                company,
                ctc,
                basic,
                variable,
                inHand: Math.round(inHand),
                tax: taxResult.tax
            });

            document.getElementById(`offer${i}InHand`).textContent = formatCurrency(inHand);
        }
    }

    // Display comparison table
    if (offers.length >= 2) {
        const comparisonDiv = document.getElementById('comparisonResults');
        const tableDiv = document.getElementById('comparisonTable');

        let tableHTML = `
            <table style="width:100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-tertiary);">
                        <th style="padding:12px; text-align:left; border:1px solid var(--border-color);">Metric</th>
        `;

        offers.forEach(offer => {
            tableHTML += `<th style="padding:12px; text-align:right; border:1px solid var(--border-color);">${offer.company}</th>`;
        });

        tableHTML += `</tr></thead><tbody>`;

        // CTC Row
        tableHTML += `<tr><td style="padding:12px; border:1px solid var(--border-color);">Annual CTC</td>`;
        offers.forEach(offer => {
            tableHTML += `<td style="padding:12px; text-align:right; border:1px solid var(--border-color);">${formatCurrency(offer.ctc)}</td>`;
        });
        tableHTML += `</tr>`;

        // Annual Tax Row
        tableHTML += `<tr><td style="padding:12px; border:1px solid var(--border-color);">Annual Tax</td>`;
        offers.forEach(offer => {
            tableHTML += `<td style="padding:12px; text-align:right; border:1px solid var(--border-color);">${formatCurrency(offer.tax)}</td>`;
        });
        tableHTML += `</tr>`;

        // In-Hand Row
        tableHTML += `<tr style="background: var(--bg-secondary);"><td style="padding:12px; border:1px solid var(--border-color);"><strong>Monthly In-Hand</strong></td>`;
        const maxInHand = Math.max(...offers.map(o => o.inHand));
        offers.forEach(offer => {
            const isBest = offer.inHand === maxInHand;
            const style = isBest ? 'color: var(--success-color);' : '';
            tableHTML += `<td style="padding:12px; text-align:right; border:1px solid var(--border-color); ${style}"><strong>${formatCurrency(offer.inHand)}${isBest ? ' ✓' : ''}</strong></td>`;
        });
        tableHTML += `</tr>`;

        tableHTML += `</tbody></table>`;

        tableDiv.innerHTML = tableHTML;
        comparisonDiv.style.display = 'block';
    } else {
        alert('Please enter at least 2 offers to compare');
    }
}

// ===== Reverse Calculator =====
function calculateReverse() {
    const desiredInHand = parseNumber(document.getElementById('desiredInHand').value);
    const basicPercent = parseNumber(document.getElementById('reverseBasic').value) || 40;
    const city = document.getElementById('reverseCity').value;
    const state = document.getElementById('reverseState').value;

    if (desiredInHand === 0) {
        alert('Please enter your desired monthly in-hand salary');
        return;
    }

    // Reverse calculation (iterative approach)
    let estimatedCTC = desiredInHand * 12 / 0.7;

    // Refine calculation with 10 iterations for accuracy
    for (let i = 0; i < 10; i++) {
        const basic = (estimatedCTC * basicPercent) / 100;
        const isMetro = city === 'metro';
        const employerPF = (basic / 12) * 0.12 * 12;
        const gratuity = basic * 0.0481;
        const gross = estimatedCTC - employerPF - gratuity;

        const newTaxResult = calculateNewRegimeTax(gross);
        const tax = newTaxResult.tax;

        const employeePF = employerPF;
        const pt = professionalTax[state].total;

        const calculatedInHand = (gross - employeePF - pt - tax) / 12;

        const difference = desiredInHand - calculatedInHand;
        estimatedCTC += difference * 12 * 1.2;
    }

    const basic = (estimatedCTC * basicPercent) / 100;
    const isMetro = city === 'metro';
    const hra = basic * (isMetro ? 0.50 : 0.40);
    const employerPF = (basic / 12) * 0.12 * 12;
    const gratuity = basic * 0.0481;
    const gross = estimatedCTC - employerPF - gratuity;
    const other = estimatedCTC - basic - hra - employerPF - gratuity;

    document.getElementById('requiredCTC').textContent = Math.round(estimatedCTC).toLocaleString('en-IN');
    document.getElementById('requiredGross').textContent = formatCurrency(gross / 12);
    document.getElementById('reverseBasicAmount').textContent = formatCurrency(basic);
    document.getElementById('reverseHRAAmount').textContent = formatCurrency(hra);
    document.getElementById('reverseOtherAmount').textContent = formatCurrency(other);

    document.getElementById('reverseResults').style.display = 'block';
}

// ===== PDF Export =====
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Salary Breakdown Report', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text('Generated on: ' + new Date().toLocaleDateString('en-IN'), 105, 30, { align: 'center' });

    // Monthly In-Hand
    doc.setFontSize(14);
    doc.text('Monthly In-Hand Salary:', 20, 45);
    doc.setFontSize(16);
    const monthlyInHand = document.getElementById('monthlyInHand').textContent;
    doc.text('Rs. ' + monthlyInHand, 20, 53);

    doc.setFontSize(14);
    doc.text('Annual Take-Home:', 120, 45);
    doc.setFontSize(16);
    doc.text(document.getElementById('annualInHand').textContent.replace('₹', 'Rs. '), 120, 53);

    // Monthly Breakdown
    doc.setFontSize(12);
    let y = 70;
    doc.text('Monthly Breakdown:', 20, y);
    y += 10;

    const monthlyItems = [
        ['Basic Salary', 'monthlyBasic'],
        ['HRA', 'monthlyHRA'],
        ['Special Allowance', 'monthlySpecial'],
        ['Gross Monthly', 'grossMonthly'],
    ];

    monthlyItems.forEach(([label, id]) => {
        const value = document.getElementById(id).textContent.replace('₹', 'Rs. ');
        doc.text(label + ': ' + value, 20, y);
        y += 8;
    });

    y += 5;
    doc.text('Deductions:', 20, y);
    y += 10;

    const deductionItems = [
        ['Employee PF', 'monthlyPF'],
        ['Professional Tax', 'monthlyPT'],
        ['Income Tax (TDS)', 'monthlyTax'],
    ];

    deductionItems.forEach(([label, id]) => {
        const value = document.getElementById(id).textContent.replace('₹', 'Rs. ');
        doc.text(label + ': ' + value, 20, y);
        y += 8;
    });

    y += 10;
    doc.text('Effective Tax Rate: ' + document.getElementById('effectiveTaxRate').textContent, 20, y);

    // Save PDF
    doc.save('salary-breakdown.pdf');
}

// ===== Share Results =====
function shareResults() {
    const monthlyInHand = document.getElementById('monthlyInHand').textContent;
    const annualTakeHome = document.getElementById('annualInHand').textContent;

    const text = `My Salary Breakdown:\n\nMonthly In-Hand: ₹${monthlyInHand}\nAnnual Take-Home: ${annualTakeHome}\n\nCalculated using India Salary Calculator`;

    if (navigator.share) {
        navigator.share({
            title: 'Salary Breakdown',
            text: text
        });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('Results copied to clipboard!');
        });
    }
}

// ===== Event Listeners =====
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', function() {
        const theme = document.documentElement.getAttribute('data-theme');
        const newTheme = theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Tab navigation
    function switchTab(tabName) {
        document.querySelectorAll('.tab-btn, .nav-item').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        document.querySelectorAll(`[data-tab="${tabName}"]`).forEach(btn => btn.classList.add('active'));
        document.getElementById(tabName + '-tab').classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.querySelectorAll('.tab-btn, .nav-item').forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Basic type toggle
    document.querySelectorAll('input[name="basicType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'percentage') {
                document.getElementById('basicPercentage').style.display = 'block';
                document.getElementById('basicAbsolute').style.display = 'none';
            } else {
                document.getElementById('basicPercentage').style.display = 'none';
                document.getElementById('basicAbsolute').style.display = 'block';
            }
        });
    });

    // Tax regime toggle
    document.querySelectorAll('input[name="taxRegime"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const deductionInputs = document.getElementById('deductionInputs');
            const deductionNote = document.getElementById('deductionNote');

            if (this.value === 'old') {
                deductionInputs.style.opacity = '1';
                deductionInputs.style.pointerEvents = 'auto';
                deductionNote.textContent = 'Enter your deductions to reduce taxable income';
                deductionNote.style.color = 'var(--success-color)';
            } else {
                deductionInputs.style.opacity = '0.4';
                deductionInputs.style.pointerEvents = 'none';
                deductionNote.textContent = 'Deductions not available in New Tax Regime';
                deductionNote.style.color = 'var(--text-muted)';
            }
        });
    });

    // Hike type toggle
    document.querySelectorAll('input[name="hikeType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'percentage') {
                document.getElementById('hikePercentageGroup').style.display = 'block';
                document.getElementById('hikeAbsoluteGroup').style.display = 'none';
            } else {
                document.getElementById('hikePercentageGroup').style.display = 'none';
                document.getElementById('hikeAbsoluteGroup').style.display = 'block';
            }
        });
    });

    // Initialize deduction inputs state
    const initialRegime = document.querySelector('input[name="taxRegime"]:checked').value;
    if (initialRegime === 'new') {
        const deductionInputs = document.getElementById('deductionInputs');
        const deductionNote = document.getElementById('deductionNote');
        deductionInputs.style.opacity = '0.4';
        deductionInputs.style.pointerEvents = 'none';
        deductionNote.textContent = 'Deductions not available in New Tax Regime';
        deductionNote.style.color = 'var(--text-muted)';
    }

    // Calculate button
    document.getElementById('calculateBtn').addEventListener('click', calculateSalary);

    // Hike calculator button
    const hikeBtn = document.getElementById('calculateHikeBtn');
    if (hikeBtn) hikeBtn.addEventListener('click', calculateHike);

    // Compare offers button
    const compareBtn = document.getElementById('compareOffersBtn');
    if (compareBtn) compareBtn.addEventListener('click', compareOffers);

    // Reverse calculator button
    const reverseBtn = document.getElementById('calculateReverseBtn');
    if (reverseBtn) reverseBtn.addEventListener('click', calculateReverse);

    // Export PDF button
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportPDF);

    // Share button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) shareBtn.addEventListener('click', shareResults);
});
