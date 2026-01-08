import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('mobile_number', 20).unique().notNullable();
    table.string('dialing_code', 5).notNullable().defaultTo('+233');
    table.string('password_hash', 255).notNullable();
    table.string('email', 255).unique();
    table.string('nickname', 100);
    table.string('first_name', 100);
    table.string('last_name', 100);
    table.string('gender', 10);
    table.date('birth_date');
    table.enum('kyc_status', ['pending', 'verified', 'rejected']).defaultTo('pending');
    table.string('member_type', 50).defaultTo('standard');
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_verified').defaultTo(false);
    table.timestamps(true, true);

    table.index('mobile_number');
    table.index('email');
  });

  // Refresh tokens table
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token_hash', 255).notNullable();
    table.jsonb('device_info');
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('user_id');
    table.index('token_hash');
  });

  // OTP codes table
  await knex.schema.createTable('otp_codes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('mobile_number', 20).notNullable();
    table.string('code', 6).notNullable();
    table.enum('purpose', ['register', 'reset_password', 'verify']).notNullable();
    table.integer('attempts').defaultTo(0);
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('mobile_number');
  });

  // User settings table
  await knex.schema.createTable('user_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').unique().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('odds_format', ['decimal', 'fractional', 'american', 'hongkong', 'malay', 'indonesian']).defaultTo('decimal');
    table.enum('auto_accept_odds', ['none', 'higher', 'any']).defaultTo('none');
    table.boolean('notifications_enabled').defaultTo(true);
    table.boolean('sound_enabled').defaultTo(true);
    table.string('language', 10).defaultTo('en');
    table.string('timezone', 50).defaultTo('UTC');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_settings');
  await knex.schema.dropTableIfExists('otp_codes');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('users');
}
