import { Project } from '../../types';

export const DEV_DATA: Project[] = [
  {
    id: 'dev1',
    common: {
      category: 'Development',
      image: '',
      icon: 'terminal',
      websiteUrl: 'https://virtual-project-1.com',
      githubUrl: 'https://github.com/virtual/user/project1'
    },
    zh: {
      title: '智能任务管理系统',
      subtitle: 'React / Node.js',
      description: '基于AI的任务管理系统，支持智能分类、优先级排序和自动提醒功能。',
      role: '全栈开发工程师',
      tags: ['React', 'Node.js', 'Express', 'MongoDB', 'AI'],
      roleDetail: '负责前端界面设计与后端API开发，实现智能任务分类算法。'
    },
    en: {
      title: 'Smart Task Manager',
      subtitle: 'React / Node.js',
      description: 'AI-powered task management system with intelligent categorization, priority sorting, and auto-reminder features.',
      role: 'Full Stack Developer',
      tags: ['React', 'Node.js', 'Express', 'MongoDB', 'AI'],
      roleDetail: 'Responsible for frontend UI design and backend API development, implementing intelligent task classification algorithm.'
    }
  },
  {
    id: 'dev2',
    common: {
      category: 'Development',
      image: '',
      icon: 'message-circle',
      websiteUrl: 'https://virtual-project-2.com',
      githubUrl: 'https://github.com/virtual/user/project2'
    },
    zh: {
      title: '实时协作白板',
      subtitle: 'Vue 3 / Socket.io',
      description: '支持多人实时协作的在线白板工具，具备绘图、文本、图片上传等功能。',
      role: '前端开发工程师',
      tags: ['Vue 3', 'Socket.io', 'Canvas API', 'TypeScript'],
      roleDetail: '专注于前端实时通信实现与Canvas绘图功能开发。'
    },
    en: {
      title: 'Real-time Collaboration Whiteboard',
      subtitle: 'Vue 3 / Socket.io',
      description: 'Online whiteboard tool supporting multi-user real-time collaboration with drawing, text, and image upload features.',
      role: 'Frontend Developer',
      tags: ['Vue 3', 'Socket.io', 'Canvas API', 'TypeScript'],
      roleDetail: 'Focused on frontend real-time communication implementation and Canvas drawing functionality development.'
    }
  },
  {
    id: 'dev3',
    common: {
      category: 'Development',
      image: '',
      icon: 'file-text',
      websiteUrl: 'https://virtual-project-3.com',
      githubUrl: 'https://github.com/virtual/user/project3'
    },
    zh: {
      title: '文档自动生成工具',
      subtitle: 'Python / Flask',
      description: '根据代码注释和结构自动生成API文档，支持多种输出格式。',
      role: '后端开发工程师',
      tags: ['Python', 'Flask', 'Documentation', 'Code Analysis'],
      roleDetail: '开发核心文档生成引擎，支持多种编程语言的代码分析。'
    },
    en: {
      title: 'Auto Docs Generator',
      subtitle: 'Python / Flask',
      description: 'Automatically generates API documentation based on code comments and structure, supporting multiple output formats.',
      role: 'Backend Developer',
      tags: ['Python', 'Flask', 'Documentation', 'Code Analysis'],
      roleDetail: 'Developed core documentation generation engine, supporting code analysis for multiple programming languages.'
    }
  },
  {
    id: 'dev4',
    common: {
      category: 'Development',
      image: '',
      icon: 'id-card',
      websiteUrl: 'https://virtual-project-4.com',
      githubUrl: 'https://github.com/virtual/user/project4'
    },
    zh: {
      title: '用户认证系统',
      subtitle: 'React / Firebase',
      description: '安全可靠的用户认证系统，支持邮箱、社交账号登录和多因素认证。',
      role: '全栈开发工程师',
      tags: ['React', 'Firebase', 'Authentication', 'Security'],
      roleDetail: '实现完整的用户认证流程，包括注册、登录、密码重置和社交账号集成。'
    },
    en: {
      title: 'User Authentication System',
      subtitle: 'React / Firebase',
      description: 'Secure and reliable user authentication system supporting email, social login, and multi-factor authentication.',
      role: 'Full Stack Developer',
      tags: ['React', 'Firebase', 'Authentication', 'Security'],
      roleDetail: 'Implemented complete user authentication flow including registration, login, password reset, and social account integration.'
    }
  },
  {
    id: 'dev5',
    common: {
      category: 'Development',
      image: '',
      icon: 'film',
      websiteUrl: 'https://virtual-project-5.com',
      githubUrl: 'https://github.com/virtual/user/project5'
    },
    zh: {
      title: '视频编辑工具',
      subtitle: 'React / FFmpeg',
      description: '基于浏览器的简易视频编辑工具，支持剪切、合并、添加字幕等基础功能。',
      role: '前端开发工程师',
      tags: ['React', 'FFmpeg', 'Video Processing', 'WebAssembly'],
      roleDetail: '集成FFmpeg到浏览器环境，实现客户端视频处理功能。'
    },
    en: {
      title: 'Video Editor Tool',
      subtitle: 'React / FFmpeg',
      description: 'Browser-based simple video editing tool with cutting, merging, subtitle addition and other basic features.',
      role: 'Frontend Developer',
      tags: ['React', 'FFmpeg', 'Video Processing', 'WebAssembly'],
      roleDetail: 'Integrated FFmpeg into browser environment to implement client-side video processing functionality.'
    }
  }
];
