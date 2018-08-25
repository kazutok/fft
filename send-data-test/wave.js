(function() {

  "use strict";
  
  let displaymessage  = "Recording...";

  let btn    = document.getElementById("btn"),
      canvas = document.getElementById("canvas"),
      ctx    = canvas.getContext("2d");
  
  navigator.getUserMedia({
    audio: true
  }, _handleSuccess, _handleError);
  
  function _handleSuccess(evt) {
    btn.addEventListener("click", () => {
      _handleClick(evt);
    }, false);
  }

  function _handleError() {
    alert("Error!");
  }

//  function sendDataViaEmail(th, ph, f, w, h, ave, rms, thre) {
//    var subject = 'HIGE CHECKER DATA';
//    var body = "";
//    body += "Measurement Settings<br/>";
//    body += "- sampling_rate: " + f + " Hz<br/>";
//    body += "- canvas.width: " + w + " px<br/>";
//    body += "- canvas.height: " + h + " px<br/>";
//    body += "- wave_average : " + ave + "<br/>";
//    body += "- wave_rms: " + rms + "<br/>";
//    body += "- wave_threshold: " + thre + "<br/>";
//    body += "<br/>";
//    body += "timecount,time<br/>";//出力CSVのヘッダ行
//    for(var i = 0; i < th.length; i++){
//      body += th[i] + "<br/>";
//    }
//    body += "<br/>";
//    body += "timecount,peak_subcount<br/>";//出力CSVのヘッダ行
//    for(var i = 0; i < ph.length; i++){
//      body += i + "," + ph[i] + "<br/>";
//    }
//    location.href = 'mailto:?subject=' + subject + '&body=' + body;
//  }

  function sendDataViaEmail(f, fftlength, w, h, timestamp, timedata, fftdata) {
    var body = "";
    body += "timestamp:" + timestamp + ",";//timestamp
    body += "sampling_rate:" + f + "Hz,";//sampling_rate Hz
    body += "fftlength:" + fftlength + ",";//fftlength Hz
    body += "canvas.width:" + w + "px,";//canvas.width px
    body += "canvas.height:" + h + "px,";//canvas.height px
//    body += ave + ",";//wave_average
//    body += rms + ",";//wave_rms
//    body += thre + ",";//wave_threshold
    body += "time_data:,";
    for(var i = 0; i < timedata.length; i++){
      body += timedata[i] + ",";
    }
    body += "fft_data:,";
    for(var i = 0; i < fftdata.length; i++){
      body += fftdata[i] + ",";
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://script.google.com/macros/s/AKfycbzlSdsV3CwH3byH14kDwHCKZgfUyUFm7yCQay0v69Pbv294QfhZ/exec');
    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
    xhr.send( 'mytext=' + body );

    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4 && xhr.status === 200) {
          alert( "send data: " + xhr.responseText );
          displaymessage = "Send DATA Complete";
        }
    }
  }



  function _handleClick(evt) {
    let LENGTH   = 2048,
        audioCtx = new (window.AudioContext || window.webkitAudioContext)(),
        options  = {
          mediaStream : evt
        },
        src      = audioCtx.createMediaStreamSource(evt),
        analyser = audioCtx.createAnalyser(evt),
        data   = new Uint8Array(LENGTH),
        fftdata   = new Uint8Array(LENGTH),
        w      = 0,
        i      = 0,
        f      = 0,
        ave    = 0,
        rms    = 0,
        threshold    = 0,
        count  = 0,
//        peak_history = [],
        time_history = [],
        alldata = [],
        peak_subcount = 0,
        peakcount  = 0;
    
    f = audioCtx.sampleRate;
    btn.classList.add("off");
    analyser.fftSize = LENGTH;
    src.connect(analyser);
    
    setInterval(() => {
//      let now = new Date();
//      time_history.push(peak_history.length + "," + now.getFullYear() + "/" + String(now.getMonth()+1) + "/" + now.getDate() + " " + 
//                            now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds());
//      time_history.push(now.getSeconds() + "." + now.getMilliseconds());
//      if(count == 100){
//        sendDataViaEmail(time_history, alldata, f, canvas.width, canvas.height, ave, rms, threshold);
//      }

      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;

      w = canvas.width / LENGTH;

      let now = new Date();
      analyser.getByteTimeDomainData(data);
      analyser.getByteFrequencyData(fftdata);
//      if(count > 100){
//        Array.prototype.push.apply(alldata, data);
//        str += now1.getSeconds() + "." + now1.getMilliseconds() + "-" + now2.getSeconds() + "." + now2.getMilliseconds() + "_" + alldata.length + " ";
//      }
//      alldata = alldata.concat(data);


      if(count == 50){
        displaymessage = "Sending DATA...";
        let timestamp = now.getFullYear() + "/" + String(now.getMonth()+1) + "/" + now.getDate() + " " + 
                            now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds();
        sendDataViaEmail(f, LENGTH, canvas.width, canvas.height, timestamp, data, fftdata);

      }





      ctx.fillStyle = "#0000ff"; //blue
      ctx.fillRect(0, canvas.height*0.8*(1 - (ave+rms)/255), canvas.width, 1);
      ctx.font = "12px Arial";
      ctx.fillText("threshold", 1, canvas.height*0.8*(1 - (ave+rms)/255)-2);
      
//      ctx.fillStyle = "#008800"; //dark green
//      for (i = 0; i < canvas.width; i++) {
//        if( peak_history[i + peak_history.length - canvas.width]/2000 >= canvas.height*0.2 ){
//          ctx.fillRect(i, canvas.height*0.8, 1, canvas.height*0.2);
//        }else{
//          ctx.fillRect(i, canvas.height*(1 - peak_history[i + peak_history.length - canvas.width]/2000)-1, 1, canvas.height*peak_history[i + peak_history.length - canvas.width]/2000+1);
//        }
//      }

      ctx.fillStyle = "#dd0000"; //DARK RED
      for (i = 0; i < LENGTH; i++) {
        ctx.rect(i * w, canvas.height*0.8*(1 - data[i]/255), w, canvas.height*0.8*data[i]/255);
        if(data[i] > threshold){
          peak_subcount++;
        }
      }

      ctx.fill();

      ctx.fillStyle = "#000000"; //black
      ctx.font = "12px Arial";
      ctx.fillText("sampling_rate:" + f + "Hz, w:" + canvas.width + ", h:" + canvas.height, 5, 20);
      ctx.fillText("ave:" + ave + ", RMS:" + rms + ", threshold(=ave+2*rms):" + threshold, 5, 35);

      ctx.fillStyle = "#ff0000"; //DARK RED
      ctx.font = "16px Arial";
//      ctx.fillText("PEAK COUNT: " + peakcount, 5, 55);
      ctx.fillText(displaymessage, 5, 55);
      
      count++;
    }, 40);
  }

})();
