
export const knowledgeBase = {
  main: {
    welcomeKey: 'support_welcome',
    promptKey: 'support_main_prompt',
    categories: [
      { id: 'travel', labelKey: 'support_cat_travel' },
      { id: 'payments', labelKey: 'support_cat_payments' },
      { id: 'registration', labelKey: 'support_cat_registration' },
      { id: 'promotions', labelKey: 'support_cat_promotions' },
      { id: 'driver_support', labelKey: 'support_cat_driver_support' },
      { id: 'fleet_support', labelKey: 'support_cat_fleet_support' },
      { id: 'technical', labelKey: 'support_cat_technical' },
      { id: 'human_support', labelKey: 'support_cat_human_support' },
    ],
  },
  travel: {
    promptKey: 'support_travel_prompt',
    options: [
      { id: 'travel_q_request', labelKey: 'support_travel_q_request' },
      { id: 'travel_q_track', labelKey: 'support_travel_q_track' },
      { id: 'travel_q_problem', labelKey: 'support_travel_q_problem' },
      { id: 'travel_q_history', labelKey: 'support_travel_q_history' },
      { id: 'travel_q_cancel', labelKey: 'support_travel_q_cancel' },
    ],
    answers: {
        travel_q_request: 'support_travel_a_request',
        travel_q_track: 'support_travel_a_track',
        travel_q_problem: 'support_travel_a_problem',
        travel_q_history: 'support_travel_a_history',
        travel_q_cancel: 'support_travel_a_cancel',
    }
  },
  payments: {
    promptKey: 'support_payments_prompt',
     options: [
      { id: 'payments_q_methods', labelKey: 'support_payments_q_methods' },
      { id: 'payments_q_charge_issue', labelKey: 'support_payments_q_charge_issue' },
      { id: 'payments_q_refund', labelKey: 'support_payments_q_refund' },
      { id: 'payments_q_wallet', labelKey: 'support_payments_q_wallet' },
    ],
    answers: {
        payments_q_methods: 'support_payments_a_methods',
        payments_q_charge_issue: 'support_payments_a_charge_issue',
        payments_q_refund: 'support_payments_a_refund',
        payments_q_wallet: 'support_payments_a_wallet',
    }
  },
  registration: {
    promptKey: 'support_registration_prompt',
    options: [
        { id: 'registration_q_create', labelKey: 'support_registration_q_create' },
        { id: 'registration_q_update', labelKey: 'support_registration_q_update' },
        { id: 'registration_q_login', labelKey: 'support_registration_q_login' },
        { id: 'registration_q_delete', labelKey: 'support_registration_q_delete' },
    ],
    answers: {
        registration_q_create: 'support_registration_a_create',
        registration_q_update: 'support_registration_a_update',
        registration_q_login: 'support_registration_a_login',
        registration_q_delete: 'support_registration_a_delete',
    }
  },
  promotions: {
    promptKey: 'support_promotions_prompt',
    options: [
        { id: 'promotions_q_how', labelKey: 'support_promotions_q_how' },
        { id: 'promotions_q_referral', labelKey: 'support_promotions_q_referral' },
        { id: 'promotions_q_not_working', labelKey: 'support_promotions_q_not_working' },
    ],
    answers: {
        promotions_q_how: 'support_promotions_a_how',
        promotions_q_referral: 'support_promotions_a_referral',
        promotions_q_not_working: 'support_promotions_a_not_working',
    }
  },
  driver_support: {
      promptKey: 'support_driver_support_prompt',
       options: [
        { id: 'driver_q_register', labelKey: 'support_driver_q_register' },
        { id: 'driver_q_docs', labelKey: 'support_driver_q_docs' },
        { id: 'driver_q_earnings', labelKey: 'support_driver_q_earnings' },
        { id: 'driver_q_app', labelKey: 'support_driver_q_app' },
    ],
    answers: {
        driver_q_register: 'support_driver_a_register',
        driver_q_docs: 'support_driver_a_docs',
        driver_q_earnings: 'support_driver_a_earnings',
        driver_q_app: 'support_driver_a_app',
    }
  },
   fleet_support: {
      promptKey: 'support_fleet_support_prompt',
       options: [
        { id: 'fleet_q_register', labelKey: 'support_fleet_q_register' },
        { id: 'fleet_q_add_driver', labelKey: 'support_fleet_q_add_driver' },
        { id: 'fleet_q_manage_routes', labelKey: 'support_fleet_q_manage_routes' },
        { id: 'fleet_q_reports', labelKey: 'support_fleet_q_reports' },
    ],
    answers: {
        fleet_q_register: 'support_fleet_a_register',
        fleet_q_add_driver: 'support_fleet_a_add_driver',
        fleet_q_manage_routes: 'support_fleet_a_manage_routes',
        fleet_q_reports: 'support_fleet_a_reports',
    }
  },
  technical: {
      promptKey: 'support_technical_prompt',
      options: [
        { id: 'technical_q_bug', labelKey: 'support_technical_q_bug' },
        { id: 'technical_q_suggestion', labelKey: 'support_technical_q_suggestion' },
        { id: 'technical_q_connection', labelKey: 'support_technical_q_connection' },
    ],
    answers: {
        technical_q_bug: 'support_technical_a_bug',
        technical_q_suggestion: 'support_technical_a_suggestion',
        technical_q_connection: 'support_technical_a_connection',
    }
  },
  human_support: {
      isContact: true,
      promptKey: 'support_human_escalation_prompt',
  }
};
