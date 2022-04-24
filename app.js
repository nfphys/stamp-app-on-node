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

const bcrypt = require('bcrypt');

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


// 新規登録
app.get('/signup', (req, res) => {
    res.render('signup.ejs', { errors: []});
});

app.post('/signup', 
    (req, res, next) => {
        console.log('入力値の空チェック');
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const errors = [];

        if (username === "") {
            errors.push("ユーザー名が空です");
        }
        if (email === "") {
            errors.push("メールアドレスが空です");
        }
        if (password === "") {
            errors.push("パスワードが空です");
        }

        if (errors.length > 0) {
            res.render('signup.ejs', {errors: errors})
        } else {
            next();
        }
    },
    (req, res, next) => {
        console.log("メールアドレスの重複チェック");
        const email = req.body.email;
        const errors = [];

        connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email],
            (error, results) => {
                if (results.length > 0) {
                    errors.push("ユーザー登録に失敗しました");
                    res.render("signup.ejs", {errors: errors})
                } else {
                    next();
                }
            }
        )
    },
    (req, res) => {
        console.log('ユーザー登録');
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        connection.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, password],
            (error, results) => {
                req.session.userId = results.insertId;
                req.session.username = username;
                res.redirect('/record');
            }
        );
    }
);

app.post('/signup', (req, res) => {
    const username = req.body.username;
    const email    = req.body.email; 
    const password = req.body.password; 

    connection.query(
        'INSERT INTO users (username, email, password) VALUES (?,?,?)',
        [username, email, password],
        (error, resultd) =>{
            req.session.userId = results.insertId;
            req.session.username = username;
            res.redirect('/record');
        }
    )
});


// 記録ページ
app.get('/record', (req, res) => {
    today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const year_month = year + "-" + twoDigit(month);
    //console.log(YM_today);

    if (res.locals.isLoggedIn) {
        const username = res.locals.username;
        connection.query(
            'SELECT * FROM work_data WHERE username=? && date>=? && date<=? ORDER BY id DESC', 
            [username, year_month + "-01", year_month + "-31"],
            (error, results) => {
                res.render('record.ejs', {work_data: results, year_month: year_month});
            }
        )
    } else {
        res.render('record.ejs');
    }
});

// 出勤
app.post('/start_work', (req, res) => {
    if (res.locals.isLoggedIn === false) {
        console.log("まだログインしていません");
    } else if (req.session.startWorkTime === undefined) {
        let date = new Date();
        req.session.startWorkTime = date.toLocaleString("ja");
    } else {
        console.log("本日は出勤済です");
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

        // 日付
        let year  =          date.getFullYear();
        let month = twoDigit(date.getMonth() + 1);
        let day   = twoDigit(date.getDate());
        let date_string = year + "-" + month + "-" + day;

        // 勤務時間の計算
        start  = Date.parse(req.session.startWorkTime)/1000;
        finish = Date.parse(req.session.finishWorkTime)/1000;

        temp = finish - start; 
        let sec  = twoDigit(temp % 60);
        temp = Math.floor(temp / 60); 
        let min  = twoDigit(temp % 60);
        temp = Math.floor(temp / 60); 
        let hour = twoDigit(temp);
        let workingHours = hour + ":" + min + ":" + sec;
        // console.log(workingHours);

        connection.query(
            'INSERT INTO work_data(date, working_hours, username) VALUES(?, ?, ?)', 
            [date_string, workingHours, res.locals.username],
            (error, results) => {
            }
        );
    }

    res.redirect('/record');
});

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


// 過去の勤務状況を取得
app.post('/history', (req, res) => {
    console.log(req.body.year_month)
    const year_month = req.body.year_month;
    if (res.locals.isLoggedIn) {
        const username = res.locals.username;
        connection.query(
            'SELECT * FROM work_data WHERE username=? && date>=? && date<=? ORDER BY id DESC', 
            [username, year_month + "-01", year_month + "-31"],
            (error, results) => {
                res.render('record.ejs', {work_data: results, year_month: year_month});
            }
        )
    } else {
        res.render('record.ejs');
    }
})



// サーバーを起動する
var port = process.env.PORT || 3000;
app.listen(port);