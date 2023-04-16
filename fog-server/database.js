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
                console.log('Table already existed')    // Table already created
            }
        });  
    }
});


module.exports = db