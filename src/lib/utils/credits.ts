export type CreditAction = "chat_message" | "generate_widget" | "journal_reflection" | "onboarding_analysis";

export const CREDIT_COSTS: Record<CreditAction, number> = {
  chat_message: 1,
  generate_widget: 2,
  journal_reflection: 1,
  onboarding_analysis: 3,
};

export function getCreditCost(action: CreditAction): number {
  return CREDIT_COSTS[action];
}

export function hasEnoughCredits(balance: number, action: CreditAction): boolean {
  return balance >= CREDIT_COSTS[action];
}
