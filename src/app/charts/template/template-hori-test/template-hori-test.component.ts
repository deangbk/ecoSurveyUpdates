import { Component, OnInit, OnChanges, Input, AfterViewInit, ViewChild } from '@angular/core';

import { ChartData, ChartOptions } from "chart.js";
import { Context } from 'chartjs-plugin-datalabels';

import { Helpers } from "../../../helpers"

import { AppConfig } from '../../../config';

@Component({
  selector: 'app-template-hori-test',
  templateUrl: './template-hori-test.component.html',
  styleUrls: ['./template-hori-test.component.scss']
})
export class TemplateHoriTestComponent implements OnInit, OnChanges, AfterViewInit {

 
	viewInit = false;
	
	@Input('title') title: string = "";
	
	@Input('data') data: ChartData;
	@Input('labels') labels: string[];
	@Input('colors') colors: string[] | string = AppConfig.primaryColour;
	
	@Input('size') thickness: number = 30;
	@Input('c-height') canvasHeight: string = "";
	
	@Input('pad') padding: number = 64;
	//@Input('horizontal') hBar: boolean=false;
	
	c_data: ChartData;
	horizontal: boolean;
	c_opt: ChartOptions;
	
	
	constructor() { }
	
	ngOnInit(): void {
	}
	ngAfterViewInit() {
		this.viewInit = true;
	}

	ngOnChanges(): void {
		this.refreshChart();
	}
	async refreshChart() {
		if (this.data == null) return;
		await Helpers.waitUntil(() => this.viewInit);
		
		//console.log('rtemplate-chart-hori-bars: ' + this.data);
		let actualColors: string[];
	//	if (this.colors == null)
			//actualColors = this.createColor(this.data);
		//else {
		//	actualColors = this.createColor(this.data);
		
		//	if (Array.isArray(this.colors))
		//		actualColors = this.colors;
		//	else
		//		actualColors = Array(this.data.length).fill(this.colors);
	//	}
		
		this.c_data = this.data;
  //   {
	// 		labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7'],
  //     datasets: [{
  //       barPercentage: 0.8,
  //       maxBarThickness: 30,
  //       minBarLength: 2,
  //       data: [10, 20, 30, 40, 50, 60, 70]
  //   },
  //   {
  //     barPercentage: 0.8,     
  //     maxBarThickness: 30,
  //     minBarLength: 2,
  //     data: [10, 4, 16,70, 60, 20, 50]
  // }] 	 }


			//datasets: [{
			//	data: this.data,
			//	backgroundColor: actualColors,
			//	barThickness: this.thickness,
		//	 }
			// {
			// 	data: [54,76],
			// 	backgroundColor: actualColors,
			// 	barThickness: this.thickness,
			// },
	//	]};
		this.c_opt = {
			plugins: {
				datalabels: {
					anchor: "end",
					align: "end",
					formatter: (x: number, ctx: Context) => x.toFixed(AppConfig.decPlaces) + '%',
				},
			},
			legend: {
				display: true,
				position: 'bottom',
			},
		//	maintainAspectRatio: false,
		//	responsive:true,
			scales: {
				xAxes: [{
					gridLines: {
						display: true,
					},
					ticks: {
						min: 0,
						max: 100,
						stepSize: 20,
						callback: (value: number, index: number, values: any) => (value + '%'),
						maxRotation: 0,
					},
				}],
				yAxes: [{
					stacked: false,
				}]
			},
			tooltips: {
				/*
				callbacks: {
					label: function(tooltipItem, data) {
						//var label = data.labels[tooltipItem.index];
						var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
						return value + '%';
					}
				},
				*/
				enabled: false,
			},
			layout: {
				padding: {
					right: this.padding,
				}
			}
		
		};
	
	}

	createColor(array: number[]) {
		var barColors = Helpers.generateBarColors(array);
		
		// Initialize everything to gray
		var colors = array.map(_ => "rgb(25, 140, 210)"); 
		
		// Assign min bars
		barColors.mins.forEach((x: number) => colors[x] = "rgb(255, 50, 50)");
		
		// Assign max bars
		barColors.maxs.forEach((x: number) => colors[x] = "rgb(0, 190, 80)");
		
		return colors;
	}
}
