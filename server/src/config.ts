import * as path from 'path';

export const CONFIG = {
  // === 核心安全密钥 (由此统一管理) ===
  AMAP_KEY: '5d39e5f66505a0d62fa234bcf946a253',
  ALI_APP_CODE: '66687b41bc19410d8247d489d83cde0a',
  JWT_SECRET: 'zenflow_prod_sec_999_corezen', // 稍微加长了一点，更安全
  
  // === 外部接口 ===
  SHORT_LINK_API: 'https://jmlinkthir.market.alicloudapi.com/shortlink/create_thirtyday',
  
  // === 路径配置 (使用绝对路径更稳妥) ===
  // 假设项目在 /www/wwwroot/zenflow
  UPLOAD_DIR: '/www/wwwroot/zenflow/server/uploads',
  DB_PATH: '/www/wwwroot/zenflow/server/zenflow.db',
  CLIENT_DIR: '/www/wwwroot/zenflow/client/src',
  
  // === 系统默认 ===
  DEFAULT_PASS: '123456',
  PORT: 3000
};
