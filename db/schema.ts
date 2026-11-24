import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const checkerUsage = sqliteTable('checker_usage', {
  userId: text('user_id').primaryKey(),
  email: text('email'),
  checksUsed: integer('checks_used').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const contactInquiries = sqliteTable(
  'contact_inquiries',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    loginEmail: text('login_email'),
    replyEmail: text('reply_email').notNull(),
    name: text('name'),
    category: text('category').notNull(),
    paidFeatures: text('paid_features'),
    message: text('message').notNull(),
    diagnostics: text('diagnostics'),
    status: text('status').notNull().default('unread'),
    statusUpdatedAt: text('status_updated_at'),
    adminNote: text('admin_note'),
    adminNoteUpdatedAt: text('admin_note_updated_at'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_contact_inquiries_user_created').on(
      table.userId,
      table.createdAt,
    ),
  ],
);
