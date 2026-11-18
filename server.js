import app from "./app.js";
import { env } from "./config/env.js";
import { checkExpire } from "./jobs/expireReservations.js";

app.listen(env.PORT, () => {
  checkExpire();
  console.log(`Listening on port ${env.PORT}`);
});
