/* app/js/app.js
 * Roll Show – Core Frontend Logic
 * All HTML files live in /app and include this script via <script src="js/app.js" defer></script>
 */

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const page = path.split('/').pop();

  initThemeToggle();

  switch (page) {
    case 'index.html':
    case '':
      initLandingPage();
      break;
    case 'auth.html':
      initAuthPage();
      break;
    case 'skater-dashboard.html':
      initSkaterDashboard();
      break;
    case 'create-show.html':
      initCreateShow();
      break;
    case 'video-studio.html':
      initVideoStudio();
      break;
    case 'branding-studio.html':
      initBrandingStudio();
      break;
    case 'ticket-view.html':
      initTicketView();
      break;
    case 'buyer-profile.html':
      initBuyerProfile();
      break;
    case 'show-page.html':
      initShowPage();
      break;
    case 'admin-payouts.html':
      initAdminPayouts();
      break;
    default:
      break;
  }
});

/* ========== THEME ========== */

function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const root = document.documentElement;
  const saved = localStorage.getItem('rollshow-theme');
  if (saved) root.setAttribute('data-theme', saved);

  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('rollshow-theme', next);
  });
}

/* ========== LANDING / INDEX ========== */

function initLandingPage() {
  const showGrid = document.getElementById('showGrid');
  if (!showGrid) return;

  const demoShows = [
    { id: '1', title: 'Neon Jam Session', discipline: 'Jam', price: 10 },
    { id: '2', title: 'Mystic Night Park Run', discipline: 'Park', price: 15 }
  ];

  demoShows.forEach(show => {
    const card = document.createElement('a');
    card.href = `show-page.html?showId=${encodeURIComponent(show.id)}`;
    card.className = 'show-card';
    card.innerHTML = `
      <h3>${show.title}</h3>
      <p>${show.discipline}</p>
      <p>$${show.price}</p>
    `;
    showGrid.appendChild(card);
  });
}

/* ========== AUTH ========== */

function initAuthPage() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      window.location.href = 'skater-dashboard.html';
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', e => {
      e.preventDefault();
      const role = document.getElementById('signupRole').value;
      window.location.href =
        role === 'skater' ? 'skater-dashboard.html' : 'buyer-profile.html';
    });
  }
}

/* ========== SKATER DASHBOARD ========== */

function initSkaterDashboard() {
  const showsContainer = document.getElementById('skaterShows');
  if (!showsContainer) return;

  const myShows = [
    { id: '1', title: 'Neon Jam Session', tickets: 42, revenue: 420, status: 'Scheduled' }
  ];

  myShows.forEach(show => {
    const card = document.createElement('a');
    card.href = `show-page.html?showId=${encodeURIComponent(show.id)}`;
    card.className = 'show-card';
    card.innerHTML = `
      <h3>${show.title}</h3>
      <p>Status: ${show.status}</p>
      <p>Tickets: ${show.tickets}</p>
      <p>Revenue: $${show.revenue}</p>
    `;
    showsContainer.appendChild(card);
  });

  const statShows = document.getElementById('statShows');
  const statTickets = document.getElementById('statTickets');
  const statRevenue = document.getElementById('statRevenue');

  if (statShows) statShows.textContent = myShows.length.toString();
  if (statTickets) statTickets.textContent = myShows.reduce((s, m) => s + m.tickets, 0);
  if (statRevenue) statRevenue.textContent = '$' + myShows.reduce((s, m) => s + m.revenue, 0);
}

/* ========== CREATE SHOW ========== */

function initCreateShow() {
  const form = document.getElementById('createShowForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const payload = {
      title: document.getElementById('showTitle').value,
      tagline: document.getElementById('showTagline').value,
      description: document.getElementById('showDescription').value,
      discipline: document.getElementById('showDiscipline').value,
      price: Number(document.getElementById('ticketPrice').value || 0),
      premiereDate: document.getElementById('premiereDate').value,
      videoSource: document.getElementById('videoSource').value
    };
    console.log('Create show payload:', payload);
    window.location.href = 'skater-dashboard.html';
  });
}

/* ========== VIDEO STUDIO ========== */

let mediaRecorder = null;
let recordedChunks = [];
let clips = [];

function initVideoStudio() {
  const recordPreview = document.getElementById('recordPreview');
  const startBtn = document.getElementById('startRecord');
  const stopBtn = document.getElementById('stopRecord');
  const saveBtn = document.getElementById('saveRecord');
  const uploadInput = document.getElementById('clipUpload');
  const clipList = document.getElementById('clipList');
  const timeline = document.getElementById('timeline');
  const renderBtn = document.getElementById('renderVideo');

  if (!recordPreview || !startBtn || !stopBtn || !saveBtn || !uploadInput || !clipList || !timeline || !renderBtn) return;

  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      recordPreview.srcObject = stream;

      startBtn.addEventListener('click', () => {
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
        mediaRecorder.start();
      });

      stopBtn.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      });

      saveBtn.addEventListener('click', () => {
        if (!recordedChunks.length) return;
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const clip = { id: 'rec-' + Date.now(), url, name: 'Recorded Clip' };
        clips.push(clip);
        renderClipList(clipList);
        renderTimeline(timeline);
      });
    })
    .catch(err => {
      console.warn('Media error:', err);
    });

  uploadInput.addEventListener('change', e => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      clips.push({ id: 'up-' + Date.now() + '-' + file.name, url, name: file.name });
    });
    renderClipList(clipList);
    renderTimeline(timeline);
  });

  renderBtn.addEventListener('click', () => {
    console.log('Timeline clips:', clips);
    alert('Render request queued (stub).');
  });
}

function renderClipList(container) {
  container.innerHTML = '';
  clips.forEach(clip => {
    const item = document.createElement('div');
    item.className = 'clip-item';
    item.textContent = clip.name;
    container.appendChild(item);
  });
}

function renderTimeline(container) {
  container.innerHTML = '';
  clips.forEach(clip => {
    const block = document.createElement('div');
    block.className = 'timeline-block';
    block.textContent = clip.name;
    container.appendChild(block);
  });
}

/* ========== BRANDING STUDIO ========== */

function initBrandingStudio() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });

  initTicketEditor();
  initStampEditor();
  initFlyerEditor();
}

/* Ticket Layout */

function initTicketEditor() {
  const canvas = document.getElementById('ticketCanvas');
  const bgInput = document.getElementById('ticketBg');
  const headerInput = document.getElementById('ticketHeader');
  const footerInput = document.getElementById('ticketFooter');
  if (!canvas || !bgInput || !headerInput || !footerInput) return;

  canvas.innerHTML = `
    <div class="ticket-preview">
      <div class="ticket-header" id="ticketHeaderPreview">Show Title</div>
      <div class="ticket-body">
        <p>Date & Time</p>
        <p>Buyer Name</p>
      </div>
      <div class="ticket-footer" id="ticketFooterPreview">Ticket ID • QR</div>
    </div>
  `;

  const headerPreview = document.getElementById('ticketHeaderPreview');
  const footerPreview = document.getElementById('ticketFooterPreview');

  bgInput.addEventListener('input', () => {
    canvas.style.backgroundColor = bgInput.value;
  });

  headerInput.addEventListener('input', () => {
    headerPreview.textContent = headerInput.value || 'Show Title';
  });

  footerInput.addEventListener('input', () => {
    footerPreview.textContent = footerInput.value || 'Ticket ID • QR';
  });
}

/* Stamp Editor */

function initStampEditor() {
  const canvas = document.getElementById('stampCanvas');
  const upload = document.getElementById('stampUpload');
  const textInput = document.getElementById('stampText');
  const colorInput = document.getElementById('stampColor');
  if (!canvas || !upload || !textInput || !colorInput) return;

  const stampPreview = document.createElement('div');
  stampPreview.className = 'stamp-preview';
  stampPreview.textContent = 'STAMP';
  canvas.appendChild(stampPreview);

  textInput.addEventListener('input', () => {
    stampPreview.textContent = textInput.value || 'STAMP';
  });

  colorInput.addEventListener('input', () => {
    stampPreview.style.color = colorInput.value;
    stampPreview.style.borderColor = colorInput.value;
  });

  upload.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    stampPreview.style.backgroundImage = `url(${url})`;
    stampPreview.textContent = '';
  });
}

/* Flyer Editor */

function initFlyerEditor() {
  const canvas = document.getElementById('flyerCanvas');
  const imageInput = document.getElementById('flyerImage');
  const titleInput = document.getElementById('flyerTitle');
  const dateInput = document.getElementById('flyerDate');
  const exportBtn = document.getElementById('exportFlyer');
  if (!canvas || !imageInput || !titleInput || !dateInput || !exportBtn) return;

  canvas.innerHTML = `
    <div class="flyer-preview">
      <div class="flyer-image" id="flyerImagePreview"></div>
      <div class="flyer-text">
        <h2 id="flyerTitlePreview">Show Title</h2>
        <p id="flyerDatePreview">Date & Time</p>
      </div>
    </div>
  `;

  const imgPreview = document.getElementById('flyerImagePreview');
  const titlePreview = document.getElementById('flyerTitlePreview');
  const datePreview = document.getElementById('flyerDatePreview');

  imageInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    imgPreview.style.backgroundImage = `url(${url})`;
  });

  titleInput.addEventListener('input', () => {
    titlePreview.textContent = titleInput.value || 'Show Title';
  });

  dateInput.addEventListener('input', () => {
    datePreview.textContent = dateInput.value || 'Date & Time';
  });

  exportBtn.addEventListener('click', () => {
    alert('Flyer export requested (stub).');
  });
}

/* ========== TICKET VIEW ========== */

function initTicketView() {
  const container = document.getElementById('ticketRender');
  const downloadBtn = document.getElementById('downloadTicket');
  if (!container || !downloadBtn) return;

  container.innerHTML = `
    <div class="ticket-preview">
      <div class="ticket-header">Neon Jam Session</div>
      <div class="ticket-body">
        <p>Buyer: You</p>
        <p>Date: 2026-03-09</p>
      </div>
      <div class="ticket-footer">Ticket #1234 • QR</div>
    </div>
  `;

  downloadBtn.addEventListener('click', () => {
    alert('Ticket download (stub).');
  });
}

/* ========== BUYER PROFILE ========== */

function initBuyerProfile() {
  const list = document.getElementById('ticketList');
  if (!list) return;

  const tickets = [
    { id: '1234', showTitle: 'Neon Jam Session', date: '2026-03-09' }
  ];

  tickets.forEach(t => {
    const item = document.createElement('a');
    item.href = `ticket-view.html?ticketId=${encodeURIComponent(t.id)}`;
    item.className = 'ticket-item';
    item.innerHTML = `
      <h3>${t.showTitle}</h3>
      <p>Ticket #${t.id}</p>
      <p>${t.date}</p>
    `;
    list.appendChild(item);
  });
}

/* ========== SHOW PAGE ========== */

function initShowPage() {
  const header = document.getElementById('showHeader');
  const videoPreview = document.getElementById('showVideoPreview');
  const priceDisplay = document.getElementById('ticketPriceDisplay');
  const buyBtn = document.getElementById('buyTicketBtn');
  if (!header || !videoPreview || !priceDisplay || !buyBtn) return;

  const show = {
    id: '1',
    title: 'Neon Jam Session',
    tagline: '20 minutes of pure groove',
    price: 10
  };

  header.innerHTML = `
    <h1>${show.title}</h1>
    <p>${show.tagline}</p>
  `;

  videoPreview.innerHTML = `
    <div class="video-placeholder">Show Preview</div>
  `;

  priceDisplay.textContent = `$${show.price}`;

  buyBtn.addEventListener('click', () => {
    alert('Ticket purchase flow (stub).');
  });
}

/* ========== ADMIN PAYOUTS ========== */

function initAdminPayouts() {
  const list = document.getElementById('payoutList');
  if (!list) return;

  const payouts = [
    { skater: 'Skater A', amount: 200, status: 'Pending' },
    { skater: 'Skater B', amount: 150, status: 'Paid' }
  ];

  payouts.forEach(p => {
    const row = document.createElement('div');
    row.className = 'payout-row';
    row.innerHTML = `
      <span>${p.skater}</span>
      <span>$${p.amount}</span>
      <span>${p.status}</span>
    `;
    list.appendChild(row);
  });
}
