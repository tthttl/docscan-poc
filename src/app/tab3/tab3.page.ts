import { Component, OnInit, ViewChild } from '@angular/core';
import adapter from 'webrtc-adapter';


@Component({
    selector: 'app-tab3',
    templateUrl: 'tab3.page.html',
    styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

    @ViewChild('videoContainer', {static: true}) videoContainer;

    video;
    facingMode = "environment";
    constraints = {
        audio: false,
        video: {
            facingMode: this.facingMode
        }
    };

    constructor() {
    }

    ngOnInit(): void {
        this.video = document.createElement('video');
        this.video.style.width = 640 + 'px';
        this.video.style.height = 480 + 'px';
        this.video.setAttribute('autoplay', '');
        this.video.setAttribute('muted', '');
        this.video.setAttribute('playsinline', '');
    }

    play() {
        navigator.mediaDevices.getUserMedia(this.constraints).then((stream) => {
            this.video.srcObject = stream;
        });
        this.videoContainer.nativeElement.appendChild(this.video);
    }

}
