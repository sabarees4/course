const mongoose = require( 'mongoose' );
const { Schema } = require( 'mongoose' );

class Units {

    initSchema() {
        const unitSchema = new Schema( {
            'unitId': {
                'type': String,
                'required': false,
            }
        }, { 'timestamps': true } );

        try {

            mongoose.model( 'units', unitSchema );
        } catch ( e ) {

        }

    }

    getInstance() {
        this.initSchema();
        return mongoose.model( 'units' );
    }
}

module.exports = { Units };