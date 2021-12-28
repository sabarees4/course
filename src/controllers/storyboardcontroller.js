const { Controller } = require( '../../system/controllers/Controller' );
const { StoryBoardService } = require( '../services/StoryBoardService' );
// const { PostService } = require( './../services/PostService' );
const { Storyboardcontents } = require( '../models/storyboardcontents' );
const autoBind = require( 'auto-bind' );

storyBoardService = new StoryBoardService(
    new Storyboardcontents().getInstance()
);


class StoryBoardController extends Controller {

    constructor( service ) {
        super( service );
        autoBind( this );
    }
    async getAll( req, res, next ) {
        var pipline = [{
            '$match': { unitId: req.query.unitId, moduleId: req.query.moduleId }
        },
        ]
        try {
            const response = await this.service.getAllAggregrate( pipline );

            return res.status( response.statusCode ).json( response );
        } catch ( e ) {
            next( e );
        }
    }


}
module.exports = new StoryBoardController( storyBoardService );