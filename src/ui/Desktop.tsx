import { useEffect, useMemo, useRef, useState } from 'react';
import type { PDFDocumentProxy, PDFDocumentLoadingTask } from 'pdfjs-dist/types/src/display/api';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Monitor, UserRound, FolderOpen, Code2, FileText, Mail, Search, Power, Minus, Square, X, ChevronRight, Github, Linkedin, ExternalLink, MapPin, GraduationCap, Heart, Settings2, Laptop, VolumeX, Moon, Sun, Download, Upload, Save, Pencil, Plus } from 'lucide-react';
import { projects, profile, skills, type Project } from '../data/portfolio';
import { backendConfigured, readPublishedContent } from '../lib/portfolioBackend';


type AppId='computer'|'about'|'projects'|'skills'|'resume'|'contact';
type SocialLink={label:string;url:string};
type PortfolioSettings={profile:typeof profile;skills:Record<string,string[]>;extraProjects:Project[];deletedProjectIds:string[];githubUsername:string};
const apps: {id:AppId;label:string;icon:any;color:string}[]=[
  {id:'computer',label:'My Computer',icon:Monitor,color:'#69c6ff'},{id:'about',label:'About Me',icon:UserRound,color:'#d6f4ff'},
  {id:'projects',label:'Projects',icon:FolderOpen,color:'#f8d27c'},{id:'skills',label:'Skills',icon:Code2,color:'#70ddc5'},
  {id:'resume',label:'Resume',icon:FileText,color:'#ffaaa0'},{id:'contact',label:'Contact Me',icon:Mail,color:'#ffd478'}
];
const glyph=(id:AppId)=>apps.find(a=>a.id===id)!;
const safeWebUrl=(value?:string)=>{if(!value)return undefined;try{const url=new URL(value);return url.protocol==='https:'?url.href:undefined}catch{return undefined}};
const safeResumeUrl=(value:string)=>value.startsWith('/')&&!value.startsWith('//')&&!value.includes('..')?value:safeWebUrl(value)||'';
function normalizeProjects(value:unknown):Project[]{if(!Array.isArray(value))return[];return value.filter((p:any)=>p&&typeof p.id==='string'&&typeof p.name==='string'&&typeof p.description==='string'&&Array.isArray(p.tech)).map((p:any)=>({id:p.id.slice(0,120),name:p.name.slice(0,100),description:p.description.slice(0,400),details:(typeof p.details==='string'?p.details:p.description).slice(0,1200),tech:p.tech.filter((x:any)=>typeof x==='string').slice(0,12).map((x:string)=>x.slice(0,60)),status:typeof p.status==='string'?p.status.slice(0,50):'Personal project',github:safeWebUrl(p.github),demo:safeWebUrl(p.demo),accent:typeof p.accent==='string'&&/^#[\da-f]{6}$/i.test(p.accent)?p.accent:'#477ed1',icon:typeof p.icon==='string'?p.icon.slice(0,4):'⌘'}))}
function combineProjects(extra:Project[],deleted:string[]=[]){const overrides=new Map(extra.map(p=>[p.id,p]));return[...projects.filter(p=>!deleted.includes(p.id)).map(p=>overrides.get(p.id)||p),...extra.filter(p=>!projects.some(base=>base.id===p.id))]}
function normalizeSettings(saved:any):PortfolioSettings{const p=saved?.profile||{};const skillSource=saved?.skills&&typeof saved.skills==='object'?saved.skills:skills;const cleanSkills=Object.fromEntries(Object.entries(skillSource).filter(([k,v])=>typeof k==='string'&&Array.isArray(v)).map(([k,v])=>[k.slice(0,60),(v as unknown[]).filter(x=>typeof x==='string').slice(0,40).map(x=>(x as string).slice(0,60))]));const links=Array.isArray(p.otherLinks)?p.otherLinks.filter((x:any)=>x&&typeof x.label==='string'&&typeof x.url==='string'&&safeWebUrl(x.url)).map((x:any)=>({label:x.label.slice(0,40),url:safeWebUrl(x.url)!})).slice(0,10):[];return{profile:{...profile,name:typeof p.name==='string'?p.name.slice(0,100):profile.name,role:typeof p.role==='string'?p.role.slice(0,140):profile.role,location:typeof p.location==='string'?p.location.slice(0,100):profile.location,email:typeof p.email==='string'?p.email.slice(0,254):profile.email,github:safeWebUrl(p.github)||'',linkedin:safeWebUrl(p.linkedin)||'',website:safeWebUrl(p.website)||'',avatarUrl:safeWebUrl(p.avatarUrl)||'',resumeUrl:safeResumeUrl(typeof p.resumeUrl==='string'?p.resumeUrl:profile.resumeUrl)||profile.resumeUrl,otherLinks:links,intro:typeof p.intro==='string'?p.intro.slice(0,1000):profile.intro,education:Array.isArray(p.education)?p.education.filter((x:any)=>typeof x==='string').slice(0,12).map((x:string)=>x.slice(0,160)):profile.education,interests:Array.isArray(p.interests)?p.interests.filter((x:any)=>typeof x==='string').slice(0,12).map((x:string)=>x.slice(0,160)):profile.interests,goals:typeof p.goals==='string'?p.goals.slice(0,800):profile.goals},skills:cleanSkills,extraProjects:normalizeProjects(saved?.extraProjects),deletedProjectIds:Array.isArray(saved?.deletedProjectIds)?saved.deletedProjectIds.filter((x:any)=>typeof x==='string').slice(0,200):[],githubUsername:typeof saved?.githubUsername==='string'?saved.githubUsername.slice(0,39):''}}
function loadSettings():PortfolioSettings{try{return normalizeSettings(JSON.parse(localStorage.getItem('portfolioSettingsV1')||'{}'))}catch{return{profile,skills,extraProjects:[],deletedProjectIds:[],githubUsername:''}}}

export default function Desktop(){
  const [start,setStart]=useState(false); const [query,setQuery]=useState('');
  const [selected,setSelected]=useState<AppId|null>(null); const [context,setContext]=useState<{x:number;y:number}|null>(null); const [wall,setWall]=useState(0); const [boot,setBoot]=useState(!sessionStorage.getItem('booted'));
  const [darkMode,setDarkMode]=useState(()=>{try{return localStorage.getItem('portfolioThemeV1')==='dark'}catch{return false}});
  const [settings,setSettings]=useState<PortfolioSettings>(loadSettings);const [story,setStory]=useState<AppId>('computer');const [displayApp,setDisplayApp]=useState<AppId>('computer');const [selectedProject,setSelectedProject]=useState<Project|null>(null);const [transitionPhase,setTransitionPhase]=useState('opening');const [maximized,setMaximized]=useState(false);const transitionTimer=useRef<number|null>(null);const currentScene=useRef('computer');
  useEffect(()=>{if(!backendConfigured)return;readPublishedContent().then(remote=>setSettings(current=>normalizeSettings({...current,...(remote.content||{}),extraProjects:remote.projects,deletedProjectIds:remote.deletedProjectIds}))).catch(error=>console.error('Could not load live portfolio content',error))},[]);
  useEffect(()=>{const root=document.querySelector('.scroll-story');if(!root)return;const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;const next=(visible.target as HTMLElement).dataset.scene||'computer';if(currentScene.current===next)return;currentScene.current=next;setStory(next as AppId);setTransitionPhase('closing');if(transitionTimer.current)window.clearTimeout(transitionTimer.current);transitionTimer.current=window.setTimeout(()=>{setDisplayApp(next as AppId);if(next!=='projects')setSelectedProject(null);setTransitionPhase('opening');transitionTimer.current=window.setTimeout(()=>setTransitionPhase('steady'),440)},150)},{root,threshold:[.35,.6,.8]});root.querySelectorAll('[data-scene]').forEach(n=>observer.observe(n));return()=>{observer.disconnect();if(transitionTimer.current)window.clearTimeout(transitionTimer.current)}},[]);
  useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key==='Escape'){setStart(false);setContext(null)}};window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k)},[]);
  useEffect(()=>{if(!boot)return;const t=setTimeout(()=>{setBoot(false);sessionStorage.setItem('booted','1')},1450);return()=>clearTimeout(t)},[boot]);
  const open=(id:AppId,project?:Project)=>{const scene=id;currentScene.current=scene;setStory(scene);setTransitionPhase('closing');if(transitionTimer.current)window.clearTimeout(transitionTimer.current);transitionTimer.current=window.setTimeout(()=>{setDisplayApp(scene);setSelectedProject(project||null);setTransitionPhase('opening');transitionTimer.current=window.setTimeout(()=>setTransitionPhase('steady'),440)},150);document.querySelector(`[data-scene="${scene}"]`)?.scrollIntoView({behavior:'smooth'});};
  const openResult=(id:AppId)=>{open(id);setStart(false);setQuery('')};
  const toggleDarkMode=()=>setDarkMode(current=>{const next=!current;try{localStorage.setItem('portfolioThemeV1',next?'dark':'light')}catch{}return next});
  const results=useMemo(()=>{if(!query.trim())return apps.slice(1,6);const q=query.toLowerCase(),allProjects=combineProjects(settings.extraProjects,settings.deletedProjectIds);return apps.filter(a=>a.label.toLowerCase().includes(q)||a.id.includes(q)).concat(allProjects.filter(p=>(p.name+' '+p.tech.join(' ')).toLowerCase().includes(q)).map(p=>({id:'projects' as AppId,label:p.name,icon:FolderOpen,color:'#f8d27c',project:p})),Object.entries(settings.skills).flatMap(([group,list])=>list.filter(s=>s.toLowerCase().includes(q)).map(s=>({id:'skills' as AppId,label:s,icon:Code2,color:'#70ddc5',category:group}))))},[query,settings]);
  const item=(id:AppId)=>{const a=glyph(id);const Icon=a.icon;const active=id===story;return <button className={`desktop-icon ${active?'active-section':''}`} key={id} onClick={()=>setSelected(id)} onDoubleClick={()=>open(id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(id)}}} onContextMenu={e=>{e.preventDefault();setSelected(id);setContext({x:e.clientX,y:e.clientY})}} aria-label={`Open ${a.label}${active?' (current section)':''}`} aria-current={active?'location':undefined}><span className="icon-art" style={{'--icon':a.color} as React.CSSProperties}><Icon size={26}/></span><span>{a.label}</span></button>};
  return <main className={`desktop wall-${wall} scene-${story} ${darkMode?'dark-mode':''}`} onContextMenu={e=>{if(e.target===e.currentTarget){e.preventDefault();setContext({x:e.clientX,y:e.clientY})}}}>
    <div className="aurora" aria-hidden="true"><span/><span/><span/></div>
    <header className="desktop-top"><div className="brand"><span className="brand-mark"><Monitor size={16}/></span><span>PERSONAL DESKTOP</span></div><div className="top-right"><span className="current-scene-label" aria-live="polite">{glyph(story as AppId).label}</span><span className="online-dot"/> Available for opportunities <span className="top-divider"/> HIMACHAL PRADESH, IN</div></header>
    <section className="icon-grid" aria-label="Desktop applications">{(['computer','about','projects','skills','resume','contact'] as AppId[]).map(item)}</section>
    <div className="scroll-story" aria-label="Scroll through portfolio sections">
      <section id="story-computer" className="scroll-scene welcome-scene" data-scene="computer" />
      {(['about','projects','skills','resume','contact'] as AppId[]).map((id,i)=><section key={id} id={`story-${id}`} data-scene={id} className="scroll-scene scroll-marker" aria-label={`Scroll scene: ${glyph(id).label}`}><span className={`marker-hint ${story===id?'is-current':''}`}><i/>{glyph(id).label}<small>SECTION {String(i+2).padStart(2,'0')} OF 06</small></span></section>)}
    </div>
    {(() => {
      const a = glyph(displayApp);
      const Icon = a.icon;
      const title = selectedProject?.name || a.label;
      return (
        <section className={`window shared-window ${maximized ? 'maximized' : ''} switch-${transitionPhase}`} aria-label={`${title} window`}>
          <div className="titlebar">
            <span className="title-app">
              <span className="tiny-app" style={{ '--icon': a.color } as React.CSSProperties}><Icon size={14} /></span>
              {title}
            </span>
            <div className="win-controls">
              <button aria-label="Minimize to My Computer" onClick={() => open('computer')}><Minus size={14} /></button>
              <button aria-label={maximized ? 'Restore window' : 'Maximize window'} onClick={() => setMaximized(x => !x)}><Square size={11} /></button>
              <button className="close" aria-label="Close window and return to My Computer" onClick={() => open('computer')}><X size={15} /></button>
            </div>
          </div>
          <div className="window-body shared-body" key={`${displayApp}-${selectedProject?.id || ''}`}>
            <div className="explorer shared-explorer">
              <ExplorerSidebar story={story} open={open} />
              <div className="explorer-main shared-explorer-main">
                <div className="crumb shared-crumb">
                  <span>My Computer</span><ChevronRight size={14} />
                  <strong>{selectedProject?.name || a.label}</strong>
                  <span className="crumb-spacer" />
                  <Search size={14} />
                  <input aria-label="Search portfolio" placeholder="Search this computer" />
                </div>
                <div className="shared-explorer-content">
                  <div className="content-switch">
                    {displayApp === 'projects' && selectedProject ? (
                      <div className="project-detail-shell">
                        <button className="secondary-btn back-projects" onClick={() => {
                          setTransitionPhase('closing');
                          window.setTimeout(() => {
                            setSelectedProject(null);
                            setTransitionPhase('opening');
                            window.setTimeout(() => setTransitionPhase('steady'), 440);
                          }, 150);
                        }}>
                          <ChevronRight size={14} /> Back to projects
                        </button>
                        <ProjectDetail project={selectedProject} />
                      </div>
                    ) : displayApp === 'projects' ? (
                      <ProjectBrowser settings={settings} open={open} />
                    ) : (
                      <AppContent id={displayApp} open={open} settings={settings} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="window-status">
            <span><span className="status-dot" /> {story === 'computer' ? 'Welcome' : 'Ready'}</span>
            <span>SCROLL TO SWITCH WINDOW</span>
          </div>
        </section>
      );
    })()}
    {start&&<><button className="menu-backdrop" aria-label="Close start menu" onClick={()=>setStart(false)}/><section className="start-menu"><div className="start-profile"><div className="avatar">{settings.profile.name.split(/\s+/).map(x=>x[0]).slice(0,2).join('')}</div><div><strong>{settings.profile.name}</strong><small>Portfolio desktop</small></div><button className="power" title="Close menu" onClick={()=>setStart(false)}><Power size={17}/></button></div><div className="start-content"><div className="start-list">{['about','projects','skills','resume','contact'].map(k=>{const a=glyph(k as AppId),Icon=a.icon;return <button key={k} onClick={()=>openResult(k as AppId)}><Icon size={17}/><span>{a.label}</span><ChevronRight size={14}/></button>})}<div className="recent-label">MY PORTFOLIO</div><button onClick={()=>openResult('computer')}><Laptop size={17}/><span>My Computer</span><ChevronRight size={14}/></button></div><div className="start-search"><label className="searchbox"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search programs and files" autoFocus/></label><div className="search-results">{results.map((r:any,i:number)=>{const RIcon=r.icon;return <button key={`${r.id}-${i}`} onClick={()=>r.project?(open('projects',r.project),setStart(false)):openResult(r.id)}><RIcon size={17}/><span>{r.label}</span><small>{r.project?'Project':'Application'}</small></button>})}{!results.length&&<p>No matching items</p>}</div></div></div><div className="start-footer"><span>All programs <ChevronRight size={13}/></span><button onClick={()=>setStart(false)}>Shut down <Power size={14}/></button></div></section></>}
    {context&&<div className="context-menu" style={{left:Math.min(context.x,window.innerWidth-190),top:Math.min(context.y,window.innerHeight-190)}}>{[{label:'Open',action:()=>selected&&open(selected)},{label:'Personalize',action:()=>setWall((wall+1)%3)},{label:'Refresh',action:()=>setSelected(null)}].map(x=><button key={x.label} onClick={()=>{x.action();setContext(null)}}>{x.label}</button>)}</div>}
    <footer className="taskbar"><button className={`start-orb ${start?'pressed':''}`} onClick={()=>setStart(!start)} aria-label="Start menu"><span className="start-text">start</span></button><div className="story-shortcuts">{(['computer','about','projects','skills','contact'] as AppId[]).map(id=>{const a=glyph(id),Icon=a.icon;return <button key={id} className={`story-shortcut ${story===id?'active':''}`} title={`Scroll to ${a.label}`} onClick={()=>document.querySelector(`#story-${id}`)?.scrollIntoView({behavior:'smooth'})}><Icon size={17}/><span>{a.label}</span></button>})}</div><div className="task-apps"/><div className="tray"><button className="tray-button" title="Audio is off by default"><VolumeX size={15}/></button><button className="tray-button" aria-label={darkMode?'Switch to light mode':'Switch to dark mode'} aria-pressed={darkMode} onClick={toggleDarkMode} title={darkMode?'Switch to light mode':'Switch to dark mode'}>{darkMode?<Sun size={15}/>:<Moon size={15}/>}</button><button className="tray-button" onClick={()=>setWall((wall+1)%3)} title="Change wallpaper"><Settings2 size={15}/></button><SystemClock/><span className="show-desktop" title="Show desktop" onClick={()=>open('computer')}/></div></footer>
    {boot&&<div className="boot-screen"><div className="boot-name">MITHLESH <span>·</span> DESKTOP</div><div className="boot-loader"><i/></div><p>Starting your desktop</p><button onClick={()=>{setBoot(false);sessionStorage.setItem('booted','1')}}>Skip intro <ChevronRight size={13}/></button></div>}
  </main>
}

function ExplorerSidebar({story,open}:{story:AppId;open:(id:AppId)=>void}){
 const links:[string,AppId,typeof Monitor][]=[['My Computer','computer',Monitor],['About Me','about',UserRound],['Projects','projects',FolderOpen],['Skills','skills',Code2],['Resume','resume',FileText],['Contact Me','contact',Mail]];
 return <aside className="explorer-side shared-explorer-side"><div className="side-caption">PORTFOLIO</div>{links.map(([label,id,Icon])=><button type="button" className={story===id?'selected':''} key={id} onClick={()=>open(id)} aria-current={story===id?'page':undefined}><Icon size={15}/>{label}</button>)}</aside>;
}

function AppContent({id,open,settings}:{id:AppId;open:(x:AppId,p?:Project)=>void;settings:PortfolioSettings}){
 if(id==='computer')return (
  <div className="content-pad computer-view">
   <div className="eyebrow">MY COMPUTER</div>
   <h1>Welcome to my portfolio desktop</h1>
   <p className="muted">Choose a shortcut to explore my work, skills, and background.</p>
   <div className="home-scroll-hint computer-scroll-hint"><span className="scroll-arrow">↓</span> SCROLL TO EXPLORE <span className="home-scroll-dots"><i className="active"/><i/><i/><i/><i/><i/><i/></span></div>
   <div className="folder-grid">{[['About Me',UserRound,'about'],['Projects',FolderOpen,'projects'],['Skills',Code2,'skills'],['Resume',FileText,'resume'],['Contact Me',Mail,'contact']].map(([label,I,app]:any)=><button key={label} className="folder-card" onClick={()=>open(app)}><I size={27}/><strong>{label}</strong><small>Open {String(label).toLowerCase()}</small></button>)}</div>
   <section className="computer-social-links" aria-label="Social and contact links"><div className="eyebrow">LINKS & CONTACT</div><ContactLinks profileData={settings.profile}/></section>
   <div className="explorer-bottom"><Monitor size={15}/> 5 shortcuts <span>·</span> Personal portfolio</div>
  </div>
 );
 if(id==='about')return <div className="home-content"><div className="home-intro-row"><div className="home-profile-portrait" role="img" aria-label={`${settings.profile.name} profile picture`}><div className="home-profile-placeholder" aria-hidden="true"><UserRound size={34}/><span>{settings.profile.name.split(/\s+/).map(x=>x[0]).slice(0,2).join('')}</span></div>{settings.profile.avatarUrl&&<img className="home-profile-photo" src={settings.profile.avatarUrl} alt="" onError={e=>{e.currentTarget.style.display='none'}}/>}</div><div className="home-intro-copy"><div className="eyebrow">ABOUT ME</div><h1>Hi, I’m {settings.profile.name}</h1><p className="home-role">{settings.profile.role}</p><p>{settings.profile.intro}</p></div></div><div className="home-actions"><button onClick={()=>open('projects')}><FolderOpen size={16}/> Explore my projects</button><button onClick={()=>open('contact')}><Mail size={16}/> Get in touch</button></div><div className="home-scroll-hint"><span className="scroll-arrow">↓</span> SCROLL TO EXPLORE <span className="home-scroll-dots"><i className="active"/><i/><i/><i/><i/><i/><i/></span></div></div>;
  if(id==='projects')return <ProjectBrowser settings={settings} open={open}/>;
 if(id==='skills')return <div className="content-pad skills-view"><div className="eyebrow">TOOLS I’M LEARNING AND USING</div><h1>Skills & toolkit</h1><p className="muted">A current snapshot of technologies I’m exploring. No inflated ratings.</p><div className="skill-groups">{Object.entries(settings.skills).map(([group,list],i)=><article className="skill-group" key={group}><div className={`group-icon group-${i}`}><Code2 size={19}/></div><h2>{group}</h2><p>Areas of practice</p><div className="skill-list">{list.map(x=><span key={x}>{x}</span>)}</div></article>)}</div></div>;
 if(id==='resume'){
  const resumeUrl=safeResumeUrl(settings.profile.resumeUrl)||'/resume-placeholder.pdf';
  const filename=resumeUrl.split('/').pop()||'Resume.pdf';
  return <div className="content-pad resume-view"><div className="resume-toolbar"><span><FileText size={16}/> {filename}</span><a className="primary-btn" href={resumeUrl} target={resumeUrl.startsWith('https:')?'_blank':undefined} rel="noopener noreferrer"><Download size={14}/> View / download resume</a></div><ResumePdfDocument key={resumeUrl} url={resumeUrl} name={settings.profile.name}/></div>;
 } if(id==='contact')return <Contact profileData={settings.profile}/>;
 return null;
}
function HeartIcon(){return <Heart size={16}/>}
function SystemClock(){const [clock,setClock]=useState(()=>new Date());useEffect(()=>{const t=window.setInterval(()=>setClock(new Date()),1000);return()=>window.clearInterval(t)},[]);return <div className="clock"><strong>{clock.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</strong><small>{clock.toLocaleDateString([], {day:'2-digit',month:'2-digit',year:'numeric'})}</small></div>}
function ResumePdfDocument({url,name}:{url:string;name:string}){
 const [document,setDocument]=useState<PDFDocumentProxy|null>(null),[error,setError]=useState('');
 useEffect(()=>{let disposed=false;let task:PDFDocumentLoadingTask|undefined;setDocument(null);setError('');import('pdfjs-dist').then(pdfjs=>{if(disposed)return;pdfjs.GlobalWorkerOptions.workerSrc=pdfWorkerUrl;task=pdfjs.getDocument({url,withCredentials:false});return task.promise.then(pdf=>{if(!disposed)setDocument(pdf)})}).catch(reason=>{if(!disposed)setError(reason instanceof Error?reason.message:'Could not display this PDF.')});return()=>{disposed=true;void task?.destroy()}},[url]);
 if(error)return <div className="resume-document resume-document-message"><p>Preview unavailable. Use the download button to view the PDF.</p><small>{error}</small></div>;
 if(!document)return <div className="resume-document resume-document-message" role="status">Loading resume…</div>;
 return <div className="resume-document" aria-label={`${name} resume document`}>{Array.from({length:document.numPages},(_,index)=><ResumePdfPage key={index+1} document={document} pageNumber={index+1}/>)}</div>;
}
function ResumePdfPage({document,pageNumber}:{document:PDFDocumentProxy;pageNumber:number}){
 const canvasRef=useRef<HTMLCanvasElement>(null),[error,setError]=useState('');
 useEffect(()=>{let cancelled=false;let renderTask:ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']>|undefined;const render=async()=>{try{const page=await document.getPage(pageNumber);if(cancelled)return;const base=page.getViewport({scale:1});const scale=Math.min(760/base.width,1.5);const viewport=page.getViewport({scale});const canvas=canvasRef.current;if(!canvas)return;const context=canvas.getContext('2d');if(!context)throw new Error('Canvas rendering is unavailable.');const outputScale=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.floor(viewport.width*outputScale);canvas.height=Math.floor(viewport.height*outputScale);canvas.style.width=`${viewport.width}px`;canvas.style.height=`${viewport.height}px`;renderTask=page.render({canvas,canvasContext:context,viewport,transform:outputScale===1?undefined:[outputScale,0,0,outputScale,0,0]});await renderTask.promise}catch(reason){if(!cancelled&&!(reason instanceof Error&&reason.name==='RenderingCancelledException'))setError('This page could not be displayed.')}};void render();return()=>{cancelled=true;renderTask?.cancel()}},[document,pageNumber]);
 return <div className="resume-paper-page"><canvas ref={canvasRef} role="img" aria-label={`Resume page ${pageNumber}`}/>{error&&<p className="resume-page-error">{error}</p>}</div>;
}
function ProjectDetail({project:p}:{project:Project}){const github=safeWebUrl(p.github),demo=safeWebUrl(p.demo);return <div className="content-pad detail-view"><div className="detail-hero" style={{'--project':p.accent} as React.CSSProperties}><span>{p.icon}</span><div><div className="eyebrow">PROJECT FILE · {p.status.toUpperCase()}</div><h1>{p.name}</h1><p>{p.description}</p></div></div><div className="detail-columns"><article className="info-card"><div className="card-title"><FileText size={16}/> Overview</div><p>{p.details}</p></article><article className="info-card"><div className="card-title"><Code2 size={16}/> Built with / exploring</div><div className="skill-list">{p.tech.map(x=><span key={x}>{x}</span>)}</div></article></div><div className="detail-links">{github?<a className="primary-btn" href={github} target="_blank" rel="noopener noreferrer"><Github size={15}/> Repository <ExternalLink size={14}/></a>:<span className="link-placeholder"><Github size={15}/> Repository link not added or invalid</span>}{demo?<a className="secondary-btn" href={demo} target="_blank" rel="noopener noreferrer">Live demo <ExternalLink size={14}/></a>:<span className="link-placeholder">Demo link not added or invalid</span>}</div></div>}
function ContactLinks({profileData}:{profileData:typeof profile}){const links:SocialLink[]=[...(profileData.email?[{label:'Email',url:`mailto:${encodeURIComponent(profileData.email)}`}]:[]),...(safeWebUrl(profileData.linkedin)?[{label:'LinkedIn',url:safeWebUrl(profileData.linkedin)!}]:[]),...(safeWebUrl(profileData.github)?[{label:'GitHub',url:safeWebUrl(profileData.github)!}]:[]),...(safeWebUrl(profileData.website)?[{label:'Website',url:safeWebUrl(profileData.website)!}]:[]),...profileData.otherLinks.filter(x=>safeWebUrl(x.url))];if(!links.length)return <p className="muted">Contact links will appear here when added.</p>;return <div className="contact-links">{links.map(link=>{const label=link.label.toLowerCase();const kind=label==='linkedin'?'linkedin':label==='github'?'github':label==='email'?'email':label==='website'?'website':'other';const Icon=kind==='linkedin'?Linkedin:kind==='github'?Github:kind==='email'?Mail:ExternalLink;return <a className={`contact-link-button contact-link-${kind}`} key={`${link.label}-${link.url}`} href={link.url} target={link.url.startsWith('mailto:')?undefined:'_blank'} rel="noopener noreferrer"><Icon size={15}/><span>{link.label}</span></a>})}</div>}

function Contact({profileData}:{profileData:typeof profile}){const [name,setName]=useState(''),[email,setEmail]=useState(''),[subject,setSubject]=useState(''),[message,setMessage]=useState(''),[notice,setNotice]=useState('');const submit=(e:React.FormEvent)=>{e.preventDefault();if(!name.trim()||!email.trim()||!subject.trim()||!message.trim()){setNotice('Please complete every field.');return}setNotice('Form validated. No mail service is configured yet, so nothing has been sent.');};return <div className="content-pad contact-view"><div className="eyebrow">LET’S START A CONVERSATION</div><h1>Get in touch</h1><p className="muted">Have a project idea or an opportunity? I’d be glad to hear from you.</p><div className="contact-layout"><div className="contact-aside"><article className="info-card"><div className="card-title"><Mail size={16}/> Contact details</div><ContactLinks profileData={profileData}/><p className="bullet"><MapPin size={14}/> {profileData.location}</p></article><div className="privacy-note"><Settings2 size={16}/> This form validates locally; it does not send or store your message.</div></div><form className="contact-form" onSubmit={submit}><div className="form-two"><label>Name<input value={name} onChange={e=>setName(e.target.value)} maxLength={100} required autoComplete="name"/></label><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} maxLength={254} required autoComplete="email"/></label></div><label>Subject<input value={subject} onChange={e=>setSubject(e.target.value)} maxLength={160} required/></label><label>Message<textarea value={message} onChange={e=>setMessage(e.target.value)} maxLength={3000} rows={5} required/></label><div className="form-footer"><button className="primary-btn">Validate message <ChevronRight size={15}/></button><small>{message.length}/3000</small></div>{notice&&<p className="form-notice" role="status">{notice}</p>}</form></div></div>}

function ProjectBrowser({settings,open}:{settings:PortfolioSettings;open:(id:AppId,project?:Project)=>void}){
 const allProjects=combineProjects(settings.extraProjects,settings.deletedProjectIds);
 return <div className="content-pad projects-view"><div className="section-heading"><div><div className="eyebrow">SELECTED WORK & EXPERIMENTS</div><h1>Projects</h1><p>Selected projects and experiments.</p></div><span className="count-pill">{allProjects.length} ITEMS</span></div><div className="project-grid">{allProjects.map(p=><button className="project-card" key={p.id} onClick={()=>open('projects',p)}><div className="project-top"><span className="project-icon" style={{'--project':p.accent} as React.CSSProperties}>{p.icon}</span><span className="project-status"><i/> {p.status}</span></div><h3>{p.name}</h3><p>{p.description}</p><div className="tech-row">{p.tech.slice(0,3).map(t=><span key={t}>{t}</span>)}</div><div className="project-open">Open project <ChevronRight size={14}/></div></button>)}</div></div>
}
