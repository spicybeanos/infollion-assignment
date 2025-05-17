// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Banking API',
      version: '1.0.0',
      description: 'API documentation for your Express banking app',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'token', // or just token if you're not using JWT
        },
      },
    },
    servers: [
      {
        url: 'http://localhost:3000', // Update if hosted elsewhere
      },
    ],
  },
  apis: ['./routes/*.js'], // Scans your route files for JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
