// ═══════════════════════════════════════════
// KanbanFlow — app.js
// ═══════════════════════════════════════════

// ── State ────────────────────────────────
let state = {
  tasks: [],
  streak: {
    count: 0,
    lastCompletedDate: null
  }
};

let draggedId = null;
let toastTimer = null;

// ── Persistence ──────────────────────────
const STORAGE_KEY = 'kanbanflow_v1';

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save state:', e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state.tasks  = Array.isArray(parsed.tasks)  ? parsed.tasks  : [];
    state.streak = parsed.streak && typeof parsed.streak === 'object'
      ? { count: parsed.streak.count || 0, lastCompletedDate: parsed.streak.lastCompletedDate || null }
      : { count: 0, lastCompletedDate: null };
  } catch (e) {
    console.warn('Could not load state:', e);
  }
}

// ── Utilities ────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function yesterdayISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function esc(str) {
  const d = document.createElement('div');
  d.textContent = String(str ?? '');
  return d.innerHTML;
}

// ── Streak Logic ─────────────────────────
function updateStreak() {
  const today     = todayISO();
  const yesterday = yesterdayISO();
  const last      = state.streak.lastCompletedDate;

  if (last === today) return false; // Already counted today

  state.streak.count = (last === yesterday) ? state.streak.count + 1 : 1;
  state.streak.lastCompletedDate = today;
  return true; // Streak was updated
}

// ── Board Rendering ───────────────────────
const PRIORITY_MAP = {
  alta:  { label: 'Alta',  badge: 'text-red-400 bg-red-900/20 border-red-800/60'           },
  media: { label: 'Média', badge: 'text-amber-400 bg-amber-900/20 border-amber-800/60'     },
  baixa: { label: 'Baixa', badge: 'text-emerald-400 bg-emerald-900/20 border-emerald-800/60' }
};

const EMPTY_STATE = {
  todo:  { icon: '📋', text: 'Nenhuma tarefa ainda.<br>Clique em <strong class="text-neutral-400">Nova Tarefa</strong> para começar.' },
  doing: { icon: '⚡', text: 'Nenhuma tarefa em andamento.<br>Mova um card para cá.' },
  done:  { icon: '🏆', text: 'Nenhuma tarefa concluída ainda.<br>Vamos lá!' }
};

function emptyStateHTML(col) {
  const { icon, text } = EMPTY_STATE[col];
  return `
    <div class="empty-state flex flex-col items-center justify-center py-16 px-6 text-center select-none">
      <div class="text-5xl mb-4" style="opacity:0.15">${icon}</div>
      <p class="text-neutral-600 text-xs leading-relaxed">${text}</p>
    </div>
  `;
}

function cardHTML(task) {
  const p      = PRIORITY_MAP[task.priority] ?? PRIORITY_MAP.baixa;
  const isDone = task.column === 'done';
  const date   = formatDate(task.createdAt);

  return `
    <div
      class="task-card priority-${esc(task.priority)} bg-[#2d2d2d] border border-[#3a3a3a] rounded-xl p-4 cursor-grab select-none group hover:border-[#4d4d4d] transition-all"
      draggable="true"
      data-id="${esc(task.id)}"
    >
      <!-- Top row: priority badge + delete -->
      <div class="flex items-start justify-between gap-2 mb-3">
        <span class="inline-flex items-center text-[10px] font-black px-2.5 py-1 rounded-full border tracking-wider uppercase ${p.badge}">
          ${p.label}
        </span>
        <button
          class="delete-btn opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-900/25 transition-all flex-shrink-0 focus:outline-none focus:opacity-100"
          data-id="${esc(task.id)}"
          title="Remover tarefa"
          type="button"
        >
          <svg class="w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Title -->
      <h3 class="text-sm font-semibold leading-snug mb-1 ${isDone ? 'line-through text-neutral-600' : 'text-neutral-100'}">
        ${esc(task.title)}
      </h3>

      <!-- Description -->
      ${task.description
        ? `<p class="text-xs text-neutral-500 leading-relaxed mt-1 mb-2 line-clamp-3">${esc(task.description)}</p>`
        : '<div class="mb-2"></div>'
      }

      <!-- Footer -->
      <div class="flex items-center justify-between pt-2.5 border-t border-[#3a3a3a] mt-1">
        <span class="text-[11px] text-neutral-600 font-medium">${date}</span>
        ${isDone
          ? '<span class="text-[11px] text-emerald-400 font-bold tracking-wide">✓ Concluído</span>'
          : ''
        }
      </div>
    </div>
  `;
}

function renderBoard() {
  const cols = { todo: [], doing: [], done: [] };
  state.tasks.forEach(t => { if (t.column in cols) cols[t.column].push(t); });

  for (const [colId, tasks] of Object.entries(cols)) {
    const container = document.getElementById(`col-${colId}`);
    const counter   = document.getElementById(`count-${colId}`);
    if (!container || !counter) continue;

    counter.textContent = tasks.length;
    container.innerHTML = tasks.length === 0
      ? emptyStateHTML(colId)
      : tasks.map(cardHTML).join('');
  }

  updateStreakDisplay();
}

// ── Streak UI ─────────────────────────────
function updateStreakDisplay() {
  const countEl = document.getElementById('streak-count');
  if (countEl) countEl.textContent = state.streak.count;
}

function animateStreak() {
  const fire  = document.getElementById('streak-fire');
  const count = document.getElementById('streak-count');

  // Restart animations via reflow trick
  [fire, count].forEach(el => {
    el.classList.remove('streak-fire-animate', 'streak-count-animate');
    void el.offsetWidth;
  });

  fire.classList.add('streak-fire-animate');
  count.classList.add('streak-count-animate');

  setTimeout(() => {
    fire.classList.remove('streak-fire-animate');
    count.classList.remove('streak-count-animate');
  }, 1500);
}

// ── Toast ─────────────────────────────────
function showToast(msg, icon = '✅') {
  const toast = document.getElementById('toast');
  document.getElementById('toast-message').textContent = msg;
  document.getElementById('toast-icon').textContent    = icon;

  toast.classList.remove('toast-hidden');
  toast.classList.add('toast-visible');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-hidden');
  }, 3800);
}

// ── Confetti Animation ────────────────────
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx    = canvas.getContext('2d');

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';

  const palette = [
    '#8b5cf6', '#6366f1', '#a78bfa',
    '#ec4899', '#f43f5e',
    '#f59e0b', '#fbbf24',
    '#10b981', '#34d399',
    '#3b82f6', '#06b6d4',
    '#f97316'
  ];

  const COUNT = 140;
  const pieces = Array.from({ length: COUNT }, () => ({
    x:        Math.random() * canvas.width,
    y:        -20 - Math.random() * 180,
    w:        Math.random() * 13 + 4,
    h:        Math.random() * 6  + 3,
    color:    palette[Math.floor(Math.random() * palette.length)],
    vx:       (Math.random() - 0.5) * 6,
    vy:       Math.random() * 4 + 1.5,
    gravity:  0.07 + Math.random() * 0.06,
    angle:    Math.random() * Math.PI * 2,
    spin:     (Math.random() - 0.5) * 0.2,
    isCircle: Math.random() > 0.65
  }));

  let startTime = null;
  const DURATION = 3400;

  function frame(ts) {
    if (!startTime) startTime = ts;
    const elapsed  = ts - startTime;
    const progress = elapsed / DURATION;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let stillAlive = false;

    for (const p of pieces) {
      if (p.y > canvas.height + 20) continue;
      stillAlive = true;

      p.vx    *= 0.998;
      p.vy    += p.gravity;
      p.x     += p.vx;
      p.y     += p.vy;
      p.angle += p.spin;

      const alpha = progress < 0.65 ? 1 : Math.max(0, 1 - ((progress - 0.65) / 0.35));

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;

      if (p.isCircle) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }

      ctx.restore();
    }

    if (stillAlive && progress < 1) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
    }
  }

  requestAnimationFrame(frame);
}

// ── Handle Task Completion ────────────────
function handleTaskCompleted() {
  const updated = updateStreak();
  saveState();
  launchConfetti();
  updateStreakDisplay();

  if (updated) {
    animateStreak();
    const msg = state.streak.count === 1
      ? 'Primeira tarefa concluída! Boa sorte!'
      : `${state.streak.count} dias seguidos! Continue assim! 💪`;
    showToast(msg, '🔥');
  } else {
    showToast('Tarefa concluída! Ótimo trabalho!', '✅');
  }
}

// ── Drag & Drop ───────────────────────────
document.addEventListener('dragstart', (e) => {
  const card = e.target.closest('.task-card');
  if (!card) return;

  draggedId = card.dataset.id;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', draggedId);

  // Delay class so the ghost image isn't affected
  requestAnimationFrame(() => card.classList.add('dragging'));
});

document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  const col = e.target.closest('.column-drop-zone');
  document.querySelectorAll('.column-drop-zone').forEach(c => c.classList.remove('drag-over'));
  if (col) col.classList.add('drag-over');
});

document.addEventListener('drop', (e) => {
  e.preventDefault();
  document.querySelectorAll('.column-drop-zone').forEach(c => c.classList.remove('drag-over'));

  if (!draggedId) return;

  const col = e.target.closest('.column-drop-zone');
  if (!col) { draggedId = null; return; }

  const newColumn = col.dataset.column;
  const task      = state.tasks.find(t => t.id === draggedId);
  draggedId = null;

  if (!task) return;
  if (task.column === newColumn) { renderBoard(); return; }

  const prevColumn = task.column;
  task.column = newColumn;

  if (newColumn === 'done' && prevColumn !== 'done') {
    task.completedAt = Date.now();
    handleTaskCompleted();
  } else {
    if (newColumn !== 'done') task.completedAt = null;
    saveState();
  }

  renderBoard();
});

document.addEventListener('dragend', () => {
  document.querySelectorAll('.task-card.dragging').forEach(c => c.classList.remove('dragging'));
  document.querySelectorAll('.column-drop-zone').forEach(c => c.classList.remove('drag-over'));
  draggedId = null;
});

// ── Delete Task (delegated) ───────────────
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.delete-btn');
  if (!btn) return;

  const id = btn.dataset.id;
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveState();
  renderBoard();
});

// ── Modal ─────────────────────────────────
function openModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.style.display = 'flex';
  setTimeout(() => {
    const title = document.getElementById('task-title');
    if (title) title.focus();
  }, 50);
  refreshPriorityUI();
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  document.getElementById('task-form').reset();
  refreshPriorityUI();
}

function refreshPriorityUI() {
  document.querySelectorAll('input[name="priority"]').forEach(radio => {
    const btn = radio.nextElementSibling;
    if (!btn) return;
    btn.classList.toggle('priority-selected', radio.checked);
  });
}

document.getElementById('add-task-btn').addEventListener('click', openModal);
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('cancel-btn').addEventListener('click', closeModal);

// Click outside to dismiss
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

// Priority radio buttons update UI
document.querySelectorAll('input[name="priority"]').forEach(radio => {
  radio.addEventListener('change', refreshPriorityUI);
});

// Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ── Task Form Submit ──────────────────────
document.getElementById('task-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('task-title').value.trim();
  if (!title) {
    document.getElementById('task-title').focus();
    return;
  }

  const description = document.getElementById('task-description').value.trim();
  const priority    = document.querySelector('input[name="priority"]:checked')?.value ?? 'baixa';
  const column      = document.getElementById('task-column').value;

  const task = {
    id:          uid(),
    title,
    description,
    priority,
    column,
    createdAt:   Date.now(),
    completedAt: null
  };

  // Directly adding to done counts for the streak
  if (column === 'done') {
    task.completedAt = Date.now();
    state.tasks.push(task);
    handleTaskCompleted();
  } else {
    state.tasks.push(task);
    saveState();
  }

  renderBoard();
  closeModal();
});

// ── Init ──────────────────────────────────
loadState();
renderBoard();
