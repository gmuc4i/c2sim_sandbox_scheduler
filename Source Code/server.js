//Sockets
var express   = require('express');
var app       = express();
var server    = require('http').createServer(app);
var io        = require('socket.io').listen(server);
var scheduler = require("./scheduler.js");

var callbacks = {};

callbacks.connection = function(socket)
{
    
    console.log(">> New connection: " + socket.id);

    
    callbacks.authenticationRequest = function(username, password)
    {
        var status = scheduler.login(username, password);
        // console.log("Login status: " + status);
        socket.emit("authenticationResponse", status);
    }

    socket.on("authenticationRequest", callbacks.authenticationRequest);
    
    
    callbacks.endSessionRequest = function(token)
    {
        // console.log("End Session Request Received: " + JSON.stringify(token));
        var status = scheduler.logout(token);
        socket.emit("endSessionResponse", status);
    }

    socket.on("endSessionRequest", callbacks.endSessionRequest);
    
    //retrieves the schedule for a given date
    callbacks.scheduleRequest = function(date, token)
    {
        // scheduler.printEvents();
        var events = scheduler.getEventsOn(date, token);
        if (events == false) {
            socket.emit("schedulerError", 2);//authentication error, i.e. bad token
        }
        socket.emit("scheduleResponse", events);
    }

    socket.on("scheduleRequest", callbacks.scheduleRequest);
    
    //this is exactly the same as scheduleRequest..
    callbacks.refreshRequest = function(date, token)
    {
        var events = scheduler.getEventsOn(date, token);
        if (events == false)
        {
            socket.emit("schedulerError", 2);//authentication error, i.e. bad token
        }
        socket.emit("refreshResponse", events);
    }

    socket.on("refreshRequest", callbacks.refreshRequest);
    
    callbacks.registrationRequest = function(username, password)
    {
        var status = scheduler.register(username, password);
        console.log("Registration status: " + status);
        socket.emit("registrationResponse", status);
    }

    socket.on("registrationRequest", callbacks.registrationRequest);
    
    callbacks.reserveRequest = function(date, blocks, token)
    {
        if (scheduler.removeEventsOn(date, token)) {
            var error = false;
            if (blocks != undefined) {
                for (var block in blocks) {
                    var blockAsNumber = parseInt(block, 10);
                    var parameter = blocks[block];
                    if (!(scheduler.addEvent(date, blockAsNumber, token, parameter)))
                    {
                        error = true;
                    }
                }
            }
            if (error) {
                socket.emit("schedulerError", 1); //scheduling conflict
            }
            socket.emit("reserveResponse", scheduler.getEventsOn(date, token));
        }
        else
        {
            socket.emit("schedulerError", 2);//authentication error, i.e. bad token
        }

    }

    socket.on("reserveRequest", callbacks.reserveRequest);
    
}

io.sockets.on("connection", callbacks.connection);

app.use(express.static(__dirname + "/public"));
//direct http://localhost:XXXX/ to login.html
app.get('/', function (req, res) {
    res.sendfile('./public/login.html');
});
server.listen(8080);
