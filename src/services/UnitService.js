'use strict';
const { Service } = require('../../system/services/Service');

const autoBind = require('auto-bind');
class UnitService extends Service {
    constructor(model) {
        super(model);
        this.model = model;
        autoBind(this);
    }
}
module.exports = { UnitService };