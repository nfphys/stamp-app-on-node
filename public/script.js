
function twoDigit(num) {
    let ret;
    if( num < 10 ) 
        ret = "0" + num; 
    else 
        ret = num; 
    return ret;
}
function showClock(id) {
    /*
    let nowTime  = new Date();
    let nowHour  = twoDigit( nowTime.getHours() );
    let nowMin   = twoDigit( nowTime.getMinutes() );
    let nowSec   = twoDigit( nowTime.getSeconds() );
    let msg = nowHour + ":" + nowMin + ":" + nowSec;
    */
    let date = new Date();
    document.getElementById(id).innerHTML = date.toLocaleString("ja");
}


// delta秒ごとに勤務時間を更新
function updateWorkingHours(currentState, workingHours, delta) {
    if (currentState=="勤務中") {
        workingHours[0] += delta;
    }
}
// 勤務時間を表示
function showWorkingHours(workingHours) {
    let temp = workingHours[0];

    let sec  = twoDigit(temp % 60);
    temp = Math.floor(temp / 60); 

    let min  = twoDigit(temp % 60);
    temp = Math.floor(temp / 60); 

    let hour = twoDigit(temp);

    let msg = hour + ":" + min + ":" + sec;
    document.getElementById("working-hours").innerHTML = msg;
    document.getElementById("working-hours-input").value = msg;
}

// delta秒ごとに休憩時間を更新
function updateRestHours(currentState, restHours, delta) {
    if (currentState=="休憩中") {
        restHours[0] += delta;
    }
}
// 休憩時間を表示
function showRestHours(restHours) {
    let temp = restHours[0];

    let sec  = twoDigit(temp % 60);
    temp = Math.floor(temp / 60); 

    let min  = twoDigit(temp % 60);
    temp = Math.floor(temp / 60); 

    let hour = twoDigit(temp);

    let msg = hour + ":" + min + ":" + sec;
    document.getElementById("rest-hours").innerHTML = msg;
}

let currentState = "勤務外";
let started = false; // その日に出勤したかどうか
let finished = false; // その日に退勤したかどうか
let workingHours = [0]; // 勤務時間(sec)
let restHours = [0]; // 休憩時間(sec)

// 現在時刻の表示
setInterval('showClock("current-time")', 10);

// 勤務時間の更新・表示
setInterval('updateWorkingHours(currentState, workingHours, 1)', 1000);
setInterval('showWorkingHours(workingHours)', 1000);

// 休憩時間の更新・表示
setInterval('updateRestHours(currentState, restHours, 1)', 1000);
setInterval('showRestHours(restHours)', 1000);

// 出勤
function startWork() {
    if (!started && currentState=="勤務外") {
        started = true;
        currentState = "勤務中";
        document.getElementById('current-state').innerHTML = currentState;
        showClock("start-time");
    }
};

// 退勤
function finishWork() {
    if (!finished && currentState=="勤務中") {
        currentState = "勤務外";
        document.getElementById('current-state').innerHTML = currentState;
        showClock("finish-time");
    }
}

// 休憩
function startRest() {
    if (currentState=="勤務中") {
        currentState = "休憩中";
        document.getElementById('current-state').innerHTML = currentState;
    }
}

// 戻り
function finishRest() {
    if (currentState=="休憩中") {
        currentState = "勤務中";
        document.getElementById('current-state').innerHTML = currentState;
    }
}

// リセット
function reset() {
    currentState = "勤務外";
    started = false;
    finished = false; 
    restHours[0] = 0;
    workingHours[0] = 0;
    document.getElementById('current-state').innerHTML = currentState;
    document.getElementById('start-time').innerHTML = '';
    document.getElementById('finish-time').innerHTML = '';
    document.getElementById('working-hours').innerHTML = '00:00:00';
    document.getElementById('rest-houts').innerHTML = '00:00:00';
}

