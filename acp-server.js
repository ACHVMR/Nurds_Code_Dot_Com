import express from 'express';
import cors from 'cors';
import { acpRoutes } from './acp-integration/backend/routes.js';

const app = express();
const port = 3004; // Running on a separate port from Vite and the main worker

app.use(cors());
app.use(express.json());

// ACP Integration Routes
app.post('/api/acp/reimagine', acpRoutes.reimagine);
app.post('/api/acp/import', acpRoutes.importRepo);
app.post('/api/acp/lab', acpRoutes.testingLab);
app.post('/api/acp/agents', acpRoutes.createAgent);

app.listen(port, () => {
  console.log(`✅ ACP Express server listening at http://localhost:${port}`);
});
