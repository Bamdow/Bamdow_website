
import React, { useState } from 'react';
import { HOME_DATA } from '../src/data/home';
import { CONTACT_DATA } from '../src/data/contact';
import { Language, Category } from '../types';
import { createPortal } from 'react-dom';
import { MapPin } from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (page: string) => void;
  onCategorySelect: (category: Category) => void;
  language: Language;
  theme: 'light' | 'dark';
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onCategorySelect, language, theme }) => {
  const content = HOME_DATA[language];
  const contactContent = CONTACT_DATA[language];
  const tooltipText = contactContent.tooltip || (language === 'zh' 
    ? '还是想念武汉，但感觉之后可能也留在广深' 
    : 'Still miss Wuhan, but likely to stay in Guangzhou-Shenzhen later.');
  const heroItems = content.heroItems || [];
  const [showToast, setShowToast] = useState(false);
  const [showLocationTooltip, setShowLocationTooltip] = useState(false);

  const handleHeadlineClick = (category: Category | null) => {
    if (category) {
      onCategorySelect(category);
    } else {
      // Show "Still Learning" Toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const renderHeadlineText = (item: any, index: number) => {
    return (
      <div className="flex flex-col">
        <h1 className={`
          ${language === 'en' ? 'text-[10vw] lg:text-[6vw]' : 'text-[12vw] lg:text-[7vw]'} 
          font-black tracking-tighter leading-tight text-black dark:text-white transition-all duration-300 whitespace-nowrap overflow-visible group-hover:opacity-70
        `}>
          {item.text}
        </h1>
        {/* Annotation - Display below the title */}
        <div className="text-xl lg:text-2xl text-gray-400 font-bold tracking-normal mt-2">
          {item.annotation}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[98vw] mx-auto animate-fade-in relative">
      
      {/* Intro Block - Mobile Stacked, Desktop Split */}
      <section className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-16 mb-12 lg:mb-20 items-start">
        
        {/* LEFT: Massive Interactive Title */}
        <div className="lg:col-span-5 w-full">
            <div className="flex flex-col w-full mb-6 lg:mb-8">
              {heroItems.map((item, index) => (
                <div key={index} className="group cursor-pointer" onClick={() => handleHeadlineClick(item.category || null)}>
                  {renderHeadlineText(item, index)}
                  {index < heroItems.length - 1 && (
                    <div className="w-full h-[1px] bg-black/10 dark:bg-white/10 my-2 md:my-4 transition-colors duration-300"></div>
                  )}
                </div>
              ))}
            </div>
          
          {/* Increased max-width to 4xl to prevent unwanted wrapping */}
          <div className="mt-8 text-2xl md:text-4xl text-[#00A855] dark:text-[#00A855] font-medium leading-relaxed max-w-4xl transition-colors duration-300">
             {content.intro.split('|').map((line, i) => (
               <React.Fragment key={i}>
                 {line}
                 <br className="hidden md:block" />
                 {/* Mobile simple space */}
                 <span className="md:hidden"> </span> 
               </React.Fragment>
             ))}
          </div>
        </div>

        {/* RIGHT: Image Display Area */}
        <div className="lg:col-span-7 pt-0 lg:pt-4 w-full">
          {/* Image Container with Diagonal Shape */}
          <div className="w-full h-[700px] md:h-[800px] lg:min-h-[900px] mt-0 relative overflow-hidden shadow-sm">
            <div className="w-full h-full" style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}>
              <img 
                src={theme === 'light' ? "/hero-image.png" : "/hero-image1.png"} 
                alt="Profile" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                style={{ objectPosition: '20% center' }}
              />
            </div>
          </div>
        </div>
      </section>


      {/* Selected Works Preview */}
      <div className="w-full h-[2px] bg-gray-100 dark:bg-gray-800 mb-6 lg:mb-8 transition-colors duration-300"></div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 lg:mb-10 gap-4">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-black dark:text-white transition-colors duration-300">{content.selectedWorks}</h2>
      </div>

      {/* Floating Toast for Cooking */}
      {showToast && createPortal(
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-full shadow-2xl z-[100] animate-fade-in font-bold text-xl">
           {language === 'zh' ? '还在学... 🍳' : 'Still Learning... 🍳'}
        </div>,
        document.body
      )}

    </div>
  );
};
