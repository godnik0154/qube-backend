const mime = require("mime");
const fs = require("fs");
const { getDb } = require('../util/database');
const { ObjectId } = require("mongodb");
const S3 = require('aws-sdk/clients/s3')

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey
})

let uploadFile = async (path, fileName) => {
  const fileStream = fs.createReadStream(path)

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: fileName
  }

  let dat = await s3.upload(uploadParams).promise();
  return dat;
}

exports.addData = async (req, res) => {

  const db = getDb();
  const objectId = ObjectId();

  try {
    let data = req.body;

    let profileData = data.profile.image;
    delete data.profile.image;
    let coverData = data.cover.image;
    delete data.cover.image;

    data.updatedAt = objectId.getTimestamp();
    data.isCompleted = true;

    let output = profileData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    let extension = mime.extension(output[1]);

    let base64Data = Buffer.from(output[2], 'base64');

    let promise = new Promise((resolve,reject)=>{
      fs.writeFile(`uploads/${data.profile.name}`, base64Data, 'utf8', async (err) => {
        if (err)
          throw new Error(err.message);
  
        await uploadFile(`uploads/${data.profile.name}`, data.profile.name);
        resolve("done");
      });
    })

    await promise;

    if (coverData) {
      output = coverData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      extension = mime.extension(output[1]);

      base64Data = Buffer.from(output[2], 'base64');

      promise = new Promise((resolve,reject)=>{
        fs.writeFile(`uploads/${data.cover.name}`, base64Data, 'utf8', async (err) => {
          if (err)
            throw new Error(err.message);
          delete data.cover.image;
          await uploadFile(`uploads/${data.cover.name}`,data.cover.name);
          fs.unlinkSync(`uploads/${data.cover.name}`);
          resolve('promise');
        });
      })

      await promise;
    }

    for (let i = 0; i < data.socialData.length; i++) {
      data.socialData[i] = data.socialData[i].url;
    }

    await db
      .collection("users")
      .findOneAndUpdate(
        { email: req.body.email },
        { $set: data },
        { returnNewDocument: true }
      );

    fs.unlinkSync(`uploads/${data.profile.name}`);

    return res.status(200).json({
      data
    })
  }
  catch (err) {
    console.log(err.message)
    return res.status(500).json({
      error: err.message
    })
  }
}


exports.getAllBrands = async (req, res) => {
  try{
    const db = getDb();

    const data = await db
      .collection("users")
      .find({
        brand: {
          $exists: true
        }
      })
      .project({
        brand: 1,
        _id: 0
      })
      .toArray()

    const items = [];

      for(let i in data){
        items.push(data[i].brand);
      }

    return res.status(200).json({
      data: items
    })
  }
  catch(err){
    return res.status(500).json({
      error: err.message
    })
  }
}