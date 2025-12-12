
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// Auth middleware using shared secret
const authMiddleware = (req, res, next) => {
  const sharedSecret = process.env.AGENT_RUNTIME_SHARED_SECRET;
  const authHeader = req.headers['x-agent-runtime-secret'];

  if (!sharedSecret) {
    console.error('AGENT_RUNTIME_SHARED_SECRET not configured');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  if (authHeader !== sharedSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.post('/execute', authMiddleware, (req, res) => {
  // Minimal placeholder implementation for now
  const { traceId, jobType, payload } = req.body;
  console.log(`[${traceId}] Executing job ${jobType}`);
  
  // TODO: Add actual job execution logic here
  
  res.status(200).json({ 
    status: 'success', 
    traceId,
    data: { message: 'Job accepted' } 
  });
});

app.listen(port, () => {
  console.log(`Agent Runtime listening on port ${port}`);
});
