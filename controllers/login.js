const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDb } = require('../util/database');

exports.getUser = async (req, res) => {
    let {email, password} = req.body;
    const db = getDb();

    try{
        const user = await db
        .collection("users")
        .findOne({email});

        if(user === null || user === undefined) {
            return res.status(200).json({
                data: "User does not exist"
            })
        }

        let promise = new Promise((resolve,reject) => {
            bcrypt.compare(password, user.password, function(err, compared) {
                if(compared === false)
                    resolve("error");
                else
                    resolve("success")
            });
        });

        let isSecretValid = await promise;

        if(isSecretValid === "error")
        {
            return res.status(200).json({
                data: "Unauthorized Access"
            })
        }

        let jwtSecretKey = process.env.jwtSecretKey;
  
        const token = jwt.sign(user, jwtSecretKey,{ expiresIn: '24h' });

        user.token = token;

        return res.status(200).json({
            data: user
        })
    }
    catch(err)
    {
        return res.status(500).json({
            err: err.message
        })
    }

};
