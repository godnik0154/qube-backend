const mime = require("mime");
const fs = require("fs");
const { getDb } = require('../util/database');
const { ObjectId } = require("mongodb");

exports.addData = async (req,res) => {

    const db = getDb();
    const objectId = ObjectId();

    try{
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

		fs.writeFile(`uploads/${data.profile.name}`, base64Data, 'utf8', async (err) => {
			if(err)
				throw new Error(err.message);
		});

		if(coverData)
		{
			output = coverData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
			extension = mime.extension(output[1]);

			base64Data = Buffer.from(output[2], 'base64');

			fs.writeFile(`uploads/${data.cover.name}`, base64Data, 'utf8', async (err) => {
				if(err)
					throw new Error(err.message);
				delete data.cover.image;
			});
		}

        for(let i=0;i<data.socialData.length;i++){
            data.socialData[i] = data.socialData[i].url;
        }

        await db
        .collection("users")
        .findOneAndUpdate(
            {email: req.body.email},
            {$set: data},
            {returnNewDocument: true}
        );        

        return res.status(200).json({
            data
        })
    }
    catch(err){
        return res.status(500).json({
            error: err.message
        })
    }
}