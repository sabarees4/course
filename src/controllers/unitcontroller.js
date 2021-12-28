const { Controller } = require( '../../system/controllers/Controller' );
const { UnitService } = require( '../services/UnitService' );
// const { PostService } = require( './../services/PostService' );
const { Units } = require( '../models/unit' );
const autoBind = require( 'auto-bind' );

unitService = new UnitService(
    new Units().getInstance()
);


class StoryBoardController extends Controller {

    constructor( service ) {
        super( service );
        autoBind( this );
    }

}
module.exports = new StoryBoardController( storyBoardService );