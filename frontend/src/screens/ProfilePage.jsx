import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getenv } from '../utils/getenv.js';
import { Appbar, Footer, Pagination } from '../components/ui/index.js';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useToast } from '../components/Toaster.jsx';
import {
  FiUser,
  FiEye,
  FiFileText,
  FiGithub,
  FiTwitter,
  FiEdit3,
  FiSave,
  FiKey,
  FiUserPlus,
  FiTrash2,
  FiExternalLink,
  FiCheckCircle,
  FiLock,
  FiPlus,
} from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const token = localStorage.getItem('jwt');

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stories'); // 'stories' | 'edit' | 'password' | 'addAuthor'
  const [profile, setProfile] = useState(null);
  const [myBlogs, setMyBlogs] = useState([]);

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
  const [totalCount, setTotalCount] = useState(0);

  // Fetch user profile on mount
  useEffect(() => {
    if (!token) {
      toast({ title: 'Please sign in to view your profile', variant: 'destructive' });
      navigate('/signin');
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    axios
      .get(`${getenv('APIURL')}/user/profile`, { headers })
      .then((res) => {
        const u = res.data.user;
        setProfile(u);
        setEditName(u.name || '');
        setEditAvatar(u.profileUrl || '');
        setEditBio(u.bio || '');
        setEditGithub(u.githubUrl || '');
        setEditTwitter(u.twitterUrl || '');
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
        toast({ title: 'Session expired. Please sign in again.', variant: 'destructive' });
        localStorage.removeItem('jwt');
        navigate('/signin');
      })
      .finally(() => setLoading(false));
  }, [token, navigate, toast]);

  // Fetch paginated user notes
  useEffect(() => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    axios
      .get(`${getenv('APIURL')}/blog/getall`, { headers, params: { includeUnpublished: 'true', page, limit: 20 } })
      .then((res) => {
        setMyBlogs(res.data.blogs || res.data.lessons || []);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages);
          setTotalCount(res.data.pagination.totalCount);
        }
      })
      .catch(() => {});
  }, [token, page]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await axios.put(
        `${getenv('APIURL')}/user/profile`,
        {
          name: editName,
          profileUrl: editAvatar,
          bio: editBio,
          githubUrl: editGithub,
          twitterUrl: editTwitter,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data.user);
      toast({ title: 'Profile updated successfully!', variant: 'success' });
      setActiveTab('stories');
    } catch (err) {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      return toast({ title: 'New password must be at least 4 characters long', variant: 'destructive' });
    }
    setUpdatingPassword(true);
    try {
      await axios.post(
        `${getenv('APIURL')}/user/reset-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: 'Password updated successfully!', description: 'Your new password is now active.', variant: 'success' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast({
        title: 'Failed to reset password',
        description: err.response?.data?.error || 'Check your current password and try again.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleCreateAuthor = async (e) => {
    e.preventDefault();
    if (!newAuthorName || !newAuthorEmail || !newAuthorPassword) {
      return toast({ title: 'Please fill in all author details', variant: 'destructive' });
    }
    setCreatingAuthor(true);
    try {
      await axios.post(
        `${getenv('APIURL')}/user/add-author`,
        {
          name: newAuthorName,
          email: newAuthorEmail,
          password: newAuthorPassword,
          role: newAuthorRole,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: 'Author account created!', description: `Account created for ${newAuthorEmail}.`, variant: 'success' });
      setNewAuthorName('');
      setNewAuthorEmail('');
      setNewAuthorPassword('');
    } catch (err) {
      toast({
        title: 'Failed to create author account',
        description: err.response?.data?.error || 'Email may already be in use.',
        variant: 'destructive',
      });
    } finally {
      setCreatingAuthor(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) return;
    try {
      await axios.delete(`${getenv('APIURL')}/blog/delete/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyBlogs((prev) => prev.filter((b) => b.id !== blogId));
      toast({ title: 'Note deleted successfully', variant: 'success' });
    } catch (err) {
      toast({ title: 'Failed to delete note', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Appbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14 w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground font-bold">
            Loading author profile...
          </div>
        ) : profile ? (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {/* ─── Profile Header Card ─── */}
            <Card className="p-6 md:p-8 rounded-[24px] mb-8 border border-border/80 bg-card/80 backdrop-blur-md shadow-sm">
              <div className="flex flex-wrap gap-6 items-center justify-between">
                <div className="flex flex-wrap sm:flex-nowrap gap-5 items-center">
                  <img
                    src={profile.profileUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                    alt={profile.name}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2 border-primary shadow-[0_0_20px_var(--neon-glow)] shrink-0"
                  />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground tracking-tight">
                        {profile.name}
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-wider">
                        {profile.role || 'Author'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground">{profile.email}</p>
                    <p className="text-sm text-foreground/90 max-w-lg mt-1 leading-relaxed">
                      {profile.bio || 'Software Engineer & Tech Notes Author'}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      {profile.githubUrl && (
                        <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <FiGithub size={18} />
                        </a>
                      )}
                      {profile.twitterUrl && (
                        <a href={profile.twitterUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <FiTwitter size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <Button variant="primary" size="sm" onClick={() => navigate('/editor')} className="rounded-xl gap-2 font-extrabold text-xs flex-1 sm:flex-initial justify-center">
                    <FiPlus size={14} /> New Tech Note
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('edit')} className="rounded-xl gap-2 font-extrabold text-xs flex-1 sm:flex-initial justify-center">
                    <FiEdit3 size={14} /> Edit Profile
                  </Button>
                </div>
              </div>
            </Card>

            {/* ─── Navigation Tabs ─── */}
            <div className="flex items-center gap-2 mb-6 border-b border-border/80 pb-3 overflow-x-auto no-scrollbar max-w-full">
              <Button
                variant={activeTab === 'stories' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('stories')}
                className="rounded-xl gap-2 font-extrabold text-xs shrink-0"
              >
                <FiFileText size={14} /> My Notes ({totalCount || myBlogs.length})
              </Button>
              <Button
                variant={activeTab === 'edit' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('edit')}
                className="rounded-xl gap-2 font-extrabold text-xs shrink-0"
              >
                <FiEdit3 size={14} /> Profile Settings
              </Button>
              <Button
                variant={activeTab === 'password' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('password')}
                className="rounded-xl gap-2 font-extrabold text-xs shrink-0"
              >
                <FiKey size={14} /> Reset Password
              </Button>
              <Button
                variant={activeTab === 'addAuthor' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('addAuthor')}
                className="rounded-xl gap-2 font-extrabold text-xs shrink-0"
              >
                <FiUserPlus size={14} /> Add New Author
              </Button>
            </div>

            {/* ─── Tab Content: Stories / Notes ─── */}
            {activeTab === 'stories' && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loading ? (
                    [1, 2, 3, 4].map((i) => (
                      <Card key={i} className="rounded-[24px] border border-border bg-card p-4 flex gap-4">
                        <Skeleton className="w-16 h-16 rounded-xl" />
                        <div className="flex flex-col gap-2 flex-1 justify-center">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-3 w-1/4 mt-1" />
                        </div>
                      </Card>
                    ))
                  ) : (
                    myBlogs.length === 0 ? (
                      <div className="col-span-full text-center py-16 text-muted-foreground flex flex-col items-center gap-3">
                        <p className="font-bold">You haven't created any tech notes yet.</p>
                        <Button onClick={() => navigate('/editor')}>Create Your First Note</Button>
                      </div>
                    ) : (
                      myBlogs.map((b) => (
                        <Card key={b.id} className="rounded-2xl border border-border/80 bg-card overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-colors shadow-xs">
                          <div className="p-4 flex gap-4 items-center">
                            <img src={b.imageUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f'} alt={b.title} className="w-16 h-16 rounded-xl object-cover border border-border shrink-0" />
                            <div className="min-w-0 flex-1">
                              <Badge variant={b.published ? 'default' : 'secondary'} className="mb-1 text-[10px]">
                                {b.published ? 'Published' : 'Draft'}
                              </Badge>
                              <h3 className="font-heading font-extrabold text-base text-foreground truncate leading-snug">{b.title}</h3>
                              <span className="text-[11px] text-muted-foreground mt-0.5 block">{new Date(b.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Card Buttons: View, Edit, Delete */}
                          <div className="p-2.5 bg-muted/20 border-t border-border/60 flex items-center justify-end gap-2">
                            <Button
                              size="xs"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/read?id=${b.id}`);
                              }}
                            >
                              <FiEye size={12} /> View
                            </Button>
                            <Button
                              size="xs"
                              variant="info"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/editor/${b.id}`);
                              }}
                            >
                              <FiEdit3 size={12} /> Edit Note
                            </Button>
                            <Button
                              size="xs"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBlog(b.id);
                              }}
                              title="Delete Note"
                            >
                              <FiTrash2 size={12} />
                            </Button>
                          </div>
                        </Card>
                      ))
                    )
                  )}
                </div>

                {/* Pagination */}
                {!loading && totalPages > 0 && (
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    onPageChange={setPage}
                    className="mt-4"
                  />
                )}
              </div>
            )}

            {/* ─── Tab Content: Profile Settings ─── */}
            {activeTab === 'edit' && (
              <Card className="rounded-[24px] p-6 max-w-2xl border border-border/80 bg-card/90">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg font-extrabold">Update Profile Settings</CardTitle>
                </CardHeader>
                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">Full Name</label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">Profile Avatar URL</label>
                    <Input value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">Author Bio</label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      className="w-full p-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary"
                      placeholder="Tell readers about your engineering background..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">GitHub Profile URL</label>
                    <Input value={editGithub} onChange={(e) => setEditGithub(e.target.value)} placeholder="https://github.com/username" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">X (Twitter) Profile URL</label>
                    <Input value={editTwitter} onChange={(e) => setEditTwitter(e.target.value)} placeholder="https://x.com/username" />
                  </div>
                  <Button type="submit" disabled={savingProfile} className="self-start mt-2 rounded-xl gap-2 font-bold">
                    <FiSave size={14} /> {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </Button>
                </form>
              </Card>
            )}

            {/* ─── Tab Content: Reset Password ─── */}
            {activeTab === 'password' && (
              <Card className="rounded-[24px] p-6 max-w-xl border border-border/80 bg-card/90">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                    <FiKey className="text-primary" /> Reset Author Password
                  </CardTitle>
                </CardHeader>
                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">Current Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">New Password</label>
                    <Input
                      type="password"
                      placeholder="Enter new password (min 4 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={updatingPassword} className="self-start mt-2 rounded-xl gap-2 font-bold">
                    <FiLock size={14} /> {updatingPassword ? 'Updating Password...' : 'Update Password'}
                  </Button>
                </form>
              </Card>
            )}

            {/* ─── Tab Content: Add New Author ─── */}
            {activeTab === 'addAuthor' && (
              <Card className="rounded-[24px] p-6 max-w-xl border border-border/80 bg-card/90">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg font-extrabold flex items-center gap-2">
                    <FiUserPlus className="text-primary" /> Create New Author / Admin Account
                  </CardTitle>
                </CardHeader>
                <form onSubmit={handleCreateAuthor} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">Author Full Name</label>
                    <Input
                      type="text"
                      placeholder="e.g. Alex Rivera"
                      value={newAuthorName}
                      onChange={(e) => setNewAuthorName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">Author Email Address</label>
                    <Input
                      type="email"
                      placeholder="alex@kadha.io"
                      value={newAuthorEmail}
                      onChange={(e) => setNewAuthorEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">Initial Password</label>
                    <Input
                      type="password"
                      placeholder="Set strong initial password"
                      value={newAuthorPassword}
                      onChange={(e) => setNewAuthorPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">Role Access</label>
                    <select
                      value={newAuthorRole}
                      onChange={(e) => setNewAuthorRole(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-background border border-border text-foreground text-xs font-bold outline-none"
                    >
                      <option value="author">Author (Create & Edit Notes)</option>
                      <option value="admin">Admin (Full System Access)</option>
                    </select>
                  </div>
                  <Button type="submit" disabled={creatingAuthor} className="self-start mt-2 rounded-xl gap-2 font-bold">
                    <FiUserPlus size={14} /> {creatingAuthor ? 'Creating Account...' : 'Create Author Account'}
                  </Button>
                </form>
              </Card>
            )}
          </motion.div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
