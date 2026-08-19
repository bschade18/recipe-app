import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('recipes', {
    id: {
      type: 'bigserial',
      primaryKey: true,
    },
    title: {
      type: 'text',
      notNull: true,
    },
    description: {
      type: 'text',
    },
    prep_minutes: {
      type: 'integer',
    },
    cook_minutes: {
      type: 'integer',
    },
    servings: {
      type: 'integer',
    },
    notes: {
      type: 'text',
    },
    is_favorite: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('recipes');
}