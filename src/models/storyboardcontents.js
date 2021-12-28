const mongoose = require('mongoose');
const { Schema } = require('mongoose');

class Storyboardcontents {

    initSchema() {
        const storyboardcontentSchema = new Schema({
            'unitId': {
                'type': String,
                'default': "",
                'required': true,
            },
            'moduleId': {
                'type': String,
                'default': "",
                'required': true,
            },
            'Storyboard_type': {
                'type': String,
                'required': false,
            }
        }, { 'timestamps': true });

        try {

            mongoose.model('storyboardcontents', storyboardcontentSchema);
        } catch (e) {

        }

    }

    getInstance() {
        this.initSchema();
        return mongoose.model('storyboardcontents');
    }
}

module.exports = { Storyboardcontents };