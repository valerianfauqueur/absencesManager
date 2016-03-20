var Account = require('../models/account_model');
var Schedule = require('../models/schedule_model');
var promise = require('promise');

var database_manager = {

    getCurrentCourseFor: function(user)
    {
        var userInfo = this.getAccountInfo(user),
            that = this,
            date = new Date();
            time = {},
            foundOne = false;
            time.hour = date.getHours();
            time.min = date.getMinutes();
            time.day = that.getDay(date);
        return new Promise(function(resolve,reject){
        userInfo.then(function(user){
            var sheduleInfo = that.getSheduleInfoFor(user.promotion,user.group.substr(0,2));
            sheduleInfo.then(function(shedule){
                if (time.day !== "sun" && time.day !== "sat")
                {
                    for(var i = 0, l = shedule[time.day].length; i < l;i++)
                    {
                        if(time.hour >= shedule[time.day][i]["start"].hour && time.hour <= shedule[time.day][i]["end"].hour)
                        {
                            if(time.min >= shedule[time.day][i]["start"].min && time.min <= shedule[time.day][i]["end"].min)
                            {
                                foundOne = true;
                                var obj = {};
                                obj.course = shedule[time.day][i].course;
                                obj.account = user;
                                resolve(obj);
                                break;
                            }
                        }
                    }
                }
                if(foundOne === false)
                {
                    var obj = {};
                    obj.course = false;
                    obj.account = user;
                    resolve(obj);
                }
                });
            });
        });
    },

    getAccountInfo: function(user)
    {
        return new Promise(function(resolve,reject){
           Account.find({ username:user }, function(err,result){
            if(err)
            {
                reject(err);
            }
             resolve(result[0]);
            });
        });
    },

    getAccounts: function(group,promo,halfgroup)
    {
        if(!halfgroup)
        {
            var querygroup = group.substr(0,2);
        }
        else
        {
            var querygroup = group;
        }
        console.log(querygroup);

        return new Promise(function(resolve,reject){
            Account.find({ group:new RegExp("^"+querygroup), promotion:promo},function(err,results){
                if(err)
                {
                    reject(false);
                }
                resolve(results);
            });
        });
    },


    getSheduleInfoFor: function(promo,group)
    {
        return new Promise(function(resolve,reject){

            var query = {
                promotion: promo,
                group: group,
            }
            Schedule.find(query, function(err,result){
            if(err)
            {
                reject(false);
            }
             resolve(result[0]);
            });
        });
    },

    getSheduleInfo: function()
    {
        return new Promise(function(resolve,reject){
            Schedule.find({}, function(err,result){
            if(err)
            {
                reject(false);
            }
             resolve(result);
            });
        });
    },

    getDay: function(date)
    {
        var fullDate =date.toDateString();
        var day = fullDate.substr(0,3).toLowerCase();
        return "mon";
    },

    registerUsersCheckIn: function(users,group,promo)
    {
        var accounts = this.getAccounts(group,promo);

        accounts.then(function(accounts){
            for(var i=0, l=accounts.length;i<l;i++)
            {
                var match = false;
                for(var b=0,h=users.length;b<h;b++)
                {
                    if(accounts[i].username === users[b].username)
                    {
                        match = users[b];
                    }
                }
                var query = {'username':accounts[i].username};
                if(match)
                {
                var newstate = {
                                date: new Date(),
                                course: match.currentCourse,
                                state:match.state,
                                hasConfirmedSomeone: match.hasValidatedUser,
                                userHeHadToValidate: match.userToValidate
                               }
                }
                else
                {
                var newstate = {
                                date: new Date(),
                                course: users[0].currentCourse,
                                state:"Absent"
                               }
                }
                var update = {$push: {state: newstate}};
                var options = {safe:true, upsert: true};
                Account.findOneAndUpdate(query, update, options, function(err, result){
                    if(err)
                    {
                        console.log(err);
                    }
                });
            }
        });
    }
}

module.exports = database_manager;
