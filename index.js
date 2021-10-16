require('dotenv').config(); 
//  這裡(index.js)本身就是一個伺服器
//引入套件
const express = require('express')
const multer = require('multer')
const fs = require('fs').promises;
const cors = require('cors');
const session = require('express-session')
// 使用express-mysql-session套件的寫法
const jwt = require('jsonwebtoken');
const MysqlStore = require('express-mysql-session')(session);
const moment = require('moment-timezone')
const upload = multer({dest:'tmp_uploads/'})
const uploadImg = require('./modules/upload-images')
const db = require('./modules/connect-mysql')
//sessionStore要寫在db連線後面, { }設定連線的資料, 之前已連線過, 直接空物件, 後面參數寫連線物件(db)
const sessionStore = new MysqlStore({}, db);


// 建立web server 物件, express 是一個func
// 設定app為一個express()的fun
const app = express();

//告知express()要用的樣版引擎
app.set('view engine','ejs');

app.use(session({
    //更改session名稱
    name:'mysessionId',
    //初始化, 沒有初始化就不會儲存
    saveUninitialized:false,
    resave:false,
    //亂key for加密用
    secret:'qweylaksjhfljslhdfui',
    //表示存放的地點
    store:sessionStore,
    //存活時間
    Cookie:{
        maxAge:1200000,
    }
}))

const corsOptions = {
    Credentials:true,
    origin:(origin,cb)=>{
        console.log(`origin:${origin}`);
        //沒有錯誤的話前面給空值, true=允許
        cb(null,true); 
    }
}

app.use(cors(corsOptions))

//express() 本身有urlencoded bodyparser的功能()後面是固定的設定
// 用use=所有的方法都會進來, 直接把middle ware 放進來
// 提升變成top level middle ware 
// 設定成true表示用qs套件解析,false 表示不使用qs的套件, 沒有大量的解析true 跟 false沒有差異
app.use(express.urlencoded({extended: false}))
app.use(express.json())


//express 是一個func, 也有一個static 的方法
app.use(express.static('public'));
app.use('/jquery',express.static('node_modules/jquery/dist'));
app.use('/bootstrap',express.static('node_modules/bootstrap/dist'));

//每個都會經過這個middle ware, 沒有給next()就會停止, next()是一個func
app.use(async(req,res,next)=>{
    // 把字串設定給locals.title
    res.locals.title = 'Doris的網站';
    res.locals.pageName = '';
    res.locals.keyword = ''

    //設定template 的helper functions(每個日期進來都會經過這個mw)
    //dateToDateString 是自訂的輔助功能,傳到template使用
    res.locals.dateToDateString = d =>moment(d).format('YYYY-MM-DD')
    res.locals.dateToDateTimeString = d =>moment(d).format('YYYY-MM-DD HH:mm:ss')

    // res.send('middleware');

    res.locals.session = req.session; //把session 傳入ejs

    // jwt 驗證
    req.myAuth = null; //自定義的屬性
    const auth = req.get('Authorization');
    // 如果有Bearer得自且在最前面(index 0)
    if(auth && auth.indexOf('Bearer ')===0){
        // 如果有就把token拿出來
        const token = auth.slice(7)
        try{
            req.myAuth = await jwt.verify(token,process.env.JWT_SECRET);
            console.log('req.mtAth:', req.myAuth)
        } catch(ex){
            console.log('jwt-ex',ex);
        }
    }
    next(); 
})


// 路由定義開始,來拜訪時 get(http方法的get), 路徑是"/" (根目錄=首頁)
app.get('/',(req,res)=>{
    //可以在每個頁面都設定title
    res.locals.title = '首頁 - ' + res.locals.title;
    //('ejs檔名',{要傳到樣版變數的直})
    res.render('home',{name:'Doris'});

    //res.send('<h2>Hello Doris</h2>');
});

// 新增路由 載入JSON
app.get('/json-sales',(req,res)=>{
    res.locals.pageName = 'sales';

    //載入data 裡面的sales資料 會自動轉陣列或物件到變數
    const sales = require('./data/sales');
    // console.log(sales);

    // 把./data/sales檔案裡的資料轉成json檔,sales是陣列,要包成物件
    // res.json(sales);
    res.render('json-sales',{sales})//後面必須是{物件}
});

//在url上輸入變數,express會自動解析,放入req.query裡面
app.get('/try-qs', (req, res)=>{
    //JSON會被處理放在req的query物件裡
    res.json(req.query);
});



//('路徑',middleware,callback func), middle ware處理完的資料會放在req.body裡面
// 會用content type 去判斷要用哪個middle ware 
// middle ware 往上提升, 這裡就可以不用寫
app.post('/try-post', (req, res)=>{
    res.json(req.body);
});
// ----------------------------------

app.get('/try-post-form', (req, res)=>{
    res.render('try-post-form');
});

app.post('/try-post-form', (req, res)=>{
    //res.json(req.body); //將req裡面的內容轉換成json格式
    res.render('try-post-form', req.body); //將拿到的資料丟給try-post-form
});


app.get('/pending', (req, res)=>{
});

// -----------try-upload---------
// 只上傳一個檔案, 欄位名稱:avatar
app.post('/try-upload',upload.single('avatar'), async(req,res)=>{
    // mimetype檔案類型, path,檔案暫時位置
    if(req.file && req.file.mimetype==='image/jpeg'){
        try{
            // 搬動檔案
            await fs.rename(req.file.path,__dirname + '/public/img/'+ req.file.originalname);
            return res.json({success: true, filename: req.file.originalname})
        }catch(ex){ //ex=錯誤訊息
            return res.json({success: false,error:"無法存檔"})
        }    
    }else{
        await fs.unlink(req.file.path); //如果檔案格式錯誤,把暫存檔案刪掉
        res.json({success: false, error: '格式不對'});
    }
})
// 單個檔案上傳 upload2------
app.post('/try-upload2', uploadImg.single('avatar'), async (req, res)=>{
    res.json(req.file);
});

// 多個檔案上傳 upload3------
app.post('/try-upload3', uploadImg.array('photo', 10), async (req, res)=>{
    res.json(req.files);
});

//在url上打/doris/28兩個參數, 會直接show出來,:後面表示代稱名, ?為選擇性
// 可以用正規表示法來限定參數 寫在()裡面,拿到的還是字串,如果給錯會404
app.get('/my-params1/:name?/:age(\\d+)?', (req, res)=>{
    res.json(req.params);
});

//手機正規表示法
app.get(/^\/m\/09\d{2}\-?\d{3}\-?\d{3}$/i, (req, res)=>{
    let u =req.url.split('?')[0]
    u = u.slice(3); //把第三位以前都拿掉
    u = u.split('-').join(''); // 用-切割再接再一起

    res.json({
        url:req.url,
        mobile:u
    });
});

app.use(require('./routes/admin2'));
// -----引用(註冊+登入登出)路由-----
app.use('/', require('./routes/login'));
app.use('/admin3',require('./routes/admin3'));

//把路由掛進來
app.use('/address-book',require('./routes/address-book'));

// restful api 作法. /product是baseURL
app.use('/product', require('./routes/product'));

// 購物車路由
app.use('/cart', require('./routes/cart'));




//設定session = 0, 重整一次自動加一
app.get('/try-sess', (req, res)=>{
    //myVar可以自己設定, 不可以叫cookie
    req.session.myVar = req.session.myVar || 0;
    req.session.myVar++;
    res.json(req.session);
    
});

app.get('/try-moment', (req, res)=>{
    //決定格式字串(可以參考moment timezone文件)
    const fm = 'YYYY-MM-DD HH:mm:ss';

    res.json({
        Taiwan: moment().format(fm),
        Berlin: moment().tz('Europe/Berlin').format(fm),
        tokyo: moment().tz('Asia/tokyo').format(fm),
    });
});

//抓資料庫資料
app.get('/try-db',async(req,res)=>{
    const [r] = await db.query("SELECT * FROM address_book WHERE `name` LIKE ?", ['%新%']);
    res.json(r);
})

// 連動react 上傳圖片
app.post('/test_avatar', uploadImg.none() ,async(req,res)=>{
    const sql = "INSERT INTO `test_avatar`( `avatar`, `name`) VALUES (?,?)";
    const [r] = await db.query(sql, [req.body.avatar, req.body.name])
    res.json(r)
})

// 在nodejs server啟動, 單純看資料庫撈出來的資料
app.get('/test_avatar/:id', async(req,res)=>{    
    const sql = "SELECT * FROM `test_avatar`WHERE sid=?";
    const [r] = await db.query(sql, [req.params.id])
    res.json(r[0]? r[0] : {})
})

app.put('/test_avatar/:id', uploadImg.none() ,async(req,res)=>{
    const sql = "UPDATE `test_avatar` SET ? WHERE sid=?";
    const [r] = await db.query(sql, [req.body, req.params.id])
    res.json(r) //這裡設定回應給前端
})


//定義路由結束(一定要放在最後面)
app.use((req,res)=>{
    res.status(404).send(`<h2>找不到頁面</h2>`);
})


//有設定就給設定值,沒有就3000, env檔裡面有設定port 3001 所以會啟動3001
let port = process.env.PORT || 3000;

//server 正常啟動的話裡面的func會被呼叫, listen 後就會把伺服器架起來
app.listen(port, ()=>{
    const fm = 'YYYY-MM-DD HH:mm:ss';
    // console.log(`NODE_ENV: ${process.env}`);
    // console.log(`啟動: ${port}`, new Date());
    console.log(`啟動: ${port}`, moment().format(fm));

});