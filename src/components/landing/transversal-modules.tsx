'use client';
import { useState } from 'react';
import { useAppContext } from '@/contexts/app-context';
import Image from 'next/image';

const tabs = [
    { id: 'chat', title: 'Comunicação' },
    { id: 'docs', title: 'Documentos' },
    { id: 'sos', title: 'Segurança SOS' }
];

const tabContentData = {
    chat: {
        title: 'Chat e Notificações',
        description: 'Mantenha-se conectado. Passageiros e motoristas podem se comunicar facilmente através do chat integrado, e nosso sistema de notificações garante que você nunca perca uma atualização importante.'
    },
    docs: {
        title: 'Gestão de Documentos',
        description: 'Simplificamos a burocracia. Motoristas podem fazer upload e gerenciar seus documentos (CNH, CRLV) diretamente na plataforma, com verificação por IA para mais agilidade.'
    },
    sos: {
        title: 'Botão de Emergência (SOS)',
        description: 'Sua segurança é nossa prioridade. Um botão de SOS está sempre acessível para motoristas e passageiros, conectando-os diretamente com as autoridades em caso de emergência.'
    }
};

export default function TransversalModules() {
    const { t } = useAppContext();
    const [activeTab, setActiveTab] = useState('chat');

    return (
        <section className="transversal-modules-section">
            <div className="text-container">
                <h2 className="title-glow">{t('transversal_modules_title')}</h2>
                <p className="subtitle">{t('transversal_modules_subtitle')}</p>
            </div>
            <div className="transversal-content">
                <div className="transversal-image">
                    <Image src="https://placehold.co/800x600/000000/32CD32" alt="Módulos Transversais" width={800} height={600} className="rounded-lg shadow-xl" data-ai-hint="mobile app interface" />
                </div>
                <div className="transversal-details">
                    <div className="transversal-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.title}
                            </button>
                        ))}
                    </div>
                    <div className="tab-content">
                        <h3>{tabContentData[activeTab as keyof typeof tabContentData].title}</h3>
                        <p>{tabContentData[activeTab as keyof typeof tabContentData].description}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
