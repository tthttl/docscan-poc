import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {

    constructor(private platform: Platform) {
    }

    // The width and height of the captured photo. We will set the
    // width to the value defined here, but the height will be
    // calculated based on the aspect ratio of the input stream.

    width = 320;    // We will scale the photo width to this
    height = 0;     // This will be computed based on the input stream

    // |streaming| indicates whether or not we're currently streaming
    // video from the camera. Obviously, we start at false.

    streaming = false;
    video;
    canvas;
    photo;
    startbutton;
    stream: MediaStream;

    ngOnInit(): void {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.photo = document.getElementById('photo');
        this.startbutton = document.getElementById('startbutton');
    }

    ionViewDidEnter() {
        this.startup();
    }

    setSize() {
        if (!this.streaming) {
            this.height = this.video.videoHeight / (this.video.videoWidth / this.width);

            // Firefox currently has a bug where the height can't be read from
            // the video, so we will make assumptions if this happens.

            if (isNaN(this.height)) {
                this.height = this.width / (4 / 3);
            }

            this.video.setAttribute('width', this.width);
            this.video.setAttribute('height', this.height);
            this.canvas.setAttribute('width', this.width);
            this.canvas.setAttribute('height', this.height);
            this.streaming = true;
        }
    }

    // Capture a photo by fetching the current contents of the video
    // and drawing it into a canvas, then converting that to a PNG
    // format data URL. By drawing it on an offscreen canvas and then
    // drawing that to the screen, we can change its size and/or apply
    // other changes before drawing it.

    takepicture() {
        const context = this.canvas.getContext('2d');
        if (this.width && this.height) {
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            context.drawImage(this.video, 0, 0, this.width, this.height);
            const data = this.canvas.toDataURL('image/png');
            this.photo.setAttribute('src', data);
        } else {
            this.clearphoto();
        }
    }

    ionViewDidLeave() {
        if (this.video && this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
        }
    }

    private async startup() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (!this.platform.is('ios') && !this.platform.is('android')) {
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
                this.video.srcObject = this.stream;
                this.video.play();
            } catch (err) {
                console.log("An error occurred: " + err);
            }
        }
        this.clearphoto();
    }

    // Fill the photo with an indication that none has been
    // captured.

    private clearphoto() {
        const context = this.canvas.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const data = this.canvas.toDataURL('image/png');
        this.photo.setAttribute('src', data);
    }


}
