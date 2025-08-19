const handleFinishRide = async () => {
    if (!driver || !vehicle) {
        toast({ title: t('error_title'), description: t('driver_finish_no_data'), variant: "destructive" }); // Adicione esta mensagem nos seus arquivos de tradução
        return;
    }

    // Certifique-se de que tripData tem os dados necessários para o histórico e para a Cloud Function (valor, passengerId)
    const finalTripData: Omit<Trip, 'id'> = {
        type: 'trip', // Ou 'delivery'
        passengerName: tripData.passengerName!, // Usando dados simulados, substitua por dados reais da solicitação aceita
        date: new Date().toISOString(),
        value: tripData.value!, // Certifique-se de que o valor correto está aqui
        status: 'completed',
        originAddress: tripData.originAddress!, // Usando dados simulados, substitua por dados reais
        destinationAddress: tripData.destinationAddress!, // Usando dados simulados, substitua por dados reais
        distance: tripData.distance!, // Usando dados simulados, substitua por dados reais
        duration: tripData.duration!, // Usando dados simulados, substitua por dados reais
        passengerId: assignedPassengerProfile?.id || 'mock_passenger_id', // Use o ID do passageiro atribuído
        vehicleId: vehicle.id,
        driverId: driver.id!,
    };

    try {
        // CRUCIAL: Atualizar o status da solicitação de corrida primeiro para acionar a Cloud Function
        if (!activeRideId) {
            console.error("No active ride ID to finish.");
             toast({ title: t('error_title'), description: 'No active ride to finish.', variant: "destructive" });
            return; // Retorna se não houver activeRideId
        }
        await updateRideStatus(activeRideId, 'completed');
        console.log(`Ride request ${activeRideId} status updated to completed`);
        toast({ title: t('trip_completed_title'), description: t('trip_completed_desc') });


        // Salvar histórico da viagem (isso pode vir antes ou depois da atualização de status, dependendo do seu fluxo)
        await saveTripHistory(finalTripData);
        console.log("Trip history saved successfully!");

        // Redefinir o estado da UI após a finalização bem-sucedida
        dispatch({ type: 'FINISH_RIDE' }); // Use FINISH_RIDE para redefinir para o estado apropriado (e.g., waiting)
        setActiveRideId(null); // Limpar o ID da corrida ativa
        setAssignedPassengerProfile(null); // Limpar o perfil do passageiro atribuído
        setMessages([]); // Limpar mensagens do chat

    } catch (error) {
        console.error("Failed to finish ride or save history:", error);
        toast({ title: t('error_title'), description: t('error_finish_ride_failed'), variant: "destructive" }); // Adicione esta mensagem nos seus arquivos de tradução
    }
};
// src/services/paymentService.ts
import { collection, addDoc, FieldValue } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import firebase from 'firebase/compat/app'; // Import firebase for FieldValue
import 'firebase/compat/firestore'; // Import firestore module

import type { Transaction } from '@/types';

export const recordTransaction = async (
    transactionData: Omit<Transaction, 'id' | 'timestamp'>
): Promise<firebase.firestore.DocumentReference<firebase.firestore.DocumentData>> => {
    try {
        const transactionsCollection = collection(db, 'transactions');
        const newTransaction = {
            ...transactionData,
            timestamp: FieldValue.serverTimestamp(),
        };
        const docRef = await addDoc(transactionsCollection, newTransaction);
        return docRef;
    } catch (error) {
        console.error("Error recording transaction:", error);
        throw new Error("Failed to record transaction.");
    }
};