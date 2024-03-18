import { Component, ElementRef, OnInit, OnChanges, Input, ViewChild } from '@angular/core';

import { Chart, ChartColor, ChartConfiguration, ChartData, ChartDataSets, ChartOptions } from "chart.js";

import { Helpers } from "../../helpers"

@Component({
	selector: 'r-base-chart',
	templateUrl: './base-chart.component.html',
	styleUrls: ['./base-chart.component.scss']
})
export class BaseChartComponent implements OnInit, OnChanges {
	
	@ViewChild('chCanvas') public canvases: ElementRef;
	public chartCtx: CanvasRenderingContext2D;
	
	public chart: Chart = null;
	private viewInit: boolean = false;
	
	@Input('top-display') public topDisplay: string = '';
	@Input('bottom-display') public bottomDisplay: string;
	
	@Input('data') public data: ChartData = null;
	@Input('options') public chartOptions: ChartOptions = {};
	
	@Input('canvasSize') canvasSize: string = "";
	
	constructor() { }
	
	ngOnInit(): void {
		// this.chartCtx = document.getElementById('cChart');
	//	alert("getting to base");
	}
	ngAfterViewInit() {
		this.chartCtx = this.canvases.nativeElement;
		this.viewInit = true;
	}
	
	ngOnChanges(): void {
		if (!this.viewInit) return;
		this.updateChart();
	}
	
	public updateChart(): void { }
	
	public isBottomEmpty(): boolean { return this.bottomDisplay == undefined || this.bottomDisplay.length == 0; }
}
