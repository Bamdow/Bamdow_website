
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CATEGORY_LABELS } from '../constants';
import { Category, Language, Project } from '../types';
import { PHOTOGRAPHY_GALLERY } from '../src/data/photography';
import { ApiService } from '../src/services/api';
import { ArrowUpRight, X, Terminal, MessageCircle, IdCard, Github, ExternalLink, ChevronLeft, ChevronRight, FileText, Film, Plus, Edit, Trash2 } from 'lucide-react';

interface PortfolioSectionProps {
  language: Language;
  externalFilter?: string; // Controlled by parent if needed
  showActions?: boolean; // Whether to show edit and add buttons
}

const GalleryImage = ({ src, alt, onClick }: { src: string, alt: string, onClick: (e: React.MouseEvent) => void }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      className="aspect-square overflow-hidden cursor-zoom-in relative group rounded-lg shadow-sm hover:shadow-md will-change-transform transform-gpu"
      onClick={onClick}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center z-10">
             <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 will-change-transform transform-gpu backface-hidden ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
        onLoad={() => setIsLoaded(true)}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 z-20"></div>
    </div>
  );
};

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ language, externalFilter, showActions = false }) => {
  const [filter, setFilter] = useState<string>('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [displayProject, setDisplayProject] = useState<Project | null>(null);
  const [isModalRendered, setIsModalRendered] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.PHOTO);
  
  // Edit Mode State
  const [editMode, setEditMode] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 16;

  // API State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add Project Form State
  const [addFormData, setAddFormData] = useState({
    title: '',
    description: '',
    images: [] as string[],
    tags: [] as string[],
    thoughts: '',
    additionalInfo: '',
    githubUrl: '',
    readme: '',
    externalLink: '',
    introduction: ''
  });
  
  // Edit Project Form State
  const [editFormData, setEditFormData] = useState({
    id: '',
    title: '',
    description: '',
    images: [] as string[],
    tags: [] as string[],
    thoughts: '',
    additionalInfo: '',
    githubUrl: '',
    readme: '',
    externalLink: '',
    introduction: '',
    category: Category.PHOTO
  });
  
  // Tag input state
  const [tagInput, setTagInput] = useState('');
  
  // Form Loading State
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync with external filter if provided
  useEffect(() => {
    if (externalFilter) {
      setFilter(externalFilter);
    }
  }, [externalFilter]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ApiService.getProjects(language, filter);
        setProjects(data);
      } catch (err) {
        setError('Failed to fetch projects');
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [language, filter]);

  // Get Categories in preferred order
  const preferredOrder = [
    Category.PHOTO,
    Category.DEV,
    Category.OTHER
  ];
  
  const availableCategories = preferredOrder.filter(cat => 
    projects.some(p => p.category === cat) || cat === Category.PHOTO || cat === Category.DEV || cat === Category.OTHER
  );
  
  const categories = ['All', ...availableCategories];

  const filteredProjects = projects;

  // Pagination logic
  const totalProjects = filteredProjects.length;
  const totalPages = Math.ceil(totalProjects / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjectsPage = filteredProjects.slice(indexOfFirstItem, indexOfLastItem);

  // Handle Modal Render State for Animation
  useEffect(() => {
    if (selectedProject) {
      setDisplayProject(selectedProject);
      setIsModalRendered(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => {
        setIsModalRendered(false);
        setDisplayProject(null);
        setLightboxIndex(null); // Close lightbox when modal closes
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedProject]);

  // Derived Gallery for Lightbox
  const currentGallery = displayProject 
    ? (displayProject.gallery || PHOTOGRAPHY_GALLERY[displayProject.id] || []) 
    : [];

  // Lightbox Navigation
  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null && currentGallery.length > 0) {
      setLightboxIndex((prev) => (prev! - 1 + currentGallery.length) % currentGallery.length);
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null && currentGallery.length > 0) {
      setLightboxIndex((prev) => (prev! + 1) % currentGallery.length);
    }
  };

  // Keyboard Navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setLightboxIndex(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, currentGallery.length]);

  // Swipe Handlers
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };
  
  // Handle Form Input Changes
  const handleAddFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle Edit Form Input Changes
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle Image Upload (single file)
  const handleImageUpload = async (file: File) => {
    try {
      setFormLoading(true);
      const imageUrl = await ApiService.uploadImage(file);
      setAddFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
      setFormError(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      setFormError(language === 'zh' ? '图片上传失败，请重试' : 'Image upload failed, please try again');
    } finally {
      setFormLoading(false);
    }
  };
  
  // Handle Multiple Image Upload
  const handleMultipleImageUpload = async (files: File[]) => {
    try {
      setFormLoading(true);
      const imageUrls = await ApiService.uploadImages(files);
      setAddFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
      setFormError(null);
    } catch (error) {
      console.error('Error uploading images:', error);
      setFormError(language === 'zh' ? '图片上传失败，请重试' : 'Image upload failed, please try again');
    } finally {
      setFormLoading(false);
    }
  };
  
  // Remove Image
  const removeImage = (index: number) => {
    setAddFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  // Handle Form Submit
  const handleAddFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      setFormError(null);
      
      // Validate form
      if (!addFormData.title || !addFormData.description || addFormData.images.length === 0) {
        setFormError(language === 'zh' ? '请填写必填字段并上传至少一张图片' : 'Please fill in all required fields and upload at least one image');
        return;
      }
      
      // Prepare request data
      const requestData = {
        title: addFormData.title,
        description: addFormData.description,
        images: addFormData.images,
        category: selectedCategory,
        tags: addFormData.tags, // 直接发送标签数组给后端
        thoughts: addFormData.thoughts,
        additionalInfo: addFormData.additionalInfo,
        githubUrl: addFormData.githubUrl,
        readme: addFormData.readme,
        externalLink: addFormData.externalLink,
        introduction: addFormData.introduction
      };
      
      // Call API to create project
      const newProject = await ApiService.createProject(requestData);
      
      // 重新获取项目列表，确保页面更新
      const updatedProjects = await ApiService.getProjects(language, filter);
      setProjects(updatedProjects);
      
      // Reset form and close modal
      setAddFormData({
        title: '',
        description: '',
        images: [],
        tags: [],
        thoughts: '',
        additionalInfo: '',
        githubUrl: '',
        readme: '',
        externalLink: '',
        introduction: ''
      });
      setTagInput(''); // 同时重置标签输入框
      setSelectedCategory(Category.PHOTO);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating project:', error);
      setFormError(language === 'zh' ? '创建项目失败，请重试' : 'Failed to create project, please try again');
    } finally {
      setFormLoading(false);
    }
  };
  
  // Handle Edit Form Submit
  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      setFormError(null);
      
      // Validate form
      if (!editFormData.title || !editFormData.description) {
        setFormError(language === 'zh' ? '请填写必填字段' : 'Please fill in all required fields');
        return;
      }
      
      // Prepare request data
      const requestData = {
        ...editFormData
      };
      
      // Call API to update project
      const updatedProject = await ApiService.updateProject(requestData);
      
      // 重新获取项目列表，确保页面更新
      const updatedProjects = await ApiService.getProjects(language, filter);
      setProjects(updatedProjects);
      
      // Reset form and close modal
      setEditFormData({
        id: '',
        title: '',
        description: '',
        images: [],
        tags: [],
        thoughts: '',
        additionalInfo: '',
        githubUrl: '',
        readme: '',
        externalLink: '',
        introduction: '',
        category: Category.PHOTO
      });
      setTagInput(''); // 同时重置标签输入框
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating project:', error);
      setFormError(language === 'zh' ? '更新项目失败，请重试' : 'Failed to update project, please try again');
    } finally {
      setFormLoading(false);
    }
  };
  
  // Reset Form when opening modal
  useEffect(() => {
    if (showAddModal) {
      setAddFormData({
        title: '',
        description: '',
        images: [],
        tags: [],
        thoughts: '',
        additionalInfo: '',
        githubUrl: '',
        readme: '',
        externalLink: '',
        introduction: ''
      });
      setTagInput(''); // 同时重置标签输入框
      setSelectedCategory(Category.PHOTO);
      setFormError(null);
    }
  }, [showAddModal]);

  return (
    <div className="w-full max-w-[98vw] mx-auto pb-20">
      
      {/* Brutalist Filter Bar - Sticky */}
      <div className="flex flex-wrap items-center justify-between gap-4 md:gap-8 mb-12 md:mb-16 pb-4 md:pb-8 sticky top-32 md:top-36 bg-transparent z-30 pt-8 md:pt-12 transition-colors duration-300 overflow-x-auto no-scrollbar">
        <div className="flex flex-wrap gap-4 md:gap-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`
                text-lg md:text-2xl font-bold transition-colors duration-200 whitespace-nowrap
                ${filter === cat 
                  ? 'text-black dark:text-white underline decoration-4 underline-offset-8 decoration-black dark:decoration-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}
              `}
            >
              {CATEGORY_LABELS[language][cat] || cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          {/* Years Text - Only show when not in works page (showActions is false) */}
          {!showActions && (
            <span className="text-base lg:text-lg font-mono text-gray-500 dark:text-gray-400 font-bold tracking-widest transition-colors duration-300">[ 2026 — ]</span>
          )}
          
          {/* Action Buttons - Only show in works page (showActions is true) */}
          {showActions && (
            <>
              {/* Delete Button - Only show in edit mode */}
              {editMode && (
                <button
                  className={`p-2 md:p-3 rounded-full transition-colors duration-300 ${
                    selectedProjects.length > 0 
                      ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                  title={language === 'zh' ? '删除选中作品' : 'Delete Selected Projects'}
                  onClick={async () => {
                    if (selectedProjects.length > 0) {
                      try {
                        setFormLoading(true);
                        // Call API to delete selected projects
                        const success = await ApiService.deleteProjects(selectedProjects);
                        if (success) {
                          // 重新获取项目列表，确保页面更新
                          const updatedProjects = await ApiService.getProjects(language, filter);
                          setProjects(updatedProjects);
                          // Clear selection
                          setSelectedProjects([]);
                        }
                      } catch (error) {
                        console.error('Error deleting projects:', error);
                        setFormError(language === 'zh' ? '删除项目失败，请重试' : 'Failed to delete projects, please try again');
                      } finally {
                        setFormLoading(false);
                      }
                    }
                  }}
                  disabled={selectedProjects.length === 0}
                >
                  <Trash2 size={20} className="md:w-6 md:h-6" />
                </button>
              )}
              
              {/* Edit Button */}
              <button
                className={`p-2 md:p-3 rounded-full transition-colors duration-300 ${
                  editMode 
                    ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100'
                    : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black'
                }`}
                title={editMode ? (language === 'zh' ? '退出编辑' : 'Exit Edit') : (language === 'zh' ? '编辑作品' : 'Edit Project')}
                onClick={() => {
                  setEditMode(!editMode);
                  setSelectedProjects([]); // Clear selection when exiting edit mode
                }}
              >
                <Edit size={20} className="md:w-6 md:h-6" />
              </button>
              
              {/* Add/Select All Button */}
              <button
                className={`p-2 md:p-3 rounded-full transition-colors duration-300 ${
                  editMode 
                    ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black'
                    : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 hover:text-white dark:hover:text-black'
                }`}
                title={editMode 
                  ? (language === 'zh' ? '全选/取消全选' : 'Select All/Deselect All') 
                  : (language === 'zh' ? '新增作品' : 'Add Project')}
                onClick={() => {
                  if (editMode) {
                    // Toggle select all
                    if (selectedProjects.length === filteredProjects.length) {
                      setSelectedProjects([]); // Deselect all
                    } else {
                      setSelectedProjects(filteredProjects.map(project => project.id)); // Select all
                    }
                  } else {
                    setShowAddModal(true);
                  }
                }}
              >
                {editMode ? (
                  <span className="text-sm md:text-base font-bold flex items-center justify-center w-6 h-6 md:w-8 md:h-8">
                    {language === 'zh' ? '全' : 'All'}
                  </span>
                ) : (
                  <Plus size={20} className="md:w-6 md:h-6" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black dark:border-t-white rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500 dark:text-red-400 font-bold">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {currentProjectsPage.map((project) => (
          <div 
            key={project.id} 
            className={`group relative cursor-pointer flex flex-col h-full transform-gpu ${project.category === Category.DEV ? 'bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300' : ''}`}
            onClick={() => {
              if (editMode) {
                // Toggle selection
                setSelectedProjects(prev => {
                  if (prev.includes(project.id)) {
                    return prev.filter(id => id !== project.id); // Deselect
                  } else {
                    return [...prev, project.id]; // Select
                  }
                });
              } else {
                // 调用 API 获取项目详情
                const fetchProjectDetail = async () => {
                  try {
                    const projectDetail = await ApiService.getProjectById(project.id, language);
                    if (projectDetail) {
                      setSelectedProject(projectDetail);
                    }
                  } catch (error) {
                    console.error('Error fetching project detail:', error);
                    // 出错时使用本地数据
                    setSelectedProject(project);
                  }
                };
                fetchProjectDetail();
              }
            }}
          >
            {/* Selection Circle - Only show in edit mode */}
            {editMode && (
              <button
                className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all duration-300 ${project.category === Category.DEV ? 'bg-white dark:bg-black' : 'bg-white dark:bg-gray-900'} shadow-md`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering card click
                  // Toggle selection
                  setSelectedProjects(prev => {
                    if (prev.includes(project.id)) {
                      return prev.filter(id => id !== project.id); // Deselect
                    } else {
                      return [...prev, project.id]; // Select
                    }
                  });
                }}
              >
                <div className={`w-4 h-4 rounded-full transition-all duration-300 ${selectedProjects.includes(project.id) ? 'bg-black dark:bg-white' : 'bg-transparent border-2 border-black dark:border-white'}`}></div>
              </button>
            )}

            
            {project.category === Category.DEV ? (
               // DEV CARD LAYOUT
               <div className="flex flex-col h-full">
                  <div 
                    className="mb-6 w-16 h-16 bg-white dark:bg-black rounded-2xl shadow-sm flex items-center justify-center text-black dark:text-white cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={(e) => {
                      if (editMode) {
                        e.stopPropagation(); // Prevent triggering card click only in edit mode
                        // 发送API请求获取项目详情
                        const fetchProjectDetail = async () => {
                          try {
                            const projectDetail = await ApiService.getProjectById(project.id, language);
                            if (projectDetail) {
                              // 将项目详情填充到编辑表单状态中
                              setEditFormData({
                                id: projectDetail.id,
                                title: projectDetail.title,
                                description: projectDetail.description,
                                images: projectDetail.gallery || [],
                                tags: projectDetail.tags || [],
                                thoughts: projectDetail.thoughts || '',
                                additionalInfo: projectDetail.additionalInfo || '',
                                githubUrl: projectDetail.githubUrl || '',
                                readme: projectDetail.readme || '',
                                externalLink: projectDetail.externalLink || '',
                                introduction: projectDetail.introduction || '',
                                category: projectDetail.category
                              });
                              setShowEditModal(true);
                            }
                          } catch (error) {
                            console.error('Error fetching project detail:', error);
                            // 出错时使用当前项目数据
                            setEditFormData({
                              id: project.id,
                              title: project.title,
                              description: project.description,
                              images: project.gallery || [],
                              tags: project.tags || [],
                              thoughts: project.thoughts || '',
                              additionalInfo: project.additionalInfo || '',
                              githubUrl: project.githubUrl || '',
                              readme: project.readme || '',
                              externalLink: project.externalLink || '',
                              introduction: project.introduction || '',
                              category: project.category
                            });
                            setShowEditModal(true);
                          }
                        };
                        fetchProjectDetail();
                      }
                      // In non-edit mode, allow event to bubble up to card
                    }}
                  >
                    {project.icon === 'message-circle' && <MessageCircle size={32} />}
                    {project.icon === 'id-card' && <IdCard size={32} />}
                    {project.icon === 'file-text' && <FileText size={32} />}
                    {project.icon === 'film' && <Film size={32} />}
                    {!project.icon && <Terminal size={32} />}
                  </div>
                  <div 
                    className="flex flex-col h-full"
                    onClick={(e) => {
                      if (editMode) {
                        e.stopPropagation(); // Prevent triggering card click only in edit mode
                        // 发送API请求获取项目详情
                        const fetchProjectDetail = async () => {
                          try {
                            const projectDetail = await ApiService.getProjectById(project.id, language);
                            if (projectDetail) {
                              // 将项目详情填充到编辑表单状态中
                              setEditFormData({
                                id: projectDetail.id,
                                title: projectDetail.title,
                                description: projectDetail.description,
                                images: projectDetail.gallery || [],
                                tags: projectDetail.tags || [],
                                thoughts: projectDetail.thoughts || '',
                                additionalInfo: projectDetail.additionalInfo || '',
                                githubUrl: projectDetail.githubUrl || '',
                                readme: projectDetail.readme || '',
                                externalLink: projectDetail.externalLink || '',
                                introduction: projectDetail.introduction || '',
                                category: projectDetail.category
                              });
                              setShowEditModal(true);
                            }
                          } catch (error) {
                            console.error('Error fetching project detail:', error);
                            // 出错时使用当前项目数据
                            setEditFormData({
                              id: project.id,
                              title: project.title,
                              description: project.description,
                              images: project.gallery || [],
                              tags: project.tags || [],
                              thoughts: project.thoughts || '',
                              additionalInfo: project.additionalInfo || '',
                              githubUrl: project.githubUrl || '',
                              readme: project.readme || '',
                              externalLink: project.externalLink || '',
                              introduction: project.introduction || '',
                              category: project.category
                            });
                            setShowEditModal(true);
                          }
                        };
                        fetchProjectDetail();
                      }
                      // In non-edit mode, allow event to bubble up to card
                    }}
                  >
                    <h3 className="text-2xl font-black text-black dark:text-white mb-3">
                      {project.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed line-clamp-3 mb-6">
                      {project.description}
                    </p>
                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 w-full flex justify-between items-center">
                       <span className="text-xs font-bold font-mono text-gray-400 uppercase tracking-wider">
                          {project.subtitle}
                       </span>
                       <div className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          <ArrowUpRight size={18} />
                       </div>
                    </div>
                  </div>
               </div>
            ) : (
               // STANDARD CARD LAYOUT
               <>
                  {/* Image container */}
                  <div className="w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 mb-6 overflow-hidden rounded-2xl relative shadow-none border border-transparent transition-all duration-500 group-hover:shadow-2xl dark:group-hover:shadow-none dark:group-hover:border-white/20 transform-gpu">
                    {project.image && !project.image.includes('picsum') ? (
                        <img 
                          src={project.image.includes(',') ? project.image.split(',')[0].trim() : project.image.trim()} 
                          alt={project.title} 
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform cursor-pointer"
                          onClick={(e) => {
                            if (editMode) {
                              e.stopPropagation(); // Prevent triggering card click only in edit mode
                              // 发送API请求获取项目详情
                              const fetchProjectDetail = async () => {
                                try {
                                  const projectDetail = await ApiService.getProjectById(project.id, language);
                                  if (projectDetail) {
                                    // 将项目详情填充到编辑表单状态中
                                    setEditFormData({
                                      id: projectDetail.id,
                                      title: projectDetail.title,
                                      description: projectDetail.description,
                                      images: projectDetail.gallery || [],
                                      tags: projectDetail.tags || [],
                                      thoughts: projectDetail.thoughts || '',
                                      additionalInfo: projectDetail.additionalInfo || '',
                                      githubUrl: projectDetail.githubUrl || '',
                                      readme: projectDetail.readme || '',
                                      externalLink: projectDetail.externalLink || '',
                                      introduction: projectDetail.introduction || '',
                                      category: projectDetail.category
                                    });
                                    setShowEditModal(true);
                                  }
                                } catch (error) {
                                  console.error('Error fetching project detail:', error);
                                  // 出错时使用当前项目数据
                                  setEditFormData({
                                    id: project.id,
                                    title: project.title,
                                    description: project.description,
                                    images: project.gallery || [],
                                    tags: project.tags || [],
                                    thoughts: project.thoughts || '',
                                    additionalInfo: project.additionalInfo || '',
                                    githubUrl: project.githubUrl || '',
                                    readme: project.readme || '',
                                    externalLink: project.externalLink || '',
                                    introduction: project.introduction || '',
                                    category: project.category
                                  });
                                  setShowEditModal(true);
                                }
                              };
                              fetchProjectDetail();
                            }
                            // In non-edit mode, allow event to bubble up to card
                          }}
                        />
                    ) : project.bilibiliId ? (
                        <div 
                          className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                          onClick={(e) => {
                            if (editMode) {
                              e.stopPropagation(); // Prevent triggering card click only in edit mode
                              // 发送API请求获取项目详情
                              const fetchProjectDetail = async () => {
                                try {
                                  const projectDetail = await ApiService.getProjectById(project.id, language);
                                  if (projectDetail) {
                                    // 将项目详情填充到编辑表单状态中
                                    setEditFormData({
                                      id: projectDetail.id,
                                      title: projectDetail.title,
                                      description: projectDetail.description,
                                      images: projectDetail.gallery || [],
                                      tags: projectDetail.tags || [],
                                      thoughts: projectDetail.thoughts || '',
                                      additionalInfo: projectDetail.additionalInfo || '',
                                      githubUrl: projectDetail.githubUrl || '',
                                      readme: projectDetail.readme || '',
                                      externalLink: projectDetail.externalLink || '',
                                      introduction: projectDetail.introduction || '',
                                      category: projectDetail.category
                                    });
                                    setShowEditModal(true);
                                  }
                                } catch (error) {
                                  console.error('Error fetching project detail:', error);
                                  // 出错时使用当前项目数据
                                  setEditFormData({
                                    id: project.id,
                                    title: project.title,
                                    description: project.description,
                                    images: project.gallery || [],
                                    tags: project.tags || [],
                                    thoughts: project.thoughts || '',
                                    additionalInfo: project.additionalInfo || '',
                                    githubUrl: project.githubUrl || '',
                                    readme: project.readme || '',
                                    externalLink: project.externalLink || '',
                                    introduction: project.introduction || '',
                                    category: project.category
                                  });
                                  setShowEditModal(true);
                                }
                              };
                              fetchProjectDetail();
                            }
                            // In non-edit mode, allow event to bubble up to card
                          }}
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-[#FF6699] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Video Preview</span>
                            </div>
                        </div>
                    ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 p-8 text-center cursor-pointer"
                          onClick={(e) => {
                            if (editMode) {
                              e.stopPropagation(); // Prevent triggering card click only in edit mode
                              // 发送API请求获取项目详情
                              const fetchProjectDetail = async () => {
                                try {
                                  const projectDetail = await ApiService.getProjectById(project.id, language);
                                  if (projectDetail) {
                                    // 将项目详情填充到编辑表单状态中
                                    setEditFormData({
                                      id: projectDetail.id,
                                      title: projectDetail.title,
                                      description: projectDetail.description,
                                      images: projectDetail.gallery || [],
                                      tags: projectDetail.tags || [],
                                      thoughts: projectDetail.thoughts || '',
                                      additionalInfo: projectDetail.additionalInfo || '',
                                      githubUrl: projectDetail.githubUrl || '',
                                      readme: projectDetail.readme || '',
                                      externalLink: projectDetail.externalLink || '',
                                      introduction: projectDetail.introduction || '',
                                      category: projectDetail.category
                                    });
                                    setShowEditModal(true);
                                  }
                                } catch (error) {
                                  console.error('Error fetching project detail:', error);
                                  // 出错时使用当前项目数据
                                  setEditFormData({
                                    id: project.id,
                                    title: project.title,
                                    description: project.description,
                                    images: project.gallery || [],
                                    tags: project.tags || [],
                                    thoughts: project.thoughts || '',
                                    additionalInfo: project.additionalInfo || '',
                                    githubUrl: project.githubUrl || '',
                                    readme: project.readme || '',
                                    externalLink: project.externalLink || '',
                                    introduction: project.introduction || '',
                                    category: project.category
                                  });
                                  setShowEditModal(true);
                                }
                              };
                              fetchProjectDetail();
                            }
                            // In non-edit mode, allow event to bubble up to card
                          }}
                        >
                            <div>
                                <h4 className={`${filter === 'All' ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'} font-black text-gray-400 dark:text-gray-600 mb-2 leading-tight`}>
                                    {project.title}<br/>
                                    {project.subtitle && <span className="text-lg md:text-xl font-normal opacity-70">{project.subtitle}</span>}
                                </h4>
                                <p className="text-xs font-mono text-gray-400 mt-4 uppercase tracking-widest border border-gray-300 dark:border-gray-700 rounded-full px-3 py-1 inline-block">
                                    {language === 'zh' ? '预览部署中...' : 'Preview Deploying...'}
                                </p>
                            </div>
                        </div>
                    )}
                    
                    <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white dark:bg-black dark:text-white px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-bold uppercase tracking-wider rounded-lg shadow-sm border border-transparent dark:border-white/10">
                      {CATEGORY_LABELS[language][project.category] || project.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex justify-between items-start border-b-2 border-gray-100 dark:border-gray-800 pb-6 group-hover:border-black dark:group-hover:border-white transition-colors duration-300 mt-auto">
                    <div className="pr-4 md:pr-8">
                        <h3 className={`${filter === 'All' ? 'text-xl md:text-2xl' : 'text-2xl md:text-4xl'} font-black text-black dark:text-white mb-2 md:mb-3 group-hover:text-gray-800 dark:group-hover:text-gray-200 leading-tight transition-colors`}>
                          {project.title}
                        </h3>
                      <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium transition-colors">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  {project.category !== Category.PHOTO && project.tags && project.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 md:gap-3">
                       {project.tags.map((tag, index) => (
                         <span key={index} className="text-[10px] md:text-xs font-bold font-mono text-gray-400 dark:text-gray-500 uppercase tracking-wider border border-gray-200 dark:border-gray-800 px-2 py-1 rounded-md">#{tag}</span>
                       ))}
                    </div>
                  )}
                  
                  {/* External Link for Other category */}
                  {project.category === Category.OTHER && project.externalLink && (
                    <div className="mt-4">
                      <a 
                        href={project.externalLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] md:text-xs font-bold font-mono text-blue-500 dark:text-blue-400 uppercase tracking-wider border border-blue-200 dark:border-blue-800 px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        ↗ {language === 'zh' ? '访问链接' : 'Visit Link'}
                      </a>
                    </div>
                  )}
               </>
            )}

          </div>
        ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-12 md:mt-16 pb-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`
              px-6 py-3 rounded-full font-bold transition-all duration-200
              ${currentPage === 1
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'bg-black dark:bg-white text-white dark:text-black hover:scale-105'}
            `}
          >
            {language === 'zh' ? '上一页' : 'Previous'}
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`
                  w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all duration-200
                  ${currentPage === page
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'}
                `}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`
              px-6 py-3 rounded-full font-bold transition-all duration-200
              ${currentPage === totalPages
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'bg-black dark:bg-white text-white dark:text-black hover:scale-105'}
            `}
          >
            {language === 'zh' ? '下一页' : 'Next'}
          </button>
        </div>

      {/* PROJECT DETAIL MODAL */}
      {isModalRendered && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
           {/* Lightbox Overlay */}
           {lightboxIndex !== null && (
             <div 
               className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 md:p-12 animate-[fadeIn_0.3s_ease-out_forwards]"
               onClick={() => setLightboxIndex(null)}
               onTouchStart={onTouchStart}
               onTouchMove={onTouchMove}
               onTouchEnd={onTouchEnd}
             >
                <div 
                  className="relative max-w-full max-h-full w-full h-full flex items-center justify-center animate-message-pop"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img 
                    src={currentGallery[lightboxIndex]} 
                    alt="Full View" 
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-lg select-none"
                    referrerPolicy="no-referrer"
                    draggable={false}
                  />
                  
                  {/* Close Button */}
                  <button 
                    className="absolute top-4 right-4 md:top-0 md:right-0 md:-mt-12 md:-mr-12 text-white/50 hover:text-white transition-colors p-2"
                    onClick={() => setLightboxIndex(null)}
                  >
                    <X size={32} />
                  </button>

                  {/* Navigation Buttons */}
                  {currentGallery.length > 1 && (
                    <>
                      <button 
                        className="absolute left-2 md:-left-16 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 bg-black/20 hover:bg-black/40 rounded-full md:bg-transparent"
                        onClick={handlePrev}
                      >
                        <ChevronLeft size={48} />
                      </button>
                      <button 
                        className="absolute right-2 md:-right-16 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 bg-black/20 hover:bg-black/40 rounded-full md:bg-transparent"
                        onClick={handleNext}
                      >
                        <ChevronRight size={48} />
                      </button>
                    </>
                  )}
                  
                  {/* Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 font-mono text-sm bg-black/50 px-3 py-1 rounded-full">
                    {lightboxIndex + 1} / {currentGallery.length}
                  </div>
                </div>
             </div>
           )}

           {/* Backdrop - Use solid color opacity instead of blur for performance */}
           <div 
             className={`absolute inset-0 bg-black/80 ${selectedProject ? 'animate-[fadeIn_0.3s_ease-out_forwards]' : 'animate-fade-out'}`}
             onClick={() => setSelectedProject(null)}
           ></div>

           {/* Modal Content - Removed backdrop-blur-2xl to fix lag */}
           <div className={`
             relative w-full max-w-5xl max-h-[90vh]
             bg-white dark:bg-gray-900 
             rounded-[2rem] shadow-2xl border border-white/20 dark:border-white/10
             flex flex-col overflow-hidden
             ${selectedProject ? 'animate-message-pop' : 'animate-message-pop-out'}
           `}>
             {/* Inner scroll container with proper scrollbar containment */}
             <div className="flex-1 overflow-y-auto no-scrollbar">
             
             {displayProject && (
               <>
                 {/* Close Button */}
                 <button 
                   onClick={() => setSelectedProject(null)}
                   className="absolute top-4 right-4 md:top-6 md:right-6 z-10 p-2 rounded-full bg-white/50 dark:bg-black/50 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                 >
                   <X size={24} className="text-black dark:text-white" />
                 </button>

                 {(() => {
                    const gallery = displayProject.gallery || PHOTOGRAPHY_GALLERY[displayProject.id] || [];
                    const hasSingleImage = gallery.length === 1;
                    const hasMultipleImages = gallery.length > 1;
                    const isPhotoCategory = displayProject.category === Category.PHOTO;
                    const isDevCategory = displayProject.category === Category.DEV;
                    const isOtherCategory = displayProject.category === Category.OTHER;
                    
                    // Check if we should use the single image layout
                    const useSingleImageLayout = hasSingleImage && (isPhotoCategory || isDevCategory || isOtherCategory);
                    // Check if we should use the grid layout
                    const useGridLayout = hasMultipleImages && (isPhotoCategory || isDevCategory || isOtherCategory);
                    
                    if (useSingleImageLayout) {
                        // Single image layout for all categories when only one image
                        return (
                            <>
                                {/* Hero Image */}
                                <div className={`
                                    w-full bg-gray-200 dark:bg-gray-800 relative group-modal-media shrink-0
                                    h-[30vh] md:h-[50vh]
                                `}>
                                    <img 
                                        src={gallery[0]} 
                                        alt={displayProject.title} 
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover cursor-zoom-in"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setLightboxIndex(0);
                                        }}
                                    />
                                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                                </div>
                                
                                {/* Content based on category */}
                                {isPhotoCategory ? (
                                    <div className="p-6 md:p-12 flex flex-col min-h-full">
                                        {/* Detailed Info Section - Similar to videography layout */}
                                        <div className="w-full">
                                            <div className="mb-8 md:mb-12">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold uppercase rounded-md">
                                                        静态摄影
                                                    </span>
                                                    <span className="text-gray-500 font-mono text-sm uppercase font-bold tracking-widest">{displayProject.subtitle}</span>
                                                </div>
                                                <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white mb-6 leading-tight">
                                                    {displayProject.title}
                                                </h2>
                                                <p className="text-2xl md:text-3xl font-medium text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
                                                    {displayProject.description}
                                                </p>
                                            </div>

                                            <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-700 mb-8 md:mb-12"></div>

                                            {/* Horizontal Info Sections */}
                                            <div className="flex flex-col md:flex-row gap-8 md:gap-12 w-full">
                                                {/* Section 1: 思路&感受 */}
                                                <div className="flex-1 space-y-6">
                                                    <h3 className="text-2xl font-black uppercase tracking-wide text-black dark:text-white border-l-4 border-black dark:border-white pl-6">
                                                        {language === 'zh' ? '思路&感受' : 'Thoughts & Feelings'}
                                                    </h3>
                                                    <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                                                        {displayProject.thoughts || '通过镜头捕捉生活中的美好瞬间，记录下那些转瞬即逝的情感与故事。每一张照片都承载着独特的视角和深刻的感悟，是对生活的致敬与表达。'}
                                                    </p>
                                                </div>

                                                {/* Section 2: 补充 */}
                                                <div className="flex-1 space-y-6">
                                                    <h3 className="text-2xl font-black uppercase tracking-wide text-black dark:text-white border-l-4 border-black dark:border-white pl-6">
                                                        {language === 'zh' ? '补充' : 'Additional Info'}
                                                    </h3>
                                                    <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                                                        {displayProject.additionalInfo || '这里是补充信息，可以包含获奖情况、分工与职责等内容。'}
                                                    </p>
                                                </div>

                                                {/* Section 3: TAGS */}
                                                <div className="flex-1 space-y-6">
                                                    <h3 className="text-2xl font-black uppercase tracking-wide text-black dark:text-white border-l-4 border-black dark:border-white pl-6">
                                                        {language === 'zh' ? 'TAGS' : 'Tags'}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-3">
                                                        {displayProject.tags && displayProject.tags.length > 0 ? (
                                                            displayProject.tags.map((tag, i) => (
                                                                <span key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-sm font-bold rounded-md">
                                                                    {tag}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            ['摄影', '艺术', '创作'].map((tag, i) => (
                                                                <span key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-sm font-bold rounded-md">
                                                                    {tag}
                                                                </span>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Default layout for DEV and OTHER categories
                                    <div className="p-6 md:p-12">
                                        {/* Header */}
                                        <div className="mb-8 md:mb-12">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold uppercase rounded-md">
                                                    {CATEGORY_LABELS[language][displayProject.category] || displayProject.category}
                                                </span>
                                                <span className="text-gray-500 font-mono text-sm uppercase font-bold tracking-widest">{displayProject.subtitle}</span>
                                            </div>
                                            <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white mb-6 leading-tight">
                                                {displayProject.title}
                                            </h2>
                                            <p className="text-2xl md:text-3xl font-medium text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
                                                {displayProject.description}
                                            </p>
                                        </div>

                                        <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-700 mb-8 md:mb-12"></div>

                                        {/* Grid Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
                                            
                                            {/* Left Col: Concept - Thinner Line */}
                                            {(displayProject.thoughts || displayProject.additionalInfo) && (
                                                <div className="space-y-8">
                                                    <h3 className="text-2xl font-black uppercase tracking-wide text-black dark:text-white border-l-4 border-black dark:border-white pl-6">
                                                        {language === 'zh' ? '设计意图 / 创意陈述' : 'Concept / Statement'}
                                                    </h3>
                                                    <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                                                        {displayProject.thoughts || displayProject.additionalInfo || '项目描述'}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Right Col: Details */}
                                            <div className="space-y-10">
                                                {/* Awards - Aligned Star */}
                                                {displayProject.awards && displayProject.awards.length > 0 && (
                                                    <div className="space-y-4">
                                                        <h4 className="text-base font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                                                            {language === 'zh' ? '获奖情况' : 'Awards & Recognition'}
                                                        </h4>
                                                        <ul className="space-y-3">
                                                            {displayProject.awards.map((award, i) => {
                                                                const isNone = award === "暂无获奖" || award === "无" || award === "None";
                                                                return (
                                                                    <li key={i} className={`flex items-baseline font-bold text-xl ${isNone ? 'text-gray-400 dark:text-gray-500' : 'text-black dark:text-white'}`}>
                                                                        <span className={`mr-3 text-lg flex-shrink-0 ${isNone ? 'text-gray-300 dark:text-gray-600' : 'text-yellow-500'}`}>★</span> 
                                                                        <span>{award}</span>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* ReadMe, Tags, GitHub Links - Flex Row */}
                                                <div className="flex flex-row gap-8 items-start flex-wrap">
                                                    {/* ReadMe or Introduction based on category */}
                                                    <div className="space-y-4 flex-1 min-w-[200px]">
                                                        <h4 className="text-base font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                                                            {displayProject.category === Category.OTHER ? 
                                                              (language === 'zh' ? '介绍' : 'Introduction') : 
                                                              (language === 'zh' ? 'ReadMe' : 'ReadMe')}
                                                        </h4>
                                                        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                                            {displayProject.category === Category.OTHER ? 
                                                              (displayProject.introduction || displayProject.description) : 
                                                              (displayProject.readme || displayProject.role || '项目说明')}
                                                        </p>
                                                    </div>

                                                    {/* Tags */}
                                                    <div className="space-y-4 flex-1 min-w-[200px]">
                                                        <h4 className="text-base font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Tags</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {displayProject.tags.map(tag => (
                                                                <span key={tag} className="text-xs font-bold font-mono text-gray-500 border border-gray-300 dark:border-gray-700 px-3 py-1.5 rounded-lg">{tag}</span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Links */}
                                                    <div className="space-y-4 flex-1 min-w-[200px]">
                                                        <h4 className="text-base font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                                                            {language === 'zh' ? '链接' : 'Links'}
                                                        </h4>
                                                        <div className="flex flex-wrap gap-4">
                                                            {displayProject.githubUrl ? (
                                                                <a href={displayProject.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                                                    <Github size={18} />
                                                                    <span className="font-bold underline decoration-2 underline-offset-4 text-sm">GitHub</span>
                                                                </a>
                                                            ) : null}
                                                            {displayProject.externalLink ? (
                                                                <a href={displayProject.externalLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                                                    <ExternalLink size={18} />
                                                                    <span className="font-bold underline decoration-2 underline-offset-4 text-sm">{language === 'zh' ? '外部链接' : 'External Link'}</span>
                                                                </a>
                                                            ) : null}
                                                            {!displayProject.githubUrl && !displayProject.externalLink && (
                                                                <p className="text-gray-400 dark:text-gray-500 text-sm">{language === 'zh' ? '暂无链接' : 'No links available'}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                )}
                            </>
                        );
                    } else if (useGridLayout) {
                        // Grid layout for all categories when multiple images (max 9)
                        return (
                            <div className="p-6 md:p-12 flex flex-col min-h-full">
                                {/* Image Grid - Show only 9 images */}
                                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4 mb-12">
                                    {gallery.slice(0, 9).map((item, idx) => (
                                        <GalleryImage 
                                            key={idx}
                                            src={item}
                                            alt={`${displayProject.title} ${idx + 1}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setLightboxIndex(idx);
                                            }}
                                        />
                                    ))}
                                </div>
                                
                                {/* Content based on category */}
                                {isPhotoCategory ? (
                                    <div className="w-full">
                                        <div className="mb-8 md:mb-12">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold uppercase rounded-md">
                                                    静态摄影
                                                </span>
                                                <span className="text-gray-500 font-mono text-sm uppercase font-bold tracking-widest">{displayProject.subtitle}</span>
                                            </div>
                                            <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white mb-6 leading-tight">
                                                {displayProject.title}
                                            </h2>
                                            <p className="text-2xl md:text-3xl font-medium text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
                                                {displayProject.description}
                                            </p>
                                        </div>

                                        <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-700 mb-8 md:mb-12"></div>

                                        {/* Horizontal Info Sections */}
                                        <div className="flex flex-col md:flex-row gap-8 md:gap-12 w-full">
                                            {/* Section 1: 思路&感受 */}
                                            <div className="flex-1 space-y-6">
                                                <h3 className="text-2xl font-black uppercase tracking-wide text-black dark:text-white border-l-4 border-black dark:border-white pl-6">
                                                    {language === 'zh' ? '思路&感受' : 'Thoughts & Feelings'}
                                                </h3>
                                                <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                                                    {displayProject.thoughts || '通过镜头捕捉生活中的美好瞬间，记录下那些转瞬即逝的情感与故事。每一张照片都承载着独特的视角和深刻的感悟，是对生活的致敬与表达。'}
                                                </p>
                                            </div>

                                            {/* Section 2: 补充 */}
                                            <div className="flex-1 space-y-6">
                                                <h3 className="text-2xl font-black uppercase tracking-wide text-black dark:text-white border-l-4 border-black dark:border-white pl-6">
                                                    {language === 'zh' ? '补充' : 'Additional Info'}
                                                </h3>
                                                <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                                                    {displayProject.additionalInfo || '这里是补充信息，可以包含获奖情况、分工与职责等内容。'}
                                                </p>
                                            </div>

                                            {/* Section 3: TAGS */}
                                            <div className="flex-1 space-y-6">
                                                <h3 className="text-2xl font-black uppercase tracking-wide text-black dark:text-white border-l-4 border-black dark:border-white pl-6">
                                                    {language === 'zh' ? 'TAGS' : 'Tags'}
                                                </h3>
                                                <div className="flex flex-wrap gap-3">
                                                    {displayProject.tags && displayProject.tags.length > 0 ? (
                                                        displayProject.tags.map((tag, i) => (
                                                            <span key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-sm font-bold rounded-md">
                                                                {tag}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        ['摄影', '艺术', '创作'].map((tag, i) => (
                                                            <span key={i} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-sm font-bold rounded-md">
                                                                {tag}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full">
                                        <div className="mb-8 md:mb-12">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold uppercase rounded-md">
                                                    {CATEGORY_LABELS[language][displayProject.category] || displayProject.category}
                                                </span>
                                                <span className="text-gray-500 font-mono text-sm uppercase font-bold tracking-widest">{displayProject.subtitle}</span>
                                            </div>
                                            <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white mb-6 leading-tight">
                                                {displayProject.title}
                                            </h2>
                                            <p className="text-2xl md:text-3xl font-medium text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
                                                {displayProject.description}
                                            </p>
                                        </div>

                                        <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-700 mb-8 md:mb-12"></div>

                                        {/* Grid Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
                                            
                                            {/* Left Col: Concept - Thinner Line */}
                                            {(displayProject.thoughts || displayProject.additionalInfo) && (
                                                <div className="space-y-8">
                                                    <h3 className="text-2xl font-black uppercase tracking-wide text-black dark:text-white border-l-4 border-black dark:border-white pl-6">
                                                        {language === 'zh' ? '设计意图 / 创意陈述' : 'Concept / Statement'}
                                                    </h3>
                                                    <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                                                        {displayProject.thoughts || displayProject.additionalInfo || '项目描述'}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Right Col: Details */}
                                            <div className="space-y-10">
                                                {/* Awards - Aligned Star */}
                                                {displayProject.awards && displayProject.awards.length > 0 && (
                                                    <div className="space-y-4">
                                                        <h4 className="text-base font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                                                            {language === 'zh' ? '获奖情况' : 'Awards & Recognition'}
                                                        </h4>
                                                        <ul className="space-y-3">
                                                            {displayProject.awards.map((award, i) => {
                                                                const isNone = award === "暂无获奖" || award === "无" || award === "None";
                                                                return (
                                                                    <li key={i} className={`flex items-baseline font-bold text-xl ${isNone ? 'text-gray-400 dark:text-gray-500' : 'text-black dark:text-white'}`}>
                                                                        <span className={`mr-3 text-lg flex-shrink-0 ${isNone ? 'text-gray-300 dark:text-gray-600' : 'text-yellow-500'}`}>★</span> 
                                                                        <span>{award}</span>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* ReadMe, Tags, GitHub Links - Flex Row */}
                                                <div className="flex flex-row gap-8 items-start flex-wrap">
                                                    {/* ReadMe or Introduction based on category */}
                                                    <div className="space-y-4 flex-1 min-w-[200px]">
                                                        <h4 className="text-base font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                                                            {displayProject.category === Category.OTHER ? 
                                                              (language === 'zh' ? '介绍' : 'Introduction') : 
                                                              (language === 'zh' ? 'ReadMe' : 'ReadMe')}
                                                        </h4>
                                                        <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                                            {displayProject.category === Category.OTHER ? 
                                                              (displayProject.introduction || displayProject.description) : 
                                                              (displayProject.readme || displayProject.role || '项目说明')}
                                                        </p>
                                                    </div>

                                                    {/* Tags */}
                                                    <div className="space-y-4 flex-1 min-w-[200px]">
                                                        <h4 className="text-base font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Tags</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {displayProject.tags.map(tag => (
                                                                <span key={tag} className="text-xs font-bold font-mono text-gray-500 border border-gray-300 dark:border-gray-700 px-3 py-1.5 rounded-lg">{tag}</span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Links */}
                                                    <div className="space-y-4 flex-1 min-w-[200px]">
                                                        <h4 className="text-base font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                                                            {language === 'zh' ? '链接' : 'Links'}
                                                        </h4>
                                                        <div className="flex flex-wrap gap-4">
                                                            {displayProject.githubUrl ? (
                                                                <a href={displayProject.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                                                    <Github size={18} />
                                                                    <span className="font-bold underline decoration-2 underline-offset-4 text-sm">GitHub</span>
                                                                </a>
                                                            ) : null}
                                                            {displayProject.externalLink ? (
                                                                <a href={displayProject.externalLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                                                    <ExternalLink size={18} />
                                                                    <span className="font-bold underline decoration-2 underline-offset-4 text-sm">{language === 'zh' ? '外部链接' : 'External Link'}</span>
                                                                </a>
                                                            ) : null}
                                                            {!displayProject.githubUrl && !displayProject.externalLink && (
                                                                <p className="text-gray-400 dark:text-gray-500 text-sm">{language === 'zh' ? '暂无链接' : 'No links available'}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                )}
                            </div>
                        );
                    } else {
                        // Default layout for categories without gallery or with other media types
                        return (
                            <>
                                {/* Hero Media (Video, Bilibili, Figma or Image) */}
                                <div className={`
                                    w-full bg-gray-200 dark:bg-gray-800 relative group-modal-media shrink-0
                                    ${(displayProject.figmaUrl || displayProject.websiteUrl) ? 'h-[60vh] md:h-[80vh]' : 
                                      (displayProject.videoUrl || displayProject.bilibiliId) ? 'aspect-video' : 
                                      'h-[30vh] md:h-[50vh]'}
                                `}>
                                    {displayProject.videoUrl ? (
                                        <video 
                                            src={displayProject.videoUrl} 
                                            controls 
                                            className="w-full h-full object-contain bg-black"
                                            poster={displayProject.image}
                                        />
                                    ) : displayProject.bilibiliId ? (
                                        // Bilibili Player with Click-to-Load Optimization
                                        <div className="w-full h-full bg-black relative group">
                                            <iframe
                                                src={`https://player.bilibili.com/player.html?bvid=${displayProject.bilibiliId}&page=1&high_quality=1&danmaku=0&autoplay=0`}
                                                className="w-full h-full relative z-10"
                                                scrolling="no"
                                                frameBorder="0"
                                                allowFullScreen
                                                sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts allow-presentation"
                                            ></iframe>
                                        </div>
                                    ) : displayProject.figmaUrl ? (
                                        <iframe
                                            src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(displayProject.figmaUrl)}`}
                                            className="w-full h-full border-none"
                                            allowFullScreen
                                        ></iframe>
                                    ) : displayProject.websiteUrl ? (
                                        <iframe
                                            src={displayProject.websiteUrl}
                                            className="w-full h-full border-none bg-white"
                                            title={displayProject.title}
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <>
                                            {displayProject.image && !displayProject.image.includes('picsum') ? (
                                                <img 
                                                    src={displayProject.image} 
                                                    alt={displayProject.title} 
                                                    referrerPolicy="no-referrer"
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-800">
                                                    <div className="text-center">
                                                        <h2 className="text-4xl font-black text-black/20 dark:text-white/20 mb-2">{displayProject.title}</h2>
                                                        <p className="text-xl font-bold text-black/20 dark:text-white/20 uppercase tracking-widest">
                                                            {language === 'zh' ? '预览部署中...' : 'Preview Deploying...'}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                                        </>
                                    )}
                                </div>

                                <div className="p-6 md:p-12">
                                    {/* Header */}
                                    <div className="mb-8 md:mb-12">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-sm font-bold uppercase rounded-md">
                                                {CATEGORY_LABELS[language][displayProject.category] || displayProject.category}
                                            </span>
                                            <span className="text-gray-500 font-mono text-sm uppercase font-bold tracking-widest">{displayProject.subtitle}</span>
                                        </div>
                                        <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white mb-6 leading-tight">
                                            {displayProject.title}
                                        </h2>
                                        <p className="text-2xl md:text-3xl font-medium text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
                                            {displayProject.description}
                                        </p>
                                    </div>

                                    <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-700 mb-8 md:mb-12"></div>

                                    {/* Grid Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
                                        
                                        {/* Left Col: Concept - Thinner Line */}
                                        {(displayProject.thoughts || displayProject.additionalInfo) && (
                                            <div className="space-y-8">
                                                <h3 className="text-2xl font-black uppercase tracking-wide text-black dark:text-white border-l-4 border-black dark:border-white pl-6">
                                                    {language === 'zh' ? '设计意图 / 创意陈述' : 'Concept / Statement'}
                                                </h3>
                                                <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-300">
                                                    {displayProject.thoughts || displayProject.additionalInfo || '项目描述'}
                                                </p>
                                            </div>
                                        )}

                                        {/* Right Col: Details */}
                                        <div className="space-y-10">
                                            {/* Awards - Aligned Star */}
                                            {displayProject.awards && displayProject.awards.length > 0 && (
                                                <div className="space-y-4">
                                                    <h4 className="text-base font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                                                        {language === 'zh' ? '获奖情况' : 'Awards & Recognition'}
                                                    </h4>
                                                    <ul className="space-y-3">
                                                        {displayProject.awards.map((award, i) => {
                                                            const isNone = award === "暂无获奖" || award === "无" || award === "None";
                                                            return (
                                                                <li key={i} className={`flex items-baseline font-bold text-xl ${isNone ? 'text-gray-400 dark:text-gray-500' : 'text-black dark:text-white'}`}>
                                                                    <span className={`mr-3 text-lg flex-shrink-0 ${isNone ? 'text-gray-300 dark:text-gray-600' : 'text-yellow-500'}`}>★</span> 
                                                                    <span>{award}</span>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* ReadMe, Tags, GitHub Links - Flex Row */}
                                            <div className="flex flex-row gap-8 items-start flex-wrap">
                                                {/* ReadMe or Introduction based on category */}
                                                <div className="space-y-4 flex-1 min-w-[200px]">
                                                    <h4 className="text-base font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                                                        {displayProject.category === Category.OTHER ? 
                                                          (language === 'zh' ? '介绍' : 'Introduction') : 
                                                          (language === 'zh' ? 'ReadMe' : 'ReadMe')}
                                                    </h4>
                                                    <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                                                        {displayProject.category === Category.OTHER ? 
                                                          (displayProject.introduction || displayProject.description) : 
                                                          (displayProject.readme || displayProject.role || '项目说明')}
                                                    </p>
                                                </div>

                                                {/* Tags */}
                                                <div className="space-y-4 flex-1 min-w-[200px]">
                                                    <h4 className="text-base font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Tags</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {displayProject.tags.map(tag => (
                                                            <span key={tag} className="text-xs font-bold font-mono text-gray-500 border border-gray-300 dark:border-gray-700 px-3 py-1.5 rounded-lg">{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Links */}
                                                <div className="space-y-4 flex-1 min-w-[200px]">
                                                    <h4 className="text-base font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                                                        {language === 'zh' ? '链接' : 'Links'}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-4">
                                                        {displayProject.githubUrl ? (
                                                            <a href={displayProject.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                                                <Github size={18} />
                                                                <span className="font-bold underline decoration-2 underline-offset-4 text-sm">GitHub</span>
                                                            </a>
                                                        ) : null}
                                                        {displayProject.externalLink ? (
                                                            <a href={displayProject.externalLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                                                <ExternalLink size={18} />
                                                                <span className="font-bold underline decoration-2 underline-offset-4 text-sm">{language === 'zh' ? '外部链接' : 'External Link'}</span>
                                                            </a>
                                                        ) : null}
                                                        {!displayProject.githubUrl && !displayProject.externalLink && (
                                                            <p className="text-gray-400 dark:text-gray-500 text-sm">{language === 'zh' ? '暂无链接' : 'No links available'}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                    </div>

                                </div>
                            </>
                        );
                    }
                 })()}
               </>
             )}
             </div>
           </div>
        </div>,
        document.body
      )}

      {/* ADD PROJECT MODAL */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/80 animate-[fadeIn_0.3s_ease-out_forwards]"
             onClick={() => setShowAddModal(false)}
           ></div>

           {/* Modal Content */}
           <div className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-white/20 dark:border-white/10 animate-message-pop overflow-hidden flex flex-col">
             {/* Inner scroll container with proper scrollbar containment */}
             <div className="flex-1 overflow-y-auto no-scrollbar">
             {/* Close Button */}
             <button 
               onClick={() => setShowAddModal(false)}
               className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/50 dark:bg-black/50 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
             >
               <X size={24} className="text-black dark:text-white" />
             </button>

             {/* Modal Header */}
             <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-800">
               <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white mb-2">
                 {language === 'zh' ? '新增作品' : 'Add New Project'}
               </h2>
               <p className="text-gray-500 dark:text-gray-400">
                 {language === 'zh' ? '选择要新增的板块并填写相关信息' : 'Select category and fill in the required information'}
               </p>
             </div>

             {/* Modal Body */}
             <div className="p-6 md:p-8">
               {/* Form Error */}
               {formError && (
                 <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                   {formError}
                 </div>
               )}
               
               {/* Category Selection */}
               <div className="mb-8">
                 <h3 className="text-xl font-bold text-black dark:text-white mb-4">
                   {language === 'zh' ? '选择板块' : 'Select Category'}
                 </h3>
                 <div className="flex flex-wrap gap-3">
                   <button
                     type="button"
                     onClick={() => setSelectedCategory(Category.PHOTO)}
                     className={`px-4 py-2 rounded-lg font-bold transition-colors ${selectedCategory === Category.PHOTO ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-black dark:bg-gray-800 dark:text-white'}`}
                   >
                     {language === 'zh' ? '静态摄影' : 'Photography'}
                   </button>
                   <button
                     type="button"
                     onClick={() => setSelectedCategory(Category.DEV)}
                     className={`px-4 py-2 rounded-lg font-bold transition-colors ${selectedCategory === Category.DEV ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-black dark:bg-gray-800 dark:text-white'}`}
                   >
                     {language === 'zh' ? '软件开发' : 'Development'}
                   </button>
                   <button
                     type="button"
                     onClick={() => setSelectedCategory(Category.OTHER)}
                     className={`px-4 py-2 rounded-lg font-bold transition-colors ${selectedCategory === Category.OTHER ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-black dark:bg-gray-800 dark:text-white'}`}
                   >
                     {language === 'zh' ? '其他' : 'Other'}
                   </button>
                 </div>
               </div>

               {/* Form Fields */}
               <form onSubmit={handleAddFormSubmit} className="space-y-6">
                 {/* Title */}
                 <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                     {language === 'zh' ? '标题' : 'Title'}
                   </label>
                   <input
                     type="text"
                     name="title"
                     value={addFormData.title}
                     onChange={handleAddFormChange}
                     className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                     placeholder={language === 'zh' ? '输入作品标题' : 'Enter project title'}
                     required
                   />
                 </div>

                 {/* Description */}
                 <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                     {language === 'zh' ? '描述' : 'Description'}
                   </label>
                   <textarea
                     name="description"
                     value={addFormData.description}
                     onChange={handleAddFormChange}
                     className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                     rows={3}
                     placeholder={language === 'zh' ? '输入作品描述' : 'Enter project description'}
                     required
                   ></textarea>
                 </div>

                 {/* Images */}
                 <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                     {language === 'zh' ? '图片' : 'Images'}
                   </label>
                   <div className="grid grid-cols-3 gap-4">
                     {/* Display uploaded images */}
                     {addFormData.images.map((imageUrl, index) => (
                       <div key={index} className="aspect-square relative">
                         <img
                           src={imageUrl}
                           alt={`Uploaded Image ${index + 1}`}
                           className="w-full h-full object-cover rounded-lg"
                         />
                         <button
                           type="button"
                           onClick={() => removeImage(index)}
                           className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                         >
                           <X size={16} />
                         </button>
                       </div>
                     ))}
                     
                     {/* Add new image button */}
                     <div
                       className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                       onClick={(e) => {
                         const input = e.currentTarget.querySelector('input[type="file"]');
                         if (input) {
                           input.click();
                         }
                       }}
                     >
                       <input
                         type="file"
                         accept="image/*"
                         multiple
                         className="hidden"
                         onChange={(e) => {
                           const files = Array.from(e.target.files || []);
                           if (files.length > 0) {
                             handleMultipleImageUpload(files);
                           }
                         }}
                       />
                       <Plus size={32} className="text-gray-400 dark:text-gray-500" />
                     </div>
                   </div>
                 </div>

                 {/* Tags - Common for all categories */}
                 <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                     {language === 'zh' ? '标签' : 'Tags'}
                   </label>
                   <div className="flex flex-wrap gap-2 mb-3">
                     {addFormData.tags.map((tag, index) => (
                       <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-full text-sm font-medium">
                         {tag}
                         <button
                           type="button"
                           onClick={() => {
                             setAddFormData(prev => ({
                               ...prev,
                               tags: prev.tags.filter((_, i) => i !== index)
                             }));
                           }}
                           className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                         >
                           <X size={14} />
                         </button>
                       </span>
                     ))}
                   </div>
                   <div className="flex gap-2">
                     <input
                       type="text"
                       value={tagInput}
                       onChange={(e) => setTagInput(e.target.value)}
                       onKeyPress={(e) => {
                         if (e.key === 'Enter' && tagInput.trim()) {
                           e.preventDefault();
                           setAddFormData(prev => ({
                             ...prev,
                             tags: [...prev.tags, tagInput.trim()]
                           }));
                           setTagInput('');
                         }
                       }}
                       className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                       placeholder={language === 'zh' ? '输入标签' : 'Enter tag'}
                     />
                     <button
                       type="button"
                       onClick={() => {
                         if (tagInput.trim()) {
                           setAddFormData(prev => ({
                             ...prev,
                             tags: [...prev.tags, tagInput.trim()]
                           }));
                           setTagInput('');
                         }
                       }}
                       disabled={!tagInput.trim()}
                       className="px-4 py-3 rounded-lg font-bold bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {language === 'zh' ? '确定' : 'Add'}
                     </button>
                   </div>
                 </div>

                 {/* Category-specific fields would go here */}
                 {selectedCategory === Category.PHOTO && (
                   <div className="space-y-4">
                     <h4 className="text-lg font-bold text-black dark:text-white">
                       {language === 'zh' ? '摄影特有信息' : 'Photography Specific'}
                     </h4>
                     <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                         {language === 'zh' ? '思路&感受' : 'Thoughts & Feelings'}
                       </label>
                       <textarea
                         name="thoughts"
                         value={addFormData.thoughts}
                         onChange={handleAddFormChange}
                         className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                         rows={3}
                         placeholder={language === 'zh' ? '输入创作思路和感受' : 'Enter creative thoughts and feelings'}
                       ></textarea>
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                         {language === 'zh' ? '补充' : 'Additional Info'}
                       </label>
                       <textarea
                         name="additionalInfo"
                         value={addFormData.additionalInfo}
                         onChange={handleAddFormChange}
                         className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                         rows={3}
                         placeholder={language === 'zh' ? '输入补充信息，如获奖情况、分工与职责等' : 'Enter additional info, such as awards, roles, etc.'}
                       ></textarea>
                     </div>
                   </div>
                 )}

                 {selectedCategory === Category.DEV && (
                   <div className="space-y-4">
                     <h4 className="text-lg font-bold text-black dark:text-white">
                       {language === 'zh' ? '开发特有信息' : 'Development Specific'}
                     </h4>
                     <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                         {language === 'zh' ? 'GitHub链接' : 'GitHub URL'}
                       </label>
                       <input
                         type="url"
                         name="githubUrl"
                         value={addFormData.githubUrl}
                         onChange={handleAddFormChange}
                         className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                         placeholder="https://github.com/username/repo"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                         {language === 'zh' ? '项目说明文档' : 'ReadMe'}
                       </label>
                       <textarea
                         name="readme"
                         value={addFormData.readme}
                         onChange={handleAddFormChange}
                         className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                         rows={3}
                         placeholder={language === 'zh' ? '输入项目说明文档' : 'Enter project readme'}
                       ></textarea>
                     </div>
                   </div>
                 )}
                 
                 {selectedCategory === Category.OTHER && (
                   <div className="space-y-4">
                     <h4 className="text-lg font-bold text-black dark:text-white">
                       {language === 'zh' ? '其他特有信息' : 'Other Specific'}
                     </h4>
                     <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                         {language === 'zh' ? '网址' : 'URL'}
                       </label>
                       <input
                         type="url"
                         name="externalLink"
                         value={addFormData.externalLink}
                         onChange={handleAddFormChange}
                         className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                         placeholder="https://example.com"
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                         {language === 'zh' ? '项目介绍' : 'Introduction'}
                       </label>
                       <textarea
                         name="introduction"
                         value={addFormData.introduction}
                         onChange={handleAddFormChange}
                         className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                         rows={3}
                         placeholder={language === 'zh' ? '输入项目介绍' : 'Enter project introduction'}
                       ></textarea>
                     </div>
                   </div>
                 )}
               </form>
             </div>

             {/* Modal Footer */}
             <div className="p-6 md:p-8 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-4">
               <button
                 onClick={() => setShowAddModal(false)}
                 className="px-6 py-3 rounded-lg font-bold bg-gray-100 text-black dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
               >
                 {language === 'zh' ? '取消' : 'Cancel'}
               </button>
               <button
                 onClick={handleAddFormSubmit}
                 disabled={formLoading}
                 className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                   formLoading
                     ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                     : 'bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100'
                 }`}
               >
                 {formLoading ? (language === 'zh' ? '保存中...' : 'Saving...') : (language === 'zh' ? '保存' : 'Save')}
               </button>
             </div>
             </div>
           </div>
        </div>,
        document.body
      )}

      {/* EDIT PROJECT MODAL */}
      {showEditModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/80 animate-[fadeIn_0.3s_ease-out_forwards]"
             onClick={() => setShowEditModal(false)}
           ></div>

           {/* Modal Content */}
           <div className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-white/20 dark:border-white/10 animate-message-pop overflow-hidden flex flex-col">
             {/* Inner scroll container */}
             <div className="flex-1 overflow-y-auto no-scrollbar">
             {/* Close Button */}
             <button 
               onClick={() => setShowEditModal(false)}
               className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/50 dark:bg-black/50 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
             >
               <X size={24} className="text-black dark:text-white" />
             </button>

             {/* Modal Header */}
             <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-800">
               <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white mb-2">
                 {language === 'zh' ? '编辑作品' : 'Edit Project'}
               </h2>
               <p className="text-gray-500 dark:text-gray-400">
                 {language === 'zh' ? '修改作品信息并保存' : 'Modify project information and save'}
               </p>
             </div>

             {/* Modal Body */}
             <div className="p-6 md:p-8">
               {/* Form Error */}
               {formError && (
                 <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                   {formError}
                 </div>
               )}
               
               {/* Form Fields */}
               <form onSubmit={handleEditFormSubmit} className="space-y-6">
                 {/* Title */}
                 <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                     {language === 'zh' ? '标题' : 'Title'}
                   </label>
                   <input
                     type="text"
                     name="title"
                     value={editFormData.title}
                     onChange={handleEditFormChange}
                     className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                     placeholder={language === 'zh' ? '输入作品标题' : 'Enter project title'}
                     required
                   />
                 </div>

                 {/* Description */}
                 <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                     {language === 'zh' ? '描述' : 'Description'}
                   </label>
                   <textarea
                     name="description"
                     value={editFormData.description}
                     onChange={handleEditFormChange}
                     className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                     rows={3}
                     placeholder={language === 'zh' ? '输入作品描述' : 'Enter project description'}
                     required
                   ></textarea>
                 </div>

                 {/* Tags */}
                 <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                     {language === 'zh' ? '标签' : 'Tags'}
                   </label>
                   <div className="flex flex-wrap gap-2 mb-3">
                     {editFormData.tags.map((tag, index) => (
                       <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-full text-sm font-medium">
                         {tag}
                         <button
                           type="button"
                           onClick={() => {
                             setEditFormData(prev => ({
                               ...prev,
                               tags: prev.tags.filter((_, i) => i !== index)
                             }));
                           }}
                           className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                         >
                           <X size={14} />
                         </button>
                       </span>
                     ))}
                   </div>
                   <div className="flex gap-2">
                     <input
                       type="text"
                       value={tagInput}
                       onChange={(e) => setTagInput(e.target.value)}
                       onKeyPress={(e) => {
                         if (e.key === 'Enter' && tagInput.trim()) {
                           e.preventDefault();
                           setEditFormData(prev => ({
                             ...prev,
                             tags: [...prev.tags, tagInput.trim()]
                           }));
                           setTagInput('');
                         }
                       }}
                       className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                       placeholder={language === 'zh' ? '输入标签' : 'Enter tag'}
                     />
                     <button
                       type="button"
                       onClick={() => {
                         if (tagInput.trim()) {
                           setEditFormData(prev => ({
                             ...prev,
                             tags: [...prev.tags, tagInput.trim()]
                           }));
                           setTagInput('');
                         }
                       }}
                       disabled={!tagInput.trim()}
                       className="px-4 py-3 rounded-lg font-bold bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {language === 'zh' ? '确定' : 'Add'}
                     </button>
                   </div>
                 </div>

                 {/* Category-specific fields would go here */}
                 {editFormData.category === Category.PHOTO && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-black dark:text-white">
                      {language === 'zh' ? '摄影特有信息' : 'Photography Specific'}
                    </h4>
                    
                    {/* Photos Section */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                        {language === 'zh' ? '照片' : 'Photos'}
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {/* Display existing photos */}
                        {editFormData.images.map((photo, index) => (
                          <div key={index} className="aspect-square relative">
                            <img
                              src={photo}
                              alt={`Uploaded Image ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setEditFormData(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== index)
                                }));
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        
                        {/* Add new photo button */}
                        <div
                          className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                          onClick={(e) => {
                            const input = e.currentTarget.querySelector('input[type="file"]');
                            if (input) {
                              input.click();
                            }
                          }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length > 0) {
                                const uploadImages = async () => {
                                  try {
                                    setFormLoading(true);
                                    const imageUrls = await ApiService.uploadImages(files);
                                    setEditFormData(prev => ({
                                      ...prev,
                                      images: [...prev.images, ...imageUrls]
                                    }));
                                    setFormError(null);
                                  } catch (error) {
                                    console.error('Error uploading images:', error);
                                    setFormError(language === 'zh' ? '图片上传失败，请重试' : 'Image upload failed, please try again');
                                  } finally {
                                    setFormLoading(false);
                                  }
                                };
                                uploadImages();
                              }
                            }}
                          />
                          <Plus size={32} className="text-gray-400 dark:text-gray-500" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'zh' ? '思路&感受' : 'Thoughts & Feelings'}
                      </label>
                      <textarea
                        name="thoughts"
                        value={editFormData.thoughts}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        rows={3}
                        placeholder={language === 'zh' ? '输入创作思路和感受' : 'Enter creative thoughts and feelings'}
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'zh' ? '补充' : 'Additional Info'}
                      </label>
                      <textarea
                        name="additionalInfo"
                        value={editFormData.additionalInfo}
                        onChange={handleEditFormChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        rows={3}
                        placeholder={language === 'zh' ? '输入补充信息，如获奖情况、分工与职责等' : 'Enter additional info, such as awards, roles, etc.'}
                      ></textarea>
                    </div>
                  </div>
                )}

                 {editFormData.category === Category.DEV && (
                   <div className="space-y-4">
                     <h4 className="text-lg font-bold text-black dark:text-white">
                       {language === 'zh' ? '开发特有信息' : 'Development Specific'}
                     </h4>
                     
                     {/* Image Section */}
                     <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                         {language === 'zh' ? '图片' : 'Image'}
                       </label>
                       <div className="grid grid-cols-3 gap-4">
                         {/* Display existing images */}
                         {editFormData.images.map((imageUrl, index) => (
                           <div key={index} className="aspect-square relative">
                             <img
                               src={imageUrl}
                               alt={`Uploaded Image ${index + 1}`}
                               className="w-full h-full object-cover rounded-lg"
                             />
                             <button
                               type="button"
                               onClick={() => {
                                 setEditFormData(prev => ({
                                   ...prev,
                                   images: prev.images.filter((_, i) => i !== index)
                                 }));
                               }}
                               className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                             >
                               <X size={16} />
                             </button>
                           </div>
                         ))}
                         
                         {/* Add new image button */}
                         <div
                           className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                           onClick={(e) => {
                             const input = e.currentTarget.querySelector('input[type="file"]');
                             if (input) {
                               input.click();
                             }
                           }}
                         >
                           <input
                             type="file"
                             accept="image/*"
                             multiple
                             className="hidden"
                             onChange={(e) => {
                               const files = Array.from(e.target.files || []);
                               if (files.length > 0) {
                                 const uploadImages = async () => {
                                   try {
                                     setFormLoading(true);
                                     const imageUrls = await ApiService.uploadImages(files);
                                     setEditFormData(prev => ({
                                       ...prev,
                                       images: [...prev.images, ...imageUrls]
                                     }));
                                     setFormError(null);
                                   } catch (error) {
                                     console.error('Error uploading images:', error);
                                     setFormError(language === 'zh' ? '图片上传失败，请重试' : 'Image upload failed, please try again');
                                   } finally {
                                     setFormLoading(false);
                                   }
                                 };
                                 uploadImages();
                               }
                             }}
                           />
                           <Plus size={32} className="text-gray-400 dark:text-gray-500" />
                         </div>
                       </div>
                     </div>
                     
                     <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                         {language === 'zh' ? 'GitHub链接' : 'GitHub URL'}
                       </label>
                       <input
                         type="url"
                         name="githubUrl"
                         value={editFormData.githubUrl}
                         onChange={handleEditFormChange}
                         className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                         placeholder="https://github.com/username/repo"
                       />
                     </div>

                     <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                         {language === 'zh' ? '项目说明文档' : 'ReadMe'}
                       </label>
                       <textarea
                         name="readme"
                         value={editFormData.readme}
                         onChange={handleEditFormChange}
                         className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                         rows={3}
                         placeholder={language === 'zh' ? '输入项目说明文档' : 'Enter project readme'}
                       ></textarea>
                     </div>
                   </div>
                 )}
                 
                 {editFormData.category === Category.OTHER && (
                   <div className="space-y-4">
                     <h4 className="text-lg font-bold text-black dark:text-white">
                       {language === 'zh' ? '其他特有信息' : 'Other Specific'}
                     </h4>
                     
                     {/* Image Section */}
                     <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                         {language === 'zh' ? '图片' : 'Images'}
                       </label>
                       <div className="grid grid-cols-3 gap-4">
                         {/* Display existing images */}
                         {editFormData.images.map((imageUrl, index) => (
                           <div key={index} className="aspect-square relative">
                             <img
                               src={imageUrl}
                               alt={`Uploaded Image ${index + 1}`}
                               className="w-full h-full object-cover rounded-lg"
                             />
                             <button
                               type="button"
                               onClick={() => {
                                 setEditFormData(prev => ({
                                   ...prev,
                                   images: prev.images.filter((_, i) => i !== index)
                                 }));
                               }}
                               className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                             >
                               <X size={16} />
                             </button>
                           </div>
                         ))}
                         
                         {/* Add new image button */}
                         <div
                           className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 cursor-pointer"
                           onClick={(e) => {
                             const input = e.currentTarget.querySelector('input[type="file"]');
                             if (input) {
                               input.click();
                             }
                           }}
                         >
                           <input
                             type="file"
                             accept="image/*"
                             multiple
                             className="hidden"
                             onChange={(e) => {
                               const files = Array.from(e.target.files || []);
                               if (files.length > 0) {
                                 const uploadImages = async () => {
                                   try {
                                     setFormLoading(true);
                                     const imageUrls = await ApiService.uploadImages(files);
                                     setEditFormData(prev => ({
                                       ...prev,
                                       images: [...prev.images, ...imageUrls]
                                     }));
                                     setFormError(null);
                                   } catch (error) {
                                     console.error('Error uploading images:', error);
                                     setFormError(language === 'zh' ? '图片上传失败，请重试' : 'Image upload failed, please try again');
                                   } finally {
                                     setFormLoading(false);
                                   }
                                 };
                                 uploadImages();
                               }
                             }}
                           />
                           <Plus size={32} className="text-gray-400 dark:text-gray-500" />
                         </div>
                       </div>
                     </div>

                     <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                         {language === 'zh' ? '网址' : 'URL'}
                       </label>
                       <input
                         type="url"
                         name="externalLink"
                         value={editFormData.externalLink}
                         onChange={handleEditFormChange}
                         className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                         placeholder="https://example.com"
                       />
                     </div>

                     <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                         {language === 'zh' ? '项目介绍' : 'Introduction'}
                       </label>
                       <textarea
                         name="introduction"
                         value={editFormData.introduction}
                         onChange={handleEditFormChange}
                         className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                         rows={3}
                         placeholder={language === 'zh' ? '输入项目介绍' : 'Enter project introduction'}
                       ></textarea>
                     </div>
                   </div>
                 )}

                 {/* Modal Footer */}
                 <div className="p-6 md:p-8 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-4">
                   <button
                     type="button"
                     onClick={() => setShowEditModal(false)}
                     className="px-6 py-3 rounded-lg font-bold bg-gray-100 text-black dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                   >
                     {language === 'zh' ? '取消' : 'Cancel'}
                   </button>
                   <button
                     type="submit"
                     disabled={formLoading}
                     className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                       formLoading
                         ? 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                         : 'bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100'
                     }`}
                   >
                     {formLoading ? (language === 'zh' ? '保存中...' : 'Saving...') : (language === 'zh' ? '保存' : 'Save')}
                   </button>
                 </div>
               </form>
             </div>
             </div>
           </div>
        </div>,
        document.body
      )}

    </div>
  );
};
