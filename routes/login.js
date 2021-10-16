const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 引入資料庫
const db = require('./../modules/connect-mysql')
const upload = require('./../modules/upload-images')
// 要address-book裡面的getListData
const { getListData } = require('./address-book');

const router = express.Router(); 

// ------登入-------
// url=/login時 render表單
router.get('/login',(req,res)=>{
    res.locals.pageName = 'login';
    res.render('login')
});

// 表單資料送出來要怎麼處理
router.post('/login', async (req, res)=>{

    // TODO: 欄位檢查
    // rs表示資料庫撈出來的資料
    const [rs] = await db.query("SELECT * FROM members WHERE `email`=?", [req.body.email]);

    // 沒有資料的話
    if(!rs.length){
        // 帳號錯誤
        return res.json({success: false});
    }
    // 比對密碼跟資料庫內的是否一致,是的話回傳true
    const success = await bcrypt.compare(req.body.password, rs[0].password);
    if(success){
        const {id, email, nickname} = rs[0];
        // 把會員資料放到session 
        req.session.member = {id, email, nickname};
    }

    res.json({success});
});


// 註冊, 當路徑到/register, 畫面呈現register的頁面
router.get('/register',(req,res)=>{
    res.locals.pageName = 'register'
    res.render('register')
});

// 收到表單的資料
router.post('/register',async(req,res)=>{
    const output = {
        success:false,
        postData: req.body,
        error:''
    }
    // 欄位檢查

    // 把傳進來的密碼做加密
    const hash = await bcrypt.hash(req.body.password,10)

    const sql = "INSERT INTO `members`"+
    "(`email`, `password`, `mobile`, `birthday`, `nickname`, `create_at`)"+
    "VALUES (?,?,?,?,?,NOW())"

    // 如果在外面也要用到, 就要外面先宣告
    let result;

    // req.body 裡面有表單裡面所有欄位的資料
    try{
        [result] = await db.query(sql,[
            req.body.email.toLowerCase().trim(),
            hash,
            req.body.mobile,
            req.body.birthday,
            req.body.nickname,
        ]);

        if(result.affectedRows===1){
            // 成功的話
            output.success = true;
        }else{
            // 錯誤的話
            output.error = '無法新增';
        }
    }catch(ex){
        console.log(ex);
        output.error = 'Email 已被使用過';
    }

    res.json(output);

});

// 檢查email是否已有被使用
router.get('/account-check', async (req, res)=>{
    // 拿到的值在?後面, SELECT 1 只是用來判斷有沒有資料
    const sql = "SELECT 1 FROM members WHERE `email`=?";
    const [rs] = await db.query(sql, [req.query.email ]);//後面的值表示放在sql ?裡的值
    res.json({used: !!rs.length }); //轉換成布林值,回傳used= true or false 
});

// 登出, 直接把session刪掉裡面的member 的屬性
router.get('/logout',(req,res)=>{
    delete req.session.member
    res.redirect('/');
});

// 沒有表單用postman測試,跟jwt-login.html搭配
router.post('/login-jwt', async (req, res)=>{
    const output = {
        success: false,
        token: null,
    };
    // TODO: 欄位檢查

    const [rs] = await db.query("SELECT * FROM members WHERE `email`=?", [req.body.email]);

    if(!rs.length){
        // 帳號錯誤
        return res.json(output);
    }

    const success = await bcrypt.compare(req.body.password, rs[0].password);
    if(success){
        const {id, email, nickname} = rs[0];
        // req.session.member = {id, email, nickname};

        output.success = true;
        output.member = {id, email, nickname};
        // 加密的內容{id, email, nickname}, 後面的key 可以隨便打
        output.token = await jwt.sign({id, email, nickname}, process.env.JWT_SECRET);
    }
    // "success": true,
    // 用戶端會把token存起來,每一次發request就會丟過來
    // "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZW1haWwiOiJjaGlheXV1LmxpdUBnbWFpbC5jb20iLCJuaWNrbmFtZSI6IkRvcmlzIiwiaWF0IjoxNjMxNzEwMDMxfQ.Mug99G_e4bKLJHhdn-wxJ2Ug-gp6X7mSxzxlrGE6lMw",

    res.json(output);
});


router.get('/get-data-jwt', async (req, res)=>{
    const output = {
        success:false,
        data:null
    }

    // 判斷jwt在主程式的middle ware是否有通過
    if(req.myAuth && req.myAuth.id){
        output.member = req.myAuth;
        output.success = true;
        output.data = await getListData(req, res);

    }else{
        output.error = '沒有token'
    }
    res.json(output)
});

module.exports = router;

