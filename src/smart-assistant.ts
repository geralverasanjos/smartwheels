// src/lib/smart-assistant.ts

/**
 * @fileOverview Represents the Smart Assistant, an AI helper for the user.
 * This class generates contextual messages locally without calling an external AI flow.
 */

export class SmartAssistant {
  private t: (key: string) => string;

  constructor(t: (key: string) => string) {
    this.t = t;
  }

  public getContextualTip(userRole: string, pageName: string): string {
    switch (userRole) {
      case 'Passenger':
        switch (pageName) {
          case 'Passenger Dashboard':
            return this.t('robozinho_passenger_dashboard_message');
          case 'Profile Page':
            return this.t('robozinho_passenger_profile_message');
          case 'Wallet Page':
            return this.t('robozinho_passenger_wallet_message');
          default:
            return this.t('robozinho_passenger_default_message');
        }
      case 'Driver':
         return this.t('robozinho_driver_dashboard_message');
      case 'Mototaxi Driver':
         return this.t('robozinho_mototaxi_dashboard_message');
      case 'Fleet Manager':
        switch (pageName) {
            case 'Fleet Manager Dashboard':
                return this.t('robozinho_fleet_manager_dashboard_message');
            case 'Fleet Monitoring':
                return this.t('robozinho_fleet_manager_monitoring_message');
            default:
                return this.t('robozinho_fleet_manager_default_message');
        }
      default:
        return this.t('robozinho_message');
    }
  }
}
