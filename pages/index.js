import React, { useState } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';

export default function StudentSignUp() {
  // Form State Values
  const [schoolId, setSchoolId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('BSCRIM');
  const [yearLevel, setYearLevel] = useState('1st Year');
  const [section, setSection] = useState('Section A');

  // UI Status States
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setNotification({ type: '', message: '' });

    // 1. School ID Format Validation (e.g. 2024-0516)
    const cleanId = schoolId.trim();
    const idPattern = /^\d{4}-\d{4,5}$/;
    if (!idPattern.test(cleanId)) {
      setNotification({
        type: 'error',
        message: 'Invalid School ID format. Please use the pattern: 2024-0516',
      });
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 2. Check if School ID or Email is already registered
      const { data: existingUser, error: checkError } = await supabase
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

      // 3. Insert student record into Supabase
      // Default password is set to their School ID, requiring password change upon initial login
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

      setIsSuccess(true);
      setNotification({
        type: 'success',
        message: 'Student account registered successfully!',
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'An error occurred during registration. Please try again.',
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
        <title>Student Registration • CEC-TRACK</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
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
        }}
      >
        {/* Institutional Crest / Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 14px auto',
              borderRadius: '50%',
              backgroundColor: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(21, 128, 61, 0.25)',
              border: '3px solid #dcfce7',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>

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
              marginBottom: '8px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#15803d' }}></span>
            CEC-TRACK SYSTEM
          </span>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
            Student Sign Up
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
            Submit your student details to activate your digital attendance profile.
          </p>
        </div>

        {/* Alerts / Feedback Message */}
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

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
              Registration Successful!
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.55 }}>
              Your School ID (<strong>{schoolId}</strong>) has been officially recorded. You may now log in via the student portal using your registered Gmail and School ID to configure your permanent password.
            </p>
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '0.78rem',
                color: '#475569',
                fontWeight: 600,
              }}
            >
              Default Password: <strong>{schoolId}</strong>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* School ID Input */}
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

            {/* Full Name Input */}
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

            {/* Gmail / Email Address Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                Gmail / Email Address *
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

            {/* Course & Year Level Row */}
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

            {/* Section Selection */}
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

            {/* Information Notice */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                fontSize: '0.75rem',
                color: '#64748b',
                lineHeight: 1.4,
              }}
            >
              🔒 Initial password will automatically match your <strong>School ID</strong>. You will be prompted to set a new password upon your first sign-in.
            </div>

            {/* Submit Button */}
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
                marginTop: '4px',
                touchAction: 'manipulation',
              }}
            >
              {loading ? 'Processing Registration...' : 'Complete Registration ➔'}
            </button>
          </form>
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
