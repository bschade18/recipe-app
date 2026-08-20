import Fastify from "fastify";
import { db } from "./db.js";

const app = Fastify({
  logger: true,
});

app.get("/health", async () => {
  return {
    status: "healthy",
  };
});

app.get("/db-health", async () => {
  const result = await db.query("SELECT NOW()");

  return {
    status: "healthy",
    databaseTime: result.rows[0].now,
  };
});

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

app.post("/recipes", async (request, reply) => {
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
});

const start = async () => {
  try {
    await app.listen({
      port: 3000,
      host: "0.0.0.0",
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
