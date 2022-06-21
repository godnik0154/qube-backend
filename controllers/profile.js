const S3 = require('aws-sdk/clients/s3')
const { getDb } = require('../util/database');
const bcrypt = require('bcrypt');

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey
})

let getFileStream = (fileKey) => {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName
  }

  return s3.getObject(downloadParams).createReadStream()
}

exports.getImage = async (req, res) => {
  try {
    let name = req.params.name;

    let content = getFileStream(name);

    content.pipe(res);
  }
  catch (err) {
    return res.status(500).json({
      error: err.message
    })
  }
}

exports.getProfile = async (req, res) => {
  try{
    let name = req.params.name;

    let names = name.replace(/_/g, ' ');


    console.log(names);

    const db = getDb();

    let results = await db
    .collection("users")
    .findOne({brand: names})

    return res.status(200).json({
      data: results
    })
  }catch(err){
    return res.status(500).json({
      err: error.message
    })
  }
}

exports.changePassword = async (req,res) => {

  const db = getDb();

  try {
    let { email, password } = req.body;

    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(200).json({
        data: false
      });
    }

    const saltRounds = await bcrypt.genSalt(10);

    const pass = await bcrypt.hash(password, saltRounds);


    await db
      .collection('users')
      .findOneAndUpdate(
      { email },
      { $set: {
        password: pass
      } },
      { returnNewDocument: true }
    );

    return res.status(200).json({
      data: true
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

exports.changeGenral = async (req,res) => {
  const db = getDb();

  try {
    let { email, field,value } = req.body;

    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(200).json({
        data: false
      });
    }

    await db
      .collection('users')
      .findOneAndUpdate(
      { email },
      { $set: {
        [field]: value
      } },
      { returnNewDocument: true }
    );

    return res.status(200).json({
      data: true
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}