var music = new Audio();
music.src = "./tengoku.mp3";

// ビデオ
var src_video;
 
// キャンバス
var src_canvas; 
var src_ctx;
 
// タイマーのID
var interval_id ; 

var index = 0;

 
window.onload = function(){     
  src_canvas = document.getElementById("SrcCanvas");
  src_ctx = src_canvas.getContext("2d");    
  
  src_video = document.getElementById("SrcVideo");
}
 
// 停止
function stopMovie(){
  src_video.loop=false;
  src_video.pause(); 
  clearInterval(interval_id);
}
 
// タイマーイベント canvasに描画
function onNotify(){
  src_ctx.drawImage(src_video,0,0,src_video.width,src_video.height);
}

// ユーザーによりファイルが追加された  
function onAddFile(event) {
  var files=[];
  var filename;
  
  if(event.target.files){
    files = event.target.files;
  }else{ 
    files = event.dataTransfer.files;   
  }    
  
  if (files[0] != undefined){    
    filename = files[0].name;
    
    // 拡張子の取得 
    var ext = filename.split('.');
    ext = ext[ext.length-1].toUpperCase();
                 
    // 動画が再生できる状態になった時
    src_video.onloadeddata = function(){             
      
      // 最大横幅を640にする
      var size = 1280;
      if(src_video.videoWidth > size){
        var aspectratio = src_video.videoWidth / size;
        var another = Math.round(src_video.videoHeight / aspectratio);
                
        src_video.width  = size;
        src_video.height = another;  
      }else{
        src_video.width  = src_video.videoWidth;
        src_video.height = src_video.videoHeight;;  
      }
            
      src_canvas.width  = src_video.width;
      src_canvas.height = src_video.height;
      
      // タイマー発動(60fps)
      interval_id = setInterval(onNotify,1000 / 60);
      
      // 再生      
      src_video.play();  
	  music.play(); 

    };    
          
    src_video.onerror = function(e){
      alert('このファイルは読み込めません。');
    };    
   
    // 以前のURLオブジェクトを削除する
    // if(src_video.src){
    //   src_video.pause();
    //   window.URL.revokeObjectURL(src_video.src) ;
    // }

	//追加部分　画像が終わったら
	src_video.addEventListener('ended', function(){
		index++;
		if (index < files.length) {
			console.log(index);
		  src_video.src =URL.createObjectURL(new Blob([files[index]], { type: mime }));
		  src_video.play();
		}
		else {
		  src_video.pause();
		  music.pause();
		  music.currentTime = 0;
		  window.URL.revokeObjectURL(src_video.src) ;
		}
	  });
   
    // MIMEを指定して動画を読み込む
    var mime = "video/mp4";
    if(ext == "WEBM"){
      mime = "video/webm";
    }else if (ext == "OGG" || ext == "OGX" || ext == "OGV"){
      mime = "video/ogg";
    }               
    src_video.src = URL.createObjectURL(new Blob([files[0]], { type: mime }));
	console.log(files.length);
  }
}      

