const User = require('../model/User');
const Department = require('../model/Department');
const Admission = require('../model/Admission');
const nodeMailer = require('nodemailer')
const usersCollection = require('../db').db().collection("Users");
const bcrypt = require('bcryptjs');
const Post = require('../model/Post');

exports.mustBeLoggedIn = function(req, res, next){
    if(req.session.user){
        next();
    }else{
        req.flash("errors", "you must be logged in to perform the action")
        req.session.save(function(){
            res.redirect('/')
        })
    }
}

//home
exports.home = async function(req, res){
    if(req.session.user){
        if(req.session.user.role == 'admin'){

            let admission = new Admission(req.body)
            await admission.displayAdmission().then((result)=>{
                res.render('dashbord', {
                    admission: result.admission2,
                    admission_no: result.admission_no,
                    student_no: result.student_no,
                    department_no: result.department_no,
                })
            }).catch(()=>{
                res.render('404')
            })
            
        }else{
            let department = new Department(req.body);
          
            // req.session.user = {email: user.data.email}
            console.log(req.session.user._id)
            
            department.displayLimitedNoDepartment(req.session.user._id).then((result)=>{
                req.session.save(()=>{
                    console.log("notice " + result.notice)
                    
                         res.render('student-page', {
                        username: req.session.user.username,
                        notices: result.notice,
                        events: result.result1,
                        departments: result.result2,
                        student: result.student,
                    })
                   
                })
            }).catch((e)=>{
                res.render('404')
                console.log(e)
            })
        }  
    }else{  
        let department = new Department(req.body);
            
        department.displayLimitedNoDepartment().then((result)=>{

            res.render('home', {
                events: result.result1,
                departments: result.result2,
                notices: result.notice,
                student_no: result.student_no,
                department_no: result.department_no,
            })
        }).catch((err)=>{
            console.log(e);
        })
    }
}

//Register Users
exports.registerPage = function(req, res){
    res.render('register', {regErrors: req.flash('regErrors')});
}

exports.register = function(req, res){
    let user = new User(req.body);
    user.register().then(()=>{
        // req.session.user = {username: user.data.username, _id: user.data._id}
        req.session.save(function(){
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
                to: `${user.data.email}`, // list of receivers
                subject: "Registered successfully", // Subject line
                text: `Dear ${user.data.firstName}, registration is done successfully. Wait for further instructions` // plain text body
        
            }
            // send mail with defined transport object
            transporter.sendMail(message, function (err, data){
                if(err){
                    console.log("error occurred", err);
                }
                //else{
                //     console.log("mail sent");
                // }
            })
            
        
            res.render('registration-done');
        // res.send("successfully registed");//email shoud be send to the user  saying "successfully registred"
        });
    }).catch((error)=>{
        // regErrors.forEach(function(error){
            req.flash('regErrors', error)
        // })
        req.session.save(function(){
            res.redirect('/register');
        });
    });
}

//Login for admin
exports.adminLoginPage = function(req, res){
    res.render('admin-login')
}
exports.adminLogin = function(req, res){
    let user = new User(req.body);
    // console.log(user)
    user.loginAdmin().then(function(result){
        // console.log(user.data.email)
        req.session.user = {username: user.data.username, role: user.data.role, _id: user.data._id}
        req.session.save(function(){
            res.redirect('/');
        })
    }).catch(function(e){
        req.flash('errors', e);
        req.session.save(function(){
            res.redirect('/admin/login');
        });
    });
}

//login for users
exports.loginPage = function(req, res){
    res.render('login')
}

exports.userLogin = function(req, res){
    let user = new User(req.body);
    // console.log(user)
    user.loginUser().then(function(result){
        // console.log(user.data.email)
        user.displayEvent().then(function(eventsList){
            req.session.user = {email: user.data.email, role: user.data.role}
            req.session.save(function(){
                res.redirect('/');
            })
        })
    }).catch(function(e){
        req.flash('errors', e);
        req.session.save(function(){
            res.redirect('/login');
        });
    })
    
}
//LOGOUT
exports.logout = function(req, res){
    req.session.destroy(function(){
        res.redirect('/')
    })
}

//forgot password
exports.forgotPasswordPage = function(req, res){
    res.render('forgotPassword');
}

exports.forgotPassword = function(req, res){
    let user = new User(req.body);
    user.forgotPassword().then((result) =>{
        res.render('link-sent-page');

    }).catch((e) =>{
        res.send(e);
    })

    
}

exports.resetPasswordPage = function(req, res){

    usersCollection.findOne({token: req.params.token}).then((user) =>{
        if(user && req.params.token == user.token){
            
            if(!user.token)
                return res.send("Invalid or expired link.");
            }
        
        let emptyToken = { $set: {token:""} };
       
        usersCollection.updateOne({token: user.token}, emptyToken, (err, res)=>{
            if(err) throw err;
            
        })
        res.render('resetPassword');
    }).catch((e)=>{
        res.send(e);
    })
    
}

exports.resetPassword = function(req, res){

    usersCollection.findOne({email: req.body.email}).then((user) =>{
        user = new User(req.body)

        if(user && req.body.email == user.data.email){
            
            if(user.data.password == user.data.confirmPassword){

                let salt = bcrypt.genSaltSync(10);
                let pass = bcrypt.hashSync(req.body.password, salt);
                let conPass = req.body.confirmPassword;

                let newValues = { $set: {password: pass, confirmPassword: conPass}}
                usersCollection.updateOne({email: user.data.email}, newValues, (err, res)=>{
                    if(err) throw err;
                })
                res.render('password-reset-done')
            }
        
        }

    }).catch((e)=>{
        res.send("An error occurred.");
        console.log(e);
    })
  
}
//*********************** */
//getting user id and username from database
exports.ifUserExists = function(req, res, next) {
    User.findByUsername(req.params.username).then(function(userDocument) {
      req.profileUser = userDocument
      console.log(req.profileUser)
      next()
    }).catch(function() {
      res.render("404")
    })
}
//find that specific user using his id and retrive all his documents from another database
exports.viewAllStudents = function(req, res){
    Post.findByAuthorId(req.profileUser._id, req.visitorId).then(function(posts){
        res.render('all-student',{
            posts: posts,
            ptofileUsername: req.profileUser.username,
            // userRole: req.profileUser.role
        }) 
    }).catch(function(){
        res.render('404')
    })
}

exports.allEventsPage = function(req, res){
    let user = new User();
    user.displayEvent().then((eventsList)=>{

        res.render('all-events', {events: eventsList})
    }).catch((err)=>{
        console.log(e);
    })
}

//Simple home-page sub pages render

exports.showPhotoGallery = function(req, res){
    res.render('photoGallery');
}

exports.showWhyUsPage = function(req, res){
    res.render('why-us');
}
exports.showMedicinePage = function(req, res){
    res.render('course-medicine');
}