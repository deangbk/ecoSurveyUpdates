import { Component, OnInit, OnChanges, Input, AfterViewInit, ViewChild } from '@angular/core';

import { ChartData, ChartOptions } from "chart.js";
import { Context } from 'chartjs-plugin-datalabels';

import { Helpers } from "../../../helpers"

import { AppConfig } from '../../../config';

@Component({
	selector: 'rtemplate-chart-verti-bars',
	templateUrl: './template-chart-verti-bars.component.html',
	styleUrls: ['./template-chart-verti-bars.component.scss']
})
export class TemplateChartVertiBarsComponent implements OnInit, OnChanges, AfterViewInit {
	
	viewInit = false;
	
	@Input('title') title: string = "";
	
	@Input('data') data: number[];
	@Input('labels') labels: string[];
	@Input('colors') colors: string[] | string = null;
	
	@Input('size') thickness: number = 25;
	@Input('c-height') canvasHeight: string = "";
	
	@Input('pad') padding: number = 64;
	
	c_data: ChartData;
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

		//console.log('rtemplate-chart-verti-bars: ' + this.data);
		
		let actualColors: string[];
		if (this.colors == null)
			actualColors = this.createColor(this.data);
		else {
			if (Array.isArray(this.colors))
				actualColors = this.colors;
			else
				actualColors = Array(this.data.length).fill(this.colors);
		}
		//console.log(this.colors, actualColors);
		
		this.c_data = {
			labels: this.labels,
			datasets: [{
				data: this.data,
				backgroundColor: actualColors,
				barThickness: this.thickness,
			}],
		};
		this.c_opt = {
			plugins: {
				datalabels: {
					anchor: "end",
					align: "end",
					formatter: (x: number, ctx: Context) => x.toFixed(AppConfig.decPlaces) + '%',
				},
			},
			legend: {
				display: false
			},
			//	maintainAspectRatio: false,
			//	responsive:true,
			scales: {
				yAxes: [{
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
			},
			tooltips: {
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
