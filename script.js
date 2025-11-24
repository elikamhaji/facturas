/* =========================================================
   AUTO-FILL TODAY'S DATE ON LOAD
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    document.getElementById("fecha").value = local.toISOString().slice(0, 16);
});

/* =========================================================
   RECALCULATE TOTALS
========================================================= */
function recalcTotals() {
    let rows = document.querySelectorAll(".item-row");
    let total = 0;

    rows.forEach(row => {
        let qty = parseFloat(row.querySelector(".item-qty").value) || 0;
        let price = parseFloat(row.querySelector(".item-price").value) || 0;
        let lineTotal = qty * price;

        row.querySelector(".item-total").textContent =
            lineTotal ? lineTotal.toFixed(2) : "";

        total += lineTotal;
    });

    document.getElementById("web-total-general").textContent = total.toFixed(2);
}

/* =========================================================
   UPDATE PDF CONTENT BEFORE RENDERING
========================================================= */
function fillPdf() {
    // Basic info
    document.getElementById("pdf-cliente").textContent =
        document.getElementById("cliente").value;

    document.getElementById("pdf-cedula").textContent =
        document.getElementById("cedula").value;

    document.getElementById("pdf-telefono").textContent =
        document.getElementById("telefono").value;

    document.getElementById("pdf-orden-numero").textContent =
        document.getElementById("orden-numero").value;

    document.getElementById("pdf-fecha").textContent =
        document.getElementById("fecha").value;

    document.getElementById("pdf-cedula-sign").textContent =
        document.getElementById("cedula").value;

    document.getElementById("pdf-direccion").textContent =
        document.getElementById("direccion").value;

    /* ------------------------
       MATERIAL TABLE
    ------------------------- */
    let pdfItems = document.getElementById("pdf-items-body");
    pdfItems.innerHTML = "";

    let total = 0;

    document.querySelectorAll(".item-row").forEach(row => {
        let desc = row.querySelector(".item-desc").value;
        let qty = parseFloat(row.querySelector(".item-qty").value) || 0;
        let price = parseFloat(row.querySelector(".item-price").value) || 0;

        if (!desc && !qty && !price) return;

        let lineTotal = qty * price;
        total += lineTotal;

        pdfItems.innerHTML += `
            <tr>
                <td>${desc}</td>
                <td>${qty.toFixed(2)}</td>
                <td>${price.toFixed(2)}</td>
                <td>${lineTotal.toFixed(2)}</td>
            </tr>
        `;
    });

    document.getElementById("pdf-total-general").textContent =
        total.toFixed(2);

    /* ------------------------
       PAYMENT TABLE
    ------------------------- */
    let pdfPay = document.getElementById("pdf-payments-body");
    pdfPay.innerHTML = "";

    document.querySelectorAll(".payment-row").forEach(row => {
        let d = row.querySelector(".pay-desc").value;
        let a = parseFloat(row.querySelector(".pay-amount").value) || 0;
        let n = row.querySelector(".pay-note").value;

        if (!d && !a && !n) return;

        pdfPay.innerHTML += `
            <tr>
                <td>${d}</td>
                <td>${a.toFixed(2)}</td>
                <td>${n}</td>
            </tr>
        `;
    });
}

/* =========================================================
   GENERATE PDF
========================================================= */
async function generatePDF() {
    fillPdf();

    const pdfContent = document.getElementById("pdf-content");

    // Increase resolution
    const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true
    });

    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    pdf.save("orden_pago.pdf");
}

/* =========================================================
   EVENT LISTENERS
========================================================= */

// Update totals in real time
document.addEventListener("input", e => {
    if (
        e.target.classList.contains("item-qty") ||
        e.target.classList.contains("item-price")
    ) {
        recalcTotals();
    }
});

// Add material row
document.getElementById("add-item-row").onclick = () => {
    let body = document.getElementById("items-body");

    let row = document.createElement("tr");
    row.className = "item-row";

    row.innerHTML = `
        <td><input class="item-desc" /></td>
        <td><input class="item-qty" type="number" step="0.01" /></td>
        <td><input class="item-price" type="number" step="0.01" /></td>
        <td class="item-total"></td>
    `;

    body.appendChild(row);
};

// Add payment row
document.getElementById("add-payment-row").onclick = () => {
    let body = document.getElementById("payments-body");

    let row = document.createElement("tr");
    row.className = "payment-row";

    row.innerHTML = `
        <td><input class="pay-desc" /></td>
        <td><input class="pay-amount" type="number" step="0.01" /></td>
        <td><input class="pay-note" /></td>
    `;

    body.appendChild(row);
};

// Generate PDF button
document.getElementById("generate").addEventListener("click", e => {
    e.preventDefault();
    generatePDF();
});
