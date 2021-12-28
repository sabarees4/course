const mongoose = require( 'mongoose' );
const { Schema } = require( 'mongoose' );

class Users_report_master {

    initSchema() {
        const users_report_masterSchema = new Schema( {
            'unitId': {
                'type': String,
                'required': false,
            }
        }, { 'timestamps': true } );

        try {

            mongoose.model( 'users_report_master', users_report_masterSchema );
        } catch ( e ) {

        }

    }

    getInstance() {
        this.initSchema();
        return mongoose.model( 'users_report_master' );
    }
}

module.exports = { Users_report_master };