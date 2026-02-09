const downloadBtn = document.getElementById("downloadBtn");

downloadBtn.addEventListener("click", () => {
  const invoice = document.getElementById("invoice");
  
  html2pdf()
    .set({
      margin: 5,
      filename: `Invoice_${data.invoiceNo}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait"
      }
    })
    .from(invoice)
    .save();
});