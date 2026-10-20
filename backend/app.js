const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});

connection.connect(function (err) {
    if (err) {
        console.log('Connection error: ' + err.message);
        return;
    }

    console.log('Connected to MySQL');

    connection.query(
        'CREATE DATABASE IF NOT EXISTS queueflow_db',
        function (err, result) {
            if (err) {
                console.log('Database error: ' + err.message);
                return connection.end();
            }

            console.log('Database created successfully');

            connection.query('USE queueflow_db', function (err) {
                if (err) {
                    console.log(err.message);
                    return connection.end();
                }

                var sql = `CREATE TABLE IF NOT EXISTS queue_tokens (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    token VARCHAR(20),
                    customer VARCHAR(100),
                    department VARCHAR(100),
                    status VARCHAR(50)
                )`;

                connection.query(sql, function (err, result) {
                    if (err) {
                        console.log(err.message);
                        return connection.end();
                    }

                    console.log('Table created successfully');
                    insertRecord();
                });
            });
        }
    );
});

function insertRecord() {
    var sql = `INSERT INTO queue_tokens
        (token, customer, department, status)
        VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)`;

    var values = [
        'T-101', 'Rahul', 'Billing', 'Waiting',
        'T-102', 'Priya', 'Helpdesk', 'Waiting',
        'T-103', 'Amit', 'Billing', 'Completed'
    ];

    connection.query(sql, values, function (err, result) {
        if (err) {
            console.log('Insert error: ' + err.message);
            return connection.end();
        }

        console.log('Records inserted successfully');
        updateRecord();
    });
}

function updateRecord() {
    var sql = 'UPDATE queue_tokens SET status = ? WHERE token = ?';

    connection.query(sql, ['Serving', 'T-101'], function (err, result) {
        if (err) {
            console.log('Update error: ' + err.message);
            return connection.end();
        }

        console.log('Record updated successfully');
        deleteRecord();
    });
}

function deleteRecord() {
    var sql = 'DELETE FROM queue_tokens WHERE token = ?';

    connection.query(sql, ['T-103'], function (err, result) {
        if (err) {
            console.log('Delete error: ' + err.message);
            return connection.end();
        }

        console.log('Record deleted successfully');
        selectRecord();
    });
}

function selectRecord() {
    var sql = 'SELECT * FROM queue_tokens';

    connection.query(sql, function (err, result) {
        if (err) {
            console.log('Select error: ' + err.message);
            return connection.end();
        }

        console.log('Records selected successfully');
        console.log(result);
        selectUnique();
    });
}

function selectUnique() {
    var sql = 'SELECT DISTINCT department FROM queue_tokens';

    connection.query(sql, function (err, result) {
        if (err) {
            console.log('Distinct error: ' + err.message);
            return connection.end();
        }

        console.log('Unique departments selected successfully');
        console.log(result);

        dropTable();
    });
}

function dropTable() {
    var sql = 'DROP TABLE IF EXISTS queue_tokens';

    connection.query(sql, function (err, result) {
        if (err) {
            console.log('Drop table error: ' + err.message);
            return connection.end();
        }

        console.log('Table dropped successfully');
        connection.end();
    });
}
