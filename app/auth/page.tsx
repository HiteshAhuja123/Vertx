'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/components/StoreContext';
import { Smartphone, Mail, ArrowRight, Check } from 'lucide-react';

function AuthPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '';

  const { user, login, signup } = useStore();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [useOtpMode, setUseOtpMode] = useState(false);

  // Forms states
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  // Prefilled only in non-production builds, to back the OTP demo path against the
  // seeded sandbox admin account — a real customer's form never arrives pre-filled.
  const [password, setPassword] = useState(process.env.NODE_ENV !== 'production' ? 'warriorpass1' : '');
  
  // OTP Verification
  const [otpSent, setOtpSent] = useState(false);
  const [otpVal, setOtpVal] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push(redirect ? `/${redirect}` : '/profile');
    }
  }, [user, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isLoginTab) {
      if (useOtpMode && !otpSent) {
        if (!phone) {
          setErrorMsg('Mobile number is required');
          return;
        }
        
        // Validate 10 digit length
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
          setErrorMsg('Please enter a valid 10-digit mobile number.');
          return;
        }
        
        const loginEmail = email || 'admin@vortx.fit';
        const res = await login(loginEmail, password);
        if (res.success) {
          setOtpSent(true);
          setSuccessMsg('OTP Code dispatched successfully via WhatsApp.');
        } else {
          setErrorMsg(res.error || 'Email corresponding to OTP request not found.');
        }
        return;
      }

      if (useOtpMode && otpSent) {
        if (otpVal.length === 6) {
          router.push(redirect ? `/${redirect}` : '/profile');
        } else {
          setErrorMsg('Invalid verification code.');
        }
        return;
      }

      // Normal Password Login
      if (!email) {
        setErrorMsg('Email address is required');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMsg('Please enter a valid email address (e.g., user@example.com).');
        return;
      }
      
      const res = await login(email, password);
      if (res.success) {
        router.push(redirect ? `/${redirect}` : '/profile');
      } else {
        setErrorMsg(res.error || 'Invalid login credentials.');
      }
    } else {
      // Sign Up Registration
      if (!email || !fullName || !phone || !password) {
        setErrorMsg('All fields are required');
        return;
      }

      if (fullName.trim().length < 3) {
        setErrorMsg('Full name must be at least 3 characters long.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }

      // Validate 10 digit length
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number.');
        return;
      }

      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }

      const res = await signup(fullName, email, phone, password);
      if (res.success) {
        setSuccessMsg('Warrior account registered! Redirecting...');
        setTimeout(() => {
          router.push(redirect ? `/${redirect}` : '/profile');
        }, 1500);
      } else {
        setErrorMsg(res.error || 'An account with this email already exists.');
      }
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-5 sm:px-8 bg-vortx-black">
      <div className="w-full max-w-lg bg-vortx-dark border border-vortx-white/20 p-8 sm:p-10">
        
        {/* Tab Headers */}
        <div className="flex border-b border-vortx-white/10 text-sm font-sans font-bold tracking-widest mb-10">
          <button
            onClick={() => {
              setIsLoginTab(true);
              setOtpSent(false);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 pb-4 transition ${
              isLoginTab ? 'border-b-2 border-vortx-white text-vortx-white' : 'text-vortx-gray hover:text-vortx-white'
            }`}
          >
            LOGIN
          </button>
          <button
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 pb-4 transition ${
              !isLoginTab ? 'border-b-2 border-vortx-white text-vortx-white' : 'text-vortx-gray hover:text-vortx-white'
            }`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Brand Slogan */}
        <div className="text-center mb-10">
          <span className="font-sans text-2xs font-bold tracking-[0.2em] text-vortx-gray uppercase">VORTX SECURITY</span>
          <h2 className="font-display text-2xl font-bold tracking-wider text-vortx-white mt-3 uppercase">
            {isLoginTab ? 'CHOOSE PERFORMANCE' : 'JOIN THE WARRIOR CLAN'}
          </h2>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-3.5 border border-vortx-red/30 bg-vortx-red/10 text-vortx-red text-xs font-sans font-medium space-y-1">
              <p className="font-bold">{errorMsg}</p>
              {errorMsg.toLowerCase().includes('email not confirmed') && (
                <p className="text-2xs text-vortx-gray leading-normal">
                  Supabase requires email confirmation. Click the link sent to your email, or disable "Confirm email" in your Supabase Dashboard under Auth Settings.
                </p>
              )}
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-sans font-medium rounded">
              {successMsg}
            </div>
          )}

          {/* Registration Fields */}
          {!isLoginTab && (
            <>
               <div>
                <label htmlFor="auth-fullname" className="block text-xs font-sans font-bold tracking-wider text-vortx-gray uppercase mb-2.5">FULL NAME</label>
                <input
                  id="auth-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ENTER FULL NAME"
                  className="w-full bg-vortx-black border border-vortx-white/20 px-4 py-3.5 text-base text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/50"
                  required
                />
              </div>
              <div>
                <label htmlFor="auth-signup-phone" className="block text-xs font-sans font-bold tracking-wider text-vortx-gray uppercase mb-2.5">MOBILE NUMBER</label>
                <div className="relative">
                  <input
                    id="auth-signup-phone"
                    type="tel"
                    value={phone}
                    maxLength={10}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="ENTER 10-DIGIT MOBILE"
                    className="w-full bg-vortx-black border border-vortx-white/20 px-4 py-3.5 pl-14 text-base text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/50"
                    required
                  />
                  <span className="absolute left-4 top-3.5 text-base text-vortx-gray font-mono font-bold">+91</span>
                </div>
              </div>
            </>
          )}

          {/* Email Address Field */}
          {(!useOtpMode || !isLoginTab) && (
             <div>
              <label htmlFor="auth-email" className="block text-xs font-sans font-bold tracking-wider text-vortx-gray uppercase mb-2.5">EMAIL ADDRESS</label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER EMAIL ADDRESS"
                className="w-full bg-vortx-black border border-vortx-white/20 px-4 py-3.5 text-base text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/50"
                required
              />
            </div>
          )}

          {/* Password Field for Signup */}
          {!isLoginTab && (
            <div>
              <label htmlFor="auth-signup-password" className="block text-xs font-sans font-bold tracking-wider text-vortx-gray uppercase mb-2.5">PASSWORD</label>
              <input
                id="auth-signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="CREATE PASSWORD (MIN 6 CHARS)"
                className="w-full bg-vortx-black border border-vortx-white/20 px-4 py-3.5 text-base text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/50"
                required
              />
            </div>
          )}

          {/* Password / OTP Input Fields for Login */}
          {isLoginTab && (
            <>
              {useOtpMode ? (
                /* OTP Login mode input */
                <div className="space-y-4">
                  {!otpSent ? (
                    <div>
                      <label htmlFor="auth-otp-phone" className="block text-xs font-sans font-bold tracking-wider text-vortx-gray uppercase mb-1.5">MOBILE NUMBER</label>
                      <div className="relative">
                        <input
                          id="auth-otp-phone"
                          type="tel"
                          value={phone}
                          maxLength={10}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="REGISTERED MOBILE"
                          className="w-full bg-vortx-black border border-vortx-white/20 px-3.5 py-2.5 pl-12 text-xs text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/30"
                        />
                        <span className="absolute left-3.5 top-3 text-xs text-vortx-gray font-mono font-bold">+91</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="auth-otp-code" className="block text-xs font-sans font-bold tracking-wider text-vortx-gray uppercase mb-1.5">VERIFICATION CODE</label>
                      <input
                        id="auth-otp-code"
                        type="text"
                        maxLength={6}
                        value={otpVal}
                        onChange={(e) => setOtpVal(e.target.value.replace(/\D/g, ''))}
                        placeholder="ENTER 6-DIGIT OTP"
                        className="w-full bg-vortx-black border border-vortx-white/20 px-3.5 py-2.5 text-center text-sm font-bold text-vortx-white tracking-[0.4em] focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/30 placeholder:tracking-normal"
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* Standard Password input */
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="auth-login-password" className="block text-xs font-sans font-bold tracking-wider text-vortx-gray uppercase">PASSWORD</label>
                    <button type="button" className="text-2xs text-vortx-gray hover:text-vortx-white font-medium underline">Forgot?</button>
                  </div>
                  <input
                    id="auth-login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ENTER PASSWORD"
                    className="w-full bg-vortx-black border border-vortx-white/20 px-3.5 py-2.5 text-xs text-vortx-white focus:outline-none focus:border-vortx-white font-mono placeholder:text-vortx-gray/30"
                    required
                  />
                </div>
              )}
            </>
          )}

          {/* CTA Buttons */}
          <button
            type="submit"
            className="w-full py-4 bg-vortx-white text-vortx-black font-sans text-sm font-bold tracking-widest hover:bg-vortx-white/95 active:scale-98 transition flex items-center justify-center gap-2"
          >
            {isLoginTab ? (useOtpMode && !otpSent ? 'SEND CODE' : 'VERIFY & SIGN IN') : 'CREATE CLAN ACCOUNT'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Login Option (OTP vs Password) */}
          {isLoginTab && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setUseOtpMode(!useOtpMode);
                  setOtpSent(false);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="inline-flex items-center gap-1 text-xs font-bold tracking-wider text-vortx-gray hover:text-vortx-white transition font-sans"
              >
                {useOtpMode ? <Mail className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                {useOtpMode ? 'USE EMAIL & PASSWORD' : 'USE MOBILE OTP CODE'}
              </button>
            </div>
          )}
        </form>

        {/* Dev-only sandbox panel — never rendered in a production build */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-10 pt-8 border-t border-vortx-white/10 text-center font-mono text-xs text-vortx-gray leading-relaxed space-y-3">
            <p className="font-bold text-vortx-white">SANDBOX TESTING DETAILS (DEV ONLY):</p>
            <p>Login with email: <span className="text-vortx-white font-bold select-all">admin@vortx.fit</span> to access the admin features.</p>
            <p>Enter any email for customer logins; signup generates code WELCOME10 automatically.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AuthPortal() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center p-6 bg-vortx-black min-h-screen">
        <div className="w-full max-w-md p-8 text-center text-xs text-vortx-gray font-sans tracking-widest uppercase">
          LOADING PORTAL...
        </div>
      </div>
    }>
      <AuthPortalContent />
    </Suspense>
  );
}
