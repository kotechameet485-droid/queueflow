const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

const dbName = 'queueflow_db';
const collectionName = 'tokens';
const TEST_TOKEN_CODE = 'TEST101';

async function runMongoDBCRUD() {
    try {
        console.log('============================================================');
        console.log('   QueueFlow — MongoDB CRUD Operations');
        console.log('============================================================\n');

        const safeUri = uri.includes('@') ? uri.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@') : uri;
        console.log(`[1. Connection] Connecting to MongoDB at: ${safeUri} ...`);
        await client.connect();
        console.log('✔ Successfully connected to MongoDB server.');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        console.log(`✔ Targeting Database: "${dbName}" | Collection: "${collectionName}"\n`);

        const staleTestRecord = await collection.findOne({ token: TEST_TOKEN_CODE });
        if (staleTestRecord) {
            await collection.deleteOne({ token: TEST_TOKEN_CODE });
            console.log(`[Safety Notice] Removed leftover test token "${TEST_TOKEN_CODE}" from a previous run.\n`);
        }

        console.log('------------------------------------------------------------');
        console.log('  OPERATION 1: CREATE (Insert Document)');
        console.log('------------------------------------------------------------');

        const testTokenDocument = {
            token: TEST_TOKEN_CODE,
            customer: 'Viva Test Candidate',
            department: 'Inquiry',
            status: 'Waiting',
            order: 999,
            createdAt: new Date()
        };

        const insertResult = await collection.insertOne(testTokenDocument);

        console.log('Method   : collection.insertOne()');
        console.log('Status   : Document inserted successfully');
        console.log('Inserted ID :', insertResult.insertedId.toString());
        console.log('Document :', {
            token: testTokenDocument.token,
            customer: testTokenDocument.customer,
            department: testTokenDocument.department,
            status: testTokenDocument.status
        });
        console.log('');

        console.log('------------------------------------------------------------');
        console.log('  OPERATION 2: READ (Retrieve Documents)');
        console.log('------------------------------------------------------------');

        const allDocuments = await collection.find({}).toArray();
        console.log(`Method A : collection.find({}).toArray()`);
        console.log(`Result   : Found ${allDocuments.length} document(s) in collection "${collectionName}":`);

        allDocuments.forEach((doc, idx) => {
            console.log(`   [${idx + 1}] Token: ${doc.token.padEnd(8)} | Customer: ${(doc.customer || '--').padEnd(20)} | Status: ${(doc.status || '--').padEnd(10)} | Dept: ${doc.department || '--'}`);
        });

        const singleDocFilter = { token: TEST_TOKEN_CODE };
        const foundTestDoc = await collection.findOne(singleDocFilter);

        console.log(`\nMethod B : collection.findOne({ token: "${TEST_TOKEN_CODE}" })`);
        if (foundTestDoc) {
            console.log('Result   : Successfully retrieved test record:');
            console.log('           _id        :', foundTestDoc._id.toString());
            console.log('           Token      :', foundTestDoc.token);
            console.log('           Customer   :', foundTestDoc.customer);
            console.log('           Department :', foundTestDoc.department);
            console.log('           Status     :', foundTestDoc.status);
        } else {
            console.log('Warning  : Test document was not found.');
        }
        console.log('');

        console.log('------------------------------------------------------------');
        console.log('  OPERATION 3: UPDATE (Modify Document)');
        console.log('------------------------------------------------------------');

        const updateFilter = { token: TEST_TOKEN_CODE };
        const updateFields = {
            $set: {
                status: 'Serving',
                department: 'Helpdesk (Updated)',
                updatedAt: new Date()
            }
        };

        const updateResult = await collection.updateOne(updateFilter, updateFields);

        console.log('Method         : collection.updateOne(filter, updateDoc)');
        console.log('Filter Used    :', JSON.stringify(updateFilter));
        console.log(`Matched Count  : ${updateResult.matchedCount}`);
        console.log(`Modified Count : ${updateResult.modifiedCount}`);

        if (updateResult.modifiedCount > 0) {
            const verifiedUpdatedDoc = await collection.findOne(updateFilter);
            console.log('✔ Verification : Updated record retrieved:');
            console.log('                 Token      :', verifiedUpdatedDoc.token);
            console.log('                 New Status :', verifiedUpdatedDoc.status);
            console.log('                 New Dept   :', verifiedUpdatedDoc.department);
            console.log('                 Updated At :', verifiedUpdatedDoc.updatedAt.toISOString());
        } else {
            console.log('Notice         : No documents were modified.');
        }
        console.log('');

        console.log('------------------------------------------------------------');
        console.log('  OPERATION 4: DELETE (Remove Test Document)');
        console.log('------------------------------------------------------------');

        const deleteFilter = { token: TEST_TOKEN_CODE };
        const deleteResult = await collection.deleteOne(deleteFilter);

        console.log('Method        : collection.deleteOne(filter)');
        console.log('Filter Used   :', JSON.stringify(deleteFilter));
        console.log(`Deleted Count : ${deleteResult.deletedCount}`);

        if (deleteResult.deletedCount > 0) {
            console.log(`✔ Success     : Test token "${TEST_TOKEN_CODE}" deleted from "${collectionName}".`);
            console.log('                Real customer queue tokens remain safe and untouched.');

            const postDeleteCheck = await collection.findOne(deleteFilter);
            console.log(`✔ Verify Check: Document lookup returned: ${postDeleteCheck ? 'Still Exists (Error)' : 'null (Confirmed Deleted)'}`);
        } else {
            console.log(`Notice        : Token "${TEST_TOKEN_CODE}" was not found. Nothing deleted.`);
        }
        console.log('');

        console.log('============================================================');
        console.log('   ALL 4 CRUD OPERATIONS COMPLETED SUCCESSFULLY!');
        console.log('============================================================\n');

    } catch (error) {
        console.error('\n✖ [Error in CRUD Execution]:', error.message);
        if (error.code) {
            console.error(`  Mongo Error Code: ${error.code}`);
        }
    } finally {
        try {
            await client.close();
            console.log('[Cleanup] MongoDB connection closed safely.');
        } catch (closeError) {
            console.error('[Cleanup Error] Failed to close MongoDB client:', closeError.message);
        }
    }
}

runMongoDBCRUD();
