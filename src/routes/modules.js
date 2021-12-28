'use strict';
const ModuleController = require( '../controllers/modulecontroller' );
const AuthController = require( '../controllers/authcontroller' );
const express = require( 'express' ),
    router = express.Router();
router.get( '/',  AuthController.verifyCourseEngineToken,  
ModuleController.getAll);
router.get( '/:id', AuthController.verifyCourseEngineToken, 
ModuleController.get );
router.post('/updatemodule', AuthController.verifyCourseEngineToken, ModuleController.updateModule);
router.put('/updatebookmark', AuthController.verifyCourseEngineToken, ModuleController.updateBookmark);
router.put('/updatemodulecompletion', AuthController.verifyCourseEngineToken, ModuleController.updateUserModuleCompletion); 

module.exports = router;