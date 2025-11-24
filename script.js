async function generatePDF() {
  document.getElementById("pdf-cliente").innerText = document.getElementById("cliente").value;
  document.getElementById("pdf-cedula").innerText = document.getElementById("cedula").value;
  document.getElementById("pdf-telefono").innerText = document.getElementById("telefono").value;
  document.getElementById("pdf-fecha").innerText = document.getElementById("fecha").value;
  document.getElementById("pdf-orden").innerText = document.getElementById("orden").value;

  const pdfDiv = document.getElementById("pdf");

  const canvas = await html2canvas(pdfDiv);
  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "pt", "a4");

  const imgWidth = 595;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save("orden_pago.pdf");
}
