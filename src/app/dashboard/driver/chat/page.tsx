'use client';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Mock data has been removed. This component now requires real data fetching logic.
const conversations: any[] = [
  // This will be populated dynamically from a real data source.
];

export default function DriverChatPage() {
    const { t, user } = useAppContext();
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Implement real data fetching for conversations.
        // For now, we simulate loading and show an empty state.
        setLoading(true);
        // fetchDriverConversations(user.id).then(data => {
        //     setConversations(data);
        //     if (data.length > 0) {
        //         handleSelectConversation(data[0]);
        //     }
        //     setLoading(false);
        // });
        const timer = setTimeout(() => setLoading(false), 1000); // Simulate loading
        return () => clearTimeout(timer);
    }, [user]);

    const handleSelectConversation = (conv: any) => {
        setSelectedConversation(conv);
        setMessages([]); // Clear previous messages
        // TODO: Fetch messages for the selected conversation
        // fetchMessagesForConversation(conv.id).then(setMessages);
    }

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !selectedConversation) return;
        // TODO: Implement real message sending logic
        const newMsg = {
            id: messages.length + 1,
            sender: 'Você',
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            self: true
        };
        setMessages([...messages, newMsg]);
        setNewMessage('');
    }
    
    if(loading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[calc(100vh-10rem)]">
            <Card className="md:col-span-1 flex flex-col h-[calc(50vh)] md:h-full">
                <CardHeader>
                    <CardTitle>{t('menu_chat')}</CardTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder={t('chat_search_placeholder')} className="pl-8" />
                    </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-0">
                   <div className="space-y-1">
                        {conversations.length === 0 ? (
                            <p className="p-4 text-center text-muted-foreground">{t('no_conversations_found')}</p>
                        ) : (
                            conversations.map((conv: any) => (
                                <div 
                                    key={conv.id} 
                                    className={cn(
                                        "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                                        selectedConversation?.id === conv.id ? 'bg-primary/10' : 'hover:bg-accent'
                                    )}
                                    onClick={() => handleSelectConversation(conv)}
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={conv.avatar} data-ai-hint="person face" />
                                        <AvatarFallback>{conv.name.substring(0,2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 truncate">
                                        <p className="font-semibold">{conv.name}</p>
                                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                                    </div>
                                    <div className="text-xs text-muted-foreground text-right">
                                        <p>{conv.time}</p>
                                        {conv.unread > 0 && <span className="mt-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">{conv.unread}</span>}
                                    </div>
                                </div>
                            ))
                        )}
                   </div>
                </CardContent>
            </Card>
            <Card className="md:col-span-3 flex flex-col h-[calc(80vh)] md:h-full">
                 {selectedConversation ? (
                    <>
                        <CardHeader className="flex-row items-center gap-3 space-y-0 border-b">
                             <Avatar className="h-10 w-10">
                                <AvatarImage src={selectedConversation.avatar} data-ai-hint="person face" />
                                <AvatarFallback>{selectedConversation.name.substring(0,2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{selectedConversation.name}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow p-6 space-y-4 overflow-y-auto">
                            {messages.map((msg:any) => (
                                <div key={msg.id} className={cn("flex items-end gap-2", msg.self ? "justify-end" : "justify-start")}>
                                     {!msg.self && (
                                         <Avatar className="h-8 w-8">
                                            <AvatarImage src={selectedConversation.avatar} data-ai-hint="person face" />
                                            <AvatarFallback>{selectedConversation.name.substring(0,2)}</AvatarFallback>
                                        </Avatar>
                                     )}
                                     <div className={cn(
                                         "max-w-xs md:max-w-md lg:max-w-lg rounded-xl p-3",
                                         msg.self ? "bg-primary text-primary-foreground" : "bg-accent"
                                     )}>
                                         <p className="text-sm">{msg.text}</p>
                                         <p className={cn("text-xs mt-1", msg.self ? "text-primary-foreground/70" : "text-muted-foreground")}>{msg.time}</p>
                                     </div>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                            <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                                <Input 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={t('chat_type_message_placeholder')}
                                />
                                <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
                            </form>
                        </CardFooter>
                    </>
                 ) : (
                    <div className="flex flex-1 items-center justify-center text-muted-foreground">
                        <p>{t('chat_select_conversation')}</p>
                    </div>
                 )}
            </Card>
        </div>
    );
}
