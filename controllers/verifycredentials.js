const { getDb } = require("../util/database");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');

const region = process.env.AWS_BUCKET_REGION;

const sns = new AWS.SNS({
  region,
})

exports.sendOtpViaMail = async (req, res) => {
  const { email,type } = req.body;
  const db = getDb();
  let now = new Date();
  const otp = Math.floor(100000 + Math.random() * 900000); //crypto.randomInt(000001,999999);

  try{

    let tryOnce = true;


    if(type===false){
      let isPresent = await db
        .collection('users')
        .findOne({
          email: email
        });

      if(isPresent){
        tryOnce = false;
        res.status(200).send({data:"Email is Already taken"});
      }
    } 
    if(tryOnce) {
        await db
        .collection('otp')
        .deleteOne({
          email
        });

      await db
        .collection('otp')
        .insertOne({
          type: 'email',
          email,
          otp,
          startTime: now,
          expireTime: new Date(now.getTime() + 4*60000)
        });

      const transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        secureConnection: false,
        port: 587,
        auth: {
          user: "qubetransactions@outlook.com",
          pass: "qubeso1234"
        },
        tls: {
          ciphers:'SSLv3'
        }
      });

      var message = {
        from: "qubetransactions@outlook.com",
        to: email,
        subject: "Confirm Email",
        text: "Please confirm your email",
        html: `<div style="font-family: Helvetica,Arial,sans-serif;">
        <div style="margin:50px 20px;">
          <div style="border-bottom:1px solid #eee">
            <a href="https://app.qube.so" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Qube</a>
          </div>
          <p style="font-size:1.1em">Hi,</p>
          <p>Thank you for your request to verify your email. Use the following OTP to complete your verification. OTP is valid for 3 minutes</p>
          <h2 style="background: #00466a;margin: 0 auto;width: 80px;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
          <p style="font-size:0.9em;">Regards,<br />Qube</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
            <p>Qube</p>
          </div>
        </div>
      </div>`,
      };

      let promise = new Promise((resolve,reject)=>{
        transporter.sendMail(message, (error, info) => {
          if (error) {
            reject(error.message)
          }

          resolve(info);
        });
      });

      await promise;

      res.status(200).send({data:"Email Sent"});
    }

  } catch(E){
    res.status(200).send({data:"Server Error"});
  }
};

exports.sentOtpViaSMS = async (req, res) => {
  const {phoneNumber}  = req.body;
  const db = getDb();
  let now = new Date();
  const otp = crypto.randomInt(000001,999999);

  try{
    var params = {
      Message: `Verify through OTP ${otp}`,
      PhoneNumber: '+' + phoneNumber,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          'DataType': 'String',
          'StringValue': `Qube`
        }
      }
    };

    var publishTextPromise = sns.publish(params).promise();

    let results = await publishTextPromise;


    return res.status(200).send({data:'Otp Send'});
  }
  catch(E){
    console.log(E.message);
    return res.status(200).send({data:'Server Error'});
  }
}

exports.verifyOtpViaMail = async (req, res) => {
  const { email,sampleotp,newemail } = req.body;
  const db = getDb();
  let now = new Date();

  try{

    const otp = await db.collection('otp').findOne({
      email:newemail
    });

    console.log(otp,newemail,email,sampleotp);

    if(parseInt(otp.otp)!==sampleotp){
      res.status(200).json({data:'Invalid'});
    } else if(now>otp.expireTime){
      res.status(200).json({data:'Invalid'});
    } else {
      await db
      .collection("users")
      .findOneAndUpdate(
        { email },
        { $set: {
          emailValid: true,
          email: newemail
        } },
        { returnNewDocument: true }
      );
      res.status(200).json({data:'Valid'});
    }
  } catch(err){
    res.status(200).json({data:'Invalid'});
  }
}

exports.verifyPassword = async(req,res) => {
  let {email, password} = req.body;
  const db = getDb();

  try{
      const user = await db
      .collection("users")
      .findOne({email});

      if(user === null || user === undefined) {
          return res.status(200).json({
            data: false
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
            data: false
          })
      }

      return res.status(200).json({
        data: true
      })
  }
  catch(err)
  {
      return res.status(500).json({
        err: err.message
      })
  }
}