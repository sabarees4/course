const { Controller } = require( '../../system/controllers/Controller' );
const { CapsuleService } = require( './../services/CapsuleService' );
const { Capsule } = require( '../models/capsule' );
const autoBind = require( 'auto-bind' ),
capsuleService = new CapsuleService(
        new Capsule().getInstance()
    );

class CapsuleController extends Controller {

    constructor( service ) {
        super( service );
        autoBind( this );
    }

}

module.exports = new CapsuleController( capsuleService );