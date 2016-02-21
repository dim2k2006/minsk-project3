(function () {
    var video = document.querySelector('.camera__video'),
        canvas = document.querySelector('.camera__canvas'),
        context = canvas.getContext('2d'),
        back = document.createElement('canvas'),
        backcontext = back.getContext('2d'),
        attempt = 0;

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

                    if (attempt < 5) {
                        attempt = attempt + 1;

                        setTimeout(function() {
                            console.log('Video stream launch attempt: ' + attempt);

                            getVideoStream(callback);
                        }, 1000);
                    }
                }
            );
        } else {
            console.log("getUserMedia not supported");
        }
    };

    var applyFilterToPixel = function (data) {
        var filterName = document.querySelector('.controls__filter').value,
            r = '',
            g = '',
            b = '',
            v = '',
            i = 0;

        if (filterName === 'invert') {
            for(i; i < data.length; i+=4) {
                // Инверт
                r = 255 - data[i];
                g = 255 - data[i + 1];
                b = 255 - data[i + 2];
                data[i] = r;
                data[i+1] = g;
                data[i+2] = b;
            }
        }

        if (filterName === 'grayscale') {
            for(i; i < data.length; i+=4) {
                // Оттенки серого
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];
                v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                data[i] = v;
                data[i+1] = v;
                data[i+2] = v;
            }
        }

        if (filterName === 'threshold') {
            for(i; i < data.length; i+=4) {
                // Черно-белый
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];
                v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 128) ? 255 : 0;
                data[i] = v;
                data[i+1] = v;
                data[i+2] = v; 
            }
        }

        return data;
    };

    var applyFilter = function (v,c,bc,w,h) {
        // Отрисуем картинку на фоновом канвасе
        bc.drawImage(v,0,0,w,h);

        // Полуаем информацию о пикселях с фонового канваса
        var idata = bc.getImageData(0,0,w,h);
        var data = idata.data;

        // Накладываем фильтр на изображение
        idata.data = applyFilterToPixel(data);

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

        setInterval(captureFrame, 16);
    });
})();
