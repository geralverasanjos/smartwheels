import { Car, Briefcase, Users, Dog, Box, Truck, Bike, LucideProps } from "lucide-react";
import type { TranslationKeys } from "@/lib/i18n";

export interface ServiceCategory {
    id: string;
    icon: React.ComponentType<LucideProps>;
    titleKey: TranslationKeys;
    descriptionKey: TranslationKeys;
}

export const serviceCategories: ServiceCategory[] = [
    { id: 'economico', icon: Car, titleKey: 'transport_service_economic_title', descriptionKey: 'transport_service_economic_desc' },
    { id: 'smart', icon: Car, titleKey: 'transport_service_smart_title', descriptionKey: 'transport_service_smart_desc' },
    { id: 'executivo', icon: Briefcase, titleKey: 'transport_service_executive_title', descriptionKey: 'transport_service_executive_desc' },
    { id: 'van', icon: Users, titleKey: 'transport_service_van_title', descriptionKey: 'transport_service_van_desc' },
    { id: 'pet', icon: Dog, titleKey: 'transport_service_pet_title', descriptionKey: 'transport_service_pet_desc' },
    { id: 'delivery_moto', icon: Bike, titleKey: 'delivery_service_moto_title', descriptionKey: 'delivery_service_moto_desc'},
    { id: 'delivery_car', icon: Car, titleKey: 'delivery_service_car_title', descriptionKey: 'delivery_service_car_desc'},
    { id: 'delivery_van', icon: Truck, titleKey: 'delivery_service_van_title', descriptionKey: 'delivery_service_van_desc'},
    { id: 'moto_economica', icon: Bike, titleKey: 'mototaxi_service_economic_title', descriptionKey: 'mototaxi_service_economic_desc' },
    { id: 'moto_rapida', icon: Bike, titleKey: 'mototaxi_service_fast_title', descriptionKey: 'mototaxi_service_fast_desc' },
    { id: 'moto_bau', icon: Box, titleKey: 'mototaxi_service_box_title', descriptionKey: 'mototaxi_service_box_desc' },
    { id: 'tuk_tuk', icon: Car, titleKey: 'mototaxi_service_tuktuk_title', descriptionKey: 'mototaxi_service_tuktuk_desc' },
    { id: 'acessível', icon: Car, titleKey: 'vehicle_type_accessible', descriptionKey: 'category_accessible_desc' },
];
