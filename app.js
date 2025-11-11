const fileInput = document.getElementById("fileInput");
const previewImg = document.getElementById("previewImg");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const resultBox = document.getElementById("resultBox");
const resultImg = document.getElementById("resultImg");
const downloadBtn = document.getElementById("downloadBtn");
const uploadArea = document.getElementById("uploadArea");
const toggle = document.getElementById("themeToggle");
const body = document.body;
const icon = toggle.querySelector("i");
const editingControls = document.getElementById("editingControls");
const actionButtons = document.getElementById("actionButtons");
const removeBgBtn = document.getElementById("removeBgBtn");

const brightnessSlider = document.getElementById("brightnessSlider");
const contrastSlider = document.getElementById("contrastSlider");
const saturationSlider = document.getElementById("saturationSlider");
const blurSlider = document.getElementById("blurSlider");
const resetFiltersBtn = document.getElementById("resetFilters");

const brightnessValue = document.getElementById("brightnessValue");
const contrastValue = document.getElementById("contrastValue");
const saturationValue = document.getElementById("saturationValue");
const blurValue = document.getElementById("blurValue");

let currentFile = null;
let processedImageUrl = null;
const mainSection = document.getElementById("mainSection");

toggle.addEventListener("click", () => {
  body.classList.toggle("light-theme");
  toggle.style.transform = "rotate(360deg)";
  setTimeout(() => (toggle.style.transform = ""), 500);
  icon.classList.toggle("fa-sun");
  icon.classList.toggle("fa-moon");
});

uploadArea.addEventListener("click", () => fileInput.click());
uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = "#00aaff";
  uploadArea.style.background = "rgba(0,170,255,0.1)";
});
uploadArea.addEventListener("dragleave", () => {
  uploadArea.style.borderColor = "#00aaff";
  uploadArea.style.background = "rgba(255,255,255,0.05)";
});
uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  fileInput.files = e.dataTransfer.files;
  fileInput.dispatchEvent(new Event("change"));
});

brightnessSlider.addEventListener("input", updateFilters);
contrastSlider.addEventListener("input", updateFilters);
saturationSlider.addEventListener("input", updateFilters);
blurSlider.addEventListener("input", updateFilters);
resetFiltersBtn.addEventListener("click", resetFilters);

function updateFilters() {
  brightnessValue.textContent = `${brightnessSlider.value}%`;
  contrastValue.textContent = `${contrastSlider.value}%`;
  saturationValue.textContent = `${saturationSlider.value}%`;
  blurValue.textContent = `${blurSlider.value}px`;
  const filter = `brightness(${brightnessSlider.value}%) contrast(${contrastSlider.value}%) saturate(${saturationSlider.value}%) blur(${blurSlider.value}px)`;
  previewImg.style.filter = filter;
  resultImg.style.filter = filter;
}

function resetFilters() {
  brightnessSlider.value = 100;
  contrastSlider.value = 100;
  saturationSlider.value = 100;
  blurSlider.value = 0;
  updateFilters();
}

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  currentFile = file;

  const reader = new FileReader();
  reader.onload = () => {
    previewImg.src = reader.result;
    previewImg.style.opacity = "0";
    setTimeout(() => {
      previewImg.style.transition = "opacity 0.8s ease";
      previewImg.style.opacity = "1";
    }, 50);
  };
  reader.readAsDataURL(file);

  editingControls.style.display = "block";
  actionButtons.style.display = "flex";
  resultBox.style.display = "none";
  progressText.textContent = "Image uploaded successfully!";
  setTimeout(() => (progressText.textContent = ""), 2000);
});

removeBgBtn.addEventListener("click", removeBackground);

async function removeBackground() {
  if (!currentFile) return;

  removeBgBtn.disabled = true;
  removeBgBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Processing...';
  progressBar.style.width = "30%";
  progressText.textContent = "Removing background...";

  const formData = new FormData();
  formData.append("image_file", currentFile);
  formData.append("size", "auto");

  try {
    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": "6sm8P2fiZVudg7jaW2xRcBg8" },
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to remove background.");

    const blob = await res.blob();
    processedImageUrl = URL.createObjectURL(blob);

    progressBar.style.width = "100%";
    progressText.textContent = "Background removed successfully!";

    setTimeout(() => {
      progressText.textContent = "";
      previewImg.src = processedImageUrl;

      downloadBtn.addEventListener("click", (e) => {
        e.preventDefault();
        downloadFilteredImage();
      });

      resultBox.style.display = "flex";

      removeBgBtn.disabled = false;
      removeBgBtn.innerHTML = '<i class="fas fa-magic"></i> Remove Background';
    }, 800);
  } catch (err) {
    progressText.textContent = "Error: " + err.message;
    removeBgBtn.disabled = false;
    removeBgBtn.innerHTML = '<i class="fas fa-magic"></i> Remove Background';
  }
}
function downloadFilteredImage() {
  if (!processedImageUrl) return alert("Please remove background first!");

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = processedImageUrl;

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;

    const filter = `brightness(${brightnessSlider.value}%) contrast(${contrastSlider.value}%) saturate(${saturationSlider.value}%) blur(${blurSlider.value}px)`;
    ctx.filter = filter;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
}

