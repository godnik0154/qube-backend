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