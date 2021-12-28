'use strict';
const S3controller = require( '../controllers/s3controller' );
const AuthController = require( '../controllers/authcontroller' );
const express = require( 'express' ),
    router = express.Router();
router.get( '/:type', AuthController.verifyCourseEngineToken, S3controller.getvideo);
module.exports = router;