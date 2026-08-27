import type { FastifyInstance } from "fastify";
import { db } from "../db.js";

export async function recipeRoutes(app: FastifyInstance) {
  app.get("/recipes", async () => {
    const result = await db.query(`
      SELECT
        id,
        title,
        description,
        prep_minutes,
        cook_minutes,
        servings,
        notes,
        is_favorite,
        created_at,
        updated_at
      FROM recipes
      ORDER BY created_at DESC
    `);

    return result.rows;
  });

  app.get("/recipes/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const recipeResult = await db.query(
      `
      SELECT
        id,
        title,
        description,
        prep_minutes,
        cook_minutes,
        servings,
        notes,
        is_favorite,
        created_at,
        updated_at
      FROM recipes
      WHERE id = $1
    `,
      [id],
    );

    if (recipeResult.rows.length === 0) {
      return reply.code(404).send({
        message: "Recipe not found",
      });
    }

    const ingredientsResult = await db.query(
      `
      SELECT
        id,
        position,
        text
      FROM recipe_ingredients
      WHERE recipe_id = $1
      ORDER BY position
    `,
      [id],
    );

    const stepsResult = await db.query(
      `
      SELECT
        id,
        position,
        instruction
      FROM recipe_steps
      WHERE recipe_id = $1
      ORDER BY position
    `,
      [id],
    );

    return {
      ...recipeResult.rows[0],
      ingredients: ingredientsResult.rows,
      steps: stepsResult.rows,
    };
  });

  app.post(
    "/recipes",
    {
      schema: {
        body: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", minLength: 1 },
            description: { type: "string" },
            prepMinutes: { type: "integer", minimum: 0 },
            cookMinutes: { type: "integer", minimum: 0 },
            servings: { type: "integer", minimum: 1 },
            notes: { type: "string" },
            ingredients: {
              type: "array",
              items: {
                type: "string",
                minLength: 1,
              },
            },
            steps: {
              type: "array",
              items: {
                type: "string",
                minLength: 1,
              },
            },
          },

          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const body = request.body as {
        title: string;
        description?: string;
        prepMinutes?: number;
        cookMinutes?: number;
        servings?: number;
        notes?: string;
        ingredients?: string[];
        steps?: string[];
      };

      const client = await db.connect();

      try {
        await client.query("BEGIN");

        const recipeResult = await client.query(
          `
      INSERT INTO recipes (
        title,
        description,
        prep_minutes,
        cook_minutes,
        servings,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
          [
            body.title,
            body.description ?? null,
            body.prepMinutes ?? null,
            body.cookMinutes ?? null,
            body.servings ?? null,
            body.notes ?? null,
          ],
        );

        const recipe = recipeResult.rows[0];

        for (const [index, ingredient] of (body.ingredients ?? []).entries()) {
          await client.query(
            `
        INSERT INTO recipe_ingredients (
          recipe_id,
          position,
          text
        )
        VALUES ($1, $2, $3)
      `,
            [recipe.id, index + 1, ingredient],
          );
        }

        for (const [index, step] of (body.steps ?? []).entries()) {
          await client.query(
            `
        INSERT INTO recipe_steps (
          recipe_id,
          position,
          instruction
        )
        VALUES ($1, $2, $3)
      `,
            [recipe.id, index + 1, step],
          );
        }

        await client.query("COMMIT");

        return reply.code(201).send(recipe);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
  );

  app.delete("/recipes/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = await db.query(
      `
      DELETE from recipes
      WHERE id = $1
      RETURNING id
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return reply.code(404).send({
        message: "Recipe not found",
      });
    }

    return reply.code(204).send();
  });
}
