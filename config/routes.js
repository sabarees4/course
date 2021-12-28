'use strict';
const express = require( 'express' );
const path = require( 'path' );
const { HttpError } = require( '../system/helpers/HttpError' );
const apiRoutes = require( '../system/routes' );
const cors = require( 'cors' );
module.exports.setRoutes = ( app ) => {
    // app.use(cors({
    //     credentials: true,
    //     origin: function (origin, callback) {
    //         console.log( process.env.ACCEPTED_DOMAINURL)
    //         let origins = process.env.ACCEPTED_DOMAINURL;
    //         console.log(origins)
    //         return callback(null, true);
    //     }
    // }));
    // app.use(function (req, res, next) {
    //      res.header("Access-Control-Allow-Origin", "*")
    //      res.header("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS")
    //      res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
    //      return next();
    //  });
    /**
     * Application Root Route.
     * Set the Welcome message or send a static html or use a view engine.
     */
    app.get( '/', ( req, res ) => {
        res.send( 'Welcome to the APP' );
    } );

    /**
     * API Route.
     * All the API will start with "/api/[MODULE_ROUTE]"
     */
    app.use( '/', apiRoutes );

    /**
     * Serving Static files from uploads directory.
     * Currently Media module is uploading files into this directory.
     */
    app.use( '/uploads', express.static( path.join( __dirname, '../uploads' ) ) );

    /**
     * If No route matches. Send user a 404 page
     */
    app.use( '/*', ( req, res ) => {
        const error = new Error( 'Requested path does not exist.' );

        error.statusCode = 404;
        res.status( error.statusCode ).json( new HttpError( error ) );
    } );
  
};