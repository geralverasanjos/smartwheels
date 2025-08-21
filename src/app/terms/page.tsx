'use client';
import { LandingHeader } from "@/components/landing/landing-header";
import Footer from "@/components/landing/footer";
import { useAppContext } from "@/contexts/app-context";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const BackToDashboardButton = () => {
    const { t } = useAppContext();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [fromUrl, setFromUrl] = useState<string | null>(null);

    useEffect(() => {
        // Search params are only available on the client
        setFromUrl(searchParams.get('from'));
    }, [searchParams]);

    if (!fromUrl) {
        return null; // Don't render if we don't know where to go back to
    }

    const handleGoBack = () => {
        router.push(fromUrl);
    };

    return (
        <div className="mt-8 text-center">
            <Button onClick={handleGoBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('btn_go_back')}
            </Button>
        </div>
    );
};

export default function TermsPage() {
    const { t } = useAppContext();

  return (
    <div className="terms-page-container">
      <LandingHeader />
      <main className="terms-content">
        <h1 id="termos-e-condicoes">{t('terms_title')}</h1>
        <p className="tagline">{t('terms_tagline')}</p>
        <p className="update-date">{t('terms_last_updated', { date: '5 de junho de 2025' })}</p>
        <p>{t('terms_intro_p1')}</p>
        <p>{t('terms_intro_p2')}</p>
        <div className="attention">
          <p><strong>{t('terms_attention_title')}</strong> {t('terms_attention_desc')}</p>
        </div>

        <h2 id="tc-aceitacao">{t('terms_section_2_1_title')}</h2>
        <h3>{t('terms_section_2_1_1_title')}</h3>
        <p>{t('terms_section_2_1_1_desc')}</p>
        <ul>
          <li>{t('terms_section_2_1_1_li1')}</li>
          <li>{t('terms_section_2_1_1_li2')}</li>
          <li>{t('terms_section_2_1_1_li3')}</li>
        </ul>
        <h3>{t('terms_section_2_1_2_title')}</h3>
        <p>{t('terms_section_2_1_2_desc1')}</p>
        <p><strong>{t('terms_section_2_1_2_desc2_strong')}</strong> {t('terms_section_2_1_2_desc2')}</p>
        
        <h2 id="tc-servicos">{t('terms_section_2_2_title')}</h2>
        <p>{t('terms_section_2_2_desc')}</p>
        <h4>{t('terms_section_2_2_1_title')}</h4>
        <ul>
            <li>{t('terms_section_2_2_1_li1')}</li>
            <li>{t('terms_section_2_2_1_li2')}</li>
            <li>{t('terms_section_2_2_1_li3')}</li>
            <li>{t('terms_section_2_2_1_li4')}</li>
            <li>{t('terms_section_2_2_1_li5')}</li>
            <li>{t('terms_section_2_2_1_li6')}</li>
            <li>{t('terms_section_2_2_1_li7')}</li>
        </ul>
        <h4>{t('terms_section_2_2_2_title')}</h4>
        <ul>
            <li>{t('terms_section_2_2_2_li1')}</li>
            <li>{t('terms_section_2_2_2_li2')}</li>
            <li>{t('terms_section_2_2_2_li3')}</li>
            <li>{t('terms_section_2_2_2_li4')}</li>
            <li>{t('terms_section_2_2_2_li5')}</li>
            <li>{t('terms_section_2_2_2_li6')}</li>
            <li>{t('terms_section_2_2_2_li7')}</li>
        </ul>

        <h2 id="tc-registro">{t('terms_section_2_3_title')}</h2>
        <p>{t('terms_section_2_3_desc')}</p>

        <h2 id="tc-uso">{t('terms_section_2_4_title')}</h2>
        <p>{t('terms_section_2_4_desc')}</p>

        <h2 id="tc-pagamentos">{t('terms_section_2_5_title')}</h2>
        <p>{t('terms_section_2_5_desc')}</p>

        <h2 id="tc-propriedade">{t('terms_section_2_6_title')}</h2>
        <p>{t('terms_section_2_6_desc')}</p>

        <h2 id="tc-privacidade-link">{t('terms_section_2_7_title')}</h2>
        <p>{t('terms_section_2_7_desc')}</p>
        
        <h2 id="tc-rescisao">{t('terms_section_2_8_title')}</h2>
        <p>{t('terms_section_2_8_desc')}</p>

        <h2 id="tc-garantias">{t('terms_section_2_9_title')}</h2>
        <p>{t('terms_section_2_9_desc')}</p>

        <h2 id="tc-indenizacao">{t('terms_section_2_10_title')}</h2>
        <p>{t('terms_section_2_10_desc')}</p>

        <h2 id="tc-lei">{t('terms_section_2_11_title')}</h2>
        <p>{t('terms_section_2_11_desc')}</p>

        <h2 id="tc-gerais">{t('terms_section_2_12_title')}</h2>
        <p>{t('terms_section_2_12_desc')}</p>

        <h2 id="tc-contato">{t('terms_section_2_13_title')}</h2>
        <p>{t('terms_section_2_13_desc')}</p>
        <ul>
          <li><strong>{t('support_email_label')}</strong> {t('support_email_value')}</li>
          <li><strong>{t('support_phone_label')}</strong> {t('support_phone_value')}</li>
        </ul>
        <div className="company-info">
            <p>{t('company_name')}</p>
            <p>{t('company_address')}</p>
        </div>


        <br /><br /><br />
        <h1 id="politica-de-privacidade">{t('privacy_policy_title')}</h1>
        <p className="tagline">{t('privacy_policy_tagline')}</p>
        <p className="update-date">{t('privacy_policy_last_updated', { date: '31 de maio de 2025' })}</p>
        <p>{t('privacy_policy_intro')}</p>

        <h2 id="pp-compromisso">{t('privacy_section_3_1_title')}</h2>
        <p>{t('privacy_section_3_1_desc')}</p>

        <h2 id="pp-dados">{t('privacy_section_3_2_title')}</h2>
        <p>{t('privacy_section_3_2_desc')}</p>
        
        <h2 id="pp-uso-dados">{t('privacy_section_3_3_title')}</h2>
        <p>{t('privacy_section_3_3_desc')}</p>

        <h2 id="pp-compartilhamento">{t('privacy_section_3_4_title')}</h2>
        <p>{t('privacy_section_3_4_desc')}</p>

        <h2 id="pp-armazenamento">{t('privacy_section_3_5_title')}</h2>
        <p>{t('privacy_section_3_5_desc')}</p>
        
        <h2 id="pp-direitos">{t('privacy_section_3_6_title')}</h2>
        <p>{t('privacy_section_3_6_desc')}</p>

        <h2 id="pp-protecao">{t('privacy_section_3_7_title')}</h2>
        <p>{t('privacy_section_3_7_desc')}</p>

        <h2 id="pp-cookies">{t('privacy_section_3_8_title')}</h2>
        <p>{t('privacy_section_3_8_desc')}</p>

        <h2 id="pp-criancas">{t('privacy_section_3_9_title')}</h2>
        <p>{t('privacy_section_3_9_desc')}</p>
        
        <h2 id="pp-alteracoes">{t('privacy_section_3_10_title')}</h2>
        <p>{t('privacy_section_3_10_desc')}</p>
        
        <h2 id="pp-contato">{t('privacy_section_3_11_title')}</h2>
        <p>{t('privacy_section_3_11_desc')}</p>
        <ul>
          <li><strong>{t('privacy_email_label')}</strong> {t('privacy_email_value')}</li>
        </ul>

        <BackToDashboardButton />
      </main>
      <Footer />
    </div>
  );
}
