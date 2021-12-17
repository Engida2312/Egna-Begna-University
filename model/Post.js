const bcrypt = require('bcryptjs');
const postCollection = require('../db').db().collection("students")
const eventCollection = require('../db').db().collection("events")
const ObjectID = require('mongodb').ObjectID;

const sanitizeHTML = require('sanitize-html');


let Post = function(data, userid, file, requstedStudentId){
    this.data = data
    this.file = file
    this.errors = []
    this.userid = userid
    this.requstedStudentId =requstedStudentId
}

Post.prototype.cleanUp = function() {
    if (typeof(this.data.firstName) != "string") {this.data.firstName = ""}
    if (typeof(this.data.lastName) != "string") {this.data.lastName = ""}
    if (typeof(this.data.phoneNumber) != "string") {this.data.phoneNumber = ""}
    if (typeof(this.data.birthDate) != "string") {this.data.birthDate = ""}
    // if (typeof(this.data.age) != "string") {this.data.age = ""}
    if (typeof(this.data.gender) != "string") {this.data.gender = ""}
    if (typeof(this.data.department) != "string") {this.data.department = ""}
    if (typeof(this.data.email) != "string") {this.data.email = ""}
    if (typeof(this.data.address) != "string") {this.data.address = ""}
    if (typeof(this.data.description) != "string") {this.data.description = ""}
    if (typeof(this.data.username) != "string") {this.data.username = ""}
    if (typeof(this.data.password) != "string") {this.data.password = ""}
  
    // get rid of any bogus properties
    this.data = {
      firstName: sanitizeHTML(this.data.firstName.trim(), {allowedTags: [], allowedAttributes: {}}),
      lastName: sanitizeHTML(this.data.lastName.trim(), {allowedTags: [], allowedAttributes: {}}),
      phoneNumber: sanitizeHTML(this.data.phoneNumber.trim(), {allowedTags: [], allowedAttributes: {}}),
      birthDate: sanitizeHTML(this.data.birthDate.trim(), {allowedTags: [], allowedAttributes: {}}),
    //   age: sanitizeHTML(this.data.age.trim(), {allowedTags: [], allowedAttributes: {}}),
      email: sanitizeHTML(this.data.email.trim(), {allowedTags: [], allowedAttributes: {}}),
      department: sanitizeHTML(this.data.department.trim(), {allowedTags: [], allowedAttributes: {}}),
      gender: sanitizeHTML(this.data.gender.trim(), {allowedTags: [], allowedAttributes: {}}),
    
      address: sanitizeHTML(this.data.address.trim(), {allowedTags: [], allowedAttributes: {}}),
      description: sanitizeHTML(this.data.description.trim(), {allowedTags: [], allowedAttributes: {}}),
      username: sanitizeHTML(this.data.username.trim(), {allowedTags: [], allowedAttributes: {}}),
      password: sanitizeHTML(this.data.password.trim(), {allowedTags: [], allowedAttributes: {}}),
      image: this.file.filename,
      role: "student",
      createdDate: new Date(),
      author: ObjectID(this.userid)
    }
}

Post.prototype.eventSchema = function(){
    this.data = {
        
        eventName:sanitizeHTML(this.data.eventName.trim(), {allowedTags: [], allowedAttributes: {}}),
        eventDate: new Date(this.data.eventDate).toISOString(),
        description:sanitizeHTML(this.data.description.trim(), {allowedTags: [], allowedAttributes: {}}),
        venue:sanitizeHTML(this.data.venue.trim(), {allowedTags: [], allowedAttributes: {}}),
        timing:sanitizeHTML(this.data.timing.trim(), {allowedTags: [], allowedAttributes: {}}),
        registration:sanitizeHTML(this.data.registration.trim(), {allowedTags: [], allowedAttributes: {}}),
        eventId: ObjectID(this.userid)
    }
}

Post.prototype.validate = function() {
    if (this.data.firstName == "") {this.errors.push("You must provide a first name.")}
    if (this.data.lastName == "") {this.errors.push("You must provide post last name.")}
    if (this.data.phoneNumber == "") {this.errors.push("You must provide post phone number.")}
    if (this.data.birthDate == "") {this.errors.push("You must provide post date .")}
    if (this.data.address == "") {this.errors.push("You must provide post address .")}
    if (this.data.gender == "") {this.errors.push("You must provide post gender .")}
    if (this.data.description == "") {this.errors.push("You must provide post description .")}
}

Post.prototype.addStudent = function(){
    return new Promise((resolve, reject)=>{
        this.cleanUp();
        // this.validate();
console.log(this.data.image)
        if(!this.errors.length){
            let salt = bcrypt.genSaltSync(10);
            this.data.password = bcrypt.hashSync(this.data.password, salt)
            //save to the database
            postCollection.insertOne(this.data).then((info)=>{
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
Post.prototype.update = function(){
    return new Promise(async(resolve, reject)=>{
        try{
            let post = await Post.findSingleById(this.requstedStudentId, this.userid)
            if(post.isVisitorOwner){
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
Post.prototype.actuallyUpdate = function(){
    return new Promise(async(resolve, reject)=>{
        // this.cleanUp()
        // this.validate()
        if(!this.errors.length){
            await postCollection.findOneAndUpdate({_id: new ObjectID(this.requstedStudentId)}, {$set:{
                firstName: this.data.firstName,
                lastName: this.data.lastName,
                phoneNumber: this.data.phoneNumber,
                birthDate: this.data.birthDate,
                email: this.data.email,
                department: this.data.department,
                gender: this.data.gender,
                address: this.data.address,
                image: this.data.image,
                description: this.data.description,
                username: this.data.username,
                password: this.data.password,
            }})
            resolve("success")
        }else{
            resolve("failure")
        }
    })
}

Post.reusablePostQuery = function(uniqueOperations, visitorId) {
    return new Promise(async function(resolve, reject) {
      let aggOperations = uniqueOperations.concat([
        {$lookup: {from: "admin", localField: "author", foreignField: "_id", as: "authorDocument"}},
        {$project: {
            firstName: 1,
            lastName: 1,
            phoneNumber: 1,
            birthDate: 1,
            email: 1,
            department: 1,
            gender: 1,
            address: 1,
            image: 1,
            description: 1,
            username: 1,
            role:1,
            createdDate: 1,
            authorId: "$author",
            author: {$arrayElemAt: ["$authorDocument", 0]}
        }}
      ])
  
      let posts = await postCollection.aggregate(aggOperations).toArray()
  
      // clean up author property in each post object
      posts = posts.map(function(post) {
          //check if the visitor is the owner
        post.isVisitorOwner = post.authorId.equals(visitorId)
        console.log("owner " + post.isVisitorOwner)

        post.author = { 
          username: post.author.username,
        //   role: post.author.role
        }
        return post
      })
      resolve(posts)
    })
}

Post.findSingleById = function(id, visitorId) {
return new Promise(async function(resolve, reject) {
    if (typeof(id) != "string" || !ObjectID.isValid(id)) {
    reject()
    return
    }
    
    let posts = await Post.reusablePostQuery([
    {$match: {_id: new ObjectID(id)}}
    ], visitorId)

    if (posts.length) {
    console.log(posts[0].author)
    resolve(posts[0])
    } else {
    reject()
    }
})
}

Post.findByAuthorId = function(authorId, visitorId) {
return Post.reusablePostQuery([
    {$match: {author: authorId}},
    {$sort: {createdDate: -1}}
], visitorId)  

}

Post.delete = function(postIdToDelete, currentUserId) {
  return new Promise(async (resolve, reject)=>{
    try{
        let post = await Post.findSingleById(postIdToDelete, currentUserId)
        if(post.isVisitorOwner){
           await postCollection.deleteOne({_id: new ObjectID(postIdToDelete)})
           resolve()
        }else{
            reject()
        }
    }catch{
        reject()
    }
  })
}
    

//event
Post.prototype.addEvent = function(){
    return new Promise((resolve, reject)=>{
        eventCollection.insertOne(this.data).then(()=>{
            resolve()
        }).catch(()=>{
            this.errors.push("Error occurred while creating event, please try again")
            reject(this.errors)
        })
    })
}

Post.prototype.getEvent = function(){
    return new Promise((resolve, reject)=>{
        let query = {eventId: this.data.eventId};
        // console.log(this);
        eventCollection.find(query).toArray((err, result)=>{
            if(err){
                reject("Error occurred while reading from db: \n" + err);
            }
            // console.log(result);
            resolve(result);
        })
    })
}

Post.search = function(searchTerm){
    return new Promise(async (resolve, reject) => {
        if(typeof(searchTerm) == "string"){
            let posts = await Post([{$match: {$text: {$search: searchTerm}}}]
                ,undefined, [{$sort: {score: {$meta: "textScore"}}}])
                resolve(posts)
            }else{
                reject()
            }
    })
}


module.exports = Post;