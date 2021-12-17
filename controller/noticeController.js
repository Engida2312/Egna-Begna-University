const Notice = require('../model/Notice');
const noticeCollection = require('../db').db().collection("Notice");


//home
exports.home = function(req, res){
    let notice = new Notice(req.body);
    if(req.session.user){
        if(req.session.user.username == 5000){
            res.render('dashbord')
        }else{
            // res.render('student-page', {username: req.session.user.username})
            user.displayNotice().then(function(noticeList){
                req.session.user = {email: user.data.email}
                req.session.save(function(){
                    res.render('home', {username: req.session.user.username, notice: noticeList});
                })
            })
           
        }
    }else{
        res.render('home');
    }
}




//Notice part
exports.viewAddNotice = function(req, res){
    res.render('for-students');
}

exports.addNotice = function(req, res){
    let notice = new Notice(req.body, req.session.user._id)

    notice.addNotice().then(function(newId){
        // res.send("New Notice Created")
        req.flash("success", "New Notice added.")
        req.session.save(() => res.redirect("/"))
    }).catch(function(errors){
        // errors.forEach(error => req.flash("errors", error))
        req.session.save(() => res.redirect("/for-students"))
    })
}
 

exports.viewAllNotice = function(req, res){
    Notice.findByAuthorId(req.profileUser._id, req.visitorId).then(function( notices){
        res.render('notice-page',{
            notices:  notices,
            profileUsername: req.profileUser.username,
            // userRole: req.profileUser.role
        }) 
    }).catch(function(){
        res.render('404')
    })
}



exports.viewEditScreen = async function(req, res){
    try{
        let notice = await Notice.findSingleById(req.params.id)
        if(notice.authorId == req.visitorId){
            res.render('edit-notice', {notice: notice})
        }else{
            req.flash("errors", "you do not have permission to perform this action")
            req.session.save(()=> res.redirect("/"))
        }
    }catch{
        res.render('404')
    } 
}
exports.edit = function(req, res){
    let notice = new Notice(req.body, req.visitorId, req.params.id)
    notice.update().then((status)=>{
        if(status == "success"){
            //post was updated in db

            req.flash("success", "Student successfully updated")
        req.session.save(()=>res.redirect(`/all-notice/${req.session.user.username}`))


            //req.flash("success", "Student Successfully updated")
            //req.session.save(function(){
             //   res.redirect(`/all-notice/${req.params.id}/edit`)
           // })
        }else{
            notice.errors.forEach(function(error){
               req.flash("errors", error)
           }) 
           req.session.save(function(){
               res.redirect(`/all-notice/${req.params.id}/edit`)
           })
        }
    }).catch(()=>{
        // if the requested id doesn't exit
        //or if the current visitor is not th owner of the requested post
        req.flash("errors", "You do not have permission to perform this action")
        res.redirect("/")
    })
}

exports.delete = function(req, res){
    Notice.delete(req.params.id, req.visitorId).then(()=> {
        req.flash("success", "Student successfully deleted")
        req.session.save(()=>res.redirect(`/all-notice/${req.session.user.username}`))
    }).catch(()=>{
        req.flash("errors", "You do not have permission to perform this action")
        req.session.save(()=>res.redirect("/"))
    })
}


exports.allNotice = function(req, res){
    let notice = new Notice();
    user.displayNotice().then((notices)=>{

        res.render('notice-page', {notice: notice})
    }).catch((err)=>{
        console.log(e);
    })
    
}

exports.viewNotice = function(req, res){
    
    let notices = new Notice();
    notices.viewNotice().then((notices)=>{

        res.render('student-notice-link', {notices: notices})
    }).catch((err)=>{
        console.log(e);
    })
}
