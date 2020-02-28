import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

const constraints = {
    video: {
        width: {
            ideal: 1920,
            max: 2560,
        },
        height: {
            ideal: 1080,
            max: 1440
        },
        facingMode: 'environment'
    },
    audio: false
};

@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements AfterViewInit {

    @ViewChild('video', {static: true}) video;
    @ViewChild('canvas', {static: true}) canvas;
    @ViewChild('photo', {static: true}) photo;
    width = 320;
    height = 0;
    streaming = false;
    stream: MediaStream;

    constructor(private platform: Platform, private androidPermissions: AndroidPermissions) {
    }

    ngAfterViewInit(): void {
        this.video.nativeElement.width = 320;
        this.video.nativeElement.height = 240;
        this.video.nativeElement.setAttribute('autoplay', '');
    }

    ionViewDidEnter() {
        if (this.platform.is('android')) {
            this.platform.ready().then(async () => {
                try {
                    let permissionResponse = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA);
                    if (!permissionResponse.hasPermission) {
                        await this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.CAMERA]);
                    }
                    this.startup();
                } catch (error) {
                    console.log(error);
                }
            });
        }
    }

    setSize() {
        if (!this.streaming) {
            this.height = this.video.videoHeight / (this.video.videoWidth / this.width);
            if (isNaN(this.height)) {
                this.height = this.width / (4 / 3);
            }
            this.video.nativeElement.setAttribute('width', this.width);
            this.video.nativeElement.setAttribute('height', this.height);
            this.canvas.nativeElement.setAttribute('width', this.width);
            this.canvas.nativeElement.setAttribute('height', this.height);
            this.streaming = true;
        }
    }

    takepicture() {
        const context = this.canvas.nativeElement.getContext('2d');
        if (this.width && this.height) {
            this.canvas.nativeElement.width = this.width;
            this.canvas.nativeElement.height = this.height;
            context.drawImage(this.video.nativeElement, 0, 0, this.width, this.height);
            const data = this.canvas.nativeElement.toDataURL('image/png');
            this.photo.nativeElement.setAttribute('src', data);
        } else {
            this.clearphoto();
        }
    }

    ionViewDidLeave() {
        if (this.video.nativeElement && this.video.nativeElement.srcObject) {
            this.video.nativeElement.srcObject.getTracks().forEach(track => track.stop());
        }
    }

    private async startup() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        try {
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.nativeElement.srcObject = this.stream;
            this.video.nativeElement.play();
        } catch (err) {
            console.log("An error occurred: " + err);
        }
        this.clearphoto();
    }

    private clearphoto() {
        const context = this.canvas.nativeElement.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        const data = this.canvas.nativeElement.toDataURL('image/png');
        this.photo.nativeElement.setAttribute('src', data);
    }
}
