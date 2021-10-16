const { query } = require('./../modules/connect-mysql');
const db = require('./../modules/connect-mysql')

const tableName = 'products'
const pkField = 'sid'


class Product {

    // 預設值是空物件, 設定defaultOb 到data
    constructor(defaultObj={}) {
        // `sid`, `author`, `bookname`, `category_sid`, `book_id`, `publish_date`, `pages`, `price`, `isbn`, `on_sale`, `introduction`
        this.data = defaultObj;
    }
    // 讀取所有資料 + 篩選功能

    static async findAll(option={}){
        let op = {
            perPage: 5,
            page:1,

            category: null,
            orderBy:'',
            priceLow:0,
            priceHight:0,
            keyword:'',
        }
        const output = {
            perPage: op.perPage,
            page:op.page,
            totalRows:0,
            totalPages:0,
            rows:[],
        }

        let where = ' WHERE 1 ';
        if(op.category){
            where += ' AND category_sid='+ parseInt(op.category)+ ' '; //建議後面接空格,因為where會一直接字串
        }
        if(op.keyword){
            // 關鍵字搜尋要做跳脫
            where += ' AND bookname LIKE ' + db.escape('%' + op.keyword+ '%') +' ';
        }
        // 設定價格最少~以上
        if(op.priceLow){
            where += ' AND price >= ' + parseInt(op.priceLow) +' ';
        }
        // 設定價格最高~以內
        if(op.priceHight){
            where += ' AND price <= ' + parseInt(op.priceHight) +' ';
        }

        const t_sql = `SELECT COUNT(1) totalRows FROM ${tableName}`
        const [t_rs] = await db.query(t_sql)
        const totalRows = t_rs[0].totalRows

        if(totalRows>0){
            output.totalRows = totalRows;
            output.totalPages = Math.ceil(totalRows/op.perPage);
            // 拿到所有資料
            const sql = `SELECT * FROM ${tableName} LIMIT ${(op.page-1)*(op.perPage)}, ${op.perPage}`;
            const [rs] = await db.query(sql)
            output.rows = rs;
        }
        return output;
    }



    // 讀取單筆資料
    static async findOne(pk=0){
        const sql = `SELECT * FROM ${tableName} WHERE ${pkField}=?`;
        const [rs] = await db.query(sql, [pk]); //把[pk]的值帶入?
        if(rs && rs.length===1){
            // return rs[0];
            // 會拿到product的物件,往上呼叫constructor
            return new Product(rs[0])
        }
        return null;
    }
    // 沒有加static 是個體的方法
    toJSON(){
        return this.data;
    }
    toString(){
        return JSON.stringify(this.data, null, 4);
    }

    // 儲存=新增
    // 拿到product物件就可以用這些static方法
    async save(){
        // 若有 PK 則表示要做修改
        if(this.data.sid){
            const sid = this.data.sid;
            // 展開data的資料, 把sid刪除, 修改除了sid以外的資料, 帶入到sql
            const data = {...this.data};
            delete data.sid;
            const sql = `UPDATE ${tableName} SET ? WHERE ${pkField}=?`;
            const [r] = await db.query(sql, [data, sid]); //依照順序把變數帶到上面問號
            return r;
        }else {
            // 沒有 PK 則表示要做新增
            const sql = `INSERT INTO ${tableName} SET ?`;
            const [r] = await db.query(sql, [this.data]);
            return r;
        }
    }
    // 修改
    // obj{}=會資料表裡的修改資料
    
    async edit(obj={}){
        // i 會拿到key>陣列裡的sid, author...(資料表上的欄位)
        for (let i in this.data){
            // 把key值拿出來做處理,當配對到一樣的, 直接修改ex: this.data[name]=obj[name]
            if(i===pkField) continue //直接忽略if迴圈到下一個, 不能修改pk
            if(obj[i]){
                this.data[i] = obj[i]
            }
        }
        // 做完上面之後再呼叫save()
        return await this.save()
    }

    async remove(){
        const sql = `DELETE FROM ${tableName} WHERE ${pkField}=?`;
        const [r] = await db.query(sql, this.data.sid);
        return r ;
    }
}

module.exports = Product
