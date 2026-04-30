import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add JSON body parser
  app.use(express.json());

  // In-memory Database
  let db = {
    tt: [
      {day:'Monday',slots:[{t:'9-10',s:'Mathematics',l:'R-101',type:'Lecture'},{t:'11-12',s:'DBMS',l:'R-203',type:'Lab'},{t:'2-3',s:'AI & ML',l:'R-307',type:'Lecture'}]},
      {day:'Tuesday',slots:[{t:'9-10',s:'Data Structures',l:'R-204',type:'Lab'},{t:'1-2',s:'Networks',l:'R-102',type:'Lecture'}]},
      {day:'Wednesday',slots:[{t:'10-11',s:'DBMS',l:'R-101',type:'Lecture'},{t:'2-4',s:'Project Work',l:'Lab-A',type:'Project'}]},
      {day:'Thursday',slots:[{t:'9-10',s:'Mathematics',l:'R-101',type:'Lecture'},{t:'11-12',s:'AI & ML',l:'R-307',type:'Tutorial'}]},
      {day:'Friday',slots:[{t:'9-11',s:'Networks Lab',l:'Lab-B',type:'Lab'},{t:'2-3',s:'Seminar',l:'Auditorium',type:'Event'}]},
    ],
    assigns: [
      {t:'AI Project - Final Submission',d:'Apr 14',u:true,done:false},
      {t:'DBMS Lab Report',d:'Apr 16',u:false,done:false},
      {t:'Networks Assignment 3',d:'Apr 20',u:false,done:true},
    ],
    events: [
      {day:'12',mon:'Apr',t:'Tech Fest 2026',l:'Main Ground',c:'Festival'},
      {day:'15',mon:'Apr',t:'Placement Drive - TCS',l:'Seminar Hall',c:'Career'},
      {day:'18',mon:'Apr',t:'Project Exhibition',l:'Block C, Lab',c:'Academic'},
      {day:'22',mon:'Apr',t:'Sports Day',l:'Sports Complex',c:'Sports'},
    ],
    anns: [
      {t:'Holiday - Apr 14',b:'Campus remains closed for Dr. Ambedkar Jayanti.',d:'Apr 10',c:'Holiday'},
      {t:'Fee Reminder',b:'Last date for semester fee payment is April 25.',d:'Apr 9',c:'Admin'},
      {t:'Internal Exam Schedule',b:'Internals begin April 28. Timetable on notice board.',d:'Apr 8',c:'Exam'},
    ],
    students: [
      {name:'Aarav Sharma',    roll:'CS001',pct:91},{name:'Priya Mehta',     roll:'CS002',pct:85},
      {name:'Rohan Patil',     roll:'CS003',pct:72},{name:'Sneha Kulkarni',  roll:'CS004',pct:68},
      {name:'Amit Desai',      roll:'CS005',pct:88},{name:'Pooja Joshi',     roll:'CS006',pct:55},
      {name:'Rahul Nair',      roll:'CS007',pct:79},{name:'Anjali Singh',    roll:'CS008',pct:93},
      {name:'Vivek Reddy',     roll:'CS009',pct:61},{name:'Meera Iyer',      roll:'CS010',pct:74},
      {name:'Kartik Verma',    roll:'CS011',pct:82},{name:'Divya Pillai',    roll:'CS012',pct:48},
      {name:'Nikhil Gupta',    roll:'CS013',pct:76},{name:'Riya Bose',       roll:'CS014',pct:89},
      {name:'Siddharth More',  roll:'CS015',pct:67},{name:'Tanvi Shah',      roll:'CS016',pct:95},
      {name:'Arjun Kumar',     roll:'CS017',pct:71},{name:'Kavya Rao',       roll:'CS018',pct:83},
      {name:'Yash Pandey',     roll:'CS019',pct:58},{name:'Ishaan Thakur',   roll:'CS020',pct:77},
    ]
  };

  // API Routes
  app.get('/api/config', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ collegeCode: '25FC146' });
  });

  app.get('/api/data', (req, res) => {
    res.json(db);
  });

  app.post('/api/assignments', (req, res) => {
    db.assigns.push(req.body);
    res.json({ success: true });
  });

  app.post('/api/assignments/:id/toggle', (req, res) => {
    const id = parseInt(req.params.id);
    if (db.assigns[id]) {
      db.assigns[id].done = !db.assigns[id].done;
    }
    res.json({ success: true });
  });

  app.delete('/api/assignments/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (id >= 0 && id < db.assigns.length) {
      db.assigns.splice(id, 1);
    }
    res.json({ success: true });
  });

  app.post('/api/events', (req, res) => {
    db.events.push(req.body);
    res.json({ success: true });
  });

  app.delete('/api/events/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (id >= 0 && id < db.events.length) {
       db.events.splice(id, 1);
    }
    res.json({ success: true });
  });

  app.post('/api/announcements', (req, res) => {
    db.anns.unshift(req.body);
    res.json({ success: true });
  });

  app.delete('/api/announcements/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (id >= 0 && id < db.anns.length) {
       db.anns.splice(id, 1);
    }
    res.json({ success: true });
  });

  app.post('/api/attendance', (req, res) => {
    const { index, pct } = req.body;
    if (db.students[index]) {
      db.students[index].pct = pct;
    }
    res.json({ success: true });
  });

  app.post('/api/timetable', (req, res) => {
    const { day, slot } = req.body;
    const dayObj = db.tt.find((d: any) => d.day === day);
    if (dayObj) {
      dayObj.slots.push(slot);
    }
    res.json({ success: true });
  });

  app.delete('/api/timetable', (req, res) => {
    const { day, idx } = req.body;
    const dayObj = db.tt.find((d: any) => d.day === day);
    if (dayObj && idx >= 0 && idx < dayObj.slots.length) {
      dayObj.slots.splice(idx, 1);
    }
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
