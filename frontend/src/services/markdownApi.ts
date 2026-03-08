import { Article } from '../../types';

// API response types
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface MarkdownFile {
  id: string;
  fileName: string;
  ossurl: string;
  ossUrl?: string; // 后端返回的字段名
}

interface MarkdownListResponse {
  total: number;
  records: MarkdownFile[];
  items?: MarkdownFile[]; // 后端返回的字段名
}

// Upload image files
async function uploadImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  try {
    const response = await fetch('/api/admin/upload/images', {
      method: 'POST',
      body: formData
    });

    const data: ApiResponse<string[]> = await response.json();
    if (data.code === 200) {
      return data.data;
    } else {
      throw new Error(data.message || 'Image upload failed');
    }
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

// Upload markdown file with images
async function uploadMarkdown(file: File, images: File[]): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  images.forEach(image => {
    formData.append('images', image);
  });

  try {
    const response = await fetch('/api/admin/markdown', {
      method: 'POST',
      body: formData
    });

    const data: ApiResponse<string> = await response.json();
    if (data.code === 200) {
      return data.data;
    } else {
      throw new Error(data.message || 'Markdown upload failed');
    }
  } catch (error) {
    console.error('Markdown upload error:', error);
    throw error;
  }
}

// Get markdown files with pagination
async function getMarkdownFiles(page: number = 1, size: number = 10): Promise<MarkdownListResponse> {
  try {
    const response = await fetch(`/api/admin/markdown?page=${page}&size=${size}`);
    const data: ApiResponse<MarkdownListResponse> = await response.json();
    if (data.code === 200) {
      // 处理后端返回的数据结构
      const result = data.data;
      
      // 转换items为records
if (result.items && !result.records) {
  result.records = result.items.map(item => {
    // 去除ossUrl中的空格和反引号
    const cleanOssUrl = item.ossUrl ? item.ossUrl.trim().replace(/`/g, '') : '';
    return {
      id: item.id || '', // 优先使用后端返回的id
      fileName: item.fileName || (cleanOssUrl ? cleanOssUrl.split('/').pop() || '' : ''), // 优先使用后端返回的fileName
      ossurl: cleanOssUrl || item.ossurl || '', // 兼容ossUrl和ossurl字段
      ossUrl: cleanOssUrl || item.ossurl || ''
    };
  });
}
      
      // 转换ossUrl为ossurl
      if (result.records) {
        result.records = result.records.map(record => ({
          ...record,
          ossurl: record.ossUrl || record.ossurl || ''
        }));
      }
      
      return result;
    } else {
      throw new Error(data.message || 'Failed to get markdown files');
    }
  } catch (error) {
    console.error('Get markdown files error:', error);
    throw error;
  }
}

export const markdownApi = {
  uploadImages,
  uploadMarkdown,
  getMarkdownFiles
};