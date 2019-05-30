var mime = require("mime-types");

angular.module("SmartMirror") //,['ngAnimate']
	.controller("BackgroundImageViewerController", 
    function ($scope, $http, $interval, BackgroundImageViewerService) {

      var atomScreen = require("electron").screen

      var mainScreen =atomScreen.getPrimaryDisplay();
      var dimensions = mainScreen.size;      

      console.log("window size w="+dimensions.width+" h="+dimensions.height);
      $scope.screen= {}
      sw=$scope.screen.width=dimensions.width
      sh=$scope.screen.height=dimensions.height
      // load all the sources images
      var p = BackgroundImageViewerService.loadImages($scope)
      if(p.length) {
        // once loaded
        Promise.all(p).then(() =>{ 
          // start the display timer 
          $interval( 
             function(){LoadNextImage( this.service, this.scope)}.bind({source :config.BackgroundImageViewer.sources[0],scope:$scope,service:BackgroundImageViewerService}),
             config.BackgroundImageViewer.cycle*1000
          );
        }); 
      }
    }  
  );
// start viewing the next image  
function LoadNextImage(service, scope){
  // only change images if visual focus is set. ( not sleep, etc)
  if(scope.focus == 'default') {
    service.next(scope).then((image) => {
      let parent = document.getElementById("bkimg")      
        let img = document.createElement('img')
        img.style.top = sh;  
        img.style.position="relative";      
        img.style.opacity = 0;      
        img.style.transition = "opacity 1.25s";
        img.style.display = "none"
        img.src=image
        if(config.BackgroundImageViewer.size!== 'maintain'){
            img.style.backgroundSize= 'cover'
        }
        // call this routine when the image is ready to display
        img.onload= loadHandler;
      parent.appendChild(img);
      
      //scope.currentImage=image;
      //console.log("$scope.currentImage= "+scope.currentImage) 
    })      
  }
}  
var sw=0;
var sh=0;
  
  function ScaleImage(srcwidth, srcheight, targetwidth, targetheight, fLetterBox) {

    var result = { width: 0, height: 0, fScaleToTargetWidth: true };

    if ((srcwidth <= 0) || (srcheight <= 0) || (targetwidth <= 0) || (targetheight <= 0)) {
        return result;
    }

    // scale to the target width
    var scaleX1 = targetwidth;
    var scaleY1 = (srcheight * targetwidth) / srcwidth;

    // scale to the target height
    var scaleX2 = (srcwidth * targetheight) / srcheight;
    var scaleY2 = targetheight;

    // now figure out which one we should use
    var fScaleOnWidth = (scaleX2 > targetwidth);
    if (fScaleOnWidth) {
        fScaleOnWidth = fLetterBox;
    }
    else {
       fScaleOnWidth = !fLetterBox;
    }

    if (fScaleOnWidth) {
        result.width = Math.floor(scaleX1);
        result.height = Math.floor(scaleY1);
        result.fScaleToTargetWidth = true;
    }
    else {
        result.width = Math.floor(scaleX2);
        result.height = Math.floor(scaleY2);
        result.fScaleToTargetWidth = false;
    }
    result.targetleft = Math.floor((targetwidth - result.width) / 2);
    result.targettop = Math.floor((targetheight - result.height) / 2);

    return result;
}

// image is ready to display
function loadHandler (evt) {

  // get the image of the event
  let img1 = evt.currentTarget;
  // get the margin (if any)
  let m = parseInt(window.getComputedStyle(document.body,null).getPropertyValue('margin-top'));        
  //Log.log("image loaded="+img1.src+" size="+img1.width+":"+img1.height);

  if(img1.style.backgroundSize == ""){
    // with the size of this image and it's parent
    // compute the new size and offsets
    let result = ScaleImage(img1.naturalWidth, img1.naturalHeight, sw, sh, true);
    // adjust the image size
    img1.width = result.width;
    img1.height = result.height-1;

    // adjust the image position
    img1.style.left = result.targetleft+"px";
    img1.style.top = result.targettop+"px";
  }
  else{
    img1.width = sw;
    img1.height = sh-1;
  }
  delete img1.style.backgroundSize 
 // img1.style.opacity =	.95// this.self.config.opacity;
 // img1.style.transition = "opacity 1.25s";
 // img1.style.display = "block";
  
  var wrapper = document.getElementById("bkimg");
  // if another image was already displayed
  let c = wrapper.childElementCount;
  if(c >1)
  {
    for( let i =0 ; i<c-1;i++){
      // hide it
      wrapper.firstChild.style.opacity=0;
      // remove the image element from the div
      wrapper.removeChild(wrapper.firstChild);
    }
  }    
  wrapper.firstChild.style.opacity =	.95// this.self.config.opacity;
  wrapper.firstChild.style.transition = "opacity 1.25s";
  wrapper.firstChild.style.display = "block";    

};
