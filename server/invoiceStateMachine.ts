import type { InvoiceStatus } from "@shared/schema";

// Allowed state transitions per SC-INV-001 ADR
export const ALLOWED_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ['sent', 'void'],
  sent: ['viewed', 'overdue', 'paid', 'void'],
  viewed: ['overdue', 'paid', 'void'],
  overdue: ['paid', 'void'],
  paid: [],   // terminal state
  void: [],   // terminal state
};

/**
 * Validates if a status transition is allowed
 * @throws Error if transition is not allowed
 */
export function assertTransition(from: InvoiceStatus, to: InvoiceStatus): void {
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new Error(`Invalid status transition: ${from} → ${to}`);
  }
}

/**
 * Checks if a status transition is allowed
 */
export function isTransitionAllowed(from: InvoiceStatus, to: InvoiceStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Returns human-readable list of allowed next states
 */
export function getAllowedTransitions(from: InvoiceStatus): InvoiceStatus[] {
  return ALLOWED_TRANSITIONS[from] || [];
}

/**
 * Checks if a status is terminal (no further transitions)
 */
export function isTerminalStatus(status: InvoiceStatus): boolean {
  return status === 'paid' || status === 'void';
}