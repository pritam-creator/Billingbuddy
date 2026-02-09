window.saveLogo = () => {
  const url = document.getElementById("logoUrl").value;
  localStorage.setItem("invoiceLogo", url);
  alert("Logo saved successfully");
};