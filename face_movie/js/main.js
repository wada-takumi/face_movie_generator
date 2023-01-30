

var cameraArea = document.getElementById("cameraArea"),
camera = document.getElementById("camera"),
canvas = document.getElementById("canvas"),
emoticon = document.getElementById("emoticon"),
ctx = canvas.getContext("2d"),
canvasW = 480,
canvasH = 360,
intervalTime = 1000;

var canvasElem = document.getElementById("canvas2");
canvasElem.setAttribute("canvasElem.width", 600);
canvasElem.setAttribute("canvasElem.height", 450);
var context = canvasElem.getContext("2d");


var screenCaptureInterval = true;     
var screenCaptureCount = function(){
screenCaptureInterval = true;
console.log("true");
}      

var videoElem = document.getElementById("video3");
var startElem = document.getElementById("start");
var stopElem = document.getElementById("stop");

async function init(){
setCanvas();
setCamera();
await faceapi.nets.tinyFaceDetector.load("js/weights/");
await faceapi.nets.faceExpressionNet.load("js/weights/");
}

async function setCanvas (){
canvas.width = canvasW;
canvas.height = canvasH;
}

async function setCamera(){
var constraints = {
audio: false,
video: {
  width: canvasW,
  height: canvasH,
  facingMode: "user"
}
};
await navigator.mediaDevices.getUserMedia(constraints)
.then((stream) => {
camera.srcObject = stream;
camera.onloadedmetadata = (e) => {
  playCamera();
};
})
.catch((err) => {
console.log(err.name + ": " + err.message);
});
}

_canvasUpdate();

function _canvasUpdate() {
  context.drawImage(videoElem, 0, 0, canvasElem.width, canvasElem.height);
  context.drawImage(camera, 0, 440,  canvas.width, canvas.height,);
  requestAnimationFrame(_canvasUpdate);
};


// getDisplayMediaOptions()
var displayMediaOptions = {
video: {cursor: "always"},
audio: false};

var frames;
var recorder;

var anchor = document.getElementById("download");
//スクショ、保存
function canvasDownload(){

	var stream = new MediaStream();
	stream.addTrack(canvasElem.captureStream().getTracks()[0]);
	recorder = new MediaRecorder(stream, {mimeType:"video/webm;codecs=vp9"});

	recorder.ondataavailable = function(e) {
		var videoBlob = new Blob([e.data], { type: e.data.type });
		blobUrl = window.URL.createObjectURL(videoBlob);
		anchor.href = blobUrl;
		anchor.style.display = "block";
	}

	recorder.start();
  setTimeout(frameStop ,2000);

};

function frameStop(){
  recorder.stop();
  anchor.click();
};

function playCamera(){
camera.play();
setInterval(async () => {
  canvas.getContext("2d").clearRect(0, 0, canvasW, canvasH);
  checkFace();
}, intervalTime);
}

async function checkFace(){
let faceData = await faceapi.detectAllFaces(
  camera, new faceapi.TinyFaceDetectorOptions()
).withFaceExpressions();
if(faceData.length){
  function setDetection(){
    let box = faceData[0].detection.box;
        x = box.x,
        y = box.y,
        w = box.width,
        h = box.height;

    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.strokeStyle = "#76FF03";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function setExpressions(){
    let happy = faceData[0].expressions.happy;
    let sad = faceData[0].expressions.sad;
    let angry = faceData[0].expressions.angry;
    let fearful = faceData[0].expressions.fearful;
    let disugusted = faceData[0].expressions.disugusted;
    let surprised = faceData[0].expressions.surprised;
    let expressionsValue = 0.8;
    
    emoticon.style.bottom = (canvasH - 40) * happy + "px";

    if((happy>expressionsValue || sad>expressionsValue || angry>expressionsValue || fearful>expressionsValue || disugusted>expressionsValue || surprised>expressionsValue)
       && screenCaptureInterval){
      canvasDownload();
      screenCaptureInterval = false; 
      console.log("false");     
      setTimeout( screenCaptureCount ,10000);
    }
  };
  setDetection();
  setExpressions();
}
};
init();

//画面共有
startElem.addEventListener("click", async function (evt) {
try {
    videoElem.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
} catch (err) {
    console.error("Error: " + err); 
    }
}, false);

stopElem.addEventListener("click", function (evt) {
var tracks = videoElem.srcObject.getTracks();
tracks.forEach(track => track.stop());
videoElem.srcObject = null;
}, false);

//スクショ
var captureElem =document.getElementById("capture");
captureElem.addEventListener("click", function(){
canvasDownload();
});
