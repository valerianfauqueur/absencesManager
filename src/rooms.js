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
            if(this.rooms[id].users[i].seats !== null)
            {
                if(this.rooms[id].users[i].username !== username)
                {
                    takenSeats.push(this.rooms[id].users[i].seats);
                }
            }
        }
        if(takenSeats.length >0)
        {
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

    delete: function(id)
    {
        delete this.rooms[id];
    },

    /* user gestion */
    addUserToRoom: function(id, user)
    {
        user.seat = null;
        this.rooms[id].users.push(user);
    },

    countUserInRoom: function(id)
    {
        return this.rooms[id].users.length;
    },

    getRandomUserInRoom: function(id)
    {
        var numberOfUsers = countUserInRoom(id);
        return this.rooms[id].users[(Math.floor(Math.random()*numberOfUsers))];
    },

    getUsersInRoom: function(id)
    {
        return this.rooms[id].users;
    },

    userAlreadyInRoom: function(id,user)
    {
        for(var i=0,l=this.rooms[id].users.length;i<l;i++)
        {
            if(user.username == this.rooms[id].users[i])
            {
                return true;
            }
        }
        return false;
    }
}

module.exports = rooms_manager;
