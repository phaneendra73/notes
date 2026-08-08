import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import SEO from '../components/SEO.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Label } from '../components/ui/Label.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { FiMail, FiLock, FiShield, FiLoader, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Sign In — Kadha" />
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[450px] h-[450px] rounded-full bg-primary/10 blur-3xl opacity-60" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-[420px]"
        >
          <Card className="border border-border bg-card shadow-2xl p-6 rounded-[24px]">
            <CardHeader className="text-center pb-4 pt-2">
              <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center shadow-[0_0_22px_var(--neon-glow)]">
                <FiShield size={22} />
              </div>
              <CardTitle className="text-2xl font-bold">Author Portal</CardTitle>
              <CardDescription>Sign in to manage your lessons and studio.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-9 h-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="pl-9 pr-10 h-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={loading} size="lg" className="mt-3 w-full">
                  {loading && <FiLoader size={15} className="spin mr-2" />}
                  Sign In to Studio
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
