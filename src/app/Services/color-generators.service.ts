import { Injectable } from '@angular/core';
import { Helpers } from '../helpers';
import { AppConfig } from '../config';

@Injectable({
  providedIn: 'root'
})
export class ColorGeneratorsService {

  constructor() { }

  //// this gets the top value and displays it as green, the bottom as red --- inject different colour profiles alter
  private  createColor(array: number[], colourStandard:any) {

    //var barColors = Helpers.generateBarColors(array);
var maxValue = Math.max(...array);
var minValue = Math.min(...array);

    
    // Initialize everything to gray
  //  var colors = array.map(_ => "rgb(25, 140, 210)"); 
  var colors = array.map(_ => colourStandard.primary);

    ///in the future add rounding based on what is decided check this
    var maxIndices = array.map((value, index) => {
      return Number(value.toFixed(AppConfig.decPlaces)) === Number(maxValue.toFixed(AppConfig.decPlaces)) ? index : -1;
    }).filter(index => index !== -1);

    var minIndices = array.map((value, index) => {
      return Number(value.toFixed(AppConfig.decPlaces)) === Number(minValue.toFixed(AppConfig.decPlaces)) ? index : -1;
    }).filter(index => index !== -1);
    
    // Assign min bars
    minIndices.forEach((x: number) => colors[x] = colourStandard.min);
    
    // Assign max bars
    maxIndices.forEach((x: number) => colors[x] = colourStandard.max);
   // barColors.maxs.forEach((x: number) => colors[x] = "rgb(0, 190, 80)");
    
    return colors;
  }

 public generateBarColors(array: number[], colorType: string = "normal") {
    // Your logic to generate bar colors goes here
    var colourStandard={primary: 'rgb(25, 140, 210)',max: 'rgb(0, 190, 80)',min: 'rgb(255, 50, 50)'};
    if (colorType === "normal") {
      colourStandard=AppConfig.barColours;
    } else if (colorType === "mode") {
      colourStandard=AppConfig.modeColours;
    } else {
     // return this.generateBarColors(array);
    }

    return this.createColor(array,colourStandard)
  }
}
