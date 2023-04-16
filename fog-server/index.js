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

const associations = {'ldr':['light_bulb'],'camera':['light_bulb','tv']}
// app.get("/heyy", (req, res) => {res.statusCode(200)})

app.post("/heyy", async (req, res) => {
    // axios({
    //     method: "post",
    //     url: `http://localhost:${String(HTTP_PORT_CHAIN).trim()}/mine`,
    //     data: JSON.stringify(req.body),
    //     headers: {
    //         'Content-Type': 'application/json'
    //     }
    // })
    // .then(() => console.log("data added to blockchain"))
    const data = req.body.data
    const type = req.body.type
    const index = Object.keys(associations).find((association)=> (association===type))
    // console.log(Object.keys(associations).findIndex(key=> key==='camera'))
    let ip_list = []
    for(const t of associations[index]){
        var sql = "SELECT ip from iot WHERE type=?";
        var params = [t]   
        await db.get(sql, params, (err, row) => {
            if (err) {
            //   res.status(400).json({"error":err.message});
            console.log(err)
              return;
            }
            console.log(row.ip)
        ip_list.push(row.ip) 
        });      
    }
    // associations[index].forEach(t => {
        
    // }); 
    console.log(ip_list)                  
    // p2pserver.broadcast(data)
    // const val = 4096 - (((data - 0)/(2500 - 0)) * (4096 - 0) + 0) 
    // ip_list.forEach((ip_val)=>{
    //     axios({
    //         method: "get",
    //         url: `http://${ip_val}/update/?data=${val}`
    //     })
    //     .then(()=>console.log(`data forwarded to ip ${ip_val}`))
    //     .catch((err)=>console.log(err))
    // })
    res.sendStatus(200);
})

app.post("/login", (req, res, next) => {
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
