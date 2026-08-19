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
