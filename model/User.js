const bcrypt = require('bcryptjs');
const usersCollection = require('../db').db().collection("Users")
const postCollection = require('../db').db().collection("students")
const adminCollection = require('../db').db().collection("admin")
const noticeCollection = require('../db').db().collection("Notice")
 
const nodeMailer = require('nodemailer')
const crypto = require('crypto')
const validator = require('validator');
const eventCollection = require('../db').db().collection("events")

let User = function(data){
    this.data = data;
    this.errors = [];
} 
//cleanUp   
User.prototype.cleanUp = function(){
    if(typeof(this.data.firstName) != "string"){this.data.firstName = ""}
    if(typeof(this.data.middleName) != "string"){this.data.middleName = ""}
    if(typeof(this.data.lastName) != "string"){this.data.lastName = ""}
    if(typeof(this.data.courses) != "string"){this.data.courses = ""}
    if(typeof(this.data.email) != "string"){this.data.email = ""}
    if(typeof(this.data.gender) != "string"){this.data.gender = ""}
    if(typeof(this.data.phoneNumber) != "string"){this.data.phoneNumber = ""}
    if(typeof(this.data.address) != "string"){this.data.address = ""}
    // if(typeof(this.data.password) != "string"){this.data.password = ""}
    // if(typeof(this.data.confirmPassword) != "string"){this.data.confirmPassword = ""}

    //get rid of bouges properties 
    this.data = {
        firstname: this.data.firstName,
        // fullname: this.data.fullname,
        middleName: this.data.middleName,
        lastName: this.data.lastName,
        courses: this.data.courses,
        // username: this.data.username.trim().toLowerCase(),
        gender: this.data.gender,
        email: this.data.email.trim().toLowerCase(),
        phoneNumber: this.data.phoneNumber,
        address: this.data.address,
        // password: this.data.password,
        role: "applicant",
        token: "",
        createdDate: new Date()
    }
}
//validation
User.prototype.validate = function(){
    return new Promise((resolve, reject)=>{
        if(this.data.firstName == ""){this.errors.push("YOU MUST PROVIDE First name")}
        if(this.data.middleName == ""){this.errors.push("YOU MUST PROVIDE Middle name")}
        if(this.data.lastName == ""){this.errors.push("YOU MUST PROVIDE Last name")}
        if(this.data.courses == ""){this.errors.push("YOU MUST PROVIDE a course")}
        if(this.data.email == ""){this.errors.push("YOU MUST PROVIDE Email address")}
        if(this.data.gender == ""){this.errors.push("You must select gender")}
        if(this.data.phoneNumber == ""){this.errors.push("YOU MUST PROVIDE a Phone Number")}
        if(this.data.address == ""){this.errors.push("YOU MUST PROVIDE an Resdetional Address")}
        // if(this.data.password == ""){this.errors.push("You MUST PROVIDE A password")}
        // if(this.data.confirmPassword == ""){this.errors.push("You MUST confirm the password")}
        resolve();
    })
}

//Register users
User.prototype.register = function(){
    return new Promise(async (resolve, reject)=>{
        //step 1 validate user data
        this.cleanUp();
        // await this.validate();

        //step 2 if there are no validation error then save the data to database
        if(!this.errors.length){
            await usersCollection.insertOne(this.data);
            resolve();
        }else{
            reject(this.errors);
        }
    })
}

//Login for admin
User.prototype.loginAdmin = function(){
    return new Promise((resolve, reject) => {
        // this.cleanUp();
        // this.validate();

      adminCollection.findOne({username: this.data.username}).then((attemptedUser)=>{
            if(attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)){
                this.data =  attemptedUser;
                if(this.data.role == "admin"){
                    resolve("Login successfull");
                }else{
                    reject("Invalid Email/Password")
                }
            }else{
                reject("Invalid Email/Password");
            }
        }).catch(function(){
            reject("Please try again later")
        });
    });
}
//Login for user
User.prototype.loginUser = function(){
    return new Promise((resolve, reject) => {
        // this.cleanUp();
        // this.validate();
        console.log(this.data)
      postCollection.findOne({username: this.data.username}).then((attemptedUser)=>{
        
            if(attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)){
                this.data =  attemptedUser;
                if(this.data.role == "student"){
                    resolve("Login successfull");
                }else{
                    reject("Invalid Email/Password")
                }
                
            }else{
                reject("Invalid Email/Password"); 
            }
        }).catch(function(){
            reject("Please try again later")
        });
    });
}

//forgot password

User.prototype.forgotPassword = function(){
    return new Promise((resolve, reject) =>{

        usersCollection.findOne({email: this.data.email}).then((user)=> {
            // console.log(attemptedUser);
            if(user && this.data.email === user.email){

            // Generating link for user using token
            // let tokenSchema = usersCollection.findOne({token: user.token});

            
            // token = new user.tokenSchema({token: crypto.randomBytes(32).toString("hex")}).save();
            // token =  new user.token({token: crypto.randomBytes(32).toString("hex")}).save();
            let value = crypto.randomBytes(32).toString("hex");
            
               let newValues = { $set: {token: value}}
            //    console.log(this.data.email)
                usersCollection.updateOne({email: this.data.email}, newValues, (err, res)=>{
                    if(err){
                    console.log(err);
                    };
                })
            const link = `${process.env.BASE_URL}/resetPassword/${value}`;

                //********* Sending the link **************/
                let transporter = nodeMailer.createTransport({
                    service: process.env.SERVICE,
                    port: 587,
                    secure: false,
                    auth: {
                    user: process.env.USER,
                    pass: process.env.PASS
                    },
                    tls: {
                        rejectUnauthorized:false
                    }
                    
                });
            
                let message = {
                    from: 'projectsis226@gmail.com', // sender address
                    to: `${user.email}`, // list of receivers
                    subject: "Reset password link", // Subject line
                    text: `Here's your password reset link: ${link} Go to this link to reset your password.` // plain text body
            
                }
                // send mail with defined transport object
                transporter.sendMail(message, function (err, data){
                    if(err){
                        console.log("error occurred", err);
                    }else{
                        console.log("mail sent");
                    }
                })
                
            
                resolve("<h1>Link has been sent to the email</h1>");
            }else{
                reject("User with this email doesn't exist")
            }
        }).catch(function(){
            reject("Error occurred, try again")
        });
    
    })

}

User.findByUsername = function(username) {
    return new Promise(function(resolve, reject) {
      if (typeof(username) != "string") {
        reject()
        return
      }
      adminCollection.findOne({username: username}).then(function(userDoc) {
        if (userDoc) {
          userDoc = new User(userDoc, true)
          userDoc = {
            _id: userDoc.data._id,
            username: userDoc.data.username,
            // role: userDoc.data.role
            // avatar: userDoc.avatar
          }
          resolve(userDoc)
        } else {
          reject()
        }
      }).catch(function() {
        reject()
      })
    })
  }

User.prototype.displayEvent = function(){
    return new Promise(async(resolve, reject)=>{
        let query = {eventDate: {$gt: new Date().toISOString()}}

        const notice = await noticeCollection.find().sort().limit(1).toArray();
        const events = await eventCollection.find(query).toArray();
        const result = {
            notice: notice,
            events: events
        }
        console.log(result.notice)
        if(result){
            resolve(result);
        }else{
            reject("Error occurred while loading event " + err)
        }            
    })  
}


module.exports = User;