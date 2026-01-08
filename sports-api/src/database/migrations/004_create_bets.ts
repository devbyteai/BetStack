import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Bets table
  await knex.schema.createTable('bets', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('bet_type', ['single', 'multiple', 'system', 'chain']).notNullable();
    table.string('system_variant', 20); // For system bets: 2/3, 3/4, etc.
    table.decimal('stake', 15, 2).notNullable();
    table.decimal('total_odds', 15, 3).notNullable();
    table.decimal('potential_win', 15, 2).notNullable();
    table.enum('status', ['pending', 'won', 'lost', 'cashout', 'cancelled', 'returned']).defaultTo('pending');
    table.decimal('payout', 15, 2);
    table.enum('source', ['main_balance', 'bonus_balance']).defaultTo('main_balance');
    table.string('booking_code', 20).unique();
    table.decimal('cashout_amount', 15, 2);
    table.decimal('auto_cashout_value', 15, 2);
    table.timestamp('settled_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('user_id');
    table.index('status');
    table.index('booking_code');
    table.index('created_at');
  });

  // Bet selections table
  await knex.schema.createTable('bet_selections', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('bet_id').notNullable().references('id').inTable('bets').onDelete('CASCADE');
    table.uuid('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE');
    table.uuid('market_id').notNullable().references('id').inTable('markets').onDelete('CASCADE');
    table.uuid('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE');
    table.string('sport_alias', 50);
    table.string('team1_name', 255);
    table.string('team2_name', 255);
    table.string('market_name', 255);
    table.string('event_name', 100);
    table.decimal('odds_at_placement', 10, 3).notNullable();
    table.enum('outcome', ['pending', 'won', 'lost', 'returned']).defaultTo('pending');
    table.boolean('is_live').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('bet_id');
    table.index('game_id');
    table.index('outcome');
  });

  // Betting rules table
  await knex.schema.createTable('betting_rules', (table) => {
    table.increments('id').primary();
    table.enum('bet_type', ['single', 'multiple', 'system']).notNullable();
    table.integer('min_selections').defaultTo(1);
    table.integer('max_selections').defaultTo(20);
    table.decimal('bonus_percent', 5, 2).defaultTo(0);
    table.decimal('min_odds', 10, 3).defaultTo(1.3);
    table.boolean('ignore_low_odds').defaultTo(true);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Favorites table
  await knex.schema.createTable('favorites', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('game_id').references('id').inTable('games').onDelete('CASCADE');
    table.integer('competition_id').references('id').inTable('competitions').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['user_id', 'game_id']);
    table.unique(['user_id', 'competition_id']);
    table.index('user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('favorites');
  await knex.schema.dropTableIfExists('betting_rules');
  await knex.schema.dropTableIfExists('bet_selections');
  await knex.schema.dropTableIfExists('bets');
}
