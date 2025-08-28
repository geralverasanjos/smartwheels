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
import { getDriverTripHistory } from '@/services/historyService';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { sendMessage } from '@/services/chatService';
import type { Trip, Message, UserProfile } from '@/types';

interface Conversation {
    id: string; // rideId acts as conversation ID
    participant: UserProfile;
    lastMessage: string;
    lastMessageTimestamp: any;
}


export default function DriverChatPage() {
    const { t, user } = useAppContext();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

     useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        const fetchConversations = async () => {
            setLoading(true);
            try {
                const trips = await getDriverTripHistory(user.id);
                const uniquePassengers: { [key: string]: Trip } = {};
                trips.forEach(trip => {
                    if (trip.passengerId && !uniquePassengers[trip.passengerId]) {
                        uniquePassengers[trip.passengerId] = trip;
                    }
                });

                const convos: Conversation[] = Object.values(uniquePassengers).map(trip => ({
                    id: trip.id,
                    participant: trip.passenger!,
                    lastMessage: '...', 
                    lastMessageTimestamp: trip.date,
                }));
                
                setConversations(convos);
                if (convos.length > 0) {
                   handleSelectConversation(convos[0]);
                }
            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [user]);

    useEffect(() => {
        if (!selectedConversation?.id) return;

        const messagesQuery = query(
            collection(db, 'messages'),
            where('rideId', '==', selectedConversation.id),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(newMessages);
        });

        return () => unsubscribe();
    }, [selectedConversation]);


    const handleSelectConversation = (conv: Conversation) => {
        setSelectedConversation(conv);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !selectedConversation || !user) return;
        
        try {
            await sendMessage(selectedConversation.id, user.id, newMessage);
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
        }
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
                            conversations.map((conv: Conversation) => (
                                <div 
                                    key={conv.id} 
                                    className={cn(
                                        "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                                        selectedConversation?.id === conv.id ? 'bg-primary/10' : 'hover:bg-accent'
                                    )}
                                    onClick={() => handleSelectConversation(conv)}
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={conv.participant.avatarUrl} data-ai-hint="person face" />
                                        <AvatarFallback>{conv.participant.name.substring(0,2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 truncate">
                                        <p className="font-semibold">{conv.participant.name}</p>
                                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                                    </div>
                                    <div className="text-xs text-muted-foreground text-right">
                                        <p>{conv.lastMessageTimestamp ? new Date(conv.lastMessageTimestamp?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
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
                                <AvatarImage src={selectedConversation.participant.avatarUrl} data-ai-hint="person face" />
                                <AvatarFallback>{selectedConversation.participant.name.substring(0,2)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{selectedConversation.participant.name}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow p-6 space-y-4 overflow-y-auto">
                            {messages.map((msg:any) => (
                                <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === user?.id ? "justify-end" : "justify-start")}>
                                     {msg.senderId !== user?.id && (
                                         <Avatar className="h-8 w-8">
                                            <AvatarImage src={selectedConversation.participant.avatarUrl} data-ai-hint="person face" />
                                            <AvatarFallback>{selectedConversation.participant.name.substring(0,2)}</AvatarFallback>
                                        </Avatar>
                                     )}
                                     <div className={cn(
                                         "max-w-xs md:max-w-md lg:max-w-lg rounded-xl p-3",
                                         msg.senderId === user?.id ? "bg-primary text-primary-foreground" : "bg-accent"
                                     )}>
                                         <p className="text-sm">{msg.text}</p>
                                          <p className={cn("text-xs mt-1", msg.senderId === user?.id ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                            {msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                         </p>
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
