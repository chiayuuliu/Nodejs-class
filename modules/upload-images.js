const multer = require('multer');
const {v4: uuidv4} = require('uuid');

// 副檔名的對應
const extMap = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
};


const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        // null?? 回上一層用..
        // 放public 所有人都可以透過url看到
        // 上傳檔案存放到/../public/img資料夾
        cb(null, __dirname + '/../public/img')
    },
    filename: (req, file, cb)=>{
        // 檔名直接用uuid,+ 副檔名,如果不是這幾個副檔名就會拿到undefined
        cb(null, uuidv4() + extMap[file.mimetype] );
    },
});

const fileFilter = (req, file, cb)=>{
    // 直接轉換成布林值
    cb(null, !!extMap[file.mimetype]);
};

module.exports = multer({storage, fileFilter});