const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { default: axios } = require('axios')

require('dotenv').config()

const db = require("./database")
const P2pServer = require('./p2p-server')

//get the port from the user or set the default port
const HTTP_PORT_FOG = process.env.HTTP_PORT_FOG || 8001
const HTTP_PORT_CHAIN = process.env.HTTP_PORT_CHAIN || 3001

const USERNAME = "fog"
const PASSWORD = "12345678"

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



app.get("/list/:type", async (req,res) =>{
    const index = Object.keys(associations).find((association) => (association === req.params.type));
    const iot_list = [];
    if(index in associations) {
        for (const t of associations[index]) {
            const sql = "SELECT iotid from iot WHERE type=?";
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
                                iot_list.push(row.iotid);
                        })
                        resolve();
                    }
                });
            });
        }
    }
    //console.log(iot_list);
    res.send(iot_list)
})


app.post("/heyy", async (req, res) => {
    axios({
        method: "POST",
        url: `http://localhost:${String(HTTP_PORT_CHAIN).trim()}/mine`,
        data: JSON.stringify(req.body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(() => console.log("data added to blockchain"))
    const data = req.body.data;
    const type = req.body.type;
    const iotid = req.body.iotid;

    var f = await Is_Iot_Present(iotid)
    if(f==0){
        return res.status(400).json({
            "Error": "Iot Device not Existed !!",
        }) 
    }

    const ip_list = [];
    const sql = "SELECT ip FROM iot JOIN iot_recipient ON iot_recipient.receiverid = iot.iotid WHERE iot_recipient.senderid = ?";
    const params = [iotid];
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
    console.log(ip_list)
    p2pserver.broadcast(data)
    // const val = 4096 - (((data - 0)/(2500 - 0)) * (4096 - 0) + 0)
    const val = (4096 - data)
    ip_list.forEach(async (ip)=>{
        let url = ""
        try {
            url = `http://${ip}/update/?data=${val}`
            await fetch(url)
        }
        catch(err) {
            console.error("Error occured while sending to " + url)
        }
    })
    return res.sendStatus(200);
});

app.post("/login", async (req, res, next) => {
    var errors=[]
    if (!req.body.username || !req.body.password || !req.body.iotid || !req.body.type || !req.body.ip ){
        errors.push("Missing parameter");
    }
    if (req.body.username != USERNAME || req.body.password != PASSWORD){
        errors.push("Invalid username/password");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    console.log("Sucessfully authenticated")

    const iot_list = req.body.list || []
    iot_list.forEach((iot_id)=>{
        var sql1 = 'INSERT INTO iot_recipient (senderid,receiverid) VALUES (?,?)'
        var params1 = [req.body.iotid,iot_id]
        db.run(sql1, params1, function (err, result) {
            if (err){
                res.status(400).json({"error": err.message})
                return;
            }
        });
    })
    
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

// app.post("/heyy", async (req, res) => {
//     // axios({
//     //     method: "post",
//     //     url: `http://localhost:${String(HTTP_PORT_CHAIN).trim()}/mine`,
//     //     data: JSON.stringify(req.body),
//     //     headers: {
//     //         'Content-Type': 'application/json'
//     //     }
//     // })
//     // .then(() => console.log("data added to blockchain"))
//     const data = req.body.data
//     const type = req.body.type
//     const index = Object.keys(associations).find((association)=> (association===type))
//     // console.log(Object.keys(associations).findIndex(key=> key==='camera'))
//     let ip_list = []
//     for(const t of associations[index]){
//         // console.log(t)
//         const sql = "SELECT * FROM iot WHERE type=?";
//         const params = [t]
//         console.log({sql, params});
//         const row = await db.get(sql, params, (err, row) => {
//             if (err) {
//                 console.error(err.message);
//                 return;
//             }
//             console.log(row);
//         })
//         console.log(row)
//         ip_list.push(row.ip)
//     }
//     // associations[index].forEach(t => {
        
//     // }); 
//     console.log(ip_list)                  
//     // p2pserver.broadcast(data)
//     // const val = 4096 - (((data - 0)/(2500 - 0)) * (4096 - 0) + 0) 
//     // ip_list.forEach((ip_val)=>{
//     //     axios({
//     //         method: "get",
//     //         url: `http://${ip_val}/update/?data=${val}`
//     //     })
//     //     .then(()=>console.log(`data forwarded to ip ${ip_val}`))
//     //     .catch((err)=>console.log(err))
//     // })
//     res.sendStatus(200);
// })