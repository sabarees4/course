const mongoose = require( 'mongoose' );
const { Schema } = require( 'mongoose' );

class Capsule {

    initSchema() {
        const CapsuleSchema = new Schema( {
            'capsuleName': {
                'type': String,
                'default':"",
                'required': true,
            },
            'capsuleImage': {
                'type': String,
                'default':"",
                'required': false,
            },
            'activeStatus': {
                'type': Number,
                'default':0,
                'required': false,
            },
            'storyboardcontents': [
                {
                    'boardType': {
                        'type': String,
                        'required': false,
                    }
                }
            ],
            'delFlag': {
                'type': Number,
                'default':0,
                'required': false,
            },
            'createdBy': Schema.ObjectId,
            'updatedBy': Schema.ObjectId,
        
        }, { 'timestamps': true } );

        try {
            mongoose.model( 'capsules', CapsuleSchema );
        } catch ( e ) {

        }

    }

    getInstance() {
        this.initSchema();
        return mongoose.model( 'capsules' );
    }
}

module.exports = { Capsule };