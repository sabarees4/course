'use strict';
const StoryBoardController = require( '../controllers/storyboardcontroller' );
const express = require( 'express' ),
    router = express.Router();
router.get( '/',StoryBoardController.getAll);
router.get( '/:id',  StoryBoardController.get );

module.exports = router;