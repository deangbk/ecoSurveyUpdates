import { Component, OnInit, AfterViewInit } from '@angular/core';


@Component({
	selector: 'app-menu-bar',
	templateUrl: './menu-bar.component.html',
	styleUrls: ['./menu-bar.component.scss']
})
export class MenuBarComponent implements OnInit {

	constructor() { }
	hover: boolean;
	Overview:number;


	ngOnInit(): void {
	}
}
