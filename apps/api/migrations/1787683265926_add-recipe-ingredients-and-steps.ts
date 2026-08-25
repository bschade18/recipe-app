import type { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("recipe_ingredients", {
    id: {
      type: "bigserial",
      primaryKey: true,
    },
    recipe_id: {
      type: "bigint",
      notNull: true,
      references: "recipes",
      onDelete: "CASCADE",
    },
    position: {
      type: "integer",
      notNull: true,
    },
    text: {
      type: "text",
      notNull: true,
    },
  });

  pgm.createTable("recipe_steps", {
    id: {
      type: "bigserial",
      primaryKey: true,
    },
    recipe_id: {
      type: "bigint",
      notNull: true,
      references: "recipes",
      onDelete: "CASCADE",
    },
    position: {
      type: "integer",
      notNull: true,
    },
    instruction: {
      type: "text",
      notNull: true,
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("recipe_steps");
  pgm.dropTable("recipe_ingredients");
}
