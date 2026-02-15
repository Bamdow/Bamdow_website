import { Language, Category } from '../../types';

export interface HeroItem {
  text: string;
  annotation: string;
  category: Category | null;
}

export interface HomeContent {
  heroItems: HeroItem[];
  intro: string;
  selectedWorks: string;
  years: string;
}

export const HOME_DATA: Record<Language, HomeContent> = {
  zh: {
    heroItems: [
      { text: "Photography", annotation: "沉浸或回忆", category: Category.PHOTO }, // Changed to PHOTO for 静态照片
      { text: "にじげん/游戏", annotation: "杂谈或分享", category: Category.OTHER }, // Changed to OTHER for 其他
      { text: "软件开发", annotation: "项目或点子", category: Category.DEV } // Kept as DEV for 软件开发
    ],
    intro: "窗竹影摇书案上，野泉声入砚池中。",
    selectedWorks: "精选",
    years: "[ 2026 —      ]"
  },
  en: {
    heroItems: [
      { text: "Photography", annotation: "Immerse or recall", category: Category.PHOTO },
      { text: "Nijigen & Game", annotation: "Share or discuss", category: Category.OTHER },
      { text: "Development", annotation: "Project or idea", category: Category.DEV },
    ],
    intro: "A distant spring murmurs, as if flowing into my inkstone.",
    selectedWorks: "Selected Works",
    years: "[ 2021 — 2026 ]"
  }
};
