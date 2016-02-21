(function () {
    var video = document.querySelector('.camera__video'),
        canvas = document.querySelector('.camera__canvas'),
        context = canvas.getContext('2d'),
        back = document.createElement('canvas'),
        backcontext = back.getContext('2d');

    var getVideoStream = function (callback) {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia({video: true},
                function (stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.onloadedmetadata = function (e) {
                        video.play();

                        callback();
                    };
                },
                function (err) {
                    console.log("The following error occured: " + err.name);
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    };

    var applyFilterToPixel = function (pixel) {
        var filters = {
            invert: function (pixel) {
                pixel[0] = 255 - pixel[0];
                pixel[1] = 255 - pixel[1];
                pixel[2] = 255 - pixel[2];

                return pixel;
            },
            grayscale: function (pixel) {
                var r = pixel[0];
                var g = pixel[1];
                var b = pixel[2];
                var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;

                pixel[0] = pixel[1] = pixel[2] = v;

                return pixel;
            },
            threshold: function (pixel) {
                var r = pixel[0];
                var g = pixel[1];
                var b = pixel[2];
                var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 128) ? 255 : 0;
                pixel[0] = pixel[1] = pixel[2] = v;

                return pixel;
            }
        };

        var filterName = document.querySelector('.controls__filter').value;

        return filters[filterName](pixel);
    };

    var applyFilter = function (v,c,bc,w,h) {
        // Отрисуем картинку на фоновом канвасе
        bc.drawImage(v,0,0,w,h);

        // Полуаем информацию о пикселях с фонового канваса
        var idata = bc.getImageData(0,0,w,h);
        var data = idata.data;

        // Накладываем фильтр на пиксели в цикле
        for(var i = 0; i < data.length; i+=4) {
            // var r = data[i];
            // var g = data[i+1];
            // var b = data[i+2];
            // var brightness = (3*r+4*g+b)>>>3;
            // data[i] = brightness;
            // data[i+1] = brightness;
            // data[i+2] = brightness;

            // Инверт
            // var r = 255 - data[i];
            // var g = 255 - data[i + 1];
            // var b = 255 - data[i + 2];
            // data[i] = r;
            // data[i+1] = g;
            // data[i+2] = b;

            // Оттенки серого
            // var r = data[i];
            // var g = data[i + 1];
            // var b = data[i + 2];
            // var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            // data[i] = v;
            // data[i+1] = v;
            // data[i+2] = v;

            // Черно-белый
            // var r = data[i];
            // var g = data[i + 1];
            // var b = data[i + 2];
            // var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 128) ? 255 : 0;
            // data[i] = v;
            // data[i+1] = v;
            // data[i+2] = v;


            // applyFilterToPixel(data);
        }
        idata.data = data;

        // Отрисовываем результат на существующий канвас
        c.putImageData(idata,0,0);
    };

    var captureFrame = function () {
        cw = video.videoWidth;
        ch = video.videoHeight;

        canvas.width = cw;
        canvas.height = ch;

        back.width = cw;
        back.height = ch;

        applyFilter(video,context,backcontext,cw,ch);
    };

    getVideoStream(function () {
        captureFrame();

        // setInterval(captureFrame, 16);
        setInterval(captureFrame, 16);
    });
})();
