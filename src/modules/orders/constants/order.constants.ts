export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PAID: 'paid',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const PAYMENT_SIMULATION = {
  PROCESSING_DELAY: 1000,
  SUCCESS_RATE: 0.9,
  ERROR_MESSAGE: 'Payment processing failed',
} as const;

export const ORDER_DEFAULTS = {
  PAGE_SIZE: 10 as number,
  MAX_QUANTITY: 5,
  PAYMENT_REFERENCE_PREFIX: 'PAY_',
  TRANSACTION_PREFIX: 'TXN_',
} as const;

export type OrderStatusType = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
export type PaymentStatusType = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];