
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { EXPERIMENT_DATA } from '../src/data/experiment';
import { Language } from '../types';
import { ArrowUpRight, X, Hourglass } from 'lucide-react';

interface TimelineSectionProps {
  language: Language;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({ language }) => {
  const content = EXPERIMENT_DATA[language];
  const experiences = content.experiences;
  const honors = content.honors;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  
  // Lock State - Disabled
  const [inputAnswer, setInputAnswer] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle modal animation mounting/unmounting
  useEffect(() => {
    if (isModalOpen) {
      setIsRendered(true);
      document.body.style.overflow = 'hidden'; // Lock scroll
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => setIsRendered(false), 300); // Wait for exit animation
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  // Skip unlock screen and show empty content directly
  const isUnlocked = true;

  // Helper to parse award string "Rank | Contest"
  const parseAward = (awardString: string) => {
    const parts = awardString.split('|');
    if (parts.length > 1) {
      return { rank: parts[0].trim(), contest: parts[1].trim() };
    }
    return { rank: '', contest: awardString };
  };

  return (
    <div className="pt-20 w-full min-h-[60vh] flex flex-col items-center justify-center">
      {language === 'zh' && (
        <h1 className="text-[8vw] leading-none font-black text-black dark:text-white transition-colors duration-300 mb-8 text-center">
          “正在施工中”
        </h1>
      )}
      {language === 'en' && (
        <h1 className="text-[8vw] leading-none font-black text-black dark:text-white transition-colors duration-300 mb-8 text-center">
          ”Under Construction“
        </h1>
      )}
    </div>
  );
};
