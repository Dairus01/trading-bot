const Joi = require('joi');
const validateAuthLogin = (requestBody) => {
    const object = Joi.object({
        publicKey: Joi.string().required(),
        signature: Joi.string().required()
    });
    const validatedObject = object.validate(requestBody);
    return validatedObject;
};

module.exports = {
    validateAuthLogin
}