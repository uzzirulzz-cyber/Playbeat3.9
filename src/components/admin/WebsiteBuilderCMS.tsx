import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { WebsitePage, PageStatus } from '../../types';
import {
  Plus, Globe, FileText, Trash2, Eye, Send, Layers, Search,
  ExternalLink, X, Calendar, CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STATUS_META: Record<PageStatus, { pill: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
  published: { pill: 'admin-pill-green', label: 'Published', icon: CheckCircle2 },
  draft: { pill: 'admin-pill-amber', label: 'Draft', icon: FileText },
  scheduled: { pill: 'admin-pill-blue', label: 'Scheduled', icon: Clock },
};

const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const WebsiteBuilderCMS: React.FC = () => {
  const { websitePages, blockLibrary, createWebsitePage, publishWebsitePage, deleteWebsitePage, addToast } = useStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newPage, setNewPage] = useState({ title: '', slug: '/', seoTitle: '', seoDescription: '', canonicalUrl: '' });

  const filtered = websitePages.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPage.title) { addToast('error', 'Missing Title', 'Page title is required.'); return; }
    createWebsitePage({
      ...newPage,
      slug: newPage.slug || `/${newPage.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      status: 'draft',
      sections: [],
      seoTitle: newPage.seoTitle || newPage.title,
      seoDescription: newPage.seoDescription || '',
      canonicalUrl: newPage.canonicalUrl || `https://playbeat.digital${newPage.slug}`,
    });
    setNewPage({ title: '', slug: '/', seoTitle: '', seoDescription: '', canonicalUrl: '' });
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="admin-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-display">Website Builder CMS</h1>
              <p className="text-xs text-gray-500 mt-0.5">Assemble storefront pages from a reusable block library.</p>
            </div>
          </div>
          <button onClick={() => setIsCreateOpen(true)} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /><span>New Page</span>
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#1f2937]">
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Total Pages</div>
            <div className="text-xl font-bold text-white mt-1">{websitePages.length}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Published</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">{websitePages.filter(p => p.status === 'published').length}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Drafts</div>
            <div className="text-xl font-bold text-amber-400 mt-1">{websitePages.filter(p => p.status === 'draft').length}</div>
          </div>
          <div className="p-3 rounded-lg bg-[#0f141c] border border-[#1f2937]">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">Scheduled</div>
            <div className="text-xl font-bold text-blue-400 mt-1">{websitePages.filter(p => p.status === 'scheduled').length}</div>
          </div>
        </div>
      </div>

      {/* Block library */}
      <div>
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-gray-400" />
          <span>Block Library ({blockLibrary.length})</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {blockLibrary.map((block) => (
            <div key={block.id} className="admin-card p-3">
              <div className="text-[10px] uppercase text-purple-400 font-mono tracking-wider">{block.category}</div>
              <div className="text-xs font-bold text-white mt-1">{block.name}</div>
              <p className="text-[10px] text-gray-500 mt-1 leading-snug line-clamp-2">{block.preview}</p>
              <div className="text-[9px] text-gray-600 font-mono mt-2">used {block.usageCount}x</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pages list */}
      <div>
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span>Pages ({filtered.length})</span>
          </h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text" placeholder="Search pages..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="input-sharp pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 w-full sm:w-56"
            />
          </div>
        </div>
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#1f2937] text-gray-500 uppercase text-[10px] tracking-wider font-mono bg-[#0f141c]">
                  <th className="p-3 font-medium">Page</th>
                  <th className="p-3 font-medium">Slug</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Last Edit</th>
                  <th className="p-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/60">
                {filtered.map((page) => {
                  const status = STATUS_META[page.status];
                  const StatusIcon = status.icon;
                  return (
                    <tr key={page.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3">
                        <div className="text-white font-medium">{page.title}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">{page.sections.length} sections</div>
                      </td>
                      <td className="p-3 font-mono text-gray-300">{page.slug}</td>
                      <td className="p-3">
                        <span className={`${status.pill} flex items-center gap-1 w-fit`}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {status.label}
                        </span>
                        {page.status === 'scheduled' && page.scheduledAt && (
                          <div className="text-[10px] text-blue-400 mt-1 font-mono flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {new Date(page.scheduledAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-gray-400 font-mono text-[11px]">{timeAgo(page.lastEditedAt)}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a href={page.canonicalUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-[#1f2937] hover:bg-[#2a3344] text-gray-400 hover:text-white" aria-label="View page">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          {page.status !== 'published' && (
                            <button
                              onClick={() => publishWebsitePage(page.id)}
                              className="px-2.5 py-1.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" /><span className="hidden sm:inline">Publish</span>
                            </button>
                          )}
                          <button
                            onClick={() => { if (window.confirm(`Delete ${page.title}?`)) deleteWebsitePage(page.id); }}
                            className="p-2 rounded-lg bg-[#1f2937] hover:bg-red-500/15 text-gray-400 hover:text-red-400" aria-label="Delete page"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create page modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateOpen(false)} className="absolute inset-0 bg-black/85 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg rounded-2xl bg-[#151a23] border border-[#252b3b] shadow-2xl p-6 z-10" role="dialog" aria-modal="true">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2"><Globe className="w-5 h-5 text-purple-400" /><h3 className="text-base font-bold text-white font-display">Create New Page</h3></div>
                <button onClick={() => setIsCreateOpen(false)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Page Title</label>
                  <input type="text" required value={newPage.title} onChange={(e) => setNewPage({ ...newPage, title: e.target.value })} placeholder="e.g. About Us" className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600" />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Slug</label>
                  <input type="text" value={newPage.slug} onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })} placeholder="/about-us" className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600 font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">SEO Title</label>
                  <input type="text" value={newPage.seoTitle} onChange={(e) => setNewPage({ ...newPage, seoTitle: e.target.value })} placeholder="About PlayBeat Digital" className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600" />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">SEO Description</label>
                  <textarea rows={2} value={newPage.seoDescription} onChange={(e) => setNewPage({ ...newPage, seoDescription: e.target.value })} placeholder="Short meta description for search engines..." className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600 resize-none" />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Canonical URL</label>
                  <input type="url" value={newPage.canonicalUrl} onChange={(e) => setNewPage({ ...newPage, canonicalUrl: e.target.value })} placeholder="https://playbeat.digital/about-us" className="input-sharp w-full px-3 py-2 text-xs text-white placeholder-gray-600 font-mono" />
                </div>
                <div className="p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/20 text-[10px] text-purple-300/80 leading-relaxed">
                  <AlertCircle className="w-3 h-3 inline mr-1" />Page will be saved as a draft. You can add blocks and publish from the editor.
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 py-2.5 rounded-lg bg-[#1f2937] hover:bg-[#2a3344] text-gray-300 text-xs font-bold uppercase tracking-wider">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider">Create Draft</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
