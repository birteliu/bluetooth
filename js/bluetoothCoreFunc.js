for (var sensorStatus = !1, vThreshold = 0, vDuration = 0, writeToBuf = !1, msgArr = [], strBuf = "", drawChartHandle, dataBuf = [], showsize = 50, i = 0; i < showsize; i++) dataBuf.push([i, 0]);
google.charts.load("current", { packages: ["corechart", "line"] });

function toUTF8Array(d) { for (var a = [], c = 0; c < d.length; c++) { var b = d.charCodeAt(c);
        128 > b ? a.push(b) : 2048 > b ? a.push(192 | b >> 6, 128 | b & 63) : 55296 > b || 57344 <= b ? a.push(224 | b >> 12, 128 | b >> 6 & 63, 128 | b & 63) : (c++, b = 65536 + ((b & 1023) << 10 | d.charCodeAt(c) & 1023), a.push(240 | b >> 18, 128 | b >> 12 & 63, 128 | b >> 6 & 63, 128 | b & 63)) } return a }

function bluetoothConnect(d) { return new webduino.Arduino({ transport: "bluetooth", address: d }) }

function MsgAnalysis(d) { for (var a = 0; a < d.length; a++) { var c = String.fromCharCode(d[a]); "*" == c && (writeToBuf = !writeToBuf); if (writeToBuf) strBuf += c;
        else { var b = strBuf.split("*");
            strBuf = "";
            c = b[1].substring(0, 1);
            b = b[1].substring(1);
            msgArr.push({ cmd: c, value: b }) } } }

function newBTConnect() { void 0 != board._transport && board._transport.close();
    board = new bluetoothConnect(inputBTaddrValue.value);
    setTimeout(setBTConnectStatus, 1E3);
    board._transport.on("message", function(d) { MsgAnalysis(d) }) }

function setBTConnectStatus() { txtBtconnectStatus.textContent = board.isConnected ? "Bluetooth Connect Status: Connect" : "Bluetooth Connect Status: Unconnect" }

function StatusSwitch() { sensorStatus ? board._transport.send(toUTF8Array("1,0*")) : board._transport.send(toUTF8Array("1,1*")) }

function getThreshold() { board._transport.send(toUTF8Array("2," + inputSetValue.value + "*"));
    txtThreshold.textContent = "Current Threshold: " + vThreshold }

function setThreshold() { 50 <= inputSetValue.value && 1023 >= inputSetValue.value ? board._transport.send(toUTF8Array("3," + inputSetValue.value + "*")) : "" != inputSetValue.value && (inputSetValue.value = "Error,the range [50 ~ 1023]") }

function getDuration() { board._transport.send(toUTF8Array("4," + inputSetValue.value + "*"));
    txtDuration.textContent = "Current Duration: " + vDuration }

function setDuration() { 50 <= inputSetValue.value && 1E3 >= inputSetValue.value ? board._transport.send(toUTF8Array("5," + inputSetValue.value + "*")) : "" != inputSetValue.value && (inputSetValue.value = "Error,the range [50 ~ 1000]") }

function drawBackgroundColor() {
    if (0 != msgArr.length) {
        var d = new google.visualization.DataTable;
        d.addColumn("number", "X");
        d.addColumn("number", "G");
        var a = msgArr.shift();
        if ("undefined" != a)
            if ("G" == a.cmd) { var c; for (c = 0; c < dataBuf.length - 1; c++) dataBuf[c][1] = dataBuf[c + 1][1];
                dataBuf[c][1] = parseInt(a.value) } else {
                "m" == a.cmd ? 0 == a.value ? (txtSensorStatus.textContent = "Sensor Status: Stop", sensorStatus = !1) : 1 == a.value && (txtSensorStatus.textContent = "Sensor Status: Start", sensorStatus = !0) : "c" == a.cmd ? txtCnt.textContent =
                    "Current Threshold Cnt: " + a.value : "t" == a.cmd ? (vThreshold = parseInt(a.value), txtThreshold.textContent = "Current Threshold: " + vThreshold) : "d" == a.cmd ? (vDuration = parseInt(a.value), txtDuration.textContent = "Current Duration: " + vDuration) : (console.log(a.cmd), console.log(a.value));
                return
            }
        d.addRows(dataBuf);
        (new google.visualization.LineChart(document.getElementById("chart_div"))).draw(d, { hAxis: { title: "Time" }, vAxis: { title: "Popularity", viewWindow: { max: 1023, min: 0 } }, backgroundColor: "#ffffff" })
    }
};