import { pgTable, serial, integer, numeric, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const electricityRecords = pgTable(
  'electricity_records',
  {
    id: serial('id').primaryKey(),
    yearBe: integer('year_be').notNull(),
    yearCe: integer('year_ce').notNull(),
    month: integer('month').notNull(), // 1 - 12
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('year_be_month_unique_idx').on(table.yearBe, table.month),
  ]
);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).default('admin').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type ElectricityRecord = typeof electricityRecords.$inferSelect;
export type NewElectricityRecord = typeof electricityRecords.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
