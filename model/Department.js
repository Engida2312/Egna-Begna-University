const departmentCollection = require('../db').db().collection("departments")
const eventCollection = require('../db').db().collection("events")
const noticeCollection = require('../db').db().collection("Notice")
const postCollection = require('../db').db().collection("students")

const Post = require('../model/Post');


let Department = function(data, file){
    this.data = data
    this.file = file
    this.errors = []
}

Department.prototype.cleanUp = function() {
    if (typeof(this.data.departmentName) != "string") {this.data.departmentName = ""}
    if (typeof(this.data.description) != "string") {this.data.description = ""}
    
    // get rid of any bogus properties
    this.data = {
        departmentName: this.data.departmentName,
        description: this.data.description,
        image: this.file.filename,
        createdDate: new Date(),
    }   
}

//Department
Department.prototype.departmentAdd = function(){
    this.cleanUp()

    return new Promise((resolve, reject)=>{
        departmentCollection.insertOne(this.data).then((result)=>{
            resolve()
        }).catch(()=>{
            this.errors.push("Error occurred while creating event, please try again")
            reject(this.errors)
        })
    })
}

//read all event
Department.prototype.displayDepartment = function(){
    return new Promise(async(resolve, reject)=>{

        await departmentCollection.find().sort({createdDate: -1}).toArray((error, result)=>{
            if(error){
                reject("Error occurred while loading event " + error)
            }else{
                resolve(result)
            }
        })

    })  
}
//read specific number of events  
Department.prototype.displayLimitedNoDepartment =  function(id){
    return new Promise(async(resolve, reject)=>{

        let query = {eventDate: {$gt: new Date().toISOString()}}
        const notice_1 = await noticeCollection.find().sort({createdDate: -1}).limit(2).toArray();
        const result1 = await eventCollection.find().toArray();
        const result2 = await departmentCollection.find().sort({createdDate: -1}).limit(4).toArray();
        
 
        const student_no = await postCollection.find().count();
        const department_no = await departmentCollection.find().count();
        // const count3 = await noticeCollection.find().count()

        // const student = await Post.findSingleById(id);
        
        const result = {
            notice : notice_1,
            result1 : result1,
            result2 : result2,
            student_no: student_no,
            department_no: department_no,
            // student : student,
        }

        if(!result){
            reject("Error occurred while loading event " + error)
        }else{
            resolve(result)
        }

    })  
}



module.exports = Department;