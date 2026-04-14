// === SCRAMBLE EFFECT ===
const letters = "█▓▒░#@$%&*+=?ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const delayBetween = 2000;

function createScrambleEffect(element, finalText, colorFinal = "#5b616e", colorScramble = "#c5c7cc") {
  let iteration = 0;
  let frameId;
  let isDecoding = false;

  function scramble() {
    element.textContent = finalText.split("").map((char, i) => {
      if (char === " ") return " ";
      if (i < iteration) return finalText[i];
      return letters[Math.floor(Math.random() * letters.length)];
    }).join("");

    element.style.color = isDecoding ? colorFinal : colorScramble;

    if (iteration <= finalText.length) {
      iteration += 0.5;
      frameId = requestAnimationFrame(scramble);
    } else {
      cancelAnimationFrame(frameId);
      isDecoding = !isDecoding;
      setTimeout(() => {
        iteration = 0;
        frameId = requestAnimationFrame(scramble);
      }, delayBetween);
    }
  }

  requestAnimationFrame(scramble);
}

createScrambleEffect(document.getElementById("linesurat"), "Cek Status");
createScrambleEffect(document.getElementById("linesurat2"), "Surat Mahasiswa");



// === CARD 3D TILT ===
// === CARD 3D TILT (HALUS SEPERTI ANEWDAYONE) ===
const card = document.getElementById("tilt-card");
const container = document.querySelector(".card-container");

container.addEventListener("mousemove", (e) => {
  const rect = card.getBoundingClientRect();

  // posisi mouse relatif terhadap card
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // normalisasi -1 hingga 1
  const xNorm = (x / rect.width) * 2 - 1;
  const yNorm = (y / rect.height) * 2 - 1;

  // batas kemiringan max 6 derajat (lebih halus)
  const maxTilt = 6;

  const rotateY = xNorm * maxTilt;
  const rotateX = -yNorm * maxTilt;

  card.style.transform = `
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(12px)
  `;
});

// Smooth reset
container.addEventListener("mouseleave", () => {
  card.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0px)";
});
