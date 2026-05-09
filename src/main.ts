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
let facultyCode = '25FC01';
const pages=['dashboard','schedule','assignments','events','attendance'];

async function syncCollegeCode() {
  try {
    const docSnap = await getDoc(doc(db, 'system', 'config'));
    if (docSnap.exists()) {
      const data = docSnap.data() as any;
      if (data.collegeCode) collegeCode = data.collegeCode;
      if (data.facultyCode) facultyCode = data.facultyCode;
    }
    
    // Set UI values if elements exist
    const adm = document.getElementById('adm-code') as HTMLInputElement;
    const fac = document.getElementById('fac-code') as HTMLInputElement;
    if (adm) adm.value = collegeCode;
    if (fac) fac.value = facultyCode;
  } catch(e) {
    console.warn('Config fetch failed, using default.');
  }
}

const googleProvider = new GoogleAuthProvider();

async function findStudentByRoll(roll: string) {
  const possibleDivisions = ['A', 'B', 'C', 'D'];
  for (const div of possibleDivisions) {
    const divSnap = await getDoc(doc(db, 'system', `data_${div}`));
    if (divSnap.exists()) {
      const divData = divSnap.data();
      if (divData.students) {
        const stu = divData.students.find((s: any) => s.roll === roll);
        if (stu) return { student: stu, division: div };
      }
    }
  }
  return null;
}

(window as any).doGoogleLogin = async function() {
  hideError('l-err');

  const codeVal = (document.getElementById('l-code') as HTMLInputElement)?.value;

  if (!codeVal) {
    showError('l-err', 'Please enter your Access Code/Roll No before continuing with Google.');
    return;
  }

  await syncCollegeCode();

  let studentName = null;

  if (userRole === 'faculty') {
    if (codeVal !== facultyCode) {
      return showError('l-err', 'Invalid College Access Code for Faculty.');
    }
  } else {
    // Student
    const result = await findStudentByRoll(codeVal);
    if (!result) {
      return showError('l-err', 'Invalid Roll Number or Student not found in database.');
    }
    userDivision = result.division;
    studentName = result.student.name;
  }

  try {
    const cred = await signInWithPopup(auth, googleProvider);
    // Check if user exists in Firestore
    const docSnap = await getDoc(doc(db, 'users', cred.user.uid));
    if (!docSnap.exists()) {
      // First time Google login, create profile
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: studentName || cred.user.displayName || 'User',
        email: cred.user.email || '',
        phone: cred.user.phoneNumber || '',
        role: userRole, 
        division: userDivision,
        roll: userRole === 'student' ? codeVal : '',
        createdAt: Date.now()
      });
    } else {
      // User exists, update role, division, roll and potentially name if it was a student
      const updateData: any = {
        role: userRole,
        division: userDivision,
      };
      if (userRole === 'student') {
        updateData.roll = codeVal;
        if (studentName) updateData.name = studentName;
      }
      await setDoc(doc(db, 'users', cred.user.uid), updateData, { merge: true });
      if (userRole === 'student' && studentName) {
         (window as any).finishAuth(studentName, cred.user.email || '', cred.user.phoneNumber || '', codeVal);
      }
    }
  } catch(e: any) {
    console.error(e);
    showError('l-err', e.message);
  }
};

let tt: any[] = [];
let assigns: any[] = [];
let events: any[] = [];
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
    students = data.students || [];
    
    // If we're already on the app page, re-render
    if (document.getElementById('app')?.classList.contains('active')) {
      renderAll();
    }
    
  } catch (error) {
    console.error('Failed to fetch data', error);
  }
}

async function saveDb() {
  try {
    if (userRole === 'faculty') {
      await setDoc(doc(db, 'system', `data_${userDivision}`), { tt, assigns, events, students });
    }
  } catch (e) {
    console.error('Failed to save to Firestore', e);
  }
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
  
  const codeInput = document.getElementById('l-code') as HTMLInputElement;
  const pwToggle = document.querySelector('.pw-toggle') as HTMLElement;
  if(codeInput) {
    if (r === 'student') {
      codeInput.placeholder = "Enter Roll Number (e.g. 25FC301)";
      codeInput.type = "text";
      if(pwToggle) pwToggle.style.display = 'none';
      codeInput.style.paddingRight = "16px";
    } else if (r === 'faculty') {
      codeInput.placeholder = "Faculty Access Code";
      codeInput.type = "password";
      if(pwToggle) pwToggle.style.display = 'block';
      codeInput.style.paddingRight = "48px";
    }
  }
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
  const emailInp = document.getElementById('l-email') as HTMLInputElement;
  const codeInp = document.getElementById('l-code') as HTMLInputElement;
  const email = emailInp ? emailInp.value : '';
  const code = codeInp ? codeInp.value : '';
  
  if(!email || !code) return showError('l-err', 'Please fill email and college code');
  
  await syncCollegeCode();

  let studentName = email.split('@')[0];

  if (userRole === 'faculty') {
    if (code !== facultyCode) {
      return showError('l-err', 'Invalid College Access Code for Faculty.');
    }
  } else {
    const result = await findStudentByRoll(code);
    if (!result) {
      return showError('l-err', 'Invalid Roll Number or Student not found in database.');
    }
    userDivision = result.division;
    studentName = result.student.name;
  }

  const pass = email.toLowerCase() + "Campus#123!";

  hideError('l-err');
  
  const btn = document.getElementById('l-btn') as HTMLButtonElement;
  btn.disabled = true; btn.textContent = 'Logging in...';

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const updateData: any = {
      role: userRole,
      division: userDivision,
    };
    if (userRole === 'student') {
      updateData.roll = code;
      if (studentName) updateData.name = studentName;
    }
    await setDoc(doc(db, 'users', cred.user.uid), updateData, { merge: true });
    if (userRole === 'student' && studentName) {
       (window as any).finishAuth(studentName, email, '', code);
    }
  } catch(e: any) {
    if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, 'users', cred.user.uid), {
          name: studentName, email, phone: '', role: userRole, division: userDivision, 
          roll: userRole === 'student' ? code : '',
          createdAt: Date.now()
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
        
        if (userRole === 'student' && !data.roll) {
          await signOut(auth);
          (window as any).go('login');
          showError('l-err', 'Please log in again and enter your Roll No to link your student profile.');
          return;
        }

        (window as any).finishAuth(data.name || 'User', data.email || user.email, data.phone || '', data.roll || '');
      } else {
        // Fallback if no profile doc
        (window as any).finishAuth('User', user.email, '', '');
      }
    } catch(e) {
      console.error(e);
      (window as any).finishAuth('User', user.email, '', '');
    }
  } else {
    // User is logged out
    (window as any).go('login');
  }
});

(window as any).finishAuth = function(name: string, email: string, phone: string, roll: string){
  const ini=name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  const topAv = document.getElementById('topAvatar');
  if (topAv) topAv.textContent=ini;
  const topNm = document.getElementById('topName');
  if (topNm) topNm.textContent=name;
  const topRl = document.getElementById('topRole');
  if (topRl) topRl.textContent=(userRole.charAt(0).toUpperCase()+userRole.slice(1)) + ' (Div ' + userDivision + ')';
  
  const bigAvT = document.getElementById('bigAvatarTxt');
  if (bigAvT) bigAvT.textContent=ini;
  const drNm = document.getElementById('drawerName');
  if (drNm) drNm.textContent=name;
  const drBd = document.getElementById('drawerBadge');
  if (drBd) drBd.textContent=(userRole.charAt(0).toUpperCase()+userRole.slice(1)) + ' (Div ' + userDivision + ')';

  const pfN = document.getElementById('pf-name') as HTMLInputElement;
  if (pfN) pfN.value=name;
  const pfE = document.getElementById('pf-email') as HTMLInputElement;
  if (pfE) pfE.value=email;
  const pfP = document.getElementById('pf-phone') as HTMLInputElement;
  if (pfP) pfP.value=phone;

  const pfName = document.getElementById('pf-name') as HTMLInputElement;
  const nameNote = document.getElementById('student-name-note') as HTMLElement;

  if(userRole==='faculty'){
    pfName.readOnly = false;
    if(nameNote) nameNote.style.display = 'none';
    const facAnn = document.getElementById('facAnn');
    if (facAnn) facAnn.style.display='block';
    const facAssign = document.getElementById('facAssign');
    if (facAssign) facAssign.style.display='block';
    const stAsNote = document.getElementById('studentAssignNote');
    if (stAsNote) stAsNote.style.display='none';
    const pfLabel = document.getElementById('pf-id-label');
    if (pfLabel) pfLabel.textContent='Faculty ID';
    const pfId = document.getElementById('pf-id') as HTMLInputElement;
    if (pfId) pfId.value= roll || 'FAC-01';
    const snAtt = document.getElementById('sn-attendance');
    if (snAtt) snAtt.style.display='flex';
    const bnAtt = document.getElementById('bn-attendance');
    if (bnAtt) bnAtt.style.display='flex';
    const stAttCard = document.getElementById('studentAttCard');
    if (stAttCard) stAttCard.style.display='none';
    const facEv = document.getElementById('facEvent');
    if (facEv) facEv.style.display='block';
    const facSch = document.getElementById('facSchedule');
    if (facSch) facSch.style.display='block';
    const expBtn = document.getElementById('exportCsvBtn') as HTMLButtonElement;
    if (expBtn) expBtn.style.display='block';
    const stTasksCard = document.getElementById('studentTasksCard');
    if (stTasksCard) stTasksCard.style.display='none';
  } else {
    pfName.readOnly = true;
    if(nameNote) nameNote.style.display = 'block';
    const facAssign = document.getElementById('facAssign');
    if (facAssign) facAssign.style.display='none';
    const stAsNote = document.getElementById('studentAssignNote');
    if (stAsNote) stAsNote.style.display='block';
    const facAnn = document.getElementById('facAnn');
    if (facAnn) facAnn.style.display='none';
    const pfLabel = document.getElementById('pf-id-label');
    if (pfLabel) pfLabel.textContent='Student ID (Roll No)';
    const pfId = document.getElementById('pf-id') as HTMLInputElement;
    if (pfId) pfId.value= roll || 'N/A';
    const snAtt = document.getElementById('sn-attendance');
    if (snAtt) snAtt.style.display='none';
    const bnAtt = document.getElementById('bn-attendance');
    if (bnAtt) bnAtt.style.display='none';
    const stAttCard = document.getElementById('studentAttCard');
    if (stAttCard) stAttCard.style.display='block';
    const stTasksCard = document.getElementById('studentTasksCard');
    if (stTasksCard) stTasksCard.style.display='block';
    const facEv = document.getElementById('facEvent');
    if (facEv) facEv.style.display='none';
    const facSch = document.getElementById('facSchedule');
    if (facSch) facSch.style.display='none';
    const expBtn = document.getElementById('exportCsvBtn') as HTMLButtonElement;
    if (expBtn) expBtn.style.display='none';
  }
  
  setTimeout(() => {
      const circle = document.getElementById('att-circle');
      if(circle) {
        circle.style.strokeDashoffset = '13'; // 100 - 87
      }
    }, 100);

  (window as any).go('app'); 
  fetchInitialData().then(() => renderAll());
};

(window as any).doLogout = async function(){
  await signOut(auth);
  (window as any).setRole('student');
};
(window as any).openDrawer = function(){
  document.getElementById('drawer-overlay')?.classList.add('open');
};
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
    if (i) {
      i.src = dataUrl;
      i.style.display = 'block';
    }
    const txt = document.getElementById('bigAvatarTxt');
    if (txt) txt.style.display = 'none';
    
    // Also update top avatar to cropped image
    const topAvatar = document.getElementById('topAvatar') as HTMLElement;
    if (topAvatar) topAvatar.innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
  }
  (window as any).cancelCrop();
};

(window as any).saveProfile = async function(){
  const m=document.getElementById('savedMsg') as HTMLElement;
  if (!m) return;
  m.textContent='Saving...';
  
  const pfNameEl = document.getElementById('pf-name') as HTMLInputElement;
  const pfPhoneEl = document.getElementById('pf-phone') as HTMLInputElement;
  const pfIdEl = document.getElementById('pf-id') as HTMLInputElement;
  const pfEmailEl = document.getElementById('pf-email') as HTMLInputElement;

  let name = pfNameEl ? pfNameEl.value || 'User' : 'User';
  const phone = pfPhoneEl ? pfPhoneEl.value || '' : '';
  const rollNo = pfIdEl ? pfIdEl.value || '' : '';
  
  const updateData: any = { phone };

  if (userRole === 'student' && rollNo && rollNo !== 'N/A') {
    const result = await findStudentByRoll(rollNo);
    if (result) {
      name = result.student.name;
      updateData.name = name;
      updateData.roll = rollNo;
      updateData.division = result.division;
      userDivision = result.division;
      if (pfNameEl) pfNameEl.value = name;
      (window as any).finishAuth(name, pfEmailEl ? pfEmailEl.value : '', phone, rollNo);
    } else {
      m.textContent = 'Error: Invalid Roll Number';
      m.style.color = 'var(--danger)';
      setTimeout(()=> { m.textContent=''; m.style.color=''; }, 3000);
      return;
    }
  } else {
    updateData.name = name;
  }

  const ini=name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  const topAv = document.getElementById('topAvatar');
  if (topAv) topAv.textContent=ini;
  const topNm = document.getElementById('topName');
  if (topNm) topNm.textContent=name;
  const drNm = document.getElementById('drawerName');
  if (drNm) drNm.textContent=name;
  
  const bigAvImg = document.getElementById('bigAvatarImg');
  const bigAvTxt = document.getElementById('bigAvatarTxt');
  if(bigAvImg && bigAvImg.style.display==='none' && bigAvTxt) bigAvTxt.textContent=ini;
  
  if (auth.currentUser) {
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), updateData, { merge: true });
      m.style.color = 'var(--success)';
      m.textContent='Profile saved!'; 
    } catch(e: any) {
      console.error("Save profile error", e);
      m.style.color = 'var(--danger)';
      m.textContent = 'Save Error: ' + e.message;
    }
  }

  setTimeout(()=> { m.textContent=''; m.style.color=''; }, 3000);
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
  const lblTxt = document.getElementById('fileLabelTxt');
  if(lbl) {
      if (lblTxt) lblTxt.textContent=f.name;
      lbl.classList.add('has-file');
  }
};

(window as any).addAssign = async function(){
  const newAInp = document.getElementById('newA') as HTMLInputElement;
  const newDInp = document.getElementById('newD') as HTMLInputElement;
  const newFInp = document.getElementById('newFile') as HTMLInputElement;
  const lblTxt = document.getElementById('fileLabelTxt');

  const v = newAInp ? newAInp.value : '';
  const d = newDInp ? newDInp.value : '';
  if(!v) return;
  const entry: any={t:v,d:d||'TBD',u:false,done:false,file:null};
  if(pendingFile){
    const url=URL.createObjectURL(pendingFile);
    entry.file={name:pendingFile.name,url:url};
  }
  assigns.push(entry);
  if (newAInp) newAInp.value='';
  if (newDInp) newDInp.value='';
  if (newFInp) newFInp.value='';
  if (lblTxt) lblTxt.textContent='Attach document (PDF, DOCX, PPT...)';
  document.getElementById('fileLabel')?.classList.remove('has-file');
  pendingFile=null;
  renderAssigns();
  await saveDb();
};

let pendingEvFile: File | null=null;
(window as any).handleEvFile = function(ev: any){
  const f=ev.target.files[0]; if(!f) return;
  pendingEvFile=f;
  const lblTxt = document.getElementById('evFileLabelTxt');
  if (lblTxt) lblTxt.textContent=f.name;
  const lbl = document.getElementById('evFileLabel');
  if (lbl) lbl.classList.add('has-file');
};

(window as any).addEvent = async function(){
  if(userRole!=='faculty') return;
  const titleInp = document.getElementById('evTitle') as HTMLInputElement;
  const dayInp = document.getElementById('evDay') as HTMLInputElement;
  const monInp = document.getElementById('evMon') as HTMLInputElement;
  const locInp = document.getElementById('evLoc') as HTMLInputElement;
  const catInp = document.getElementById('evCat') as HTMLInputElement;
  const fileInp = document.getElementById('evFile') as HTMLInputElement;
  const lblTxt = document.getElementById('evFileLabelTxt');

  const t = titleInp ? titleInp.value : '';
  if(!t) return;
  const entry: any={
    t:t,
    day: (dayInp ? dayInp.value : '') || '?',
    mon: (monInp ? monInp.value : '') || 'Apr',
    l: (locInp ? locInp.value : '') || 'Campus',
    c: (catInp ? catInp.value : ''),
    file:null
  };
  if(pendingEvFile) entry.file={name:pendingEvFile.name,url:URL.createObjectURL(pendingEvFile)};
  events.push(entry);
  if (titleInp) titleInp.value='';
  if (dayInp) dayInp.value='';
  if (monInp) monInp.value='';
  if (locInp) locInp.value='';
  if (fileInp) fileInp.value='';
  if (lblTxt) lblTxt.textContent='Attach document (optional)';
  document.getElementById('evFileLabel')?.classList.remove('has-file');
  pendingEvFile=null;
  renderEvents();
  await saveDb();
};

let pendingAnnFile: File | null=null;
(window as any).handleAnnFile = function(e: any){
  const f=e.target.files[0]; if(!f) return;
  pendingAnnFile=f;
  const lblTxt = document.getElementById('annFileLabelTxt');
  if (lblTxt) lblTxt.textContent=f.name;
  const lbl=document.getElementById('annFileLabel');
  if (lbl) lbl.classList.add('has-file');
};

(window as any).addAnn = async function(){};

(window as any).addSlot = async function(){
  if(userRole!=='faculty') return;
  const dayEle = document.getElementById('sch-day') as HTMLInputElement;
  const timeEle = document.getElementById('sch-time') as HTMLInputElement;
  const subEle = document.getElementById('sch-sub') as HTMLInputElement;
  const locEle = document.getElementById('sch-loc') as HTMLInputElement;
  const typeEle = document.getElementById('sch-type') as HTMLInputElement;

  const day = dayEle ? dayEle.value : '';
  const time = timeEle ? timeEle.value.trim() : '';
  const sub = subEle ? subEle.value.trim() : '';
  const loc = locEle ? locEle.value.trim() : '';
  const type = typeEle ? typeEle.value : '';

  if(!sub || !time) return;
  const dayObj=tt.find(d=>d.day===day);
  const newSlot = {t:time, s:sub, l:loc||'TBA', type:type};
  if(dayObj) dayObj.slots.push(newSlot);
  
  if (timeEle) timeEle.value='';
  if (subEle) subEle.value='';
  if (locEle) locEle.value='';
  renderTT();
  await saveDb();
};

(window as any).deleteSlot = async function(){
  if(userRole!=='faculty') return;
  const dayEle = document.getElementById('del-day') as HTMLInputElement;
  const idxEle = document.getElementById('del-idx') as HTMLInputElement;

  const day = dayEle ? dayEle.value : '';
  const idxVal = idxEle ? idxEle.value : '';
  const idx = parseInt(idxVal)-1;
  const dayObj=tt.find(d=>d.day===day);
  if(dayObj && idx>=0 && idx<dayObj.slots.length){
    dayObj.slots.splice(idx,1);
    if (idxEle) idxEle.value='';
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
    
    // Just render first 2-3 deadlines
    let html = '';
    let count = 0;
    for(let i=0; i<assigns.length; i++) {
        if (assigns[i].done) continue;
        if (count >= 3) break;
        const a = assigns[i];
        const ub=a.u?'<span class="badge br">Urgent</span>':'<span class="badge bw">'+a.d+'</span>';
        html += `<div class="assign-item stagger-item" style="padding:16px; margin-bottom:10px;"><div class="chk${a.done?' done':''}" onclick="toggleAssign(${i})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><div><div class="at${a.done?' done':''}">${a.t}</div><div class="asub">Due ${a.d} &middot; ${ub}</div></div></div>`;
        count++;
    }
    parent.innerHTML = html || '<p style="color:var(--muted);font-size:14px;padding:20px;text-align:center;background:var(--bg2);border:1px dashed var(--border);border-radius:12px">No pending assignments!</p>';
}

function renderTT(){
  const tc:any={'Lecture':'bb','Lab':'bg','Tutorial':'bw','Project':'bb','Event':'br'};
  const g=document.getElementById('ttGrid'); 
  const tcList = document.getElementById('today-classes-list');
  const now = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const todayStr = days[now.getDay()];

  if(!g) return;
  g.innerHTML='';
  if(tcList) tcList.innerHTML='';

  tt.forEach(d=>{
    let h='<div class="sec-lbl stagger-item">'+d.day+'</div>';
    d.slots.forEach((s: any,i: number)=>{
      const num=userRole==='faculty'?'<span style="font-size:11px;color:var(--muted);min-width:16px;flex-shrink:0">'+(i+1)+'.</span>':'';
      const slotHtml = '<div class="tt-row stagger-item">'+num+'<div class="tt-time">'+s.t+'</div><div class="tt-sub">'+s.s+' <span class="badge '+(tc[s.type]||'bb')+'">'+s.type+'</span></div><div class="tt-loc">'+s.l+'</div></div>';
      h += slotHtml;
      if(d.day === todayStr && tcList) {
        tcList.innerHTML += slotHtml;
      }
    });
    g.innerHTML+=h;
  });

  if(tcList && tcList.innerHTML==='') tcList.innerHTML='<p style="color:var(--muted);font-size:14px;padding:20px;text-align:center;background:var(--bg2);border:1px dashed var(--border);border-radius:12px">No classes scheduled for today.</p>';
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

    renderAll();
    await saveDb();
  };

  actions.appendChild(cancel);
  actions.appendChild(confirmBtn);
  box.appendChild(actions);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
};

function getFacultyControls(type: string, idx: number) {
  if (userRole !== 'faculty') return '';
  return `<div style="margin-top:12px; display:flex; gap:12px;">
    <button class="dl-btn" onclick="deleteItem('${type}', ${idx})" style="color:var(--danger); font-weight:600;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="margin-right:4px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>Delete</button>
  </div>`;
}

function renderAssigns(){
  const g=document.getElementById('assignList'); 
  const tcDash=document.getElementById('task-count-dash');
  if(!g) return;
  g.innerHTML='';
  assigns.forEach((a: any,i: number)=>{
    const ub=a.u?'<span class="badge br">Urgent</span>':'<span class="badge bw">'+a.d+'</span>';
    const fileHtml=a.file?'<div style="margin-top:10px"><span class="attach-pill"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>'+a.file.name+'</span></span> <a class="dl-btn" href="'+a.file.url+'" download="'+a.file.name+'"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Download</a></div>':'';
    const adm = getFacultyControls('assign', i);
    g.innerHTML+='<div class="assign-item stagger-item"><div class="chk'+(a.done?' done':'')+'" onclick="toggleAssign('+i+')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div><div style="flex:1;min-width:0"><div class="at'+(a.done?' done':'')+'">'+a.t+'</div><div class="asub">Due '+a.d+' &middot; '+ub+'</div>'+fileHtml+adm+'</div></div>';
  });
  if (tcDash) tcDash.textContent = assigns.filter((a:any) => !a.done).length.toString();
  renderDashDeadlines();
}

function renderEvents(){
  const c: any={'Festival':'bw','Career':'bg','Academic':'bb','Sports':'br','College':'bb'};
  const g=document.getElementById('eventList'); 
  if(!g) return;
  g.innerHTML='';
  events.forEach((e: any, i: number)=>{
    const fileHtml=e.file?'<div style="margin-top:10px"><span class="attach-pill"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>'+e.file.name+'</span></span> <a class="dl-btn" href="'+e.file.url+'" download="'+e.file.name+'"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Download</a></div>':'';
    const adm = getFacultyControls('event', i);
    g.innerHTML+='<div class="event-item stagger-item"><div class="e-date"><div class="e-day">'+e.day+'</div><div class="e-mon">'+e.mon+'</div></div><div style="flex:1;min-width:0"><div class="e-title">'+e.t+' <span class="badge '+(c[e.c]||'bb')+'">'+e.c+'</span></div><div class="e-loc">'+e.l+'</div>'+fileHtml+adm+'</div></div>';
  });
}

function renderAnns(){}

function renderAttendance(){
  const barColor=(p: number)=>p>=75?'#10b981':p>=60?'#f59e0b':'#ef4444';
  const g=document.getElementById('attList');
  if(!g || !students.length) return;
  
  if (userRole === 'faculty') {
    g.innerHTML='<table class="att-table"><thead><tr><th>#</th><th>Student</th><th>Roll No</th><th>This Month</th><th>%</th></tr></thead><tbody>'
      +students.map((s,i)=>`<tr class="stagger-item">
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
      +students.map((s,i)=>`<tr class="stagger-item">
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
});

(window as any).saveCollegeCode = async function() {
  const adm = document.getElementById('adm-code') as HTMLInputElement;
  const fac = document.getElementById('fac-code') as HTMLInputElement;
  if(!adm || !fac) return;
  const code = adm.value;
  const fCode = fac.value;
  
  if(!code || !fCode) return customAlert("Codes cannot be empty");
  try {
    await setDoc(doc(db, 'system', 'config'), { 
      collegeCode: code,
      facultyCode: fCode
    }, {merge: true});
    collegeCode = code;
    facultyCode = fCode;
    customAlert("Access Codes updated successfully!");
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




