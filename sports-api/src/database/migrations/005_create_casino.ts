import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Casino providers table
  await knex.schema.createTable('casino_providers', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('code', 50).unique().notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Casino categories table
  await knex.schema.createTable('casino_categories', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('slug', 50).unique().notNullable();
    table.integer('order').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Casino games table
  await knex.schema.createTable('casino_games', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.integer('provider_id').references('id').inTable('casino_providers').onDelete('SET NULL');
    table.integer('category_id').references('id').inTable('casino_categories').onDelete('SET NULL');
    table.string('name', 255).notNullable();
    table.string('thumbnail', 500);
    table.string('game_code', 100).notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    table.index('provider_id');
    table.index('category_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('casino_games');
  await knex.schema.dropTableIfExists('casino_categories');
  await knex.schema.dropTableIfExists('casino_providers');
}
