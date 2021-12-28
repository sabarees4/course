'use strict';
const { Service } = require('../../system/services/Service');
const { HttpResponse } = require('../../system/helpers/HttpResponse');
const aws = require('aws-sdk');
var fs = require('fs-extra');
class S3Service extends Service {
    constructor(model) {
        super(model);
    }
    async getS3Video(query, params) {
        console.log(process.env.COURSE_VIDEO_PATH + params.type + '/' + query.fileName + '/playlist.m3u8')
        try {
            const signer = new aws.CloudFront.Signer(process.env.COURSE_CLOUDFRONT_ACCESS_KEY_ID, fs.readFileSync(process.env.COURSE_CLOUDFRONT_PRIVKEYPATH));
            var signedUrl = signer.getSignedUrl({ url: process.env.COURSE_VIDEO_PATH + params.type + '/' + query.fileName + '/playlist.m3u8', expires: 9000000000000 })
            return new HttpResponse(signedUrl);
        } catch (errors) {
            throw errors;
        }
    }
}
module.exports = { S3Service };