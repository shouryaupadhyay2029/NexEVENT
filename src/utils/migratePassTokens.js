/**
 * migratePassTokens.js — One-time Admin Migration Utility
 *
 * Adds `passToken` to existing registration documents that pre-date the
 * passToken system. This is safe to call multiple times — it is idempotent.
 *
 * SAFETY GUARANTEES:
 * - Never overwrites an existing valid passToken
 * - Never deletes registration data
 * - Only adds passToken + passQR to docs that are missing them
 * - Uses Firestore batch writes (chunked at 499 per batch)
 * - Reports total, migrated, and skipped counts
 *
 * HOW TO TRIGGER:
 * - Import and call from Admin Console only (admin-role-gated)
 * - NOT called automatically on page load or component mount
 * - Safe to run again if partially interrupted (idempotent)
 *
 * Example usage (Admin Console):
 *   import { migratePassTokens } from '../../services/registrationService';
 *   const result = await migratePassTokens();
 *   console.log(`Migrated ${result.migrated} of ${result.total} registrations`);
 */

// Re-export from registrationService for clean import path
export { migratePassTokens } from '../services/registrationService';
