(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- EmailJS ---------- */

  if (window.emailjs) {
    emailjs.init({ publicKey: "xeTPCgSK8mgwHugHW" });
  }

  function sendReservation(day, dateType) {
    if (!window.emailjs) {
      console.warn('EmailJS nu s-a încărcat, rezervarea nu a fost trimisă.');
      return Promise.reject(new Error('emailjs unavailable'));
    }
    return emailjs.send(
      "service_7gdn8hj",
      "template_7sdc56n",
      {
        selected_date: day,
        date_type: dateType,
        selected_time: "After 20:00"
      }
    );
  }

  /* ---------- Fireflies ---------- */

  function spawnFireflies() {
    if (prefersReducedMotion) return;
    const holder = document.getElementById('fireflies');
    const count = window.innerWidth < 500 ? 12 : 22;

    for (let i = 0; i < count; i++) {
      const f = document.createElement('div');
      f.className = 'firefly';
      const left = Math.random() * 100;
      const bottom = Math.random() * 30;
      const duration = 6 + Math.random() * 6;
      const glowDuration = 2 + Math.random() * 2;
      const delay = Math.random() * 6;

      f.style.left = left + 'vw';
      f.style.bottom = bottom + 'vh';
      f.style.animationDuration = `${duration}s, ${glowDuration}s`;
      f.style.animationDelay = `${delay}s, ${delay}s`;
      holder.appendChild(f);
    }
  }

  /* ---------- Scene navigation ---------- */

  const scenes = Array.from(document.querySelectorAll('.scene'));

  function goToScene(number) {
    const current = document.querySelector('.scene.is-active');
    const next = document.querySelector(`.scene[data-scene="${number}"]`);
    if (!next || next === current) return;

    if (current) {
      current.classList.add('is-leaving');
      current.classList.remove('is-active');
      setTimeout(() => current.classList.remove('is-leaving'), 550);
    }

    requestAnimationFrame(() => {
      next.classList.add('is-active');
    });
  }

  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => goToScene(btn.dataset.next));
  });

  /* ---------- Scene 2: DA / NU ---------- */

  const btnDa = document.getElementById('btnDa');
  const btnNu = document.getElementById('btnNu');
  const btnRow = document.getElementById('btnRow');
  const taunt = document.getElementById('taunt');

  const taunts = [
    'Nu fugi de întrebare 👀',
    'Serios acum...',
    'Hai, DA e chiar acolo →',
    'Nu se prinde 😄',
    'Insisti degeaba',
    'DA e mult mai aproape'
  ];
  let dodgeCount = 0;

  function dodgeNu() {
    if (prefersReducedMotion) return;
    const rowRect = btnRow.getBoundingClientRect();
    const btnRect = btnNu.getBoundingClientRect();

    const maxLeft = Math.max(rowRect.width - btnRect.width, 0);
    const maxTop = Math.max(120 - btnRect.height, 0);

    const newLeft = Math.random() * maxLeft;
    const newTop = Math.random() * maxTop;

    if (!btnNu.classList.contains('dodging')) {
      btnNu.classList.add('dodging');
    }

    btnNu.style.left = newLeft + 'px';
    btnNu.style.top = newTop + 'px';

    dodgeCount++;
    taunt.textContent = taunts[Math.min(dodgeCount - 1, taunts.length - 1)];
  }

  btnNu.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') dodgeNu();
  });

  btnNu.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dodgeNu();
  }, { passive: false });

  btnNu.addEventListener('click', (e) => {
    // Only reachable if reduced-motion or a fast click before dodge registers
    e.preventDefault();
    dodgeNu();
  });

  btnDa.addEventListener('click', () => {
    goToScene(3);
  });

  /* ---------- Scene 3: spell + picnic day ---------- */

  const btnSpell = document.getElementById('btnSpell');
  const spellWrap = document.getElementById('spellWrap');
  const blanket = document.getElementById('blanket');
  const confirmBox = document.getElementById('confirm');
  const chosenDayEl = document.getElementById('chosenDay');
  const dayChips = document.querySelectorAll('.day-chip');
  const btnRestart = document.getElementById('btnRestart');

  function burstAt(x, y) {
    if (prefersReducedMotion) return;
    const icons = ['✨', '🧺', '🌙', '💫'];
    for (let i = 0; i < 10; i++) {
      const p = document.createElement('span');
      p.className = 'burst-particle';
      p.textContent = icons[Math.floor(Math.random() * icons.length)];
      const angle = Math.random() * Math.PI * 2;
      const distance = 60 + Math.random() * 80;
      p.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 950);
    }
  }

  btnSpell.addEventListener('click', (e) => {
    const rect = btnSpell.getBoundingClientRect();
    burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2);

    spellWrap.hidden = true;
    blanket.hidden = false;

    dayChips.forEach((chip, i) => {
      chip.style.animationDelay = `${i * 0.06}s`;
    });
  });

  const sendStatus = document.getElementById('sendStatus');

  dayChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (chip.classList.contains('chosen')) return; // avoid double-send on re-click
      dayChips.forEach(c => c.classList.remove('chosen'));
      chip.classList.add('chosen');

      const rect = chip.getBoundingClientRect();
      burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2);

      chosenDayEl.textContent = chip.dataset.day;

      sendReservation(chip.dataset.day, "Picnic")
        .then(() => {
          if (sendStatus) sendStatus.textContent = 'Ți-am trimis pe mail 💌';
        })
        .catch((err) => {
          console.error('Trimiterea rezervării a eșuat:', err);
          if (sendStatus) sendStatus.textContent = 'Nu am putut trimite mail-ul, dar am reținut ziua 🧺';
        });

      setTimeout(() => {
        blanket.hidden = true;
        confirmBox.hidden = false;
      }, 500);
    });
  });

  btnRestart.addEventListener('click', () => {
    confirmBox.hidden = true;
    blanket.hidden = true;
    spellWrap.hidden = false;
    dayChips.forEach(c => c.classList.remove('chosen'));
    dodgeCount = 0;
    taunt.textContent = '\u00A0';
    btnNu.classList.remove('dodging');
    btnNu.style.left = '';
    btnNu.style.top = '';
    if (sendStatus) sendStatus.textContent = '\u00A0';
    goToScene(1);
  });

  /* ---------- Init ---------- */

  spawnFireflies();
})();
