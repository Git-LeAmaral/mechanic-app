/**
 * Ponte entre enums/valores do banco (Prisma) e o formato usado hoje no front.
 * Mantém o UI estável enquanto a persistência evolui.
 */

export type UiOsStatus =
  | 'budget'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type DbOsStatus =
  | 'BUDGET'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type UiAppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type DbAppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

const OS_STATUS_TO_DB: Record<UiOsStatus, DbOsStatus> = {
  budget: 'BUDGET',
  approved: 'APPROVED',
  in_progress: 'IN_PROGRESS',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
};

const OS_STATUS_TO_UI: Record<DbOsStatus, UiOsStatus> = {
  BUDGET: 'budget',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const APPT_STATUS_TO_DB: Record<UiAppointmentStatus, DbAppointmentStatus> = {
  scheduled: 'SCHEDULED',
  confirmed: 'CONFIRMED',
  in_progress: 'IN_PROGRESS',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
  no_show: 'NO_SHOW',
};

const APPT_STATUS_TO_UI: Record<DbAppointmentStatus, UiAppointmentStatus> = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

export function toDbOsStatus(status: UiOsStatus): DbOsStatus {
  return OS_STATUS_TO_DB[status];
}

export function toUiOsStatus(status: DbOsStatus): UiOsStatus {
  return OS_STATUS_TO_UI[status];
}

export function toDbAppointmentStatus(status: UiAppointmentStatus): DbAppointmentStatus {
  return APPT_STATUS_TO_DB[status];
}

export function toUiAppointmentStatus(status: DbAppointmentStatus): UiAppointmentStatus {
  return APPT_STATUS_TO_UI[status];
}

/** YYYY-MM-DD a partir de Date (UTC date parts — alinhar com seed mock). */
export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
