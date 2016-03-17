var rooms_manager = {
    rooms:{},

    /* room gestion */
    createRoom: function(id)
    {
        this.rooms[id] =
        {
            users: [],
            state: "waiting"
        }
    },

    roomExist: function(id)
    {
        return (!this.rooms[id]) ? false :  true;
    },

    getRoomState: function(id)
    {
        return this.rooms[id].state
    },

    getRoomsTakenSeats: function(id,username)
    {
        var takenSeats = new Array();
        for(var i=0,l=this.rooms[id].users.length;i<l;i++)
        {
            if(this.rooms[id].users[i].seat !== null)
            {
                if(this.rooms[id].users[i].username !== username)
                {
                    takenSeats.push(this.rooms[id].users[i].seat);
                }
            }
        }
        if(takenSeats.length>0)
        {
            console.log(takenSeats);
            return takenSeats;
        }
        else
        {
            return "none";
        }
    },

    userSeatIsAlreadySet: function(id,username)
    {
        for(var i=0,l=this.rooms[id].users.length;i<l;i++)
        {
            if(this.rooms[id].users[i].username === username)
            {
                if(this.rooms[id].users[i].seat !== null)
                {
                    return this.rooms[id].users[i].seat;
                }
            }
        }
        return false;
    },

    roomTakeSeat: function(id,username,seat)
    {
        for(var i=0,l=this.rooms[id].users.length;i<l;i++)
        {
            if(this.rooms[id].users[i].username === username)
            {
                this.rooms[id].users[i].seat = seat;
            }
        }
    },

    isRoomSeatFree: function(id,username,seat)
    {
        for(var i=0,l=this.rooms[id].users.length;i<l;i++)
        {
            if(this.rooms[id].users[i].username === username)
            {
                if(this.rooms[id].users[i].seat === seat)
                {
                    return "Youtookit";
                }
                else if(this.rooms[id].users[i].seat !== null)
                {
                    return "alreadyHave";
                }
            }
            else if(this.rooms[id].users[i].seat === seat)
            {
                return false;
            }
        }
        return true;
    },

    startRoom: function(id)
    {
        this.rooms[id].state = "inprogress";
    },

    deleteRoom: function(id)
    {
        delete this.rooms[id];
    },

    /* user gestion */
    addUserToRoom: function(id, user, socketid)
    {
        user.state = false;
        user.seat = null;
        user.socketid = socketid;
        user.userToValidate = false;
        user.hasValidatedUser = false;
        this.rooms[id].users.push(user);
    },

    countUserInRoom: function(id)
    {
        return this.rooms[id].users.length;
    },

    getRandomUserToValidate: function(id,username)
    {
        var usersToValidate = this.getUsersToValidate(id);
        var usersToValidateMinusYou = [];
        for(var i = 0, l=usersToValidate.length; i<l;i++)
        {
            if(usersToValidate[i].state === "toValidate")
            {
                if(usersToValidate[i].username !== username)
                {
                    usersToValidateMinusYou.push(usersToValidate[i]);
                }
            }
        }
        var random = Math.floor(Math.random()*usersToValidateMinusYou.length);
        var randomUserToValidate = usersToValidateMinusYou[random];
        return randomUserToValidate;
    },

    getUsersToValidate: function(id)
    {
        var usersToValidate = [];
        for(var i =0,l=this.countUserInRoom(id);i<l;i++)
        {
            if(this.getUserState(id,this.rooms[id].users[i].username) === "toValidate")
            {
                usersToValidate.push(this.rooms[id].users[i]);
            }
        }
        return usersToValidate;
    },

    getUserState: function(id,username)
    {
        for(var i=0,l=this.rooms[id].users.length;i<l;i++)
        {
            if(this.rooms[id].users[i].username === username)
            {
                return this.rooms[id].users[i].state;
            }
        }
    },

    setUserState: function(id,username,state)
    {
        for(var i=0,l=this.rooms[id].users.length;i<l;i++)
        {
            if(this.rooms[id].users[i].username === username)
            {
                this.rooms[id].users[i].state = state;
            }
        }
    },

    setUserToValidate: function(id,me,user)
    {
        for(var i=0,l=this.rooms[id].users.length;i<l;i++)
        {
            if(this.rooms[id].users[i].username === me)
            {
                this.rooms[id].users[i].userToValidate = user.username;
            }
        }
    },


    hasValidatedUser: function(id,me)
    {
        for(var i=0,l=this.rooms[id].users.length;i<l;i++)
        {
            if(this.rooms[id].users[i].username === me)
            {
                this.rooms[id].users[i].hasValidatedUser = true;
            }
        }
    },

    getTheUserToValidate: function(id,me)
    {
        var me = this.getUser(id,me);
        return me.userToValidate;
    },

    userAlreadyInRoom: function(id,username)
    {
        for(var i=0,l=this.rooms[id].users.length;i<l;i++)
        {
            if(username === this.rooms[id].users[i].username)
            {
                return true;
            }
        }
        return false;
    },

    userResetSocket: function(id,username,socket)
    {
        for(var i=0,l=this.rooms[id].users.length;i<l;i++)
        {
            if(username === this.rooms[id].users[i].username)
            {
                this.rooms[id].users[i].socketid = socket;
            }
        }
    },

    getUser(id,username)
    {
        for(var i=0,l=this.rooms[id].users.length;i<l;i++)
        {
            if(username === this.rooms[id].users[i].username)
            {
                return this.rooms[id].users[i];
            }
        }
        return false;
    }
}

module.exports = rooms_manager;
