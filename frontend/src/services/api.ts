import { Project, Category, Language } from '../../types';
import { PROJECT_DATA } from '../data/projects';

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 项目创建请求接口
interface ProjectCreateRequest {
  title: string;
  description: string;
  image: string;
  category: string;
  tags: string;
  thoughts?: string;
  additionalInfo?: string;
  githubUrl?: string;
  externalLink?: string;
}

// API服务类
export class ApiService {
  // 获取所有作品，支持按分类过滤
  static async getProjects(language: Language, category?: string): Promise<Project[]> {
    try {
      // 构建请求URL和参数
      const url = new URL('/api/admin/projects', window.location.origin);
      if (category && category !== 'All') {
        url.searchParams.append('category', category);
      }
      
      // 实际发送API请求
      console.log('Fetching projects from:', url.toString());
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Received projects response:', data);
      
      // 处理后端返回的数据格式
      const projects = data.data.items.map((item: any) => {
        const project: any = {
          id: item.id,
          title: item.title,
          description: item.description,
          image: item.image || '',
          category: item.category as Category,
          tags: item.tags || [],
          thoughts: item.thoughts,
          additionalInfo: item.additionalInfo,
          githubUrl: item.githubUrl,
          externalLink: item.externalLink,
          subtitle: item.subtitle,
          role: item.role,
          gallery: item.image ? item.image.split(',').filter((url: string) => url.trim() !== '') : [],
          bilingualTitle: item.bilingualTitle || {
            zh: item.title,
            en: item.title
          },
          // 处理其他可能的字段，确保与现有代码兼容
          websiteUrl: item.websiteUrl,
          videoUrl: item.videoUrl,
          bilibiliId: item.bilibiliId,
          figmaUrl: item.figmaUrl,
          icon: item.icon,
          awards: item.awards,
          concept: item.concept,
          roleDetail: item.roleDetail
        };
        return project;
      });
      
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      
      // 降级处理：使用本地模拟数据
      console.log('Falling back to local mock data');
      
      // 处理数据，根据语言选择对应版本
      let projects = PROJECT_DATA.map(p => {
        const baseProject: Project = {
          id: p.id,
          category: p.common.category as Category,
          image: p.common.image,
          title: p[language].title,
          subtitle: p[language].subtitle,
          description: p[language].description,
          role: p[language].role,
          tags: p[language].tags,
          awards: p[language].awards,
          concept: p[language].concept,
          roleDetail: p[language].roleDetail,
          websiteUrl: p[language].websiteUrl,
          githubUrl: p[language].githubUrl,
          icon: p[language].icon,
          videoUrl: p[language].videoUrl,
          bilibiliId: p[language].bilibiliId,
          figmaUrl: p[language].figmaUrl,
          gallery: p[language].gallery,
          externalLink: p[language].externalLink,
          bilingualTitle: {
            zh: p.zh.title,
            en: p.en.title
          }
        };
        return baseProject;
      });
      
      // 按分类过滤
      if (category && category !== 'All') {
        projects = projects.filter(p => p.category === category);
      }
      
      return projects;
    }
  }
  
  // 获取作品详情
  static async getProjectById(id: string, language: Language): Promise<Project | null> {
    try {
      // 模拟API请求延迟
      await delay(200);
      
      const projectData = PROJECT_DATA.find(p => p.id === id);
      if (!projectData) {
        return null;
      }
      
      const project: Project = {
        id: projectData.id,
        category: projectData.common.category as Category,
        image: projectData.common.image,
        title: projectData[language].title,
        subtitle: projectData[language].subtitle,
        description: projectData[language].description,
        role: projectData[language].role,
        tags: projectData[language].tags,
        awards: projectData[language].awards,
        concept: projectData[language].concept,
        roleDetail: projectData[language].roleDetail,
        websiteUrl: projectData[language].websiteUrl,
        githubUrl: projectData[language].githubUrl,
        icon: projectData[language].icon,
        videoUrl: projectData[language].videoUrl,
        bilibiliId: projectData[language].bilibiliId,
        figmaUrl: projectData[language].figmaUrl,
        gallery: projectData[language].gallery,
        externalLink: projectData[language].externalLink,
        bilingualTitle: {
          zh: projectData.zh.title,
          en: projectData.en.title
        }
      };
      
      return project;
    } catch (error) {
      console.error('Error fetching project by id:', error);
      throw error;
    }
  }
  
  // 获取可用的分类列表
  static async getCategories(language: Language): Promise<string[]> {
    try {
      // 模拟API请求延迟
      await delay(100);
      
      // 获取所有唯一分类
      const categories = [...new Set(PROJECT_DATA.map(p => p.common.category))];
      // 添加"All"选项
      return ['All', ...categories];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
  
  // 新增项目
  static async createProject(projectData: any): Promise<Project> {
    try {
      // 构建请求体，确保与后端接口文档格式一致
      const requestBody = {
        title: projectData.title,
        description: projectData.description,
        image: projectData.images.join(','), // 兼容单张图片格式，使用逗号分隔的字符串
        images: projectData.images, // 支持多张图片格式，使用数组
        category: projectData.category,
        tags: projectData.tags,
        thoughts: projectData.thoughts,
        additionalInfo: projectData.additionalInfo,
        githubUrl: projectData.githubUrl,
        externalLink: projectData.externalLink
      };
      
      // 实际发送 API 请求
      console.log('Sending request to /api/admin/projects:', requestBody);
      
      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Received response:', data);
      
      // 处理响应数据
      const project: Project = {
        id: data.data.id,
        title: data.data.title,
        description: data.data.description,
        image: data.data.image, // 使用后端返回的 image 字段（逗号分隔的字符串）
        category: data.data.category as Category,
        tags: data.data.tags,
        thoughts: data.data.thoughts,
        additionalInfo: data.data.additionalInfo,
        githubUrl: data.data.githubUrl,
        externalLink: data.data.externalLink,
        gallery: data.data.image.split(','), // 将逗号分隔的字符串转换为数组
        bilingualTitle: {
          zh: data.data.title,
          en: data.data.title
        }
      };
      
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      
      // 模拟响应（当后端API不可用时）
      console.log('Using mock response due to API error');
      const mockResponse: Project = {
        id: `new-${Date.now()}`,
        title: projectData.title,
        description: projectData.description,
        image: projectData.images.join(','), // 使用逗号分隔的字符串作为主图字段
        category: projectData.category as Category,
        tags: projectData.tags.split(',').map((tag: string) => tag.trim()),
        thoughts: projectData.thoughts,
        additionalInfo: projectData.additionalInfo,
        githubUrl: projectData.githubUrl,
        externalLink: projectData.externalLink,
        gallery: projectData.images, // 将所有图片放入 gallery
        bilingualTitle: {
          zh: projectData.title,
          en: projectData.title
        }
      };
      
      return mockResponse;
    }
  }
  
  // 上传图片（单张）
  static async uploadImage(file: File): Promise<string> {
    try {
      // 实际发送图片上传请求
      console.log('Uploading image to /api/admin/upload/images:', file.name);
      
      const formData = new FormData();
      formData.append('files', file); // 使用 files 字段，与后端保持一致
      
      const response = await fetch('/api/admin/upload/images', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Received upload response:', data);
      
      // 正确处理后端响应格式：data 字段直接包含 URL 数组
      return data.data[0];
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // 模拟返回图片URL（当后端API不可用时）
      console.log('Using mock image URL due to API error');
      return `https://example.com/upload/${file.name}`;
    }
  }
  
  // 上传多张图片
  static async uploadImages(files: File[]): Promise<string[]> {
    try {
      // 实际发送多图片上传请求
      console.log('Uploading multiple images to /api/admin/upload/images:', files.length);
      
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('files', file);
      });
      
      const response = await fetch('/api/admin/upload/images', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Received upload response:', data);
      
      // 正确处理后端响应格式：data 字段直接包含 URL 数组
      return data.data;
    } catch (error) {
      console.error('Error uploading images:', error);
      
      // 模拟返回图片URL列表（当后端API不可用时）
      console.log('Using mock image URLs due to API error');
      return files.map(file => `https://example.com/upload/${file.name}`);
    }
  }
}
