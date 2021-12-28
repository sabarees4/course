const mongoose = require( 'mongoose' );
const { Schema } = require( 'mongoose' );

class S3 {

    initSchema() {
        const s3Schema = new Schema( {
            'unitId': {
                'type': String,
                'required': false,
            }
        }, { 'timestamps': true } );

        try {

            mongoose.model( 's3', s3Schema );
        } catch ( e ) {

        }

    }

    getInstance() {
        this.initSchema();
        return mongoose.model( 's3' );
    }
}

module.exports = { S3 };