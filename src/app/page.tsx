'use client';
import { useState } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { List, DollarSign, Package, User, Car, Users, BrainCircuit, HeartHandshake, Zap } from 'lucide-react';
import TechIntegrations from '@/components/landing/tech-integrations';
import Footer from '@/components/landing/footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { useRouter } from 'next/navigation';
import AuthDialog from '@/components/auth/auth-dialog';
import Image from 'next/image';

export default function LandingPage() {
    const { t } = useAppContext();
    const router = useRouter();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [selectedProfileUrl, setSelectedProfileUrl] = useState('');

    const handleProfileClick = (href: string) => {
        setSelectedProfileUrl(href);
        setIsAuthModalOpen(true);
    };

    const soulCardContent = [
        { icon: List, titleKey: 'virtual_queue_title', descriptionKey: 'virtual_queue_desc' },
        { icon: DollarSign, titleKey: 'direct_payment_title', descriptionKey: 'direct_payment_desc' }
    ];

    const specialServices = [
        { href: '/dashboard/passenger', icon: Package, titleKey: 'service_freight_title', descriptionKey: 'service_freight_desc' },
    ];

    const buttonContent = [
        { href: '/dashboard/passenger', icon: User, titleKey: 'btn_passenger_title', descriptionKey: 'btn_passenger_desc' },
        { href: '/dashboard/driver', icon: Car, titleKey: 'btn_driver_mototaxi_title', descriptionKey: 'btn_driver_desc' },
        { href: '/dashboard/fleet-manager', icon: Users, titleKey: 'btn_fleet_manager_title', descriptionKey: 'btn_fleet_manager_desc' },
    ];

    return (
        <>
            <AuthDialog 
                isOpen={isAuthModalOpen}
                setIsOpen={setIsAuthModalOpen}
                role={selectedProfileUrl.replace('/dashboard/', '')}
                onSuccess={() => router.push(selectedProfileUrl)}
            />
            <div className="flex flex-col bg-background">
                <LandingHeader />
                <main className="landing-page">
                    <div className="welcome-text-container">
                        <h1 className="flex flex-col items-center">
                            <span className="font-headline text-5xl md:text-6xl"><span className="text-primary">Smart</span>Wheels</span>
                            <span className="font-headline text-4xl md:text-5xl mt-1"><span className="text-primary">{t('welcome_title_p1')}</span> {t('welcome_title_p2')}</span>
                        </h1>
                        <p className="global-subtitle">{t('welcome_title_p3')}</p>
                        <p className="subtitle">{t('welcome_subtitle')}</p>
                    </div>

                    <section className="info-section">
                        <h2 className="title-glow text-5xl font-bold">{t('landing_auth_title')}</h2>
                    </section>

                    <div className="container-botoes">
                        {buttonContent.map((button, index) => (
                             <button className="botao-com-efeito" key={index} onClick={() => handleProfileClick(button.href)}>
                                <button.icon className="botao-icone" />
                                <span className="botao-titulo">{t(button.titleKey as any)}</span>
                                <span className="botao-descricao">{t(button.descriptionKey as any)}</span>
                                <span className="luz-efeito"></span>
                             </button>
                        ))}
                    </div>

                    <section className="info-section">
                        <h2 className="title-glow">{t('soul_title')}</h2>
                        <p className="subtitle">{t('soul_subtitle')}</p>
                        <div className="info-card-container">
                            {soulCardContent.map((card, index) => (
                                <div className="info-card" key={index}>
                                    <div className="info-card-header">
                                        <div className="icon">
                                            <card.icon />
                                        </div>
                                        <h3>{t(card.titleKey as any)}</h3>
                                    </div>
                                    <p>{t(card.descriptionKey as any)}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                    
                    <TechIntegrations />

                    <section className="special-services-section">
                        <h2 className="title-glow">{t('specialized_services_title')}</h2>
                        <p className="subtitle">{t('specialized_services_desc')}</p>
                        <div className="special-services-container">
                            {specialServices.map((card, index) => (
                                <button className="special-service-card" key={index} onClick={() => handleProfileClick(card.href)}>
                                    <div className="special-service-card-content">
                                        <card.icon className="icon" />
                                        <h3 className="title">{t(card.titleKey as any)}</h3>
                                    </div>
                                    <p className="description">{t(card.descriptionKey as any)}</p>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="business-model-section">
                      <div className="text-container">
                        <h2 className="title-glow">{t('business_model_title')}</h2>
                        <p className="subtitle">{t('business_model_subtitle')}</p>
                      </div>
                      <div className="content-container">
                        <div className="flow-container">
                            <h3>{t('business_model_flow_title')}</h3>
                            <div className="flow-card">
                                <h4>{t('business_model_step1_title')}</h4>
                                <p>{t('business_model_step1_desc')}</p>
                            </div>
                            <div className="flow-card">
                                <h4>{t('business_model_step2_title')}</h4>
                                <p>{t('business_model_step2_desc')}</p>
                            </div>
                             <div className="flow-card">
                                <h4>{t('business_model_step3_title')}</h4>
                                <p>{t('business_model_step3_desc')}</p>
                            </div>
                        </div>
                        <div className="chart-container relative h-96">
                           <Image src="https://placehold.co/600x400/000000/32CD32" alt={t('business_model_chart_alt')} layout="fill" objectFit="contain" data-ai-hint="business chart" />
                        </div>
                      </div>
                    </section>

                    <Footer />
                </main>
            </div>
        </>
    );
}
