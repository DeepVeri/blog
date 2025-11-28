import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
 
// Can be imported from a shared config
const locales = ['en', 'zh'];
 
export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
 
  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale as any)) {
    locale = 'zh'; // 默认回退到中文
  }
 
  return {
    locale, // 必须返回 locale 字段
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
