const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const cookie = require('cookie-parser');
const helmet = require( 'helmet' ),
    server = express();
const { setRoutes } = require( './routes' );
// For security

server.use(cookie());
server.use( helmet() );

const cors = require( 'cors' ),
    // Allow Origins according to your need.
    corsOptions = {
        credentials: true,
      origin: "http://localhost:3001",
        'Access-Control-Allow-Origin': '*'
        
    };

server.use( cors( corsOptions ) );

server.use( bodyParser.json() );

// Setting up Routes
setRoutes( server );

module.exports = { server };