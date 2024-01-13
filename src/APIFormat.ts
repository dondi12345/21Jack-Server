import { check, validationResult } from 'express-validator';

export class APIFormat{
    Validate(req, res) {
        console.log(req.originalUrl)
        let error = validationResult(req);
        let errorList = error.array();
        if (errorList.length) {
            res.send({
                Status: 0,
                Error: {
                    Message: 'Invalid parameter',
                },
            });
            return false;
        }
        return true;
    }

    ResponeCallback(res, error, response){
        if (error) {
            res.send({
                Status: 0,
                Error: {
                    Message: error
                },
            })
        } else {
            res.send({
                Status: 1,
                Data: response,
            })
        }
    }
}

export const apiFormat = new APIFormat();