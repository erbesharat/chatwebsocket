const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const sql = require("mssql");
const uuid = require("uuid");

app.get("/", function(req, res){
  res.sendFile(__dirname + "/static/pages/index.html");
});

io.on("connection", function(socket){

  //
  // ─── SOCKET EVENTS ──────────────────────────
  //


  // ********** Request Model **********
  //  {
  //    "user_id": int,
  //    "recipient_id": int,
  //  }
  // ***********************************
  socket.on("check", async function(data){
    // TODO: Connect database and search for user
    // TODO: Connect database and search for recipient
    roomID = uuid.v4();
    try {
      const result = await sql.query`select * from rooms where id=${roomID}`
    } catch (err) {
      
    }
  });

  socket.on("chat message", async function(msg){
    try {
      const result = await sql.query`select * from users`
      io.emit("chat response", result)
    } catch (err) {
      console.error("[websocket-server] Error (#16): ", err)
    }
  });
});

http.listen(3000, function(){
  console.log("listening on *:3000");
});
