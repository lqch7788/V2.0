/**
 * CORS 跨域配置
 * 生产环境只允许正式域名，开发环境允许多个本地端口
 */

import cors from 'cors';

// 根据环境配置允许的来源
const getAllowedOrigins = () => {
  // 生产环境只允许配置的正式域名
  if (process.env.NODE_ENV === 'production') {
    const productionOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',').map(s => s.trim()) || [];
    if (productionOrigins.length > 0) {
      return productionOrigins;
    }
    // 如果未配置生产环境域名，默认拒绝所有（安全优先）
    console.warn('警告: 生产环境未配置 CORS_ALLOWED_ORIGINS，默认仅允许内置域名');
    return [
      'https://yourdomain.com',  // 需替换为实际域名
    ];
  }

  // 开发环境允许多个本地端口（避免与V1.1的5188/3001端口冲突）
  return [
    'http://localhost:5000',  // V2.0 Vite 开发服务器
    'http://localhost:5001',  // V2.0 备用端口
    'http://localhost:5002',  // V2.0 备用端口
    'http://localhost:5173',  // Vite 开发服务器
    'http://localhost:4174',  // Vite preview 端口
    'http://localhost:4173',  // Vite preview 备用端口
    'http://127.0.0.1:5000',
    'http://127.0.0.1:5001',
    'http://127.0.0.1:5002',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4174',
    'http://127.0.0.1:4173',
  ];
};

export const corsOptions = {
  origin: getAllowedOrigins(),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

export default cors(corsOptions);
