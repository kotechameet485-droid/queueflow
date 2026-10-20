const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

const uri = process.env.MONGODB_URI || 
    (process.env.NODE_ENV !== 'production' ? 'mongodb://127.0.0.1:27017' : undefined);

if (!uri) {
    console.error('[QueueFlow MongoDB API] CRITICAL CONFIG ERROR: MONGODB_URI environment variable is required in production.');
    console.error('Please configure MONGODB_URI in your Render environment variables with your MongoDB Atlas connection string.');
    throw new Error('MONGODB_URI environment variable is required in production');
}

const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || 'queueflow_db';
const collectionName = process.env.COLLECTION_NAME || 'tokens';

let tokensCollection;

const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
    origin: corsOrigin ? (corsOrigin.includes(',') ? corsOrigin.split(',').map(o => o.trim()) : corsOrigin) : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));

async function connectDB() {
    try {
        await client.connect();
        const db = client.db(dbName);
        tokensCollection = db.collection(collectionName);
        const safeUri = uri.includes('@') ? uri.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@') : uri;
        console.log(`[QueueFlow MongoDB API] Connected to MongoDB at: ${safeUri}`);
        console.log(`[QueueFlow MongoDB API] Using Database: "${dbName}", Collection: "${collectionName}"`);

        try {
            await tokensCollection.createIndex({ token: 1 }, { unique: true });
            console.log('[QueueFlow MongoDB API] Verified unique index on "token" field.');
        } catch (idxErr) {
            console.warn('[QueueFlow MongoDB API] Index notice:', idxErr.message);
        }
    } catch (err) {
        const safeErrMsg = err.message ? err.message.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@') : 'Unknown connection error';
        console.error('[QueueFlow MongoDB API] CRITICAL: Failed to connect to MongoDB server:', safeErrMsg);
        console.error('Verify that local MongoDB service is running (e.g., "net start MongoDB") or check your MONGODB_URI environment variable for MongoDB Atlas.');
        process.exit(1);
    }
}

app.get('/api/health', async (req, res) => {
    try {
        const count = await tokensCollection.countDocuments();
        res.json({
            status: 'ok',
            database: dbName,
            collection: collectionName,
            totalTokens: count,
            message: 'QueueFlow MongoDB API is active and connected'
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.get('/api/tokens', async (req, res) => {
    try {
        const tokens = await tokensCollection.find({})
            .sort({ order: 1, createdAt: 1 })
            .toArray();
        res.status(200).json(tokens);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tokens', details: error.message });
    }
});

app.put('/api/tokens/reorder', async (req, res) => {
    try {
        const { tokens } = req.body;
        if (!Array.isArray(tokens)) {
            return res.status(400).json({ error: 'Invalid payload: "tokens" must be an array of token strings.' });
        }

        const bulkOps = tokens.map((tokenCode, idx) => ({
            updateOne: {
                filter: { token: String(tokenCode).trim() },
                update: { $set: { order: idx + 1, updatedAt: new Date() } }
            }
        }));

        if (bulkOps.length > 0) {
            await tokensCollection.bulkWrite(bulkOps);
        }

        res.status(200).json({
            message: 'Queue order updated successfully in MongoDB',
            count: bulkOps.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reorder tokens', details: error.message });
    }
});

app.get('/api/tokens/:token', async (req, res) => {
    try {
        const tokenCode = String(req.params.token).trim();
        const token = await tokensCollection.findOne({ token: tokenCode });
        if (!token) {
            return res.status(404).json({ error: `Token "${tokenCode}" not found in database.` });
        }
        res.status(200).json(token);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve token', details: error.message });
    }
});

app.post('/api/tokens', async (req, res) => {
    try {
        const { token, customer, department, status, joinedAt, order } = req.body;

        if (!token || !customer) {
            return res.status(400).json({
                error: 'Validation failed: "token" and "customer" are required fields.'
            });
        }

        const tokenCode = String(token).trim();

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
            customer: String(customer).trim(),
            department: String(department || 'General').trim(),
            status: String(status || 'Waiting').trim(),
            createdAt: now,
            joinedAt: joinedAt || now.toISOString(),
            order: typeof order === 'number' ? order : currentCount + 1
        };

        const result = await tokensCollection.insertOne(newDocument);
        res.status(201).json({
            message: 'Token created successfully in MongoDB',
            insertedId: result.insertedId,
            token: newDocument
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: `Duplicate token error: token already exists.` });
        }
        res.status(500).json({ error: 'Failed to create token', details: error.message });
    }
});

app.put('/api/tokens/:token', async (req, res) => {
    try {
        const tokenCode = String(req.params.token).trim();
        const { customer, department, status, order } = req.body;

        const updateFields = { updatedAt: new Date() };
        if (customer !== undefined) updateFields.customer = String(customer).trim();
        if (department !== undefined) updateFields.department = String(department).trim();
        if (status !== undefined) updateFields.status = String(status).trim();
        if (order !== undefined) updateFields.order = Number(order);

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
        res.status(500).json({ error: 'Failed to update token', details: error.message });
    }
});

app.delete('/api/tokens/:token', async (req, res) => {
    try {
        const tokenCode = String(req.params.token).trim();
        const result = await tokensCollection.deleteOne({ token: tokenCode });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: `Token "${tokenCode}" not found for deletion.` });
        }

        res.status(200).json({
            message: `Token "${tokenCode}" deleted successfully from MongoDB`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete token', details: error.message });
    }
});

function gracefulShutdown(signal) {
    console.log(`\n[QueueFlow MongoDB API] Received ${signal}. Closing MongoDB connection...`);
    client.close().then(() => {
        console.log('[QueueFlow MongoDB API] MongoDB connection closed cleanly.');
        process.exit(0);
    });
}
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`[QueueFlow MongoDB API] Server running at http://localhost:${PORT}`);
        console.log(`Frontend URL: http://localhost:${PORT}/dashboard.html`);
        console.log(`API Endpoints:`);
        console.log(`  GET    /api/health`);
        console.log(`  GET    /api/tokens`);
        console.log(`  POST   /api/tokens`);
        console.log(`  PUT    /api/tokens/reorder`);
        console.log(`  GET    /api/tokens/:token`);
        console.log(`  PUT    /api/tokens/:token`);
        console.log(`  DELETE /api/tokens/:token`);
    });
});
