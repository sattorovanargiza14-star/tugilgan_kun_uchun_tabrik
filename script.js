// script.js
// Tashqi JavaScript — HTML bilan birga ishlaydi.
// Saqlang: script.js (HTML bilan bir papkada)

(() => {
  // DO'STINGIZ ISMINI BU YERGA QO'YING:
  const friendName = "Ali"; // misol: "Samir"

  // Kod DOM tayyor bo'lgach bajarilsin
  document.addEventListener('DOMContentLoaded', () => {
    // DOM elementlarni olish
    const btnAlert = document.getElementById('btnAlert');
    const btnConfetti = document.getElementById('btnConfetti');
    const btnPlay = document.getElementById('btnPlay');
    const btnCopy = document.getElementById('btnCopy');
    const greetLine = document.getElementById('greetLine');
    const confettiCanvas = document.getElementById('confetti');
    const song = document.getElementById('song');

    // Agar elementlar topilmasa - konsolga yozamiz (brauzer ishlashi davom etadi)
    if (!btnAlert || !btnConfetti || !btnPlay || !btnCopy || !greetLine || !confettiCanvas) {
      console.warn('script.js: baʼzi elementlar topilmadi. HTML id larni tekshiring.');
    }

    // Greet satrini yangilash
    if (greetLine) greetLine.textContent = `${friendName}: Tug'ilgan kuning bilan! 🎉`;

    // --- Alert bilan tabriklash (tugma bosilganda oynacha) ---
    function showBirthdayAlert() {
      try {
        alert(`${friendName}, tug'ilgan kuning bilan! 🎉🎂\nSizga baxt, sog'lik va omad tilayman!`);
      } catch (e) {
        console.error('Alert ishlamayapti:', e);
      }
    }
    if (btnAlert) btnAlert.addEventListener('click', showBirthdayAlert);

    // --- Clipboard nusxa olish ---
    async function copyBirthdayMessage() {
      const message = `${friendName} — Tug'ilgan kuning muborak! 🎉\nSizga yorqin kunlar tilayman.`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(message);
          if (btnCopy) {
            const prev = btnCopy.textContent;
            btnCopy.textContent = 'Nusxalandi ✓';
            setTimeout(() => { if (btnCopy) btnCopy.textContent = prev; }, 1500);
          }
          return;
        } catch (e) {
          console.warn('navigator.clipboard bilan nusxalash muvaffaqiyatsiz:', e);
        }
      }

      // Fallback: textarea + execCommand
      try {
        const ta = document.createElement('textarea');
        ta.value = message;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand && document.execCommand('copy');
        document.body.removeChild(ta);
        if (ok) {
          if (btnCopy) {
            const prev = btnCopy.textContent;
            btnCopy.textContent = 'Nusxalandi ✓';
            setTimeout(() => { if (btnCopy) btnCopy.textContent = prev; }, 1500);
          }
          return;
        }
      } catch (e) {
        console.warn('execCommand nusxalash muvaffaqiyatsiz:', e);
      }

      // Oxirgi chora: prompt bilan qo'lda nusxalash
      try {
        window.prompt("Quyidagi matnni nusxa oling (Ctrl/Cmd+C):", message);
      } catch (e) {
        console.error('prompt bilan nusxalashda xato:', e);
      }
    }
    if (btnCopy) btnCopy.addEventListener('click', copyBirthdayMessage);

    // --- Audio boshqaruvi ---
    function playSong() {
      if (!song) {
        alert('Musiqa elementi topilmadi. HTML ichida <audio id=\"song\"> mavjudligini tekshiring.');
        return;
      }
      const hasSource = !!(song.currentSrc || song.src || (song.querySelector && song.querySelector('source') && song.querySelector('source').src));
      if (!hasSource) {
        alert('Musiqa manbasi yo\'q. <audio> ichidagi <source> src ni to\'ldiring yoki o\'zingizning mp3 faylingizni qo\'ying.');
        return;
      }
      song.currentTime = 0;
      const playPromise = song.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(err => {
          console.warn('Audio ijro etishda xato/autoplay cheklovi:', err);
          alert('Brauzer autoplay cheklovlari tufayli musiqa avtomatik ishlamadi — iltimos Play tugmasini yana bosing.');
        });
      }
    }
    if (btnPlay) btnPlay.addEventListener('click', playSong);

    // --- Konfetti implementatsiyasi (sodda va barqaror) ---
    (function initConfetti() {
      if (!confettiCanvas) return;
      const canvas = confettiCanvas;
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;

      function fit() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        canvas.style.width = `${Math.round(rect.width)}px`;
        canvas.style.height = `${Math.round(rect.height)}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      fit();
      window.addEventListener('resize', fit);

      function random(min, max) { return Math.random() * (max - min) + min; }

      class Particle {
        constructor(w, h, initial = true) {
          this.canvasW = w; this.canvasH = h;
          this.reset(initial);
        }
        reset(initial = false) {
          this.x = random(0, this.canvasW);
          this.y = initial ? random(0, this.canvasH) : random(-this.canvasH, 0);
          this.w = random(6, 12);
          this.h = random(6, 22);
          this.vx = random(-0.7, 0.7);
          this.vy = random(1.2, 4);
          this.angle = random(0, Math.PI * 2);
          this.spin = random(-0.12, 0.12);
          const hue = Math.floor(random(0, 360));
          this.color = `hsl(${hue}, 80%, 60%)`;
        }
        update() {
          this.x += this.vx; this.y += this.vy; this.angle += this.spin;
          if (this.y > this.canvasH + 30) this.reset();
        }
        draw(ctx) {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate(this.angle);
          ctx.fillStyle = this.color;
          ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
          ctx.restore();
        }
      }

      let particles = [];
      let animId = null;
      let running = false;

      function startConfetti(count = 80, durationMs = 6000) {
        cancelAnimationFrame(animId);
        fit();
        const rect = canvas.getBoundingClientRect();
        particles = [];
        for (let i = 0; i < count; i++) particles.push(new Particle(rect.width, rect.height, true));
        running = true;
        const loop = () => {
          if (!running) return;
          ctx.clearRect(0, 0, rect.width, rect.height);
          for (const p of particles) { p.update(); p.draw(ctx); }
          animId = requestAnimationFrame(loop);
        };
        loop();
        setTimeout(stopConfetti, durationMs);
      }

      function stopConfetti() {
        running = false;
        if (animId) cancelAnimationFrame(animId);
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
      }

      if (btnConfetti) btnConfetti.addEventListener('click', () => startConfetti(120, 6000));
    })();

    // --- Sahifa yuklanganda (ixtiyoriy) avtomatik alert --- //
    // Agar avtomatik alert kerak bo'lmasa, quyidagi ikki qatorni olib tashlang yoki kommentariyaga oling.
    try {
      setTimeout(() => {
        showBirthdayAlert();
      }, 800);
    } catch (e) {
      console.error('Avtomatik alertda xato:', e);
    }
  });
})();
