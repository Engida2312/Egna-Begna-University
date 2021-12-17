const usersCollection = require('../db').db().collection("Users")
const postCollection = require('../db').db().collection("students")
const departmentCollection = require('../db').db().collection("departments")

let Admission = function(data){
    this.data = data;
    this.errors = [];
} 

Admission.prototype.displayAdmission = function(){
    return new Promise(async(resolve, reject)=>{
        const admission1 = await usersCollection.find().sort({createdDate: -1}).toArray();
        const admission2 = await usersCollection.find().sort({createdDate: -1}).limit(5).toArray();

        const admission_no = await usersCollection.find().count();
        const student_no = await postCollection.find().count();
        const department_no = await departmentCollection.find().count();
        
        const admission = {
            admission1: admission1,
            admission2: admission2,
            admission_no: admission_no,
            student_no: student_no,
            department_no: department_no,
        }
        if(admission){
            resolve(admission)
        }else{
            reject('error loading data')
        }
    })
}

module.exports = Admission