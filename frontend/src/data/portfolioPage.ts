import { Language } from '../../types';

export interface PortfolioPageContent {
  title: string;
  description: string;
}

export const PORTFOLIO_PAGE_DATA: Record<Language, PortfolioPageContent> = {
  zh: {
    title: '作品',
    description: '没说全部是我的('
  },
  en: {
    title: 'Portfolio',
    description: 'It\'s not all my fault.'
  }
};
