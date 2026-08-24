import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SocialPlatform, PostStatus, ScheduledPost } from '../../types';
import { Bot, Plus, Trash2, X, Calendar, CheckCircle2, AlertCircle, Clock, XCircle, Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PLATFORM_META: Record<SocialPlatform, { label: string; color: string; icon: string }> = {
  tiktok: { label: 'TikTok', color: 'bg-black text-white border border-pink-500/40', icon: '🎵' },
  instagram: { label: 'Instagram', color: 'bg-gradient-to-br from-purple-500 to-pink-500 text-white', icon: '📸' },
  x: { label: 'X (Twitter)', color: 'bg-black text-white', icon: '✕' },
  facebook: { label: 'Facebook', color: 'bg-blue-600 text-white', icon: '📘' },
  linkedin: { label: 'LinkedIn', color: 'bg-blue-700 text-white', icon: '💼' },
};

const STATUS_META: Record<PostStatus, { pill: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { pill: 'admin-pill-amber', label: 'Draft', icon: Clock },
  scheduled: { pill: 'admin-pill-blue', label: 'Scheduled', icon: Calendar },
  publishing: { pill: 'admin-pill-purple', label: 'Publishing', icon: Send },
  published: { pill: 'admin-pill-green', label: 'Published', icon: CheckCircle2 },
  failed: { pill: 'admin-pill-red', label: 'Failed', icon: XCircle },
};

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const SocialAutomation: React.FC = () => {
  const { scheduledPosts, schedulePost, deleteScheduledPost, addToast } = useStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '', platforms: ['tiktok'] as SocialPlatform[], scheduledAt: '', hashtags: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.content || newPost.platforms.length === 0 || !newPost.scheduledAt) {
      addToast('error', 'Missing Fields', 'Content, at least one platform, and scheduled time are required.');
      return;
    }
    schedulePost({
      content: newPost.content,
      platforms: newPost.platforms,
      status: 'scheduled',
      scheduledAt: new Date(newPost.scheduledAt).toISOString(),
      hashtags: newPost.hashtags.split(/[\s,]+/).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`),
      createdBy: 'Marketing Team',
    });
    setNewPost({ content: '', platforms: ['tiktok'], scheduledAt: '', hashtags: '' });
    setIsCreateOpen(false);
  };

  const togglePlatform = (platform: SocialPlatform) => {
    setNewPost(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  // Stats
  const scheduled = scheduledPosts.filter(p => p.status === 'scheduled').length;
  const published = scheduledPosts.filter(p => p.status === 'published').length;
  const failed = scheduledPosts.filter(p => p.status === 'failed').length;
  const totalEngagement = scheduledPosts.reduce((sum, p) => sum + (p.engagement?.likes || 0) + (p.engagement?.comments || 0) + (p.engagement?.shares || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="admin-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-display">Social Automation</h1>
              <p className="text-xs text-gray-500 mt-0.5">Cross-platform scheduler for TikTok, Instagram, X, Facebook, LinkedIn.</p>
            </div>
          </div>
          <button onClick={() => setIsCreateOpen(true)} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /><span>Schedule Post</span>
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#1f2937]">
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Scheduled</div>
            <div className="text-xl font-bold text-blue-400 mt-1">{scheduled}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Published</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{published}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Failed</div>
            <div className="text-xl font-bold text-red-400 mt-1">{failed}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Total Engagement</div>
            <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{totalEngagement.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Posts feed */}
      <div>
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Posts ({scheduledPosts.length})</span>
        </h2>
        <div className="space-y-3">
          {scheduledPosts.map((post) => {
            const status = STATUS_META[post.status];
            const StatusIcon = status.icon;
            return (
              <div key={post.id} className="admin-card p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    post.status === 'published' ? 'bg-emerald-500/15 text-emerald-400' :
                    post.status === 'failed' ? 'bg-red-500/15 text-red-400' :
                    post.status === 'scheduled' ? 'bg-blue-500/15 text-blue-400' :
                    'bg-amber-500/15 text-amber-400'
                  }`}>
                    <StatusIcon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.platforms.map(p => {
                          const meta = PLATFORM_META[p];
                          return (
                            <span key={p} className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${meta.color}`}>
                              {meta.label}
                            </span>
                          );
                        })}
                        <span className={`${status.pill} !py-0.5 !px-1.5 !text-[9px]`}>{status.label}</span>
                      </div>
                      <button
                        onClick={() => { if (window.confirm('Delete this scheduled post?')) deleteScheduledPost(post.id); }}
                        className="p-1.5 rounded-md bg-[#1f2937] hover:bg-red-500/15 text-gray-400 hover:text-red-400 transition-colors shrink-0"
                        aria-label="Delete post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed mb-2">{post.content}</p>

                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {post.hashtags.map((tag, i) => (
                          <span key={i} className="text-[10px] font-mono text-blue-400">{tag}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-[#1f2937]">
                      <span className="text-[10px] text-gray-500 font-mono">
                        {post.status === 'published' && post.publishedAt ? `Published ${formatDateTime(post.publishedAt)}` :
                         `Scheduled ${formatDateTime(post.scheduledAt)}`}
                      </span>
                      {post.engagement && (
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono">
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" />{post.engagement.likes}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-blue-400" />{post.engagement.comments}</span>
                          <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-emerald-400" />{post.engagement.shares}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateOpen(false)} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg rounded-2xl bg-[#151a23] border border-[#252b3b] shadow-2xl p-6 z-10" role="dialog" aria-modal="true">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2"><Bot className="w-5 h-5 text-purple-400" /><h3 className="text-base font-bold text-white font-display">Schedule Post</h3></div>
                <button onClick={() => setIsCreateOpen(false)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Post Content</label>
                  <textarea rows={4} required value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} placeholder="What would you like to share?" className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600 resize-none" />
                  <div className="text-[10px] text-gray-500 font-mono mt-1">{newPost.content.length} chars</div>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1.5">Platforms</label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(PLATFORM_META) as SocialPlatform[]).map(p => {
                      const meta = PLATFORM_META[p];
                      const selected = newPost.platforms.includes(p);
                      return (
                        <button
                          key={p} type="button" onClick={() => togglePlatform(p)}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                            selected ? `${meta.color} ring-2 ring-white/20` : 'bg-[#1f2937] text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Hashtags (comma or space separated)</label>
                  <input type="text" value={newPost.hashtags} onChange={(e) => setNewPost({ ...newPost, hashtags: e.target.value })} placeholder="#FlashSale #4KProjector" className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600 font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Schedule For</label>
                  <input type="datetime-local" required value={newPost.scheduledAt} onChange={(e) => setNewPost({ ...newPost, scheduledAt: e.target.value })} className="input-sharp w-full px-3 py-2 text-xs text-white" />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 py-2.5 rounded-lg bg-[#1f2937] hover:bg-[#2a3344] text-gray-300 text-xs font-bold uppercase tracking-wider">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider">Schedule</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
