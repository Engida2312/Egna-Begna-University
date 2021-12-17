
const noticeCollection = require('../db').db().collection("Notice")
const ObjectID = require('mongodb').ObjectID

const sanitizeHTML = require('sanitize-html');


let Notice = function(data, userid){
    this.data = data
    this.errors = []
    this.userid = userid
}


Notice.prototype.cleanUp = function() {
    if (typeof(this.data.title) != "string") {this.data.title = ""}
    if (typeof(this.data.body) != "string") {this.data.body = ""}
 
    // get rid of any bogus properties
    this.data = {
      title: sanitizeHTML(this.data.title.trim(), {allowedTags: [], allowedAttributes: {}}),
      body: sanitizeHTML(this.data.body.trim(), {allowedTags: [], allowedAttributes: {}}),
      createdDate: new Date(),
      author: ObjectID(this.userid)
    }
}

Notice.prototype.validate = function() {

}

//Notice

Notice.prototype.addNotice = function(){
    return new Promise((resolve, reject)=>{
       this.cleanUp();
        // this.validate();

        if(!this.errors.length){
            //save to the database
            console.log(this.data)
            noticeCollection.insertOne(this.data).then(()=>{
                resolve()
            }).catch(()=>{
                this.errors.push("Please try again later.")
                reject(this.errors)
            })
        }else{
            reject(this.errors)
        }
    })
}


Notice.reusablePostQuery = function(uniqueOperations, visitorId) {
    return new Promise(async function(resolve, reject) {
      let aggOperations = uniqueOperations.concat([
        {$lookup: {from: "admin", localField: "author", foreignField: "_id", as: "authorDocument"}},
        {$project: {
            title:1,
            body:1,
            createdDate: 1,
            authorId: "$author",
            author: {$arrayElemAt: ["$authorDocument", 0]}
        }}
      ])
  
      let notices = await noticeCollection.aggregate(aggOperations).toArray()
  
      // clean up author property in each post object
      notices = notices.map(function(notice) {
          //check if the visitor is the owner
          notice.isVisitorOwner =  notice.authorId.equals(visitorId)
        console.log("owner " +  notice.isVisitorOwner)

        notice.author = {
          username:  notice.author.username,
        //   role: post.author.role
        }
        return  notice
      })
      resolve(notices)
    })
}

Notice.findSingleById = function(id, visitorId) {
    return new Promise(async function(resolve, reject) {
        if (typeof(id) != "string" || !ObjectID.isValid(id)) {
        reject()
        return
        }
        
        let notices = await Notice.reusablePostQuery([
        {$match: {_id: new ObjectID(id)}}
        ], visitorId)
    
        if (notices.length) {
        console.log(notices[0])
        resolve(notices[0])
        } else {
        reject()
        }
    })
}

Notice.findByAuthorId = function(authorId, visitorId) {
    return Notice.reusablePostQuery([
        {$match: {author: authorId}},
        {$sort: {createdDate: -1}}
    ], visitorId)
    
}

Notice.prototype.update = function(){
    return new Promise(async(resolve, reject)=>{
        try{
            let notice = await Notice.findSingleById(this.requstedStudentId, this.userid)
            if(notice.isVisitorOwner){
                //actually update the db
               let status = await this.actuallyUpdate()
                resolve(status)
            }else{
                reject()
            }
        }catch{
            reject()
        }
    })
}
Notice.prototype.actuallyUpdate = function(){
    return new Promise(async(resolve, reject)=>{
        // this.cleanUp()
        // this.validate()
        if(!this.errors.length){
            await noticeCollection.findOneAndUpdate({_id: new ObjectID(this.requstedStudentId)}, {$set:{
                title: this.data.title,
                body: this.data.body,
            }})
            resolve("success")
        }else{
            resolve("failure")
        }
    })
}

Notice.delete = function(noticeIdToDelete, currentUserId) {
    return new Promise(async (resolve, reject)=>{
    try{
        let notices = await Notice.findSingleById(noticeIdToDelete, currentUserId)
        if(notices.isVisitorOwner){
            await noticeCollection.deleteOne({_id: new ObjectID(noticeIdToDelete)})
            resolve()
        }else{
            reject()
        }
    }catch{
        reject()
    }
    })
}

//to display notice

Notice.prototype.displayNotice = function(){
    return new Promise((resolve, reject)=>{
        // let query = {createdDate: {$gt: new Date()}}
        noticeCollection.find().sort().limit(1).toArray(function(err, result){
            if(err){
                reject("Error occurred while loading event " + err)
            }
            // console.log(result.length);
            resolve(result);
        })

    })  
}

Notice.prototype.viewNotice = function(){
    return new Promise(async(resolve, reject)=>{

        await noticeCollection.find().sort({createdDate: -1}).toArray((error, result)=>{
            if(error){
                reject("Error occurs when it is loading the notice " + error)
            }else{
                resolve(result)
            }
        })

    })  
}
          
module.exports = Notice;