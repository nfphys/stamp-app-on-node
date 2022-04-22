const express = require('express');
const app = express();

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost', 
    user: 'root',
    password: 'Sql0463', 
    database: 'stamp_app'
});

app.use(express.static('public'));
app.use(express.urlencoded({extended: false})); // これがないと req.body が undefined になる

function twoDigit(num) {
    let ret;
    if( num < 10 ) 
        ret = "0" + num; 
    else 
        ret = num; 
    return ret;
}

// トップページ
app.get('/', (req, res) => {
    res.render('top.ejs');
});

// ログイン画面表示
app.get('/login', (req, res) => {
    res.render('login.ejs');
});

// ユーザー認証
app.post('/login', (req, res) => {
    res.redirect('/record');
});



// 記録ページ
app.get('/record', (req, res) => {
    connection.query(
        'SELECT * FROM work_data ORDER BY id DESC', 
        (error, results) => {
            res.render('record.ejs', {work_data: results});
        }
    )
});


// 登録
app.post('/registration', (req, res) => {
    let date  = new Date();
    let year  =          date.getFullYear();
    let month = twoDigit(date.getMonth() + 1);
    let day   = twoDigit(date.getDate());
    let date_string = year + "-" + month + "-" + day;

    connection.query(
        'INSERT INTO work_data(date, working_hours) VALUES(?, ?)', 
        [date_string, req.body.workingHours],
        (error, results) => {
            res.redirect('/record');
        }
    );
})

// 削除
app.post('/delete/:id', (req, res) => {
    console.log(req.params.id);
    connection.query(
        'DELETE FROM work_data WHERE id=?', 
        [req.params.id],
        (error, results) => {
            res.redirect('/record');
        }
    );
});



// サーバーを起動する
app.listen(3000);