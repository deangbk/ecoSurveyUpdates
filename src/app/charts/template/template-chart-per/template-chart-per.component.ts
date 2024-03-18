import { Component, OnInit, OnChanges, Input, AfterViewInit, ViewChild } from '@angular/core';

import { ChartData, ChartOptions } from "chart.js";
import { Context } from 'chartjs-plugin-datalabels';

import { Helpers } from "../../../helpers"

import { AppConfig } from '../../../config';

@Component({
  selector: 'app-template-chart-per',
  templateUrl: './template-chart-per.component.html',
  styleUrls: ['./template-chart-per.component.scss']
})
export class TemplateChartPerComponent implements OnInit, OnChanges, AfterViewInit {
  @Input('title') title: string = "";
	@Input('data') data: number[][];
	@Input('labels') labels: string[];
	@Input('colors') colors: string[] | string = AppConfig.primaryColour;
  constructor() { }
  viewInit = false;
	
	c_data: ChartData;
	c_opt: ChartOptions;
  ngOnInit(): void {
  }
  ngOnChanges(): void {
		//console.log('rtemplate-chart-hori-questions: ' + this.data);
		this.refreshChart();
	}

  ngAfterViewInit() {
		this.viewInit = true;
	}
  
  async refreshChart(){
		if (this.data == null) return;
    await Helpers.waitUntil(() => this.viewInit);
    //console.log(this.labels)
		
		this.c_data = {
			labels: this.labels,
			datasets: [{
        
          label: "Strongly Disagree",
       //   data: [23, 44, 65],
          backgroundColor: "rgba(255, 0, 0, 0.6)",
				data: this.data[0],
			//	backgroundColor: this.colors,
			//	barThickness: 20,
			},
      {
        label: "Disagree",
        data: this.data[1],//data: [73, 44, 25],
        backgroundColor: "rgba(255, 127, 0, 0.6)",
      },
      {
        label: "Neutral",
        data: this.data[2],// data: [73, 44, 25],
        backgroundColor: "rgba(255, 255, 0, 0.6)",
      },
      {
        label: "Agree",
        data: this.data[3],// data: [73, 44, 25],
        backgroundColor: "rgba(0, 255, 0, 0.6)",
      },
      {
        label: "Strongly Agree",
        data: this.data[4],// data: [73, 44, 25],
        backgroundColor: "rgba(0, 127, 0, 0.6)",
      },
    ],
		};
		this.c_opt = {
			// plugins: {
			// 	datalabels: {
			// 		anchor: "end",
			// 		align: "end",
			// 		formatter: (x: number, ctx: Context) => x.toFixed(2) + '%',
			// 	},
			//},
			legend: {
				display: true,
				position: "bottom",
				labels: {
					padding: 20,
				},
			},
      	maintainAspectRatio: false,
			responsive:true,
			scales: {
				xAxes: [{
					gridLines: {
						display: true,
					},
					ticks: {
						min: 0,
						max: 100,
						stepSize: 20,
						callback: (value: number) => value + "%",
					},
					position: "top",
				}],
				yAxes: [{
					stacked: true
				}]
			},
      plugins: {
        datalabels: {
          display: false,
        },
        stacked100: { enable: true },
      },
		};
	}
}


