const express = require('express')

//呼叫router 的方法, 可以設定路由
const router = express.Router();

//會沒有baseUrl
router.get('/admin2/:p1?/:p2?',(req,res)=>{
    res.json({
        params:req.params,
        url: req.url,
        baseUrl: req.baseUrl, //會沒有baseUrl
        originalUrl: req.originalUrl,
    })
});

module.exports = router;

