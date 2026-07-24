const dotenv = require("dotenv");
const { app, shutdown } = require("./app");

dotenv.config();

const initialPort = Number(process.env.PORT || 3000);
const maxPortAttempts = Number(process.env.PORT_RETRY_ATTEMPTS || 5);

if (!Number.isInteger(initialPort) || initialPort <= 0) {
  throw new Error("PORT must be a valid positive integer.");
}

if (!Number.isInteger(maxPortAttempts) || maxPortAttempts <= 0) {
  throw new Error("PORT_RETRY_ATTEMPTS must be a valid positive integer.");
}

let server;

function startServer(port, attemptsLeft) {
  server = app
    .listen(port, () => {
      console.log(`AMBS API running on port ${port}`);
    })
    .on("error", (error) => {
      if (error.code === "EADDRINUSE" && attemptsLeft > 1) {
        const nextPort = port + 1;
        console.warn(
          `Port ${port} is already in use. Retrying on port ${nextPort}...`
        );
        startServer(nextPort, attemptsLeft - 1);
        return;
      }

      console.error(`Failed to start AMBS API on port ${port}.`, error);
      process.exit(1);
    });
}

startServer(initialPort, maxPortAttempts);

async function handleExit(signal) {
  console.log(`Received ${signal}. Closing server...`);
  if (!server || !server.listening) {
    await shutdown();
    process.exit(0);
    return;
  }

  server.close(async () => {
    await shutdown();
    process.exit(0);
  });
}

process.on("SIGINT", () => handleExit("SIGINT"));
process.on("SIGTERM", () => handleExit("SIGTERM"));
