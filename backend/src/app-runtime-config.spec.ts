import { isSwaggerEnabled, resolveCorsOrigins } from './app-runtime-config';

describe('runtime security config', () => {
  it('生产环境不会默认放行本地调试来源', () => {
    expect(resolveCorsOrigins({ NODE_ENV: 'production' })).toEqual([]);
  });

  it('生产环境只信任显式配置的 CORS_ORIGIN', () => {
    expect(resolveCorsOrigins({
      NODE_ENV: 'production',
      CORS_ORIGIN: 'https://app.example.com, https://admin.example.com',
    })).toEqual(['https://app.example.com', 'https://admin.example.com']);
  });

  it('非生产环境默认放行本地前端', () => {
    expect(resolveCorsOrigins({ NODE_ENV: 'development' })).toEqual([
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ]);
  });

  it('生产环境默认关闭 Swagger，显式开启后才启用', () => {
    expect(isSwaggerEnabled({ NODE_ENV: 'production' })).toBe(false);
    expect(isSwaggerEnabled({ NODE_ENV: 'production', ENABLE_SWAGGER: 'true' })).toBe(true);
    expect(isSwaggerEnabled({ NODE_ENV: 'development' })).toBe(true);
  });
});
