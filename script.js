document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const form = document.getElementById('payslipForm');
    const printButton = document.getElementById('printButton');
    const addEarningButton = document.getElementById('addEarning');
    const addDeductionButton = document.getElementById('addDeduction');
    const dynamicEarningsContainer = document.getElementById('dynamicEarnings');
    const dynamicDeductionsContainer = document.getElementById('dynamicDeductions');
    const previewEarningsBody = document.getElementById('previewEarningsBody');
    const previewDeductionsBody = document.getElementById('previewDeductionsBody');

    // --- State Management ---
    let earnings = [
        { id: Date.now() + 1, label: 'Tunjangan Transportasi', value: 500000 },
        { id: Date.now() + 2, label: 'Tunjangan Makan', value: 300000 },
        { id: Date.now() + 3, label: 'Lembur', value: 200000 }
    ];
    let deductions = [
        { id: Date.now() + 4, label: 'Pajak (PPh 21)', value: 150000 },
        { id: Date.now() + 5, label: 'BPJS Ketenagakerjaan', value: 100000 }
    ];

    // --- Helper Functions ---
    const formatRupiah = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
    };

    // --- Render Functions ---
    const renderDynamicInputs = () => {
        // Render Earnings
        dynamicEarningsContainer.innerHTML = '';
        earnings.forEach(item => {
            const row = document.createElement('div');
            row.className = 'dynamic-input-row';
            row.dataset.id = item.id;
            row.innerHTML = `
                <input type="text" class="dynamic-label" value="${item.label}" placeholder="Nama Pendapatan">
                <input type="number" class="dynamic-value" value="${item.value}" placeholder="Jumlah">
                <button type="button" class="delete-button">X</button>
            `;
            dynamicEarningsContainer.appendChild(row);
        });

        // Render Deductions
        dynamicDeductionsContainer.innerHTML = '';
        deductions.forEach(item => {
            const row = document.createElement('div');
            row.className = 'dynamic-input-row';
            row.dataset.id = item.id;
            row.innerHTML = `
                <input type="text" class="dynamic-label" value="${item.label}" placeholder="Nama Potongan">
                <input type="number" class="dynamic-value" value="${item.value}" placeholder="Jumlah">
                <button type="button" class="delete-button">X</button>
            `;
            dynamicDeductionsContainer.appendChild(row);
        });
    };

    const renderPayslipPreview = () => {
        // Render Earnings Preview
        previewEarningsBody.innerHTML = '';
        // Add basic salary first
        const basicSalary = parseFloat(document.getElementById('basicSalary').value) || 0;
        previewEarningsBody.innerHTML += `
            <tr>
                <td>Gaji Pokok</td>
                <td class="amount">${formatRupiah(basicSalary)}</td>
            </tr>
        `;
        earnings.forEach(item => {
            previewEarningsBody.innerHTML += `
                <tr>
                    <td>${item.label}</td>
                    <td class="amount">${formatRupiah(item.value)}</td>
                </tr>
            `;
        });

        // Render Deductions Preview
        previewDeductionsBody.innerHTML = '';
        deductions.forEach(item => {
            previewDeductionsBody.innerHTML += `
                <tr>
                    <td>${item.label}</td>
                    <td class="amount">${formatRupiah(item.value)}</td>
                </tr>
            `;
        });
    };

    // --- Calculation and Main Update Function ---
    const updateApp = () => {
        // Update static fields
        document.getElementById('previewCompanyName').textContent = document.getElementById('companyName').value;
        document.getElementById('previewCompanyAddress').textContent = document.getElementById('companyAddress').value;
        document.getElementById('previewEmployeeName').textContent = document.getElementById('employeeName').value;
        document.getElementById('previewEmployeeId').textContent = document.getElementById('employeeId').value;
        document.getElementById('previewPosition').textContent = document.getElementById('position').value;
        document.getElementById('previewPayPeriodStart').textContent = formatDate(document.getElementById('payPeriodStart').value);
        document.getElementById('previewPayPeriodEnd').textContent = formatDate(document.getElementById('payPeriodEnd').value);
        document.getElementById('previewPayDate').textContent = formatDate(document.getElementById('payDate').value);

        // Re-render the preview tables
        renderPayslipPreview();

        // Calculate totals
        const basicSalary = parseFloat(document.getElementById('basicSalary').value) || 0;
        const totalEarnings = basicSalary + earnings.reduce((sum, item) => sum + item.value, 0);
        const totalDeductions = deductions.reduce((sum, item) => sum + item.value, 0);
        const netSalary = totalEarnings - totalDeductions;

        // Update totals in the DOM
        document.getElementById('previewTotalEarnings').textContent = formatRupiah(totalEarnings);
        document.getElementById('previewTotalDeductions').textContent = formatRupiah(totalDeductions);
        document.getElementById('previewNetSalary').textContent = formatRupiah(netSalary);
    };

    // --- Event Handlers ---
    addEarningButton.addEventListener('click', () => {
        earnings.push({ id: Date.now(), label: 'Pendapatan Baru', value: 0 });
        renderDynamicInputs();
        updateApp();
    });

    addDeductionButton.addEventListener('click', () => {
        deductions.push({ id: Date.now(), label: 'Potongan Baru', value: 0 });
        renderDynamicInputs();
        updateApp();
    });

    const handleDynamicInput = (e, collection) => {
        if (e.target.matches('.dynamic-label, .dynamic-value')) {
            const row = e.target.closest('.dynamic-input-row');
            const id = parseInt(row.dataset.id);
            const item = collection.find(i => i.id === id);
            if (item) {
                if (e.target.classList.contains('dynamic-label')) {
                    item.label = e.target.value;
                } else {
                    item.value = parseFloat(e.target.value) || 0;
                }
                updateApp();
            }
        }
    };

    const handleDelete = (e, collection) => {
        if (e.target.matches('.delete-button')) {
            const row = e.target.closest('.dynamic-input-row');
            const id = parseInt(row.dataset.id);
            if (collection === 'earnings') {
                earnings = earnings.filter(i => i.id !== id);
            } else {
                deductions = deductions.filter(i => i.id !== id);
            }
            renderDynamicInputs();
            updateApp();
        }
    };

    dynamicEarningsContainer.addEventListener('input', (e) => handleDynamicInput(e, earnings));
    dynamicDeductionsContainer.addEventListener('input', (e) => handleDynamicInput(e, deductions));

    dynamicEarningsContainer.addEventListener('click', (e) => handleDelete(e, 'earnings'));
    dynamicDeductionsContainer.addEventListener('click', (e) => handleDelete(e, 'deductions'));

    form.addEventListener('input', (e) => {
        // Update only if the change is not from a dynamic input (to avoid double-firing)
        if (!e.target.closest('.dynamic-input-row')) {
            updateApp();
        }
    });

    printButton.addEventListener('click', () => window.print());

    const emailButton = document.getElementById('emailButton');
    emailButton.addEventListener('click', () => {
        const recipient = ''; // Let user fill this in
        const employeeName = document.getElementById('employeeName').value;
        const payPeriodStart = formatDate(document.getElementById('payPeriodStart').value);
        const payPeriodEnd = formatDate(document.getElementById('payPeriodEnd').value);

        const subject = `Slip Gaji ${employeeName} - Periode ${payPeriodStart} s/d ${payPeriodEnd}`;

        // Re-calculate totals to ensure they are up-to-date
        const basicSalary = parseFloat(document.getElementById('basicSalary').value) || 0;
        const totalEarnings = basicSalary + earnings.reduce((sum, item) => sum + item.value, 0);
        const totalDeductions = deductions.reduce((sum, item) => sum + item.value, 0);
        const netSalary = totalEarnings - totalDeductions;

        // Constructing the plain text email body
        let body = `SLIP GAJI KARYAWAN\n`;
        body += `----------------------------------\n`;
        body += `Perusahaan: ${document.getElementById('companyName').value}\n\n`;
        body += `Nama Karyawan: ${employeeName}\n`;
        body += `ID Karyawan: ${document.getElementById('employeeId').value}\n`;
        body += `Jabatan: ${document.getElementById('position').value}\n`;
        body += `Periode: ${payPeriodStart} s/d ${payPeriodEnd}\n`;
        body += `----------------------------------\n\n`;

        body += `PENDAPATAN\n`;
        body += `Gaji Pokok: ${formatRupiah(basicSalary)}\n`;
        earnings.forEach(item => {
            body += `${item.label}: ${formatRupiah(item.value)}\n`;
        });
        body += `TOTAL PENDAPATAN: ${formatRupiah(totalEarnings)}\n\n`;

        body += `POTONGAN\n`;
        deductions.forEach(item => {
            body += `${item.label}: ${formatRupiah(item.value)}\n`;
        });
        body += `TOTAL POTONGAN: ${formatRupiah(totalDeductions)}\n\n`;

        body += `----------------------------------\n`;
        body += `GAJI DITERIMA: ${formatRupiah(netSalary)}\n`;
        body += `----------------------------------\n`;

        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    });

    // --- Initial Load ---
    renderDynamicInputs();
    updateApp();
});