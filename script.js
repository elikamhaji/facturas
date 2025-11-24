
document.getElementById("gen").onclick = async () => {
  document.getElementById("p-cliente").innerText = document.getElementById("cliente").value;
  document.getElementById("p-cedula").innerText = document.getElementById("cedula").value;
  document.getElementById("p-telefono").innerText = document.getElementById("telefono").value;
  document.getElementById("p-fecha").innerText = document.getElementById("fecha").value;
  document.getElementById("p-orden").innerText = document.getElementById("orden").value;

  const el = document.getElementById("pdf");
  const canvas = await html2canvas(el, {scale:2});
  const img = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p","pt","a4");
  const w = 595;
  const h = canvas.height * (595/canvas.width);
  pdf.addImage(img,"PNG",0,0,w,h);
  pdf.save("orden.pdf");
};
