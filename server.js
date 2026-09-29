import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const CALL_SECONDS = 420;
const INTRO_SECONDS = 10;
const SESSION_COOKIE = 'hadaleng_session';
const ADMIN_KEY = process.env.ADMIN_KEY || 'change-me-in-production';
const DB_FILE = path.join(__dirname, 'data', 'db.json');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true, credentials: true } });

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '200kb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: true, legacyHeaders: false }));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

const countries = [
  'Afghanistan','Albania','Algeria','Argentina','Australia','Austria','Bangladesh','Belgium','Brazil','Canada',
  'Chile','China','Colombia','Denmark','Egypt','Ethiopia','Finland','France','Germany','Ghana','Greece','India',
  'Indonesia','Iraq','Ireland','Italy','Japan','Jordan','Kenya','Malaysia','Mexico','Morocco','Netherlands','New Zealand',
  'Nigeria','Norway','Pakistan','Philippines','Poland','Portugal','Qatar','Saudi Arabia','Somalia','South Africa','South Korea',
  'Spain','Sudan','Sweden','Switzerland','Tanzania','Thailand','Tunisia','Turkey','Uganda','Ukraine','United Arab Emirates',
  'United Kingdom','United States','Vietnam','Yemen','Other'
];
const interests = [
  'Travel','Football','Basketball','Music','Movies','TV shows','Anime','Gaming','Technology','AI','Programming','Business',
  'Entrepreneurship','Finance','Investing','Education','University life','Career goals','Languages','Books','Writing','Art',
  'Photography','Fashion','Fitness','Gym','Running','Food','Cooking','Nature','Animals','Science','Space','History','Geography',
  'Cars','Motorcycles','Aviation','Psychology','Personal growth','Productivity','Friendship','Culture','Daily life','Family',
  'Relationships','Social media','YouTube','Podcasts','Comedy','Memes','Sports','News','Environment','Volunteering','Travel stories',
  'Dreams and goals','Childhood memories','School memories','Future plans','Life lessons','Hobbies','Pets','Technology trends',
  'Entrepreneur stories','Favorite places','Favorite foods','Weekend plans','Books you recommend','Films you recommend'
];
const topics = [
  'When was the first time you discovered a hobby you really loved?',
  'What is one place you would love to visit, and why?',
  'What was your favorite game when you were a child?',
  'What is something you learned recently that surprised you?',
  'What would your perfect weekend look like?',
  'Who has influenced you the most in your life?',
  'What is one skill you wish you could learn instantly?',
  'What is your favorite food, and how did you discover it?',
  'What is the funniest thing that happened to you at school?',
  'If you could live in any country for one year, where would you go?',
  'What career did you dream about as a child?',
  'What is a movie you could watch more than once?',
  'What kind of music do you listen to when you need motivation?',
  'What is one goal you are working toward right now?',
  'What is the best advice someone has ever given you?',
  'What is something you used to believe but changed your mind about?',
  'If you could meet any historical person, who would it be?',
  'What makes a good friend?',
  'What is your favorite memory from childhood?',
  'What is one thing you want to improve about yourself?',
  'What is the most beautiful place you have seen?',
  'Would you rather live in a big city or a quiet town?',
  'What is a tradition from your culture that you love?',
  'What is your favorite season and why?',
  'What is the most useful thing you learned at school?',
  'What would you do with a completely free day?',
  'What invention has changed everyday life the most?',
  'What is something you are grateful for today?',
  'What is your favorite sport to watch or play?',
  'What makes you laugh every time?',
  'If you had a free ticket anywhere in the world, where would you go?',
  'What is your favorite app and why?',
  'What is one habit that has helped you?',
  'What is something you want to experience at least once?',
  'What was your first experience using the internet?',
  'What is a book, film, or show you recommend?',
  'What is your dream home like?',
  'What does success mean to you?',
  'What is one thing you would teach a younger person?',
  'What is your favorite way to relax?',
  'What is the best trip you have ever taken?',
  'What is a food you disliked as a child but like now?',
  'What is something you are proud of?',
  'What is one thing people often misunderstand about you?',
  'What kind of person do you want to become?',
  'What is your favorite way to spend time with friends?',
  'What is one technology you could not live without?',
  'What is your favorite childhood cartoon?',
  'What is a language you would love to speak?',
  'What is your biggest dream for the next five years?',
  'What is the most interesting culture you want to learn about?',
  'What would you do if you had one extra hour every day?',
  'What is one thing you would change about school?',
  'What is your favorite outdoor activity?',
  'What is the best meal you have ever eaten?',
  'What is one country you know very little about but want to learn about?',
  'What is a small thing that makes your day better?',
  'What is your favorite subject to talk about?',
  'What is something you want to teach someone else?',
  'What is your favorite holiday or celebration?',
  'What is a memorable conversation you have had?',
  'What is the most challenging thing you have learned?',
  'What do you think makes a great leader?',
  'What is your favorite way to learn something new?',
  'What is one thing you would buy if money were not a problem?',
  'What is a job you would try just for the experience?',
  'What is the most adventurous thing you have done?',
  'What is one thing you would like to do with your family?',
  'What is your favorite type of weather?',
  'What is something you would like to create?',
  'What is one place in your country you recommend visiting?',
  'What is a sport you would like to try?',
  'What is one childhood dream you still have?',
  'What is the nicest compliment you have received?',
  'What is your favorite thing about your culture?',
  'What is something you want to be better at this year?',
  'What is one mistake that taught you something important?',
  'What is your favorite way to celebrate good news?',
  'What is a place that feels like home to you?',
  'What is one thing you would like to learn from another culture?',
  'What is your favorite type of video to watch online?',
  'What is one subject you could talk about for an hour?',
  'What is your favorite memory with a friend?',
  'What makes a conversation interesting?',
  'What is one thing you wish people asked you more often?',
  'What is your ideal morning routine?',
  'What is one thing you want to accomplish before you are 30?',
  'What is your favorite kind of weather for a trip?',
  'What is one country you would like to understand better?',
  'What is a skill you think everyone should learn?',
  'What is the best meal you can cook?',
  'What is your favorite thing about where you live?',
  'What is one thing that always motivates you?',
  'What is a goal you have already achieved?',
  'What is one activity you would recommend to a visitor in your country?',
  'What is your favorite way to spend a rainy day?',
  'What is something you would like to do more often?',
  'What is one thing you have learned from traveling?',
  'What is the most interesting person you have met?',
  'What is one rule you would add to schools?',
  'What is your favorite memory from your teenage years?',
  'What is something you hope technology will improve?',
  'What is one thing you would do if you knew you could not fail?',
  'What is the best thing about learning English?',
  'What is one English word you really like?',
  'What is a dream you have not told many people about?',
  'What is one thing that makes you feel confident?',
  'What is something you want to understand better?',
  'What is your favorite conversation topic?',
  'What would you like your life to look like in ten years?'
];

const defaultRules = [
  'English only during conversations.',
  'Treat your partner with respect. No harassment, bullying, threats, or hate speech.',
  'No sexual behavior, nudity, or sexually explicit content.',
  'No scams, money requests, or attempts to collect sensitive personal information.',
  'Do not record or distribute another person’s conversation without permission.',
  'Stay face-to-face and seated during the conversation.',
  'Only one person is allowed in the camera frame during a session.',
  'Respect the 7-minute conversation format. There is no skip or manual end button.',
  'If a genuine connection problem happens, allow the system to recover rather than abusing network controls.',
  'Use Report and Block when necessary.'
];
const defaultAchievements = [
  ['First Conversation','Complete your first 7-minute conversation.','💬','conversations',1],
  ['10 Conversations','Complete 10 conversations.','🔥','conversations',10],
  ['50 Conversations','Complete 50 conversations.','🏅','conversations',50],
  ['100 Conversations','Complete 100 conversations.','🏆','conversations',100],
  ['World Traveler','Meet people from 10 different countries.','🌍','countries',10],
  ['10 Hours Speaking','Complete 10 hours of conversation.','⏱️','minutes',600],
  ['7-Day Streak','Practice on 7 consecutive days.','🔥','streak',7],
  ['30-Day Streak','Practice on 30 consecutive days.','🔥','streak',30],
  ['100-Day Streak','Practice on 100 consecutive days.','🔥','streak',100]
];

function emptyDb() {
  return {
    users: [], sessions: [], ratings: [], reports: [], blocks: [], notifications: [], reviews: [],
    achievements: defaultAchievements.map(([name, description, icon, metric, requirement]) => ({ id: crypto.randomUUID(), name, description, icon, metric, requirement, enabled: true })),
    userAchievements: [], rules: defaultRules.map((text, i) => ({ id: crypto.randomUUID(), text, enabled: true, order: i + 1 })),
    settings: { callSeconds: CALL_SECONDS, introSeconds: INTRO_SECONDS, englishOnly: true, ratingsRequired: true, streaksEnabled: true, achievementsEnabled: true, randomMatching: true, profileBrowsing: false, recordingEnabled: false },
    topicIndex: 0
  };
}
function loadDb() {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(emptyDb(), null, 2));
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch { const db = emptyDb(); fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); return db; }
}
let db = loadDb();
function saveDb() { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }
function id() { return crypto.randomUUID(); }
function hashToken() { return crypto.randomBytes(32).toString('hex'); }
function publicUser(u) {
  if (!u) return null;
  return { id: u.id, email: u.email, name: u.name, age: u.age, country: u.country, level: u.level, interests: u.interests, bio: u.bio, createdAt: u.createdAt, stats: u.stats, streak: u.streak, preferences: u.preferences, feedback: aggregateFeedback(u.id) };
}
function aggregateFeedback(userId) {
  const rows = db.ratings.filter(r => r.targetId === userId);
  const total = rows.length;
  if (!total) return { total: 0, better: 0, same: 0, worse: 0 };
  const counts = { better: 0, same: 0, worse: 0 };
  for (const r of rows) counts[r.choice] = (counts[r.choice] || 0) + 1;
  return { total, better: Math.round(counts.better / total * 100), same: Math.round(counts.same / total * 100), worse: Math.round(counts.worse / total * 100) };
}
function userFromReq(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  const session = db.sessions.find(s => s.token === token && s.expiresAt > Date.now());
  return session ? db.users.find(u => u.id === session.userId) : null;
}
function requireAuth(req, res, next) { const u = userFromReq(req); if (!u) return res.status(401).json({ error: 'Please sign in.' }); req.user = u; next(); }
function normalizeInterests(v) { return [...new Set((Array.isArray(v) ? v : []).map(String).map(s => s.trim()).filter(Boolean))].slice(0, 5); }
function nextTopic() { const topic = topics[db.topicIndex % topics.length]; db.topicIndex = (db.topicIndex + 1) % topics.length; saveDb(); return topic; }
function blocked(a, b) { return db.blocks.some(x => (x.userId === a && x.blockedUserId === b) || (x.userId === b && x.blockedUserId === a)); }
function eligible(a, b) {
  if (!a || !b || a.id === b.id || blocked(a.id, b.id)) return false;
  const p = a.preferences || {};
  if (p.levels?.length && !p.levels.includes(b.level)) return false;
  if (p.countries?.length && !p.countries.includes(b.country)) return false;
  if (p.interests?.length && !p.interests.some(i => b.interests?.includes(i))) return false;
  if (p.ageMin && b.age < p.ageMin) return false;
  if (p.ageMax && b.age > p.ageMax) return false;
  return true;
}

// lightweight cookie parser without an extra dependency
app.use((req, _res, next) => { const raw = req.headers.cookie || ''; req.cookies = Object.fromEntries(raw.split(';').map(x => x.trim()).filter(Boolean).map(x => { const i = x.indexOf('='); return [decodeURIComponent(x.slice(0, i)), decodeURIComponent(x.slice(i + 1))]; })); next(); });

app.get('/api/config', (_req, res) => res.json({ app: 'HADALeng', callSeconds: db.settings.callSeconds, introSeconds: db.settings.introSeconds, countries, interests, topicsCount: topics.length, rules: db.rules.filter(r => r.enabled).sort((a,b)=>a.order-b.order).map(r=>r.text) }));
app.get('/api/me', requireAuth, (req,res)=>res.json({ user: publicUser(req.user) }));
app.post('/api/auth/register', async (req,res)=>{
  const { email, password, name, age, country, level, interests: ints, bio, agree } = req.body || {};
  if (!agree) return res.status(400).json({ error:'You must agree to the Community Rules.' });
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error:'Enter a valid email address.' });
  if (!password || password.length < 8) return res.status(400).json({ error:'Password must be at least 8 characters.' });
  if (!name?.trim()) return res.status(400).json({ error:'Enter your name.' });
  const numericAge = Number(age); if (!Number.isInteger(numericAge) || numericAge < 13 || numericAge > 100) return res.status(400).json({ error:'Age must be between 13 and 100.' });
  if (!countries.includes(country)) return res.status(400).json({ error:'Choose a country from the list.' });
  if (!['A1','A2','B1','B2','C1','C2'].includes(level)) return res.status(400).json({ error:'Choose an English level.' });
  if (normalizeInterests(ints).length > 5) return res.status(400).json({ error:'Choose up to 5 interests.' });
  const cleanEmail = email.trim().toLowerCase();
  if (db.users.some(u => u.email === cleanEmail)) return res.status(409).json({ error:'An account with that email already exists.' });
  const user = { id:id(), email:cleanEmail, passwordHash:await bcrypt.hash(password, 12), name:name.trim(), age:numericAge, country, level, interests:normalizeInterests(ints), bio:String(bio||'').trim().slice(0,300), createdAt:new Date().toISOString(), stats:{completed:0, uniquePeople:0, countries:0, minutes:0}, streak:{current:0,longest:0,activeDays:[],lastActive:null}, preferences:{levels:[],countries:[],interests:[],ageMin:null,ageMax:null}, met:{} };
  db.users.push(user); saveDb();
  const token = hashToken(); db.sessions.push({ token, userId:user.id, expiresAt:Date.now()+1000*60*60*24*30 }); saveDb();
  res.json({ token, user:publicUser(user) });
});
app.post('/api/auth/login', async (req,res)=>{
  const email=String(req.body?.email||'').trim().toLowerCase(), password=String(req.body?.password||'');
  const user=db.users.find(u=>u.email===email); if(!user || !await bcrypt.compare(password,user.passwordHash)) return res.status(401).json({ error:'Email or password is incorrect.' });
  const token=hashToken(); db.sessions.push({token,userId:user.id,expiresAt:Date.now()+1000*60*60*24*30}); saveDb(); res.json({token,user:publicUser(user)});
});
app.post('/api/auth/logout', requireAuth, (req,res)=>{ const token=req.headers.authorization?.replace(/^Bearer\s+/i,''); db.sessions=db.sessions.filter(s=>s.token!==token); saveDb(); res.json({ok:true}); });
app.get('/auth/google', (_req,res)=>res.status(503).send('<!doctype html><meta charset="utf-8"><title>Google sign-in setup</title><style>body{font-family:system-ui;max-width:700px;margin:60px auto;padding:24px}code{background:#eee;padding:3px 6px}</style><h1>Google sign-in is not configured yet</h1><p>The local beta needs Google OAuth credentials before Google sign-in can be enabled. Email/password login is available now.</p>'));
app.put('/api/profile', requireAuth, (req,res)=>{ const u=req.user; const b=req.body||{}; if(b.name!==undefined)u.name=String(b.name).trim().slice(0,60); if(b.age!==undefined)u.age=Math.max(13,Math.min(100,Number(b.age))); if(b.country!==undefined && countries.includes(b.country))u.country=b.country; if(b.level!==undefined && ['A1','A2','B1','B2','C1','C2'].includes(b.level))u.level=b.level; if(b.bio!==undefined)u.bio=String(b.bio).trim().slice(0,300); if(b.interests!==undefined)u.interests=normalizeInterests(b.interests); if(b.preferences)u.preferences={...u.preferences,...b.preferences}; saveDb(); res.json({user:publicUser(u)}); });
app.get('/api/history', requireAuth, (req,res)=>{ const rows=db.ratings.filter(r=>r.userId===req.user.id).map(r=>r.sessionId); const sessions=db.sessions; void sessions; res.json({ matches:Object.entries(req.user.met||{}).map(([userId,meta])=>({ user:publicUser(db.users.find(u=>u.id===userId)), times:meta.times, lastAt:meta.lastAt })).filter(x=>x.user) }); });
app.get('/api/achievements', requireAuth, (req,res)=>{ const mine=new Set(db.userAchievements.filter(x=>x.userId===req.user.id).map(x=>x.achievementId)); res.json({achievements:db.achievements.filter(a=>a.enabled).map(a=>({...a,unlocked:mine.has(a.id)}))}); });
app.get('/api/notifications', requireAuth, (req,res)=>res.json({notifications:db.notifications.filter(n=>n.userId===req.user.id).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,50)}));
app.get('/api/rules', (_req,res)=>res.json({rules:db.rules.filter(r=>r.enabled).sort((a,b)=>a.order-b.order)}));
app.post('/api/reviews', (req,res)=>{ const {rating,text}=req.body||{}; const n=Number(rating); if(n<1||n>5) return res.status(400).json({error:'Rating must be 1 to 5.'}); db.reviews.push({id:id(),rating:n,text:String(text||'').trim().slice(0,1000),createdAt:new Date().toISOString()}); saveDb(); res.json({ok:true}); });
app.post('/api/report', requireAuth, (req,res)=>{ const {targetId,category,details}=req.body||{}; if(!targetId||!category) return res.status(400).json({error:'Choose a report category.'}); db.reports.push({id:id(),userId:req.user.id,targetId,category:String(category),details:String(details||'').slice(0,1000),createdAt:new Date().toISOString(),status:'open'}); db.notifications.push({id:id(),userId:req.user.id,text:'Your report has been received.',createdAt:new Date().toISOString()}); saveDb(); res.json({ok:true}); });
app.post('/api/block', requireAuth, (req,res)=>{ const targetId=String(req.body?.targetId||''); if(!targetId||targetId===req.user.id) return res.status(400).json({error:'Invalid user.'}); if(!db.blocks.some(x=>x.userId===req.user.id&&x.blockedUserId===targetId))db.blocks.push({id:id(),userId:req.user.id,blockedUserId:targetId,createdAt:new Date().toISOString()}); saveDb(); res.json({ok:true}); });

function admin(req,res,next){ if(req.headers['x-admin-key']!==ADMIN_KEY) return res.status(401).json({error:'Unauthorized'}); next(); }
app.get('/api/admin/summary',admin,(_req,res)=>res.json({users:db.users.length,reports:db.reports.filter(r=>r.status==='open').length,reviews:db.reviews.length,achievements:db.achievements.length,topics:topics.length}));
app.get('/api/admin/settings',admin,(_req,res)=>res.json(db.settings));
app.put('/api/admin/settings',admin,(req,res)=>{db.settings={...db.settings,...req.body,callSeconds:Math.max(60,Math.min(1800,Number(req.body.callSeconds??db.settings.callSeconds))),introSeconds:Math.max(3,Math.min(30,Number(req.body.introSeconds??db.settings.introSeconds)))};saveDb();res.json(db.settings);});
app.get('/api/admin/reviews',admin,(_req,res)=>res.json({reviews:db.reviews.slice(-200).reverse()}));

const sockets=new Map();
const waiting=new Map(); // socket.id -> {userId, joinedAt}
const rooms=new Map(); // roomId -> room
function emitReady(){ io.emit('readyCount', waiting.size); }
function removeFromQueue(socketId){ waiting.delete(socketId); emitReady(); }
function finishRoom(roomId, reason='completed'){
  const room=rooms.get(roomId); if(!room || room.ended) return;
  room.ended=true; room.reason=reason; if(room.timer) clearTimeout(room.timer); if(room.introTimer) clearTimeout(room.introTimer);
  io.to(roomId).emit('sessionEnded',{roomId,reason,completed:reason==='completed',duration:reason==='completed'?db.settings.callSeconds:room.elapsed||0,peerId:null});
  if(reason==='completed') completeSession(room);
  setTimeout(()=>{rooms.delete(roomId);},10_000);
}
function completeSession(room){
  const now=new Date(); const a=db.users.find(u=>u.id===room.a.userId), b=db.users.find(u=>u.id===room.b.userId); if(!a||!b)return;
  const minutes=Math.round(db.settings.callSeconds/60);
  const pairs=[[a,b],[b,a]];
  for(const [u,p] of pairs){ u.stats.completed++; u.stats.minutes+=minutes; u.met[p.id]=u.met[p.id]||{times:0,lastAt:null}; u.met[p.id].times++; u.met[p.id].lastAt=now.toISOString(); u.stats.uniquePeople=Object.keys(u.met).length; u.stats.countries=new Set(Object.keys(u.met).map(id=>db.users.find(x=>x.id===id)?.country).filter(Boolean)).size; updateStreak(u,now); unlockAchievements(u); }
  db.notifications.push({id:id(),userId:a.id,text:'Conversation completed. Rate your partner.',createdAt:now.toISOString()},{id:id(),userId:b.id,text:'Conversation completed. Rate your partner.',createdAt:now.toISOString()});
  db.sessions.push({id:id(),roomId:room.id,a:a.id,b:b.id,duration:db.settings.callSeconds,status:'completed',createdAt:now.toISOString()});
  saveDb();
}
function updateStreak(u,now){ if(!db.settings.streaksEnabled)return; const day=now.toISOString().slice(0,10); const last=u.streak.lastActive; if(last===day)return; const prev=new Date(now); prev.setUTCDate(prev.getUTCDate()-1); const prevDay=prev.toISOString().slice(0,10); u.streak.current=last===prevDay?u.streak.current+1:1; u.streak.longest=Math.max(u.streak.longest,u.streak.current); u.streak.lastActive=day; if(!u.streak.activeDays.includes(day))u.streak.activeDays.push(day); if([3,7,14,30,60,100,365].includes(u.streak.current))db.notifications.push({id:id(),userId:u.id,text:`🔥 ${u.streak.current}-day streak!`,createdAt:now.toISOString()}); }
function unlockAchievements(u){ if(!db.settings.achievementsEnabled)return; for(const a of db.achievements.filter(x=>x.enabled)){ const already=db.userAchievements.some(x=>x.userId===u.id&&x.achievementId===a.id); if(already)continue; let value=0; if(a.metric==='conversations')value=u.stats.completed; if(a.metric==='minutes')value=u.stats.minutes; if(a.metric==='countries')value=u.stats.countries; if(a.metric==='streak')value=u.streak.current; if(value>=a.requirement){db.userAchievements.push({id:id(),userId:u.id,achievementId:a.id,unlockedAt:new Date().toISOString()});db.notifications.push({id:id(),userId:u.id,text:`🏆 Achievement unlocked: ${a.name}`,createdAt:new Date().toISOString()});}}}
function makeRoom(x,y){ const roomId=id(); const room={id:roomId,a:x,b:y,ended:false,startedAt:Date.now(),introTimer:null,timer:null}; rooms.set(roomId,room); x.roomId=roomId; y.roomId=roomId; const ua=db.users.find(u=>u.id===x.userId), ub=db.users.find(u=>u.id===y.userId); const topic=nextTopic();
  io.to(x.socketId).emit('matched',{roomId,role:'offerer',peerId:y.userId,introSeconds:db.settings.introSeconds,topic,partner:publicUser(ub)});
  io.to(y.socketId).emit('matched',{roomId,role:'answerer',peerId:x.userId,introSeconds:db.settings.introSeconds,topic,partner:publicUser(ua)});
  x.introReady=false; y.introReady=false;
  room.introTimer=setTimeout(()=>{io.to(roomId).emit('introFinished'); startCallTimer(room);},db.settings.introSeconds*1000);
}
function startCallTimer(room){ if(room.ended||room.timer)return; io.to(room.id).emit('callStarted',{seconds:db.settings.callSeconds,startedAt:Date.now()}); room.timer=setTimeout(()=>finishRoom(room.id,'completed'),db.settings.callSeconds*1000); }
function findMatch(){ const list=[...waiting.entries()].sort((a,b)=>a[1].joinedAt-b[1].joinedAt); for(let i=0;i<list.length;i++){ for(let j=i+1;j<list.length;j++){ const A=list[i][1],B=list[j][1]; const au=db.users.find(u=>u.id===A.userId),bu=db.users.find(u=>u.id===B.userId); if(eligible(au,bu)){waiting.delete(list[i][0]);waiting.delete(list[j][0]);emitReady();makeRoom(A,B);return;}}}}

io.on('connection',socket=>{
  socket.on('register',({userId})=>{ const u=db.users.find(x=>x.id===userId); if(!u){socket.emit('appError','Your account could not be found. Please sign in again.');return;} sockets.set(userId,socket.id); socket.data.userId=userId; socket.emit('registered',{user:publicUser(u),readyCount:waiting.size}); emitReady(); });
  socket.on('joinQueue',()=>{ const userId=socket.data.userId; if(!userId){socket.emit('queueError','Please wait for your account to connect.');return;} if(waiting.has(socket.id)){socket.emit('queueError','You are already searching.');return;} const u=db.users.find(x=>x.id===userId); if(!u){socket.emit('queueError','Please sign in again.');return;} waiting.set(socket.id,{userId,socketId:socket.id,joinedAt:Date.now()}); socket.emit('queueJoined',{readyCount:waiting.size}); emitReady(); findMatch(); });
  socket.on('leaveQueue',()=>{removeFromQueue(socket.id);socket.emit('queueLeft');});
  socket.on('signal',({roomId,toUserId,data})=>{ const target=sockets.get(toUserId); if(target)io.to(target).emit('signal',{roomId,fromUserId:socket.data.userId,data}); });
  socket.on('introReady',({roomId})=>{const r=rooms.get(roomId);if(!r)return; const side=r.a.socketId===socket.id?r.a:r.b; side.introReady=true; if(r.a.introReady&&r.b.introReady){ if(r.introTimer)clearTimeout(r.introTimer); io.to(roomId).emit('introFinished'); startCallTimer(r); }});
  socket.on('report',({roomId,targetId,category,details})=>{ const u=db.users.find(x=>x.id===socket.data.userId); if(!u)return; db.reports.push({id:id(),userId:u.id,targetId,category,details:String(details||'').slice(0,1000),createdAt:new Date().toISOString(),status:'open'}); saveDb(); socket.emit('reportSaved'); });
  socket.on('block',({targetId})=>{const u=db.users.find(x=>x.id===socket.data.userId);if(!u)return;if(!db.blocks.some(x=>x.userId===u.id&&x.blockedUserId===targetId))db.blocks.push({id:id(),userId:u.id,blockedUserId:targetId,createdAt:new Date().toISOString()});saveDb();socket.emit('blockSaved');});
  socket.on('rate',({sessionId,targetId,choice})=>{ const userId=socket.data.userId; if(!['better','same','worse'].includes(choice)||!targetId)return; if(db.ratings.some(r=>r.sessionId===sessionId&&r.userId===userId))return; db.ratings.push({id:id(),sessionId,userId,targetId,choice,createdAt:new Date().toISOString()});saveDb();socket.emit('ratingSaved'); });
  socket.on('disconnect',()=>{ removeFromQueue(socket.id); const userId=socket.data.userId; if(userId&&sockets.get(userId)===socket.id)sockets.delete(userId); for(const r of rooms.values()){ if(r.ended)continue; if(r.a.socketId===socket.id||r.b.socketId===socket.id){r.elapsed=Math.max(0,Math.floor((Date.now()-r.startedAt)/1000));finishRoom(r.id,'connection_lost');} } });
});

app.get(/.*/,(req,res)=>{ if(req.path.startsWith('/api/')||req.path.startsWith('/auth/')) return res.status(404).json({error:'Not found'}); res.sendFile(path.join(__dirname,'public','index.html')); });
server.listen(PORT,'0.0.0.0',()=>console.log(`HADALeng v7 running on http://localhost:${PORT}`));
