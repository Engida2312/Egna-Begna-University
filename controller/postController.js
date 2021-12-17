const Post = require('../model/Post');
const upload = require("../middleware/upload");
//Students detail
exports.viewAddScreen = function(req, res){
    res.render('add-student');
}

exports.addStudent = async(req, res)=>{ 
        // image upload
    try {
        await upload(req, res);
        console.log(req.file);
    
        if (req.file.length <= 0) {
          return res 
            .status(400)
            .send({ message: "You must select at least 1 file." });

        }else{
            let post = new Post(req.body, req.session.user._id, req.file)
            post.addStudent().then(function(newId){
                req.flash("success", "New student successfully added.")
                req.session.save(() => res.redirect(`/profile/${newId}`))
            }).catch(function(errors){
                // errors.forEach(error => req.flash("errors", error))
                req.session.save(() => res.redirect("/add-student"))
            })
 
        }

    } catch (error) {
        console.log(error);
    
        if (error.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).send({
            message: "Too many files to upload.",
          });
        }
        return res.status(500).send({
          message: `Error when trying upload many files: ${error}`,
        });
    
        // return res.send({
        //   message: "Error when trying upload image: ${error}",
        // });
    }

    
}

 
exports.profileStudentsScreen = async function(req, res){
    try{
      let post = await Post.findSingleById(req.params.id, req.visitorId);
    //   console.log(post)
      res.render('profile', {post: post});
    }catch{
      res.render("404");
    }
}
exports.viewEditScreen = async function(req, res){
    try{
        let post = await Post.findSingleById(req.params.id)
        if(post.authorId == req.visitorId){
            res.render('edit-student', {post: post})
        }else{
            req.flash("errors", "you do not have permission to perform this action")
            req.session.save(()=> res.redirect("/"))
        }
    }catch{
        res.render('404')
    } 
}
exports.edit = function(req, res){
    let post = new Post(req.body, req.visitorId, req.params.id)
    post.update().then((status)=>{
        //the post was successfully updated in the databse 
        //pr user did have permission, but there were validation errors
        if(status == "success"){
            //post was updated in db
            req.flash("success", "Student Successfully updated")
            req.session.save(function(){
                res.redirect(`/student/${req.params.id}/edit`)
            })
        }else{
           post.errors.forEach(function(error){
               req.flash("errors", error)
           }) 
           req.session.save(function(){
               res.redirect(`/student/${req.params.id}/edit`)
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
    Post.delete(req.params.id, req.visitorId).then(()=> {
        req.flash("success", "Student successfully deleted")
        req.session.save(()=>res.redirect(`/all-student/${req.session.user.username}`))
    }).catch(()=>{
        req.flash("errors", "You do not have permission to perform this action")
        req.session.save(()=>res.redirect("/"))
    })
}

//event controller
exports.addEventPage = function(req, res){
    res.render('add-event');
}

exports.addEvent = function(req, res){
    
    let post = new Post(req.body, req.body._id);
    post.eventSchema();
    post.addEvent().then((result)=>{
        res.render('event-created', {eventData: post.data})
    })
}














exports.search = function(req, res){
    Post.search(req.body.searchTerm).then(posts => {
        res.json(posts)
    }).catch(() => {
        res.json([])
    })
}
