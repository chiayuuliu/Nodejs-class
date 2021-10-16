const express = require('express');
const Cart = require('./../models/Cart');
const {getListData} = require("./address-book");

const router = express.Router();
// 登入才可以查看

router.use((req,res,next)=>{
    // 判斷有沒有通過 jwt 驗證 (寫在 index.js 主程式)
    if(req.myAuth && req.myAuth.id){
        next(); //有通過再往下走
    } else {
        res.json({success: false, error:'沒有 token 或者 token 不合法'});
    }
})

// 讀取購物車清單
router.get('/', async(req,res)=>{    
   res.json({info:'ok'})
})

// 新增項目
router.post('/', async (req, res) => {
    // req.body.product_id
    // req.body.quantity
    res.json( await Cart.add(req.myAuth.id, req.body.product_id,req.body.quantity));
});

// 修改項目
router.put('/:id', async (req, res) => {
    res.json( await Cart.update(req.myAuth.id, req.body.product_id,req.body.quantity));
});

// 刪除項目
router.delete('/:id', async (req, res) => {
    res.json( await Cart.remove(req.myAuth.id, req.body.product_id));
});

// 清空購物車
router.delete('/', async (req, res) => {
    res.json( await Cart.clear(req.myAuth.id));
});

module.exports = router