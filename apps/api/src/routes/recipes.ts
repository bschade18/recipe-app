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
      };

      const result = await db.query(
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

      return reply.code(201).send(result.rows[0]);
    },
  );
}
