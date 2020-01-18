var mime = require("mime-types");
var electron=require('electron')
var ngrepeat = true;
var debug=true;

//directive for image loaded event

angular.module("SmartMirror").directive('imageLoaded', function () {
	return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			element.bind("load" , function(e){
				if(debug) {console.log("image loaded")}
				loadHandler(e);
			});
		}
	}
});
var biscope=null;
var timeout = null;
var sservice= null;
var imagecycle = 15*1000;
var timer_handle = null;
angular.module("SmartMirror") //,['ngAnimate']
	.controller("BackgroundImageViewerController",
		function ($scope, $http, $timeout, BackgroundImageViewerService) {

			var atomScreen	= null
			if( electron.screen == undefined )
			{atomScreen = electron.remote.screen}
			else
			{atomScreen = electron.screen}

			var mainScreen =atomScreen.getPrimaryDisplay();
			var dimensions = mainScreen.size;
			var counter = 0;

			if(debug) {console.log("window size w="+dimensions.width+" h="+dimensions.height);}
			$scope.screen= {}
			sw=$scope.screen.width=dimensions.width
			sh=$scope.screen.height=dimensions.height
			biscope=$scope;
			biscope.bk_fill = config.BackgroundImageViewer.fill;
			biscope.biimages=[]
			biscope.biindex=-1;
			// load all the sources images

			timeout= $timeout;

			$scope.$watch('focus', () => {
				// if the new focus is sleep
				if($scope.focus ==='sleep'){
					// hide the current image
					biscope.biimages[biscope.biindex].show=false;
				} 
				else 
				{
				// only after 1st time notice.. initial setting fires watch handler
					if(counter >0){
					// only if no timer running
						if(timer_handle == null) {
							LoadNextImage(BackgroundImageViewerService, biscope);
						}
					}
				}
			})
			sservice = BackgroundImageViewerService;
			imagecycle=config.BackgroundImageViewer.cycle*1000

			let p = BackgroundImageViewerService.loadImages($scope)
			Promise.all(p).then(() =>{
				if(debug) {console.log(" images loaded, start display")}
				biscope.biimages=BackgroundImageViewerService.getImageList();
				biscope.biindex=0;

				LoadNextImage( BackgroundImageViewerService, biscope);
				counter =1;
			}
			);
		}
	);



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


function loadHandler(evt){
	let index= parseInt(evt.currentTarget.id.substring(3));
	let img1 = evt.currentTarget
	biscope.biimages[index].img=img1
	let m = parseInt(window.getComputedStyle(document.body,null).getPropertyValue('margin-top'));
	//if(debug) console.log("image loaded="+img1.src+" size="+img1.width+":"+img1.height);

	if(img1.style.backgroundSize == ""){
		// with the size of this image and it's parent
		// compute the new size and offsets
		let result = ScaleImage(img1.naturalWidth, img1.naturalHeight, sw, sh, true);
		// adjust the image size
		img1.width = result.width;
		img1.height = result.height;

		// adjust the image position
		img1.style.left = result.targetleft+"px";
		img1.style.top = result.targettop+"px";
		//if(debug) console.log("load image info ="+JSON.stringify(result))
	}
	else{
		img1.width = sw;
		img1.height = sh-1;
	}

	img1.style.position="absolute";
	img1.style.opacity = 1;
	img1.style.margin="auto";
	img1.parentElement.style.left="0px";
	img1.parentElement.style.top="0px";
	img1.parentElement.style.width=sw+"px";
	img1.parentElement.style.height=sh+"px";
	if(config.BackgroundImageViewer.fill == false){
		img1.parentElement.style.backgroundColor = config.BackgroundImageViewer.background;
	}
	else{
		img1.parentElement.style.background ="transparent";
		
		let fill_bk=img1.parentElement.parentElement.getElementsByClassName('bgimage')[0]
		
		fill_bk.style['filter']="blur("+config.BackgroundImageViewer.blur+"px)";
		fill_bk.style["-webkit-filter"]="blur("+config.BackgroundImageViewer.blur+"px)";
		fill_bk.style.backgroundImage = "url("+img1.src+")";
		fill_bk.style.height=sh+"px"
		fill_bk.style.width=sw+"px";
		img1.parentElement.style.backgroundColor="rgba(0,0,0,0)"
	}

	//img1.style.backgroundColor="#808080";
	img1.style.transition = "opacity 1.25s";
	biscope.biimages[index].show=true;
	if(index>0) {

		biscope.biimages[index-1].show=false;
		biscope.biimages[index-1].active=false;
		biscope.$apply();
		if(biscope.biimages[index-1].img)
		{biscope.biimages[index-1].img.style="display:none";}
	}

	if(debug) {console.log("imagecycle delay time="+imagecycle)}
	if(timer_handle == null) {
		timer_handle=timeout(() => {
			//if(debug) console.log("timer")
			timer_handle = null;
			LoadNextImage(sservice,biscope)
		}, imagecycle)
	}
	else{
		 if(debug) {console.log("timer handle not null");}
	}
}
function LoadNextImage(service, scope){
	if(debug) {console.log(" starting next image load")}
	// only change images if visual focus is set. ( not sleep, etc)
	if(scope.focus !== 'sleep') {
		// if we reached the end of the list
		if(scope.biindex>=scope.biimages.length){
			scope.biindex=0;
			let p = service.loadImages(scope)
			Promise.all(p).then( () => {
				scope.biimages=service.getImageList();
				// reset to the start again
				if(scope.biindex==scope.biimages.length ){
					scope.biimages[scope.biindex-1].show=false;
					scope.biimages[scope.biindex-1].active=false;
					scope.$apply();
				}
				scope.biindex=0;
				scope.biimages[scope.biindex].active=true;
				scope.biindex++;
				//if(debug) console.log("restart")
			}
			)
		}
		else {
			// if we are on the second or higher
			if(scope.biindex>0){
				// hide the prior image
				scope.biimages[scope.biindex-1].show=false;
				scope.biimages[scope.biindex-1].active=false;
			}
			// show next one, angular active=true will inject the html
			// causing the image load
			scope.biimages[scope.biindex].active=true;
			scope.biindex++;
			if(debug) {console.log("new image ")}
		}
	}
}