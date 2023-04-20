const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const db = require("./database")
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

const associations = {'ldr':['light_bulb'],'camera':['tv']}

async function Is_Iot_Present(iot_id) {
    var f=0;
    var sql1 = "SELECT COUNT(*) as count FROM iot WHERE iotid = ?";
    var params = [iot_id]
    await new Promise((resolve, reject) => {
    db.get(sql1, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          reject();
        }
        f=row.count
        resolve();
      }); 
    }); 
    return f
}

app.post("/heyy", async (req, res) => {
    const data = req.body.data;
    const type = req.body.type;
    const iotid = req.body.iotid;

    var f = await Is_Iot_Present(iotid)
    if(f==0){
        res.json({
            "Error": "Iot Device not Existed !!",
        }) 
    }
    const index = Object.keys(associations).find((association) => (association === type));
    const ip_list = [];
    if(index in associations) {
        for (const t of associations[index]) {
            const sql = "SELECT ip from iot WHERE type=?";
            const params = [t];
            await new Promise((resolve, reject) => {
                db.all(sql, params, (err, rows) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }
                    else {
                        rows.forEach(row => {
                            if(row) 
                                ip_list.push(row.ip);
                        })
                        resolve();
                    }
                });
            });
        }
    }
    console.log(ip_list);
    const val = 4096 - (((data - 0)/(2500 - 0)) * (4096 - 0) + 0) 
    ip_list.forEach(async (ip)=>{
        console.log(`http://${ip}/update/?data=${val}`)
    })
    return res.sendStatus(200);
});

app.post("/login", async (req, res, next) => {
    var errors=[]
    if (!req.body.username || !req.body.password || !req.body.iotid || !req.body.type || !req.body.ip ){
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

   var f= await Is_Iot_Present(req.body.iotid)

    if(f==0){
        var sql2 = 'INSERT INTO iot (iotid,type,ip) VALUES (?,?,?)'
        var params2 = [req.body.iotid,req.body.type,req.body.ip]
        db.run(sql2, params2, function (err, result) {
            if (err){
                res.status(400).json({"error": err.message})
                return;
            }
            res.json({
                "message": "success - Iot device added",
            })
        });
    }
    else{
        res.json({
            "message": "success - Iot device already registered",
        })
    }
})

app.get("/data", (req, res, next) => {
    var sql = "select * from iot"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
    });
});

app.listen(HTTP_PORT_FOG, () => {
    console.log('Server is running on port ' + HTTP_PORT_FOG)
})
