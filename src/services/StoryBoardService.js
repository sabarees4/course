'use strict';
const { Service } = require( '../../system/services/Service' );

const autoBind = require( 'auto-bind' );
class StoryBoardService extends Service {
    constructor( model ) {
        super( model );
        this.model = model;
        autoBind( this );
    }
}

module.exports = { StoryBoardService };