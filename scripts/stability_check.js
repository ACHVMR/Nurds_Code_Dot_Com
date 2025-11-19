import { spawn } from 'child_process';
import http from 'http';

const WORKER_PORT = 8787;
const HEALTH_ENDPOINT = `http://localhost:${WORKER_PORT}/api/health`;

function log(message) {
    console.log(`[Stability Check] ${message}`);
}

function error(message) {
    console.error(`[Stability Check] ERROR: ${message}`);
    process.exit(1);
}

async function checkBackend() {
    log('Starting backend worker...');
    const worker = spawn('npm', ['run', 'worker:dev'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
    });

    let workerReady = false;

    worker.stdout.on('data', (data) => {
        const output = data.toString();
        // console.log(output); // Uncomment for debug
        if (output.includes('Ready on')) {
            workerReady = true;
        }
    });

    worker.stderr.on('data', (data) => {
        // console.error(data.toString()); // Uncomment for debug
    });

    // Wait for worker to start
    log('Waiting for worker to be ready...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    log(`Checking health endpoint: ${HEALTH_ENDPOINT}`);
    
    return new Promise((resolve, reject) => {
        const req = http.get(HEALTH_ENDPOINT, (res) => {
            log(`Backend responded with status: ${res.statusCode}`);
            if (res.statusCode === 200) {
                log('Backend health check PASSED');
                resolve(true);
            } else {
                reject(new Error(`Backend returned status ${res.statusCode}`));
            }
        });

        req.on('error', (err) => {
            reject(new Error(`Failed to connect to backend: ${err.message}`));
        });

        req.end();
    }).finally(() => {
        log('Stopping backend worker...');
        // On Windows, killing the npm process might not kill the child node process.
        // Using taskkill to be sure if needed, but tree-kill is better if available.
        // For now, we'll try standard kill.
        if (process.platform === 'win32') {
             spawn("taskkill", ["/pid", worker.pid, '/f', '/t']);
        } else {
            worker.kill();
        }
    });
}

async function checkFrontend() {
    log('Building frontend...');
    return new Promise((resolve, reject) => {
        const build = spawn('npm', ['run', 'build'], {
            stdio: 'inherit',
            shell: true
        });

        build.on('close', (code) => {
            if (code === 0) {
                log('Frontend build PASSED');
                resolve(true);
            } else {
                reject(new Error(`Frontend build failed with code ${code}`));
            }
        });
    });
}

async function run() {
    try {
        await checkBackend();
        await checkFrontend();
        log('All stability checks PASSED');
        process.exit(0);
    } catch (err) {
        error(err.message);
    }
}

run();
