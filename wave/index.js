(function() {

  "use strict";
  
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

  function sendDataViaEmail(th, ph, f, w, h, ave, rms, thre) {
    var subject = 'HIGE CHECKER DATA';
    var body = "";
    body += "Measurement Settings<br/>";
    body += "- sampling_rate: " + f + " Hz<br/>";
    body += "- canvas.width: " + w + " px<br/>";
    body += "- canvas.height: " + h + " px<br/>";
    body += "- wave_average : " + ave + "<br/>";
    body += "- wave_rms: " + rms + "<br/>";
    body += "- wave_threshold: " + thre + "<br/>";
    body += "<br/>";
    body += "timecount,time<br/>";//出力CSVのヘッダ行
    for(var i = 0; i < th.length; i++){
      body += th[i] + "<br/>";
    }
    body += "<br/>";
    body += "timecount,peak_subcount<br/>";//出力CSVのヘッダ行
    for(var i = 0; i < ph.length; i++){
      body += i + "," + ph[i] + "<br/>";
    }
    location.href = 'mailto:?subject=' + subject + '&body=' + body;
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
        w      = 0,
        i      = 0,
        f      = 0,
        ave    = 0,
        rms    = 0,
        threshold    = 0,
        count  = 0,
        precount  = 10,
        peak_history = [],
        time_history = [],
        peak_subcount = 0,
        peakcount  = 0;
    
//    alert(audioCtx.sampleRate + " Hz");
    f = audioCtx.sampleRate;
    btn.classList.add("off");
    analyser.fftSize = LENGTH;
    src.connect(analyser);
//    alert("fft start");

//    analyser.getByteTimeDomainData(data);
    
    
    setInterval(() => {
      if((count-precount)%100 == 0){
        let now = new Date();
        time_history.push(peak_history.length + "," + now.getFullYear() + "/" + String(now.getMonth()+1) + "/" + now.getDate() + " " + 
                            now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds());
      }
      if(peak_history.length == 500){
        sendDataViaEmail(time_history, peak_history, f, canvas.width, canvas.height, ave, rms, threshold);
      }

      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;

      w = canvas.width / LENGTH,
//      analyser.getByteFrequencyData(data);
//      data3 = data2;
//      data2 = data1;
      analyser.getByteTimeDomainData(data);
//      data = data3.concat(data2).concat(data1);

      if(count == precount){
//        alert("data1:"+data[1]+"\n data100:"+data[100]+"\n data200:"+data[200]);
        for (i = 0; i < LENGTH; i++) {
          ave += data[i];
        }
//        alert("ave:"+ave);
        ave = Math.round(ave/LENGTH);
        for (i = 0; i < LENGTH; i++) {
          rms += (data[i]-ave)*(data[i]-ave);
        }
//        alert("rms:"+rms);
        rms = rms/LENGTH;
        rms = Math.round(Math.sqrt(rms));
        threshold = ave + rms*3;
      }
      peak_subcount = 0;
      
      ctx.fillStyle = "#0000ff"; //blue
      ctx.fillRect(0, canvas.height*0.8*(1 - (ave+rms)/255), canvas.width, 1);
      ctx.font = "12px Arial";
      ctx.fillText("threshold", 1, canvas.height*0.8*(1 - (ave+rms)/255)-2);
      
      ctx.fillStyle = "#008800"; //dark green
      for (i = 0; i < canvas.width; i++) {
        if( peak_history[i + peak_history.length - canvas.width]/2000 >= canvas.height*0.2 ){
          ctx.fillRect(i, canvas.height*0.8, 1, canvas.height*0.2);
        }else{
          ctx.fillRect(i, canvas.height*(1 - peak_history[i + peak_history.length - canvas.width]/2000)-1, 1, canvas.height*peak_history[i + peak_history.length - canvas.width]/2000+1);
        }
      }

      ctx.fillStyle = "#dd0000"; //DARK RED
      for (i = 0; i < LENGTH; i++) {
        ctx.rect(i * w, canvas.height*0.8*(1 - data[i]/255), w, canvas.height*0.8*data[i]/255);
        if(data[i] > threshold){
          peak_subcount++;
        }
      }

      if(count > precount){
        peak_history.push(peak_subcount);
        peakcount += peak_subcount;
      }

      ctx.fill();

      ctx.fillStyle = "#000000"; //black
      ctx.font = "12px Arial";
      ctx.fillText("sampling_rate:" + f + "Hz, w:" + canvas.width + ", h:" + canvas.height, 5, 20);
      ctx.fillText("ave:" + ave + ", RMS:" + rms + ", threshold(=ave+3*rms):" + threshold, 5, 35);

      ctx.fillStyle = "#ff0000"; //DARK RED
      ctx.font = "16px Arial";
      ctx.fillText("PEAK COUNT: " + peakcount, 5, 55);
      
      count++;
    }, 5);
  }

})();
