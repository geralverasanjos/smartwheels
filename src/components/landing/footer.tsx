'use client';
import { useAppContext } from '@/contexts/app-context';
import Link from 'next/link';

export default function Footer() {
  const { t } = useAppContext();

  return (
    <footer className="footer-landing">
      <div className="footer-content">
        <div className="footer-links">
          <Link href="/terms">{t('footer_terms')}</Link>
          <Link href="/terms#politica-de-privacidade">{t('footer_privacy')}</Link>
          <Link href="/terms#tc-contato">{t('footer_contact')}</Link>
        </div>
        <p className="text-sm">{t('footer_copyright')}</p>
      </div>
    </footer>
  );
}
