document.getElementById("gen").onclick = async ()=> {
  document.getElementById("pdf-cliente").innerText = document.getElementById("cliente").value;
  const el = document.getElementById("pdf");
  const canvas = await html2canvas(el);
  const img = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p","pt","a4");
  pdf.addImage(img,"PNG",0,0,595,(canvas.height*595)/canvas.width);
  pdf.save("test.pdf");
};
