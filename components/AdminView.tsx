
import React, { useState, useRef, useMemo } from 'react';
import { PortfolioData, Profile, Project } from '../types';
import AvatarCropper from './AvatarCropper';
import { Link } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AdminViewProps {
  data: PortfolioData;
  updateProfile: (p: Profile) => void;
  updateCategories: (c: string[]) => void;
  updateProjects: (p: Project[]) => void;
}

const compressImage = (base64: string, quality = 0.5): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 800; 
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxDim) { height *= maxDim / width; width = maxDim; }
      } else {
        if (height > maxDim) { width *= maxDim / height; height = maxDim; }
      }
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
  });
};

const SortableItem: React.FC<{ proj: Project; onEdit: () => void; onDelete: () => void }> = ({ proj, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: proj.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 1 };
  return (
    <div ref={setNodeRef} style={style} className={`bg-white border rounded-3xl p-4 flex gap-4 items-center shadow-sm group ${isDragging ? 'opacity-50 scale-105 shadow-xl z-50' : ''}`}>
      <div {...attributes} {...listeners} className="cursor-grab p-2 text-stone-300 hover:text-[#9e2a2a]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8h16M4 16h16" /></svg></div>
      <img src={proj.imageUrl} className="w-16 h-20 rounded-xl object-cover bg-stone-100" />
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-stone-900 truncate text-sm">{proj.title}</h4>
        <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">{proj.category}</span>
      </div>
      <div className="flex gap-1">
        <button onClick={onEdit} className="p-2 text-stone-400 hover:text-[#9e2a2a] transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
        <button onClick={onDelete} className="p-2 text-stone-300 hover:text-red-500 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
      </div>
    </div>
  );
};

const AdminView: React.FC<AdminViewProps> = ({ data, updateProfile, updateCategories, updateProjects }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'categories' | 'publish'>('profile');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  
  const [tempProfile, setTempProfile] = useState<Profile>(data.profile);
  const [tempCategories, setTempCategories] = useState<string[]>(data.categories);
  const [tempProjects, setTempProjects] = useState<Project[]>(data.projects);
  
  const [showCropper, setShowCropper] = useState(false);
  const [cropTarget, setCropTarget] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const storageProgress = useMemo(() => {
    const total = 5 * 1024 * 1024; 
    const used = JSON.stringify(localStorage).length;
    return Math.min(Math.round((used / total) * 100), 100);
  }, [data]);

  const getPublicUrl = () => {
    return window.location.href.split('#')[0] + '#/';
  };

  const copyToClipboard = (type: 'link' | 'config') => {
    const content = type === 'link' 
      ? getPublicUrl() 
      : `export const INITIAL_DATA = ${JSON.stringify({ profile: tempProfile, categories: tempCategories, projects: tempProjects }, null, 2)};`;
    
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.profile && imported.projects) {
          setTempProfile(imported.profile);
          setTempCategories(imported.categories);
          setTempProjects(imported.projects);
          alert("✅ 备份文件已载入，请点击底部的 Sync 按钮进行同步保存。");
        } else {
          alert("❌ 无效的备份文件格式");
        }
      } catch (err) {
        alert("❌ 无法解析该 JSON 文件");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  const save = () => {
    updateProfile(tempProfile);
    updateCategories(tempCategories);
    updateProjects(tempProjects);
    alert("✨ 更改已保存到当前浏览器！");
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] p-6 md:p-12 pb-40">
      {showCropper && cropTarget && (
        <AvatarCropper 
          image={cropTarget} 
          onCropComplete={(c) => { setTempProfile({...tempProfile, avatar: c}); setShowCropper(false); }} 
          onCancel={() => setShowCropper(false)} 
        />
      )}
      
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-stone-900">Archive Manager</h1>
                <p className="text-stone-500 text-sm font-medium">Customize your visual identity & works.</p>
            </div>
            <div className="w-64 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    <span>Cache Storage</span>
                    <span>{storageProgress}%</span>
                </div>
                <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-700 ${storageProgress > 80 ? 'bg-red-500' : 'bg-[#9e2a2a]'}`} style={{ width: `${storageProgress}%` }}></div>
                </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/" className="bg-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm border border-stone-200 hover:bg-stone-50 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Preview Live
            </Link>
            <button 
              onClick={() => copyToClipboard('link')} 
              className="bg-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm border border-stone-200 hover:bg-stone-50 transition-all active:scale-95"
            >
              {copiedType === 'link' ? 'Copied Link!' : 'Copy Site URL'}
            </button>
            <div className="h-10 w-px bg-stone-200 mx-2 hidden md:block"></div>
            <button onClick={() => fileInputRef.current?.click()} className="bg-white p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors shadow-sm" title="Restore from backup">
                <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </button>
            <button onClick={() => {
              const blob = new Blob([JSON.stringify({profile: tempProfile, categories: tempCategories, projects: tempProjects})], {type: 'application/json'});
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = `portfolio-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
            }} className="bg-white p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors shadow-sm" title="Download Backup">
                <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
          </div>
        </header>

        <nav className="flex gap-1 bg-stone-200/50 p-1.5 rounded-2xl w-fit backdrop-blur-sm border border-stone-200/50">
          {['profile', 'projects', 'categories', 'publish'].map(t => (
            <button key={t} onClick={() => setActiveTab(t as any)} className={`px-8 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all duration-300 ${activeTab === t ? 'bg-white shadow-md text-stone-900' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100/50'}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>

        {activeTab === 'profile' && (
          <div className="bg-white rounded-[40px] p-8 md:p-12 border border-stone-100 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-16 animate-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-4 space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em] block">Portrait</label>
                  <div className="relative group w-48 h-48">
                    <img src={tempProfile.avatar} className="w-full h-full rounded-[32px] object-cover ring-8 ring-stone-50 shadow-inner group-hover:scale-[1.02] transition-transform duration-500" />
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all duration-300 rounded-[32px] backdrop-blur-[2px]">
                      <span className="text-white text-[10px] font-bold uppercase tracking-widest border border-white/40 px-4 py-2 rounded-full">Change</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => { setCropTarget(reader.result as string); setShowCropper(true); };
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  </div>
                </div>
            </div>
            <div className="lg:col-span-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] px-1">Full Name</label>
                        <input type="text" value={tempProfile.name} onChange={e => setTempProfile({...tempProfile, name: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#9e2a2a]/20 outline-none transition-all font-medium" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] px-1">Email</label>
                        <input type="email" value={tempProfile.email} onChange={e => setTempProfile({...tempProfile, email: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#9e2a2a]/20 outline-none transition-all font-medium" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] px-1">Brief Bio</label>
                    <textarea rows={5} value={tempProfile.bio} onChange={e => setTempProfile({...tempProfile, bio: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#9e2a2a]/20 outline-none transition-all font-medium resize-none" placeholder="Write a short intro about yourself..." />
                </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
           <div className="bg-white rounded-[40px] p-10 border border-stone-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4 duration-500">
               <div>
                   <h3 className="text-xl font-bold text-stone-800">Section Management</h3>
                   <p className="text-stone-400 text-sm">Organize your projects into distinct thematic sections.</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {tempCategories.map((cat, idx) => (
                       <div key={idx} className="flex gap-2 group">
                           <input type="text" value={cat} disabled={cat === '全部'} onChange={e => { const n = [...tempCategories]; n[idx] = e.target.value; setTempCategories(n); }} className="flex-1 p-4 bg-stone-50 border border-stone-100 rounded-2xl disabled:opacity-50 font-bold text-stone-700 outline-none focus:bg-white focus:ring-2 focus:ring-[#9e2a2a]/10" />
                           {cat !== '全部' && (
                               <button onClick={() => setTempCategories(tempCategories.filter((_, i) => i !== idx))} className="p-4 text-stone-300 hover:text-red-500 transition-colors bg-stone-50 rounded-2xl hover:bg-red-50"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                           )}
                       </div>
                   ))}
                   <button onClick={() => setTempCategories([...tempCategories, 'New Section'])} className="p-4 border-2 border-dashed border-stone-200 text-stone-400 font-bold rounded-2xl hover:border-[#9e2a2a] hover:text-[#9e2a2a] hover:bg-[#9e2a2a]/5 transition-all flex items-center justify-center gap-2">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                       Add New Section
                   </button>
               </div>
           </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                <p className="text-stone-400 text-sm font-medium">Drag and drop to reorder. Changes take effect globally.</p>
                <button onClick={() => setEditingProject({id: Math.random().toString(36).substr(2, 9), title: 'Untilted Project', description: '', category: tempCategories[1] || 'General', imageUrl: 'https://picsum.photos/seed/'+Math.random()+'/600/800', link: '', createdAt: Date.now(), isFeatured: false})} className="bg-stone-900 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#9e2a2a] hover:shadow-lg hover:-translate-y-0.5 transition-all">Add New Entry</button>
            </div>
            
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={e => {
              if (e.over && e.active.id !== e.over.id) {
                setTempProjects(items => {
                  const oldIndex = items.findIndex(i => i.id === e.active.id);
                  const newIndex = items.findIndex(i => i.id === e.over.id);
                  return arrayMove(items, oldIndex, newIndex);
                });
              }
            }}>
              <SortableContext items={tempProjects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tempProjects.map(p => (
                        <SortableItem key={p.id} proj={p} onEdit={() => setEditingProject(p)} onDelete={() => setTempProjects(tempProjects.filter(x => x.id !== p.id))} />
                    ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {activeTab === 'publish' && (
          <div className="bg-white rounded-[40px] p-12 border border-stone-100 shadow-sm space-y-10 text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-[#9e2a2a]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#9e2a2a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            </div>
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-stone-800">Save Configuration</h2>
                <p className="text-stone-500 max-w-lg mx-auto leading-relaxed">To make your edits permanent across sessions, copy the configuration block below and provide it to the AI for integration into the source code.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 justify-center pt-6">
                <button onClick={() => copyToClipboard('config')} className="bg-[#9e2a2a] text-white px-12 py-5 rounded-2xl font-bold shadow-xl hover:bg-[#802020] hover:scale-[1.02] transition-all active:scale-95">
                    {copiedType === 'config' ? 'Copied Configuration!' : 'Copy Full Configuration'}
                </button>
            </div>
          </div>
        )}

        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[55] w-full max-w-xs px-6">
          <button onClick={save} className="w-full bg-stone-900 text-white px-10 py-5 rounded-full font-bold uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-[#9e2a2a] hover:scale-105 active:scale-95 transition-all">
            Sync Changes
          </button>
        </div>

        {editingProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-y-auto p-8 md:p-12 space-y-10 shadow-2xl">
              <div className="flex justify-between items-center border-b border-stone-100 pb-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-stone-800">Edit Archive Entry</h2>
                    <p className="text-stone-400 text-sm">Refine project details and visibility.</p>
                  </div>
                  <button onClick={() => setEditingProject(null)} className="p-3 text-stone-300 hover:text-stone-900 bg-stone-50 rounded-full transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-stone-50 border border-stone-100 relative group shadow-inner">
                    <img src={editingProject.imageUrl} className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-sm">
                      <span className="bg-white px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest text-stone-900">Replace Image</span>
                      <input type="file" className="hidden" accept="image/*" onChange={async e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = async () => setEditingProject({...editingProject, imageUrl: await compressImage(reader.result as string)});
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  </div>
                  <button onClick={() => setEditingProject({...editingProject, isFeatured: !editingProject.isFeatured, featuredAt: !editingProject.isFeatured ? Date.now() : undefined})} className={`w-full py-5 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-3 ${editingProject.isFeatured ? 'bg-[#9e2a2a] text-white border-transparent shadow-lg' : 'bg-white text-stone-400 border-stone-100 hover:bg-stone-50'}`}>
                    <svg className={`w-5 h-5 ${editingProject.isFeatured ? 'fill-current' : 'text-stone-200'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    {editingProject.isFeatured ? 'Featured in Hero Selection' : 'Add to Hero Selection'}
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block px-1">Title</label><input type="text" value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#9e2a2a]/10 outline-none transition-all font-medium" /></div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block px-1">Category</label>
                    <div className="relative">
                        <select value={editingProject.category} onChange={e => setEditingProject({...editingProject, category: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#9e2a2a]/10 outline-none transition-all font-medium appearance-none">
                            {tempCategories.filter(c => c !== '全部').map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                    </div>
                  </div>
                  <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block px-1">Description</label><textarea rows={3} value={editingProject.description} onChange={e => setEditingProject({...editingProject, description: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#9e2a2a]/10 outline-none transition-all font-medium resize-none" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block px-1">Direct Link</label><input type="url" value={editingProject.link} onChange={e => setEditingProject({...editingProject, link: e.target.value})} className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#9e2a2a]/10 outline-none transition-all font-medium" placeholder="https://..." /></div>
                  <div className="pt-4">
                    <button onClick={() => {
                        const idx = tempProjects.findIndex(p => p.id === editingProject.id);
                        if (idx > -1) { const n = [...tempProjects]; n[idx] = editingProject; setTempProjects(n); }
                        else setTempProjects([editingProject, ...tempProjects]);
                        setEditingProject(null);
                    }} className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest shadow-xl hover:bg-[#9e2a2a] hover:shadow-2xl hover:-translate-y-0.5 transition-all">Apply & Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminView;
