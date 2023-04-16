angular
	.module("SmartMirror")
	.factory("BackgroundImageViewerService", function ($http, $interval) {
		var enabledTypes = ["image/jpeg", "image/png", "image/gif"];
		var biservice = {};
		var imageIndex = -1;
		var images = [];

		const getShuffledArr = (arr) => {
			const newArr = arr.slice();
			for (let i = newArr.length - 1; i > 0; i--) {
				const rand = Math.floor(Math.random() * (i + 1));
				[newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
			}
			return newArr;
		};

		function getImages(path) {
			if (debugbk) console.log("looking for images in" + path);
			let p = new Promise((resolve, reject) => {
				try {
					fs.readdir(path, function (error, files) {
						let filelist = [];
						if (error == null) {
							for (file of files) {
								let f = path + "/" + file;
								if (!fs.statSync(f).isDirectory()) {
									let type = mime.lookup(file);
									if (
										type !== false &&
										enabledTypes.indexOf(type) >= 0
									) {
										filelist.push({
											file: f,
											show: false,
											active: false,
											lastused: 0,
										});
									}
								}
							}
						}
						resolve(filelist);
					});
				} catch (error) {
					if (error == "EHOSTDOWN") {
						reject();
					}
				}
			});
			return p;
		}

		// load all images from all sources into one list
		biservice.loadImages = function (scope) {
			if (debugbk) console.log("get next image list");
			let promises = [];
			images = [];
			// loop thru the sources
			for (var source of config.backgroundImage.sources) {
				let p = new Promise((resolve, reject) => {
					let path =
						__dirname +
						"/plugins" +
						"/backgroundImage/" +
						source.path;
					// get the images for this source
					//console.log("getting images from path="+path+" source="+source)
					getImages(path).then((imagelist) => {
						// save the source images to the main list
						images = images.concat(imagelist);
						// restart the list at the beginning
						source.index = 0;
						imageIndex = 0;
						// indicate we are done for this source
						resolve();
					});
				});
				promises.push(p);
			}
			return promises;
		};
		// get next image from the list
		biservice.next = function (scope) {
			if (debugbk) console.log("get next image from list");
			var promise = new Promise((resolve, reject) => {
				// if we have more images
				if (imageIndex >= 0 && imageIndex < images.length) {
					// return next
					resolve(images[imageIndex++]);
				} else {
					if (debugbk) console.log("load list");
					// no more images
					images = [];
					imageIndex = -1;
					// refresh the list
					var p = service.loadImages(scope);
					Promise.all(p).then(() => {
						service.getImageList();
						imageIndex = 0;
						// return next image
						resolve(images[imageIndex++]);
					});
				}
			});
			//return promise;
		};
		biservice.getImageList = function () {
			// if shuffle is requested
			if (config.backgroundImage.shuffle) {
				// shuffle the list
				images = getShuffledArr(images);
			}
			return images;
		};
		return biservice;
	});
