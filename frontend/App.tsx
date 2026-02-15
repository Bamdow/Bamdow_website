
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Matter from 'matter-js';
import { Sidebar } from './components/Sidebar';
import { HeroSection } from './components/HeroSection';
import { PortfolioSection } from './components/PortfolioSection';
import { ArticleSection } from './components/ArticleSection';
import { TimelineSection } from './components/TimelineSection';
import { MusicPlayer } from './components/MusicPlayer';
import { Mail, MapPin, RotateCcw, MessageSquare, Instagram, Youtube, FileText, Aperture, Github, Music } from 'lucide-react';
import { NAV_ITEMS } from './src/data/navigation';
import { CONTACT_DATA } from './src/data/contact';
import { ARTICLES_PAGE_DATA } from './src/data/articles';
import { PORTFOLIO_PAGE_DATA } from './src/data/portfolioPage';
import { Language, Category } from './types';

interface ExplodedElementData {
  element: HTMLElement;
  originalStyle: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState<Language>('zh');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const [portfolioCategory, setPortfolioCategory] = useState<string>('All');
  
  const [gravityActive, setGravityActive] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const startViewTransition = (update: () => void) => {
    // Disable view transitions on mobile to prevent flickering and performance issues
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      update();
      return;
    }

    const anyDoc = document as any;
    if (anyDoc && typeof anyDoc.startViewTransition === 'function') {
      anyDoc.startViewTransition(update);
    } else {
      update();
    }
  };
  const engineRef = useRef<any>(null);
  const runnerRef = useRef<any>(null);
  const requestRef = useRef<number | null>(null);
  const explodedElementsRef = useRef<ExplodedElementData[]>([]);
  const dissipatedElementsRef = useRef<ExplodedElementData[]>([]);
  const scrollPositionRef = useRef<number>(0);

  useEffect(() => {
    // Automatic theme based on time: 18:30 - 06:00 is dark mode
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const currentTimeInMinutes = hour * 60 + minutes;
    const darkStartTimeInMinutes = 18 * 60 + 30; // 18:30
    const darkEndTimeInMinutes = 6 * 60; // 06:00
    
    const isDarkTime = currentTimeInMinutes >= darkStartTimeInMinutes || currentTimeInMinutes < darkEndTimeInMinutes;
    setTheme(isDarkTime ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Preload images for contact page to reduce lag when switching themes
  useEffect(() => {
    // Preload light mode images
    const lightImages = [
      '/images/intro/1.avif',
      '/images/intro/2.avif',
      '/images/intro/3.avif',
      '/images/intro/4.avif',
      '/images/intro/5.avif',
      '/images/intro/6.avif'
    ];
    
    // Preload dark mode images
    const darkImages = [
      '/images/intro/7.avif',
      '/images/intro/8.avif',
      '/images/intro/9.avif',
      '/images/intro/10.avif',
      '/images/intro/11.avif',
      '/images/intro/12.avif'
    ];
    
    // Function to preload an array of images
    const preloadImages = (imageUrls: string[]) => {
      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };
    
    // Preload all images
    preloadImages(lightImages);
    preloadImages(darkImages);
  }, []);

  // Scroll to top when activeTab changes
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Only reset portfolio category to 'All' when navigating to dashboard page
    // Don't reset when navigating to portfolio page from hero section
    if (activeTab === 'dashboard') {
      setPortfolioCategory('All');
    }
  }, [activeTab]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const handleHeroNavigation = (category: Category) => {
    startViewTransition(() => {
      setPortfolioCategory(category);
      setActiveTab('portfolio');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };
  
  // -------------------------
  // GRAVITY EXPLOSION LOGIC
  // -------------------------
  
  const handleInteraction = (event: MouseEvent) => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    
    const mouseX = event.clientX + window.scrollX;
    const mouseY = event.clientY + window.scrollY;
    
    const bodies = Matter.Composite.allBodies(engine.world);
    
    bodies.forEach((body: any) => {
      if (body.isStatic) return;

      // Add force on click
      if (event.type === 'mousedown') {
          const bodyX = body.position.x;
          const bodyY = body.position.y;
          const distance = Math.sqrt(Math.pow(mouseX - bodyX, 2) + Math.pow(mouseY - bodyY, 2));
          
          if (distance < 500) {
            const forceMagnitude = 0.8 * (1 - distance / 500); 
            const angle = Math.atan2(bodyY - mouseY, bodyX - mouseX);
            
            Matter.Body.applyForce(body, body.position, {
              x: Math.cos(angle) * forceMagnitude,
              y: Math.sin(angle) * forceMagnitude
            });
          }
      }
    });
  };

  const triggerGravity = () => {
    if (gravityActive) return;
    
    if (!Matter) return;

    scrollPositionRef.current = window.scrollY;
    // Lock body height to current scroll height to prevent layout jump
    document.body.style.height = `${document.documentElement.scrollHeight}px`; 
    document.body.style.overflow = 'hidden'; 
    
    setGravityActive(true);

    const Engine = Matter.Engine,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite;

    const engine = Engine.create({
      positionIterations: 12,
      velocityIterations: 8,
      constraintIterations: 4
    });
    const world = engine.world;
    engineRef.current = engine;

    // Dissipate large images
    const largeComponents = Array.from(document.querySelectorAll('main img, .aspect-\\[4\\/3\\]')) as HTMLElement[];
    const dissipatedData: ExplodedElementData[] = [];
    
    largeComponents.forEach(el => {
      dissipatedData.push({
        element: el,
        originalStyle: el.getAttribute('style') || ''
      });
      el.style.transition = 'all 0.5s ease-out';
      el.style.transform = 'scale(0.8)';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
    });
    dissipatedElementsRef.current = dissipatedData;

    // Selector: Target individual visible elements, avoid layout wrappers
    const selector = `
      nav h1, nav button, nav span,
      footer p,
      .rounded-\\[2rem\\]:not(.aspect-\\[4\\/3\\]),
      main h1, main h2, main h3, main h4, main p, main span, 
      main svg, main button, main a, 
      main li,
      div[class*="border-b-2"], 
      div[class*="h-[1px]"],
      div[class*="h-[2px]"]
    `;
    
    const candidates = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    
    const visibleCandidates = candidates.filter(el => {
       const rect = el.getBoundingClientRect();
       if (rect.width < 5 || rect.height < 5) return false;
       if (window.getComputedStyle(el).display === 'none') return false;
       if (window.getComputedStyle(el).opacity === '0') return false;
       if (largeComponents.includes(el)) return false;
       return true;
    });

    // Containment check to prevent overlapping physics bodies
    const validElements = visibleCandidates.filter(el => {
      return !visibleCandidates.some(parent => parent !== el && parent.contains(el));
    });

    const bodies: any[] = [];
    const explodedData: ExplodedElementData[] = [];

    validElements.forEach(el => {
      explodedData.push({
        element: el,
        originalStyle: el.getAttribute('style') || ''
      });

      const rect = el.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      const centerX = rect.left + rect.width / 2 + scrollX;
      const centerY = rect.top + rect.height / 2 + scrollY;

      const body = Bodies.rectangle(centerX, centerY, rect.width, rect.height, {
        restitution: 0.2, 
        friction: 0.5,    
        frictionAir: 0.05, 
        density: 0.002,
        chamfer: { radius: Math.min(rect.width, rect.height) * 0.1 }, 
        angle: (Math.random() - 0.5) * 0.05
      });
      (body as any).domElement = el;
      bodies.push(body);

      // Lock Visuals
      el.style.boxSizing = 'border-box';
      el.style.position = 'absolute';
      el.style.left = `${rect.left + scrollX}px`;
      el.style.top = `${rect.top + scrollY}px`;
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
      el.style.margin = '0'; 
      el.style.transform = 'translate(0, 0) rotate(0deg)';
      el.style.zIndex = '1000';
      el.style.pointerEvents = 'none'; 
      el.style.transition = 'none';
    });

    explodedElementsRef.current = explodedData;

    const totalHeight = document.documentElement.scrollHeight;

    // Add floor
    const floor = Bodies.rectangle(
        window.innerWidth / 2, 
        totalHeight + 500, // Place floor well below content
        window.innerWidth, 
        1000, 
        { isStatic: true, render: { visible: false } }
    );

    // Add walls
    const wallLeft = Bodies.rectangle(
        -500, 
        totalHeight / 2, 
        1000, 
        totalHeight * 2, 
        { isStatic: true, render: { visible: false } }
    );
    const wallRight = Bodies.rectangle(
        window.innerWidth + 500, 
        totalHeight / 2, 
        1000, 
        totalHeight * 2, 
        { isStatic: true, render: { visible: false } }
    );

    Composite.add(world, [floor, wallLeft, wallRight, ...bodies]);

    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    const update = () => {
      if (!engineRef.current) return;

      bodies.forEach(body => {
        const el = (body as any).domElement;
        if (el) {
          const { x, y } = body.position;
          const angle = body.angle;
          
          const initialLeft = parseFloat(el.style.left);
          const initialTop = parseFloat(el.style.top);
          const w = parseFloat(el.style.width);
          const h = parseFloat(el.style.height);

          const initialCenterX = initialLeft + w / 2;
          const initialCenterY = initialTop + h / 2;

          const dx = x - initialCenterX;
          const dy = y - initialCenterY;

          el.style.transform = `translate(${dx}px, ${dy}px) rotate(${angle}rad)`;
        }
      });

      requestRef.current = requestAnimationFrame(update);
    };
    
    update();

    setTimeout(() => {
        window.addEventListener('mousedown', handleInteraction);
    }, 50);
  };

  const resetGravity = () => {
    window.removeEventListener('mousedown', handleInteraction);

    if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
    if (engineRef.current) {
      Matter.World.clear(engineRef.current.world, false);
      Matter.Engine.clear(engineRef.current);
    }
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    engineRef.current = null;
    runnerRef.current = null;

    const explodedData = explodedElementsRef.current;
    
    explodedData.forEach(({ element }) => {
      // FORCE REFLOW: Critical for smooth transition from chaos to order
      void element.offsetWidth; 
      
      // Use specific transition property to avoid conflicts
      element.style.transition = 'transform 1s cubic-bezier(0.19, 1, 0.22, 1)';
      // Reset transform to identity (relative to fixed start position)
      element.style.transform = 'translate(0, 0) rotate(0deg)';
    });

    const dissipatedData = dissipatedElementsRef.current;
    dissipatedData.forEach(({ element }) => {
      element.style.transition = 'all 1s ease';
      element.style.transform = 'scale(1)';
      element.style.opacity = '1';
    });

    setTimeout(() => {
      explodedData.forEach(({ element, originalStyle }) => {
        element.setAttribute('style', originalStyle);
      });
      dissipatedData.forEach(({ element, originalStyle }) => {
         element.setAttribute('style', originalStyle);
      });

      explodedElementsRef.current = [];
      dissipatedElementsRef.current = [];
      
      document.body.style.height = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollPositionRef.current);
      
      setGravityActive(false);
    }, 1000); // Matches transition duration
  };


  const content = CONTACT_DATA[language];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <HeroSection 
              onNavigate={(tab) => startViewTransition(() => setActiveTab(tab))} 
              onCategorySelect={handleHeroNavigation}
              language={language} 
              theme={theme}
            />
            <PortfolioSection language={language} externalFilter={portfolioCategory} />
          </>
        );
      case 'portfolio':
        return (
          <div className="pt-20 w-full max-w-[90vw] mx-auto px-6 md:px-12 relative">
             {/* Background Image */}
            <div className="absolute inset-x-0 top-0 h-[49vh] -z-10 rounded-3xl overflow-hidden">
               <img 
                 src={theme === 'light' ? "/images/day.png" : "/images/night.png"} 
                 alt="Portfolio Background" 
                 className="w-full h-full object-cover transition-opacity duration-300"
               />
             </div>
             
             <div className="mb-24 relative z-10">
               <h1 className="text-[8vw] leading-none font-black mb-8 text-black dark:text-white transition-colors duration-300">
                 {PORTFOLIO_PAGE_DATA[language].title}
               </h1>
               <p className="text-2xl text-gray-700 dark:text-gray-300 max-w-2xl font-medium transition-colors duration-300">
                 {PORTFOLIO_PAGE_DATA[language].description}
               </p>
             </div>
             
             <div className="relative z-10">
               <PortfolioSection language={language} externalFilter={portfolioCategory} showActions={true} />
             </div>
          </div>
        );
      case 'articles':
        return (
          <div className="pt-20 w-full max-w-[75vw] mx-auto">
             <div className="mb-24 flex flex-col items-center text-center">
               <h1 className="text-[8vw] leading-none font-black mb-8 text-black dark:text-white transition-colors duration-300">
                 {ARTICLES_PAGE_DATA[language].title}
               </h1>
               <p className="text-2xl text-gray-500 dark:text-gray-400 max-w-2xl font-medium transition-colors duration-300">
                 {ARTICLES_PAGE_DATA[language].description}
               </p>
             </div>
             <ArticleSection language={language} />
          </div>
        );
      case 'about':
        return (
          <div className="pt-20 w-full max-w-[96vw] mx-auto">
            <TimelineSection language={language} />
          </div>
        );
      case 'contact':
        return (
           <div className="pt-32 w-full max-w-5xl mx-auto text-center animate-fade-in px-4">
              <h1 className="text-[12vw] font-black mb-12 leading-none text-black dark:text-white transition-colors duration-300">
                {content.hello}
              </h1>
              <p className="text-3xl text-gray-500 dark:text-gray-400 mb-20 max-w-3xl mx-auto leading-relaxed font-medium transition-colors duration-300">
                {content.intro}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {/* Email */}
                  <div className="block p-12 border-2 border-gray-100 dark:border-gray-800 rounded-[2rem] group cursor-default hover:border-orange-500 transition-colors duration-200 relative overflow-hidden">
                     <div className="absolute inset-0 z-0">
                       <img src={theme === 'light' ? "/images/intro/1.avif" : "/images/intro/7.avif"} alt="Background" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform" loading="lazy" />
                     </div>
                     <div className="relative z-10">
                       <Mail size={48} className="mx-auto mb-6 text-white drop-shadow-md group-hover:text-orange-500 transition-colors duration-200" />
                       <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-md transition-colors duration-200">
                         {content.emailMeLabel}
                       </h3>
                       <p className="text-lg opacity-70 text-white drop-shadow-md transition-colors duration-200 select-text">
                         {content.email}
                       </p>
                     </div>
                  </div>

                 {/* Profile Card */}
                 <div 
                    className="block p-12 border-2 border-gray-100 dark:border-gray-800 rounded-[2rem] hover:border-[#07C160] transition-colors duration-200 group cursor-pointer relative overflow-hidden"
                    onClick={() => setShowProfileModal(true)}
                 >
                    <div className="absolute inset-0 z-0">
                      <img src={theme === 'light' ? "/images/intro/2.avif" : "/images/intro/8.avif"} alt="Background" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform" loading="lazy" />
                    </div>
                    <div className="relative z-10">
                      <MessageSquare size={48} className="mx-auto mb-6 text-white drop-shadow-md group-hover:text-[#07C160] transition-colors duration-200" />
                      <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-md transition-colors duration-200">
                        {language === 'zh' ? '自述' : 'Profile'}
                      </h3>
                      <p className="text-lg opacity-70 text-white drop-shadow-md transition-colors duration-200">
                        {language === 'zh' ? '说说呗' : 'About Me'}
                      </p>
                    </div>
                 </div>

                 {/* Socials - gitee */}
                 <div 
                    className="block p-12 border-2 border-gray-100 dark:border-gray-800 rounded-[2rem] hover:border-[#EC4048] transition-colors duration-200 group cursor-pointer relative overflow-hidden"
                    onClick={() => window.open('https://gitee.com/LSZ1293038', '_blank')}
                 >
                    <div className="absolute inset-0 z-0">
                      <img src={theme === 'light' ? "/images/intro/3.avif" : "/images/intro/9.avif"} alt="Background" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform" loading="lazy" />
                    </div>
                    <div className="relative z-10">
                      <Instagram size={48} className="mx-auto mb-6 text-white drop-shadow-md group-hover:text-[#EC4048] transition-colors duration-200" />
                      <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-md transition-colors duration-200">
                        {language === 'zh' ? 'Gitee' : 'Gitee'}
                      </h3>
                      <p className="text-lg opacity-70 text-white drop-shadow-md transition-colors duration-200">
                        {content.socials?.Gitee || '@Bamdow'}
                      </p>
                    </div>
                 </div>

                 {/* Socials - Bilibili */}
                 <div 
                    className="block p-12 border-2 border-gray-100 dark:border-gray-800 rounded-[2rem] hover:border-[#00AEEC] transition-colors duration-200 group cursor-pointer relative overflow-hidden"
                    onClick={() => window.open('https://space.bilibili.com/402745569', '_blank')}
                 >
                    <div className="absolute inset-0 z-0">
                      <img src={theme === 'light' ? "/images/intro/4.avif" : "/images/intro/10.avif"} alt="Background" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform" loading="lazy" />
                    </div>
                    <div className="relative z-10">
                      <Youtube size={48} className="mx-auto mb-6 text-white drop-shadow-md group-hover:text-[#00AEEC] transition-colors duration-200" />
                      <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-md transition-colors duration-200">
                        Bilibili
                      </h3>
                      <p className="text-lg opacity-70 text-white drop-shadow-md transition-colors duration-200">
                        {content.socials?.bilibili || 'Bamdow'}
                      </p>
                    </div>
                 </div>

                 {/* Socials - wangyiyunmusic */}
                 <div 
                    className="block p-12 border-2 border-gray-100 dark:border-gray-800 rounded-[2rem] hover:border-[#C20C0C] dark:hover:border-[#C20C0C] transition-colors duration-200 group cursor-pointer relative overflow-hidden"
                    onClick={() => window.open('https://music.163.com/#/user/home?id=1581281049', '_blank')}
                 >
                    <div className="absolute inset-0 z-0">
                      <img src={theme === 'light' ? "/images/intro/5.avif" : "/images/intro/11.webp"} alt="Background" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform" loading="lazy" />
                    </div>
                    <div className="relative z-10">
                      <Music size={48} className="mx-auto mb-6 text-white drop-shadow-md group-hover:text-[#C20C0C] dark:group-hover:text-[#C20C0C] transition-colors duration-200" />
                      <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-md transition-colors duration-200">
                        {language === 'zh' ? '网易云音乐' : 'Netease Cloud Music'}
                      </h3>
                      <p className="text-lg opacity-70 text-white drop-shadow-md transition-colors duration-200">
                        {content.socials?.music163 || 'IVUTRITIR'}
                      </p>
                    </div>
                 </div>

                 {/* GitHub */}
                 <div 
                    className="block p-12 border-2 border-gray-100 dark:border-gray-800 rounded-[2rem] relative group cursor-pointer hover:border-[#0D1932] dark:hover:border-[#0D1932] transition-colors duration-200 overflow-hidden"
                    onClick={() => window.open('https://github.com/Bamdow', '_blank')}
                 >
                    <div className="absolute inset-0 z-0">
                      <img src={theme === 'light' ? "/images/intro/6.avif" : "/images/intro/12.avif"} alt="Background" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform" loading="lazy" />
                    </div>
                    <div className="relative z-10">
                    <Github size={48} className="mx-auto mb-6 text-white drop-shadow-md group-hover:text-[#0D1932] dark:group-hover:text-[#0D1932] transition-colors duration-200" />
                    <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-md transition-colors duration-200">
                      {content.githubLabel}
                    </h3>
                    <p className="text-lg opacity-70 text-white drop-shadow-md transition-colors duration-200">
                      @Bamdow
                    </p>
                    </div>
                 </div>
              </div>
           </div>
        )
      default:
        return (
          <>
            <HeroSection 
              onNavigate={(tab) => startViewTransition(() => setActiveTab(tab))} 
              onCategorySelect={handleHeroNavigation}
              language={language} 
            />
            <PortfolioSection language={language} externalFilter={portfolioCategory} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black overflow-x-hidden transition-colors duration-300">
      
      <MusicPlayer language={language} />
      {/* Dynamic Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => startViewTransition(() => setActiveTab(tab))} 
        language={language}
        toggleLanguage={toggleLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
        onTriggerGravity={triggerGravity}
      />

      {/* Main Content Area */}
      <main className="w-full pt-40 pb-32 vt-page">
         <div key={activeTab} className="animate-fade-in">
           {renderContent()}
         </div>

         {/* Footer */}
         <footer className="w-full max-w-[96vw] mx-auto mt-32 border-t-2 border-black dark:border-white pt-12 flex flex-col md:flex-row justify-between items-center text-sm font-light text-gray-400 dark:text-gray-500 uppercase tracking-wide gap-4 transition-colors duration-300">
            <p>© 2026 BAMDOW</p>
            <p>{content.footerDesign}</p>
         </footer>
      </main>
      
      {/* Floating Reset Button for Gravity - Fixed Centering Wrapper */}
      {gravityActive && (
        <div className="fixed bottom-8 left-0 w-full flex justify-center z-[1001] pointer-events-none">
          <button 
            onClick={resetGravity}
            className="pointer-events-auto bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-full font-bold text-xl shadow-2xl animate-fade-in hover:scale-110 transition-transform flex items-center gap-3 cursor-pointer"
          >
            <RotateCcw size={24} />
            {language === 'zh' ? '变回去' : 'Go Back'}
          </button>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/80"
             onClick={() => setShowProfileModal(false)}
           ></div>

           {/* Modal Content */}
           <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden flex flex-col animate-message-pop">
             {/* Inner scroll container */}
             <div className="flex-1 overflow-y-auto no-scrollbar">
               {/* Close Button */}
               <button 
                 onClick={() => setShowProfileModal(false)}
                 className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/50 dark:bg-black/50 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black dark:text-white"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
               </button>

               {/* Profile Content */}
               <div className="p-0 md:p-0">
                 {/* Header Image */}
                 <div className="w-full h-64 md:h-96 overflow-hidden">
                   <img 
                     src={theme === 'light' ? "/images/intro/2.avif" : "/images/intro/8.avif"} 
                     alt="Profile" 
                     className="w-full h-full object-cover"
                   />
                 </div>
                 
                 {/* Text Content */}
                 <div className="p-6 md:p-12">
                   <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white mb-8 leading-tight">
                     {language === 'zh' ? '自述' : 'Profile'}
                   </h2>
                   <div className="prose dark:prose-invert max-w-none">
                     {language === 'zh' ? (
                       <>
                         <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                           你好，欢迎来到Bamdow的个人网站，这是本人第一个真正意义上独立开发的单体项目。前端部分使用了b站
                           <a 
                             href="https://space.bilibili.com/14198006" 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             className="text-blue-600 dark:text-blue-400 hover:underline"
                           >
                             LuN3cy
                           </a>
                           老师的作品作为base，由Trae和个人审美做了一些调整完成。
                         </p>
                         <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                           后端开发ing~
                         </p>
                         <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                           未完待续...
                         </p>
                       </>
                     ) : (
                       <>
                         <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                           Hello, welcome to Bamdow's personal website. This is my first truly independent single-project development. The front-end part uses the work of Bilibili 
                           <a 
                             href="https://space.bilibili.com/14198006" 
                             target="_blank" 
                             rel="noopener noreferrer" 
                             className="text-blue-600 dark:text-blue-400 hover:underline"
                           >
                             Bilibili
                           </a>
                           as the base, with some adjustments made by Trae and my personal aesthetics.
                         </p>
                         <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                           Back-end development in progress~
                         </p>
                         <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                           To be continued...
                         </p>
                       </>
                     )}
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>,
        document.body
      )}

    </div>
  );
}

export default App;
