import { Component, OnInit, OnChanges, Input, AfterViewInit, ViewChild } from '@angular/core';

import { ChartData, ChartOptions } from "chart.js";

import { Helpers } from "../../../helpers"
import {ColorGeneratorsService} from '../../../Services/color-generators.service';

@Component({
	selector: 'rtemplate-chart-score-mode',
	templateUrl: './template-chart-score-mode.component.html',
	styleUrls: ['./template-chart-score-mode.component.scss']
})
export class TemplateChartScoreModeComponent implements OnInit, OnChanges, AfterViewInit {
	
	viewInit = false;
	
	@Input('title') title: string = "";
	@Input('data') data: number[];
	
	c_data: ChartData;
	c_opt: ChartOptions;
	
	constructor(private colorGen:ColorGeneratorsService) { }
	
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
		
		//console.log('rtemplate-chart-score-mode: ', this.data);
		
		var dataMin = Math.min(...this.data);
		var dataMax = Math.max(...this.data);
		var dataRange = dataMax - dataMin;
		
		var dispMin = Helpers.floor_base(Math.max(0, dataMin - dataRange * 0.15), 10);
		var dispMax = Helpers.ceil_base(dataMax + dataRange * 0.3, 10);
		
		/*
		// :(
		var colors: string[] = [
			'rgb(224, 16, 16)',
			'rgb(253, 153, 8)',
			'rgb(253, 207, 8)',
			'rgb(141, 224, 8)',
			'rgb(16, 224, 16)',
		];
		*/
		var colors = this.colorGen.generateBarColors(this.data, "mode");//this.createColor(this.data);
		
		this.c_data = {
			labels: ['1', '2', '3', '4', '5'],
			datasets: [
				{
					data: this.data,
					backgroundColor: colors,
					barThickness: 40,
				}
			],
		};
		this.c_opt = {
			plugins: {
				datalabels: {
					anchor: "end",
					align: "end",
					/*font: {
						size: 28,
					},*/
				},
				
			},
			legend: {
				display: false
			},
			scales: {
				yAxes: [{
					gridLines: {
						color: "rgba(0, 0, 0, 0)",
					},
					ticks: {
						beginAtZero: true,
						suggestedMax: dataMax + dataRange * 0.12,
					}
				}],
			}
		};
	}
	
	createColor(array: number[]) {
		var barColors = Helpers.generateBarColors(array);
		
		var colors = array.map(_ => "rgb(160, 255, 87)");
		barColors.mins.forEach((x: number) => colors[x] = "rgb(230, 0, 0)");
		barColors.maxs.forEach((x: number) => colors[x] = "rgb(0, 176, 80)");
		
		return colors;
	}
}
