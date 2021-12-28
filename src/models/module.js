const mongoose = require( 'mongoose' );
const { Schema } = require( 'mongoose' );

class Module {

    initSchema() {
        const ModuleSchema = new Schema( {
            'moduleName': {
                'type': String,
                'default':"",
                'required': true,
            },
            'moduleId': {
                'type': String,
                'default':"",
                'required': true,
            },
            'moduleImage': {
                'type': String,
                'default':"",
                'required': false,
            },
            'activeStatus': {
                'type': Number,
                'default':0,
                'required': false,
            },
            'delFlag': {
                'type': Number,
                'default':0,
                'required': false,
            },
            'createdBy': Schema.ObjectId,
            'updatedBy': Schema.ObjectId,
        
        }, { 'timestamps': true } );

        try {
            mongoose.model( 'modules', ModuleSchema );
        } catch ( e ) {

        }

    }

    getInstance() {
        this.initSchema();
        return mongoose.model( 'modules' );
    }
}

module.exports = { Module };