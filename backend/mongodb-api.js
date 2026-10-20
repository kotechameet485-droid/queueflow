const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// ============================================================================
// 1. Helper: Mask sensitive credentials from connection strings and error logs
// ============================================================================
function maskCredentials(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/\/\/[^:]+:[^@]+@/g, '//<credentials>@');
}

// ============================================================================
// 2. MongoDB URI Configuration & Validation
// ============================================================================
const rawMongoUri = process.env.MONGODB_URI;
let uri;

if (isProduction) {
    if (!rawMongoUri || !rawMongoUri.trim()) {
        console.error('\n============================================================');
        console.error('[QueueFlow MongoDB API] CRITICAL CONFIG ERROR: MONGODB_URI is required.');
        console.error('In production (NODE_ENV=production), MONGODB_URI must be set in your');
        console.error('Render environment variables with your MongoDB Atlas connection string.');
        console.error('============================================================\n');
        process.exit(1);
    }
    uri = rawMongoUri.trim();
} else {
    uri = (rawMongoUri && rawMongoUri.trim()) ? rawMongoUri.trim() : 'mongodb://127.0.0.1:27017';
}

if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.error('\n============================================================');
    console.error('[QueueFlow MongoDB API] CRITICAL CONFIG ERROR: MONGODB_URI is malformed.');
    console.error('Connection string must begin with "mongodb://" or "mongodb+srv://".');
    console.error('Please verify the MONGODB_URI environment variable format.');
    console.error('============================================================\n');
    process.exit(1);
}

// Initialize official MongoDB Client (TLS certificate validation strictly preserved)
const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000
});

const dbName = process.env.DB_NAME || 'queueflow_db';
const collectionName = process.env.COLLECTION_NAME || 'tokens';

let tokensCollection;

// ============================================================================
// 3. CORS Configuration
// ============================================================================
function normalizeOrigin(originStr) {
    if (!originStr || typeof originStr !== 'string') return '';
    return originStr.trim().replace(/\/+$/, '');
}

const configuredOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(normalizeOrigin).filter(Boolean)
    : [];

const localDevOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];

app.use(cors({
    origin: function (requestOrigin, callback) {
        // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
        if (!requestOrigin) {
            return callback(null, true);
        }

        const cleanRequestOrigin = normalizeOrigin(requestOrigin);

        if (configuredOrigins.length > 0) {
            if (configuredOrigins.includes(cleanRequestOrigin)) {
                return callback(null, true);
            }
            if (!isProduction && localDevOrigins.includes(cleanRequestOrigin)) {
                return callback(null, true);
            }
            return callback(new Error(`CORS blocked: Origin "${cleanRequestOrigin}" is not authorized.`));
        }

        // If CORS_ORIGIN is not set:
        if (!isProduction) {
            // In local development, permit requests for smooth developer experience
            return callback(null, true);
        } else {
            // In production, do not use an open wildcard; reject unknown origins
            return callback(new Error('CORS blocked: CORS_ORIGIN environment variable must be set in production.'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204
}));

app.use(express.json());

// Serve static frontend files when deployed together or locally
app.use(express.static(path.join(__dirname, '../frontend')));

// ============================================================================
// 4. Database Connection & Startup
// ============================================================================
async function connectDB() {
    try {
        await client.connect();
        const db = client.db(dbName);
        tokensCollection = db.collection(collectionName);

        console.log(`[QueueFlow MongoDB API] Connected to MongoDB at: ${maskCredentials(uri)}`);
        console.log(`[QueueFlow MongoDB API] Database: "${dbName}", Collection: "${collectionName}"`);

        // Verify and ensure unique index on token field without deleting records
        try {
            await tokensCollection.createIndex({ token: 1 }, { unique: true });
            console.log('[QueueFlow MongoDB API] Verified unique index on "token" field.');
        } catch (idxErr) {
            console.warn('[QueueFlow MongoDB API] Notice on "token" index:', idxErr.message);
        }
    } catch (err) {
        const safeErrMsg = maskCredentials(err.message || 'Unknown connection error');
        const fullErrStr = maskCredentials(`${err.message || ''} ${err.stack || ''} ${JSON.stringify(err)}`);

        console.error('\n============================================================');
        console.error('[QueueFlow MongoDB API] CRITICAL: Failed to connect to MongoDB server');
        console.error('============================================================');
        console.error('Error Details:', safeErrMsg);

        if (fullErrStr.includes('tlsv1 alert internal error') || fullErrStr.includes('SSL alert number 80') || fullErrStr.includes('ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR')) {
            console.error('\n[DIAGNOSTIC: TLS HANDSHAKE REJECTED BY MONGODB ATLAS]');
            console.error('Root Cause: MongoDB Atlas terminated the TLS handshake before authentication.');
            console.error('Common Causes & Fixes:');
            console.error('  1. Network Access (IP Whitelist): Render outgoing dynamic IPs must be whitelisted.');
            console.error('     -> In Atlas -> Security -> Network Access -> Add IP Address -> 0.0.0.0/0 (Allow Access from Anywhere).');
            console.error('  2. Inactive / Paused Cluster: Free-tier M0 clusters pause after periods of inactivity.');
            console.error('     -> Log in to https://cloud.mongodb.com and resume the cluster.');
            console.error('  3. Malformed or Outdated Cluster Hostname in MONGODB_URI.');
            console.error('     -> Re-copy your SRV connection string from Atlas -> Database -> Connect -> Drivers.');
        } else if (fullErrStr.includes('Authentication failed') || fullErrStr.includes('auth failed') || err.code === 8000) {
            console.error('\n[DIAGNOSTIC: AUTHENTICATION FAILED]');
            console.error('Root Cause: Invalid database username or password in MONGODB_URI.');
            console.error('  1. Verify the database user in Atlas under Security -> Database Access.');
            console.error('  2. If the password has special characters (@, :, /, %, etc.), ensure they are URL-encoded.');
        } else if (fullErrStr.includes('querySrv') || (fullErrStr.includes('ECONNREFUSED') && fullErrStr.includes('_mongodb._tcp'))) {
            console.error('\n[DIAGNOSTIC: DNS SRV LOOKUP FAILED]');
            console.error('Root Cause: Could not resolve cluster SRV record from hostname.');
            console.error('Verify that your cluster hostname in MONGODB_URI is correct.');
        } else if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
            console.error('\n[DIAGNOSTIC: LOCAL MONGODB UNREACHABLE]');
            console.error('Ensure your local MongoDB service is running (e.g. "net start MongoDB" on Windows).');
        }
        console.error('============================================================\n');
        process.exit(1);
    }
}

// ============================================================================
// 5. REST API Endpoints
// ============================================================================

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        if (!tokensCollection) {
            return res.status(503).json({
                status: 'error',
                message: 'Database connection not initialized'
            });
        }
        const count = await tokensCollection.countDocuments();
        res.status(200).json({
            status: 'ok',
            database: dbName,
            collection: collectionName,
            totalTokens: count,
            message: 'QueueFlow MongoDB API is active and connected'
        });
    } catch (err) {
        console.error('[QueueFlow Health Error]:', err.message);
        res.status(500).json({ status: 'error', message: 'Failed to query database health' });
    }
});

// Retrieve all tokens (sorted by order, then createdAt)
app.get('/api/tokens', async (req, res) => {
    try {
        const tokens = await tokensCollection.find({})
            .sort({ order: 1, createdAt: 1 })
            .toArray();
        res.status(200).json(tokens);
    } catch (error) {
        console.error('[QueueFlow Get Tokens Error]:', error.message);
        res.status(500).json({ error: 'Failed to retrieve tokens from database.' });
    }
});

// Reorder queue sequence
app.put('/api/tokens/reorder', async (req, res) => {
    try {
        const { tokens } = req.body || {};
        if (!Array.isArray(tokens)) {
            return res.status(400).json({ error: 'Invalid payload: "tokens" must be an array of token strings.' });
        }

        if (tokens.length === 0) {
            return res.status(200).json({
                message: 'No tokens provided to reorder',
                count: 0
            });
        }

        const sanitizedTokens = tokens.map(t => String(t).trim()).filter(Boolean);
        if (sanitizedTokens.length !== tokens.length) {
            return res.status(400).json({ error: 'Invalid payload: all tokens in array must be non-empty strings.' });
        }

        const bulkOps = sanitizedTokens.map((tokenCode, idx) => ({
            updateOne: {
                filter: { token: tokenCode },
                update: { $set: { order: idx + 1, updatedAt: new Date() } }
            }
        }));

        const result = await tokensCollection.bulkWrite(bulkOps);

        res.status(200).json({
            message: 'Queue order updated successfully in MongoDB',
            count: bulkOps.length,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('[QueueFlow Reorder Error]:', error.message);
        res.status(500).json({ error: 'Failed to reorder tokens in database.' });
    }
});

// Retrieve a single token
app.get('/api/tokens/:token', async (req, res) => {
    try {
        const tokenCode = String(req.params.token || '').trim();
        if (!tokenCode) {
            return res.status(400).json({ error: 'Token parameter is required.' });
        }

        const token = await tokensCollection.findOne({ token: tokenCode });
        if (!token) {
            return res.status(404).json({ error: `Token "${tokenCode}" not found in database.` });
        }
        res.status(200).json(token);
    } catch (error) {
        console.error(`[QueueFlow Get Token "${req.params.token}" Error]:`, error.message);
        res.status(500).json({ error: 'Failed to retrieve token from database.' });
    }
});

// Create a new token
app.post('/api/tokens', async (req, res) => {
    try {
        const { token, customer, department, status, joinedAt, order } = req.body || {};

        if (!token || typeof token !== 'string' || !token.trim()) {
            return res.status(400).json({
                error: 'Validation failed: "token" must be a non-empty string.'
            });
        }
        if (!customer || typeof customer !== 'string' || !customer.trim()) {
            return res.status(400).json({
                error: 'Validation failed: "customer" must be a non-empty string.'
            });
        }

        const tokenCode = token.trim();

        // Check for existing token to return a clear 409
        const existing = await tokensCollection.findOne({ token: tokenCode });
        if (existing) {
            return res.status(409).json({
                error: `Token "${tokenCode}" already exists in MongoDB.`
            });
        }

        const currentCount = await tokensCollection.countDocuments();
        const now = new Date();

        const newDocument = {
            token: tokenCode,
            customer: customer.trim(),
            department: (department && String(department).trim()) || 'General',
            status: (status && String(status).trim()) || 'Waiting',
            createdAt: now,
            joinedAt: joinedAt || now.toISOString(),
            order: (typeof order === 'number' && !isNaN(order)) ? order : currentCount + 1
        };

        const result = await tokensCollection.insertOne(newDocument);
        res.status(201).json({
            message: 'Token created successfully in MongoDB',
            insertedId: result.insertedId,
            token: newDocument
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Duplicate token error: token already exists in database.' });
        }
        console.error('[QueueFlow Create Token Error]:', error.message);
        res.status(500).json({ error: 'Failed to create token in database.' });
    }
});

// Update an existing token
app.put('/api/tokens/:token', async (req, res) => {
    try {
        const tokenCode = String(req.params.token || '').trim();
        if (!tokenCode) {
            return res.status(400).json({ error: 'Token parameter is required.' });
        }

        const { customer, department, status, order } = req.body || {};

        const updateFields = { updatedAt: new Date() };
        if (customer !== undefined) updateFields.customer = String(customer).trim();
        if (department !== undefined) updateFields.department = String(department).trim();
        if (status !== undefined) updateFields.status = String(status).trim();
        if (order !== undefined) {
            const parsedOrder = Number(order);
            if (isNaN(parsedOrder)) {
                return res.status(400).json({ error: 'Field "order" must be a valid number.' });
            }
            updateFields.order = parsedOrder;
        }

        const result = await tokensCollection.updateOne(
            { token: tokenCode },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: `Token "${tokenCode}" not found for update.` });
        }

        res.status(200).json({
            message: `Token "${tokenCode}" updated successfully in MongoDB`,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error(`[QueueFlow Update Token "${req.params.token}" Error]:`, error.message);
        res.status(500).json({ error: 'Failed to update token in database.' });
    }
});

// Delete a token
app.delete('/api/tokens/:token', async (req, res) => {
    try {
        const tokenCode = String(req.params.token || '').trim();
        if (!tokenCode) {
            return res.status(400).json({ error: 'Token parameter is required.' });
        }

        const result = await tokensCollection.deleteOne({ token: tokenCode });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: `Token "${tokenCode}" not found for deletion.` });
        }

        res.status(200).json({
            message: `Token "${tokenCode}" deleted successfully from MongoDB`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error(`[QueueFlow Delete Token "${req.params.token}" Error]:`, error.message);
        res.status(500).json({ error: 'Failed to delete token from database.' });
    }
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
    if (err && err.message && err.message.startsWith('CORS blocked:')) {
        return res.status(403).json({ error: err.message });
    }
    console.error('[QueueFlow Unhandled API Error]:', err ? err.message : 'Unknown error');
    res.status(500).json({ error: 'Internal server error' });
});

// ============================================================================
// 6. Graceful Shutdown & Server Listen
// ============================================================================
function gracefulShutdown(signal) {
    console.log(`\n[QueueFlow MongoDB API] Received ${signal}. Closing MongoDB connection...`);
    client.close().then(() => {
        console.log('[QueueFlow MongoDB API] MongoDB connection closed cleanly.');
        process.exit(0);
    }).catch(closeErr => {
        console.error('[QueueFlow MongoDB API] Error closing MongoDB connection:', closeErr.message);
        process.exit(1);
    });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`[QueueFlow MongoDB API] Server running on port ${PORT}`);
        console.log(`[QueueFlow MongoDB API] Health check: http://localhost:${PORT}/api/health`);
        console.log(`[QueueFlow MongoDB API] CORS Allowed: ${configuredOrigins.length > 0 ? configuredOrigins.join(', ') : (isProduction ? 'NONE (CORS_ORIGIN required)' : 'Local development origins')}`);
    });
}).catch(err => {
    console.error('[QueueFlow MongoDB API] Fatal server startup failure:', err.message);
    process.exit(1);
});
