import { storage } from "./firebase.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

window.uploadLogo = async function(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const logoRef = ref(storage, "branding/logo.png");
    await uploadBytes(logoRef, file);
    
    const url = await getDownloadURL(logoRef);
    localStorage.setItem("invoiceLogo", url);
    
    document.getElementById("logoPreview").src = url;
    alert("Logo uploaded successfully ✅");
    
  } catch (e) {
    console.error(e);
    alert("Logo upload failed ❌");
  }
};