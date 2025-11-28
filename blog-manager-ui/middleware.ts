import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  // 支持的语言列表
  locales: ['en', 'zh'],
 
  // 默认语言
  defaultLocale: 'zh'
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. 执行国际化中间件
  const response = intlMiddleware(request);

  // 2. 获取 Token (简单示例：假设 Cookie 名为 auth_token)
  // 注意：在实际生产中，应该验证 Token 的有效性
  const token = request.cookies.get('auth_token')?.value;

  // 3. 定义无需登录的公开路径
  const isPublicPath = pathname.includes('/login');

  // 4. 如果没有 Token 且访问的不是公开路径，重定向到登录页
  if (!token && !isPublicPath) {
    // 获取当前的 locale，默认为 zh
    // 这里简化处理，直接跳转到 /zh/login
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'zh';
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // 5. 如果有 Token 且访问的是登录页，重定向到首页
  if (token && isPublicPath) {
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'zh';
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return response;
}
 
export const config = {
  // 匹配所有路径，排除 API、静态资源等
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
