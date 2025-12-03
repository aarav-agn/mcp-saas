import app from "./app";
import { env } from "./config/env";

const port = env.BACKEND_PORT;

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
