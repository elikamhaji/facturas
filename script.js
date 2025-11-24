function formatNumber(value) {
  if (!value && value !== 0) return "";
  const num = Number(value);
  if (Number.isNaN(num)) return "";
  return num.toLocaleString("es-PA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function collectItems() {
  const rows = Array.from(document.querySelectorAll(".item-row"));
  const items = [];
  rows.forEach((row) => {
    const desc = row.querySelector(".item-desc").value.trim();
    const qtyVal = row.querySelector(".item-qty").value;
    const priceVal = row.querySelector(".item-price").value;
    if (!desc && !qtyVal && !priceVal) {
      return;
    }
    const qty = Number(qtyVal || 0);
    const price = Number(priceVal || 0);
    const total = qty * price;
    items.push({ desc, qty, price, total });
  });
  return items;
}

function fillPdfFromForm() {
  const getVal = (id) => document.getElementById(id)?.value || "";

  document.getElementById("pdf-cliente").textContent = getVal("cliente");
  document.getElementById("pdf-cedula").textContent = getVal("cedula");
  document.getElementById("pdf-telefono").textContent = getVal("telefono");

  const fechaInput = getVal("fecha");
  if (fechaInput) {
    const dt = new Date(fechaInput);
    const formatted =
      !Number.isNaN(dt.getTime()) ?
      dt.toLocaleString("es-PA") :
      fechaInput;
    document.getElementById("pdf-fecha").textContent = formatted;
  } else {
    document.getElementById("pdf-fecha").textContent = "";
  }

  document.getElementById("pdf-orden-numero").textContent = getVal("orden-numero");

  const items = collectItems();
  const tbody = document.getElementById("pdf-items-body");
  tbody.innerHTML = "";

  let totalGeneral = 0;

  items.forEach((item) => {
    const tr = document.createElement("tr");

    const tdDesc = document.createElement("td");
    tdDesc.textContent = item.desc;
    tr.appendChild(tdDesc);

    const tdQty = document.createElement("td");
    tdQty.style.textAlign = "right";
    tdQty.textContent = item.qty ? formatNumber(item.qty) : "";
    tr.appendChild(tdQty);

    const tdPrice = document.createElement("td");
    tdPrice.style.textAlign = "right";
    tdPrice.textContent = item.price ? formatNumber(item.price) : "";
    tr.appendChild(tdPrice);

    const tdTotal = document.createElement("td");
    tdTotal.style.textAlign = "right";
    tdTotal.textContent = item.total ? formatNumber(item.total) : "";
    tr.appendChild(tdTotal);

    totalGeneral += item.total;
    tbody.appendChild(tr);
  });

  document.getElementById("pdf-total-general").textContent =
    totalGeneral ? formatNumber(totalGeneral) : "";

  document.getElementById("pdf-pago-cheque-cantidad").textContent = formatNumber(
    document.getElementById("pago-cheque-cantidad").value || ""
  );
  document.getElementById("pdf-pago-cheque-observaciones").textContent =
    document.getElementById("pago-cheque-observaciones").value || "";

  document.getElementById("pdf-pago-ach-cantidad").textContent = formatNumber(
    document.getElementById("pago-ach-cantidad").value || ""
  );
  document.getElementById("pdf-pago-ach-observaciones").textContent =
    document.getElementById("pago-ach-observaciones").value || "";

  document.getElementById("pdf-cedula-sign").textContent = getVal("cedula");
  document.getElementById("pdf-direccion").textContent = getVal("direccion");
}

async function generatePdf() {
  const pdfContent = document.getElementById("pdf-content");
  const canvas = await html2canvas(pdfContent, { scale: 2 });

  const imgData = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let position = 0;
  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  } else {
    let remainingHeight = imgHeight;
    let y = 0;
    const pageCanvas = document.createElement("canvas");
    const pageCtx = pageCanvas.getContext("2d");
    const ratio = imgWidth / canvas.width;
    const sliceHeightPx = (pageHeight / ratio);

    while (remainingHeight > 0) {
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;

      pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageCtx.drawImage(
        canvas,
        0,
        y,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx
      );

      const pageImgData = pageCanvas.toDataURL("image/png");
      if (position > 0) {
        pdf.addPage();
      }
      pdf.addImage(pageImgData, "PNG", 0, 0, imgWidth, pageHeight);

      y += sliceHeightPx;
      remainingHeight -= pageHeight;
      position++;
    }
  }

  const orderNum = document.getElementById("orden-numero").value || "orden_pago";
  pdf.save(`orden_pago_${orderNum}.pdf`);
}

function addItemRow() {
  const tbody = document.getElementById("items-body");
  const tr = document.createElement("tr");
  tr.className = "item-row";

  const tdDesc = document.createElement("td");
  const inpDesc = document.createElement("input");
  inpDesc.type = "text";
  inpDesc.className = "item-desc";
  tdDesc.appendChild(inpDesc);

  const tdQty = document.createElement("td");
  const inpQty = document.createElement("input");
  inpQty.type = "number";
  inpQty.step = "0.01";
  inpQty.className = "item-qty";
  tdQty.appendChild(inpQty);

  const tdPrice = document.createElement("td");
  const inpPrice = document.createElement("input");
  inpPrice.type = "number";
  inpPrice.step = "0.01";
  inpPrice.className = "item-price";
  tdPrice.appendChild(inpPrice);

  tr.appendChild(tdDesc);
  tr.appendChild(tdQty);
  tr.appendChild(tdPrice);

  tbody.appendChild(tr);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("payment-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    fillPdfFromForm();
    await generatePdf();
  });

  const addRowBtn = document.getElementById("add-item-row");
  addRowBtn.addEventListener("click", addItemRow);
});
