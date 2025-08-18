'use client';

import { useAppContext } from '@/contexts/app-context';
import { BrainCircuit, HeartHandshake, Zap } from 'lucide-react';

export default function TechIntegrations() {
    const { t } = useAppContext();

    const techCards = [
        {
            icon: BrainCircuit,
            title: 'Inteligência Artificial',
            description: 'Nossa IA otimiza rotas, verifica documentos e personaliza a experiência com interações inteligentes, como o suporte empático.'
        },
        {
            icon: Zap,
            title: 'Operações em Tempo Real',
            description: 'Utilizando Firebase, garantimos que a localização, status de corridas e notificações sejam atualizadas instantaneamente.'
        },
        {
            icon: HeartHandshake,
            title: 'Pagamento Direto e Seguro',
            description: 'A tecnologia facilita o pagamento direto entre passageiro e motorista, usando métodos seguros e modernos, sem intermediação de tarifas.'
        }
    ];

    return (
        <section className="tech-integrations-section">
            <div className="text-container">
                <h2 className="title-glow">{t('tech_integrations_title')}</h2>
                <p className="subtitle">{t('tech_integrations_subtitle')}</p>
            </div>
            <div className="tech-integrations-details">
                {techCards.map((card, index) => (
                    <div className="tech-card" key={index}>
                        <div className="tech-card-header">
                            <div className="icon">
                                <card.icon />
                            </div>
                            <h3>{card.title}</h3>
                        </div>
                        <p>{card.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
