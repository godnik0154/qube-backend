const fs = require('fs');

exports.getImage = async (req,res) => {
    try{
        let name = req.params.name;

        let content = fs.createReadStream(`uploads/${name}`);

        content.on('open',()=>{
            content.pipe(res);
        })

    }
    catch(err){
        return res.status(500).json({
            error: err.message
        })
    }
}