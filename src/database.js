var Account = require('../models/account_model');
var Schedule = require('../models/schedule_model');
var promise = require('promise');

var database_manager = {

    getCurrentCourseFor: function(user)
    {
        var userInfo = this.getAccountInfo(user);
        var that = this;
        return new Promise(function(resolve,reject){
        userInfo.then(function(user){
            var sheduleInfo = that.getSheduleInfo(user.promotion);
            sheduleInfo.then(function(shedule){
                var date = new Date(),
                    foundOne = false,
                    day = that.getDay(date),
                    time = that.getCurrentTime(date);
                if (day !== "sun" && day !== "sat")
                {
                    console.log(shedule[day]);
                    for(var i = 0, l = shedule[day].length; i < l;i++)
                    {
                        if(time >= shedule[day][i].start && time <=shedule[day][i].end)
                        {
                            foundOne = true;
                            var obj = {};
                            obj.course = shedule[day][i].course;
                            obj.account = user;
                            resolve(obj);
                            break;
                        }
                    }
                }
                if(foundOne === false)
                {
                    var obj = {};
                    obj.course = "Aucun cours";
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


    getSheduleInfo: function(promo)
    {
        return new Promise(function(resolve,reject){
            Schedule.find({ promotion:promo }, function(err,result){
            if(err)
            {
                reject(false);
            }
             resolve(result[0]);
            });
        });
    },

    getCurrentTime: function(date)
    {
        var hours = date.getHours(),
            min = date.getMinutes();
            if(min <10)
            {
                min = "0"+min;
            }
            if(hours <10)
            {
                hours = "0"+hours;
            }

        var time = parseInt(hours +""+ min);
        return time;
    },

    getDay: function(date)
    {
        var fullDate =date.toDateString();
        var day = fullDate.substr(0,3).toLowerCase();
        return "mon";
    }
}

module.exports = database_manager;
