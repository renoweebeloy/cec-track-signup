import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

// =========================================================================
// TOGGLE SWITCH PARA SA SIGN-UP PORTAL:
// I-set sa `true` kung nais pansamantalang isara ang portal.
// I-set sa `false` upang buksan ang pagpaparehistro para sa mga estudyante.
// =========================================================================
const IS_SIGNUP_CLOSED = false;

export default function StudentSignUp() {
  const router = useRouter();

  // Navigation Steps: 'form' -> 'otp' -> 'success'
  const [currentStep, setCurrentStep] = useState('form');

  // Form Fields
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('BSCRIM');
  const [yearLevel, setYearLevel] = useState('1st Year');
  const [section, setSection] = useState('Section A');

  // OTP Verification States
  const [serverOtp, setServerOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [otpExpiry, setOtpExpiry] = useState(null);

  // UI Status
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

  const sectionsList = [
    'Section A', 'Section B', 'Section C', 'Section D', 'Section E',
    'Section F', 'Section G', 'Section H', 'Section I', 'Section J', 'Section K',
  ];

  // =========================================================================
  // SCREEN KUNG PANSAMANTALANG NAKASARA ANG PORTAL
  // =========================================================================
  if (IS_SIGNUP_CLOSED) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '32px 16px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <Head>
          <title>Portal Closed • CECTRACK</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        </Head>

        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '36px 28px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0',
            boxSizing: 'border-box',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              margin: '0 auto 16px auto',
              borderRadius: '18px',
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(34, 197, 94, 0.12)',
            }}
          >
            <img
              src="/logo.png"
              alt="CEC-TRACK Logo"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              style={{ width: '48px', height: '48px', objectFit: 'contain' }}
            />
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              padding: '4px 14px',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '14px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
            TEMPORARILY CLOSED
          </span>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '0 0 12px 0' }}>
            Sign-Up Portal Is Closed
          </h1>

          <p style={{ fontSize: '0.90rem', color: '#64748b', lineHeight: 1.6, margin: '0 0 20px 0' }}>
            This website of sign up is closed. It will be open and available soon, so please come back soon. This website is not available right now because it is temporarily closed.
          </p>

          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '14px',
              padding: '14px 16px',
              fontSize: '0.80rem',
              color: '#475569',
              lineHeight: 1.5,
              fontWeight: 600,
            }}
          >
            📢 <strong>Notice:</strong> Please wait for official announcements from your campus administration regarding the registration schedule.
          </div>

          <div style={{ marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => router.push('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#15803d',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Go to Login Portal ➔
            </button>
          </div>
        </div>

        <div style={{ marginTop: '24px', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.04em' }}>
          © 2026 CEC-TRACK • DOrSU CATEEL EXTENSION CAMPUS
        </div>
      </div>
    );
  }

  // =========================================================================
  // NORMAL NA REGISTRATION LOGIC
  // =========================================================================
  const handleBackToSignUp = () => {
    setStudentId('');
    setFullName('');
    setEmail('');
    setUserOtp('');
    setServerOtp('');
    setNotification({ type: '', message: '' });
    setCurrentStep('form');
  };

  const handleInitiateRegistration = async (e) => {
    e.preventDefault();
    setNotification({ type: '', message: '' });

    const cleanId = studentId.trim();
    const idPattern = /^\d{4}-\d{4,5}$/;
    if (!idPattern.test(cleanId)) {
      setNotification({
        type: 'error',
        message: 'Invalid Student ID format. Please use the pattern: 2024-0516',
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailPattern.test(cleanEmail)) {
      setNotification({
        type: 'error',
        message: 'Invalid email address. Please enter a valid Gmail account ending with @gmail.com',
      });
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
        if (existingUser.school_id === cleanId) {
          throw new Error(`Student ID "${cleanId}" is already registered.`);
        }
        if (existingUser.email === cleanEmail) {
          throw new Error(`Email "${cleanEmail}" is already associated with another account.`);
        }
      }

      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setServerOtp(generatedCode);
      setOtpExpiry(Date.now() + 10 * 60 * 1000);

      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          code: generatedCode,
          name: fullName.trim(),
          type: 'registration',
        }),
      });

      setCurrentStep('otp');
      setNotification({
        type: 'success',
        message: `Verification code sent to ${cleanEmail}. Please check your inbox or spam folder.`,
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to send verification code. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setNotification({ type: '', message: '' });

    if (Date.now() > otpExpiry) {
      setNotification({
        type: 'error',
        message: 'The verification code has expired. Please request a new code.',
      });
      return;
    }

    if (userOtp.trim() !== serverOtp) {
      setNotification({
        type: 'error',
        message: 'Incorrect verification code. Please check your email and try again.',
      });
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
          course: course,
          year_level: yearLevel,
          section: section,
          role: 'student',
          can_scan: false,
          status: 'Active',
          must_change_password: true,
        },
      ]);

      if (insertError) throw new Error(insertError.message);

      setCurrentStep('success');
      setNotification({
        type: 'success',
        message: 'Account successfully verified and registered!',
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to complete registration.',
      });
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
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: newCode,
          name: fullName.trim(),
          type: 'registration',
        }),
      });
      setNotification({
        type: 'success',
        message: 'A fresh verification code has been dispatched to your email.',
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Unable to resend code. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '32px 16px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <Head>
        <title>Student Registration • CECTRACK</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '28px',
          padding: '36px 24px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          {currentStep === 'form' && (
            <div
              style={{
                width: '68px',
                height: '68px',
                margin: '0 auto 14px auto',
                borderRadius: '18px',
                backgroundColor: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(34, 197, 94, 0.12)',
              }}
            >
              <img
                src="/logo.png"
                alt="CEC-TRACK Logo"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                style={{ width: '48px', height: '48px', objectFit: 'contain' }}
              />
            </div>
          )}

          {/* Badge: CEC-TRACK */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
              padding: '4px 14px',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '10px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#15803d' }}></span>
            CEC-TRACK
          </span>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
            {currentStep === 'otp' ? 'Email Verification' : currentStep === 'success' ? 'Verified!' : 'Student Sign Up'}
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
            {currentStep === 'otp'
              ? 'Enter the 6-digit authentication code sent to your Gmail inbox.'
              : currentStep === 'success'
              ? 'Your account has been officially verified and activated.'
              : 'Submit your student details to activate your digital attendance profile.'}
          </p>
        </div>

        {/* Feedback Alert Box */}
        {notification.message && (
          <div
            style={{
              marginBottom: '18px',
              fontSize: '0.82rem',
              fontWeight: 700,
              textAlign: currentStep === 'success' ? 'center' : 'left',
              color: notification.type === 'error' ? '#b91c1c' : '#15803d',
              backgroundColor: notification.type === 'error' ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${notification.type === 'error' ? '#fee2e2' : '#bbf7d0'}`,
              padding: '12px 14px',
              borderRadius: '12px',
              lineHeight: 1.4,
            }}
          >
            {notification.message}
          </div>
        )}

        {/* STEP 1: INITIAL REGISTRATION FORM */}
        {currentStep === 'form' && (
          <form onSubmit={handleInitiateRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                Student ID *
              </label>
              <input
                type="text"
                placeholder="Format: 2024-0516"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '11px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Juan Dela Cruz"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '11px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                Gmail Address *
              </label>
              <input
                type="email"
                placeholder="e.g. student@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '11px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  Course *
                </label>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '11px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                >
                  {coursesList.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  Year Level *
                </label>
                <select
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '11px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                Section *
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  borderRadius: '11px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              >
                {sectionsList.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                backgroundColor: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.94rem',
                fontWeight: 900,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(21, 128, 61, 0.25)',
                marginTop: '8px',
                touchAction: 'manipulation',
              }}
            >
              {loading ? 'Sending Verification Code...' : 'Complete Registration ➔'}
            </button>

            {/* BUTTON / LINK ARON MODIRETSO SA LOGIN */}
            <div
              style={{
                textAlign: 'center',
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>
                Already registered?
              </span>
              <button
                type="button"
                onClick={() => router.push('/login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#15803d',
                  fontSize: '0.84rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                  touchAction: 'manipulation',
                }}
              >
                Log In here ➔
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION SCREEN */}
        {currentStep === 'otp' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength="6"
                placeholder="• • • • • •"
                value={userOtp}
                onChange={(e) => setUserOtp(e.target.value.replace(/\D/g, ''))}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '2px solid #15803d',
                  fontSize: '1.6rem',
                  fontWeight: 900,
                  textAlign: 'center',
                  letterSpacing: '8px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                }}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || userOtp.length < 6}
              style={{
                width: '100%',
                padding: '13px',
                backgroundColor: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.94rem',
                fontWeight: 900,
                cursor: loading || userOtp.length < 6 ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(21, 128, 61, 0.25)',
              }}
            >
              {loading ? 'Verifying Code...' : 'Authorize & Activate Account ➔'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setCurrentStep('form')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                <span>Back to Edit Details</span>
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#15803d',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS / VERIFIED SCREEN */}
        {currentStep === 'success' && (
          <div style={{ textAlign: 'center', padding: '4px 8px 10px 8px' }}>
            <div
              style={{
                width: '74px',
                height: '74px',
                margin: '10px auto 14px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src="https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/emoji_u1f389.svg"
                alt="Celebration Party Popper"
                style={{
                  width: '68px',
                  height: '68px',
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <span style={{ display: 'none', fontSize: '3.4rem', lineHeight: 1 }}>🎉</span>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
              Registration Verified!
            </h3>

            <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.55 }}>
              Your account has been officially registered with Student ID <strong>{studentId || '2023-8407'}</strong>. You may now log in to your account.
            </p>

            <button
              type="button"
              onClick={() => router.push('/login')}
              style={{
                display: 'block',
                width: '100%',
                padding: '13px',
                backgroundColor: '#15803d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.94rem',
                fontWeight: 900,
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(21, 128, 61, 0.25)',
                touchAction: 'manipulation',
              }}
            >
              Go to Login ➔
            </button>

            <button
              type="button"
              onClick={handleBackToSignUp}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '12px',
                textDecoration: 'underline',
              }}
            >
              Register Another Account
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '24px', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.04em' }}>
        © 2026 CEC-TRACK • DOrSU CATEEL EXTENSION CAMPUS
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
