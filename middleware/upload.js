
const multer = require('multer')

const util = require('util');



const storage = multer.diskStorage({
  //destinarion for files
  destination: function (request, file, callback) {
    callback(null, 'public/uploads/images');
  },

  //add back the extension
  filename: function(request, file, callback){
    callback(null, Date.now() + "EgnaBegna");
    
  },  
})

var uploadFiles = multer({ storage: storage }).single("image");
var uploadFilesMiddleware = util.promisify(uploadFiles);

module.exports = uploadFilesMiddleware;
