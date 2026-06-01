const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dzaz9wvbg',
  api_key: '568967432128422',
  api_secret: '1VhqVB56B2x4r-vVJT5iCKWjDqs'
});

console.log("Config:", cloudinary.config());

cloudinary.api.ping()
  .then(res => console.log("Success:", res))
  .catch(err => console.error("Error:", err));
