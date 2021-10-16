// 路由定義

const express = require('express');
const Product = require('./../models/Product');
//連到資料庫模組
// const db = require('./../modules/connect-mysql')
const upload = require('./../modules/upload-images');
const router = express.Router();

// 有設定baseURL是/product, 所以/ =對應到/product
// 列表
router.get('/', async(req,res)=>{    
    res.json(await Product.findAll(req.query));
})

// 讀取單筆
router.get('/:id', async (req, res) => {
    // req.params.id
    // 設定回應的格式
    const output = {
        success: false,
        date:null,
    }
    output.date = await Product.findOne(req.params.id)
    if(output.date){
        output.success = true;
    }
    res.json(output)
})

// 測試用
router.get('/test01/2', async(req, res)=>{
    const p1 = await Product.findOne(2);
    p1.data.price *= 2;
    // 去執行物件的save方法,並把結果丟出來
    res.json(await p1.save());
})

//TODO: 管理的功能要登入後才能操作
// 新增
router.post('/', async(req,res)=>{
    // 表單格式會被解析放到req.body
    const p1 = new Product(req.body)
    res.json(await p1.save())
})

// 修改
router.put('/:id', async(req,res)=>{
    const output = {
        success: false,
        result: null,
    };
    // p1是資料庫撈出來的資料?
    const p1 = await Product.findOne(req.params.id);
    if(p1){
        output.success = true
        // req.body是修改後的資料,帶入到edit()
        output.result = await p1.edit(req.body);
    }
    res.json(output)
})

// 刪除
router.delete('/:id', async(req,res)=>{
    const p1 = await Product.findOne(req.params.id);
    if(p1){
        return res.json(await p1.remove())
    }
    res.json({info:'item not found'})
})


module.exports = router