import { LayoutLocaleParams, LocaleParams } from '@/types/Locales';
import { unstable_setRequestLocale } from 'next-intl/server';
import {notFound} from 'next/navigation';
 
const locales = ['en', 'it'];
 
export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default function LocaleLayout({children, params} : LayoutLocaleParams) {
  // Validate that the incoming `locale` parameter is valid
  const {locale} = params;
  const isValidLocale = locales.some((cur) => cur === locale);
  if (!isValidLocale) notFound();
 
  unstable_setRequestLocale(locale);

  return (
    < main>
      {children}
    </main>
  );
}