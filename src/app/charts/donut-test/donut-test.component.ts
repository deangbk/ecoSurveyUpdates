import { Component, ElementRef, OnInit, OnChanges, Input, ViewChild } from '@angular/core';

import { Chart, ChartColor, ChartConfiguration, ChartData, ChartDataSets, ChartOptions } from "chart.js";

import { BaseChartComponent } from "../base-chart/base-chart.component"

import "chartjs-plugin-piechart-outlabels"

@Component({
  selector: 'app-donut-test',
  templateUrl: './donut-test.component.html',
  styleUrls: ['./donut-test.component.scss']
})
export class DonutTestComponent extends BaseChartComponent {
	//response_Data: ChartData;
	//response_Opt: ChartOptions;
	@Input('outlabel') public outlabel = false;
	@Input('canvasHeight') public canvasHeight = '100vh';
	
	constructor() { 
		super();
	}
	
	layouts = {
		cutoutPercentage: 53,
		responsive: true,
		//maintainAspectRatio: false,
		elements: {
			arc: {
				borderWidth: 3,
				
			},
		},
		layout: {
			padding: {
				top: 150,
				bottom: 50,
			},
			
		},
	}
	public updateChart(): void {
		
		
		this.chart?.destroy();
		this.chart = new Chart(this.chartCtx, {
			type: this.outlabel ? 'outlabeledPie' : 'pie',
			data: this.data,//this.response_Data,
			//options:{...this.response_Opt,...this.layouts}, 
			options: {...this.chartOptions,...this.layouts},
		});
		if(this.canvasHeight){
			this.chart.canvas.style.height = this.canvasHeight;
		}
	}
}
