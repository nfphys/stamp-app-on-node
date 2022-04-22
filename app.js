const express = require('express');
const app = express();

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost', 
    user: 'root',
    password: 'Sql0463', 
    database: 'stamp_app'
});

const session = require('express-session');
app.use(
    session({
        secret: 'my_secret_key',
        resave: false,
        saveUninitialized: false,
    })
)

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

app.use((req, res, next) => {
    if (req.session.userId === undefined) {
        //console.log("ログインしていません");
        res.locals.username = 'ゲスト';
        res.locals.isLoggedIn = false;
    } else {
        //console.log("ログインしています");
        res.locals.username = req.session.username;
        res.locals.isLoggedIn = true;
    }

    if (req.session.startWorkTime === undefined) {
        //console.log("出勤していません");
        res.locals.currentState = "出勤前"
    } else {
        //console.log("出勤しました");
        res.locals.startedWork = true;
        res.locals.startWorkTime = req.session.startWorkTime;
        res.locals.currentState = "勤務中"

        if (req.session.finishWorkTime === undefined) {
            //console.log("退勤していません");
        } else {
            //console.log("退勤しました");
            res.locals.finishedWork = true;
            res.locals.finishWorkTime = req.session.finishWorkTime;
            res.locals.currentState = "退勤済"
        }
    }

    next();
});

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
    const email = req.body.email; 

    connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (error, results) => {
            if (results.length > 0) {
                if (req.body.password === results[0].password) { 
                    req.session.userId = results[0].id;
                    req.session.username = results[0].username;
                    res.redirect("/record");
                } else {
                    res.redirect("/login");
                }
            } else {
                res.redirect("/login")
            }
        }
    );
});

// ログアウト
app.get('/logout', (req, res) => {
    req.session.destroy((error) => {
        res.redirect('/record');
    });
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

// 出勤
app.post('/start_work', (req, res) => {
    if (res.locals.isLoggedIn === false) {
        console.log("まだログインしていません");
    } else if (req.session.startWorkTime === undefined) {
        let date = new Date();
        req.session.startWorkTime = date.toLocaleString("ja");
    }
    res.redirect('/record');
});

// 退勤
app.post('/finish_work', (req, res) => {
    if (res.locals.isLoggedIn === false) {
        console.log("まだログインしていません");
    } else if (req.session.startWorkTime === undefined) {
        console.log("まだ出勤していません");
    } else if (req.session.finishWorkTime === undefined) {
        let date = new Date(); 
        req.session.finishWorkTime = date.toLocaleString("ja");
    }
    res.redirect('/record');
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
var port = process.env.PORT || 3000;
app.listen(port);