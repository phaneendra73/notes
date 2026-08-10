import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import SEO from '../components/SEO.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Label } from '../components/ui/Label.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import {
  User, Eye, BookOpen, Edit3, Save, Key, UserPlus, Lock, Loader2
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const token = localStorage.getItem('jwt');

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' | 'edit' | 'password' | 'addAuthor'
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalLessons: 0, totalViews: 0 });
  const [myLessons, setMyLessons] = useState([]);

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
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Add Author Form State
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorEmail, setNewAuthorEmail] = useState('');
  const [newAuthorPassword, setNewAuthorPassword] = useState('');
  const [newAuthorRole, setNewAuthorRole] = useState('author');
  const [creatingAuthor, setCreatingAuthor] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  // Fetch author's notes
  useEffect(() => {
    if (!token) return;
    client
      .get('/api/lessons', { params: { includeUnpublished: 'true', page, limit: 10 } })
      .then((res) => {
        setMyLessons(res.data.lessons || []);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages);
        }
      })
      .catch((err) => console.error('Failed to load notes:', err));
  }, [token, page]);

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
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Update failed', err?.response?.data?.error);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      toast.error('Invalid password', 'New password must be at least 4 characters.');
      return;
    }
    setUpdatingPassword(true);
    try {
      await client.post('/api/auth/password', { currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error('Password update failed', err?.response?.data?.error);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleAddAuthor = async (e) => {
    e.preventDefault();
    if (!newAuthorName || !newAuthorEmail || !newAuthorPassword) {
      toast.error('Missing fields', 'Fill out all author fields.');
      return;
    }
    setCreatingAuthor(true);
    try {
      await client.post('/api/auth/authors', {
        name: newAuthorName,
        email: newAuthorEmail,
        password: newAuthorPassword,
        role: newAuthorRole,
      });
      toast.success('Author created!');
      setNewAuthorName('');
      setNewAuthorEmail('');
      setNewAuthorPassword('');
    } catch (err) {
      toast.error('Creation failed', err?.response?.data?.error);
    } finally {
      setCreatingAuthor(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-4">
          <div className="h-40 bg-[var(--surface-2)] rounded-[var(--radius-lg)] animate-pulse" />
          <div className="h-64 bg-[var(--surface-2)] rounded-[var(--radius-lg)] animate-pulse" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] font-sans">
      <SEO title={`${profile?.name || 'Author'} Profile — Notes`} />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        {/* Profile Card Header */}
        <div className="p-6 md:p-8 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-sm)] mb-8 flex flex-col md:flex-row items-center gap-6">
          <img
            src={profile?.avatarUrl || profile?.profileUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
            alt={profile?.name || 'Author'}
            className="w-24 h-24 rounded-[var(--radius-md)] object-cover border-2 border-[var(--accent)] shadow-[var(--shadow-sm)] shrink-0"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';
            }}
          />
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="font-serif font-bold text-2xl md:text-3xl text-[var(--ink)]">{profile?.name}</h1>
              <Badge variant="default" className="text-xs uppercase bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft)] font-semibold">{profile?.role || 'Author'}</Badge>
            </div>
            <p className="text-xs text-[var(--muted)] mb-3">{profile?.email}</p>
            {profile?.bio && <p className="text-sm text-[var(--ink-2)] leading-relaxed max-w-2xl mb-4 font-normal">{profile.bio}</p>}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs text-[var(--muted)] font-semibold pt-3 border-t border-[var(--line)]">
              <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-[var(--accent)]" /> <strong className="text-[var(--ink)] font-mono">{stats.totalLessons}</strong> Visual Notes</span>
              <span className="flex items-center gap-1.5"><Eye size={14} className="text-[var(--accent)]" /> <strong className="text-[var(--ink)] font-mono">{stats.totalViews}</strong> Reads</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3 mb-6 overflow-x-auto">
          {[
            { id: 'lessons', label: 'My Visual Notes', icon: BookOpen },
            { id: 'edit', label: 'Edit Profile', icon: Edit3 },
            { id: 'password', label: 'Password', icon: Key },
            ...(profile?.role === 'admin' ? [{ id: 'addAuthor', label: 'Add Author', icon: UserPlus }] : []),
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-[var(--radius-md)] text-xs md:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer border ${
                  active
                    ? 'bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold'
                    : 'bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]'
                }`}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'lessons' && (
          <div className="flex flex-col gap-3">
            {myLessons.length === 0 ? (
              <div className="p-8 text-center rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] text-sm">
                No visual notes created yet.
              </div>
            ) : (
              myLessons.map((l) => (
                <div key={l.id} className="p-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <span className="font-serif font-bold text-base text-[var(--ink)] truncate block mb-1">{l.title}</span>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                      <Badge variant={l.published ? 'default' : 'draft'} className="text-[10px] uppercase font-semibold">
                        {l.published ? 'Published' : 'Draft'}
                      </Badge>
                      <span>{l.readingTime || 1} min read</span>
                    </div>
                  </div>
                  <Button size="xs" variant="edit" onClick={() => navigate(`/editor?id=${l.id}`)}>
                    <Edit3 size={12} /> Edit Note
                  </Button>
                </div>
              ))
            )}
            {totalPages > 1 && (
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="mt-4" />
            )}
          </div>
        )}

        {activeTab === 'edit' && (
          <Card className="border border-[var(--line)] bg-[var(--surface)] p-6 rounded-[var(--radius-lg)] max-w-xl shadow-[var(--shadow-sm)]">
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-[var(--ink)]">Full Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} required className="bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-[var(--ink)]">Avatar Image URL</Label>
                <Input value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} placeholder="https://…" className="bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-[var(--ink)]">Bio</Label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
                  placeholder="Tell readers about your engineering expertise…"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold text-[var(--ink)]">GitHub URL</Label>
                  <Input value={editGithub} onChange={(e) => setEditGithub(e.target.value)} placeholder="https://github.com/…" className="bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink)]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold text-[var(--ink)]">Twitter URL</Label>
                  <Input value={editTwitter} onChange={(e) => setEditTwitter(e.target.value)} placeholder="https://twitter.com/…" className="bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink)]" />
                </div>
              </div>
              <Button type="submit" disabled={savingProfile} className="mt-2 gap-2 bg-[var(--accent)] text-[var(--accent-on)] font-bold">
                {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Profile
              </Button>
            </form>
          </Card>
        )}

        {activeTab === 'password' && (
          <Card className="border border-[var(--line)] bg-[var(--surface)] p-6 rounded-[var(--radius-lg)] max-w-md shadow-[var(--shadow-sm)]">
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-[var(--ink)]">Current Password</Label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-[var(--ink)]">New Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink)]" />
              </div>
              <Button type="submit" disabled={updatingPassword} className="mt-2 gap-2 bg-[var(--accent)] text-[var(--accent-on)] font-bold">
                {updatingPassword ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} Change Password
              </Button>
            </form>
          </Card>
        )}

        {activeTab === 'addAuthor' && profile?.role === 'admin' && (
          <Card className="border border-[var(--line)] bg-[var(--surface)] p-6 rounded-[var(--radius-lg)] max-w-md shadow-[var(--shadow-sm)]">
            <form onSubmit={handleAddAuthor} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-[var(--ink)]">Author Name</Label>
                <Input value={newAuthorName} onChange={(e) => setNewAuthorName(e.target.value)} required className="bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-[var(--ink)]">Email</Label>
                <Input type="email" value={newAuthorEmail} onChange={(e) => setNewAuthorEmail(e.target.value)} required className="bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-[var(--ink)]">Temporary Password</Label>
                <Input type="password" value={newAuthorPassword} onChange={(e) => setNewAuthorPassword(e.target.value)} required className="bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink)]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-[var(--ink)]">Role</Label>
                <select value={newAuthorRole} onChange={(e) => setNewAuthorRole(e.target.value)} className="p-2.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-2)] text-xs text-[var(--ink)] font-semibold outline-none">
                  <option value="author">Author</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button type="submit" disabled={creatingAuthor} className="mt-2 gap-2 bg-[var(--accent)] text-[var(--accent-on)] font-bold">
                {creatingAuthor ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />} Create Author
              </Button>
            </form>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
