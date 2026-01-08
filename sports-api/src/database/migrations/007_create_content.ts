import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Banners table
  await knex.schema.createTable('banners', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255);
    table.string('image_url', 500).notNullable();
    table.string('link_url', 500);
    table.enum('position', ['home', 'casino', 'sports', 'featured']).defaultTo('home');
    table.integer('order').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    table.index('position');
    table.index('is_active');
  });

  // News table
  await knex.schema.createTable('news', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.text('content').notNullable();
    table.string('thumbnail', 500);
    table.string('category', 50);
    table.timestamp('published_at');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    table.index('category');
    table.index('published_at');
  });

  // Info pages table
  await knex.schema.createTable('info_pages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('slug', 100).unique().notNullable();
    table.string('title', 255).notNullable();
    table.text('content').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Jobs table
  await knex.schema.createTable('jobs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title', 255).notNullable();
    table.text('description').notNullable();
    table.text('requirements');
    table.string('location', 100);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Job applications table
  await knex.schema.createTable('job_applications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('job_id').notNullable().references('id').inTable('jobs').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.string('email', 255).notNullable();
    table.string('phone', 20);
    table.string('resume_url', 500);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('job_id');
  });

  // Franchise inquiries table
  await knex.schema.createTable('franchise_inquiries', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.string('email', 255).notNullable();
    table.string('phone', 20);
    table.text('message');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('franchise_inquiries');
  await knex.schema.dropTableIfExists('job_applications');
  await knex.schema.dropTableIfExists('jobs');
  await knex.schema.dropTableIfExists('info_pages');
  await knex.schema.dropTableIfExists('news');
  await knex.schema.dropTableIfExists('banners');
}
