const { Controller } = require( '../../system/controllers/Controller' );
const { S3Service } = require( '../services/S3Service' );
const { S3aws } = require( '../models/s3aws.js' );
const autoBind = require( 'auto-bind' );

s3Service = new S3Service(
    // new S3aws().getInstance()
);
class S3Controller extends Controller {
    constructor( service ) {
        super( service );
        autoBind( this );
    }
    
    async getvideo(req, res, next) {
        console.log(req.query)
        try {
            console.log("1")
            const response = await this.service.getS3Video(req.query,req.params);

            return res.status(response.statusCode).json(response);
        } catch (e) {
            next(e);
        }
    }
}
module.exports = new S3Controller( s3Service );