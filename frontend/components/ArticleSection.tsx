import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ARTICLE_LABELS } from '../constants';
import { ArticleCategory, Language, Article } from '../types';
import { Calendar, Filter, Edit, Plus, Trash2, X, BookOpen, Upload, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { markdownApi } from '../src/services/markdownApi';
import Markdown from 'react-markdown';

// Example article data with Markdown content
const EXAMPLE_ARTICLES: Article[] = [
  {
    id: 'example-1',
    title: 'Markdown示例文章',
    category: ArticleCategory.DIT,
    link: '#',
    coverImage: '/images/1.avif',
    date: '2026-02-13',
    content: `# Markdown示例文章

这是一篇使用Markdown格式编写的示例文章，展示了如何在前端渲染Markdown内容。

## 功能特性

- **标题**：支持多级标题
- **列表**：
  - 无序列表
  - 有序列表
- **强调**：
  - *斜体文本*
  - **粗体文本**
- **链接**：[Markdown指南](https://www.markdownguide.org/)

## 图片

![示例图片](/images/1.avif)

## 表格

| 姓名 | 年龄 | 职业 |
|------|------|------|
| 张三 | 25   | 工程师 |
| 李四 | 30   | 设计师 |

## 引用

> 这是一段引用文本，用于展示Markdown的引用功能。
>
> —— 引用来源

希望这个示例能够帮助你了解如何在前端渲染Markdown内容！
`
  }
];

interface ArticleSectionProps {
  language: Language;
}

export const ArticleSection: React.FC<ArticleSectionProps> = ({ language }) => {
  const [filter, setFilter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  // Edit Mode State
  const [editMode, setEditMode] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  
  // Add Article Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [markdownFile, setMarkdownFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalArticles, setTotalArticles] = useState(0);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = ['All'];

  // Fetch articles from backend when page or page size changes
  useEffect(() => {
    fetchArticles();
  }, [currentPage, pageSize]);

  const filteredAndSortedArticles = articles
    .filter(a => filter === 'All' || a.category === filter)
    .sort((a, b) => {
      const dateA = new Date(a.date || '').getTime();
      const dateB = new Date(b.date || '').getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  // Handle Markdown file selection
  const handleMarkdownFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMarkdownFile(file);
    }
  };

  // Handle image file selection and preview
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setImageFiles(prev => [...prev, ...newFiles]);
      
      // Generate previews for new images
      const newPreviews: string[] = [];
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImagePreviews(prev => [...prev, event.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };



  // Fetch articles from backend
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await markdownApi.getMarkdownFiles(currentPage, pageSize);
      setTotalArticles(response.total);
      
      // Convert MarkdownFile to Article format
      const convertedArticles: Article[] = response.records.map((file) => ({
        id: file.id,
        title: file.fileName.replace(/\.md$/i, ''), // 去掉.md后缀，不区分大小写
        category: ArticleCategory.DIT,
        link: file.ossurl,
        coverImage: '',
        date: new Date().toISOString().split('T')[0],
        content: ''
      }));
      
      setArticles(convertedArticles);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      // Fallback to example articles if API fails
      setArticles(EXAMPLE_ARTICLES);
      setTotalArticles(EXAMPLE_ARTICLES.length);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!markdownFile) {
      alert(language === 'zh' ? '请选择Markdown文件' : 'Please select a Markdown file');
      return;
    }

    try {
      // Upload markdown file and images together
      const markdownUrl = await markdownApi.uploadMarkdown(markdownFile, imageFiles);
      
      console.log('Markdown file uploaded successfully:', markdownUrl);
      
      // Close modal and reset state
      handleCloseAddModal();
      
      // Refresh the article list
      setCurrentPage(1); // Reset to first page to see the new article
      
      // Wait a short time to ensure backend has processed the upload
      setTimeout(() => {
        fetchArticles();
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
      alert(language === 'zh' ? '上传失败，请重试' : 'Upload failed, please try again');
    }
  };

  // Handle close modal
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setMarkdownFile(null);
    setImageFiles([]);
    setImagePreviews([]);
  };

  return (
    <div className="w-full max-w-[98vw] mx-auto pb-20">
      
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 justify-center">
        
        {/* Left Sidebar - Desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-32">
            <h3 className="text-xl font-black mb-8 px-4 flex items-center gap-2">
              <Filter size={20} />
              {language === 'zh' ? '分类' : 'Categories'}
            </h3>
            <div className="flex flex-col space-y-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`
                    text-left px-4 py-3 rounded-xl transition-all duration-300 text-lg font-bold
                    ${filter === cat 
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg transform scale-105' 
                      : 'text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}
                  `}
                >
                  {ARTICLE_LABELS[language][cat] || cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Filter Bar (Horizontal) */}
        <div className="lg:hidden flex overflow-x-auto pb-4 gap-4 no-scrollbar mb-8 sticky top-20 bg-white/95 dark:bg-black/95 backdrop-blur-sm z-30 pt-4">
           {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`
                whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border-2 transition-all duration-300
                ${filter === cat 
                  ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' 
                  : 'border-gray-200 text-gray-400 dark:border-gray-800 dark:text-gray-500'}
              `}
            >
              {ARTICLE_LABELS[language][cat] || cat}
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="flex-grow">
          
          {/* Sort Controls Panel */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
             <div className="text-lg font-mono text-gray-400">
                {filteredAndSortedArticles.length} {language === 'zh' ? '篇文章' : 'Articles'}
             </div>
              
             <div className="flex items-center gap-4">
               {/* Delete Button - Only show in edit mode */}
               {editMode && (
                 <button
                   className={`p-2 rounded-full transition-colors duration-300 ${
                     selectedArticles.length > 0 
                       ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                       : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                   }`}
                   title={language === 'zh' ? '删除选中文章' : 'Delete Selected Articles'}
                   onClick={() => {
                     if (selectedArticles.length > 0) {
                       console.log('Delete selected articles:', selectedArticles);
                       setSelectedArticles([]);
                     }
                   }}
                   disabled={selectedArticles.length === 0}
                 >
                   <Trash2 size={20} />
                 </button>
               )}
               
               {/* Edit Button */}
               <button
                 className={`p-2 rounded-full transition-colors duration-300 ${
                   editMode 
                     ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100'
                     : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black'
                 }`}
                 title={editMode ? (language === 'zh' ? '退出编辑' : 'Exit Edit') : (language === 'zh' ? '编辑文章' : 'Edit Article')}
                 onClick={() => {
                   setEditMode(!editMode);
                   setSelectedArticles([]);
                 }}
               >
                 <Edit size={20} />
               </button>
               
               {/* Add Button */}
               <button
                 className={`p-2 rounded-full transition-colors duration-300 cursor-pointer ${
                   editMode 
                     ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black'
                     : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 hover:text-white dark:hover:text-black'
                 }`}
                 title={editMode 
                   ? (language === 'zh' ? '全选/取消全选' : 'Select All/Deselect All') 
                   : (language === 'zh' ? '新增文章' : 'Add Article')}
                 onClick={() => {
                   if (!editMode) {
                     setShowAddModal(true);
                   } else {
                     if (selectedArticles.length === filteredAndSortedArticles.length) {
                       setSelectedArticles([]);
                     } else {
                       setSelectedArticles(filteredAndSortedArticles.map(article => article.id));
                     }
                   }
                 }}
               >
                 {editMode ? (
                   <span className="text-sm font-bold flex items-center justify-center w-6 h-6">
                     {language === 'zh' ? '全' : 'All'}
                   </span>
                 ) : (
                   <Plus size={20} />
                 )}
               </button>
              
               <button 
                 onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                 className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg font-bold text-gray-600 dark:text-gray-300"
               >
                  <Calendar size={20} />
                  <span>{language === 'zh' ? '时间排序' : 'Date'}</span>
               </button>
             </div>
          </div>

          {/* Article List - One per line */}
          <div className="flex flex-col gap-6">
            {filteredAndSortedArticles.map((article) => (
              <div 
                key={article.id} 
                className="group cursor-pointer relative"
                onClick={() => {
                  if (editMode) {
                    setSelectedArticles(prev => {
                      if (prev.includes(article.id)) {
                        return prev.filter(id => id !== article.id);
                      } else {
                        return [...prev, article.id];
                      }
                    });
                  } else {
                    // 先设置selectedArticle，显示加载状态
                    setSelectedArticle({ ...article, content: 'Loading...' });
                    
                    // 调用后端接口获取Markdown文件的OSS URL
                    fetch(`/api/admin/markdown/${article.id}`)
                      .then(response => {
                        if (!response.ok) {
                          throw new Error('Failed to fetch markdown URL');
                        }
                        return response.json();
                      })
                      .then(data => {
                        if (data.code === 200 && data.data) {
                          // 获取OSS URL
                          const ossUrl = data.data.trim(); // 去除可能的空格和反引号
                          
                          // 根据OSS URL下载Markdown文件内容
                          return fetch(ossUrl)
                            .then(response => {
                              if (!response.ok) {
                                throw new Error('Failed to fetch markdown content');
                              }
                              return response.text();
                            })
                            .then(content => {
                              // 更新selectedArticle，添加内容
                              setSelectedArticle({ ...article, content });
                            });
                        } else {
                          throw new Error('Invalid response from server');
                        }
                      })
                      .catch(error => {
                        console.error('Error fetching markdown content:', error);
                        setSelectedArticle({ ...article, content: 'Failed to load content' });
                      });
                  }
                }}
              >
                {/* Selection Circle - Only show in edit mode */}
                {editMode && (
                  <button
                    className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-300 bg-white dark:bg-black shadow-md`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedArticles(prev => {
                        if (prev.includes(article.id)) {
                          return prev.filter(id => id !== article.id);
                        } else {
                          return [...prev, article.id];
                        }
                      });
                    }}
                  >
                    <div className={`w-4 h-4 rounded-full transition-all duration-300 ${selectedArticles.includes(article.id) ? 'bg-black dark:bg-white' : 'bg-transparent border-2 border-black dark:border-white'}`}></div>
                  </button>
                )}
                
                <div className="flex flex-col md:flex-row bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden p-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 items-stretch h-auto">
                    
                    {/* Cover Image Container */}
                    <div className="w-full md:w-[45%] aspect-[900/383] shrink-0 rounded-xl overflow-hidden relative bg-gray-100 dark:bg-gray-900">
                        {article.coverImage ? (
                             <img 
                             src={article.coverImage} 
                             alt={article.title} 
                             loading="lazy"
                             decoding="async"
                             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                             referrerPolicy="no-referrer"
                           />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
                                 <BookOpen size={32} className="text-gray-300 dark:text-gray-600" />
                            </div>
                        )}
                        
                        <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/90 text-black dark:text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                          {ARTICLE_LABELS[language][article.category].split('|')[0].trim()}
                        </div>
                    </div>

                    {/* Content - Right Side */}
                    <div className="flex-grow flex flex-col p-4 md:p-6 justify-between min-w-0">
                        <div>
                            <div className="mb-2">
                                <h3 className="text-lg md:text-2xl font-black text-black dark:text-white leading-snug group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300 line-clamp-3">
                                    {article.title}
                                </h3>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs md:text-sm font-mono text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3 mt-2">
                             <span>{article.date || 'No Date'}</span>
                             <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                             <span className="truncate hidden md:inline">Markdown Article</span>
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAndSortedArticles.length === 0 && (
             <div className="w-full h-64 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl mt-8">
                <p className="text-xl font-medium">{language === 'zh' ? '暂无文章' : 'No articles found'}</p>
             </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              
              <span className="text-gray-600 dark:text-gray-400">
                {language === 'zh' ? `第 ${currentPage} 页，共 ${Math.ceil(totalArticles / pageSize)} 页` : `Page ${currentPage} of ${Math.ceil(totalArticles / pageSize)}`}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalArticles / pageSize), prev + 1))}
                disabled={currentPage >= Math.ceil(totalArticles / pageSize)}
                className="p-2 rounded-full border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Article Detail Modal */}
      {selectedArticle && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/80"
             onClick={() => setSelectedArticle(null)}
           ></div>

           {/* Modal Content */}
           <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden flex flex-col animate-message-pop">
             {/* Inner scroll container */}
             <div className="flex-1 overflow-y-auto no-scrollbar">
               {/* Close Button */}
               <button 
                 onClick={() => setSelectedArticle(null)}
                 className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/50 dark:bg-black/50 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
               >
                 <X size={24} className="text-black dark:text-white" />
               </button>

               {/* Article Content */}
               <div className="p-6 md:p-12">
                 {/* Header */}
                 <div className="mb-8">
                   <div className="flex items-center gap-3 mb-4">
                     <span className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold uppercase rounded-md">
                       {ARTICLE_LABELS[language][selectedArticle.category].split('|')[0].trim()}
                     </span>
                     <span className="text-gray-500 font-mono text-sm uppercase font-bold tracking-widest">{selectedArticle.date}</span>
                   </div>
                   <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white mb-6 leading-tight">
                     {selectedArticle.title}
                   </h2>
                 </div>



                 {/* Markdown Content */}
                 <div className="prose dark:prose-invert max-w-none">
                   <style>
                     {
                       `
                       .prose table {
                         width: 100%;
                         border-collapse: collapse;
                         margin: 1rem 0;
                       }
                       .prose th,
                       .prose td {
                         padding: 0.5rem;
                         border: 1px solid #ccc;
                         text-align: left;
                       }
                       .prose th {
                         background-color: #f5f5f5;
                         font-weight: bold;
                       }
                       .dark .prose th {
                         background-color: #333;
                         border-color: #555;
                       }
                       .dark .prose td {
                         border-color: #555;
                       }
                       .prose blockquote {
                         border-left: 4px solid #ccc;
                         padding-left: 1rem;
                         margin: 1rem 0;
                         color: #666;
                       }
                       .dark .prose blockquote {
                         border-left-color: #555;
                         color: #aaa;
                       }
                       .prose img {
                         max-width: 100%;
                         height: auto;
                         margin: 1rem 0;
                       }
                       .prose ul,
                       .prose ol {
                         margin: 1rem 0;
                         padding-left: 2rem;
                       }
                       .prose li {
                         margin: 0.5rem 0;
                       }
                       .prose a {
                         color: #007bff;
                         text-decoration: underline;
                       }
                       .dark .prose a {
                         color: #64b5f6;
                       }
                       `
                     }
                   </style>
                   <Markdown>
                     {selectedArticle.content || ''}
                   </Markdown>
                 </div>
               </div>
             </div>
           </div>
        </div>,
        document.body
      )}

      {/* Add Article Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/80"
             onClick={handleCloseAddModal}
           ></div>

           {/* Modal Content */}
           <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden flex flex-col animate-message-pop">
             {/* Header */}
             <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
               <h3 className="text-2xl font-black text-black dark:text-white">
                 {language === 'zh' ? '新增文章' : 'Add Article'}
               </h3>
               <button 
                 onClick={handleCloseAddModal}
                 className="p-2 rounded-full bg-white/50 dark:bg-black/50 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
               >
                 <X size={24} className="text-black dark:text-white" />
               </button>
             </div>

             {/* Inner scroll container */}
             <div className="flex-1 overflow-y-auto no-scrollbar p-6">
               {/* Markdown File Upload */}
               <div className="mb-8">
                 <label className="block text-lg font-bold text-black dark:text-white mb-3">
                   {language === 'zh' ? 'Markdown文件' : 'Markdown File'}
                 </label>
                 <div 
                   className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-black dark:hover:border-white transition-colors cursor-pointer"
                   onDragOver={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     e.currentTarget.classList.add('border-black', 'dark:border-white');
                   }}
                   onDragEnter={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                   }}
                   onDragLeave={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     e.currentTarget.classList.remove('border-black', 'dark:border-white');
                   }}
                   onDrop={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     e.currentTarget.classList.remove('border-black', 'dark:border-white');
                     const file = e.dataTransfer.files[0];
                     if (file && (file.name.endsWith('.md') || file.name.endsWith('.markdown'))) {
                       setMarkdownFile(file);
                     }
                   }}
                 >
                   <input
                     type="file"
                     accept=".md,.markdown"
                     className="hidden"
                     id="markdown-upload"
                     onChange={handleMarkdownFileChange}
                   />
                   <label htmlFor="markdown-upload" className="cursor-pointer">
                     <Upload size={48} className="mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                     <p className="text-gray-600 dark:text-gray-400 mb-2">
                       {language === 'zh' ? '点击或拖拽文件到此处' : 'Click or drag files to this area'}
                     </p>
                     <p className="text-xs text-gray-400 dark:text-gray-600">
                       {language === 'zh' ? '支持 .md, .markdown 格式' : 'Supports .md, .markdown formats'}
                     </p>
                     {markdownFile && (
                       <p className="mt-3 text-sm font-medium text-black dark:text-white">
                         {markdownFile.name}
                       </p>
                     )}
                   </label>
                 </div>
               </div>

               {/* Image Upload */}
               <div className="mb-8">
                 <label className="block text-lg font-bold text-black dark:text-white mb-3">
                   {language === 'zh' ? '图片文件' : 'Image Files'}
                 </label>
                 <div 
                   className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-black dark:hover:border-white transition-colors cursor-pointer"
                   onDragOver={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     e.currentTarget.classList.add('border-black', 'dark:border-white');
                   }}
                   onDragEnter={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                   }}
                   onDragLeave={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     e.currentTarget.classList.remove('border-black', 'dark:border-white');
                   }}
                   onDrop={(e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     e.currentTarget.classList.remove('border-black', 'dark:border-white');
                     const files = Array.from(e.dataTransfer.files);
                     const imageFilesOnly = files.filter(file => file.type.startsWith('image/'));
                     if (imageFilesOnly.length > 0) {
                       setImageFiles(prev => [...prev, ...imageFilesOnly]);
                       
                       // Generate previews for new images
                       imageFilesOnly.forEach(file => {
                         const reader = new FileReader();
                         reader.onload = (event) => {
                           if (event.target?.result) {
                             setImagePreviews(prev => [...prev, event.target.result as string]);
                           }
                         };
                         reader.readAsDataURL(file);
                       });
                     }
                   }}
                 >
                   <input
                     type="file"
                     accept="image/*"
                     multiple
                     className="hidden"
                     id="image-upload"
                     onChange={handleImageFileChange}
                   />
                   <label htmlFor="image-upload" className="cursor-pointer">
                     <ImageIcon size={48} className="mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                     <p className="text-gray-600 dark:text-gray-400 mb-2">
                       {language === 'zh' ? '点击或拖拽文件到此处' : 'Click or drag files to this area'}
                     </p>
                     <p className="text-xs text-gray-400 dark:text-gray-600">
                       {language === 'zh' ? '支持 JPG, PNG, GIF 等图片格式' : 'Supports JPG, PNG, GIF and other image formats'}
                     </p>
                     {imageFiles.length > 0 && (
                       <p className="mt-3 text-sm font-medium text-black dark:text-white">
                         {language === 'zh' ? `已选择 ${imageFiles.length} 个图片文件` : `Selected ${imageFiles.length} image files`}
                       </p>
                     )}
                   </label>
                 </div>

                 {/* Image Previews */}
                 {imagePreviews.length > 0 && (
                   <div className="mt-4 grid grid-cols-3 gap-4">
                     {imagePreviews.map((preview, index) => (
                       <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                         <img 
                           src={preview} 
                           alt={`Preview ${index + 1}`} 
                           className="w-full h-full object-cover"
                         />
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             </div>

             {/* Footer */}
             <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-4">
               <button
                 onClick={handleCloseAddModal}
                 className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
               >
                 {language === 'zh' ? '取消' : 'Cancel'}
               </button>
               <button
                 onClick={handleSubmit}
                 className="px-6 py-3 rounded-lg bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
               >
                 {language === 'zh' ? '提交' : 'Submit'}
               </button>
             </div>
           </div>
        </div>,
        document.body
      )}
    </div>
  );
};
