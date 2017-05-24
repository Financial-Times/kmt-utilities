const logger = require('./../logger');
const bodyParser = require('body-parser');

module.exports = {
    textOrJson: (req, res, next, throwError = false) => {
        const operation = 'bodyParser.textOrJson';

        let parserFn = undefined;

        // Some browsers send the body as text
        if (req.is('text/*')) {
            logger.info({operation, msg: "Text body found"});

            parserFn = bodyParser.text();

        // Other browsers send the body as json
        } else if (req.is('json')) {
            logger.info({operation, msg: "JSON body found"});

            parserFn = bodyParser.json();
        }

        // if the body is in a supported format
        if (parserFn !== undefined) {
            return parserFn(req, res, next);
        }

        const msg = "Unsupported request body format";

        if (throwError === true) {
            const err = new Error(msg);
            err.status = 400;

            logger.error({operation, msg});

            return next(err);
        }

        logger.info({operation, msg});

        next();
    }
};
