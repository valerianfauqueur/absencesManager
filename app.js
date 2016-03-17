var express = require('express'),
  routes = require('./routes/index');
var bodyParser = require('body-parser');
var app = module.exports = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var rooms_manager = require("./src/rooms.js");
var database_manager = require("./src/database.js");

//Authentification using passport
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));



//Settings passport
var Account = require('./models/account_model');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


//db connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/absencesApp', function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});

//Real time communication
io.on('connection',function(socket){
    socket.on("readyToJoin", function(user){
        var roomName = user.promotion + user.group;
        if(!rooms_manager.roomExist(roomName))
        {
            rooms_manager.createRoom(roomName);
        }
        socket.join(roomName);
        var checkIfExist = rooms_manager.userAlreadyInRoom(roomName,user.username);
        console.log("check" +checkIfExist);
        if(checkIfExist === true)
        {
            rooms_manager.userResetSocket(roomName,user.username,socket.id);
            var userToValidate = rooms_manager.getTheUserToValidate(roomName,user.username);
            if(userToValidate !== false)
            {
                userToValidate = rooms_manager.getUser(roomName,userToValidate);
            }
        }
        else
        {
            rooms_manager.addUserToRoom(roomName, user,socket.id);
        }
        var accounts = database_manager.getAccounts(user.group,user.promotion);
        rooms_manager.startRoom(roomName);
        accounts.then(function(data){
            socket.emit('room:start',data.length);
            if(rooms_manager.getRoomState(roomName) === "inprogress")
            {
                if(rooms_manager.getRoomsTakenSeats(roomName,user.username) !== "none")
                {
                    var seatsInfo = rooms_manager.getRoomsTakenSeats(roomName,user.username);
                    socket.emit("room:AllSeatTaken",seatsInfo);
                }
                if(rooms_manager.userSeatIsAlreadySet(roomName,user.username) !== false)
                {
                    socket.emit("room:MySeat",rooms_manager.userSeatIsAlreadySet(roomName,user.username));
                }

                 if(userToValidate)
                 {
                     socket.emit("room:usertocheck",userToValidate);
                 }
            }
        });
    });

    socket.on("room:setseat", function(user,seat){

        var roomName = user.promotion + user.group;
        var isFree = rooms_manager.isRoomSeatFree(roomName,user.username,seat);
        if(isFree === true)
        {
            rooms_manager.roomTakeSeat(roomName,user.username,seat);
            rooms_manager.setUserState(roomName,user.username,"toValidate");
            socket.broadcast.to(roomName).emit('room:seatTaken', seat);
            socket.emit("room:seatTakenByYou", seat);
            var numberOfUserToValidate = rooms_manager.getUsersToValidate(roomName);
            if(numberOfUserToValidate.length >=2)
            {
                for(var i =0; i < numberOfUserToValidate.length;i++)
                {
                    var rUserToValidate = rooms_manager.getRandomUserToValidate(roomName,numberOfUserToValidate[i].username);
                    if(socket.id === numberOfUserToValidate[i].socketid)
                    {
                        rooms_manager.setUserToValidate(roomName,numberOfUserToValidate[i].username,rUserToValidate);
                        rooms_manager.setUserState(roomName,rUserToValidate.username,"waitingValidation");
                        socket.emit("room:usertocheck",rUserToValidate);
                        console.log(socket.id + "local send");
                    }
                    else if (socket.id !== numberOfUserToValidate[i].socketid)
                    {
                        rooms_manager.setUserToValidate(roomName,numberOfUserToValidate[i].username,rUserToValidate);
                        rooms_manager.setUserState(roomName,rUserToValidate.username,"waitingValidation");
                        console.log(socket.id + "send");
                        console.log(numberOfUserToValidate[i].socketid);
                        socket.broadcast.to(numberOfUserToValidate[i].socketid).emit("room:usertocheck",rUserToValidate);
                    }
                }
            }
        }
        else if (isFree === "Youtookit")
        {
            socket.emit("room:seatAlreadyUsedByYou");
        }
        else if (isFree === "alreadyHave")
        {
            socket.emit("room:seatAlreadySet")
        }
        else
        {
            socket.emit("room:seatAlreadyUsed");
        }

    });


    socket.on("room:validateuser", function(user,answer){
        console.log("here");
        var roomName = user.promotion + user.group;
        var userHeHasToValidate = rooms_manager.getTheUserToValidate(roomName,user.username);
        rooms_manager.hasValidatedUser(roomName,user.username);
        if(answer === "yes")
        {
            rooms_manager.setUserState(roomName,userHeHasToValidate,"Validated");
            console.log("did it");
        }
        else if(answer === "no")
        {
            rooms_manager.setUserState(roomName,userHeHasToValidate,"Conflict");
            console.log("did it but conflict");
        }
    });

    socket.on("room:end", function(room){

        rooms_manager.deleteRoom(roomName);
    });

});


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//routes

app.use('/', routes);
app.use('/partials/:name', routes);


app.use('*', routes);

http.listen(3000, function(){
  console.log("Listening on port 3000");
});
