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


router.get('/your-files', function (req, res) {
  res.render('your-files')
})

router.post('/your-files', function (req, res) {

  /// ///////////////////////////////////////////////////////////////////////////
  // COMMON PHOTO FUNCTIONS
  function deletePhoto (req, files) {

    // Remove photo from photos array session variable
    const indexOfFile = req.session.data.files.indexOf(files)
    req.session.data.files.splice(indexOfFile, 1)

    // Delete photo from storage
    const filePath = path.join(viewsFolder, '/uploads', files)
    fs.unlink(filePath, err => {
      if (err) {
        console.log(err)
      }
    })

    console.log(`file deleted: ${file}`)
    console.log(`files array: ${req.session.data.files}`)
  }
  res.redirect('your-files')
})






/////MULTER/////
router.post('/add-files', function (req, res) {


  // Prepare for the photo upload code
  const upload = multer({
    dest:  path.join(viewsFolder, '/uploads'),
    limits: {
      fileSize: 8 * 1024 * 1024 // 8 MB (max file size in bytes)
    }
  }).single('fileUpload') /* name attribute of <file> element in the html form */


//multiple files
//.array('fileUpload', 6)


  // Upload the chosen file to the multer 'dest'
  upload(req, res, function (err) {

    // Handle errors
    if (err) {
    //  logger(req, 'Multer threw an error' + err)
    console.log('err = ' + err)
    }

    // Handle no file chosen
    if (!req.file) {
  //    logger(req, 'No file was chosen/uploaded')
  console.log('No file was chosen/uploaded')
      res.render('add-files', {
        errorNoFile: 'Please choose a photo'
      })
    } else {



      // Handle a wrong file type
      const multerDestPath = req.file.path
      var fileExt = path.extname(req.file.originalname).toLowerCase()
      if (fileExt !== '.png' && fileExt !== '.jpg' && fileExt !== '.jpeg') {
  //      logger(req, 'Wrong file type')
  console.log('Wrong file type')
        fs.unlink(multerDestPath, err => {
          if (err) console.log(err)
        })
        res.render('add-files', {
          errorNoFile: 'The selected file must be a JPG or PNG'
        })
      }

      //    let uploads = <{ files: fileUpload.UploadedFile[] }>req.files;
      //           for (let i = 0; i < uploads.files.length; ++i) {}

      // Passes all validation, so move/rename it to the persistent location
      // (We need to initially save it somewhere to get the file extension otherwise we'd need an additional module to handle the multipart upload)
      var files = new Date().getTime().toString() + fileExt // getTime() gives the milliseconds since 1970...
      const targetPath = path.join(viewsFolder, '/uploads', files)

      fs.rename(multerDestPath, targetPath, function (err) {
        if (err) {
          console.log('err = ' + err)
        } else {
          res.redirect('your-files')
        }
      })

      // Handle session variables
      // Add a photo to the photos array (and create array if it doesn't exist yet)
      if (!req.session.data.files) {
        req.session.data.files = []
      }
      req.session.data.files.push(files)
      console.log(`files added: ${files}`)
      console.log(`files array: ${req.session.data.files}`)
    }
  })
})


module.exports = router
