const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dzvbrpve3',
  api_key: '778858155729541',
  api_secret: 'ydjKIF9maleuDfh78LKgS3K3bkzg',
});

async function test() {
  console.log("Testing simple Cloudinary upload...");
  try {
    const res = await cloudinary.uploader.upload("https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png");
    console.log("Upload Success! URL:", res.secure_url);
  } catch (e) {
    console.error("Upload Failed:", e);
  }
}

test();
