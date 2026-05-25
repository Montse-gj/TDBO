import 'dotenv/config';
import express from 'express';
import { checkDB, syncDB } from "./config/db.ts";
import models from "./models/index.ts";
import seedAll from "./models/seed/seed.ts";
import routes from "./routes/routes.ts";
import cors from 'cors';

const PORT = process.env.APP_PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(cors());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
    await checkDB();
    await syncDB();

    if (await models.User.count() === 0) {
        await seedAll();
    }

    app.listen(PORT, () => {
        console.log(`Server up on port:${PORT}`);
    });
}

startServer();