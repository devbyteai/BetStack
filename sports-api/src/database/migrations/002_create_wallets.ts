import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Wallets table
  await knex.schema.createTable('wallets', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').unique().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.decimal('balance', 15, 2).defaultTo(0);
    table.decimal('bonus_balance', 15, 2).defaultTo(0);
    table.string('currency', 3).defaultTo('GHS');
    table.timestamps(true, true);

    table.index('user_id');
  });

  // Transactions table
  await knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('wallet_id').notNullable().references('id').inTable('wallets').onDelete('CASCADE');
    table.enum('type', ['deposit', 'withdrawal', 'bet', 'win', 'bonus', 'bonus_withdrawal', 'cashout']).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.decimal('balance_before', 15, 2).notNullable();
    table.decimal('balance_after', 15, 2).notNullable();
    table.enum('status', ['pending', 'completed', 'failed', 'cancelled']).defaultTo('pending');
    table.string('payment_method', 50);
    table.enum('payment_provider', ['mtn', 'vodafone', 'airteltigo']);
    table.string('external_ref', 255);
    table.jsonb('metadata');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('user_id');
    table.index('wallet_id');
    table.index('type');
    table.index('status');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
  await knex.schema.dropTableIfExists('wallets');
}
