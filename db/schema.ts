import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const releases = sqliteTable('releases', {
 id: text('id').primaryKey(), version: text('version').notNull(), key: text('key').notNull(),
 size: integer('size').notNull(), notes: text('notes').notNull(), minimum: text('minimum').notNull(),
 created: text('created').notNull(), active: integer('active').notNull().default(0),
});
export const uploads = sqliteTable('uploads', {
 id: text('id').primaryKey(), owner: text('owner').notNull(), key: text('key').notNull(), multipart: text('multipart').notNull(),
 version: text('version').notNull(), size: integer('size').notNull(), notes: text('notes').notNull(), minimum: text('minimum').notNull(),
 created: text('created').notNull(), state: text('state').notNull().default('pending'),
});
export const parts = sqliteTable('upload_parts', {
 id: text('id').primaryKey(), upload: text('upload').notNull(), number: integer('number').notNull(), etag: text('etag').notNull(), size: integer('size').notNull(),
});
export const admins = sqliteTable('admins', { email: text('email').primaryKey(), subject: text('subject').notNull() });
