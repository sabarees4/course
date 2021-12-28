'use strict';
const UnitController = require( '../controllers/unitcontroller' );
const express = require( 'express' ),
    router = express.Router();
router.get( '/',  UnitController.getAll);
router.get( '/:id', UnitController.get );

module.exports = router;