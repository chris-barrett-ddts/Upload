const express = require('express')
const router = express.Router()
const multer  = require('multer')
const app = express()
const path = require('path');
//const rootAppDirectory = require('../../config').rootAppDirectory // Used when a full path is required, e.g. '/Users/dave/Documents/NODE/projects/DEFRA/ivory-prototype/app' or '/app/app' on Heroku
const viewsFolder = path.join(__dirname, '/views/') // Set the views with a relative path (haven't yet found a better way of doing this yet)
const fs = require('fs')

router.get('/add-files', function (req, res) {
  res.render('add-files')
})

/////MULTER/////
router.post('/add-files', function (req, res) {


  // Prepare for the photo upload code
  const upload = multer({
    dest:  path.join(viewsFolder, '/uploads'),
    limits: {
      fileSize: 8 * 1024 * 1024 // 8 MB (max file size in bytes)
    },
    filename: function (req, file, cb) {
    // Here we specify the file name to save it as
    cb(null, file.originalname);
  }
  }).array('fileUpload', 6)


  // Upload the chosen files to the multer 'dest'
  upload(req, res, function (err) {
    if (!req.session.data.files) {
      var uploadedFiles = []
    } else { var uploadedFiles = req.session.data.files }

       for (let i = 0; i < req.files.length; ++i) {
        //console.log(req.files[i].originalname)

uploadedFiles.push(req.files[i].originalname);
}

//console.log(uploadedFiles);
req.session.data.files = uploadedFiles
res.redirect('your-files')
    })

})


//YOUR FILES//////////

router.get('/your-files', function (req, res) {
  res.render('your-files')
})

router.post('/your-files', function (req, res) {
    let file = req.body.remove
    //console.log(req.body.remove)
    let uploadedFiles = req.session.data.files

    var deleteName = uploadedFiles.indexOf(file);
    uploadedFiles.splice(deleteName, 1);

//confirmation banner
req.session.data.fileRemoved = "_blank.csv"
console.log(req.session.data.fileRemoved)


//if all the files in the list are removed re-direct back to the upload page
    if (uploadedFiles.length === 0) {
    res.redirect('add-files')
    } else {
    res.redirect('your-files')
    }

  })










module.exports = router
