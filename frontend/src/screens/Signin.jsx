import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getenv } from '../utils/getenv.js';
import { Appbar, Footer } from '../components/ui/index.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Label } from '../components/ui/Label.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useToast } from '../components/Toaster.jsx';
import { FiMail, FiLock, FiShield, FiLoader } from 'react-icons/fi';
import { motion } from 'framer-motion';

function FormField({ id, label, icon: Icon, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input id={id} className="pl-9 h-10 w-full" {...props} />
      </div>
    </div>
  );
}

export default function Signin() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast({ title: 'Missing fields', description: 'Enter author email and password.', variant: 'destructive' });
    setLoading(true);
    try {
      const res = await axios.post(`${getenv('APIURL')}/user/signin`, { email, password });
      localStorage.setItem('jwt', res.data.jwt);
      toast({ title: 'Author Authenticated!', description: 'Welcome back, Phaneendra.', variant: 'success' });
      navigate('/profile');
    } catch (err) {
      toast({ title: 'Authentication Failed', description: err.response?.data?.error || 'Invalid credentials.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Appbar />
      <main className="flex-1 flex items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[450px] h-[450px] rounded-full bg-primary/10 blur-3xl opacity-60" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 w-full max-w-[420px]"
        >
          <Card className="border border-border bg-card shadow-[0_24px_70px_rgba(2,6,23,0.08)] p-6 rounded-[24px]">
            <CardHeader className="text-center pb-4 pt-2">
              <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-xl shadow-[0_0_22px_var(--neon-glow)]">
                <FiShield size={22} />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                Author Portal
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Sign in to manage stories, write essays, and configure platform tags.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <FormField id="email" label="Author Email" icon={FiMail} type="email" placeholder="phaneendra@kadha.io" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <FormField id="password" label="Author Password" icon={FiLock} type="password" placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button type="submit" disabled={loading} size="lg" className="mt-4 w-full h-10">
                  {loading && <FiLoader size={16} className="spin mr-2" />}
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
