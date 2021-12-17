const Admission = require('../model/Admission');

exports.allAdmission = function(req, res){
    let admission = new Admission(req.body);
    admission.displayAdmission().then((result)=>{ 
        res.render('all-admission', {
            admission: result.admission1
        })
    }).catch((err)=>{
        res.send(e)
    })
    
}

