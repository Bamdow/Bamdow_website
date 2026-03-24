// 认证服务

// 登录请求接口
export interface LoginRequest {
  administratorname: string;
  password: string;
  rememberMe: boolean;
}

// 登录响应接口
export interface LoginResponse {
  code: number;
  message: string;
  data: string; // token
}

// 登录函数
export async function login(username: string, password: string, rememberMe: boolean): Promise<boolean> {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        administratorname: username,
        password: password,
        rememberMe: rememberMe
      })
    });

    const data: LoginResponse = await response.json();
    if (data.code === 200) {
      const token = data.data;
      
      if (rememberMe) {
        localStorage.setItem('satoken', token);
        sessionStorage.removeItem('satoken');
      } else {
        sessionStorage.setItem('satoken', token);
        localStorage.removeItem('satoken');
      }
      return true;
    } else {
      // 登录失败，显示后端返回的错误信息
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    // 显示错误信息给用户
    if (error instanceof Error) {
      throw error; // 向上传递错误信息，让调用者处理
    }
    throw new Error('登录失败，请重试');
  }
}

// 获取token的函数
export function getToken(): string | null {
  let token = sessionStorage.getItem('satoken');
  if (!token) {
    token = localStorage.getItem('satoken');
  }
  return token;
}

// 检查是否已登录
export function isLoggedIn(): boolean {
  return !!getToken();
}

// 登出函数
export async function logout(): Promise<boolean> {
  try {
    localStorage.removeItem('satoken');
    sessionStorage.removeItem('satoken');
    
    const response = await fetch('/api/login/logout', {
      method: 'POST'
    });
    
    const data = await response.json();
    return data.code === 200;
  } catch (error) {
    console.error('Logout error:', error);
    // 即使API调用失败，也要清除本地存储的token
    localStorage.removeItem('satoken');
    sessionStorage.removeItem('satoken');
    return false;
  }
}

// 添加认证头的函数
export function addAuthHeader(headers: HeadersInit = {}): HeadersInit {
  const token = getToken();
  if (token) {
    return {
      ...headers,
      'satoken': token
    };
  }
  return headers;
}
