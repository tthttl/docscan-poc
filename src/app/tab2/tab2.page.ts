import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Platform } from '@ionic/angular';
import { ImageCapture } from 'image-capture';

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

declare const cordova: any;

@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements AfterViewInit {

    @ViewChild('video', {static: false}) video;
    @ViewChild('canvas', {static: false}) canvas;
    @ViewChild('photo', {static: false}) photo;
    width = 320;
    height = 0;
    isStreaming = false;
    stream: MediaStream;
    imageCapture: ImageCapture;

    constructor(
        private platform: Platform,
        private androidPermissions: AndroidPermissions) {
    }

    ngAfterViewInit(): void {
        this.photo.nativeElement.setAttribute('crossorigin', 'anonymus'); //might cause a problem on iOS if missing..
        if (this.platform.is('cordova')) {
            cordova.plugins.iosrtc.registerGlobals(); //adding the missing mediaDevices object to navigator on iOS
        }
    }

    ionViewDidEnter() {
        this.platform.ready().then(async () => {
            await this.getPermissionForCamera();
            await this.initialize();
        });
    }

    private async getPermissionForCamera() {
        if (this.platform.is('android')) {
            try {
                let permissionResponse = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA);
                if (!permissionResponse.hasPermission) {
                    await this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.CAMERA]);
                }
            } catch (error) {
                console.log(error);
            }
        }
        if (this.platform.is('ios')) {
            await cordova.plugins.iosrtc.requestPermission(false, true, (isApproved) =>
                console.log('requestPermission status: ', isApproved ? 'Approved' : 'Rejected')
            );
        }
    }

    setSize() {
        if (!this.isStreaming) {
            this.height = this.video.nativeElement.videoHeight / (this.video.nativeElement.videoWidth / this.width);
            if (isNaN(this.height)) {
                this.height = this.width / (4 / 3);
            }
            this.video.nativeElement.setAttribute('width', this.width.toString());
            this.video.nativeElement.setAttribute('height', this.height.toString());
            this.canvas.nativeElement.setAttribute('width', this.width.toString());
            this.canvas.nativeElement.setAttribute('height', this.height.toString());
            this.isStreaming = true;
        }
    }

    play() {
        this.video.nativeElement.srcObject = this.stream;
        this.video.nativeElement.play();
        this.isStreaming = true;
    }

    stop() {
        this.stopTracks();
        this.isStreaming = false;
        this.initialize();
    }

    snap() {
        const ctx = this.canvas.nativeElement.getContext('2d');
        const image = new Image();
        image.onload = function () {
            ctx.drawImage(this, 0, 0);
        };
        cordova.plugins.CameraStream.capture = function (data) {
            image.src = data;
        };
        cordova.plugins.CameraStream.startCapture('front');
        // TODO: Fix Plugin: CameraStream.swift & CameraStream.js

     /*   if (this.isStreaming) {
            this.imageCapture.takePhoto()
                .then((blob: Blob) => this.photo.nativeElement.setAttribute('src', URL.createObjectURL(blob)))
                .catch(error => console.error(error));
        }*/
    }

    ionViewDidLeave() {
        this.stopTracks();
    }

    private async initialize() {
        try {
            this.stopTracks();
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.imageCapture = new ImageCapture(this.stream.getVideoTracks()[0]);
            this.clearphoto();
        } catch (error) {
            console.error('Error at startup: ' + error.message);
        }
    }

    private clearphoto() {
        const context = this.canvas.nativeElement.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        const data = this.canvas.nativeElement.toDataURL('image/png');
        this.photo.nativeElement.setAttribute('src', data);
    }

    private stopTracks() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            //this.video.nativeElement.srcObject = this.stream;
            this.isStreaming = false;
        }
    }

}
