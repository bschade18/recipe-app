import type { FastifyInstance } from "fastify";
import { db } from "../db.js";
import * as cheerio from "cheerio";

import {
  cleanText,
  parseDurationMinutes,
  parseServings,
} from "../utils/recipe-import.js";

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
        updated_at,
        source_url
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
            sourceUrl: {
              type: "string",
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
        sourceUrl?: string;
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
        notes,
        source_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
          [
            body.title,
            body.description ?? null,
            body.prepMinutes ?? null,
            body.cookMinutes ?? null,
            body.servings ?? null,
            body.notes ?? null,
            body.sourceUrl ?? null,
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

  app.patch(
    "/recipes/:id",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            title: {
              type: "string",
              minLength: 1,
            },
            description: {
              type: "string",
            },
            prepMinutes: {
              type: "integer",
              minimum: 0,
            },
            cookMinutes: {
              type: "integer",
              minimum: 0,
            },
            servings: {
              type: "integer",
              minimum: 1,
            },
            notes: {
              type: "string",
            },
            isFavorite: {
              type: "boolean",
            },
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
      const { id } = request.params as { id: string };

      const body = request.body as {
        title?: string;
        description?: string;
        prepMinutes?: number;
        cookMinutes?: number;
        servings?: number;
        notes?: string;
        isFavorite?: boolean;
        ingredients?: string[];
        steps?: string[];
      };

      const client = await db.connect();

      try {
        await client.query("BEGIN");

        const recipeResult = await client.query(
          `
          UPDATE recipes
          SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            prep_minutes = COALESCE($3, prep_minutes),
            cook_minutes = COALESCE($4, cook_minutes),
            servings = COALESCE($5, servings),
            notes = COALESCE($6, notes),
            is_favorite = COALESCE($7, is_favorite),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $8
          RETURNING *
        `,
          [
            body.title,
            body.description,
            body.prepMinutes,
            body.cookMinutes,
            body.servings,
            body.notes,
            body.isFavorite,
            id,
          ],
        );

        if (recipeResult.rows.length === 0) {
          await client.query("ROLLBACK");

          return reply.code(404).send({
            message: "Recipe not found",
          });
        }

        if (body.ingredients) {
          await client.query(
            `
            DELETE FROM recipe_ingredients
            WHERE recipe_id = $1
          `,
            [id],
          );

          for (const [index, ingredient] of body.ingredients.entries()) {
            await client.query(
              `
              INSERT INTO recipe_ingredients (
                recipe_id,
                position,
                text
              )
              VALUES ($1, $2, $3)
            `,
              [id, index + 1, ingredient],
            );
          }
        }

        if (body.steps) {
          await client.query(
            `
            DELETE FROM recipe_steps
            WHERE recipe_id = $1
          `,
            [id],
          );

          for (const [index, step] of body.steps.entries()) {
            await client.query(
              `
              INSERT INTO recipe_steps (
                recipe_id,
                position,
                instruction
              )
              VALUES ($1, $2, $3)
            `,
              [id, index + 1, step],
            );
          }
        }

        await client.query("COMMIT");

        return recipeResult.rows[0];
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

  app.post(
    "/recipes/import-url",
    {
      schema: {
        body: {
          type: "object",
          required: ["url"],
          properties: {
            url: {
              type: "string",
              minLength: 1,
            },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const { url } = request.body as { url: string };

      const response = await fetch(url);

      if (!response.ok) {
        return reply.code(400).send({
          message: "Failed to fetch recipe URL",
        });
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const jsonLdBlocks = $('script[type="application/ld+json"]')
        .map((_, element) => $(element).html())
        .get();

      let recipeData: any = null;

      for (const block of jsonLdBlocks) {
        if (!block) continue;

        try {
          const parsed = JSON.parse(block);

          const candidates = Array.isArray(parsed)
            ? parsed
            : parsed["@graph"]
              ? parsed["@graph"]
              : [parsed];

          recipeData = candidates.find(
            (item: any) =>
              item["@type"] === "Recipe" || item["@type"]?.includes?.("Recipe"),
          );

          if (recipeData) {
            break;
          }
        } catch {
          // ignore invalid JSON-LD blocks
        }
      }

      if (!recipeData) {
        return reply.code(422).send({
          message: "No recipe data found on this page",
        });
      }

      console.log("recipeYield:", recipeData.recipeYield);

      const ingredients = (recipeData.recipeIngredient ?? []).map(
        (ingredient: string) => cleanText(ingredient),
      );

      const steps = Array.isArray(recipeData.recipeInstructions)
        ? recipeData.recipeInstructions
            .map((step: any) => {
              const text = typeof step === "string" ? step : (step.text ?? "");

              return cleanText(text);
            })
            .filter(Boolean)
        : [];

      const prepMinutes = parseDurationMinutes(recipeData.prepTime);
      const cookMinutes = parseDurationMinutes(recipeData.cookTime);
      const servings = parseServings(recipeData.recipeYield);

      return {
        title: cleanText(recipeData.name ?? ""),
        description: cleanText(recipeData.description ?? ""),
        prepMinutes,
        cookMinutes,
        servings,
        ingredients,
        steps,
      };
    },
  );
}
