const timeTableCollection = require('../db').db().collection("timetable")
const ObjectID = require('mongodb').ObjectID;
const sanitizeHTML = require('sanitize-html');
// const students = require('./Post')

let TimeTable = function(data, userid){
    this.data = data
    this.errors = []
    this.userid = userid
    this.requestedPostId
}

TimeTable.prototype.cleanUp = function() {
    if (typeof(this.data.firstName) != "string") {this.data.firstName = ""}
    if (typeof(this.data.lastName) != "string") {this.data.lastName = ""}
    if (typeof(this.data.phoneNumber) != "string") {this.data.phoneNumber = ""}
    if (typeof(this.data.date) != "string") {this.data.date = ""}
    if (typeof(this.data.age) != "string") {this.data.age = ""}
    if (typeof(this.data.gender) != "string") {this.data.gender = ""}
    if (typeof(this.data.email) != "string") {this.data.email = ""}
    if (typeof(this.data.department) != "string") {this.data.department = ""}
    if (typeof(this.data.description) != "string") {this.data.description = ""}

  
    // get rid of any bogus properties
    this.data = {
        department: sanitizeHTML(this.data.department.trim(), {allowedTags: [], allowedAttributes: {}}),
        // class: sanitizeHTML(this.data.lastName.trim(), {allowedTags: [], allowedAttributes: {}}),
        day: sanitizeHTML(this.data.day.trim(), {allowedTags: [], allowedAttributes: {}}),
        subject: sanitizeHTML(this.data.subject.trim(), {allowedTags: [], allowedAttributes: {}}),
        from: sanitizeHTML(this.data.from.trim(), {allowedTags: [], allowedAttributes: {}}),
        to: sanitizeHTML(this.data.to.trim(), {allowedTags: [], allowedAttributes: {}}),
        fucultyName: sanitizeHTML(this.data.fucultyName.trim(), {allowedTags: [], allowedAttributes: {}}),
        createdDate: new Date(),
        author: ObjectID(this.userid)
    }
}

TimeTable.prototype.validate = function() {
    

}

//timetable
TimeTable.prototype.addTimeTable = function(){
    return new Promise((resolve, reject)=>{
        this.cleanUp();
        // this.validate();

        if(!this.errors.length){
            //save to the database
            timeTableCollection.insertOne(this.data).then((info)=>{
                resolve(info.ops[0]._id)
            }).catch(()=>{
                this.errors.push("Please try again later.")
                reject(this.errors)
            })
        }else{
            reject(this.errors)
        }
    })
}

TimeTable.findSingleById = function(id){
    return new Promise(async (resolve, reject)=>{
        if(typeof(id) != "string" || !ObjectID.isValid(id)){
            reject();
            return 
        }
        
        let timeTables = await timeTableCollection.aggregate([
            {$match: {_id: new ObjectID(id)}},
            {$lookup: {from: "admin", localField: "author", foreignField: "_id", as: "authorDocument"}},
            {$project: {
                department: 1,
                day: 1,
                subject: 1,
                from: 1,
                to: 1,
                fucultyName: 1,
                createdDate: 1,
                authorId: "$author",
                author: {$arrayElemAt: ["$authorDocument", 0]}
            }}
        ]).toArray()

        //cleanup author property for each timetable object
        timeTables = timeTables.map(function(timeTable) {
            // post.isVisitorOwner = post.authorId.equals(visitorId)
      
            timeTable.author = {
            //   username: timeTable.author.username
            }
            return timeTable
        })

        if(timeTables.length){
            console.log(timeTables[0])
            resolve(timeTables[0]);
        }else{
            reject();
        }
    })
}

module.exports = TimeTable;