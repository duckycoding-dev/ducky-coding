import { LocaleParams } from '@/types/Locales';
import {useTranslations} from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';



export default function Test({params : {locale}} : LocaleParams) {
  const t = useTranslations('Index');
  unstable_setRequestLocale(locale);

  return (
    <main>
      Testo in lingua specifica2: {t('title')}
    </main>
  )
}