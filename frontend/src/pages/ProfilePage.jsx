import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import SEO from '../components/SEO.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Label } from '../components/ui/Label.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import {
  FiUser, FiEye, FiFileText, FiGithub, FiTwitter, FiEdit3,
  FiSave, FiKey, FiUserPlus, FiLock, FiLoader,
} from 'react-icons/fi';
import { motion } from 'framer-motion';

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

  // Fetch lessons
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
      .catch((err) => console.error('Failed to load lessons:', err));
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
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full p-6">
          <div className="h-40 bg-muted/40 rounded-2xl animate-pulse mb-6" />
          <div className="h-64 bg-muted/40 rounded-2xl animate-pulse" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO title={`${profile?.name || 'Author'} Profile — Notes`} />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        {/* Profile Card Header */}
        <div className="p-6 md:p-8 rounded-[24px] border border-border bg-card shadow-sm mb-8 flex flex-col md:flex-row items-center gap-6">
          <img
            src={profile?.avatarUrl || profile?.profileUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
            alt={profile?.name || 'Author'}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/30 shadow-md shrink-0"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';
            }}
          />
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="font-heading font-extrabold text-2xl md:text-3xl">{profile?.name}</h1>
              <Badge variant="default" className="text-xs uppercase">{profile?.role || 'Author'}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{profile?.email}</p>
            {profile?.bio && <p className="text-sm text-foreground/90 leading-relaxed max-w-2xl mb-4">{profile.bio}</p>}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs text-muted-foreground font-semibold pt-3 border-t border-border/60">
              <span className="flex items-center gap-1.5"><FiFileText className="text-primary" /> <strong className="text-foreground">{stats.totalLessons}</strong> Lessons</span>
              <span className="flex items-center gap-1.5"><FiEye className="text-indigo-400" /> <strong className="text-foreground">{stats.totalViews}</strong> Reads</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border/80 pb-3 mb-6 overflow-x-auto">
          {[
            { id: 'lessons', label: 'My Lessons', icon: FiFileText },
            { id: 'edit', label: 'Edit Profile', icon: FiEdit3 },
            { id: 'password', label: 'Password', icon: FiKey },
            ...(profile?.role === 'admin' ? [{ id: 'addAuthor', label: 'Add Author', icon: FiUserPlus }] : []),
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  active ? 'bg-primary text-black font-extrabold shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
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
              <div className="p-8 text-center rounded-2xl border border-border bg-card text-muted-foreground text-sm">
                No lessons created yet.
              </div>
            ) : (
              myLessons.map((l) => (
                <div key={l.id} className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <span className="font-extrabold text-sm text-foreground truncate block mb-1">{l.title}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={l.published ? 'default' : 'draft'}>{l.published ? 'Published' : 'Draft'}</Badge>
                      <span>{l.readingTime || 1} min read</span>
                    </div>
                  </div>
                  <Button size="xs" variant="edit" onClick={() => navigate(`/editor?id=${l.id}`)}>
                    <FiEdit3 size={12} /> Edit
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
          <Card className="border border-border bg-card p-6 rounded-2xl max-w-xl">
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Full Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Avatar Image URL</Label>
                <Input value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} placeholder="https://…" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Bio</Label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="field-textarea"
                  placeholder="Tell readers about your expertise…"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>GitHub URL</Label>
                  <Input value={editGithub} onChange={(e) => setEditGithub(e.target.value)} placeholder="https://github.com/…" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Twitter URL</Label>
                  <Input value={editTwitter} onChange={(e) => setEditTwitter(e.target.value)} placeholder="https://twitter.com/…" />
                </div>
              </div>
              <Button type="submit" disabled={savingProfile} variant="neon" className="mt-2 gap-2">
                {savingProfile ? <FiLoader size={14} className="spin" /> : <FiSave size={14} />} Save Profile
              </Button>
            </form>
          </Card>
        )}

        {activeTab === 'password' && (
          <Card className="border border-border bg-card p-6 rounded-2xl max-w-md">
            <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Current Password</Label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={updatingPassword} variant="neon" className="mt-2 gap-2">
                {updatingPassword ? <FiLoader size={14} className="spin" /> : <FiLock size={14} />} Change Password
              </Button>
            </form>
          </Card>
        )}

        {activeTab === 'addAuthor' && profile?.role === 'admin' && (
          <Card className="border border-border bg-card p-6 rounded-2xl max-w-md">
            <form onSubmit={handleAddAuthor} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Author Name</Label>
                <Input value={newAuthorName} onChange={(e) => setNewAuthorName(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Email</Label>
                <Input type="email" value={newAuthorEmail} onChange={(e) => setNewAuthorEmail(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Temporary Password</Label>
                <Input type="password" value={newAuthorPassword} onChange={(e) => setNewAuthorPassword(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Role</Label>
                <select value={newAuthorRole} onChange={(e) => setNewAuthorRole(e.target.value)} className="field-select">
                  <option value="author">Author</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button type="submit" disabled={creatingAuthor} variant="neon" className="mt-2 gap-2">
                {creatingAuthor ? <FiLoader size={14} className="spin" /> : <FiUserPlus size={14} />} Create Author
              </Button>
            </form>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
