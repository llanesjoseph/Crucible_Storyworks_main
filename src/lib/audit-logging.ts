
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const AuditEventSchema = z.object({
  userId: z.string().min(1),
  userEmail: z.string().email().nullable(),
  action: z.string().min(1),
  targetResourceId: z.string().optional(),
  details: z.record(z.any()).optional(),
  timestamp: z.string().datetime(),
});

type AuditEventInput = z.infer<typeof AuditEventSchema>;

/**
 * Logs a significant user action to the `auditLogs` collection in Firestore.
 * This function should be called from server actions to ensure security.
 * @param event - The event data to log.
 */
export async function logAuditEvent(event: Omit<AuditEventInput, 'timestamp'>): Promise<void> {
  const eventToLog: AuditEventInput = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  const validatedEvent = AuditEventSchema.safeParse(eventToLog);

  if (!validatedEvent.success) {
    console.error("Invalid audit event data:", validatedEvent.error);
    // In a production app, you might throw an error or log to a different system.
    // For now, we'll log the error and not save the invalid event.
    return;
  }

  try {
    const auditLogsCollection = collection(db, 'auditLogs');
    await addDoc(auditLogsCollection, validatedEvent.data);
  } catch (error) {
    console.error("Failed to write to audit log:", error);
    // We don't re-throw the error, as the primary action (e.g., deleting a story)
    // should not fail if the audit log write fails. We log it for monitoring.
  }
}
