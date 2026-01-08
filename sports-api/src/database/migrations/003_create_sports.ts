import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Sports table
  await knex.schema.createTable('sports', (table) => {
    table.increments('id').primary();
    table.integer('external_id').unique();
    table.string('name', 100).notNullable();
    table.string('alias', 50);
    table.integer('type').defaultTo(0);
    table.integer('order').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    table.index('external_id');
    table.index('alias');
  });

  // Regions table
  await knex.schema.createTable('regions', (table) => {
    table.increments('id').primary();
    table.integer('external_id').unique();
    table.integer('sport_id').notNullable().references('id').inTable('sports').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.string('alias', 50);
    table.integer('order').defaultTo(0);
    table.timestamps(true, true);

    table.index('external_id');
    table.index('sport_id');
  });

  // Competitions table
  await knex.schema.createTable('competitions', (table) => {
    table.increments('id').primary();
    table.integer('external_id').unique();
    table.integer('region_id').notNullable().references('id').inTable('regions').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.integer('order').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    table.index('external_id');
    table.index('region_id');
  });

  // Games table
  await knex.schema.createTable('games', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.bigInteger('external_id').unique();
    table.integer('competition_id').notNullable().references('id').inTable('competitions').onDelete('CASCADE');
    table.string('team1_name', 255).notNullable();
    table.string('team2_name', 255).notNullable();
    table.integer('team1_id');
    table.integer('team2_id');
    table.timestamp('start_ts').notNullable();
    table.integer('type').defaultTo(0); // 0=prematch, 1=live, 2=finished
    table.boolean('is_live').defaultTo(false);
    table.boolean('is_blocked').defaultTo(false);
    table.string('video_id', 100);
    table.string('tv_type', 50);
    table.jsonb('info'); // score, time, period, stats
    table.integer('markets_count').defaultTo(0);
    table.timestamps(true, true);

    table.index('external_id');
    table.index('competition_id');
    table.index('is_live');
    table.index('start_ts');
  });

  // Markets table
  await knex.schema.createTable('markets', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.bigInteger('external_id').unique();
    table.uuid('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.string('type', 100);
    table.string('display_key', 100);
    table.string('display_sub_key', 100);
    table.integer('express_id');
    table.decimal('base', 10, 2);
    table.integer('order').defaultTo(0);
    table.integer('col_count').defaultTo(2);
    table.integer('group_id');
    table.string('group_name', 100);
    table.boolean('cashout_enabled').defaultTo(true);
    table.boolean('is_suspended').defaultTo(false);
    table.timestamps(true, true);

    table.index('external_id');
    table.index('game_id');
  });

  // Events (odds) table
  await knex.schema.createTable('events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.bigInteger('external_id').unique();
    table.uuid('market_id').notNullable().references('id').inTable('markets').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.string('type', 50); // P1, X, P2, Over, Under, etc.
    table.decimal('price', 10, 3).notNullable();
    table.decimal('base', 10, 2);
    table.integer('order').defaultTo(0);
    table.boolean('is_suspended').defaultTo(false);
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('external_id');
    table.index('market_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('events');
  await knex.schema.dropTableIfExists('markets');
  await knex.schema.dropTableIfExists('games');
  await knex.schema.dropTableIfExists('competitions');
  await knex.schema.dropTableIfExists('regions');
  await knex.schema.dropTableIfExists('sports');
}
