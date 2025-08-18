import type { TranslationKeys } from "@/lib/i18n";

export interface FAQ {
    questionKey: TranslationKeys;
    answerKey: TranslationKeys;
}

export const passengerFaqs: FAQ[] = [
    { questionKey: "faq_p_q1", answerKey: "faq_p_a1" },
    { questionKey: "faq_p_q2", answerKey: "faq_p_a2" },
    { questionKey: "faq_p_q3", answerKey: "faq_p_a3" },
];

export const driverFaqs: FAQ[] = [
    { questionKey: "faq_d_q1", answerKey: "faq_d_a1" },
    { questionKey: "faq_d_q2", answerKey: "faq_d_a2" },
    { questionKey: "faq_d_q3", answerKey: "faq_d_a3" },
];

export const fleetManagerFaqs: FAQ[] = [
    { questionKey: "faq_f_q1", answerKey: "faq_f_a1" },
    { questionKey: "faq_f_q2", answerKey: "faq_f_a2" },
];
