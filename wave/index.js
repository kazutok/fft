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
        count  = 0;
    
//    alert(audioCtx.sampleRate + " Hz");
    f = audioCtx.sampleRate;
    btn.classList.add("off");
    analyser.fftSize = LENGTH;
    src.connect(analyser);
//    alert("fft start");


    setInterval(() => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;

      ctx.fillStyle = "#ff0000"; //DARK RED
      ctx.font = "20px Arial";

      w = canvas.width / LENGTH,

//      analyser.getByteFrequencyData(data);
//      data3 = data2;
//      data2 = data1;
      analyser.getByteTimeDomainData(data);
//      data = data3.concat(data2).concat(data1);
            
      for (i = 0; i < LENGTH; i++) {
        ctx.rect(i * w, canvas.height*(1 - data[i]/255), w, canvas.height*data[i]/255);
//        ctx.rect(i * w, canvas.height*(1 - data[i]/255), w, 5);
        if(data[i] > 200){
          count++;
        }
      }
      ctx.fill();
      
      ctx.fillStyle = "#000000"; //DARK RED
      ctx.font = "20px Arial";
      ctx.fillText("SamplingRate:" + f + "Hz, w:" + canvas.width + ", h:" + canvas.height, 10, 25);
      ctx.fillText("RMS:" + "  PEAK COUNT: " + count, 35, 25);
      
      
      
    }, 20);
  }

})();
