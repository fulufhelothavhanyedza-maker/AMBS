const dotenv = require("dotenv");
const { app, shutdown } = require("./app");

dotenv.config();

const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("PORT must be a valid positive integer.");
}

const server = app.listen(port, () => {
  console.log(`AMBS API running on port ${port}`);
});

async function handleExit(signal) {
  console.log(`Received ${signal}. Closing server...`);
  server.close(async () => {
    await shutdown();
    process.exit(0);
  });
}

process.on("SIGINT", () => handleExit("SIGINT"));
process.on("SIGTERM", () => handleExit("SIGTERM"));
