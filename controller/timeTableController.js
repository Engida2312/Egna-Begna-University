const TimeTable = require('../model/TimeTable');

//timetable
exports.displayTimeTableForm = function(req, res){
    res.render('add-time-table');
}

exports.addTimeTable = function(req, res){
    let timeTable = new TimeTable(req.body, req.session.user._id)

    timeTable.addTimeTable().then(function(newId){
        req.flash("success", "New time table successfully added.")
        req.session.save(() => res.redirect("/"))
    }).catch(function(errors){
        // errors.forEach(error => req.flash("errors", error))
        req.session.save(() => res.redirect("/add-time-table"))
    })
}

exports.viewTimeTable = async function(req, res){
    try{
      let timeTable = await TimeTable.findSingleById(req.params.id);
      console.log(timeTable)
      res.render("student-page",{timeTable:timeTable});
    }catch{
      res.render("404");
    }
}
