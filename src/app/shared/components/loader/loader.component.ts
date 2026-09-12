import {Component, OnInit} from '@angular/core';
import {LoaderService} from "../../services/loader.service";

@Component({
    selector: 'loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

    isShowed: boolean = false

    constructor(private loaderService: LoaderService) {
    }

    ngOnInit(): void {
        this.loaderService.isShowed$.subscribe((value: boolean) => {
            this.isShowed = value
        })
    }

}
