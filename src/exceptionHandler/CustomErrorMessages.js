/**
 * Utility class used to set all the custom error messages
 * that will be send if an exception is thrown
 * EX to get an error message:
 *  - CustomErrorMessages.ID_NOTFOUND;
 */
module.exports = class CustomErrorMessages {

    // Common
    static ID_NOTFOUND = 'ERROR.COMMON.ID_NOTFOUND';
    static UNIQUE_ID = 'ERROR.COMMON.UNIQUE_ID';
    static DELETE_HAS_DEPENDENCIES = 'ERROR.COMMON.DELETE_HAS_DEPENDENCIES';
    static UPDATE_HAS_DEPENDENCIES = 'ERROR.COMMON.UPDATE_HAS_DEPENDENCIES';
    static UNIQUE_NAME = 'ERROR.COMMON.UNIQUE_NAME';
    static FIELD_MAY_NOT_BE_EMPTY = 'ERROR.COMMON.FIELD_MAY_NOT_BE_EMPTY';
    static INVALID_PARAM = 'ERROR.COMMON.INVALID_PARAM';
    static OPERATION_NOT_ALLOWED = 'ERROR.COMMON.OPERATION_NOT_ALLOWED';
    static INVALID_QUERY_PARAMS = 'ERROR.COMMON.INVALID_QUERY_PARAMS';
    static CONTACT_SUPPORT = 'ERROR.COMMON.CONTACT_SUPPORT';
    static UNDEFINED_ERROR = 'ERROR.COMMON.UNDEFINED';
    static BAD_REQUEST = 'ERROR.COMMON.BAD_REQUEST';
    static MUST_BE_UNIQUE = 'ERROR.COMMON.MUST_BE_UNIQUE';
    
    // Auth
    static BAD_CREDENTIALS = 'ERROR.AUTH.BAD_CREDENTIALS';

    // User
    static EMAIL_ALREADY_USE = 'ERROR.USER.EMAIL_ALREADY_IN_USE';
    static USER_NOT_FOUND = 'ERROR.USER.NOT_FOUND';

    // MONGOOSE
    static MONGOOSE_ERROR = 'ERROR.MONGOOSE';


    CustomErrorMessages() {
        throw new Error('Utility class');
    }
}
