
export type Language = 'zh' | 'en';

export enum Category {
  ALL = 'All',
  OTHER = 'Other',
  PHOTO = 'Photography',
  DEV = 'Development',
  ARTICLE = 'Article'
}

export enum ArticleCategory {

}

export interface Article {
  id: string;
  title: string;
  category: ArticleCategory;
  link: string; // WeChat Official Account Link
  coverImage?: string; // Optional, will fallback if not provided
  date?: string;
  content?: string; // Markdown content for pop-up card
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  category: Category;
  tags: string[];
  
  // 摄影项目特有字段
  thoughts?: string;
  additionalInfo?: string;
  
  // 开发项目特有字段
  githubUrl?: string;
  readme?: string;
  
  // 其他项目特有字段
  externalLink?: string;
  introduction?: string;
  
  // 保留字段，确保与现有代码兼容
  subtitle?: string;
  role?: string;
  gallery?: string[];
  bilingualTitle?: {
    zh: string;
    en: string;
  };
}

export interface Experience {
  id: string;
  year: string;
  title: string;
  institution: string;
  description: string;
  type: 'experiment' | 'work';
}

export interface Skill {
  name: string;
  level: number; // 0-100
  icon?: string;
}

export interface CompetitionGroup {
  level: string;
  awards: string[];
}

export interface HonorsData {
  scholarships: string[];
  titles: string[];
  competitions: CompetitionGroup[];
}
