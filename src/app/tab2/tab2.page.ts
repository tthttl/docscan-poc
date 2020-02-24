import { Component, OnInit, ViewChild } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

@Component({
    selector: 'app-tab2',
    templateUrl: 'tab2.page.html',
    styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit{

    @ViewChild('videoContainer', {static: false}) videoContainer;
    private video: HTMLVideoElement;

    constructor(private platform: Platform, private androidPermissions: AndroidPermissions) {
        this.video = document.createElement('video');
        this.video.width = 640;
        this.video.height = 480;
        this.video.setAttribute('autoplay', '');
    }

    ngAfterViewInit() {
        this.videoContainer.nativeElement.appendChild(this.video);
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
        const constraints = {
            video: true,
            audio: false
        };

        const handleSuccess = (stream: MediaStream) => {
            (<any>window).stream = stream; // make stream available to browser console
            this.video.srcObject = stream;
        };

        const handleError = (error: any) => {
            const p = document.createElement('p');
            p.innerHTML = 'navigator.getUserMedia error: ' + error.name + ', ' + error.message;
            this.videoContainer.nativeElement.appendChild(p);
        };

        navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
    }

  ngOnInit(): void {
  }

}
