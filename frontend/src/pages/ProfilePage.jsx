import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import SEO from '../components/SEO.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import {
  User, Eye, BookOpen, Save, Key, UserPlus, Lock, Loader2,
  ExternalLink, ArrowRight, ShieldCheck, Globe, Link2
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const token = localStorage.getItem('jwt');

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'password' | 'addAuthor'
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalLessons: 0, totalViews: 0 });

  // Edit Profile Form State
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Reset Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Add Author Form State
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorEmail, setNewAuthorEmail] = useState('');
  const [newAuthorPassword, setNewAuthorPassword] = useState('');
  const [newAuthorRole, setNewAuthorRole] = useState('author');
  const [creatingAuthor, setCreatingAuthor] = useState(false);

  // Fetch profile & stats
  useEffect(() => {
    if (!token) {
      navigate('/signin');
      return;
    }
    client
      .get('/api/auth/profile')
      .then((res) => {
        const u = res.data.user;
        setProfile(u);
        setStats(res.data.stats || { totalLessons: 0, totalViews: 0 });
        setEditName(u.name || '');
        setEditAvatar(u.avatarUrl || u.profileUrl || '');
        setEditBio(u.bio || '');
        setEditGithub(u.githubUrl || '');
        setEditTwitter(u.twitterUrl || '');
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
        toast.error('Session expired', 'Please sign in again.');
        localStorage.removeItem('jwt');
        navigate('/signin');
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await client.put('/api/auth/profile', {
        name: editName,
        avatarUrl: editAvatar,
        bio: editBio,
        githubUrl: editGithub,
        twitterUrl: editTwitter,
      });
      setProfile(res.data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile', err?.response?.data?.error);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Missing fields', 'Enter both current and new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Password mismatch', 'New passwords do not match.');
      return;
    }
    setUpdatingPassword(true);
    try {
      await client.put('/api/auth/password', {
        currentPassword,
        newPassword,
      });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error('Failed to update password', err?.response?.data?.error);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleCreateAuthor = async (e) => {
    e.preventDefault();
    if (!newAuthorEmail || !newAuthorPassword) {
      toast.error('Missing fields', 'Email and password are required.');
      return;
    }
    setCreatingAuthor(true);
    try {
      await client.post('/api/auth/register', {
        name: newAuthorName,
        email: newAuthorEmail,
        password: newAuthorPassword,
        role: newAuthorRole,
      });
      toast.success('Author account created');
      setNewAuthorName('');
      setNewAuthorEmail('');
      setNewAuthorPassword('');
    } catch (err) {
      toast.error('Failed to create author', err?.response?.data?.error);
    } finally {
      setCreatingAuthor(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
            <span className="text-xs text-[var(--muted)]">Loading profile…</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const avatar = profile?.avatarUrl || profile?.profileUrl || '';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] font-sans">
      <SEO title="Account & Profile — Notes" />
      <Navbar />

      <main className="flex-1 max-w-[var(--maxw)] w-full mx-auto px-4 md:px-6 py-8 md:py-10 space-y-6">
        
        {/* Page Header */}
        <div className="pb-6 border-b border-[var(--line)]">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)]">
            Account & Profile
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 font-normal">
            Manage your author profile, bio, social links, and security settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Author Summary Card */}
          <div className="lg:col-span-4 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-6 space-y-6 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[var(--radius-md)] overflow-hidden bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center shrink-0">
                {avatar ? (
                  <img src={avatar} alt={profile?.name || 'Author'} className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-[var(--muted)]" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-serif font-bold text-lg text-[var(--ink)] truncate">
                  {profile?.name || 'Author'}
                </h3>
                <p className="text-xs text-[var(--muted)] truncate font-mono">
                  {profile?.email}
                </p>
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft)] font-sans">
                  <ShieldCheck size={11} /> {profile?.role || 'Author'}
                </span>
              </div>
            </div>

            {profile?.bio && (
              <p className="text-xs text-[var(--ink-2)] leading-relaxed font-normal pt-4 border-t border-[var(--line)]">
                {profile.bio}
              </p>
            )}

            {/* Author Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--line)]">
              <div className="p-3 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--line)] text-center">
                <div className="text-lg font-mono font-bold text-[var(--accent)]">
                  {stats.totalLessons}
                </div>
                <div className="text-[11px] text-[var(--muted)] font-medium">Notes Written</div>
              </div>
              <div className="p-3 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--line)] text-center">
                <div className="text-lg font-mono font-bold text-[var(--ink)]">
                  {stats.totalViews}
                </div>
                <div className="text-[11px] text-[var(--muted)] font-medium">Total Reads</div>
              </div>
            </div>

            {/* Direct Link to Studio */}
            <Button
              onClick={() => navigate('/studio')}
              className="w-full rounded-[var(--radius-md)] text-xs font-bold gap-2 bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] shadow-[var(--shadow-sm)] cursor-pointer"
            >
              <BookOpen size={14} /> Open Author Studio <ArrowRight size={14} />
            </Button>
          </div>

          {/* Right Column: Settings Tabs */}
          <div className="lg:col-span-8 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-sm)] overflow-hidden">
            
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 p-3 border-b border-[var(--line)] bg-[var(--surface-2)]/50">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3.5 py-2 rounded-[var(--radius-md)] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border ${
                  activeTab === 'edit'
                    ? 'bg-[var(--surface)] text-[var(--accent)] border-[var(--line)] shadow-[var(--shadow-sm)]'
                    : 'text-[var(--muted)] border-transparent hover:text-[var(--ink)]'
                }`}
              >
                <User size={14} /> Edit Profile
              </button>

              <button
                onClick={() => setActiveTab('password')}
                className={`px-3.5 py-2 rounded-[var(--radius-md)] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border ${
                  activeTab === 'password'
                    ? 'bg-[var(--surface)] text-[var(--accent)] border-[var(--line)] shadow-[var(--shadow-sm)]'
                    : 'text-[var(--muted)] border-transparent hover:text-[var(--ink)]'
                }`}
              >
                <Key size={14} /> Password & Security
              </button>

              {profile?.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('addAuthor')}
                  className={`px-3.5 py-2 rounded-[var(--radius-md)] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border ${
                    activeTab === 'addAuthor'
                      ? 'bg-[var(--surface)] text-[var(--accent)] border-[var(--line)] shadow-[var(--shadow-sm)]'
                      : 'text-[var(--muted)] border-transparent hover:text-[var(--ink)]'
                  }`}
                >
                  <UserPlus size={14} /> Add Co-Author
                </button>
              )}
            </div>

            {/* Tab 1: Edit Profile */}
            {activeTab === 'edit' && (
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--ink)]">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Phaneendra Marri"
                      className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--ink)]">Avatar Image URL</label>
                    <input
                      type="url"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--ink)]">Bio / About</label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Short description about yourself..."
                    className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)] resize-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--line)]">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                      <Globe size={13} className="text-[var(--accent)]" /> GitHub Profile URL
                    </label>
                    <input
                      type="url"
                      value={editGithub}
                      onChange={(e) => setEditGithub(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)] font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                      <Link2 size={13} className="text-[var(--accent)]" /> Twitter / X URL
                    </label>
                    <input
                      type="url"
                      value={editTwitter}
                      onChange={(e) => setEditTwitter(e.target.value)}
                      placeholder="https://x.com/username"
                      className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)] font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-[var(--radius-md)] text-xs font-bold gap-2 px-5 py-2 bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] cursor-pointer shadow-[var(--shadow-sm)]"
                  >
                    {savingProfile ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    <span>{savingProfile ? 'Saving…' : 'Save Changes'}</span>
                  </Button>
                </div>
              </form>
            )}

            {/* Tab 2: Password & Security */}
            {activeTab === 'password' && (
              <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--ink)]">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--ink)]">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--ink)]">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={updatingPassword}
                    className="rounded-[var(--radius-md)] text-xs font-bold gap-2 px-5 py-2 bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] cursor-pointer shadow-[var(--shadow-sm)]"
                  >
                    {updatingPassword ? <Loader2 size={13} className="animate-spin" /> : <Lock size={13} />}
                    <span>{updatingPassword ? 'Updating…' : 'Update Password'}</span>
                  </Button>
                </div>
              </form>
            )}

            {/* Tab 3: Add Co-Author (Admin only) */}
            {activeTab === 'addAuthor' && profile?.role === 'admin' && (
              <form onSubmit={handleCreateAuthor} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--ink)]">Author Name</label>
                    <input
                      type="text"
                      value={newAuthorName}
                      onChange={(e) => setNewAuthorName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--ink)]">Email Address</label>
                    <input
                      type="email"
                      value={newAuthorEmail}
                      onChange={(e) => setNewAuthorEmail(e.target.value)}
                      placeholder="author@example.com"
                      className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--ink)]">Initial Password</label>
                    <input
                      type="password"
                      value={newAuthorPassword}
                      onChange={(e) => setNewAuthorPassword(e.target.value)}
                      placeholder="Set password"
                      className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--ink)]">Role</label>
                    <select
                      value={newAuthorRole}
                      onChange={(e) => setNewAuthorRole(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                    >
                      <option value="author">Author</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={creatingAuthor}
                    className="rounded-[var(--radius-md)] text-xs font-bold gap-2 px-5 py-2 bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] cursor-pointer shadow-[var(--shadow-sm)]"
                  >
                    {creatingAuthor ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                    <span>{creatingAuthor ? 'Creating…' : 'Create Author Account'}</span>
                  </Button>
                </div>
              </form>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
