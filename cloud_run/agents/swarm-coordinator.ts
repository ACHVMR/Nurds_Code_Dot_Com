import express from 'express';
import { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// --- AGENT DEFINITIONS ---

class Agent {
    constructor(public name: string, public role: string) {}
    
    async think(input: string): Promise<string> {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));
        return `[${this.role}] ${this.name} processed: ${input.substring(0, 20)}...`;
    }
}

class ArchitectAgent extends Agent {
    constructor(name: string) { super(name, 'ARCHITECT'); }
    async propose(project: any) { 
        await this.think("Analyzing requirements...");
        return { 
            architecture: "Microservices on Cloud Run",
            stack: ["TypeScript", "Python", "Flutter"],
            modules: ["Auth", "Database", "Frontend"]
        }; 
    }
}

class CoderAgent extends Agent {
    constructor(name: string) { super(name, 'ENGINEER'); }
    async implement(moduleName: string) { 
        await this.think(`Writing code for ${moduleName}`);
        return `// Implementation for ${moduleName}\nclass ${moduleName}Controller { ... }`; 
    }
}

class ReviewerAgent extends Agent {
    constructor(name: string) { super(name, 'AUDITOR'); }
    async review(code: string) { 
        await this.think("Reviewing code against safety standards...");
        return { status: "APPROVED", comments: "Clean code, compliant with ORACLE standards." }; 
    }
}

class TesterAgent extends Agent {
    constructor(name: string) { super(name, 'QA_BOT'); }
    async runTests(moduleName: string) {
        await this.think(`Running test suite for ${moduleName}`);
        return { passed: 47, failed: 0 };
    }
}

// --- SWARM COORDINATOR ---

class AgentSwarm {
    private agents = {
        architect: new ArchitectAgent('Sarah'),
        coder: new CoderAgent('Marcus'),
        reviewer: new ReviewerAgent('Priya'),
        tester: new TesterAgent('Alex')
    };

    /**
     * Orchestrates the project discussion and streams events via SSE
     */
    async discussProject(userName: string, project: any, res: Response) {
        const emit = (data: any) => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        };

        try {
            // PHASE 1: Architecture
            emit({ type: 'message', agent: 'Sarah', text: `Hey ${userName}, analyzing your request for ${project.name}.` });
            const design = await this.agents.architect.propose(project);
            emit({ type: 'artifact', agent: 'Sarah', data: design });

            // PHASE 2: Development & Review Loop
            for (const module of design.modules) {
                // Handoff to Marcus
                emit({ type: 'message', agent: 'Marcus', text: `Starting implementation for ${module}...` });
                const code = await this.agents.coder.implement(module);
                emit({ type: 'code', agent: 'Marcus', data: code });

                // Handoff to Priya
                emit({ type: 'message', agent: 'Priya', text: `Reviewing ${module} code...` });
                const review = await this.agents.reviewer.review(code);
                
                if (review.status === 'APPROVED') {
                    emit({ type: 'message', agent: 'Priya', text: `Looks good! ${review.comments}` });
                } else {
                    emit({ type: 'message', agent: 'Priya', text: `Needs revision: ${review.comments}` });
                    // Logic to loop back would go here
                }

                // Handoff to Alex
                emit({ type: 'message', agent: 'Alex', text: `Running tests for ${module}...` });
                const tests = await this.agents.tester.runTests(module);
                emit({ type: 'status', agent: 'Alex', text: `Tests passed: ${tests.passed}` });
            }

            emit({ type: 'completion', text: "Mission Accomplished. System Ready." });
        } catch (error: any) {
            emit({ type: 'error', text: error.message });
        } finally {
            res.end();
        }
    }
}

const swarm = new AgentSwarm();

// --- BINDINGS ---

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'acheevy-runtime',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.send('Nurds Code Agent Runtime Active');
});

// Agent discussion endpoint (SSE)
app.post('/api/agent/discuss', async (req, res) => {
    const { userName, project } = req.body;

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    console.log(`Starting session for ${userName}`);
    await swarm.discussProject(userName, project || { name: "New Project" }, res);
});

// Simple agent invoke endpoint (non-SSE)
app.post('/api/agent/invoke', async (req, res) => {
    const { action, payload } = req.body;
    
    try {
        switch (action) {
            case 'architect':
                const design = await swarm['agents'].architect.propose(payload);
                res.json({ success: true, data: design });
                break;
            case 'code':
                const code = await swarm['agents'].coder.implement(payload?.module || 'default');
                res.json({ success: true, data: code });
                break;
            case 'review':
                const review = await swarm['agents'].reviewer.review(payload?.code || '');
                res.json({ success: true, data: review });
                break;
            case 'test':
                const tests = await swarm['agents'].tester.runTests(payload?.module || 'default');
                res.json({ success: true, data: tests });
                break;
            default:
                res.status(400).json({ success: false, error: 'Unknown action' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Agent Service listening at http://localhost:${port}`);
});
