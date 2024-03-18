import { Component, OnInit, OnChanges, Input, AfterViewInit, ViewChild } from '@angular/core';

import { ChartData, ChartDataSets, ChartOptions, TickOptions } from "chart.js";
import { Context } from 'chartjs-plugin-datalabels';

import { Helpers } from "../../../helpers"

import { AppConfig } from '../../../config';

export interface ChartPercentBar_Data {
	percent: number[][],
	numeric: number[][],
}

@Component({
	selector: 'rtemplate-chart-percent-bars',
	templateUrl: './template-chart-percent-bars.component.html',
	styleUrls: ['./template-chart-percent-bars.component.scss']
})
export class TemplateChartPercentBarsComponent implements OnInit, OnChanges, AfterViewInit {

	viewInit = false;
	
	colorsDefault: string[] = [
		'rgb(255, 48, 48)',
		'rgb(253, 153, 8)',
		'rgb(253, 207, 8)',
		'rgb(141, 224, 8)',
		'rgb(16, 224, 16)',
	];

	@Input('title') title: string = "";
	@Input('data') data: ChartPercentBar_Data;
	@Input('labels') labels: string[];
	@Input('colors') colors: string[] = this.colorsDefault;
	
	@Input('size') thickness: number = 30;
	@Input('cv-height') canvasHeight: number = 1700;

	c_data: ChartData;
	c_opt: ChartOptions;

	c_canvasSize: string = "1700px";

	constructor() { }

	ngOnInit(): void {
	}
	ngAfterViewInit() {
		this.viewInit = true;
	}
	
	ngOnChanges(): void {
		this.c_canvasSize = this.canvasHeight + "px";
		
		this.refreshChart();
	}

	async refreshChart() {
		if (this.data == null) return;
		await Helpers.waitUntil(() => this.viewInit);
		
		//console.log('rtemplate-chart-percent-bars: ' + this.data);
		
		const datasetLabels: string[] = [
			"Strongly Disagree",
			"Disagree",
			"Neutral",
			"Agree",
			"Strongly Agree",
		];
		
		var datasets: ChartDataSets[] = [...Array(5)].map((_, i: number) => ({

			label: datasetLabels[i],
			data: this.data.percent[i],
			//data: [20, 30, 20, 10, 20],
			backgroundColor: this.colors[i],
			barThickness: this.thickness,
		}));
		
		var ticks = [...Array(11)].map((_, i: number) => i * 10);
		var tickOption: TickOptions = {
			min: 0,
			max: 100,
			stepSize: 10,
			callback: (value: number, index: number, values: any) => value + '%',
		};
		
		this.c_data = {
			labels: this.labels,
			datasets: datasets,
		};
		this.c_opt = {
			plugins: {
				datalabels: {
					anchor: "center",
					align: "center",
					formatter: (x: number[][], ctx: Context) =>
						('' + this.data.numeric[ctx.datasetIndex][ctx.dataIndex]),
					//formatter: (x: number, ctx: Context) => x.toFixed(1) + '%',
					/*font: {
						size: 18,
					}*/
				},
			},
			legend: {
				display: true,
				position: "bottom",
			},
			maintainAspectRatio: false,
			responsive: true,
			scales: {
				xAxes: [
					{
						gridLines: {
							display: true,
						},
						position: "top",
						ticks: tickOption,
						stacked: true,
					},
					/* // :spite:
					{
						gridLines: {
							display: false,
						},
						position: 'top',
						ticks: tickOption,
						afterBuildTicks: (scale, title) => {
							return ticks;
						},
					}
					*/
				],
				yAxes: [{
					stacked: true,
				}]
			},
			tooltips: {
				enabled: false,
			}
		};
	}
}
