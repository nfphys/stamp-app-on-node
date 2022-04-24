
function twoDigit(num) {
    let ret;
    if( num < 10 ) 
        ret = "0" + num; 
    else 
        ret = num; 
    return ret;
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
    document.getElementById("breaking-hours").innerHTML = msg;
}

let workingHours = [0]; // 勤務時間(sec)
let restHours = [0]; // 休憩時間(sec)

// 現在時刻の表示
// setInterval('showClock("current-time")', 10);

// 勤務時間の更新・表示
// setInterval('updateWorkingHours(currentState, workingHours, 1)', 1000);
// setInterval('showWorkingHours(workingHours)', 1000);

// 休憩時間の更新・表示
//setInterval('updateRestHours(currentState, restHours, 1)', 1000);
// setInterval('showRestHours(restHours)', 1000);



