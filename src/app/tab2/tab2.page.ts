import { Component, OnInit, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

const constraints = {
    video: {
        width: {
            min: 1280,
            ideal: 1920,
            max: 2560,
        },
        height: {
            min: 720,
            ideal: 1080,
            max: 1440
        },
        facingMode: 'environment'
    }
};

@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    styleUrls: ['tab2.page.scss']
})
export class Tab2Page{

    @ViewChild('videoContainer', {static: false}) videoContainer;
    private video;
    private stream;

    constructor(private platform: Platform, private androidPermissions: AndroidPermissions) {
        this.video = document.createElement('video');
        this.video.width = 640;
        this.video.height = 480;
        this.video.setAttribute('autoplay', '');
    }

    ngAfterViewInit() {
        this.videoContainer.nativeElement.appendChild(this.video);
    }

    ionViewDidEnter(){
        if (this.platform.is('android')) {
            this.platform.ready().then(async () => {
                try {
                    let isPermissionAvailable = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA);
                    if (isPermissionAvailable) {
                        this.initWebRTC();
                    } else {
                        await this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.CAMERA]);
                        isPermissionAvailable = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA);
                        console.log("permission available: " + isPermissionAvailable);
                        if (isPermissionAvailable) {
                            this.initWebRTC();
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            });
        } else {
            this.initWebRTC();
        }
    }

    initWebRTC() {
        const handleSuccess = (stream: MediaStream) => {
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }
            this.stream = stream;
            this.video.srcObject = this.stream;
        };

        const handleError = (error: any) => {
            const p = document.createElement('p');
            p.innerHTML = 'navigator.getUserMedia error: ' + error.name + ', ' + error.message;
            this.videoContainer.nativeElement.appendChild(p);
        };

        navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
    }

    ionViewDidLeave() {
        if (this.video && this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
        }
    }
}
