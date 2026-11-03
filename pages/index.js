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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI Status States
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [isSuccess, setIsSuccess] = useState(false);

  // Link paingon sa imong Main Login Portal
  const MAIN_LOGIN_URL = 'https://cec-track.vercel.app/login';

  const coursesList = [
    { code: 'BSCRIM', name: 'BS Criminology' },
    { code: 'BSBA', name: 'BS Business Administration' },
    { code: 'BSA', name: 'BS Accountancy' },
    { code: 'BEED', name: 'Bachelor of Elementary Education' },
    { code: 'BSAM', name: 'BS Agribusiness Management' },
  ];

  const sectionsList = [
    'Section A', 'Section B', 'Section C', 'Section D', 'Section E',
    'Section F', 'Section G', 'Section H', 'Section I', 'Section J', 'Section K',
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setNotification({ type: '', message: '' });

    // 1. Validasyon sa School ID Format (e.g. 2024-0516)
    const cleanId = schoolId.trim();
    const idPattern = /^\d{4}-\d{4,5}$/;
    if (!idPattern.test(cleanId)) {
      setNotification({
        type: 'error',
        message: 'Sayop ang pormat sa School ID. Gamita ang format nga: 2024-0516',
      });
      return;
    }

    // 2. Validasyon sa Password
    if (password.length < 6) {
      setNotification({
        type: 'error',
        message: 'Ang password kinahanglang labing menos 6 ka karakter.',
      });
      return;
    }

    if (password !== confirmPassword) {
      setNotification({
        type: 'error',
        message: 'Wala magkatugma ang Confirm Password.',
      });
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 3. Pagsusi kon rehistrado na ba ang ID o Email sa 'profiles' table
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('school_id, email')
        .or(`school_id.eq.${cleanId},email.eq.${cleanEmail}`)
        .maybeSingle();

      if (existingUser) {
        if (existingUser.school_id === cleanId) {
          throw new Error(`Ang School ID "${cleanId}" rehistrado na daan.`);
        }
        if (existingUser.email === cleanEmail) {
          throw new Error(`Ang Email "${cleanEmail}" nagamit na sa laing account.`);
        }
      }

      // 4. Pag-insert sa bag-ong estudyante sa Supabase
      const { error: insertError } = await supabase.from('profiles').insert([
        {
          school_id: cleanId,
          full_name: fullName.trim(),
          email: cleanEmail,
          password: password.trim(),
          course: course,
          year_level: yearLevel,
          section: section,
          role: 'student',
          can_scan: false,
          status: 'Active',
          must_change_password: false,
        },
      ]);

      if (insertError) throw new Error(insertError.message);

      setIsSuccess(true);
      setNotification({
        type: 'success',
        message: 'Malampusong narehistro ang imong account!',
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Adunay sayop sa pag-rehistro.',
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
        padding: '24px 16px',
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
          borderRadius: '26px',
          padding: '32px 24px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          boxSizing: 'border-box',
        }}
      >
        {/* Header Title & Badge */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
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
              fontSize: '0.74rem',
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
            Student Sign Up
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
            Isulod ang imong mga impormasyon aron makamugna og opisyal nga scannable attendance account.
          </p>
        </div>

        {/* Notipikasyon (Success / Error Alert) */}
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
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
              Rehistrasyon Malampuson!
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 22px 0', lineHeight: 1.5 }}>
              Ang imong School ID (<strong>{schoolId}</strong>) narehistro na sa sistema. Mahimo ka nang mag-log in sa imong portal aron ma-activate ang imong Attendance QR Code.
            </p>
            <a
              href={MAIN_LOGIN_URL}
              style={{
                display: 'block',
                width: '100%',
                padding: '13px',
                backgroundColor: '#15803d',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: 900,
                textAlign: 'center',
                boxSizing: 'border-box',
                boxShadow: '0 4px 14px rgba(21, 128, 61, 0.25)',
              }}
            >
              Adto sa Log In Page ➔
            </a>
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
                placeholder="Pananglitan: 2024-0516"
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
                Kumpletong Pangalan *
              </label>
              <input
                type="text"
                placeholder="Pananglitan: Juan Dela Cruz"
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

            {/* Gmail / Email Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                Gmail / Email Address *
              </label>
              <input
                type="email"
                placeholder="Pananglitan: student@gmail.com"
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
                  Kurso *
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
                Seksiyon *
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

            {/* Password Fields Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  Password *
                </label>
                <input
                  type="password"
                  placeholder="Min. 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '11px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  Confirm *
                </label>
                <input
                  type="password"
                  placeholder="I-type usab"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '11px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                  required
                />
              </div>
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
                marginTop: '6px',
                touchAction: 'manipulation',
              }}
            >
              {loading ? 'Giproseso ang Rehistrasyon...' : 'Sign Up Account ➔'}
            </button>

            {/* Balik sa Log In Link */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Naa na kay account? </span>
              <a
                href={MAIN_LOGIN_URL}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 900,
                  color: '#15803d',
                  textDecoration: 'none',
                }}
              >
                Mag Log In Dinhi ➔
              </a>
            </div>
          </form>
        )}
      </div>

      <div style={{ marginTop: '22px', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.04em' }}>
        © 2026 CEC-TRACK • CATEEL EXTENSION CAMPUS
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
