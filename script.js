/* ═══════════════════════════════════════════════
   QUERYQUEST — script.js
   ═══════════════════════════════════════════════ */

'use strict';

// ════════════════════════════════════════════════════
//  DATA
// ════════════════════════════════════════════════════

const STUDENTS = [
  ...Array.from({ length: 61 }, (_, i) => ({ name: String(i + 1), avatar: '🎓' })),
];

const DB_ICONS = {
  Document: '📄',
  'Key-Value': '🔑',
  Column: '📊',
  Graph: '🕸️',
};

const QUESTIONS = [
  {
    type: "Document",
    question: "Insert a new user",
    options: [
      { text: 'insertOne({name:"Ravi"})', correct: true },
      { text: 'deleteOne({name:"Ravi"})', correct: false },
      { text: 'updateOne({})', correct: false }
    ]
  },
  {
    type: "Document",
    question: "Update user's age",
    options: [
      { text: 'updateOne({name:"Ravi"}, {$set:{age:22}})', correct: true },
      { text: 'insertOne({age:22})', correct: false },
      { text: 'deleteOne({age:22})', correct: false }
    ]
  },
  {
    type: "Document",
    question: "Delete a user",
    options: [
      { text: 'deleteOne({name:"Ravi"})', correct: true },
      { text: 'insertOne({name:"Ravi"})', correct: false },
      { text: 'updateOne({})', correct: false }
    ]
  },
  {
    type: "Key-Value",
    question: "Add a key-value pair",
    options: [
      { text: 'SET user1 "Ravi"', correct: true },
      { text: 'GET user1', correct: false },
      { text: 'DEL user1', correct: false }
    ]
  },
  {
    type: "Key-Value",
    question: "Update value of a key",
    options: [
      { text: 'SET user1 "Arun"', correct: true },
      { text: 'GET user1', correct: false },
      { text: 'DEL user1', correct: false }
    ]
  },
  {
    type: "Key-Value",
    question: "Delete a key",
    options: [
      { text: 'DEL user1', correct: true },
      { text: 'SET user1 "Ravi"', correct: false },
      { text: 'GET user1', correct: false }
    ]
  },
  {
    type: "Column",
    question: "Insert data into table",
    options: [
      { text: "INSERT INTO users (id,name) VALUES (1,'Ravi');", correct: true },
      { text: "DELETE FROM users;", correct: false },
      { text: "UPDATE users SET name='Ravi';", correct: false }
    ]
  },
  {
    type: "Column",
    question: "Update user name",
    options: [
      { text: "UPDATE users SET name='Arun' WHERE id=1;", correct: true },
      { text: "INSERT INTO users VALUES ('Arun');", correct: false },
      { text: "DELETE users WHERE id=1;", correct: false }
    ]
  },
  {
    type: "Graph",
    question: "Create a node",
    options: [
      { text: 'CREATE (u:User {name:"Ravi"})', correct: true },
      { text: 'DELETE (u)', correct: false },
      { text: 'SET u.name="Ravi"', correct: false }
    ]
  },
  {
    type: "Graph",
    question: "Create relationship between users",
    options: [
      { text: 'CREATE (a)-[:FOLLOWS]->(b)', correct: true },
      { text: 'DELETE (a)-[:FOLLOWS]->(b)', correct: false },
      { text: 'SET a=b', correct: false }
    ]
  }
];

// ════════════════════════════════════════════════════
//  GAME STATE
// ════════════════════════════════════════════════════

let state = {
  score: 0,
  questionIndex: 0,
  questionsOrder: [],
  currentQuestion: null,
  selectedStudent: null,
  spinning: false,
  answered: false,
  timer: null,
  timeLeft: 30,
};

// ════════════════════════════════════════════════════
//  DOM REFS
// ════════════════════════════════════════════════════

const $ = id => document.getElementById(id);

const dom = {
  spinnerScreen:   $('spinnerScreen'),
  quizScreen:      $('quizScreen'),
  endScreen:       $('endScreen'),
  studentReel:     $('studentReel'),
  selectedBadge:   $('selectedBadge'),
  badgeAvatar:     $('badgeAvatar'),
  badgeName:       $('badgeName'),
  spinBtn:         $('spinBtn'),
  startBtn:        $('startBtn'),
  wheelCanvas:     $('wheelCanvas'),
  scoreDisplay:    $('scoreDisplay'),
  questionCounter: $('questionCounter'),
  timerPill:       $('timerPill'),
  timerDisplay:    $('timerDisplay'),
  challengerAvatar:$('challengerAvatar'),
  challengerName:  $('challengerName'),
  dbBadge:         $('dbBadge'),
  dbIcon:          $('dbIcon'),
  dbType:          $('dbType'),
  questionText:    $('questionText'),
  dataContent:     $('dataContent'),
  optionsGrid:     $('optionsGrid'),
  terminalBody:    $('terminalBody'),
  resultBadge:     $('resultBadge'),
  nextBtn:         $('nextBtn'),
  finalScore:      $('finalScore'),
  endGrade:        $('endGrade'),
  endMessage:      $('endMessage'),
  resetBtn:        $('resetBtn'),
  playAgainBtn:    $('playAgainBtn'),
};

// ════════════════════════════════════════════════════
//  WHEEL CANVAS
// ════════════════════════════════════════════════════

const WHEEL_COLORS = [
  ['#0f172a','#22d3ee'],
  ['#0f172a','#8b5cf6'],
  ['#0f172a','#3b82f6'],
  ['#0f172a','#10b981'],
  ['#0f172a','#f59e0b'],
  ['#0f172a','#ec4899'],
  ['#0f172a','#6366f1'],
  ['#0f172a','#14b8a6'],
];

let wheelAngle = 0;
let wheelAnim = null;

function drawWheel(angle) {
  const canvas = dom.wheelCanvas;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r  = cx - 12;
  const n  = STUDENTS.length; // 61
  const slice = (2 * Math.PI) / n;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Outer glow ring
  ctx.beginPath();
  ctx.arc(cx, cy, r + 8, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(34,211,238,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Alternating color pairs for 61 segments
  const segColors = [
    ['#0a1628', '#22d3ee'],
    ['#0d0f24', '#8b5cf6'],
    ['#0a1820', '#3b82f6'],
    ['#0a1a14', '#10b981'],
    ['#1a130a', '#f59e0b'],
  ];

  for (let i = 0; i < n; i++) {
    const start = angle + i * slice;
    const end   = start + slice;
    const [bg, accent] = segColors[i % segColors.length];

    // Slice fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(34,211,238,0.15)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Number label (font scales down for 61 slices)
    const midAngle = start + slice / 2;
    const labelR   = r * 0.72;
    const lx = cx + Math.cos(midAngle) * labelR;
    const ly = cy + Math.sin(midAngle) * labelR;

    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(midAngle + Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = accent;
    ctx.font = `700 9px "Syne", sans-serif`;
    ctx.fillText(STUDENTS[i].name, 0, 0);
    ctx.restore();
  }

  // Center hub circle
  ctx.beginPath();
  ctx.arc(cx, cy, 30, 0, 2 * Math.PI);
  ctx.fillStyle = '#050810';
  ctx.fill();
  ctx.strokeStyle = 'rgba(34,211,238,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function spinWheel() {
  if (state.spinning) return;
  state.spinning = true;
  state.selectedStudent = null;

  dom.spinBtn.disabled = true;
  dom.startBtn.disabled = true;
  dom.spinBtn.classList.add('spinning');
  dom.selectedBadge.style.opacity = '0';
  dom.selectedBadge.style.transform = 'translateY(10px)';

  const n         = STUDENTS.length;
  const slice     = (2 * Math.PI) / n;
  const extraSpins = 5 + Math.random() * 4;
  const targetIdx  = Math.floor(Math.random() * n);
  // Align selected slice to top (angle = -π/2)
  const targetAngle = -Math.PI / 2 - (targetIdx * slice + slice / 2);
  const totalRot  = extraSpins * 2 * Math.PI + (targetAngle - wheelAngle + 2 * Math.PI * 10) % (2 * Math.PI);
  const finalAngle= wheelAngle + totalRot;

  const duration  = 2800;
  const start     = performance.now();
  const startAngle= wheelAngle;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function frame(now) {
    const elapsed = now - start;
    const t       = Math.min(elapsed / duration, 1);
    wheelAngle    = startAngle + totalRot * easeOut(t);
    drawWheel(wheelAngle);
    spinReel(t);

    if (t < 1) {
      wheelAnim = requestAnimationFrame(frame);
    } else {
      wheelAngle = finalAngle;
      drawWheel(wheelAngle);
      state.spinning = false;
      state.selectedStudent = STUDENTS[targetIdx];
      showSelected(targetIdx);
      dom.spinBtn.disabled = false;
      dom.spinBtn.classList.remove('spinning');
    }
  }

  cancelAnimationFrame(wheelAnim);
  wheelAnim = requestAnimationFrame(frame);
}

function spinReel(t) {
  const n = STUDENTS.length;
  const totalItems = n * 6;
  const idx = Math.floor(t * totalItems) % n;
  const offset = -(idx * 56) + 0;
  dom.studentReel.style.transform = `translateY(${offset % (n * 56)}px)`;

  // Highlight active
  document.querySelectorAll('.reel-item').forEach((el, i) => {
    el.classList.toggle('active', i % n === idx);
  });
}

function showSelected(idx) {
  const student = STUDENTS[idx];
  dom.badgeAvatar.textContent = '#';
  dom.badgeName.textContent   = `Student ${student.name}`;
  dom.selectedBadge.style.opacity   = '1';
  dom.selectedBadge.style.transform = 'translateY(0)';
  dom.startBtn.disabled = false;

  // Snap reel to student
  dom.studentReel.style.transform = `translateY(${-(idx * 56)}px)`;
  document.querySelectorAll('.reel-item').forEach((el, i) => {
    el.classList.toggle('active', i % STUDENTS.length === idx);
  });
}

// ════════════════════════════════════════════════════
//  REEL BUILD
// ════════════════════════════════════════════════════

function buildReel() {
  dom.studentReel.innerHTML = '';
  // Repeat 6x for seamless scroll illusion
  for (let rep = 0; rep < 6; rep++) {
    STUDENTS.forEach(s => {
      const div = document.createElement('div');
      div.className = 'reel-item';
      div.innerHTML = `<span style="font-family:var(--font-mono);font-size:11px;color:var(--accent-cyan);opacity:0.5">#</span><span>Student ${s.name}</span>`;
      dom.studentReel.appendChild(div);
    });
  }
}

// ════════════════════════════════════════════════════
//  QUESTION ENGINE
// ════════════════════════════════════════════════════

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nextQuestion() {
  if (state.questionIndex >= state.questionsOrder.length) {
    showEndScreen(); return;
  }
  return state.questionsOrder[state.questionIndex];
}

// ════════════════════════════════════════════════════
//  DATA DISPLAY
// ════════════════════════════════════════════════════

function renderData(data) {
  if (data.kind === 'json') {
    let html = `<div class="json-block">`;
    html += `<span class="json-key">// ${data.label}</span>\n[\n`;
    data.docs.forEach((doc, di) => {
      html += '  {\n';
      Object.entries(doc).forEach(([k, v]) => {
        const val = v === null
          ? `<span class="json-bool">null</span>`
          : typeof v === 'number'
          ? `<span class="json-num">${v}</span>`
          : `<span class="json-str">"${v}"</span>`;
        html += `    <span class="json-key">"${k}"</span>: ${val},\n`;
      });
      html += di < data.docs.length - 1 ? '  },\n' : '  }\n';
    });
    html += `]</div>`;
    dom.dataContent.innerHTML = html;
  } else if (data.kind === 'kv') {
    let html = `<div class="kv-block">`;
    data.pairs.forEach(p => {
      html += `<div class="kv-row"><span class="kv-key">${p.key}</span><span class="kv-arrow">→</span><span class="kv-val">${p.val}</span></div>`;
    });
    html += `</div>`;
    dom.dataContent.innerHTML = html;
  } else if (data.kind === 'table') {
    let html = `<table class="data-table"><thead><tr>`;
    data.headers.forEach(h => { html += `<th>${h}</th>`; });
    html += `</tr></thead><tbody>`;
    data.rows.forEach(row => {
      html += '<tr>';
      row.forEach(cell => { html += `<td>${cell ?? '<span style="color:var(--text-3)">null</span>'}</td>`; });
      html += '</tr>';
    });
    html += `</tbody></table>`;
    dom.dataContent.innerHTML = html;
  } else if (data.kind === 'graph') {
    let html = `<div class="graph-block">`;
    data.edges.forEach(e => {
      html += `<div class="graph-edge">
        <span class="graph-node">${e.from}</span>
        <span class="graph-arrow">──</span>
        <span class="graph-rel">${e.rel}</span>
        <span class="graph-arrow">──▶</span>
        <span class="graph-node">${e.to}</span>
      </div>`;
    });
    html += `</div>`;
    dom.dataContent.innerHTML = html;
  }
}

// ════════════════════════════════════════════════════
//  SAMPLE DATA GENERATOR
// ════════════════════════════════════════════════════

function getSampleDataForType(type) {
  if (type === 'Document') {
    return {
      kind: 'json',
      label: 'users collection',
      docs: [
        { _id: 'u001', name: 'Alice' },
        { _id: 'u002', name: 'Bob' },
        { _id: 'u003', name: 'Carol' }
      ]
    };
  } else if (type === 'Key-Value') {
    return {
      kind: 'kv',
      pairs: [
        { key: 'user1', val: 'Ravi' },
        { key: 'user2', val: 'Bob' },
        { key: 'user3', val: 'Carol' }
      ]
    };
  } else if (type === 'Column') {
    return {
      kind: 'table',
      headers: ['id', 'name', 'role'],
      rows: [
        [1, 'Alice', 'Admin'],
        [2, 'Bob', 'User'],
        [3, 'Carol', 'User']
      ]
    };
  } else if (type === 'Graph') {
    return {
      kind: 'graph',
      edges: [
        { from: 'Alice', rel: 'KNOWS', to: 'Bob' },
        { from: 'Bob', rel: 'KNOWS', to: 'Carol' },
        { from: 'Alice', rel: 'FOLLOWS', to: 'Carol' }
      ]
    };
  }
  return { kind: 'json', label: 'data', docs: [] };
}

// ════════════════════════════════════════════════════
//  OUTPUT DATA GENERATOR (Results after command)
// ════════════════════════════════════════════════════

function getOutputDataForQuestion(question) {
  const q = question.question.toLowerCase();
  const type = question.type;

  if (type === 'Document') {
    if (q.includes('insert')) {
      return {
        kind: 'json',
        label: 'users collection (after INSERT)',
        docs: [
          { _id: 'u001', name: 'Alice' },
          { _id: 'u002', name: 'Bob' },
          { _id: 'u003', name: 'Carol' },
          { _id: 'u004', name: 'Ravi' }
        ]
      };
    } else if (q.includes('update') || q.includes('age')) {
      return {
        kind: 'json',
        label: 'users collection (after UPDATE)',
        docs: [
          { _id: 'u001', name: 'Ravi', age: 22 },
          { _id: 'u002', name: 'Bob', age: 25 },
          { _id: 'u003', name: 'Carol', age: 28 }
        ]
      };
    } else if (q.includes('delete')) {
      return {
        kind: 'json',
        label: 'users collection (after DELETE)',
        docs: [
          { _id: 'u001', name: 'Alice' },
          { _id: 'u002', name: 'Bob' }
        ]
      };
    }
  } else if (type === 'Key-Value') {
    if (q.includes('add') || q.includes('key-value')) {
      return {
        kind: 'kv',
        pairs: [
          { key: 'user1', val: 'Ravi' },
          { key: 'user2', val: 'Bob' },
          { key: 'user3', val: 'Carol' }
        ]
      };
    } else if (q.includes('update')) {
      return {
        kind: 'kv',
        pairs: [
          { key: 'user1', val: 'Arun' },
          { key: 'user2', val: 'Bob' },
          { key: 'user3', val: 'Carol' }
        ]
      };
    } else if (q.includes('delete')) {
      return {
        kind: 'kv',
        pairs: [
          { key: 'user2', val: 'Bob' },
          { key: 'user3', val: 'Carol' }
        ]
      };
    }
  } else if (type === 'Column') {
    if (q.includes('insert')) {
      return {
        kind: 'table',
        headers: ['id', 'name', 'role'],
        rows: [
          [1, 'Ravi', 'User'],
          [2, 'Alice', 'Admin'],
          [3, 'Bob', 'User'],
          [4, 'Carol', 'User']
        ]
      };
    } else if (q.includes('update')) {
      return {
        kind: 'table',
        headers: ['id', 'name', 'role'],
        rows: [
          [1, 'Arun', 'User'],
          [2, 'Alice', 'Admin'],
          [3, 'Bob', 'User']
        ]
      };
    }
  } else if (type === 'Graph') {
    if (q.includes('node')) {
      return {
        kind: 'graph',
        edges: [
          { from: 'Alice', rel: 'KNOWS', to: 'Bob' },
          { from: 'Bob', rel: 'KNOWS', to: 'Carol' },
          { from: 'Ravi', rel: 'KNOWS', to: 'Alice' }
        ]
      };
    } else if (q.includes('relationship')) {
      return {
        kind: 'graph',
        edges: [
          { from: 'a', rel: 'FOLLOWS', to: 'b' },
          { from: 'Alice', rel: 'KNOWS', to: 'Bob' },
          { from: 'Bob', rel: 'KNOWS', to: 'Carol' }
        ]
      };
    }
  }

  return getSampleDataForType(type);
}

// ════════════════════════════════════════════════════
//  QUIZ SCREEN
// ════════════════════════════════════════════════════

function loadQuiz() {
  const q = nextQuestion();
  if (!q) { showEndScreen(); return; }
  state.currentQuestion = q;
  state.answered = false;

  // Fill challenger info
  dom.challengerAvatar.textContent = '#';
  dom.challengerName.textContent   = `Student ${state.selectedStudent.name}`;

  // DB badge
  dom.dbIcon.textContent = DB_ICONS[q.type] || '💾';
  dom.dbType.textContent = q.type;

  // Question
  dom.questionText.textContent = q.question;

  // Data based on question type
  const sampleData = getSampleDataForType(q.type);
  renderData(sampleData);

  // Options
  dom.optionsGrid.innerHTML = '';
  const labels = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.dataset.index = i;
    btn.innerHTML = `<span class="option-label">${labels[i]}</span><span>${opt.text}</span>`;
    btn.addEventListener('click', () => handleOptionClick(i));
    dom.optionsGrid.appendChild(btn);
  });

  // Terminal reset
  dom.terminalBody.innerHTML = `
    <div class="terminal-line dim">
      <span class="prompt">$</span> Awaiting command selection... <span class="cursor"></span>
    </div>`;

  // Result / Next
  dom.resultBadge.className = 'result-badge hidden';
  dom.resultBadge.textContent = '';
  dom.nextBtn.classList.add('hidden');

  // Counter
  dom.questionCounter.textContent = `${state.questionIndex + 1} / ${state.questionsOrder.length}`;

  // Timer
  startTimer();
}

function selectAnswer(chosenIdx) {
  if (state.answered) return;
  state.answered = true;
  clearTimer();

  const q = state.currentQuestion;
  const correctIdx = q.options.findIndex(opt => opt.correct === true);
  const correct = chosenIdx === correctIdx;

  // Disable all buttons, highlight
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i === correctIdx) btn.classList.add('correct');
    else if (i === chosenIdx && !correct) btn.classList.add('wrong');
  });

  // Terminal output
  typeTerminal(q, chosenIdx, correct);

  // Show output data (always show output after answering)
  setTimeout(() => {
    const outputData = getOutputDataForQuestion(q);
    renderData(outputData);
  }, 600);

  // Result badge
  dom.resultBadge.className = `result-badge ${correct ? 'correct' : 'wrong'}`;
  dom.resultBadge.textContent = correct
    ? '✔ Correct! +1 point'
    : '✖ Wrong answer';

  // Score
  if (correct) {
    state.score++;
    dom.scoreDisplay.textContent = state.score;
  }

  // Next
  dom.nextBtn.classList.remove('hidden');

  // Advance index
  state.questionIndex++;
}

// ════════════════════════════════════════════════════
//  TERMINAL TYPING ANIMATION
// ════════════════════════════════════════════════════

function typeTerminal(q, chosenIdx, correct) {
  const body = dom.terminalBody;
  body.innerHTML = '';

  const chosenCmd = q.options[chosenIdx].text;
  const correctIdx = q.options.findIndex(opt => opt.correct === true);
  const correctCmd = q.options[correctIdx].text;
  
  // Line 1: User's command
  const promptLine = document.createElement('div');
  promptLine.className = 'terminal-line cmd';
  promptLine.innerHTML = `<span class="prompt">$</span><span id="typeTarget"></span><span class="cursor" id="typeCursor"></span>`;
  body.appendChild(promptLine);

  let i = 0;
  const target = document.getElementById('typeTarget');

  function typeChar() {
    if (i < chosenCmd.length) {
      target.textContent += chosenCmd[i++];
      setTimeout(typeChar, 18 + Math.random() * 12);
    } else {
      // Remove cursor, add result
      document.getElementById('typeCursor')?.remove();
      setTimeout(() => {
        // Show result
        const resultLine = document.createElement('div');
        resultLine.className = `terminal-line ${correct ? 'success' : 'error'}`;
        const resultMsg = correct 
          ? '✔ Command executed successfully!'
          : '✖ Error: Invalid command syntax';
        resultLine.innerHTML = `<span>${resultMsg}</span>`;
        body.appendChild(resultLine);

        // If wrong, show the correct answer
        if (!correct) {
          setTimeout(() => {
            const correctLine = document.createElement('div');
            correctLine.className = 'terminal-line dim';
            correctLine.innerHTML = `<span class="prompt">→</span> <span style="color:#10b981">Correct: ${correctCmd}</span>`;
            body.appendChild(correctLine);
          }, 300);
        }
      }, 400);
    }
  }
  typeChar();
}

// ════════════════════════════════════════════════════
//  TIMER
// ════════════════════════════════════════════════════

function startTimer() {
  state.timeLeft = 30;
  dom.timerDisplay.textContent = 30;
  dom.timerPill.style.display = 'flex';
  dom.timerPill.classList.remove('urgent');

  clearInterval(state.timer);
  state.timer = setInterval(() => {
    state.timeLeft--;
    dom.timerDisplay.textContent = state.timeLeft;
    if (state.timeLeft <= 10) dom.timerPill.classList.add('urgent');
    if (state.timeLeft <= 0) {
      clearInterval(state.timer);
      if (!state.answered) {
        timeUp();
      }
    }
  }, 1000);
}

function clearTimer() {
  clearInterval(state.timer);
  dom.timerPill.style.display = 'none';
  dom.timerPill.classList.remove('urgent');
}

function timeUp() {
  state.answered = true;
  const q = state.currentQuestion;
  const correctIdx = q.options.findIndex(opt => opt.correct === true);

  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i === correctIdx) btn.classList.add('correct');
  });

  dom.terminalBody.innerHTML = `
    <div class="terminal-line error"><span>⏱ Time's up! The correct command was highlighted.</span></div>`;

  dom.resultBadge.className = 'result-badge wrong';
  dom.resultBadge.textContent = '⏱ Time\'s up! No point awarded.';
  dom.nextBtn.classList.remove('hidden');
  state.questionIndex++;
}

// ════════════════════════════════════════════════════
//  SCREEN MANAGEMENT
// ════════════════════════════════════════════════════

function showScreen(name) {
  [dom.spinnerScreen, dom.quizScreen, dom.endScreen].forEach(s => s.classList.add('hidden'));
  const map = { spinner: dom.spinnerScreen, quiz: dom.quizScreen, end: dom.endScreen };
  map[name].classList.remove('hidden');
}

function showEndScreen() {
  clearTimer();
  showScreen('end');
  dom.finalScore.textContent = `${state.score}`;
  document.getElementById('endScoreMax').textContent = `/ ${state.questionsOrder.length}`;
  const pct = state.score / state.questionsOrder.length;
  let grade, msg;
  if (pct === 1)       { grade = 'S  — PERFECT'; msg = 'Flawless execution. You own the database layer!'; }
  else if (pct >= 0.75){ grade = 'A  — EXCELLENT'; msg = 'Outstanding performance. Nearly unbeatable!'; }
  else if (pct >= 0.5) { grade = 'B  — GOOD'; msg = 'Solid understanding. Keep pushing your limits.'; }
  else if (pct >= 0.25){ grade = 'C  — NEEDS WORK'; msg = 'Review the concepts and try again.'; }
  else                 { grade = 'D  — RETRY'; msg = 'Hit the docs and come back stronger!'; }
  dom.endGrade.textContent   = grade;
  dom.endMessage.textContent = msg;
}

function resetGame() {
  clearTimer();
  state.score         = 0;
  state.questionIndex = 0;
  state.questionsOrder = shuffleArray(QUESTIONS);
  state.selectedStudent = null;
  state.answered      = false;
  dom.scoreDisplay.textContent    = '0';
  dom.questionCounter.textContent = `0 / ${state.questionsOrder.length}`;
  dom.selectedBadge.style.opacity = '0';
  dom.startBtn.disabled = true;
  showScreen('spinner');
}

// ════════════════════════════════════════════════════
//  SOUND (Web Audio API — minimal)
// ════════════════════════════════════════════════════

let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, type, duration, vol = 0.08) {
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(); osc.stop(ctx.currentTime + duration);
  } catch(_) {}
}

function playSuccess() {
  playTone(523, 'sine', 0.15, 0.1);
  setTimeout(() => playTone(659, 'sine', 0.2, 0.1), 120);
  setTimeout(() => playTone(784, 'sine', 0.3, 0.1), 240);
}

function playError() {
  playTone(200, 'sawtooth', 0.2, 0.08);
  setTimeout(() => playTone(150, 'sawtooth', 0.25, 0.08), 180);
}

function playSpin() {
  playTone(440, 'square', 0.05, 0.04);
}

// ════════════════════════════════════════════════════
//  EVENT LISTENERS
// ════════════════════════════════════════════════════

dom.spinBtn.addEventListener('click', () => {
  playSpin();
  spinWheel();
});

dom.startBtn.addEventListener('click', () => {
  showScreen('quiz');
  loadQuiz();
});

dom.nextBtn.addEventListener('click', () => {
  clearTimer();
  if (state.questionIndex >= state.questionsOrder.length) {
    showEndScreen();
  } else {
    showScreen('spinner');
    dom.selectedBadge.style.opacity = '0';
    dom.startBtn.disabled = true;
  }
});

dom.resetBtn.addEventListener('click', () => { resetGame(); });
dom.playAgainBtn.addEventListener('click', () => { resetGame(); });

// Sound wrapper called from option click
function handleOptionClick(i) {
  if (state.answered) return;
  const correct = i === state.currentQuestion.correct;
  if (correct) playSuccess(); else playError();
  selectAnswer(i);
}

// ════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════

function init() {
  state.questionsOrder = shuffleArray(QUESTIONS);
  dom.questionCounter.textContent = `0 / ${state.questionsOrder.length}`;
  buildReel();
  drawWheel(wheelAngle);
}

init();
