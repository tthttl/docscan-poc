import { Component, OnInit, ViewChild } from '@angular/core';
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
    }
};

@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    styleUrls: ['tab2.page.scss']
})
export class Tab2Page{

    @ViewChild('videoContainer', {static: true}) videoContainer;
    private video;
    private stream;

    constructor(private platform: Platform, private androidPermissions: AndroidPermissions) {
        this.video = document.createElement('video');
        this.video.width = 320;
        this.video.height = 240;
        this.video.setAttribute('autoplay', '');
    }

    ngAfterViewInit() {
        this.videoContainer.nativeElement.appendChild(this.video);
    }

    ionViewDidEnter(){
        if (this.platform.is('android')) {
            this.platform.ready().then(async () => {
                try {
                    let permissionResponse = await this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA);
                    if (!permissionResponse.hasPermission) {
                        await this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.CAMERA]);
                    }
                } catch (error) {
                    console.log(error);
                }
            });
        }
    }

    play(){
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => this.handleSuccess(stream))
            .catch(error => this.handleError(error));
    }

    handleSuccess (stream: MediaStream) {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        this.stream = stream;
        this.video.srcObject = this.stream;
    };

    handleError (error: any) {
        console.log(error);
        const p = document.createElement('p');
        p.innerHTML = 'navigator.getUserMedia error: ' + error.name + ', ' + error.message;
        this.videoContainer.nativeElement.appendChild(p);
    };

    ionViewDidLeave() {
        if (this.video && this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
        }
    }
}
