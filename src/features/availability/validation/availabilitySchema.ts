import { z } from 'zod';

import type { AvailabilityInput, AvailabilityStatus } from '@/features/availability/services/availabilityService';

const STATUS = z.enum(['available', 'unavailable', 'tentative', 'booked']);

/** Local calendar date + 24h time, converted to an ISO timestamptz on save. */
export const availabilityFormSchema = z
  .object({
    serviceId: z.string(),
    date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD for the date.'),
    startTime: z
      .string()
      .trim()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM for the start time.'),
    endTime: z
      .string()
      .trim()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM for the end time.'),
    status: STATUS,
    notes: z.string().trim().max(500, 'Keep notes under 500 characters.'),
  })
  .superRefine((value, ctx) => {
    const start = combineLocalDateTime(value.date, value.startTime);
    const end = combineLocalDateTime(value.date, value.endTime);
    if (!start || !end) {
      ctx.addIssue({ code: 'custom', message: 'Enter a valid date and time.', path: ['date'] });
      return;
    }
    if (end <= start) {
      ctx.addIssue({ code: 'custom', message: 'End time must be after the start time.', path: ['endTime'] });
    }
  });

export type AvailabilityFormInput = z.input<typeof availabilityFormSchema>;
export type AvailabilityFormValues = z.output<typeof availabilityFormSchema>;

export function combineLocalDateTime(date: string, time: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match || !timeMatch) return null;
  const result = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(timeMatch[1]),
    Number(timeMatch[2]),
    0,
    0,
  );
  return Number.isNaN(result.getTime()) ? null : result;
}

export function toAvailabilityInput(values: AvailabilityFormValues): AvailabilityInput {
  const start = combineLocalDateTime(values.date, values.startTime)!;
  const end = combineLocalDateTime(values.date, values.endTime)!;
  return {
    serviceId: values.serviceId || null,
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    status: values.status as AvailabilityStatus,
    notes: values.notes ? values.notes : null,
  };
}

export function splitIsoToForm(isoStart: string, isoEnd: string): Pick<AvailabilityFormInput, 'date' | 'startTime' | 'endTime'> {
  const start = new Date(isoStart);
  const end = new Date(isoEnd);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    startTime: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
    endTime: `${pad(end.getHours())}:${pad(end.getMinutes())}`,
  };
}
