import { neon, neonConfig } from '@neondatabase/serverless';
import { WebSocket } from 'ws';

// Configure WebSocket constructor for Neon serverless driver
neonConfig.webSocketConstructor = WebSocket;

const sql = neon(process.env.DATABASE_URL!);

export default sql;
