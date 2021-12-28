'use strict';
const express = require( 'express' ),
    router = express.Router();
const AuthController = require( '../controllers/authcontroller' );

router.post( '/login', AuthController.verifyDomainToken, 
AuthController.Login );
router.put( '/logout', AuthController.verifyCourseEngineToken, AuthController.logOut );
module.exports = router;