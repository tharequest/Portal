function openPopup(fileId) {
  const overlay = document.getElementById('popupOverlay');
  const inner = document.getElementById('popupInner');

  const url = `https://drive.google.com/file/d/${fileId}/preview`;

  inner.innerHTML = `
    <iframe src="${url}" 
      width="100%" 
      height="100%" 
      style="border:none;border-radius:12px;">
    </iframe>
  `;

  overlay.classList.add('show');
}

document.getElementById('popupClose').onclick = () => {
  document.getElementById('popupOverlay').classList.remove('show');
};