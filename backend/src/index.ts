import dotenv from 'dotenv';
import express from 'express';
import { checkDB, syncDB } from "./config/db.ts";
import models from "./models/index.ts";
import seedAll from "./models/seed/seed.ts";
import routes from "./routes/routes.ts";
import cors from "cors";
import { swaggerSpec, swaggerUiOptions } from './config/swagger.ts'
import swaggerUi from 'swagger-ui-express'
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const PORT = process.env.APP_PORT;
const app = express();

app.use(express.json());
app.use(cors());

app.use('/api', routes);

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
        docExpansion: 'none'
    }
}));

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