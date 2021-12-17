const Department = require('../model/Department');
const upload = require("../middleware/upload");


exports.viewAllCourses = function(req, res){
    // res.render('all-courses');
    let department = new Department(req.body);
    department.displayDepartment().then((result)=>{

        res.render('all-courses', {departments: result})
    }).catch((err)=>{
        console.log(e);
    })
}
//department detail
exports.viewAddDepartment = function(req, res){
    res.render('add-department');
}
exports.addDepartment = async(req, res)=>{

      // image upload
    try {
        await upload(req, res);
        console.log(req.file);
    
        if (req.file.length <= 0) {
          return res
            .status(400)
            .send({ message: "You must select at least 1 file." });

        }else{
          
            let department = new Department(req.body, req.file);

            department.departmentAdd().then(()=>{
                 req.flash("success", "New Department successfully added.")
                res.redirect('/all-departments')
            }).catch(function(errors){
                // errors.forEach(error => req.flash("errors", error))
                req.session.save(() => res.redirect("/add-department"))
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


exports.allDepartment = function(req, res){
    let department = new Department(req.body);
    department.displayDepartment().then((result)=>{

        res.render('allDepartments', {departments: result})
    }).catch((err)=>{
        console.log(e);
    })
    
}