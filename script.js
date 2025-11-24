// Full script.js with dropdown + signature support

function recalcTotals(){
 let rows=document.querySelectorAll(".item-row");
 let total=0;
 rows.forEach(r=>{
   let qty=parseFloat(r.querySelector(".item-qty").value)||0;
   let price=parseFloat(r.querySelector(".item-price").value)||0;
   let t=qty*price;
   r.querySelector(".item-total").textContent = t? t.toFixed(2):"";
   total += t;
 });
 document.getElementById("web-total-general").textContent = total.toFixed(2);
}

function fillPdf(){
 document.getElementById("pdf-cliente").textContent=document.getElementById("cliente").value;
 document.getElementById("pdf-cedula").textContent=document.getElementById("cedula").value;
 document.getElementById("pdf-telefono").textContent=document.getElementById("telefono").value;
 document.getElementById("pdf-orden-numero").textContent=document.getElementById("orden-numero").value;
 document.getElementById("pdf-fecha").textContent=document.getElementById("fecha").value;
 document.getElementById("pdf-cedula-sign").textContent=document.getElementById("cedula").value;
 document.getElementById("pdf-direccion").textContent=document.getElementById("direccion").value;

 // MATERIAL
 let pdfItems=document.getElementById("pdf-items-body");
 pdfItems.innerHTML="";
 let rows=document.querySelectorAll(".item-row");
 let total=0;
 rows.forEach(r=>{
   let desc=r.querySelector(".item-desc").value;
   let qty=parseFloat(r.querySelector(".item-qty").value)||0;
   let price=parseFloat(r.querySelector(".item-price").value)||0;
   if(!desc && !qty && !price) return;
   let t=qty*price;
   total+=t;
   pdfItems.innerHTML+=`<tr>
     <td>${desc}</td>
     <td>${qty.toFixed(2)}</td>
     <td>${price.toFixed(2)}</td>
     <td>${t.toFixed(2)}</td>
   </tr>`;
 });
 document.getElementById("pdf-total-general").textContent=total.toFixed(2);

 // PAGOS
 let pdfPay=document.getElementById("pdf-payments-body");
 pdfPay.innerHTML="";
 let pays=document.querySelectorAll(".payment-row");
 pays.forEach(r=>{
   let d=r.querySelector(".pay-desc").value;
   let a=parseFloat(r.querySelector(".pay-amount").value)||0;
   let n=r.querySelector(".pay-note").value;
   if(!d && !a && !n) return;
   pdfPay.innerHTML+=`<tr>
     <td>${d}</td><td>${a.toFixed(2)}</td><td>${n}</td>
   </tr>`;
 });
}

async function generatePDF(){
 fillPdf();
 const pdfContent=document.getElementById("pdf-content");
 const canvas=await html2canvas(pdfContent,{scale:2});
 const imgData=canvas.toDataURL("image/png");
 const {jsPDF}=window.jspdf;
 const pdf=new jsPDF("p","mm","a4");
 const pageWidth=pdf.internal.pageSize.getWidth();
 const imgHeight=(canvas.height*pageWidth)/canvas.width;
 pdf.addImage(imgData,"PNG",0,0,pageWidth,imgHeight);
 pdf.save("orden_pago.pdf");
}

document.addEventListener("input", e=>{
 if(e.target.classList.contains("item-qty")||e.target.classList.contains("item-price"))
   recalcTotals();
});

document.getElementById("add-item-row").onclick=function(){
 let b=document.getElementById("items-body");
 let r=document.createElement("tr");
 r.className="item-row";
 r.innerHTML=`<td><input class='item-desc' /></td>
 <td><input class='item-qty' type='number' step='0.01' /></td>
 <td><input class='item-price' type='number' step='0.01' /></td>
 <td class='item-total'></td>`;
 b.appendChild(r);
};

document.getElementById("add-payment-row").onclick=function(){
 let b=document.getElementById("payments-body");
 let r=document.createElement("tr");
 r.className="payment-row";
 r.innerHTML=`<td>
   <select class='pay-desc'>
     <option value="Cheque">Cheque</option>
     <option value="ACH">ACH</option>
   </select>
 </td>
 <td><input class='pay-amount' type='number' step='0.01' /></td>
 <td><input class='pay-note' /></td>`;
 b.appendChild(r);
};

document.getElementById("payment-form").addEventListener("submit", e=>{
 e.preventDefault();
 generatePDF();
});
