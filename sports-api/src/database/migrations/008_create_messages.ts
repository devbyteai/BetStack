import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Messages table - system notifications and promotions
  await knex.schema.createTable('messages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.text('content').notNullable();
    table.enum('type', ['system', 'promotion', 'announcement', 'alert']).notNullable().defaultTo('system');
    table.enum('priority', ['low', 'normal', 'high', 'urgent']).notNullable().defaultTo('normal');
    table.string('image_url', 500);
    table.string('action_url', 500);
    table.string('action_label', 100);
    table.timestamp('starts_at').defaultTo(knex.fn.now());
    table.timestamp('expires_at');
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_global').defaultTo(true); // If false, targeted to specific users
    table.timestamps(true, true);

    table.index('type');
    table.index('is_active');
    table.index(['starts_at', 'expires_at']);
  });

  // User messages table - tracks read status per user
  await knex.schema.createTable('user_messages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('message_id').notNullable().references('id').inTable('messages').onDelete('CASCADE');
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at');
    table.boolean('is_dismissed').defaultTo(false);
    table.timestamp('dismissed_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['user_id', 'message_id']);
    table.index('user_id');
    table.index('message_id');
    table.index('is_read');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_messages');
  await knex.schema.dropTableIfExists('messages');
}
