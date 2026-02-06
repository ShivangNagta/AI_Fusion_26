import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from project root (parent directory)
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
// Also try .env as fallback
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

console.log('GEMINI_API_KEY loaded:', GEMINI_API_KEY ? 'Yes (length: ' + GEMINI_API_KEY.length + ')' : 'No');

const DB_PATH = path.join(__dirname, 'db', 'nexus.sqlite');

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

const aiClient = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const nowIso = () => new Date().toISOString();

const seedIfEmpty = async () => {
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    const adminHash = await bcrypt.hash('pass123', 10);
    const studentHash = await bcrypt.hash('pass123', 10);
    await db.run(
      'INSERT INTO users (email, username, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?)\n' +
      ' , (?, ?, ?, ?, ?)',
      'admin@campus.edu',
      'admin',
      'admin',
      adminHash,
      nowIso(),
      'student@campus.edu',
      'student',
      'student',
      studentHash,
      nowIso()
    );
  }

  const announcementCount = await db.get('SELECT COUNT(*) as count FROM announcements');
  if (announcementCount.count === 0) {
    await db.run(
      'INSERT INTO announcements (title, body, category, priority, event_at, created_at) VALUES\n' +
      ' (?, ?, ?, ?, ?, ?),\n' +
      ' (?, ?, ?, ?, ?, ?),\n' +
      ' (?, ?, ?, ?, ?, ?)',
      'Hackathon Registration Extended',
      'Deadline moved to Friday 6 PM. Submit your team details by then.',
      'event',
      'medium',
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      nowIso(),
      'Library Maintenance',
      'Reading hall B will be unavailable Saturday 10 AM - 2 PM.',
      'admin',
      'high',
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      nowIso(),
      'Sports Trials',
      'Open trials for basketball and football this weekend.',
      'event',
      'low',
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      nowIso()
    );
  }

  const messCount = await db.get('SELECT COUNT(*) as count FROM mess_menu');
  if (messCount.count === 0) {
    const today = new Date().toISOString().slice(0, 10);
    await db.run(
      'INSERT INTO mess_menu (date, meal, item, calories, tags, rating) VALUES\n' +
      ' (?, ?, ?, ?, ?, ?),\n' +
      ' (?, ?, ?, ?, ?, ?),\n' +
      ' (?, ?, ?, ?, ?, ?),\n' +
      ' (?, ?, ?, ?, ?, ?)',
      today,
      'breakfast',
      'Poha, Chai, Banana',
      420,
      'veg,gluten-free',
      4.3,
      today,
      'lunch',
      'Paneer Butter Masala, Rice, Dal Fry',
      720,
      'veg,nut-free',
      4.5,
      today,
      'snack',
      'Samosa, Mint Chutney',
      310,
      'veg',
      4.1,
      today,
      'dinner',
      'Mix Veg, Chapati, Kheer',
      680,
      'veg',
      4.2
    );
  }

  const lostCount = await db.get('SELECT COUNT(*) as count FROM lost_found');
  if (lostCount.count === 0) {
    await db.run(
      'INSERT INTO lost_found (type, title, description, location, contact, status, created_at) VALUES\n' +
      ' (?, ?, ?, ?, ?, ?, ?),\n' +
      ' (?, ?, ?, ?, ?, ?, ?)',
      'lost',
      'Blue Water Bottle',
      'Metal bottle with stickers. Lost near library.',
      'Library',
      'student@campus.edu',
      'open',
      nowIso(),
      'found',
      'Student ID Card',
      'Found near gym entrance. Name: Rahul.',
      'Gym',
      'security@campus.edu',
      'open',
      nowIso()
    );
  }

  const marketCount = await db.get('SELECT COUNT(*) as count FROM marketplace');
  if (marketCount.count === 0) {
    await db.run(
      'INSERT INTO marketplace (title, description, price, category, seller, contact, item_condition, created_at) VALUES\n' +
      ' (?, ?, ?, ?, ?, ?, ?, ?),\n' +
      ' (?, ?, ?, ?, ?, ?, ?, ?)',
      'Graphing Calculator',
      'Casio FX-991ES, lightly used.',
      900,
      'electronics',
      'Priya S',
      'priya@campus.edu',
      'good',
      nowIso(),
      'Wooden Study Table',
      'Foldable table, no scratches.',
      1200,
      'furniture',
      'Arjun K',
      'arjun@campus.edu',
      'excellent',
      nowIso()
    );
  }

  const travelCount = await db.get('SELECT COUNT(*) as count FROM travel_shares');
  if (travelCount.count === 0) {
    await db.run(
      'INSERT INTO travel_shares (destination, depart_at, seats, notes, contact, created_at) VALUES\n' +
      ' (?, ?, ?, ?, ?, ?),\n' +
      ' (?, ?, ?, ?, ?, ?)',
      'Chandigarh',
      new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      2,
      'Leaving after evening class. Shared cab from main gate.',
      'student@campus.edu',
      nowIso(),
      'Delhi',
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      3,
      'Overnight bus. Can coordinate pickup.',
      'admin@campus.edu',
      nowIso()
    );
  }

  const nearbyCount = await db.get('SELECT COUNT(*) as count FROM nearby_places');
  if (nearbyCount.count === 0) {
    // Real IIT Ropar nearby places and campus locations
    await db.run(
      'INSERT INTO nearby_places (name, vibe_tags, distance_km, rating, price_level, open_now, description, category, coordinates) VALUES ' +
      '(?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
      '(?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
      '(?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
      '(?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
      '(?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
      '(?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
      '(?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
      '(?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
      '(?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
      '(?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
      '(?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
      '(?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
      '(?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
      '(?, ?, ?, ?, ?, ?, ?, ?, ?), ' +
      '(?, ?, ?, ?, ?, ?, ?, ?, ?)',
      // Campus locations
      'Main Academic Block', 'academic,study,lectures', 0, 5.0, 0, 1, 'Central academic building with lecture halls LH1-LH4, faculty offices, and seminar rooms.', 'campus', '30.9686,76.4731',
      'Library & Learning Center', 'study-friendly,quiet,books', 0.1, 4.9, 0, 1, 'Modern library with extensive book collection, reading halls, and 24/7 study rooms.', 'campus', '30.9690,76.4735',
      'Central Mess', 'food,mess,budget', 0, 4.2, 1, 1, 'Main dining facility serving breakfast, lunch, and dinner. Veg and non-veg options available.', 'campus', '30.9682,76.4728',
      'Sports Complex', 'sports,outdoors,gym', 0.2, 4.5, 0, 1, 'Gymnasium, basketball courts, volleyball, badminton, and cricket ground.', 'campus', '30.9675,76.4720',
      'Student Activity Center (SAC)', 'events,clubs,hangout', 0.1, 4.4, 0, 1, 'Hub for student clubs, cultural events, and recreational activities.', 'campus', '30.9688,76.4738',
      'Hostel Area', 'residential,quiet', 0, 4.3, 0, 1, 'Boys and Girls hostels with common rooms, laundry, and night canteen.', 'campus', '30.9678,76.4725',
      'Admin Block', 'admin,offices', 0.1, 4.0, 0, 1, 'Administrative offices, Dean offices, and student services.', 'campus', '30.9692,76.4732',
      // Nearby Rupnagar locations
      'Rupnagar Railway Station', 'transport,travel', 3.5, 4.0, 1, 1, 'Main railway station connecting to Chandigarh, Delhi, and other cities.', 'transport', '30.9662,76.5262',
      'Shivalik Mall Rupnagar', 'shopping,food,entertainment', 4.2, 4.1, 2, 1, 'Shopping complex with food court, cinema, and retail stores.', 'shopping', '30.9655,76.5318',
      'Gurudwara Shri Bhatha Sahib', 'spiritual,peaceful,heritage', 8.0, 4.8, 0, 1, 'Historic Sikh shrine associated with Guru Nanak Dev Ji.', 'spiritual', '30.9789,76.5125',
      'Anandpur Sahib', 'spiritual,heritage,tourism', 25.0, 4.9, 1, 1, 'Takht Sri Kesgarh Sahib - one of five Sikh temporal seats. Must visit!', 'spiritual', '31.2395,76.5022',
      'Chandigarh', 'city,shopping,entertainment', 45.0, 4.7, 3, 1, 'Planned city with Sukhna Lake, Rock Garden, Sector 17 market, and Elante Mall.', 'city', '30.7333,76.7794',
      'Nangal Dam', 'nature,picnic,photography', 15.0, 4.4, 1, 1, 'Scenic dam on Sutlej River. Great for weekend picnics and photography.', 'nature', '31.3845,76.3752',
      'Virasat-e-Khalsa Museum', 'museum,heritage,culture', 25.0, 4.8, 2, 1, 'Stunning museum showcasing 500 years of Sikh history and Punjab culture.', 'culture', '31.2385,76.5058',
      'Cafe Coffee Day Rupnagar', 'cafe,study-friendly,coffee', 4.0, 4.0, 2, 1, 'Popular cafe chain. Good for study sessions and meetups with friends.', 'food', '30.9648,76.5289'
    );
  }

  const timetableCount = await db.get('SELECT COUNT(*) as count FROM timetable');
  if (timetableCount.count === 0) {
    await db.run(
      'INSERT INTO timetable (day, start_time, end_time, course, location, instructor) VALUES\n' +
      ' (?, ?, ?, ?, ?, ?),\n' +
      ' (?, ?, ?, ?, ?, ?),\n' +
      ' (?, ?, ?, ?, ?, ?)',
      'Monday',
      '09:00',
      '10:15',
      'CS-302 AI & Neural Networks',
      'Lecture Hall B-4',
      'Dr. Mehra',
      'Tuesday',
      '11:00',
      '12:15',
      'MA-201 Linear Algebra',
      'Room A-2',
      'Prof. Rao',
      'Wednesday',
      '14:00',
      '15:15',
      'CS-350 Systems Lab',
      'Lab C-1',
      'Dr. Patel'
    );
  }

  const assignmentCount = await db.get('SELECT COUNT(*) as count FROM assignments');
  if (assignmentCount.count === 0) {
    await db.run(
      'INSERT INTO assignments (course, title, due_at, description) VALUES\n' +
      ' (?, ?, ?, ?),\n' +
      ' (?, ?, ?, ?)',
      'CS-302',
      'Neural Nets Mini-Project',
      new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      'Build a classifier for campus event types.',
      'MA-201',
      'Matrix Decomposition Homework',
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      'Solve QR and SVD exercises from chapter 4.'
    );
  }

  const gradeCount = await db.get('SELECT COUNT(*) as count FROM grades');
  if (gradeCount.count === 0) {
    await db.run(
      'INSERT INTO grades (user_id, course, grade, updated_at) VALUES\n' +
      ' (?, ?, ?, ?),\n' +
      ' (?, ?, ?, ?)',
      2,
      'CS-302',
      'A-',
      nowIso(),
      2,
      'MA-201',
      'B+',
      nowIso()
    );
  }

  const notifCount = await db.get('SELECT COUNT(*) as count FROM notifications');
  if (notifCount.count === 0) {
    await db.run(
      'INSERT INTO notifications (title, body, level, created_at) VALUES\n' +
      ' (?, ?, ?, ?),\n' +
      ' (?, ?, ?, ?)',
      'Wi-Fi Maintenance',
      'Dorm block A Wi-Fi will be down at 1 AM.',
      'info',
      nowIso(),
      'Emergency Drill',
      'Hostel evacuation drill scheduled tomorrow 7 PM.',
      'alert',
      nowIso()
    );
  }
};

const initDb = async () => {
  await db.exec(
    'CREATE TABLE IF NOT EXISTS users (\n' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
      'email TEXT UNIQUE NOT NULL,\n' +
      'username TEXT NOT NULL,\n' +
      'role TEXT NOT NULL,\n' +
      'password_hash TEXT NOT NULL,\n' +
      'created_at TEXT NOT NULL\n' +
    ');\n' +
    'CREATE TABLE IF NOT EXISTS mess_menu (\n' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
      'date TEXT NOT NULL,\n' +
      'meal TEXT NOT NULL,\n' +
      'item TEXT NOT NULL,\n' +
      'calories INTEGER,\n' +
      'tags TEXT,\n' +
      'rating REAL\n' +
    ');\n' +
    'CREATE TABLE IF NOT EXISTS announcements (\n' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
      'title TEXT NOT NULL,\n' +
      'body TEXT NOT NULL,\n' +
      'category TEXT NOT NULL,\n' +
      'priority TEXT NOT NULL,\n' +
      'event_at TEXT,\n' +
      'created_at TEXT NOT NULL\n' +
    ');\n' +
    'CREATE TABLE IF NOT EXISTS mail_summaries (\n' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
      'user_id INTEGER NOT NULL,\n' +
      'subject TEXT,\n' +
      'summary TEXT NOT NULL,\n' +
      'action_items_json TEXT,\n' +
      'priority TEXT,\n' +
      'category TEXT,\n' +
      'created_at TEXT NOT NULL\n' +
    ');\n' +
    'CREATE TABLE IF NOT EXISTS lost_found (\n' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
      'type TEXT NOT NULL,\n' +
      'title TEXT NOT NULL,\n' +
      'description TEXT NOT NULL,\n' +
      'location TEXT NOT NULL,\n' +
      'contact TEXT NOT NULL,\n' +
      'status TEXT NOT NULL,\n' +
      'created_at TEXT NOT NULL\n' +
    ');\n' +
    'CREATE TABLE IF NOT EXISTS marketplace (\n' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
      'title TEXT NOT NULL,\n' +
      'description TEXT NOT NULL,\n' +
      'price REAL NOT NULL,\n' +
      'category TEXT NOT NULL,\n' +
      'seller TEXT NOT NULL,\n' +
      'contact TEXT NOT NULL,\n' +
      'item_condition TEXT NOT NULL,\n' +
      'created_at TEXT NOT NULL\n' +
    ');\n' +
    'CREATE TABLE IF NOT EXISTS travel_shares (\n' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
      'destination TEXT NOT NULL,\n' +
      'depart_at TEXT NOT NULL,\n' +
      'seats INTEGER NOT NULL,\n' +
      'notes TEXT,\n' +
      'contact TEXT NOT NULL,\n' +
      'created_at TEXT NOT NULL\n' +
    ');\n' +
    'CREATE TABLE IF NOT EXISTS nearby_places (\n' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
      'name TEXT NOT NULL,\n' +
      'vibe_tags TEXT NOT NULL,\n' +
      'distance_km REAL NOT NULL,\n' +
      'rating REAL NOT NULL,\n' +
      'price_level INTEGER NOT NULL,\n' +
      'open_now INTEGER NOT NULL,\n' +
      'description TEXT NOT NULL,\n' +
      'category TEXT DEFAULT "nearby",\n' +
      'coordinates TEXT\n' +
    ');\n' +
    'CREATE TABLE IF NOT EXISTS timetable (\n' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
      'day TEXT NOT NULL,\n' +
      'start_time TEXT NOT NULL,\n' +
      'end_time TEXT NOT NULL,\n' +
      'course TEXT NOT NULL,\n' +
      'location TEXT NOT NULL,\n' +
      'instructor TEXT NOT NULL\n' +
    ');\n' +
    'CREATE TABLE IF NOT EXISTS assignments (\n' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
      'course TEXT NOT NULL,\n' +
      'title TEXT NOT NULL,\n' +
      'due_at TEXT NOT NULL,\n' +
      'description TEXT NOT NULL\n' +
    ');\n' +
    'CREATE TABLE IF NOT EXISTS submissions (\n' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
      'assignment_id INTEGER NOT NULL,\n' +
      'user_id INTEGER NOT NULL,\n' +
      'status TEXT NOT NULL,\n' +
      'submitted_at TEXT,\n' +
      'url TEXT\n' +
    ');\n' +
    'CREATE TABLE IF NOT EXISTS grades (\n' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
      'user_id INTEGER NOT NULL,\n' +
      'course TEXT NOT NULL,\n' +
      'grade TEXT NOT NULL,\n' +
      'updated_at TEXT NOT NULL\n' +
    ');\n' +
    'CREATE TABLE IF NOT EXISTS notifications (\n' +
      'id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
      'title TEXT NOT NULL,\n' +
      'body TEXT NOT NULL,\n' +
      'level TEXT NOT NULL,\n' +
      'created_at TEXT NOT NULL\n' +
    ');'
  );

  await seedIfEmpty();
};

await initDb();

const signToken = (user) => {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
};

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.query.token || null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  return next();
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: nowIso() });
});

app.get('/api/docs', (req, res) => {
  res.json({
    auth: ['/api/auth/register', '/api/auth/login', '/api/auth/me'],
    dailyPulse: ['/api/mess/menu', '/api/announcements', '/api/weather', '/api/stream/alerts'],
    mail: ['/api/mail/summarize', '/api/mail/summaries'],
    exchange: ['/api/lost-found', '/api/marketplace', '/api/travel'],
    explorer: ['/api/nearby', '/api/nearby/recommendations'],
    academics: ['/api/timetable', '/api/assignments', '/api/submissions', '/api/grades']
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, username } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const existing = await db.get('SELECT id FROM users WHERE email = ?', email);
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }
  const hash = await bcrypt.hash(password, 10);
  const displayName = username || email.split('@')[0];
  const result = await db.run(
    'INSERT INTO users (email, username, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
    email,
    displayName,
    'student',
    hash,
    nowIso()
  );
  const user = { id: result.lastID, email, username: displayName, role: 'student' };
  const token = signToken(user);
  res.json({ token, user });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const user = await db.get('SELECT * FROM users WHERE email = ?', email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signToken(user);
  res.json({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const user = await db.get('SELECT id, email, username, role FROM users WHERE id = ?', req.user.sub);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

app.get('/api/mess/menu', authMiddleware, async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const rows = await db.all('SELECT * FROM mess_menu WHERE date = ? ORDER BY id ASC', date);
  res.json({ date, items: rows });
});

app.post('/api/mess/menu', authMiddleware, requireAdmin, async (req, res) => {
  const { date, meal, item, calories, tags, rating } = req.body || {};
  if (!date || !meal || !item) {
    return res.status(400).json({ error: 'Missing menu fields' });
  }
  const result = await db.run(
    'INSERT INTO mess_menu (date, meal, item, calories, tags, rating) VALUES (?, ?, ?, ?, ?, ?)',
    date,
    meal,
    item,
    calories || null,
    tags || null,
    rating || null
  );
  res.json({ id: result.lastID });
});

app.get('/api/announcements', authMiddleware, async (req, res) => {
  const rows = await db.all('SELECT * FROM announcements ORDER BY created_at DESC');
  res.json({ items: rows });
});

app.post('/api/announcements', authMiddleware, requireAdmin, async (req, res) => {
  const { title, body, category, priority, event_at } = req.body || {};
  if (!title || !body || !category || !priority) {
    return res.status(400).json({ error: 'Missing announcement fields' });
  }
  const result = await db.run(
    'INSERT INTO announcements (title, body, category, priority, event_at, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    title,
    body,
    category,
    priority,
    event_at || null,
    nowIso()
  );
  res.json({ id: result.lastID });
});

app.get('/api/weather', authMiddleware, async (req, res) => {
  res.json({
    location: 'Rupnagar',
    temperatureC: 27,
    condition: 'Partly Cloudy',
    humidity: 62,
    windKph: 9
  });
});

app.post('/api/mail/summarize', authMiddleware, async (req, res) => {
  const { text, subject } = req.body || {};
  if (!text) {
    return res.status(400).json({ error: 'Missing email text' });
  }

  let summaryPayload = {
    summary: 'Gemini offline. Using local fallback summary.',
    actionItems: ['Review the original email for details.'],
    priority: 'medium',
    category: 'admin'
  };

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the following university email.\nReturn JSON with summary, actionItems, priority, category.\n\nEmail Body:\n${text}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
              priority: { type: Type.STRING },
              category: { type: Type.STRING }
            }
          }
        }
      });
      const parsed = JSON.parse(response.text || '{}');
      summaryPayload = {
        summary: parsed.summary || summaryPayload.summary,
        actionItems: parsed.actionItems || summaryPayload.actionItems,
        priority: parsed.priority || summaryPayload.priority,
        category: parsed.category || summaryPayload.category
      };
    } catch (err) {
      console.error('Gemini Error:', err);
    }
  }

  const result = await db.run(
    'INSERT INTO mail_summaries (user_id, subject, summary, action_items_json, priority, category, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    req.user.sub,
    subject || 'Campus Mail',
    summaryPayload.summary,
    JSON.stringify(summaryPayload.actionItems || []),
    summaryPayload.priority,
    summaryPayload.category,
    nowIso()
  );

  res.json({ id: result.lastID, ...summaryPayload, subject: subject || 'Campus Mail' });
});

app.get('/api/mail/summaries', authMiddleware, async (req, res) => {
  const rows = await db.all('SELECT * FROM mail_summaries WHERE user_id = ? ORDER BY created_at DESC', req.user.sub);
  const mapped = rows.map((row) => ({
    id: row.id,
    subject: row.subject,
    summary: row.summary,
    actionItems: JSON.parse(row.action_items_json || '[]'),
    priority: row.priority,
    category: row.category,
    createdAt: row.created_at
  }));
  res.json({ items: mapped });
});

app.get('/api/lost-found', authMiddleware, async (req, res) => {
  const rows = await db.all('SELECT * FROM lost_found ORDER BY created_at DESC');
  res.json({ items: rows });
});

app.post('/api/lost-found', authMiddleware, async (req, res) => {
  const { type, title, description, location, contact } = req.body || {};
  if (!type || !title || !description || !location || !contact) {
    return res.status(400).json({ error: 'Missing lost/found fields' });
  }
  const result = await db.run(
    'INSERT INTO lost_found (type, title, description, location, contact, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    type,
    title,
    description,
    location,
    contact,
    'open',
    nowIso()
  );
  res.json({ id: result.lastID });
});

app.get('/api/marketplace', authMiddleware, async (req, res) => {
  const rows = await db.all('SELECT * FROM marketplace ORDER BY created_at DESC');
  res.json({ items: rows });
});

app.post('/api/marketplace', authMiddleware, async (req, res) => {
  const { title, description, price, category, seller, contact, item_condition } = req.body || {};
  if (!title || !description || !price || !category || !seller || !contact || !item_condition) {
    return res.status(400).json({ error: 'Missing marketplace fields' });
  }
  const result = await db.run(
    'INSERT INTO marketplace (title, description, price, category, seller, contact, item_condition, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    title,
    description,
    price,
    category,
    seller,
    contact,
    item_condition,
    nowIso()
  );
  res.json({ id: result.lastID });
});

app.get('/api/travel', authMiddleware, async (req, res) => {
  const rows = await db.all('SELECT * FROM travel_shares ORDER BY depart_at ASC');
  res.json({ items: rows });
});

app.post('/api/travel', authMiddleware, async (req, res) => {
  const { destination, depart_at, seats, notes, contact } = req.body || {};
  if (!destination || !depart_at || !seats || !contact) {
    return res.status(400).json({ error: 'Missing travel fields' });
  }
  const result = await db.run(
    'INSERT INTO travel_shares (destination, depart_at, seats, notes, contact, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    destination,
    depart_at,
    seats,
    notes || null,
    contact,
    nowIso()
  );
  res.json({ id: result.lastID });
});

app.get('/api/nearby', authMiddleware, async (req, res) => {
  const rows = await db.all('SELECT * FROM nearby_places ORDER BY rating DESC');
  res.json({ items: rows });
});

const scoreNearby = (place, prefs) => {
  const tags = (place.vibe_tags || '').split(',');
  let score = place.rating || 0;
  if (prefs.tags?.length) {
    score += prefs.tags.filter((tag) => tags.includes(tag)).length * 0.6;
  }
  if (prefs.mood && tags.includes(prefs.mood)) {
    score += 0.8;
  }
  if (prefs.budget === 'low') {
    score += place.price_level <= 1 ? 0.5 : -0.3;
  }
  if (prefs.budget === 'medium') {
    score += place.price_level <= 2 ? 0.4 : -0.2;
  }
  if (prefs.openNow && place.open_now) {
    score += 0.3;
  }
  return score;
};

app.post('/api/nearby/recommendations', authMiddleware, async (req, res) => {
  const { mood, tags, budget, openNow } = req.body || {};
  const places = await db.all('SELECT * FROM nearby_places');

  if (aiClient) {
    try {
      const context = places.map((p) => `${p.name} | tags: ${p.vibe_tags} | rating: ${p.rating} | price: ${p.price_level}`).join('\n');
      const response = await aiClient.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Recommend top 3 nearby places for a student.\nMood: ${mood || 'any'}\nTags: ${(tags || []).join(', ')}\nBudget: ${budget || 'any'}\nOpen now: ${openNow ? 'yes' : 'no'}\n\nPlaces:\n${context}\n\nReturn JSON array of place names in ranked order.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      const list = JSON.parse(response.text || '[]');
      const recommended = places.filter((p) => list.includes(p.name));
      return res.json({ items: recommended.length ? recommended : places.slice(0, 3), model: 'gemini' });
    } catch (err) {
      console.error('Gemini Error:', err);
    }
  }

  const prefs = { mood, tags: tags || [], budget, openNow };
  const ranked = places
    .map((place) => ({ place, score: scoreNearby(place, prefs) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.place);

  res.json({ items: ranked, model: 'heuristic' });
});

app.post('/api/navigation/advice', authMiddleware, async (req, res) => {
  const { currentLocation, destination, context } = req.body || {};
  if (!currentLocation || !destination) {
    return res.status(400).json({ error: 'Missing locations' });
  }
  if (!aiClient) {
    return res.json({ advice: 'Navigation AI offline. Proceed with caution.' });
  }

  const iitrContext = `IIT Ropar Campus Layout:
- Main Gate leads to Central Road
- Academic Block (Lecture Halls LH1-LH4) is central
- Library is behind Academic Block
- Central Mess is near Hostel Area
- Sports Complex is towards west side
- SAC (Student Activity Center) is near Admin Block
- Boys Hostels: BH1-BH4 are clustered together
- Girls Hostels: GH1-GH2 are separate area
- Medical Center is near Main Gate
- Parking area near Main Gate
- Night Canteen is near BH3`;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a navigation AI for IIT Ropar campus in Punjab, India.\n${iitrContext}\n\nUser is at: ${currentLocation}\nHeading to: ${destination}\nContext: ${context || 'no extra context'}\nGive a short, helpful navigation tip under 40 words with specific landmarks.`
    });
    res.json({ advice: response.text || 'Rerouting calculation failed.' });
  } catch (err) {
    res.json({ advice: 'Rerouting calculation failed.' });
  }
});

// AI Chatbot endpoint
app.post('/api/chat', authMiddleware, async (req, res) => {
  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  if (!aiClient) {
    return res.json({ reply: 'AI is currently offline. Please try again later.' });
  }

  try {
    const systemPrompt = `You are the IIT Ropar Campus Assistant, a helpful AI for students at Indian Institute of Technology Ropar, Punjab. 
You can help students with:
- Campus facilities (Central Library, academic blocks, hostels, sports complex, cafeteria, medical center)
- Academic queries (departments: CSE, EE, ME, Civil, ChemE, Maths, Physics, Chemistry, HSS)
- Mess menu, timings, and food options
- Campus navigation and directions
- Lost and found items
- Cab sharing and travel to Chandigarh/Delhi
- Student activities, clubs, and events
- General campus life and tips

Be concise, friendly, and helpful. Keep responses under 100 words unless more detail is needed.
If asked about something you don't have specific data for, give general helpful guidance relevant to IIT Ropar.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${systemPrompt}\n\nUser question: ${message}`
    });
    res.json({ reply: response.text || 'I couldn\'t process that request.' });
  } catch (err) {
    console.error('Chat error:', err);
    res.json({ reply: 'Sorry, I encountered an error. Please try again.' });
  }
});

app.get('/api/timetable', authMiddleware, async (req, res) => {
  const rows = await db.all('SELECT * FROM timetable ORDER BY day, start_time');
  res.json({ items: rows });
});

app.post('/api/timetable', authMiddleware, requireAdmin, async (req, res) => {
  const { day, start_time, end_time, course, location, instructor } = req.body || {};
  if (!day || !start_time || !end_time || !course || !location || !instructor) {
    return res.status(400).json({ error: 'Missing timetable fields' });
  }
  const result = await db.run(
    'INSERT INTO timetable (day, start_time, end_time, course, location, instructor) VALUES (?, ?, ?, ?, ?, ?)',
    day,
    start_time,
    end_time,
    course,
    location,
    instructor
  );
  res.json({ id: result.lastID });
});

app.get('/api/assignments', authMiddleware, async (req, res) => {
  const rows = await db.all('SELECT * FROM assignments ORDER BY due_at ASC');
  res.json({ items: rows });
});

app.post('/api/assignments', authMiddleware, requireAdmin, async (req, res) => {
  const { course, title, due_at, description } = req.body || {};
  if (!course || !title || !due_at || !description) {
    return res.status(400).json({ error: 'Missing assignment fields' });
  }
  const result = await db.run(
    'INSERT INTO assignments (course, title, due_at, description) VALUES (?, ?, ?, ?)',
    course,
    title,
    due_at,
    description
  );
  res.json({ id: result.lastID });
});

app.post('/api/submissions', authMiddleware, async (req, res) => {
  const { assignment_id, status, url } = req.body || {};
  if (!assignment_id || !status) {
    return res.status(400).json({ error: 'Missing submission fields' });
  }
  const result = await db.run(
    'INSERT INTO submissions (assignment_id, user_id, status, submitted_at, url) VALUES (?, ?, ?, ?, ?)',
    assignment_id,
    req.user.sub,
    status,
    nowIso(),
    url || null
  );
  res.json({ id: result.lastID });
});

app.get('/api/grades', authMiddleware, async (req, res) => {
  const rows = await db.all('SELECT * FROM grades WHERE user_id = ? ORDER BY updated_at DESC', req.user.sub);
  res.json({ items: rows });
});

app.post('/api/grades', authMiddleware, requireAdmin, async (req, res) => {
  const { user_id, course, grade } = req.body || {};
  if (!user_id || !course || !grade) {
    return res.status(400).json({ error: 'Missing grade fields' });
  }
  const result = await db.run(
    'INSERT INTO grades (user_id, course, grade, updated_at) VALUES (?, ?, ?, ?)',
    user_id,
    course,
    grade,
    nowIso()
  );
  res.json({ id: result.lastID });
});

app.get('/api/stream/alerts', authMiddleware, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendNotification = async () => {
    const row = await db.get('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1');
    const payload = row || { title: 'Live Feed', body: 'No new alerts. Systems nominal.', level: 'info' };
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  await sendNotification();
  const interval = setInterval(sendNotification, 15000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

app.listen(PORT, () => {
  console.log(`Nexus API listening on ${PORT}`);
});
