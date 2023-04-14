const express = require('express')
const bodyParser = require('body-parser')
<<<<<<< HEAD
const cors = require('cors')

=======
const db = require("./database")
>>>>>>> 70faffa92bfb50be3b211b533ddb6ce701401f54
const P2pServer = require('./p2p-server')
const { default: axios } = require('axios')

//get the port from the user or set the default port
const HTTP_PORT_FOG = process.env.HTTP_PORT_FOG || 8001
const HTTP_PORT_CHAIN = process.env.HTTP_PORT_CHAIN || 3001

//create a new app
const app = express()
//using the body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use(cors({
    origin: "*"
}))

// create a new blockchain instance
const p2pserver = new P2pServer()
p2pserver.listen()

// app.get("/heyy", (req, res) => {res.statusCode(200)})

app.post("/heyy", (req, res) => {
    axios({
        method: "post",
        url: `http://localhost:${String(HTTP_PORT_CHAIN).trim()}/mine`,
        data: JSON.stringify(req.body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(() => console.log("data added to blockchain"))
    const data = req.body.data
    p2pserver.broadcast(data)
    const val = 4096 - (((data - 0)/(2500 - 0)) * (4096 - 0) + 0) 
    axios({
        method: "get",
        url: `http://192.168.1.100/update/?data=${val}`
    })
    .then("data forwarded to reactor")
    res.sendStatus(200);
})

app.post("/login", (req, res, next) => {
    var errors=[]
    if (!req.body.username || !req.body.password || !req.body.iotid ){
        errors.push("Missing parameter");
    }
    if (req.body.username != 'fog1' || req.body.password != 'abcd123'){
        errors.push("Invalid username/password");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    console.log("Sucessfully authenticated")

    var f=0;
    var sql1 = "SELECT COUNT(*) as count FROM iot WHERE iotid = ?";
    var params = [req.body.iotid]
    db.get(sql1, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        f=row.count
        if(f==1){
            res.json({
                "message": "success - Iot device already registered",
            })
        }
      });
    
    if(f==0){
        var sql2 = 'INSERT INTO iot (iotid) VALUES (?)'
        db.run(sql2, params, function (err, result) {
            if (err){
                res.status(400).json({"error": err.message})
                return;
            }
            res.json({
                "message": "success - Iot device added",
            })
        });
    }
})

// app.get("/data", (req, res, next) => {
//     var sql = "select * from iot"
//     var params = []
//     db.all(sql, params, (err, rows) => {
//         if (err) {
//           res.status(400).json({"error":err.message});
//           return;
//         }
//         res.json({
//             "message":"success",
//             "data":rows
//         })
//     });
// });

app.listen(HTTP_PORT_FOG, () => {
    console.log('Server is running on port ' + HTTP_PORT_FOG)
})
