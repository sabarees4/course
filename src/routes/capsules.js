'use strict';
const CapsuleController = require( '../controllers/capsulecontroller' );
const express = require( 'express' ),
    router = express.Router();
router.get( '/',  CapsuleController.getAll );//http://localhost:5001/capsules
router.get( '/:id',  CapsuleController.get );//http://localhost:5001/capsules/:id
router.delete( '/:id', CapsuleController.delete );
router.get( '/:id/storyboardcontents',  CapsuleController.getFieldBasedOnRestApiFiled );

// router.post( '/', [ AuthController.checkLogin, MediaController.upload.single( 'file' ) ], MediaController.insert );
// router.delete( '/:id', AuthController.checkLogin, MediaController.delete );


module.exports = router;