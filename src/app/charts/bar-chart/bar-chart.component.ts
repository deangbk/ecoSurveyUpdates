import { Component, ElementRef, ViewChild, OnInit, OnChanges, Input } from '@angular/core';

import { Chart, ChartColor, ChartConfiguration, ChartData, ChartDataSets, ChartOptions } from "chart.js";

import { BaseChartComponent } from "../base-chart/base-chart.component"

@Component({
	selector: 'r-bar-chart',
	templateUrl: './bar-chart.component.html',
	styleUrls: ['./bar-chart.component.scss']
})
export class RBarChartComponent extends BaseChartComponent {
	
	@Input('horizontal') horizontal: boolean = false;
	
	constructor() { 
		super();
	}
	
	public updateChart(): void {
		//alert("getting to rchart");
		this.chart?.destroy();
		this.chart = new Chart(this.chartCtx, {
			type: this.horizontal ? 'horizontalBar' : 'bar',
			data: this.data,
			options: this.chartOptions,
		});
	}
}
