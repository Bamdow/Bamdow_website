import React, { useState } from 'react';
import { Language } from '../types';
import { LogIn, Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginPageProps {
  language: Language;
  theme: 'light' | 'dark';
  onClose: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ language, theme, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 模拟登录请求
    setTimeout(() => {
      setIsLoading(false);
      // 这里可以添加实际的登录逻辑
      if (email && password) {
        // 登录成功后的处理
        console.log('Login successful');
      } else {
        setError(language === 'zh' ? '请输入邮箱和密码' : 'Please enter email and password');
      }
    }, 1000);
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
            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold mb-2 text-black dark:text-white">
                {language === 'zh' ? '邮箱' : 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={language === 'zh' ? '请输入您的邮箱' : 'Please enter your email'}
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

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center">
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
              <a
                href="#"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {language === 'zh' ? '忘记密码？' : 'Forgot password?'}
              </a>
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

            {/* Register Link */}
            <div className="text-center">
              <span className="text-gray-600 dark:text-gray-400">
                {language === 'zh' ? '还没有账户？' : 'Don\'t have an account?'}
              </span>
              <a
                href="#"
                className="ml-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {language === 'zh' ? '注册' : 'Register'}
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
