const express = require('express')
//連到資料庫模組
const db = require('./../modules/connect-mysql')
const upload = require('./../modules/upload-images')

const router = express.Router();

async function getListData(req,res){
    const perPage = 5;
    let page = parseInt(req.query.page) || 1;
    let keyword = req.query.keyword || ''; 
    //res.locals.keyword = keyword; //傳給template,顯示在搜尋的input裡面
    keyword = keyword.trim(); //會去掉頭尾的空白
    const output = {

    }
    //設定條件開頭
    let where = " WHERE 1 "
    if(keyword){
        output.keyword = keyword;
        //跟上面的WHERE 1 接在一起
        where += `AND \`name\` LIKE ${ db.escape('%'+keyword+'%') } `;
    }
    //算總筆數
    const t_sql = `SELECT COUNT(1) totalRows FROM address_book ${where}`;

    const [[{totalRows}]] = await db.query(t_sql);
    //  總筆數
    output.totalRows = totalRows;
    //  總頁數
    output.totalPages = Math.ceil(totalRows/perPage);
    // 5筆
    output.perPage = perPage;
    output.page = page;
    output.rows = [];


    //如果有資料才去取得分頁資料
    if(totalRows>0){
        if(page < 1){
            output.redirect='?page=1'
            //跳轉業面
            return output;
        }
        // 大於最大頁數, 跳轉到最後一頁
         if(page > output.totalPages){
            output.redirect='?page=' + output.totalPages;
            return output;

        }
        //要做跳脫
        const sql = `SELECT * FROM \`address_book\` ${where} ORDER BY sid DESC LIMIT ${(page-1)*perPage}, ${perPage}`;
        //   rows會拿到每一筆資料
        const [rows] = await db.query(sql)
        output.rows = rows;
        
    }
    return output;
}

// 將getListData function 掛在 router 物件上做匯出
router.getListData = getListData; 

// address-book的根目錄設定
router.get('/',(req,res)=>{
    //回傳address-book資料夾裡面的main.ejs,呈現到頁面上
    res.render('address-book/main');

});

//列表呈現, 在路徑/list, render address-book資料夾裡面的list.ejs
router.get('/list',async (req,res)=>{
    res.locals.pageName = 'ab-list';

    const output = await getListData(req,res);
    if(output.redirect){
        return res.redirect(output.redirect)
    }

    res.render('address-book/list', output);
    
});

router.get('/api/list',async (req,res)=>{
    // 回傳資料列表的json檔
    const output = await getListData(req,res);    
    res.json(output);
});

// 用delete 發送的路由??
router.delete('/delete/:sid([0-9]+)', async (req, res)=>{
    const sql = "DELETE FROM address_book WHERE sid=?";

    const [r] = await db.query(sql, [req.params.sid]);
    console.log({r});
    res.json(r);
});

// router.route('/add')
//     .get(async(req,res)=>{
//         res.locals.pageName = 'ab-add';
//         res,render('address-book/add');
//     })
//     .post(async(req,res)=>{
//         res.json({})
//     })


router.route('/add')
.get(async (req, res)=>{
    res.locals.pageName = 'ab-add';
    res.render('address-book/add'); //template 路徑
})
.post(async (req, res)=>{
    // TODO: 欄位檢查
    const output = {
        success: false,
    }

    // 傳統的寫法
    // const sql = "INSERT INTO `address_book`(" +
    //     "`name`, `email`, `mobile`, `birthday`, `address`, `created_at`) VALUES (?, ?, ?, ?, ?, NOW())";
    //
    // const [result] = await db.query(sql, [
    //     req.body.name,
    //     req.body.email,
    //     req.body.mobile,
    //     req.body.birthday,
    //     req.body.address,
    // ]);

    // 把上面五個資料req.body解開, 加上created_at的設定值(每個欄位都要有資料)
    const input = {...req.body, created_at: new Date()};
    const sql = "INSERT INTO `address_book` SET ?";
    let result = {};
    // 處理新增資料時可能的錯誤
    try {
        // 把input的值丟進sql裡面,[]裡面放value
        [result] = await db.query(sql, [input]);
    } catch(ex){
        output.error = ex.toString();
    }
    output.result = result;
    if(result.affectedRows && result.insertId){
        output.success = true;
    }

    console.log({result});
    /* 傳統寫法拿到的內容
    {
      result: ResultSetHeader {
        fieldCount: 0,
        affectedRows: 1,
        insertId: 148, 
        info: '',
        serverStatus: 2,
        warningStatus: 0
      }
    }
     */

    res.json(output);
});


    router.route('/edit/:sid')
    .get(async (req, res)=>{
        const sql = "SELECT * FROM address_book WHERE sid=?";
        const [rs] = await db.query(sql, [req.params.sid]);
        // 判斷是否有資料
        if(rs.length){
            res.render('address-book/edit', {row: rs[0]}); //多包一層??
        } else {
            res.redirect('/address-book/list');
        }
    })
    .post(async (req, res)=>{
        // TODO: 欄位檢查
        const output = {
            success: false,
            postData: req.body,
        }

        const input = {...req.body};
        const sql = "UPDATE `address_book` SET ? WHERE sid=?";
        let result = {};
        // 處理修改資料時可能的錯誤
        try {
            //第一個input給第一個?,req.params.sid(這個值從/edit/:sid來)給第二個?
            [result] = await db.query(sql, [input, req.params.sid]); 
        } catch(ex){
            output.error = ex.toString();
        }
        output.result = result;
        if(result.affectedRows===1){
            if(result.changedRows===1){
                output.success = true;
            } else {
                output.error = '資料沒有變更';
            }
        }

        /*
            result: {fieldCount: 0, affectedRows: 1, insertId: 0, info: "Rows matched: 1 Changed: 1 Warnings: 0",…}
            affectedRows: 1
            changedRows: 1
            fieldCount: 0
            info: "Rows matched: 1  Changed: 1  Warnings: 0"
            insertId: 0
            serverStatus: 2
            warningStatus: 0
            success: true
         */

        res.json(output);
    });

    
module.exports = router;

