import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

// =========================================================================
// TOGGLE SWITCH PARA SA SIGN-UP PORTAL:
// I-set sa `true` kung nais pansamantalang isara ang portal.
// I-set sa `false` upang buksan ang pagpaparehistro para sa mga estudyante.
// =========================================================================
const IS_SIGNUP_CLOSED = false;

const STEPS = ['Details', 'Verify', 'Done'];

function Styles() {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Figtree:wght@500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <style jsx global>{`
        :root{--g9:#04261a;--g8:#064e3b;--g7:#047857;--g6:#059669;--g5:#10b981;--g2:#a7f3d0;--g1:#d1fae5;--g0:#ecfdf5;--ink:#0b2a1e;--mut:#56705f;--line:#cfe5d8}
        *{box-sizing:border-box}
        body{margin:0}
        button{font-family:inherit}
        :focus-visible{outline:3px solid var(--g5);outline-offset:2px}
        .su-page{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 16px 24px;font-family:'Figtree',system-ui,sans-serif;color:var(--ink);position:relative;overflow:hidden;
          background:radial-gradient(800px 380px at 12% -10%,rgba(52,211,153,.38),transparent 60%),radial-gradient(640px 360px at 95% 0,rgba(190,242,100,.2),transparent 60%),linear-gradient(165deg,#075e45,#04261a 75%)}
        .su-page::after{content:'';position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.08) 1px,transparent 1px);background-size:22px 22px;pointer-events:none}
        .su-page>*{position:relative;z-index:1}
        .su-card{width:100%;max-width:470px;background:#fff;border-radius:30px;padding:62px 26px 28px;margin-top:58px;position:relative;box-shadow:0 30px 70px rgba(0,0,0,.38);animation:su-rise .6s both}
        @keyframes su-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        .su-logo{position:absolute;top:-54px;left:50%;transform:translateX(-50%);width:108px;height:108px;border-radius:50%;background:#fff;padding:9px;box-shadow:0 0 0 6px rgba(255,255,255,.18),0 14px 34px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center}
        .su-logo img{width:100%;height:100%;object-fit:contain}
        .su-head{text-align:center;margin-bottom:18px}
        .su-head h1{font-family:'Bricolage Grotesque','Figtree',sans-serif;font-size:1.75rem;font-weight:800;letter-spacing:-.03em;margin:0 0 6px;color:var(--g8)}
        .su-head p{margin:0;font-size:.9rem;color:var(--mut);line-height:1.55}

        .su-steps{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:18px}
        .su-s{display:flex;align-items:center;gap:6px;font-size:.8rem;font-weight:700;color:#8aa597}
        .su-s i{width:26px;height:26px;border-radius:50%;background:#e5f3ea;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:.76rem;font-weight:800}
        .su-s.on{color:var(--g7)}
        .su-s.on i{background:linear-gradient(135deg,var(--g5),var(--g7));color:#fff;box-shadow:0 4px 10px rgba(5,150,105,.3)}
        .su-line{width:22px;height:2px;background:#d6ebdf;border-radius:2px}

        .su-n{margin-bottom:16px;font-size:.86rem;font-weight:700;line-height:1.45;padding:12px 14px;border-radius:14px;border:1px solid}
        .su-n.ok{color:#047857;background:var(--g0);border-color:#b7ecd3}
        .su-n.er{color:#b91c1c;background:#fef2f2;border-color:#fecaca}

        .su-form{display:flex;flex-direction:column;gap:14px}
        .su-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .su-l{display:block;font-size:.84rem;font-weight:700;color:#2f4d3e;margin-bottom:5px}
        .su-in{width:100%;padding:12px 14px;border-radius:14px;border:1.5px solid var(--line);font-size:.95rem;font-family:inherit;font-weight:600;color:var(--ink);background:#fafdfb;outline:0;transition:border-color .2s,box-shadow .2s,background .2s}
        .su-in:focus{border-color:var(--g5);background:#fff;box-shadow:0 0 0 4px rgba(16,185,129,.16)}
        .su-btn{width:100%;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px;border:0;border-radius:999px;background:linear-gradient(135deg,var(--g5),var(--g7));color:#fff;font-size:.96rem;font-weight:800;cursor:pointer;box-shadow:0 10px 24px rgba(5,150,105,.34);transition:transform .2s,box-shadow .2s;margin-top:4px}
        .su-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 14px 30px rgba(5,150,105,.42)}
        .su-btn:disabled{opacity:.55;cursor:not-allowed}
        .su-btn.alt{background:var(--g0);color:var(--g7);border:1px solid #b7ecd3;box-shadow:none}
        .su-btn.alt:hover:not(:disabled){background:var(--g1);box-shadow:none}
        .su-otp{text-align:center;font-family:'Bricolage Grotesque',sans-serif;font-size:1.9rem;font-weight:800;letter-spacing:.5em;padding:14px 8px 14px 18px;border:2px solid var(--g5);background:var(--g0)}
        .su-row{display:flex;justify-content:space-between;align-items:center;gap:10px}
        .su-lk{background:none;border:0;color:var(--mut);font-size:.86rem;font-weight:700;cursor:pointer;padding:4px 0;display:inline-flex;align-items:center;gap:4px}
        .su-lk.g{color:var(--g7);font-weight:800}
        .su-lk:hover:not(:disabled){text-decoration:underline}

        .su-center{text-align:center}
        .su-check{width:84px;height:84px;margin:6px auto 16px;border-radius:50%;background:linear-gradient(135deg,var(--g5),var(--g7));display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 0 0 8px var(--g1),0 14px 30px rgba(5,150,105,.35);animation:su-pop .5s cubic-bezier(.2,1.4,.4,1) both}
        @keyframes su-pop{from{transform:scale(.4);opacity:0}to{transform:none;opacity:1}}
        .su-center h3{font-family:'Bricolage Grotesque',sans-serif;font-size:1.45rem;font-weight:800;margin:0 0 8px;color:var(--g8)}
        .su-center p{font-size:.92rem;color:var(--mut);line-height:1.6;margin:0 0 22px}
        .su-center .su-btn+.su-btn{margin-top:10px}

        .su-closed{display:inline-flex;align-items:center;gap:7px;background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;border-radius:999px;padding:5px 14px;font-size:.8rem;font-weight:800;margin-bottom:14px}
        .su-closed i{width:7px;height:7px;border-radius:50%;background:#ef4444;animation:su-pulse 1.8s infinite}
        @keyframes su-pulse{0%{box-shadow:0 0 0 0 rgba(239,68,68,.6)}70%{box-shadow:0 0 0 7px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}
        .su-note{background:var(--g0);border:1px dashed #9fdcbc;border-radius:16px;padding:14px 16px;font-size:.86rem;color:#355a47;line-height:1.55;font-weight:600;text-align:left}
        .su-foot{margin-top:22px;font-size:.8rem;color:#9fdcbc;font-weight:700;text-align:center}

        @media(max-width:420px){.su-card{padding:60px 18px 24px;border-radius:26px}.su-grid{grid-template-columns:1fr}.su-s span{display:none}.su-s.on span{display:inline}}
        @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
      `}</style>
    </>
  );
}

const Logo = () => (
  <div className="su-logo">
    <img src="/logo.png" alt="CEC-TRACK Logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
  </div>
);
const Foot = () => <div className="su-foot">© 2026 CEC-TRACK • DOrSU Cateel Extension Campus</div>;

export default function StudentSignUp() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState('form'); // 'form' -> 'otp' -> 'success'

  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('BSCRIM');
  const [yearLevel, setYearLevel] = useState('1st Year');
  const [section, setSection] = useState('Section A');

  const [serverOtp, setServerOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [otpExpiry, setOtpExpiry] = useState(null);

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Google Apps Script Web App URL
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyetjBCQ7HYgPj_RmE9ik7F9v4-6yVfewhXH8F-0PQKWkabFEqbpcQhxcGz2czK_nnWXA/exec';

  const coursesList = [
    { code: 'BSCRIM', name: 'BS in Criminology' },
    { code: 'BSBA', name: 'BS in Business Administration' },
    { code: 'BSA', name: 'BS in Accountancy' },
    { code: 'BEED', name: 'Bachelor of Elementary Education' },
    { code: 'BSAM', name: 'BS in Agribusiness Management' },
  ];
  const sectionsList = ['Section A', 'Section B', 'Section C', 'Section D', 'Section E', 'Section F', 'Section G', 'Section H', 'Section I', 'Section J', 'Section K'];

  // =========================================================================
  // SCREEN KUNG PANSAMANTALANG NAKASARA ANG PORTAL
  // =========================================================================
  if (IS_SIGNUP_CLOSED) {
    return (
      <div className="su-page">
        <Head><title>Portal Closed • CECTRACK</title></Head>
        <Styles />
        <div className="su-card su-center">
          <Logo />
          <span className="su-closed"><i /> Temporarily closed</span>
          <div className="su-head"><h1>Sign-up portal is closed</h1></div>
          <p>This sign-up website is closed for now. It will open again soon, so please come back later.</p>
          <div className="su-note">
            📢 <strong>Notice:</strong> Please wait for official announcements from your campus administration regarding the registration schedule.
          </div>
        </div>
        <Foot />
      </div>
    );
  }

  // =========================================================================
  // NORMAL NA REGISTRATION LOGIC
  // =========================================================================
  const handleBackToSignUp = () => {
    setStudentId(''); setFullName(''); setEmail(''); setUserOtp(''); setServerOtp('');
    setNotification({ type: '', message: '' });
    setCurrentStep('form');
  };

  const handleInitiateRegistration = async (e) => {
    e.preventDefault();
    setNotification({ type: '', message: '' });

    const cleanId = studentId.trim();
    if (!/^[A-Za-z0-9-]{3,25}$/.test(cleanId)) {
      setNotification({ type: 'error', message: 'Invalid Student ID. Use letters, numbers, and dashes (-) only. Example: 2024-0516' });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(cleanEmail)) {
      setNotification({ type: 'error', message: 'Invalid email address. Please enter a valid email (example: juan@gmail.com or juan@dorsu.edu.ph).' });
      return;
    }

    setLoading(true);
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('school_id, email')
        .or(`school_id.eq.${cleanId},email.eq.${cleanEmail}`)
        .maybeSingle();

      if (existingUser) {
        if (existingUser.school_id === cleanId) throw new Error(`Student ID "${cleanId}" is already registered.`);
        if (existingUser.email === cleanEmail) throw new Error(`Email "${cleanEmail}" is already associated with another account.`);
      }

      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setServerOtp(generatedCode);
      setOtpExpiry(Date.now() + 10 * 60 * 1000);

      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: generatedCode, name: fullName.trim(), type: 'registration' }),
      });

      setCurrentStep('otp');
      setNotification({ type: 'success', message: `Verification code sent to ${cleanEmail}. Please check your inbox or spam folder.` });
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to send verification code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setNotification({ type: '', message: '' });

    if (Date.now() > otpExpiry) {
      setNotification({ type: 'error', message: 'The verification code has expired. Please request a new code.' });
      return;
    }
    if (userOtp.trim() !== serverOtp) {
      setNotification({ type: 'error', message: 'Incorrect verification code. Please check your email and try again.' });
      return;
    }

    setLoading(true);
    const cleanId = studentId.trim();
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { error: insertError } = await supabase.from('profiles').insert([
        {
          school_id: cleanId,
          full_name: fullName.trim(),
          email: cleanEmail,
          password: cleanId,
          course,
          year_level: yearLevel,
          section,
          role: 'student',
          can_scan: false,
          status: 'Active',
          must_change_password: true,
        },
      ]);
      if (insertError) throw new Error(insertError.message);

      setCurrentStep('success');
      setNotification({ type: 'success', message: 'Account successfully verified and registered!' });
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Failed to complete registration.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setNotification({ type: '', message: '' });
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setServerOtp(newCode);
    setOtpExpiry(Date.now() + 10 * 60 * 1000);
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: newCode, name: fullName.trim(), type: 'registration' }),
      });
      setNotification({ type: 'success', message: 'A fresh verification code has been dispatched to your email.' });
    } catch (err) {
      setNotification({ type: 'error', message: 'Unable to resend code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const stepIdx = currentStep === 'form' ? 0 : currentStep === 'otp' ? 1 : 2;
  const title = currentStep === 'otp' ? 'Email verification' : currentStep === 'success' ? 'Verified!' : 'Student sign up';
  const subtitle =
    currentStep === 'otp'
      ? 'Enter the 6-digit authentication code sent to your email inbox.'
      : currentStep === 'success'
      ? 'Your account has been officially verified and activated.'
      : 'Submit your student details to activate your digital attendance profile.';

  return (
    <div className="su-page">
      <Head><title>Student Registration • CECTRACK</title></Head>
      <Styles />

      <div className="su-card">
        <Logo />

        <div className="su-steps" aria-label="Registration progress">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <span className="su-line" />}
              <div className={`su-s ${i <= stepIdx ? 'on' : ''}`}>
                <i>{i < stepIdx ? '✓' : i + 1}</i>
                <span>{s}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="su-head">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {notification.message && (
          <div className={`su-n ${notification.type === 'error' ? 'er' : 'ok'}`} style={{ textAlign: currentStep === 'success' ? 'center' : 'left' }}>
            {notification.message}
          </div>
        )}

        {/* STEP 1: FORM */}
        {currentStep === 'form' && (
          <form className="su-form" onSubmit={handleInitiateRegistration}>
            <div>
              <label className="su-l">Student ID *</label>
              <input className="su-in" type="text" autoComplete="off" placeholder="e.g. 2024-0516" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
            </div>
            <div>
              <label className="su-l">Full name *</label>
              <input className="su-in" type="text" placeholder="e.g. Juan Dela Cruz" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className="su-l">Email address *</label>
              <input className="su-in" type="email" placeholder="e.g. juan@gmail.com or juan@dorsu.edu.ph" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="su-grid">
              <div>
                <label className="su-l">Course *</label>
                <select className="su-in" value={course} onChange={(e) => setCourse(e.target.value)}>
                  {coursesList.map((c) => (<option key={c.code} value={c.code}>{c.code}</option>))}
                </select>
              </div>
              <div>
                <label className="su-l">Year level *</label>
                <select className="su-in" value={yearLevel} onChange={(e) => setYearLevel(e.target.value)}>
                  {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((y) => (<option key={y} value={y}>{y}</option>))}
                </select>
              </div>
            </div>
            <div>
              <label className="su-l">Section *</label>
              <select className="su-in" value={section} onChange={(e) => setSection(e.target.value)}>
                {sectionsList.map((sec) => (<option key={sec} value={sec}>{sec}</option>))}
              </select>
            </div>
            <button type="submit" className="su-btn" disabled={loading}>
              {loading ? 'Sending verification code...' : 'Complete registration'}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {currentStep === 'otp' && (
          <form className="su-form" onSubmit={handleVerifyOtp}>
            <div>
              <label className="su-l" style={{ textAlign: 'center' }}>Enter 6-digit verification code</label>
              <input
                className="su-in su-otp"
                type="text"
                inputMode="numeric"
                maxLength="6"
                placeholder="••••••"
                value={userOtp}
                onChange={(e) => setUserOtp(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="su-btn" disabled={loading || userOtp.length < 6}>
              {loading ? 'Verifying code...' : 'Verify and activate account'}
            </button>
            <div className="su-row">
              <button type="button" className="su-lk" onClick={() => setCurrentStep('form')}>← Edit details</button>
              <button type="button" className="su-lk g" onClick={handleResendOtp} disabled={loading}>Resend code</button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS */}
        {currentStep === 'success' && (
          <div className="su-center">
            <div className="su-check">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3>Registration verified!</h3>
            <p>
              Your account is registered with Student ID <strong>{studentId}</strong>. You can now log in to your account.
            </p>
            <button type="button" className="su-btn" onClick={() => router.push('/login')}>Go to login</button>
            <button type="button" className="su-btn alt" onClick={handleBackToSignUp}>Register another student</button>
          </div>
        )}
      </div>

      <Foot />
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
