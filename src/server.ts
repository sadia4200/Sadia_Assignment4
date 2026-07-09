import app from "./app";
import config from "./config";

const startServer = async (): Promise<void> => {
  try {
    app.listen(config.port, () => {
      console.log(
        `🚀 FixItNow API server is running on http://localhost:${config.port}`
      );
      console.log(`📋 Health check: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
