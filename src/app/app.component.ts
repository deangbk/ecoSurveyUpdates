import {Component} from '@angular/core';
import {Chart} from 'chart.js';
import { fontFamily } from 'html2canvas/dist/types/css/property-descriptors/font-family';

//Chart.defaults.global.defaultFontFamily = "'Lucida Sans Unicode'";
Chart.defaults.global.defaultFontFamily = "'CarnacRegular'";
Chart.defaults.global.defaultFontSize = 20;
//Chart.defaults.global.defaultFontColor = "#000000";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{
	constructor() {
		console.log("App start");
  
   // Chart.defaults.font.fontFamily='CarnacRegular';
	}
}
