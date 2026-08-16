import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import SEO from '../components/SEO.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { Mail, Lock, Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import phaneendraLogo from '../assets/phaneendramarri.svg';

export default function SigninPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Missing fields', 'Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await client.post('/api/auth/signin', { email, password });
      localStorage.setItem('jwt', res.data.token);
      toast.success('Welcome back!');
      navigate('/studio');
    } catch (err) {
      toast.error('Authentication failed', err?.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] font-sans">
      <SEO title="Sign In — Notes" />
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Card */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--line)]
            bg-[var(--surface)] shadow-[var(--shadow-md)] p-7">

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-7">
              <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--accent-soft)]
                border border-[var(--accent-soft)] flex items-center justify-center mb-4">
                <img
                  src={phaneendraLogo}
                  alt="Notes"
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <Shield
                  size={22}
                  className="text-[var(--accent)] hidden"
                  style={{ display: 'none' }}
                />
              </div>
              <h1 className="font-serif font-bold text-2xl text-[var(--ink)]">
                Author Portal
              </h1>
              <p className="text-xs text-[var(--muted)] mt-1 font-normal">
                Sign in to manage your notes and studio.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-[var(--ink)]"
                >
                  Email
                </label>
                <div className="flex items-center rounded-[var(--radius-md)]
                  border border-[var(--line)] bg-[var(--bg)] px-3.5 gap-2.5
                  focus-within:border-[var(--accent)] transition-colors">
                  <Mail size={14} className="text-[var(--muted)] shrink-0" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="flex-1 py-2.5 bg-transparent text-sm text-[var(--ink)]
                      placeholder:text-[var(--muted)] outline-none font-normal"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-[var(--ink)]"
                >
                  Password
                </label>
                <div className="flex items-center rounded-[var(--radius-md)]
                  border border-[var(--line)] bg-[var(--bg)] px-3.5 gap-2.5
                  focus-within:border-[var(--accent)] transition-colors">
                  <Lock size={14} className="text-[var(--muted)] shrink-0" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="flex-1 py-2.5 bg-transparent text-sm text-[var(--ink)]
                      placeholder:text-[var(--muted)] outline-none font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="p-1 text-[var(--muted)] hover:text-[var(--ink)]
                      transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-[var(--radius-md)] font-bold text-sm gap-2
                  bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)]
                  hover:bg-[var(--accent-strong)] transition-colors cursor-pointer
                  shadow-[var(--shadow-sm)]"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                Sign In to Studio
              </Button>
            </form>
          </div>

          {/* Back link */}
          <p className="mt-4 text-center text-xs text-[var(--muted)]">
            <button
              onClick={() => navigate('/')}
              className="hover:text-[var(--accent)] transition-colors cursor-pointer font-semibold"
            >
              ← Back to Notes
            </button>
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
