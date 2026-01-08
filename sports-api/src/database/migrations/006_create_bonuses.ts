import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Bonuses table
  await knex.schema.createTable('bonuses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.text('description');
    table.enum('type', ['welcome', 'deposit', 'free_bet', 'cashback']).notNullable();
    table.decimal('amount', 15, 2);
    table.decimal('percentage', 5, 2);
    table.decimal('min_deposit', 15, 2);
    table.decimal('min_odds', 10, 3);
    table.decimal('wagering_requirement', 5, 2).defaultTo(1);
    table.integer('expires_days').defaultTo(30);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // User bonuses table
  await knex.schema.createTable('user_bonuses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('bonus_id').notNullable().references('id').inTable('bonuses').onDelete('CASCADE');
    table.decimal('amount', 15, 2).notNullable();
    table.decimal('wagered_amount', 15, 2).defaultTo(0);
    table.decimal('required_wagering', 15, 2).notNullable();
    table.enum('status', ['active', 'completed', 'expired', 'cancelled']).defaultTo('active');
    table.timestamp('expires_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('user_id');
    table.index('status');
  });

  // Free bets table
  await knex.schema.createTable('free_bets', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.decimal('amount', 15, 2).notNullable();
    table.decimal('min_odds', 10, 3).defaultTo(1.5);
    table.timestamp('expires_at');
    table.boolean('is_used').defaultTo(false);
    table.uuid('used_bet_id').references('id').inTable('bets').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('user_id');
    table.index('is_used');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('free_bets');
  await knex.schema.dropTableIfExists('user_bonuses');
  await knex.schema.dropTableIfExists('bonuses');
}
