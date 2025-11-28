import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // 支持的语言列表
  locales: ['en', 'zh'],
 
  // 默认语言
  defaultLocale: 'zh'
});
 
export const config = {
  // 匹配所有路径，排除 API、静态资源等
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
