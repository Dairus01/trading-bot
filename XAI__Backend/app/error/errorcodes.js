const errorCodes = {
    CREATE_WALLET: {
        status: 400,
        message:
            'Bad Request. The server cannot process the request ,please first create wallet address .',
    },

    TOKEN_ERROR: {
        status: 404,
        message:
            'Token Details not found.',
    },

    INSUFFICIENT_FUND: {
        status: 402,
        message:
            'Bad Request. User have insufficient sol.',
    },
    INSUFFICIENT_TOKEN: {
        status: 402,
        message:
            'Bad Request. User have insufficient token.',
    },
    BAD_REQUEST: {
        status: 400,
        message:
            'Bad Request. The server cannot process the request due to a client error.',
    },
    UNAUTHORIZED: {
        status: 401,
        message: [
            'Unauthorized. You must authenticate before accessing this resource.',
            'Invalid User',
        ],
    },
    FORBIDDEN: {
        status: 403,
        message: "Forbidden. You don't have permission to access this resource.",
    },
    NOT_FOUND: {
        status: 404,
        message: 'Please provide a valid wallet address. The wallet address does not exist.',
    },

    INTERNAL_SERVER_ERROR: {
        status: 500,
        message: 'Internal Server Error. Something went wrong on the server.',
    },
    SERVICE_UNAVAILABLE: {
        status: 503,
        message:
            'Service Unavailable. The server is currently unable to handle the request.',
    },
};

module.exports = errorCodes;
