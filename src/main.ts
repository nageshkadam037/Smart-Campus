import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

let userRole='student';
let userDivision='A';
let collegeCode = '25FC146';
const pages=['dashboard','schedule','assignments','events','announcements','attendance'];

async function syncCollegeCode() {
  try {
    const docSnap = await getDoc(doc(db, 'system', 'config'));
    if (docSnap.exists() && docSnap.data().collegeCode) {
      collegeCode = docSnap.data().collegeCode;
    } else {
      collegeCode = '25FC146';
    }
  } catch(e) {
    console.warn('Config fetch failed, using default.');
    collegeCode = '25FC146';
  }
}

const googleProvider = new GoogleAuthProvider();

(window as any).doGoogleLogin = async function() {
  hideError('l-err');

  const codeVal = (document.getElementById('l-code') as HTMLInputElement)?.value;

  if (!codeVal) {
    showError('l-err', 'Please enter the College Access Code before continuing with Google.');
    return;
  }

  if (userRole === 'faculty') {
    if (codeVal !== '25FC01') {
      showError('l-err', 'Invalid College Access Code for Faculty.');
      return;
    }
  } else {
    await syncCollegeCode();
    if (codeVal !== collegeCode) {
      showError('l-err', 'Invalid College Access Code.');
      return;
    }
  }

  try {
    const cred = await signInWithPopup(auth, googleProvider);
    // Check if user exists in Firestore
    const docSnap = await getDoc(doc(db, 'users', cred.user.uid));
    if (!docSnap.exists()) {
      // First time Google login, create profile
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: cred.user.displayName || 'User',
        email: cred.user.email || '',
        phone: cred.user.phoneNumber || '',
        role: userRole, 
        division: userDivision,
        createdAt: Date.now()
      });
    }
  } catch(e: any) {
    console.error(e);
    showError('l-err', e.message);
  }
};

let tt: any[] = [];
let assigns: any[] = [];
let events: any[] = [];
let anns: any[] = [];
let students: any[] = [];

// Fetch initial data from backend
async function fetchInitialData() {
  try {
    const docSnap = await getDoc(doc(db, 'system', `data_${userDivision}`));
    let data: any;
    if (docSnap.exists()) {
      data = docSnap.data();
      const divCStudentsData = [
        { roll: '25FC301', name: 'TUSHAR JAYANT DESAI' },
        { roll: '25FC302', name: 'MUKHARJEE DIVAKAR SHAMIRON' },
        { roll: '25FC303', name: 'KALASH SURESH LADDHA' },
        { roll: '25FC304', name: 'PATIL ASHUTOSH CHETANSINGH' },
        { roll: '25FC305', name: 'GADHE GAURESH DHANANJAY' },
        { roll: '25FC306', name: 'SUNIDHI BANGERA' },
        { roll: '25FC307', name: 'SUJAL NANDLAL CHAUDHARI' },
        { roll: '25FC308', name: 'PAPADKAR ANISH PRAVIN' },
        { roll: '25FC309', name: 'SHREE MANOJ WAYADANDE' },
        { roll: '25FC310', name: 'TEMBHURNE SANDHYA ARUN' },
        { roll: '25FC311', name: 'WAISE VEDANT ANIL' },
        { roll: '25FC312', name: 'URWANSH RAGHUWANSHI' },
        { roll: '25FC313', name: 'OM SHYAM AHIR' },
        { roll: '25FC314', name: 'RITESH R UBALE' },
        { roll: '25FC315', name: 'AARYA NARESHKUMAR JAIN' },
        { roll: '25FC316', name: 'YASH JITENDRA CHAUDHARI' },
        { roll: '25FC317', name: 'ALOK KUMAR SHUKLA' },
        { roll: '25FC318', name: 'MRUNALINI PRAKASH PATIL' },
        { roll: '25FC319', name: 'RASIKA RANGRAO CHAVAN' },
        { roll: '25FC320', name: 'KOTWAL AKHILESH DINKARRAO' },
        { roll: '25FC321', name: 'PATIL RONIT RAVINDRA' },
        { roll: '25FC322', name: 'ISHWARI PRASAD SALJOSHI' },
        { roll: '25FC323', name: 'SARTHAK RAJU JAGNADE' },
        { roll: '25FC324', name: 'PURVA NILESH DESAI' },
        { roll: '25FC325', name: 'PRATHMESH DURGESH SALUNKE' },
        { roll: '25FC326', name: 'ARNAV PRASHANT SALUNKHE' },
        { roll: '25FC327', name: 'VISHWASE ADITI SACHIN' },
        { roll: '25FC328', name: 'RAUT MANJUSHA GOVIND' },
        { roll: '25FC329', name: 'SAARTH AMOL DALVI' },
        { roll: '25FC330', name: 'SHRUTIKA BHAND' },
        { roll: '25FC331', name: 'SUPRATIM LASKAR' },
        { roll: '25FC332', name: 'SWAYAM VILAS JADHAV' },
        { roll: '25FC333', name: 'RASHI DATTRAO LAHORKAR' },
        { roll: '25FC334', name: 'AYUSH GAJANAN INGLE' },
        { roll: '25FC335', name: 'FAARIAH NADEEM SIDDIQUI' },
        { roll: '25FC336', name: 'AVANEESH SAMEER YAJURVEDI' },
        { roll: '25FC337', name: 'CHAVAN SIDDHI JAGANNATH' },
        { roll: '25FC338', name: 'NEELAM CHOUDHARY' },
        { roll: '25FC339', name: 'OMKAR CHAVAN' },
        { roll: '25FC340', name: 'OM RACHKAR' },
        { roll: '25FC341', name: 'VEDIKA SUDHEER YADAV' },
        { roll: '25FC342', name: 'SHRUTI RAJ' },
        { roll: '25FC343', name: 'BHOSALE SUMIT SANJAY' },
        { roll: '25FC344', name: 'YASH ROHIDAS GHAYAT' },
        { roll: '25FC345', name: 'SUHAS KAILAS KOLHE' },
        { roll: '25FC346', name: 'AMBIKA TAPSHALE' },
        { roll: '25FC347', name: 'OMKAR MAHESH DEOKAR' },
        { roll: '25FC348', name: 'BHAGVATI DHONDIBA BOBADE' },
        { roll: '25FC349', name: 'SAMAIRA DEEPAK SABALE' },
        { roll: '25FC350', name: 'DHRUV DATTATRAY BABAR' },
        { roll: '25FC351', name: 'JANHVI JAISING PATIL' },
        { roll: '25FC352', name: 'NAGESH DATTA KADAM' },
        { roll: '25FC353', name: 'BHOR ADITYA GOVIND' },
        { roll: '25FC354', name: 'SONAWANE SUMIT' },
        { roll: '25FC355', name: 'JOSHI KAUSTUBH SATISH' },
        { roll: '25FC356', name: 'VARAD KAILAS KOTKAR' },
        { roll: '25FC357', name: 'KHADKE MIHIR VIJAY' },
        { roll: '25FC358', name: 'MANAS SACHIN DIXIT' },
        { roll: '25FC359', name: 'ADITYA UDAYSING GURAV' },
        { roll: '25FC360', name: 'JAYDEEP JITENDRA BHOITE' },
        { roll: '25FC361', name: 'SOHAM DOIPHODE' },
        { roll: '25FC362', name: 'PALASH MAHESH CHHATRE' },
        { roll: '25FC363', name: 'VEDANT VERMA' },
        { roll: '25FC364', name: 'GAURAV VIJAY PATIL' },
        { roll: '25FC365', name: 'ARJUN DEEPAK GUJAR' },
        { roll: '25FC366', name: 'BHULE PRANIT SACHIDANAND' },
        { roll: '25FC367', name: 'NEHA PRASAD BHITALE' },
        { roll: '25FC368', name: 'MANNAT KAUR BAGGA' },
        { roll: '25FC369', name: 'AHIRE VINALI SANJAY' },
        { roll: '25FC370', name: 'ANUSHKA PRAVIN DESHMUKH' }
      ];

      // Update names and handle missing entries
      let needsUpdate = false;
      if (!data.students || data.students.length < 70) {
        data.students = divCStudentsData.map((s, i) => ({
          name: s.name,
          roll: s.roll,
          pct: Math.floor(Math.random() * 41) + 60
        }));
        needsUpdate = true;
      } else {
        // If data loaded but we want to make sure the names are exact Div C ones
        for (let i = 0; i < 70; i++) {
          if (data.students[i] && (data.students[i].name !== divCStudentsData[i].name || data.students[i].roll !== divCStudentsData[i].roll)) {
             data.students[i].name = divCStudentsData[i].name;
             data.students[i].roll = divCStudentsData[i].roll;
             needsUpdate = true;
          }
        }
      }

      if (needsUpdate && userRole === 'faculty') {
        await setDoc(doc(db, 'system', `data_${userDivision}`), data);
      }
    } else {
      // Default initial data
      data = {
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
        students: Array.from({length: 70}, (_, i) => ({
          name: ['Aarav','Priya','Rohan','Sneha','Amit','Pooja','Rahul','Anjali','Vivek','Meera','Arjun','Neha','Karan','Kavya','Vikram','Aditi','Varun','Shruti','Yash','Riya'][i % 20] + ' ' + ['Sharma','Mehta','Patil','Kulkarni','Desai','Joshi','Nair','Singh','Reddy','Iyer','Kumar','Gupta','Verma','Tiwari','Mishra','Rao','Das','Nath','Bose','Ghosh'][(i + Math.floor(i/20)) % 20],
          roll: 'CS' + userDivision + String(i + 1).padStart(3, '0'),
          pct: Math.floor(Math.random() * 41) + 60
        }))
      };
      if (userRole === 'faculty') {
        await setDoc(doc(db, 'system', `data_${userDivision}`), data);
      }
    }
    tt = data.tt || [];
    assigns = data.assigns || [];
    events = data.events || [];
    anns = data.anns || [];
    students = data.students || [];
    
    // If we're already on the app page, re-render
    if (document.getElementById('app')?.classList.contains('active')) {
      renderAll();
    }
    // Update counts for notifications
    if (typeof (window as any).lastAnnsCount === 'undefined') (window as any).lastAnnsCount = anns.length;
    if (typeof (window as any).lastAssignsCount === 'undefined') (window as any).lastAssignsCount = assigns.length;
    
  } catch (error) {
    console.error('Failed to fetch data', error);
  }
}

async function saveDb() {
  try {
    if (userRole === 'faculty') {
      await setDoc(doc(db, 'system', `data_${userDivision}`), { tt, assigns, events, anns, students });
    }
  } catch (e) {
    console.error('Failed to save to Firestore', e);
  }
}

let notifInterval: any;
let notifiedSlots: {[key:string]: boolean} = {};

function initPushNotifications() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  
  if(notifInterval) clearInterval(notifInterval);
  
  notifInterval = setInterval(async () => {
    try {
      const docSnap = await getDoc(doc(db, 'system', `data_${userDivision}`));
      const data = docSnap.exists() ? docSnap.data() : {anns:[], assigns:[], events:[], tt:[], students:[]};
      
      const currAnns = data.anns ? data.anns.length : 0;
      const currAssigns = data.assigns ? data.assigns.length : 0;
      
      const currEvents = data.events ? data.events.length : 0;
      
      const lastAnns = (window as any).lastAnnsCount ?? currAnns;
      const lastAssigns = (window as any).lastAssignsCount ?? currAssigns;
      const lastEvents = (window as any).lastEventsCount ?? currEvents;
      
      const hasPerms = Notification.permission === 'granted';

      if (currAnns !== lastAnns) {
        if (hasPerms && currAnns > lastAnns && lastAnns > 0) {
          new Notification('Important Notification', { body: data.anns[0]?.t || 'New update posted' });
        }
      }
      
      if (currAssigns !== lastAssigns) {
        if (hasPerms && currAssigns > lastAssigns && lastAssigns > 0) {
          const newAsg = data.assigns[data.assigns.length - 1];
          new Notification('New Assignment', { body: `${newAsg?.t} due ${newAsg?.d||'soon'}` });
        }
      }
      
      const currentDataStr = JSON.stringify({tt:data.tt, a:data.assigns, e:data.events, n:data.anns});
      if ((window as any).lastDataStr && (window as any).lastDataStr !== currentDataStr) {
        tt = data.tt || [];
        assigns = data.assigns || [];
        events = data.events || [];
        anns = data.anns || [];
        students = data.students || [];
        if (document.getElementById('app')?.classList.contains('active')) {
          renderAll();
        }
      }
      (window as any).lastDataStr = currentDataStr;
      
      (window as any).lastAnnsCount = currAnns;
      (window as any).lastAssignsCount = currAssigns;
      (window as any).lastEventsCount = currEvents;
      
      // Schedule check
      const now = new Date();
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const todayStr = days[now.getDay()];
      const todaySchedule = data.tt?.find((d:any) => d.day === todayStr);
      
      if (todaySchedule && todaySchedule.slots) {
        todaySchedule.slots.forEach((slot:any) => {
          let startHour = -1, startMin = 0;
          if(slot.t.includes('-')) {
              let s = slot.t.split('-')[0].trim();
              if(s.includes(':')) {
                  startHour = parseInt(s.split(':')[0]);
                  startMin = parseInt(s.split(':')[1]);
              } else {
                  startHour = parseInt(s);
              }
              if(startHour < 8) startHour += 12; // convert to PM
          } else if (slot.t.includes(':')) {
              startHour = parseInt(slot.t.split(':')[0]);
              startMin = parseInt(slot.t.split(':')[1]);
              if(startHour < 8) startHour += 12;
          }
          
          if(startHour >= 0) {
              const classTime = new Date();
              classTime.setHours(startHour, startMin, 0, 0);
              const diffMins = (classTime.getTime() - now.getTime()) / 60000;
              
              if(diffMins >= 0 && diffMins <= 5) {
                  const slotId = todayStr + slot.t + slot.s;
                  if(!notifiedSlots[slotId]) {
                      if (hasPerms) new Notification('Upcoming Class', { body: `${slot.s} starts at ${slot.t} in ${slot.l}` });
                      notifiedSlots[slotId] = true;
                  }
              }
          }
        });
      }
    } catch(e) {
      console.error('Notification check failed', e);
    }
  }, 10000); // Check every 10s
}

// Global functions need to be on window for inline handlers
(window as any).go = function(id: string){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
};

(window as any).setRole = function(r: string){
  userRole=r;
  document.querySelectorAll('.rtab').forEach(el=>el.classList.remove('on'));
  document.querySelectorAll('#rt-'+r+'-reg').forEach(el=>el.classList.add('on'));
  document.querySelectorAll('#rt-'+r+'-log').forEach(el=>el.classList.add('on'));
};

(window as any).togglePw = function(inputId: string, iconId: string) {
  const inp = document.getElementById(inputId) as HTMLInputElement;
  const icon = document.getElementById(iconId);
  if (!inp || !icon) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    inp.type = 'password';
    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
  }
};

function showError(id: string, msg: string) {
  const el = document.getElementById(id);
  if(el) { el.textContent = msg; el.style.display = 'block'; }
}
function hideError(id: string) {
  const el = document.getElementById(id);
  if(el) el.style.display = 'none';
}

(window as any).doLogin = async function(){
  const email=(document.getElementById('l-email') as HTMLInputElement).value;
  const code=(document.getElementById('l-code') as HTMLInputElement).value;
  
  if(!email || !code) return showError('l-err', 'Please fill email and college code');
  
  if (userRole === 'faculty') {
    if (code !== '25FC01') {
      return showError('l-err', 'Invalid College Access Code for Faculty.');
    }
  } else {
    await syncCollegeCode();
    if (code !== collegeCode) {
      return showError('l-err', 'Invalid College Access Code.');
    }
  }

  const pass = email.toLowerCase() + "Campus#123!";

  hideError('l-err');
  
  const btn = document.getElementById('l-btn') as HTMLButtonElement;
  btn.disabled = true; btn.textContent = 'Logging in...';

  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch(e: any) {
    if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, 'users', cred.user.uid), {
          name: email.split('@')[0], email, phone: '', role: userRole, division: userDivision, createdAt: Date.now()
        });
        return;
      } catch (regErr: any) {
        if (regErr.code === 'auth/email-already-in-use') {
          showError('l-err', `Old account detected! Since you removed the password field, you must delete this user (${email}) in your Firebase Authentication Console first. Then try again!`);
        } else {
          showError('l-err', 'Invalid credentials or ' + regErr.message);
        }
      }
    } else if(e.code === 'auth/operation-not-allowed') {
      showError('l-err', 'Email/Password auth is not enabled in Firebase Console. Please enable it in Authentication -> Sign-in method.');
    } else {
      showError('l-err', e.message);
    }
    btn.disabled = false; btn.textContent = 'Sign In';
  }
};

// Monitor Auth State
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await syncCollegeCode();
    // User is logged in, fetch their profile
    try {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        const isOnLogin = document.getElementById('login')?.classList.contains('active');
        if (isOnLogin && data.role && data.role !== userRole) {
          await signOut(auth);
          (window as any).setRole(data.role);
          showError('l-err', `This account is registered as a ${data.role}. Please select ${data.role} above to sign in.`);
          const btn = document.getElementById('l-btn') as HTMLButtonElement;
          if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
          return;
        }
        userRole = data.role || 'student';
        userDivision = data.division || 'A';
        
        (window as any).finishAuth(data.name || 'User', data.email || user.email, data.phone || '');
      } else {
        // Fallback if no profile doc
        (window as any).finishAuth('User', user.email, '');
      }
    } catch(e) {
      console.error(e);
      (window as any).finishAuth('User', user.email, '');
    }
  } else {
    // User is logged out
    (window as any).go('login');
  }
});

(window as any).finishAuth = function(name: string, email: string, phone: string){
  const ini=name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  (document.getElementById('topAvatar') as HTMLElement).textContent=ini;
  (document.getElementById('topName') as HTMLElement).textContent=name;
  (document.getElementById('topRole') as HTMLElement).textContent=(userRole.charAt(0).toUpperCase()+userRole.slice(1)) + ' (Div ' + userDivision + ')';
  (document.getElementById('bigAvatarTxt') as HTMLElement).textContent=ini;
  (document.getElementById('drawerName') as HTMLElement).textContent=name;
  (document.getElementById('drawerBadge') as HTMLElement).textContent=(userRole.charAt(0).toUpperCase()+userRole.slice(1)) + ' (Div ' + userDivision + ')';
  (document.getElementById('pf-name') as HTMLInputElement).value=name;
  (document.getElementById('pf-email') as HTMLInputElement).value=email;
  (document.getElementById('pf-phone') as HTMLInputElement).value=phone;

  if(userRole==='admin' || userRole==='faculty'){
    (document.getElementById('facAnn') as HTMLElement).style.display='block';
    (document.getElementById('facAssign') as HTMLElement).style.display='block';
    (document.getElementById('studentAssignNote') as HTMLElement).style.display='none';
    (document.getElementById('pf-id-label') as HTMLElement).textContent='Faculty ID';
    (document.getElementById('pf-id') as HTMLInputElement).value='FAC2024-0042';
    (document.getElementById('sn-attendance') as HTMLElement).style.display='flex';
    (document.getElementById('bn-attendance') as HTMLElement).style.display='flex';
    (document.getElementById('studentAttCard') as HTMLElement).style.display='none';
    (document.getElementById('facEvent') as HTMLElement).style.display='block';
    (document.getElementById('facSchedule') as HTMLElement).style.display='block';
    (document.getElementById('exportCsvBtn') as HTMLButtonElement).style.display='block';
  } else {
    (document.getElementById('facAssign') as HTMLElement).style.display='none';
    (document.getElementById('studentAssignNote') as HTMLElement).style.display='block';
    (document.getElementById('facAnn') as HTMLElement).style.display='none';
    (document.getElementById('pf-id-label') as HTMLElement).textContent='Student ID';
    (document.getElementById('pf-id') as HTMLInputElement).value='SC2024-0187';
    (document.getElementById('sn-attendance') as HTMLElement).style.display='none';
    (document.getElementById('bn-attendance') as HTMLElement).style.display='none';
    (document.getElementById('studentAttCard') as HTMLElement).style.display='block';
    (document.getElementById('facEvent') as HTMLElement).style.display='none';
    (document.getElementById('facSchedule') as HTMLElement).style.display='none';
    (document.getElementById('exportCsvBtn') as HTMLButtonElement).style.display='none';
    setTimeout(() => {
      const circle = document.getElementById('att-circle');
      if(circle) {
        circle.style.strokeDashoffset = '13'; // 100 - 87
      }
    }, 100);
  }
  (window as any).go('app'); 
  fetchInitialData().then(() => renderAll());
  initPushNotifications();
};

(window as any).doLogout = async function(){
  await signOut(auth);
  (window as any).setRole('student');
};
(window as any).openDrawer = function(){document.getElementById('drawer-overlay')?.classList.add('open');};
(window as any).closeDrawer = function(e: any){if(e.target===document.getElementById('drawer-overlay'))(window as any).closeDrawerDirect();};
(window as any).closeDrawerDirect = function(){document.getElementById('drawer-overlay')?.classList.remove('open');};

(window as any).toggleTheme = function() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcon(isDark);
};

function updateThemeIcon(isDark: boolean) {
  const moon = document.getElementById('icon-moon');
  const sun = document.getElementById('icon-sun');
  if(moon && sun) {
    if(isDark) {
      moon.style.display = 'none';
      sun.style.display = 'block';
    } else {
      moon.style.display = 'block';
      sun.style.display = 'none';
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) document.documentElement.classList.add('dark');
  updateThemeIcon(isDark);
});

let cropperInst: Cropper | null = null;

(window as any).triggerPic = function(){document.getElementById('picInput')?.click();};

(window as any).handlePic = function(e: any){
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=(ev: any)=>{
    const cropOverlay = document.getElementById('crop-overlay');
    const cropTarget = document.getElementById('cropTarget') as HTMLImageElement;
    if(cropOverlay && cropTarget) {
      cropTarget.src = ev.target.result;
      cropOverlay.style.display = 'flex';
      
      if(cropperInst) cropperInst.destroy();
      cropperInst = new Cropper(cropTarget, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 1,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
      });
    }
  };
  r.readAsDataURL(f);
  // Clear input so same file can be selected again
  e.target.value = '';
};

(window as any).cancelCrop = function() {
  const cropOverlay = document.getElementById('crop-overlay');
  if(cropOverlay) cropOverlay.style.display = 'none';
  if(cropperInst) {
    cropperInst.destroy();
    cropperInst = null;
  }
};

(window as any).applyCrop = function() {
  if(!cropperInst) return;
  const canvas = cropperInst.getCroppedCanvas({
    width: 256,
    height: 256
  });
  if(canvas) {
    const dataUrl = canvas.toDataURL('image/png');
    const i = document.getElementById('bigAvatarImg') as HTMLImageElement;
    i.src = dataUrl;
    i.style.display = 'block';
    (document.getElementById('bigAvatarTxt') as HTMLElement).style.display = 'none';
    
    // Also update top avatar to cropped image
    const topAvatar = document.getElementById('topAvatar') as HTMLElement;
    topAvatar.innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
  }
  (window as any).cancelCrop();
};

(window as any).saveProfile = function(){
  const name=(document.getElementById('pf-name') as HTMLInputElement).value||'User';
  const ini=name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  (document.getElementById('topAvatar') as HTMLElement).textContent=ini;
  (document.getElementById('topName') as HTMLElement).textContent=name;
  (document.getElementById('drawerName') as HTMLElement).textContent=name;
  if((document.getElementById('bigAvatarImg') as HTMLElement).style.display==='none') (document.getElementById('bigAvatarTxt') as HTMLElement).textContent=ini;
  const m=document.getElementById('savedMsg') as HTMLElement; m.textContent='Profile saved!'; setTimeout(()=>m.textContent='',2500);
};

(window as any).showPage = function(p: string){
  document.querySelectorAll('.pg').forEach(el=>el.classList.remove('on'));
  document.getElementById('pg-'+p)?.classList.add('on');
  pages.forEach(x=>{
    const s=document.getElementById('sn-'+x),b=document.getElementById('bn-'+x);
    if(s) s.classList.toggle('on',x===p);
    if(b) b.classList.toggle('on',x===p);
  });
  
  if (p === 'dashboard') {
      const circle = document.getElementById('att-circle');
      if(circle) {
        circle.style.transition = 'none';
        circle.style.strokeDashoffset = '100';
        setTimeout(() => {
          circle.style.transition = 'stroke-dashoffset 1.5s ease-out';
          circle.style.strokeDashoffset = '13'; // 100 - 87
        }, 50);
      }
  }
};

(window as any).toggleAssign = async function(i: number){
  if (assigns[i]) {
    assigns[i].done = !assigns[i].done;
    renderAssigns();
    await saveDb();
  }
};

let pendingFile: File | null = null;
(window as any).handleFileSelect = function(e: any){
  const f=e.target.files[0];
  if(!f) return;
  pendingFile=f;
  const lbl=document.getElementById('fileLabel');
  if(lbl) {
      (document.getElementById('fileLabelTxt') as HTMLElement).textContent=f.name;
      lbl.classList.add('has-file');
  }
};

(window as any).addAssign = async function(){
  const v=(document.getElementById('newA') as HTMLInputElement).value;
  const d=(document.getElementById('newD') as HTMLInputElement).value;
  if(!v) return;
  const entry: any={t:v,d:d||'TBD',u:false,done:false,file:null};
  if(pendingFile){
    const url=URL.createObjectURL(pendingFile);
    entry.file={name:pendingFile.name,url:url};
  }
  assigns.push(entry);
  (document.getElementById('newA') as HTMLInputElement).value='';
  (document.getElementById('newD') as HTMLInputElement).value='';
  (document.getElementById('newFile') as HTMLInputElement).value='';
  (document.getElementById('fileLabelTxt') as HTMLElement).textContent='Attach document (PDF, DOCX, PPT...)';
  document.getElementById('fileLabel')?.classList.remove('has-file');
  pendingFile=null;
  renderAssigns();
  await saveDb();
};

let pendingEvFile: File | null=null;
(window as any).handleEvFile = function(ev: any){
  const f=ev.target.files[0]; if(!f) return;
  pendingEvFile=f;
  (document.getElementById('evFileLabelTxt') as HTMLElement).textContent=f.name;
  document.getElementById('evFileLabel')?.classList.add('has-file');
};

(window as any).addEvent = async function(){
  if(userRole!=='faculty') return;
  const t=(document.getElementById('evTitle') as HTMLInputElement).value;
  if(!t) return;
  const entry: any={
    t:t,
    day:(document.getElementById('evDay') as HTMLInputElement).value||'?',
    mon:(document.getElementById('evMon') as HTMLInputElement).value||'Apr',
    l:(document.getElementById('evLoc') as HTMLInputElement).value||'Campus',
    c:(document.getElementById('evCat') as HTMLInputElement).value,
    file:null
  };
  if(pendingEvFile) entry.file={name:pendingEvFile.name,url:URL.createObjectURL(pendingEvFile)};
  events.push(entry);
  (document.getElementById('evTitle') as HTMLInputElement).value='';
  (document.getElementById('evDay') as HTMLInputElement).value='';
  (document.getElementById('evMon') as HTMLInputElement).value='';
  (document.getElementById('evLoc') as HTMLInputElement).value='';
  (document.getElementById('evFile') as HTMLInputElement).value='';
  (document.getElementById('evFileLabelTxt') as HTMLElement).textContent='Attach document (optional)';
  document.getElementById('evFileLabel')?.classList.remove('has-file');
  pendingEvFile=null;
  renderEvents();
  await saveDb();
};

let pendingAnnFile: File | null=null;
(window as any).handleAnnFile = function(e: any){
  const f=e.target.files[0]; if(!f) return;
  pendingAnnFile=f;
  const lbl=document.getElementById('annFileLabel');
  (document.getElementById('annFileLabelTxt') as HTMLElement).textContent=f.name;
  lbl?.classList.add('has-file');
};

(window as any).addAnn = async function(){
  if(userRole!=='faculty') return;
  const t=(document.getElementById('annT') as HTMLInputElement).value;
  const b=(document.getElementById('annB') as HTMLInputElement).value;
  if(!t) return;
  const entry: any={t:t,b:b||'',d:'Today',c:'Urgent',file:null};
  if(pendingAnnFile){
    entry.file={name:pendingAnnFile.name,url:URL.createObjectURL(pendingAnnFile)};
  }
  anns.unshift(entry);
  (document.getElementById('annT') as HTMLInputElement).value='';
  (document.getElementById('annB') as HTMLInputElement).value='';
  (document.getElementById('annFile') as HTMLInputElement).value='';
  (document.getElementById('annFileLabelTxt') as HTMLElement).textContent='Attach document (optional)';
  document.getElementById('annFileLabel')?.classList.remove('has-file');
  pendingAnnFile=null;
  renderAnns();
  await saveDb();
};

(window as any).addSlot = async function(){
  if(userRole!=='faculty') return;
  const day=(document.getElementById('sch-day') as HTMLInputElement).value;
  const time=(document.getElementById('sch-time') as HTMLInputElement).value.trim();
  const sub=(document.getElementById('sch-sub') as HTMLInputElement).value.trim();
  const loc=(document.getElementById('sch-loc') as HTMLInputElement).value.trim();
  const type=(document.getElementById('sch-type') as HTMLInputElement).value;
  if(!sub||!time) return;
  const dayObj=tt.find(d=>d.day===day);
  const newSlot = {t:time,s:sub,l:loc||'TBA',type:type};
  if(dayObj) dayObj.slots.push(newSlot);
  
  (document.getElementById('sch-time') as HTMLInputElement).value='';
  (document.getElementById('sch-sub') as HTMLInputElement).value='';
  (document.getElementById('sch-loc') as HTMLInputElement).value='';
  renderTT();
  await saveDb();
};

(window as any).deleteSlot = async function(){
  if(userRole!=='faculty') return;
  const day=(document.getElementById('del-day') as HTMLInputElement).value;
  const idx=parseInt((document.getElementById('del-idx') as HTMLInputElement).value)-1;
  const dayObj=tt.find(d=>d.day===day);
  if(dayObj&&idx>=0&&idx<dayObj.slots.length){
    dayObj.slots.splice(idx,1);
    (document.getElementById('del-idx') as HTMLInputElement).value='';
    renderTT();
    await saveDb();
  }
};

(window as any).updateAtt = async function(i: number, val: string){
  let v=Math.min(100,Math.max(0,parseInt(val)||0));
  if(students[i]) students[i].pct=v;
  const barColor=(p: number)=>p>=75?'#10b981':p>=60?'#f59e0b':'#ef4444';
  const bar=document.getElementById('bar-'+i);
  const inp=document.getElementById('att-'+i);
  if(bar){bar.style.width=v+'%';bar.style.background=barColor(v);}
  if(inp){inp.style.color=barColor(v);}
  refreshDefaulters();
  await saveDb();
};

(window as any).changeDivision = async function(div: string) {
  userDivision = div;
  const user = auth.currentUser;
  if(user) {
    await setDoc(doc(db, 'users', user.uid), { division: div }, { merge: true });
  }
  (document.getElementById('topRole') as HTMLElement).textContent=(userRole.charAt(0).toUpperCase()+userRole.slice(1)) + ' (Div ' + userDivision + ')';
  (document.getElementById('drawerBadge') as HTMLElement).textContent=(userRole.charAt(0).toUpperCase()+userRole.slice(1)) + ' (Div ' + userDivision + ')';
  
  await fetchInitialData();
  renderAll();
};

(window as any).exportAttendanceCSV = function() {
  if(!students || students.length === 0) return;
  const header = ['Roll No', 'Student Name', 'Attendance (%)'];
  const csvRows = [header.join(',')];
  
  students.forEach(s => {
    const row = [
      `"${s.roll}"`,
      `"${s.name}"`,
      s.pct
    ];
    csvRows.push(row.join(','));
  });
  
  const csvStr = csvRows.join('\n');
  const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `Attendance_Div_${userDivision}_April_2026.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

(window as any).updateStudent = async function(i: number, field: string, val: string){
  if(students[i]) {
    students[i][field] = val;
    await saveDb();
    refreshDefaulters();
  }
};

function renderAll(){
    renderTT();
    renderAssigns();
    renderEvents();
    renderAnns();
    renderAttendance();
    renderDashDeadlines();
}

function renderDashDeadlines() {
    const parent = document.getElementById('dash-deadlines');
    if (!parent || !assigns.length) return;
    
    // Just render first 2 deadlines
    let html = '';
    for(let i=0; i<Math.min(2, assigns.length); i++) {
        const a = assigns[i];
        const ub=a.u?'<span class="badge br">Urgent</span>':'<span class="badge bw">'+a.d+'</span>';
        html += `<div class="assign-item"><div class="chk${a.done?' done':''}" onclick="toggleAssign(${i})">${a.done?'&#10003;':''}</div><div><div class="at${a.done?' done':''}">${a.t}</div><div class="asub">Due ${a.d} &middot; ${ub}</div></div></div>`;
    }
    parent.innerHTML = html;
}

function renderTT(){
  const tc:any={'Lecture':'bb','Lab':'bg','Tutorial':'bw','Project':'bb','Event':'br'};
  const g=document.getElementById('ttGrid'); 
  if(!g) return;
  g.innerHTML='';
  tt.forEach(d=>{
    let h='<div class="sec-lbl">'+d.day+'</div>';
    d.slots.forEach((s: any,i: number)=>{
      const num=userRole==='faculty'?'<span style="font-size:11px;color:var(--muted);min-width:16px;flex-shrink:0">'+(i+1)+'.</span>':'';
      h+='<div class="tt-row">'+num+'<div class="tt-time">'+s.t+'</div><div class="tt-sub">'+s.s+' <span class="badge '+(tc[s.type]||'bb')+'">'+s.type+'</span></div><div class="tt-loc">'+s.l+'</div></div>';
    });
    g.innerHTML+=h;
  });
}

(window as any).deleteItem = function(type: string, idx: number) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;';
  
  const box = document.createElement('div');
  box.style.cssText = 'background:var(--card-bg, #181825);padding:24px;border-radius:12px;text-align:center;max-width:300px;';
  box.innerHTML = `<div style="font-weight:bold;margin-bottom:8px;color:#fff">Confirm Deletion</div><div style="font-size:14px;color:var(--muted);margin-bottom:20px;">Are you sure you want to delete this item?</div>`;
  
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:12px;justify-content:center;';
  
  const cancel = document.createElement('button');
  cancel.innerText = 'Cancel';
  cancel.style.cssText = 'padding:8px 16px;border-radius:6px;border:none;background:var(--bg, #11111b);color:#fff;cursor:pointer;';
  cancel.onclick = () => document.body.removeChild(overlay);
  
  const confirmBtn = document.createElement('button');
  confirmBtn.innerText = 'Delete';
  confirmBtn.style.cssText = 'padding:8px 16px;border-radius:6px;border:none;background:var(--danger, #f38ba8);color:#111;cursor:pointer;font-weight:bold;';
  confirmBtn.onclick = async () => {
    document.body.removeChild(overlay);
    let endpoint = '';
    if (type === 'assign') { assigns.splice(idx, 1); endpoint = 'assignments'; }
    if (type === 'event') { events.splice(idx, 1); endpoint = 'events'; }
    if (type === 'ann') { anns.splice(idx, 1); endpoint = 'announcements'; }
    renderAll();
    await saveDb();
  };

  actions.appendChild(cancel);
  actions.appendChild(confirmBtn);
  box.appendChild(actions);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
};

function getAdminControls(type: string, idx: number) {
  if (userRole !== 'faculty') return '';
  return `<div style="margin-top:12px; display:flex; gap:12px;">
    <button class="dl-btn" onclick="deleteItem('${type}', ${idx})" style="color:var(--danger); font-weight:600;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="margin-right:4px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>Delete</button>
  </div>`;
}

function renderAssigns(){
  const g=document.getElementById('assignList'); 
  if(!g) return;
  g.innerHTML='';
  assigns.forEach((a: any,i: number)=>{
    const ub=a.u?'<span class="badge br">Urgent</span>':'<span class="badge bw">'+a.d+'</span>';
    const fileHtml=a.file?'<div style="margin-top:6px"><span class="attach-pill"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>'+a.file.name+'</span></span> <a class="dl-btn" href="'+a.file.url+'" download="'+a.file.name+'"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Download</a></div>':'';
    const adm = getAdminControls('assign', i);
    g.innerHTML+='<div class="assign-item"><div class="chk'+(a.done?' done':'')+'" onclick="toggleAssign('+i+')">'+(a.done?'&#10003;':'')+'</div><div style="flex:1;min-width:0"><div class="at'+(a.done?' done':'')+'">'+a.t+'</div><div class="asub">Due '+a.d+' &middot; '+ub+'</div>'+fileHtml+adm+'</div></div>';
  });
  renderDashDeadlines();
}

function renderEvents(){
  const c: any={'Festival':'bw','Career':'bg','Academic':'bb','Sports':'br','Admin':'bb'};
  const g=document.getElementById('eventList'); 
  if(!g) return;
  g.innerHTML='';
  events.forEach((e: any, i: number)=>{
    const fileHtml=e.file?'<div style="margin-top:6px"><span class="attach-pill"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>'+e.file.name+'</span></span> <a class="dl-btn" href="'+e.file.url+'" download="'+e.file.name+'"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Download</a></div>':'';
    const adm = getAdminControls('event', i);
    g.innerHTML+='<div class="event-item"><div class="e-date"><div class="e-day">'+e.day+'</div><div class="e-mon">'+e.mon+'</div></div><div style="flex:1;min-width:0"><div class="e-title">'+e.t+' <span class="badge '+(c[e.c]||'bb')+'">'+e.c+'</span></div><div class="e-loc">'+e.l+'</div>'+fileHtml+adm+'</div></div>';
  });
}

function renderAnns(){
  const c: any={'Holiday':'bg','Admin':'bb','Exam':'bw','Urgent':'br'};
  const g=document.getElementById('annList'); 
  if(!g) return;
  g.innerHTML='';
  anns.forEach((a: any, i: number)=>{
    const fileHtml=a.file?'<div style="margin-top:7px"><span class="attach-pill"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>'+a.file.name+'</span></span> <a class="dl-btn" href="'+a.file.url+'" download="'+a.file.name+'"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Download</a></div>':'';
    const adm = getAdminControls('ann', i);
    g.innerHTML+='<div class="ann-item"><div class="ann-head"><div class="ann-title">'+a.t+' <span class="badge '+(c[a.c]||'bb')+'">'+a.c+'</span></div><span class="ann-date">'+a.d+'</span></div><div class="ann-body">'+a.b+'</div>'+fileHtml+adm+'</div>';
  });
}

function renderAttendance(){
  const barColor=(p: number)=>p>=75?'#10b981':p>=60?'#f59e0b':'#ef4444';
  const g=document.getElementById('attList');
  if(!g || !students.length) return;
  
  if (userRole === 'faculty') {
    g.innerHTML='<table class="att-table"><thead><tr><th>#</th><th>Student</th><th>Roll No</th><th>This Month</th><th>%</th></tr></thead><tbody>'
      +students.map((s,i)=>`<tr>
        <td style="color:var(--muted)">${i+1}</td>
        <td><input type="text" class="att-input" style="width:100%;min-width:300px;text-align:left;" value="${s.name}" onchange="updateStudent(${i}, 'name', this.value)"></td>
        <td><input type="text" class="att-input" style="width:100%;min-width:120px;text-align:left;" value="${s.roll}" onchange="updateStudent(${i}, 'roll', this.value)"></td>
        <td><div class="att-bar-wrap"><div class="att-bar" id="bar-${i}" style="width:${s.pct}%;background:${barColor(s.pct)}"></div></div></td>
        <td>
          <input class="att-input" type="number" min="0" max="100" value="${s.pct}" id="att-${i}"
            onchange="updateAtt(${i},this.value)" oninput="updateAtt(${i},this.value)"
            style="color:${barColor(s.pct)}">
        </td>
      </tr>`).join('')+'</tbody></table>';
  } else {
    g.innerHTML='<table class="att-table"><thead><tr><th>#</th><th>Student</th><th>Roll No</th><th>This Month</th><th>%</th></tr></thead><tbody>'
      +students.map((s,i)=>`<tr>
        <td style="color:var(--muted)">${i+1}</td>
        <td style="font-weight:500">${s.name}</td>
        <td style="color:var(--muted)">${s.roll}</td>
        <td><div class="att-bar-wrap"><div class="att-bar" id="bar-${i}" style="width:${s.pct}%;background:${barColor(s.pct)}"></div></div></td>
        <td style="font-weight:700;color:${barColor(s.pct)}">${s.pct}%</td>
      </tr>`).join('')+'</tbody></table>';
  }
  refreshDefaulters();
}

(window as any).toggleDefaultersModal = function(){
  const m = document.getElementById('defaulterModal');
  if(m) {
    if(m.style.display === 'flex') {
      m.style.display = 'none';
      document.body.style.overflow = '';
    } else {
      m.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }
};

function refreshDefaulters(){
  if(!students.length) return;
  const barColor=(p: number)=>p>=75?'#10b981':p>=60?'#f59e0b':'#ef4444';
  const defaulters=students.filter(s=>s.pct<75).sort((a,b)=>a.pct-b.pct);
  const avg=Math.round(students.reduce((s,x)=>s+x.pct,0)/students.length);
  const dc = document.getElementById('defaulterCount');
  if(dc) dc.textContent=defaulters.length.toString();
  const tc = document.getElementById('totalStudentsCount');
  if(tc) tc.textContent=students.length.toString();
  const avgEl=document.querySelector('#attSummaryBar .stat-val[style*="success"]');
  if(avgEl) avgEl.textContent=avg+'%';
  const d=document.getElementById('defaulterList');
  if(!d) return;
  d.innerHTML=defaulters.length===0
    ?'<div style="color:var(--muted);font-size:13px;padding:10px 0;text-align:center;">No defaulters this month.</div>'
    :defaulters.map(s=>`<div class="defaulter-item">
        <div><div class="def-name">${s.name}</div><div class="def-roll">${s.roll}</div></div>
        <div class="def-pct">${s.pct}%</div>
      </div>`).join('');
}

window.addEventListener('load',function(){
  var img=document.getElementById('splashImg') as HTMLImageElement;
  if(img) {
      img.onerror=function(){img.style.display='none';};
      img.src='/logo.png';
  }
  fetchInitialData();
  syncCollegeCode();
  subscribeToBackgroundPush();
});

(window as any).saveCollegeCode = async function() {
  const code = (document.getElementById('adm-code') as HTMLInputElement).value;
  if(!code) return customAlert("Code cannot be empty");
  try {
    await setDoc(doc(db, 'system', 'config'), { collegeCode: code });
    collegeCode = code;
    customAlert("College Access Code updated successfully!");
  } catch(e) {
    customAlert("Error updating code: " + e);
  }
};

function customAlert(msg: string) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;';
  
  const box = document.createElement('div');
  box.style.cssText = 'background:var(--card-bg, #181825);padding:24px;border-radius:12px;text-align:center;max-width:300px;';
  box.innerHTML = `<div style="font-weight:bold;margin-bottom:12px;color:#fff">${msg}</div>`;
  
  const okBtn = document.createElement('button');
  okBtn.innerText = 'OK';
  okBtn.style.cssText = 'padding:8px 24px;border-radius:6px;border:none;background:var(--accent, #a855f7);color:#fff;cursor:pointer;font-weight:bold;';
  okBtn.onclick = () => document.body.removeChild(overlay);
  
  box.appendChild(okBtn);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

async function subscribeToBackgroundPush() {
  if ('serviceWorker' in navigator && 'PushManager' in window && Notification.permission !== 'denied') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const response = await fetch('/api/vapidPublicKey');
        const { publicKey } = await response.json();
        
        const convertedVapidKey = urlBase64ToUint8Array(publicKey);
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });

        await fetch('/api/subscribe', {
          method: 'POST',
          body: JSON.stringify(subscription),
          headers: { 'content-type': 'application/json' }
        });
        console.log('Background Push Subscribed');
      }
    } catch(err) {
      console.error('Failed to subscribe background push:', err);
    }
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
  return outputArray;
}
