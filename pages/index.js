import React, { useState } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';

// =========================================================================
// TOGGLE SWITCH PARA SA SIGN-UP:
// I-set sa `true` aron i-close ang website.
// I-set sa `false` kon gusto na nimo ablihan pag-usab ang registration.
// =========================================================================
const IS_SIGNUP_CLOSED = false;

export default function StudentSignUp() {
  // Navigation Steps: 'form' -> 'otp' -> 'success'
  const [currentStep, setCurrentStep] = useState('form');

  // Form Fields
  const [schoolId, setSchoolId] = useState('');
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
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzuVn8MyNNu472-_t3HWfcZNVZVNDOEs9VNrKihAc2fshTrGrmxzRnysvZf4t7-TFU/exec';

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
  // SCREEN NGA MOGAWAS KON TEMPORARY CLOSED ANG WEBSITE
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
          <title>Portal Closed • CECTRACK Registration</title>
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
          {/* Logo Badge */}
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
              style={{
                width: '48px',
                height: '48px',
                objectFit: 'contain',
              }}
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
            Registration Is Currently Closed
          </h1>

          <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            This sign-up portal is temporarily closed and not accepting new student accounts at this time. It will be open and available soon, so please check back later for official updates.
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
            📢 <strong>Notice:</strong> Please wait for further announcements from your campus administrators or department officers before proceeding.
          </div>
        </div>

        <div style={{ marginTop: '24px', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.04em' }}>
          © 2026 CEC-TRACK • DOrSU CATEEL EXTENSION CAMPUS
        </div>
      </div>
    );
  }

  // =========================================================================
  // NORMAL NGA REGISTRATION FLOW (MOGAWAS KON IS_SIGNUP_CLOSED = false)
  // =========================================================================
  const handleBackToSignUp = () => {
    setSchoolId('');
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

    const cleanId = schoolId.trim();
    const idPattern = /^\d{4}-\d{4,5}$/;
    if (!idPattern.test(cleanId)) {
      setNotification({
        type: 'error',
        message: 'Invalid School ID format. Please use the pattern: 2024-0516',
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
          throw new Error(`School ID "${cleanId}" is already registered.`);
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
    const cleanId = schoolId.trim();
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
        <style>{`
          @keyframes popCelebration {
            0% { transform: scale(0.6) rotate(-15deg); opacity: 0; }
            50% { transform: scale(1.15) rotate(8deg); }
            70% { transform: scale(0.95) rotate(-4deg); }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
        `}</style>
      </Head>

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '32px 24px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
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
                style={{
                  width: '48px',
                  height: '48px',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}

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

          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
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

        {notification.message && (
          <div
            style={{
              marginBottom: '18px',
              fontSize: '0.82rem',
              fontWeight: 700,
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

        {currentStep === 'form' && (
          <form onSubmit={handleInitiateRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                School ID *
              </label>
              <input
                type="text"
                placeholder="Format: 2024-0516"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
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
          </form>
        )}

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

        {currentStep === 'success' && (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div
              style={{
                width: '74px',
                height: '74px',
                margin: '0 auto 14px auto',
                animation: 'popCelebration 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="68" height="68" viewBox="0 0 48 48" fill="none">
                <path d="M10.5 37.5L7 41C6.2 41.8 7.2 42.8 8 42L11.5 38.5L10.5 37.5Z" fill="#F59E0B" />
                <path d="M10 38L22 26L14 18L7 35C6.5 36.2 7.8 37.5 9 37.8L10 38Z" fill="#F59E0B" />
                <path d="M14 18L18 22L11 29L7 25L14 18Z" fill="#EF4444" />
                <path d="M18 22L22 26L15 33L11 29L18 22Z" fill="#3B82F6" />
                <path d="M24 16C26 12 30 14 32 10C33 8 32 6 30 5" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M27 24C31 23 33 27 38 26C41 25.5 42 23 41 21" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M20 12C21 8 25 7 26 3" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="36" cy="14" r="2.5" fill="#EC4899" />
                <circle cx="28" cy="7" r="2" fill="#F59E0B" />
                <circle cx="39" cy="32" r="2" fill="#3B82F6" />
                <circle cx="19" cy="8" r="2" fill="#8B5CF6" />
                <circle cx="32" cy="20" r="1.5" fill="#10B981" />
                <path d="M34 4L35.5 7L38.5 7.5L36 9.5L37 12.5L34 11L31 12.5L32 9.5L29.5 7.5L32.5 7L34 4Z" fill="#FBBF24" />
              </svg>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
              Registration Verified!
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.55 }}>
              Your account has been officially registered with School ID <strong>{schoolId}</strong>. You may now log in your account.
            </p>

            <button
              type="button"
              onClick={handleBackToSignUp}
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
              }}
            >
              Back to Sign Up ➔
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
