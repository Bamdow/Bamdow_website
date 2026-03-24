import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { LogIn, Eye, EyeOff, User, Lock, Camera, RefreshCw, X } from 'lucide-react';
import axios from 'axios';
import { getToken, isLoggedIn } from '../src/services/authApi';

interface LoginPageProps {
  language: Language;
  theme: 'light' | 'dark';
  onClose: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ language, theme, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 人脸登录相关状态
  const [showCamera, setShowCamera] = useState(false);
  const [hasTakenPhoto, setHasTakenPhoto] = useState(false);
  const [faceImage, setFaceImage] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  
  // 引用
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 启动摄像头
  const startCamera = async () => {
    try {
      // 先显示模态框，确保video元素已经渲染
      setShowCamera(true);
      setHasTakenPhoto(false);
      setFaceImage(null);
      setPhotoPreview('');
      
      // 等待DOM更新，确保video元素已经存在
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 获取摄像头权限
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      
      // 设置视频流
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError(language === 'zh' ? '无法访问摄像头，请检查权限' : 'Could not access camera, please check permissions');
      setShowCamera(false);
    }
  };

  // 停止摄像头
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setHasTakenPhoto(false);
    setFaceImage(null);
    setPhotoPreview('');
  };

  // 拍照
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // 设置canvas尺寸与视频一致
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // 绘制视频帧到canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // 将canvas转换为blob
        canvas.toBlob((blob) => {
          if (blob) {
            setFaceImage(blob);
            setPhotoPreview(canvas.toDataURL('image/jpeg'));
            setHasTakenPhoto(true);
            
            // 直接停止视频流，不调用stopCamera函数，避免重置状态
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }
            setShowCamera(false);
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  // 处理登录提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 检查是否已拍照
    if (!faceImage) {
      setError(language === 'zh' ? '请先进行人脸识别' : 'Please complete face recognition first');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // 获取记住我选项的值
      const rememberMe = (document.getElementById('remember') as HTMLInputElement)?.checked || false;
      
      // 构造FormData
      const formData = new FormData();
      
      // 1. 处理DTO (JSON转Blob)
      const dto = {
        administratorname: username,
        password: password,
        rememberMe: rememberMe
      };
      const dtoBlob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
      formData.append('dto', dtoBlob);
      
      // 2. 处理图片
      formData.append('faceImage', faceImage, 'face.jpg');
      
      // 3. 发送请求
      const response = await axios.post('/api/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setIsLoading(false);
      
      if (response.data.code === 200) {
        // 登录成功，存储token
        const token = response.data.data;
        if (rememberMe) {
          localStorage.setItem('satoken', token);
          sessionStorage.removeItem('satoken');
        } else {
          sessionStorage.setItem('satoken', token);
          localStorage.removeItem('satoken');
        }
        
        // 关闭登录页面
        onClose();
      } else {
        // 登录失败
        setError(response.data.message || (language === 'zh' ? '登录失败，请重试' : 'Login failed, please try again'));
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Login error:', error);
      
      // 处理错误响应
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || (language === 'zh' ? '登录失败，请重试' : 'Login failed, please try again'));
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(language === 'zh' ? '登录失败，请重试' : 'Login failed, please try again');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <div className="w-full max-w-md p-8 md:p-12 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <h1 className="text-4xl font-black tracking-tighter uppercase text-black dark:text-white">
            BAMDOW'S <span className="hidden sm:inline">SITE</span>
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className="text-3xl font-black mb-2 text-black dark:text-white">
              {language === 'zh' ? '登录' : 'Login'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'zh' ? '欢迎回来，请登录您的账户' : 'Welcome back, please log in to your account'}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-bold mb-2 text-black dark:text-white">
                {language === 'zh' ? '用户名' : 'Username'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={language === 'zh' ? '请输入您的用户名' : 'Please enter your username'}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold mb-2 text-black dark:text-white">
                {language === 'zh' ? '密码' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={language === 'zh' ? '请输入您的密码' : 'Please enter your password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                {language === 'zh' ? '记住我' : 'Remember me'}
              </label>
            </div>

            {/* 人脸识别 */}
            <div className="mt-6">
              <label className="block text-sm font-bold mb-2 text-black dark:text-white">
                {language === 'zh' ? '人脸识别' : 'Face Recognition'}
              </label>
              
              {!hasTakenPhoto ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white font-bold text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                >
                  <Camera size={20} />
                  {language === 'zh' ? '开始人脸识别' : 'Start Face Recognition'}
                </button>
              ) : (
                <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
                  <div className="flex flex-col items-center">
                    <img 
                      src={photoPreview} 
                      alt="Face preview" 
                      className="w-32 h-32 object-cover rounded-lg mb-4"
                    />
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                    >
                      <RefreshCw size={16} />
                      {language === 'zh' ? '重拍' : 'Retake'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Login and Cancel Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white font-bold text-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-1/2 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <LogIn size={20} />
                )}
                {language === 'zh' ? '登录' : 'Login'}
              </button>
            </div>


          </div>
        </form>

        {/* 摄像头模态框 */}
        {showCamera && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-900 rounded-3xl overflow-hidden">
              {/* 关闭按钮 */}
              <button
                onClick={stopCamera}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X size={24} className="text-white" />
              </button>

              {/* 视频预览 */}
              <div className="relative w-full h-[60vh] flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* 人脸引导框 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-80 border-4 border-white/80 rounded-full flex items-center justify-center">
                    <div className="text-white text-sm font-bold">
                      {language === 'zh' ? '请将人脸对准此框' : 'Please align your face to this frame'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 拍照按钮 */}
              <div className="p-6 flex justify-center">
                <button
                  onClick={takePhoto}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white dark:bg-black text-black dark:text-white font-bold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
                >
                  <Camera size={24} />
                  {language === 'zh' ? '拍照' : 'Take Photo'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Canvas (hidden) */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
