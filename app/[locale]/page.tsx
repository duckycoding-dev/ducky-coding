import { LocaleParams } from '@/types/Locales';
import { useTranslations} from 'next-intl';
import Link from 'next-intl/link';
import { unstable_setRequestLocale } from 'next-intl/server';

export default function Home({params : {locale}} : LocaleParams) {
  const t = useTranslations('Index');
  unstable_setRequestLocale(locale);

  return (
    <main>
      <Link
        href={'/test'}
      >test</Link>
      Testo in lingua specifica: {t('title')}
    </main>
  )
}