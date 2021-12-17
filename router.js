const express = require('express');
const router = express.Router();
const userController = require('./controller/userController');
const postController = require('./controller/postController');
const departmentController = require('./controller/departmentController');
const admissionController = require('./controller/admissionController')
const timeTableController = require('./controller/timeTableController');
const noticeController = require('./controller/noticeController');
            // user related routes
router.get('/', userController.home);

//register for user
router.get('/register', userController.registerPage);
router.post('/register', userController.register);

//login page for users
router.get('/login', userController.loginPage);
router.post('/login', userController.userLogin);
//login page for admin
router.get('/admin/login', userController.adminLoginPage)
router.post('/admin/login', userController.adminLogin)
//logout
router.post('/logout', userController.logout);


            //forgot password
router.get('/forgotPassword', userController.forgotPasswordPage);
router.post('/forgotPassword', userController.forgotPassword);
router.get('/resetPassword/:token', userController.resetPasswordPage)
router.post('/resetPassword', userController.resetPassword)  

                //Profile related routes
router.get('/all-student/:username', userController.mustBeLoggedIn, userController.ifUserExists, userController.viewAllStudents)
                //student related routes
router.get('/add-student', userController.mustBeLoggedIn, postController.viewAddScreen)
router.post('/add-student', userController.mustBeLoggedIn, postController.addStudent)
router.get('/profile/:id', userController.mustBeLoggedIn, postController.profileStudentsScreen)
router.get('/student/:id/edit', userController.mustBeLoggedIn, postController.viewEditScreen)
router.post('/student/:id/edit', userController.mustBeLoggedIn, postController.edit)
router.get('/student/:id/delete', userController.mustBeLoggedIn, postController.delete)
router.post('/search', postController.search)
                //student related routes
router.get('/add-department', userController.mustBeLoggedIn, departmentController.viewAddDepartment)
router.post('/add-department', userController.mustBeLoggedIn, departmentController.addDepartment)
router.get('/all-departments', userController.mustBeLoggedIn, departmentController.allDepartment)
router.get('/all-courses', departmentController.viewAllCourses)

//admissions
router.get('/all-admission', admissionController.allAdmission)


//timetable
router.get('/add-time-table', userController.mustBeLoggedIn, timeTableController.displayTimeTableForm)
router.post('/add-time-table', userController.mustBeLoggedIn, timeTableController.addTimeTable)
router.get('/time-table/:id', userController.mustBeLoggedIn, timeTableController.viewTimeTable)

//Notice
router.get('/notice',  userController.mustBeLoggedIn, noticeController.viewAddNotice);
router.post('/notice', userController.mustBeLoggedIn, noticeController.addNotice);
router.get('/notice/:id/edit', userController.mustBeLoggedIn, noticeController.viewEditScreen)
router.post('/notice/:id/edit', userController.mustBeLoggedIn, noticeController.edit)
router.get('/notice/:id/delete', userController.mustBeLoggedIn, noticeController.delete)
router.get('/all-notice', noticeController.allNotice)
router.get('/all-notice/:username', userController.mustBeLoggedIn, userController.ifUserExists, noticeController.viewAllNotice)
router.get('/student-notice-link', userController.mustBeLoggedIn, noticeController.viewNotice)


//event related - admin
router.get('/addEvent', postController.addEventPage)
router.post('/addEvent', postController.addEvent)
router.get('/allEvents', userController.allEventsPage)

//homepage-links
//extra page
router.get('/photoGallery', userController.showPhotoGallery)
router.get('/whyUs', userController.showWhyUsPage)
router.get('/medicine', userController.showMedicinePage)




module.exports = router;