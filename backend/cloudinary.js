var cloudinary = require('cloudinary');
/*
 Environment variable:CLOUDINARY_URL=cloudinary://982416951991523:09qq4a3wV-cu82YI0_sRBQy_70c@likeada
 Base delivery URL:	http://res.cloudinary.com/likeada
 Secure delivery URL:	https://res.cloudinary.com/likeada
 API Base URL:	https://api.cloudinary.com/v1_1/likeada
 http://res.cloudinary.com/likeada/image/upload/v1422332718/sample.jpg
*/
function cloudinaryService(config){
    cloudinary.config({
        cloud_name: config.CLOUDINARY_NAME,
        api_key: config.CLOUDINARY_API_KEY,
        api_secret: config.CLOUDINARY_API_SECRET
    });

    var uploadImage = function(img, callback){
        cloudinary.uploader.upload(img, function(result) {
            callback(result);
        });
    };

    var getImage = function(imgName, options){
        return cloudinary.image(imgName, options);
    };

    return {
        uploadImage : uploadImage,
        getImage : getImage
    };
}


module.exports = cloudinaryService;
