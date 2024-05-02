import { Component, OnInit, OnChanges, Input, AfterViewInit, ViewChild } from '@angular/core';

import { ChartData, ChartOptions, TickOptions } from "chart.js";
import { Context } from 'chartjs-plugin-datalabels';

import { Helpers } from "../../../helpers"

import { AppConfig } from '../../../config';
import {ColorGeneratorsService} from '../../../Services/color-generators.service';

@Component({
	selector: 'app-template-chart-hori-questions',
	templateUrl: './template-chart-hori-questions.component.html',
	styleUrls: ['./template-chart-hori-questions.component.scss']
})
export class TemplateChartHoriQuestionsComponent implements OnInit, OnChanges, AfterViewInit {
	
	viewInit = false;
	
	@Input('title') title: string = "";
	@Input('data') data: number[];
	@Input('labels') labels: string[];
	@Input('colors') colors: string[] | string = AppConfig.primaryColour;
	
	@Input('size') thickness: number = 25;
	@Input('cv-height') canvasHeight: number = 1500;
	@Input('pad') padding: number = 74;
	
	c_data: ChartData;
	c_opt: ChartOptions;
	
	c_canvasSize: string = "1500px";
	
	constructor(private colorGen:ColorGeneratorsService) { }
	
	ngOnInit(): void {
	}
	ngAfterViewInit() {
		this.viewInit = true;
	}
	
	ngOnChanges(): void {
		//console.log('rtemplate-chart-hori-questions: ' + this.data);
		this.c_canvasSize = this.canvasHeight + "px";
		
		this.refreshChart();
	}

	async refreshChart() {
		if (this.data == null) return;
		await Helpers.waitUntil(() => this.viewInit);
		
		var ticks = [...Array(6)].map((_, i: number) => i * 20);
		var tickOption: TickOptions = {
			min: 0,
			max: 100,
			stepSize: 20,
			callback: (value: number, index: number, values: any) => value + '%',
		};
		
		this.colors = this.colorGen.generateBarColors(this.data, "normal");
		this.c_data = {
			labels: this.labels,
			datasets: [{
				data: this.data,
				backgroundColor: this.colors,
				barThickness: this.thickness,
			}],
		};
		this.c_opt = {
			plugins: {
				datalabels: {
					anchor: "end",
					align: "end",
					formatter: (x: number, ctx: Context) => x.toFixed(AppConfig.decPlaces) + '%',
					/*font: {
						size: 18,
					}*/
				},
			},
			layout: {
				padding: {
					right: this.padding,
				}
				
			},

			legend: {
				display: false
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
