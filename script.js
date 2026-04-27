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
  // ── Document (MongoDB) ──
  {
    type: 'Document',
    text: 'You need to insert a new product document into the "products" collection. The product is a "Wireless Keyboard" with a price of 49.99 and stock of 150 units. Which command is correct?',
    data: { kind: 'json', label: 'products collection', docs: [
      { _id: 'p001', name: 'USB Mouse', price: 19.99, stock: 300 },
      { _id: 'p002', name: 'HDMI Cable', price: 9.99, stock: 500 },
    ]},
    options: [
      'db.products.insertOne({ name: "Wireless Keyboard", price: 49.99, stock: 150 })',
      'db.products.addDocument({ name: "Wireless Keyboard", price: 49.99, stock: 150 })',
      'db.products.push({ name: "Wireless Keyboard", price: 49.99 })',
      'db.insert("products", { name: "Wireless Keyboard" })',
    ],
    correct: 0,
    terminalCmd: 'db.products.insertOne({ name: "Wireless Keyboard", price: 49.99, stock: 150 })',
    terminalSuccess: '{ acknowledged: true, insertedId: ObjectId("64a2b...") }',
    terminalError: 'TypeError: db.products.addDocument is not a function',
  },
  {
    type: 'Document',
    text: 'Update the price of the USB Mouse (id: "p001") from 19.99 to 24.99. The stock should remain unchanged. Which command performs this correctly?',
    data: { kind: 'json', label: 'products collection', docs: [
      { _id: 'p001', name: 'USB Mouse', price: 19.99, stock: 300 },
      { _id: 'p002', name: 'HDMI Cable', price: 9.99, stock: 500 },
    ]},
    options: [
      'db.products.update({ _id: "p001" }, { price: 24.99 })',
      'db.products.updateOne({ _id: "p001" }, { $set: { price: 24.99 } })',
      'db.products.edit({ _id: "p001" }, { price: 24.99 })',
      'db.products.modify("p001", "price", 24.99)',
    ],
    correct: 1,
    terminalCmd: 'db.products.updateOne({ _id: "p001" }, { $set: { price: 24.99 } })',
    terminalSuccess: '{ acknowledged: true, matchedCount: 1, modifiedCount: 1 }',
    terminalError: 'SyntaxError: $set operator expected but got plain object',
  },
  {
    type: 'Document',
    text: 'Delete all documents in the "logs" collection where the status field equals "expired". Which command accomplishes this?',
    data: { kind: 'json', label: 'logs collection', docs: [
      { _id: 'l001', event: 'login', status: 'active' },
      { _id: 'l002', event: 'logout', status: 'expired' },
      { _id: 'l003', event: 'purchase', status: 'expired' },
    ]},
    options: [
      'db.logs.remove({ status: "expired" })',
      'db.logs.deleteMany({ status: "expired" })',
      'db.logs.drop({ status: "expired" })',
      'db.logs.erase({ status: "expired" })',
    ],
    correct: 1,
    terminalCmd: 'db.logs.deleteMany({ status: "expired" })',
    terminalSuccess: '{ acknowledged: true, deletedCount: 2 }',
    terminalError: 'TypeError: db.logs.erase is not a function',
  },

  // ── Key-Value (Redis) ──
  {
    type: 'Key-Value',
    text: 'Set a key "session:user42" with the value "authenticated" in Redis, and make it expire automatically after 3600 seconds. Which command is correct?',
    data: { kind: 'kv', pairs: [
      { key: 'session:user10', val: 'authenticated' },
      { key: 'session:user31', val: 'guest' },
      { key: 'cache:home',     val: '<html>...</html>' },
    ]},
    options: [
      'SET session:user42 "authenticated" EXPIRE 3600',
      'SET session:user42 "authenticated" EX 3600',
      'INSERT session:user42 "authenticated" TTL 3600',
      'PUT session:user42 "authenticated" TIMEOUT 3600',
    ],
    correct: 1,
    terminalCmd: 'SET session:user42 "authenticated" EX 3600',
    terminalSuccess: 'OK',
    terminalError: 'ERR syntax error near "EXPIRE"',
  },
  {
    type: 'Key-Value',
    text: 'Delete the key "cache:home" from the Redis store to force a cache refresh. Which command does this?',
    data: { kind: 'kv', pairs: [
      { key: 'session:user10', val: 'authenticated' },
      { key: 'cache:home',     val: '<html>...</html>' },
      { key: 'cache:about',    val: '<html>...</html>' },
    ]},
    options: [
      'REMOVE cache:home',
      'DEL cache:home',
      'UNSET cache:home',
      'DROP KEY cache:home',
    ],
    correct: 1,
    terminalCmd: 'DEL cache:home',
    terminalSuccess: '(integer) 1',
    terminalError: 'ERR unknown command "REMOVE"',
  },

  // ── Column (Cassandra) ──
  {
    type: 'Column',
    text: 'Insert a new row for user "alice" into the "users" table in the "ks_app" keyspace. Include email and age values. Which CQL command is correct?',
    data: { kind: 'table', headers: ['user_id','email','age','country'], rows: [
      ['bob',   'bob@mail.com',   28, 'US'],
      ['carol', 'carol@mail.com', 34, 'UK'],
    ]},
    options: [
      'INSERT INTO ks_app.users (user_id, email, age) VALUES (\'alice\', \'alice@mail.com\', 25)',
      'db.ks_app.users.insertOne({ user_id: "alice", email: "alice@mail.com", age: 25 })',
      'ADD ROW ks_app.users (user_id=\'alice\', email=\'alice@mail.com\')',
      'PUT ks_app.users WHERE user_id=\'alice\'',
    ],
    correct: 0,
    terminalCmd: "INSERT INTO ks_app.users (user_id, email, age) VALUES ('alice', 'alice@mail.com', 25)",
    terminalSuccess: '[applied] true  (1 row)',
    terminalError: 'SyntaxError: Invalid CQL near "db.ks_app"',
  },
  {
    type: 'Column',
    text: 'Update the country field to "CA" for user "bob" in the Cassandra "users" table. Which command is correct?',
    data: { kind: 'table', headers: ['user_id','email','age','country'], rows: [
      ['bob',   'bob@mail.com',   28, 'US'],
      ['carol', 'carol@mail.com', 34, 'UK'],
      ['alice', 'alice@mail.com', 25, null ],
    ]},
    options: [
      "UPDATE ks_app.users SET country = 'CA' WHERE user_id = 'bob'",
      "MODIFY ks_app.users SET country='CA' FOR user_id='bob'",
      "db.users.update({ user_id:'bob'}, { $set: { country:'CA' }})",
      "ALTER ROW ks_app.users country='CA' WHERE id='bob'",
    ],
    correct: 0,
    terminalCmd: "UPDATE ks_app.users SET country = 'CA' WHERE user_id = 'bob'",
    terminalSuccess: '[applied] true  (1 row)',
    terminalError: "SyntaxError: Invalid CQL near 'MODIFY'",
  },

  // ── Graph (Neo4j) ──
  {
    type: 'Graph',
    text: 'Create a new node for a Person named "David" and link him to the existing "TechCorp" company node with a WORKS_AT relationship. Which Cypher command is correct?',
    data: { kind: 'graph', edges: [
      { from: 'Alice',   rel: 'WORKS_AT', to: 'TechCorp' },
      { from: 'Bob',     rel: 'WORKS_AT', to: 'TechCorp' },
      { from: 'Alice',   rel: 'KNOWS',    to: 'Bob'      },
    ]},
    options: [
      'MATCH (c:Company {name:"TechCorp"}) CREATE (p:Person {name:"David"})-[:WORKS_AT]->(c)',
      'INSERT (:Person {name:"David"})-[:WORKS_AT]->(:Company {name:"TechCorp"})',
      'ADD NODE Person("David") RELATE TechCorp WORKS_AT',
      'db.graph.addNode("David").linkTo("TechCorp","WORKS_AT")',
    ],
    correct: 0,
    terminalCmd: 'MATCH (c:Company {name:"TechCorp"}) CREATE (p:Person {name:"David"})-[:WORKS_AT]->(c)',
    terminalSuccess: 'Nodes created: 1  Relationships created: 1  Properties set: 1',
    terminalError: "SyntaxError: Invalid Cypher — 'INSERT' is not valid here",
  },
  {
    type: 'Graph',
    text: 'Delete the KNOWS relationship between Alice and Bob in the Neo4j graph, without deleting either node. Which Cypher command is correct?',
    data: { kind: 'graph', edges: [
      { from: 'Alice', rel: 'WORKS_AT', to: 'TechCorp' },
      { from: 'Bob',   rel: 'WORKS_AT', to: 'TechCorp' },
      { from: 'Alice', rel: 'KNOWS',    to: 'Bob'      },
      { from: 'David', rel: 'WORKS_AT', to: 'TechCorp' },
    ]},
    options: [
      "MATCH (:Person {name:'Alice'})-[r:KNOWS]->(:Person {name:'Bob'}) DELETE r",
      "DELETE RELATIONSHIP KNOWS BETWEEN Alice AND Bob",
      "REMOVE EDGE KNOWS FROM Alice TO Bob",
      "MATCH (a)-[r:KNOWS]->(b) DETACH DELETE a, b",
    ],
    correct: 0,
    terminalCmd: "MATCH (:Person {name:'Alice'})-[r:KNOWS]->(:Person {name:'Bob'}) DELETE r",
    terminalSuccess: 'Relationships deleted: 1  (nodes untouched)',
    terminalError: "SyntaxError: Invalid Cypher near 'DELETE RELATIONSHIP'",
  },

  // ════════════════ 10 NEW CONCEPT QUESTIONS ════════════════

  // Q9 — NoSQL Concept: CAP Theorem
  {
    type: 'Document',
    text: 'According to the CAP Theorem, a distributed NoSQL system can only guarantee TWO of three properties simultaneously. Which set of three properties does the CAP Theorem refer to?',
    data: { kind: 'kv', pairs: [
      { key: 'CAP Property 1', val: '???' },
      { key: 'CAP Property 2', val: '???' },
      { key: 'CAP Property 3', val: '???' },
    ]},
    options: [
      'Consistency, Availability, Partition Tolerance',
      'Concurrency, Atomicity, Performance',
      'Caching, Availability, Persistence',
      'Consistency, Atomicity, Partition Tolerance',
    ],
    correct: 0,
    terminalCmd: 'explain CAP_THEOREM',
    terminalSuccess: 'CAP = Consistency + Availability + Partition Tolerance (pick 2)',
    terminalError: 'ERR: "Concurrency" is not a CAP property',
  },

  // Q10 — NoSQL Concept: BASE vs ACID
  {
    type: 'Key-Value',
    text: 'NoSQL databases often follow the BASE model instead of ACID. What does BASE stand for?',
    data: { kind: 'kv', pairs: [
      { key: 'ACID model', val: 'Atomicity, Consistency, Isolation, Durability' },
      { key: 'BASE model', val: '???' },
    ]},
    options: [
      'Basically Available, Soft state, Eventual consistency',
      'Binary Access, Stored Events, Eventual consistency',
      'Basically Available, Structured data, Exact consistency',
      'Batch Access, Soft state, Extended consistency',
    ],
    correct: 0,
    terminalCmd: 'explain BASE_MODEL',
    terminalSuccess: 'BASE: Basically Available, Soft state, Eventual consistency ✔',
    terminalError: 'ERR: "Binary Access" is not a BASE component',
  },

  // Q11 — NoSQL Concept: Sharding
  {
    type: 'Column',
    text: 'A Cassandra cluster is handling millions of rows and performance is degrading. The team decides to distribute data across multiple nodes by splitting it based on a partition key. What is this technique called?',
    data: { kind: 'table', headers: ['Node', 'Partition Key Range', 'Row Count'], rows: [
      ['Node-1', '0 – 33%',  '3.2M'],
      ['Node-2', '34 – 66%', '3.1M'],
      ['Node-3', '67 – 100%','3.3M'],
    ]},
    options: [
      'Replication',
      'Indexing',
      'Sharding (Partitioning)',
      'Caching',
    ],
    correct: 2,
    terminalCmd: 'nodetool status --shard-info',
    terminalSuccess: 'Sharding active: 3 nodes, partition key = user_id hash',
    terminalError: 'ERR: "Replication" copies data, does not split it',
  },

  // Q12 — NoSQL Concept: Eventual Consistency
  {
    type: 'Key-Value',
    text: 'A Redis cluster is set up with replication. A write is made to the primary node. A client immediately reads from a replica node and gets the OLD value, but 200ms later gets the NEW value. Which NoSQL consistency model does this describe?',
    data: { kind: 'kv', pairs: [
      { key: 'Primary write', val: '"status" → "active"  (t=0ms)' },
      { key: 'Replica read',  val: '"status" → "inactive" (t=10ms)' },
      { key: 'Replica read',  val: '"status" → "active"   (t=210ms)' },
    ]},
    options: [
      'Strong Consistency',
      'Eventual Consistency',
      'Linearizability',
      'Strict Serializability',
    ],
    correct: 1,
    terminalCmd: 'GET status  # reading replica after 10ms',
    terminalSuccess: '"inactive"  ← stale read — eventual consistency in action',
    terminalError: 'ERR: Strong consistency would never return a stale value',
  },

  // Q13 — NoSQL Concept: Document vs Relational
  {
    type: 'Document',
    text: 'A developer is migrating from a relational SQL database to MongoDB. In SQL, data is stored in tables with fixed schemas. What is the MongoDB equivalent of a SQL TABLE?',
    data: { kind: 'json', label: 'MongoDB structure', docs: [
      { SQL_concept: 'Database', MongoDB_equivalent: 'Database' },
      { SQL_concept: 'Table',    MongoDB_equivalent: '???' },
      { SQL_concept: 'Row',      MongoDB_equivalent: 'Document' },
      { SQL_concept: 'Column',   MongoDB_equivalent: 'Field' },
    ]},
    options: [
      'Collection',
      'Bucket',
      'Namespace',
      'Schema',
    ],
    correct: 0,
    terminalCmd: 'db.getCollectionNames()',
    terminalSuccess: '[ "users", "products", "orders" ]  ← these are your "tables"',
    terminalError: 'ERR: "Bucket" is an S3/Couchbase term, not MongoDB',
  },

  // Q14 — NoSQL Concept: MongoDB Aggregation
  {
    type: 'Document',
    text: 'You want to count how many orders exist per customer in the "orders" collection and sort the result from most to least orders. Which MongoDB aggregation pipeline is correct?',
    data: { kind: 'json', label: 'orders collection', docs: [
      { _id: 'o1', customer: 'alice', amount: 120 },
      { _id: 'o2', customer: 'bob',   amount: 85  },
      { _id: 'o3', customer: 'alice', amount: 200 },
    ]},
    options: [
      'db.orders.aggregate([{ $group: { _id: "$customer", total: { $sum: 1 } } }, { $sort: { total: -1 } }])',
      'db.orders.count().groupBy("customer").sort(-1)',
      'SELECT customer, COUNT(*) FROM orders GROUP BY customer ORDER BY COUNT DESC',
      'db.orders.find().group({ customer: 1 }).sort({ count: -1 })',
    ],
    correct: 0,
    terminalCmd: 'db.orders.aggregate([{ $group: { _id: "$customer", total: { $sum: 1 } } }, { $sort: { total: -1 } }])',
    terminalSuccess: '[{ _id: "alice", total: 2 }, { _id: "bob", total: 1 }]',
    terminalError: 'ERR: SQL syntax is not valid in MongoDB aggregation pipeline',
  },

  // Q15 — NoSQL Concept: Redis Data Structures
  {
    type: 'Key-Value',
    text: 'You need to store a leaderboard in Redis where player scores are automatically ranked. Which Redis data structure is BEST suited for this use case?',
    data: { kind: 'kv', pairs: [
      { key: 'String',   val: 'Simple key → value storage' },
      { key: 'List',     val: 'Ordered sequence, push/pop' },
      { key: 'Hash',     val: 'Field → value map (like a dict)' },
      { key: 'Sorted Set', val: 'Members with scores, auto-ranked' },
    ]},
    options: [
      'String',
      'List',
      'Hash',
      'Sorted Set (ZADD)',
    ],
    correct: 3,
    terminalCmd: 'ZADD leaderboard 9800 "alice"  5400 "bob"  7200 "carol"',
    terminalSuccess: '(integer) 3  →  ZRANGE leaderboard 0 -1 WITHSCORES returns ranked list',
    terminalError: 'ERR: List has no automatic ranking by score',
  },

  // Q16 — NoSQL Concept: Cassandra Partition Key
  {
    type: 'Column',
    text: 'In Cassandra, when creating a table to store sensor readings, which column should be chosen as the PARTITION KEY to ensure readings from the same sensor are stored on the same node?',
    data: { kind: 'table', headers: ['reading_id', 'sensor_id', 'temperature', 'recorded_at'], rows: [
      ['r001', 'sensor-A', '22.5°C', '2024-01-01 08:00'],
      ['r002', 'sensor-A', '23.1°C', '2024-01-01 09:00'],
      ['r003', 'sensor-B', '19.8°C', '2024-01-01 08:00'],
    ]},
    options: [
      'reading_id  (unique per row)',
      'sensor_id   (groups related rows together)',
      'temperature (frequently queried value)',
      'recorded_at (time-based ordering)',
    ],
    correct: 1,
    terminalCmd: "CREATE TABLE readings (sensor_id TEXT, recorded_at TIMESTAMP, temp FLOAT, PRIMARY KEY (sensor_id, recorded_at))",
    terminalSuccess: 'Table created. Partition key: sensor_id — all readings per sensor co-located.',
    terminalError: 'ERR: reading_id as partition key would spread single-sensor data across all nodes',
  },

  // Q17 — NoSQL Concept: Neo4j MATCH query
  {
    type: 'Graph',
    text: 'In a Neo4j social network graph, you want to find all people that "Alice" FOLLOWS. Which Cypher query correctly retrieves their names?',
    data: { kind: 'graph', edges: [
      { from: 'Alice', rel: 'FOLLOWS', to: 'Bob'   },
      { from: 'Alice', rel: 'FOLLOWS', to: 'Carol'  },
      { from: 'Bob',   rel: 'FOLLOWS', to: 'David'  },
    ]},
    options: [
      "MATCH (:Person {name:'Alice'})-[:FOLLOWS]->(p) RETURN p.name",
      "SELECT name FROM persons WHERE follower = 'Alice'",
      "FIND (Alice)-[FOLLOWS]->(?) RETURN name",
      "GET FOLLOWS FROM Alice RETURN names",
    ],
    correct: 0,
    terminalCmd: "MATCH (:Person {name:'Alice'})-[:FOLLOWS]->(p) RETURN p.name",
    terminalSuccess: '╔══════════╗\n║ p.name   ║\n╠══════════╣\n║ "Bob"    ║\n║ "Carol"  ║\n╚══════════╝',
    terminalError: "SyntaxError: SQL SELECT is not valid Cypher",
  },

  // Q18 — NoSQL Concept: NoSQL Types Classification
  {
    type: 'Document',
    text: 'A team is building a product recommendation engine that needs to traverse complex relationships between users, products, and categories to find patterns. Which NoSQL database TYPE is the BEST architectural fit?',
    data: { kind: 'graph', edges: [
      { from: 'User:Alice',    rel: 'BOUGHT',      to: 'Product:Laptop' },
      { from: 'Product:Laptop',rel: 'BELONGS_TO',  to: 'Category:Tech'  },
      { from: 'User:Bob',      rel: 'INTERESTED_IN',to: 'Category:Tech'  },
    ]},
    options: [
      'Key-Value Store (e.g. Redis) — fast lookups',
      'Document Store (e.g. MongoDB) — flexible schema',
      'Column Store (e.g. Cassandra) — time-series writes',
      'Graph Database (e.g. Neo4j) — relationship traversal',
    ],
    correct: 3,
    terminalCmd: 'MATCH (u:User)-[:BOUGHT]->(:Product)-[:BELONGS_TO]->(c:Category)<-[:INTERESTED_IN]-(rec:User) RETURN rec.name',
    terminalSuccess: 'Recommended users found via 3-hop graph traversal: ["Bob"]',
    terminalError: 'ERR: Key-Value stores cannot efficiently traverse multi-hop relationships',
  },
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
  dom.questionText.textContent = q.text;

  // Data
  renderData(q.data);

  // Options
  dom.optionsGrid.innerHTML = '';
  const labels = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.dataset.index = i;
    btn.innerHTML = `<span class="option-label">${labels[i]}</span><span>${opt}</span>`;
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
  const correct = chosenIdx === q.correct;

  // Disable all buttons, highlight
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add('correct');
    else if (i === chosenIdx && !correct) btn.classList.add('wrong');
  });

  // Terminal output
  typeTerminal(q, chosenIdx, correct);

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

  const cmdText = q.options[chosenIdx];
  const result  = correct ? `✔ ${q.terminalSuccess}` : `✖ ${q.terminalError}`;
  const cls     = correct ? 'success' : 'error';

  // Line 1: prompt
  const promptLine = document.createElement('div');
  promptLine.className = 'terminal-line cmd';
  promptLine.innerHTML = `<span class="prompt">$</span><span id="typeTarget"></span><span class="cursor" id="typeCursor"></span>`;
  body.appendChild(promptLine);

  let i = 0;
  const target = document.getElementById('typeTarget');

  function typeChar() {
    if (i < cmdText.length) {
      target.textContent += cmdText[i++];
      setTimeout(typeChar, 18 + Math.random() * 12);
    } else {
      // Remove cursor, add result
      document.getElementById('typeCursor')?.remove();
      setTimeout(() => {
        const resultLine = document.createElement('div');
        resultLine.className = `terminal-line ${cls}`;
        resultLine.innerHTML = `<span>${result}</span>`;
        body.appendChild(resultLine);

        if (correct) {
          // Also show "canonical" command if different
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

  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add('correct');
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
