'use client';
import { LifeBuoy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAppContext } from '@/contexts/app-context';
import { driverFaqs, passengerFaqs, fleetManagerFaqs } from '@/data/faq';
import type { FAQ } from '@/data/faq';

const CONTACT_DETAILS = {
    email: "geralveras@gmail.com",
    whatsapp_pt: "+351931740149",
    whatsapp_br: "+5591992947001"
};

const FaqSection = ({ faqs }: { faqs: FAQ[] }) => {
    const { t } = useAppContext();
    return (
        <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{t(faq.questionKey)}</AccordionTrigger>
                    <AccordionContent>{t(faq.answerKey)}</AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}

export default function SupportPage() {
    const { t, language } = useAppContext();

    const whatsappNumberToShow = language.value === 'pt-BR' 
        ? CONTACT_DETAILS.whatsapp_br 
        : CONTACT_DETAILS.whatsapp_pt;
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">{t('support_page_title')}</h1>
                <p className="text-muted-foreground">{t('support_page_subtitle')}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('support_contact_title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p><strong>{t('email_label')}:</strong> <a href={`mailto:${CONTACT_DETAILS.email}`} className="text-primary hover:underline">{CONTACT_DETAILS.email}</a></p>
                    <p><strong>WhatsApp:</strong> <a href={`https://wa.me/${whatsappNumberToShow}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{whatsappNumberToShow}</a></p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('support_faq_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <h3 className="font-semibold text-lg mb-4">{t('support_faq_passenger')}</h3>
                    <FaqSection faqs={passengerFaqs} />
                    <h3 className="font-semibold text-lg mt-8 mb-4">{t('support_faq_driver')}</h3>
                    <FaqSection faqs={driverFaqs} />
                    <h3 className="font-semibold text-lg mt-8 mb-4">{t('support_faq_fleet')}</h3>
                    <FaqSection faqs={fleetManagerFaqs} />
                </CardContent>
            </Card>
        </div>
    );
}
