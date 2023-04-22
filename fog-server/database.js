var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      console.error(err.message)          // Cannot open database
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE iot (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            iotid INTEGER UNIQUE, 
            type TEXT,
            ip TEXT,
            CONSTRAINT iotid_unique UNIQUE (iotid)
            )`,
        (err) => {
            if (err) {
                console.log('Table iot already existed')    // Table already created
            }
        });  

        db.run(`CREATE TABLE iot_recipient (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            senderid INTEGER, 
            receiverid INTEGER,
            CONSTRAINT fk_iot FOREIGN KEY (senderid,receiverid) REFERENCES iot(iotid,iotid)
            )`,
        (err) => {
            if (err) {
                console.log('Table iot_recipient already existed')    // Table already created
            }
        });  
    }
});


module.exports = db