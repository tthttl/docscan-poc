import { Component, OnInit, ViewChild } from '@angular/core';


export interface CapturedImage {
    readonly name: string
    readonly src: string,
}

@Component({
    selector: 'app-tab3',
    templateUrl: 'tab3.page.html',
    styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

    @ViewChild('captureInput', {static: true}) captureInput;
    images: CapturedImage[] = [];

    constructor() {
    }

    onChange() {
        for (let image of this.captureInput.nativeElement.files) {
            this.images.push({
                name: this.createName(image.name, (this.images.length + 1)),
                src: window.URL.createObjectURL(image)
            });
        }
    }

    private createName(name: string, num: number): string {
        const nameArr = name.split('.');
        return nameArr[0] + '-' + num + '.' + nameArr[1];
    }

}
