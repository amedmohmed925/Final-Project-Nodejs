const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Answers API",
            version: "1.0.0",
            description: "API documentation for answers routes",
        },
        servers: [
            {
                url: "http://localhost:8080/api",
                description: "Development Server",
            },
        ],
    },
    apis: ["../routes/answersRoutes.js"],
};

const swaggerSpec = swaggerJsDoc(options);

const swaggerAnswersDocs = (app) => {
    app.use("/answers-api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = swaggerAnswersDocs;