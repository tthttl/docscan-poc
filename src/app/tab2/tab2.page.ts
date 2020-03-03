import { Component, OnInit, ViewChild } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Platform } from '@ionic/angular';

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
export class Tab2Page {


    @ViewChild('video', {static: false}) video;
    @ViewChild('canvas', {static: false}) canvas;
    @ViewChild('photo', {static: false}) photo;
    width = 320;
    height = 0;
    streaming = false;
    stream: MediaStream;

    constructor(
        private platform: Platform,
        private androidPermissions: AndroidPermissions) {
    }

    ionViewDidEnter() {
        this.photo.nativeElement.setAttribute('crossorigin', 'anonymus');
        this.platform.ready().then(async () => {
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
                cordova.plugins.iosrtc.registerGlobals();
                await cordova.plugins.iosrtc.requestPermission(false, true, (isApproved) =>
                    console.log('requestPermission status: ', isApproved ? 'Approved' : 'Rejected')
                );
            }
            await this.startup();
            this.setSize();
        });
    }

    setSize() {
        if (!this.streaming) {
            this.height = this.video.nativeElement.videoHeight / (this.video.nativeElement.videoWidth / this.width);
            if (isNaN(this.height)) {
                this.height = this.width / (4 / 3);
            }
            this.video.nativeElement.setAttribute('width', this.width.toString());
            this.video.nativeElement.setAttribute('height', this.height.toString());
            this.canvas.nativeElement.setAttribute('width', this.width.toString());
            this.canvas.nativeElement.setAttribute('height', this.height.toString());
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
            console.log(data);
            this.photo.nativeElement.setAttribute('src', data)
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
        this.stopTracks();
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

    private stopTracks() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.streaming = false;
        }
    }


}
