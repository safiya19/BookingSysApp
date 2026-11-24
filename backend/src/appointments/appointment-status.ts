export const APPOINTMENT_STATUSES = ['CONFIRMED', 'CANCELLED'] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];
