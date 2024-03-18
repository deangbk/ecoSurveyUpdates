import { Component, OnInit } from '@angular/core';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { BsModalService } from 'ngx-bootstrap/modal';

import { ChartData, ChartOptions } from "chart.js";
import { Context } from 'chartjs-plugin-datalabels';

import { NewDataService } from "../data/new-data.service";
import { Helpers } from "../helpers";
import { AppConfig } from '../config';

@Component({
  selector: 'app-results-by-age',
  templateUrl: './results-by-age.component.html',
  styleUrls: ['./results-by-age.component.scss'],
  providers: [
	  { provide: BsDropdownConfig, useValue: { isAnimated: true, autoClose: true } },
	  BsModalService,
  ],
})
export class ResultsByAgeComponent implements OnInit {

	surveyId = 2;
	error: any = null;
	refreshData:boolean = false;
	
	dataReady_Info: boolean = false;
	dataReady_AgeRange: boolean = false;
	dataReady_Overview: boolean = false;
	dataReady_Dimension: boolean[] = [];
	dataReady_DimensionList: boolean = false;
	dataReady_Question: boolean[] = [];
	dataReady_Selection: boolean = false;
	dataReady_refreshOverview: boolean = false;
	
	surveyInfo: any = null;
	resultsOverview: any = null;
	
	employeeCount: number;
	responseCount: number;
	
	surveyDate: Date;
	
	currentAgeRange: number = null;

	dropdown_AgeRanges_Text: string;
	dropdown_AgeRange_Items: any[];
	all_AgeRange : any[];
	
	// ---------------------------------------------------------
	
	response_Data: ChartData;
	response_Opt: ChartOptions;
	
	AgeRangeResponse_Data: ChartData;
	AgeRangeResponse_Opt: ChartOptions;
	
	AgeRangeEngagement_Data: ChartData;
	AgeRangeEngagement_Opt: ChartOptions;

	YoSByAgeRange_Data: ChartData;
	YoSByAgeRange_Opt: ChartOptions;

	YoSResponse_Data: ChartData;
	YoSResponse_Opt: ChartOptions;

	dimensionList: string[] = [];
	dimension_labels: string[] = [];
	
	resultsByAgeRange: any[] =[];
	resultsByDimension: any[] = [];
	resultByQuestion: any[] = [];

	getAgeRanges:number[] = [0, 25, 35, 45, 55, 999];
	ByRangeAge_labels: string[] = ['Under 25', '25 - 34', '35 - 44', '45 - 54', '55 and Above'];
	rangeType:string = "age";

	ageRange_data: number[]=[];

	questionScoreByAgeRange: number;
	scoreByQuestionLabels: string[];

	// ---------------------------------------------------------
	
	ageRangeColors: any[] = ["rgba(170, 230, 100, 1)","rgba(0, 190, 75, 1)","rgba(0, 200, 240, 1)", "rgba(55, 130, 230, 1)", "rgba(130, 130, 230, 1)"];
	responseColors: any[] = [AppConfig.darkishGreen,AppConfig.responseOrange];
	yearOfServiceLineColor: any = "rgba(255,150,60,1)";

	avgYearOfService: number;

	fontSize: number = 22;
	barThick: number = 60;

	// ---------------------------------------------------------

	constructor(private dataSrv: NewDataService) { }

	ngOnInit(): void {
		this.dropdown_AgeRanges_Text = ' none selected ';
		this.dropdown_AgeRange_Items = [];
		this.getOvierviewData();
		this.getSelectionData();
		this.refreshOverviewCharts();
		this.refreshSelectionCharts();
		//console.log(this.dropdown_AgeRange_Items);
	}
	getOvierviewData(): void{
		this.getInfo();
		this.getAgeRangeList();
		this.getAgeRangeData();
	}
	getSelectionData(): void{
		this.getDimensionList();
		this.getDimensionData();
		this.getQuestionData();
	}

	// ---------------------------------------------------------

	onRefreshData(): void {
		this.refreshData = true;
		this.getOvierviewData();
		this.getSelectionData();
		this.refreshOverviewCharts();
		this.refreshSelectionCharts();
	}

	onSelectAgeRange(item: any): void {
		console.log('Select AgeRange: ' + item.name);
		
		this.currentAgeRange = item.id;
		this.dropdown_AgeRanges_Text = item.name;
		
		this.refreshSelectionCharts();
	}
	
	// ---------------------------------------------------------
	
	async refreshOverviewCharts() {

		await Helpers.waitUntil(_ => this.dataReady_Info && this.dataReady_Overview && this.dataReady_AgeRange);

		console.log("refreshing charts...");
			this.refreshResponseRateChart();
			this.refreshAgeRangeResponseChart();
			this.refreshEngagementAgeRangeChart();
			this.refreshYearOfServiceResponseChart();
			this.dataReady_refreshOverview = true;
		console.log("completed refreshing charts..");
	}
	
	async refreshSelectionCharts() {

		await Helpers.waitUntil(_ => this.dataReady_refreshOverview && this.dataReady_Dimension.every(x => x === true) && this.dataReady_Question.every(x => x === true));

		console.log("refreshing byDimension chart...");
		this.refreshEngagementAgeRangeByDimensionChart();
		this.refreshEngagementAgeRangeByQuestionChart();
		console.log("completed refreshing byDimension chart...");
	}

	async getInfo(){

		this.dataReady_Overview = false;
		this.dataSrv.getSurveyInfo(this.surveyId).subscribe(
			(res: any) => {
				this.error = null;
				console.log(res);
				
				this.surveyInfo = res;
				this.surveyDate = new Date(res['date_created']);
				this.employeeCount= res['responder_count'];
			},
			(err) => {
				this.error = err;
			},
			() => this.dataReady_Info = true
		);
		
		this.dataSrv.getResultsOverview(this.surveyId).subscribe(
			(res: any) => {
				this.error = null;
				console.log(res);
				
				this.resultsOverview = res;
				this.responseCount = res['responder_count'];
			},
			(err) => {
				this.error = err;
			},
			() => this.dataReady_Overview = true
		);
		await Helpers.waitUntil(_ => this.dataReady_Info && this.dataReady_Overview);
	}

	getDimensionList(): void{
		this.dataReady_DimensionList = false;
		this.dataSrv.getDimensionList(this.surveyId).subscribe(
			(res: any) => {
				this.error = null;
				console.log(res);
				this.dimensionList = res;
			},
			(err) => {
				this.error = err;
			},
			() => this.dataReady_DimensionList = true
		);
	}

	getAgeRangeList(): void{
		
		this.dropdown_AgeRange_Items = this.ByRangeAge_labels.map((x:any, index:number) => {
			return {id: index, name: x}
		});

		this.all_AgeRange =this.ByRangeAge_labels.map((x:any, index:number) => {
			return {id: index,aid: index + 1, name: x}
		});

		console.log(this.dropdown_AgeRange_Items);
		console.log(this.all_AgeRange);
	}	

	async getAgeRangeData(){
		console.log('Requesting data from backend...');

		var Id = this.all_AgeRange.map((x:any) => x['id']);
		//prepare all question arrays to be ready for receive information
		for(let id of Id){
			this.dataReady_Question[id] = false;
			this.resultByQuestion[id] = null;
		}

		console.log(this.dataReady_AgeRange);
		console.log(this.dataReady_Question);

		await Helpers.waitUntil(_ => this.dataReady_Question.every(x => x === false));

		//Used to receive all AgeRange information
		this.dataSrv.getRangeResultsDataAll(this.surveyId, "age", this.getAgeRanges).subscribe(
			(res: any) => {
				this.error = null;
				console.log(res);
				
				this.resultsByAgeRange = res.filter(x => x != null);
			},
			(err) => {
				this.error = err;
				
				this.resultsByAgeRange = [];
			},
			() => this.dataReady_AgeRange = true
		);

		await Helpers.waitUntil(_ => this.dataReady_AgeRange);
		//this.dropdown_AgeRange_Items.sort((a:any,b:any) => a.gid - b.gid);
		this.dataReady_Selection = true;
		console.log('AgeRange Data received.');
		console.log(this.resultsByAgeRange);
		
		
	}

	async getDimensionData(){
		
		await Helpers.waitUntil(_ => this.dataReady_DimensionList);
		//prepare all dimension arrays to be ready for receive information
		for(let id = 0; id < this.dimensionList.length; id++){
			this.dataReady_Dimension[id] = false;
			this.resultsByDimension[id] = null;
		}
		//console.log(Id);
		console.log(this.dataReady_Dimension);
		console.log(this.resultsByDimension);

		await Helpers.waitUntil(_ => this.dataReady_Dimension.every(x => x === false));
		//loop through all dimensions to get information
		this.dimensionList.forEach((Did: any,index:number) => {
			//Used to receive all dimension information by age range
			this.dataSrv.getRangeResultsData(this.surveyId,"dims",Did['dimension_id'],this.rangeType,this.getAgeRanges).subscribe(
				(res: any) => {
					this.error = null;
					//console.log(res);
					this.resultsByDimension[index] = res;
				},
				(err) => {
					this.error = err;
					this.resultsByDimension[index] = [];
				},
				() => this.dataReady_Dimension[index] = true
			);
		});

		await Helpers.waitUntil(_ => this.dataReady_Dimension.every((x:any) => x == true));
		console.log('Dimension Data received.');
		console.log(this.resultsByDimension);
	}
	
	async getQuestionData(){

		await Helpers.waitUntil(_ => this.dataReady_AgeRange);

		//loop through all Age ranges to get information
		this.all_AgeRange.forEach((Qid: any,index:number) => {
			//range for each loop
			var ranges:number[] = [this.getAgeRanges[index],this.getAgeRanges[index+1]];
			//Used to receive all question information by age range
			this.dataSrv.getQuestionResultsDataByAgeRange(this.surveyId,ranges).subscribe(
				(res: any) => {
					this.error = null;
					console.log(res);
					this.resultByQuestion[Qid['id']] = res.filter((x:any) => x != null);
				},
				(err) => {
					this.error = err;
					this.resultByQuestion[Qid['id']] = [];
				},
				() => this.dataReady_Question[Qid['id']] = true
			);
		});
		console.log('Question Data received.');
		console.log(this.resultByQuestion);
	}
	// ---------------------------------------------------------

	refreshResponseRateChart():void {
		
		var labels = ["Response","Non-Response"];
		var responseData=[this.responseCount,this.employeeCount-this.responseCount];
		this.response_Data = {
			labels: labels,
			datasets: [
				{
					label: "Response Rate",
					data: responseData,
					backgroundColor: this.responseColors,
				},
			],
		};
		this.response_Opt = {
			rotation: 180,
			plugins: {
				datalabels: {
					labels: {
						title: {
							anchor: "end",
							align: "end",
							formatter: (x: number, ctx: Context) => {var x=((x/this.employeeCount)*100);return x.toFixed(AppConfig.decPlaces) + '%\n';},
						},
						value: {
							//color: this.responseColors,
							anchor: "center",
							align: "center",
							formatter: (x: number, ctx: Context) => x,
						}
					},
					font: {
						size: AppConfig.donutFontSize,
					},
				},
				outlabels: {
					display: false,
				},
			},
			legend: {
				display: true,
				position: 'bottom',
				labels:{
					padding: 30,
					fontSize: AppConfig.donutFontSize,
					fontStyle: 'bold',
				}
				
			},
			cutoutPercentage: 40,
			tooltips: {
				enabled: false,
				callbacks: {
					label: function(tooltipItem, data) {
						var label = data.labels[tooltipItem.index];
						var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
						return label + ' Count: ' + value;
					}
				}
			}
		};
	}
	
	refreshAgeRangeResponseChart():void {
		
		console.log(this.resultsByAgeRange);
		//var labels: string[] = this.resultsByAgeRange.filter(function (x){return x.responder_count > 0}).map(x => {if(x != null){return x['AgeRange_name']}});
		var labels: string[] = this.ByRangeAge_labels;
		var Numberdata: number[] = this.resultsByAgeRange
			.filter(function (x){return x.responder_count > 0})
				.map(x => {
					if(x != null){
						return x['responder_count'];
					}
				}
			);
		console.log(labels);

		this.AgeRangeResponse_Data = {
			labels: 
				labels,
			datasets: [
				{
					label: 'Response Rate by AgeRange',
					data: Numberdata,
					backgroundColor: this.ageRangeColors,
					barThickness: this.barThick,
					
				}
			],
		};
		this.AgeRangeResponse_Opt = {
			rotation: 180,
			plugins: {
				datalabels: {
					labels: {
						title: {
							anchor: "end",
							align: "end",
							formatter: (x: number, ctx: Context) => {var x=((x/this.responseCount)*100);return x.toFixed(AppConfig.decPlaces) + '%\n';},
						},
						value: {
							//color: this.genearationColors,
							anchor: "center",
							align: "center",
							formatter: (x: number, ctx: Context) => x,
						}
					},
					/*font: {
						size: this.fontSize,
					},*/
				},
				outlabels: {
					display: false,
				},
			},
			legend: {
				display: true,
				position: 'bottom',
				labels:{
					padding: 30,
				}
			},			
			cutoutPercentage: 40,
			tooltips: {
				enabled: false,
				// callbacks: {
				// 	label: function(tooltipItem, data) {
				// 		var label = data.labels[tooltipItem.index];
				// 		var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
				// 		return ' '+ value +' Employees';
				// 	}
				// }
			}
		};
	}
	
	refreshEngagementAgeRangeChart():void {
		
		var labels: string[] = this.ByRangeAge_labels;
		var data: number[] = this.resultsByAgeRange
			.filter(function (x){return x.responder_count > 0})
				.map(x => {
					const digitdecimal =  x['score_avg_percent'].toFixed(AppConfig.decPlaces);
					return parseFloat(digitdecimal);
				}
			);
		
		this.AgeRangeEngagement_Data = {
			labels: labels,
			datasets: [{
				data: data,
				backgroundColor: this.ageRangeColors,
				barThickness: this.barThick,
			}],
		};
		this.AgeRangeEngagement_Opt = {
			plugins: {
				datalabels: {
					anchor: "end",
					align: "end",
					formatter: (x: string, ctx: Context) => x + '%',
					offset: 3,
					display: 'display',
					/*font: {
						size: this.fontSize,
					},*/
				},
			},
			legend: {
				display: false,
			},
			scales: {
				xAxes: [{
					stacked: true,
					
				}],
				yAxes: [{
					gridLines: {
						display: true,
					},
					ticks: {
						min: 0,
						max: 100,
						stepSize: 20,
						callback: function(value) {
							return value + '%';
						}
					},
				}],
			},
			tooltips: {
				enabled: false,
				callbacks: {
					label: function(tooltipItem, data) {
						var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
						return value + '%';
					}
				},
			}
		};
	}
	
	refreshYearOfServiceResponseChart():void {
		
		console.log(this.resultsOverview.length);

		var labels: string[] = this.ByRangeAge_labels;
		var Numberdata: number[] = this.resultsByAgeRange
			.filter(function (x){return x.responder_count > 0})
				.map(x => {
					if(x != null){
						return x['responder_count'];
					}
				}
			);
		var Max = Math.max(...Numberdata);
		
		console.log(labels);
		console.log(Numberdata);
		this.YoSByAgeRange_Data = {
			labels: 
				labels,
			datasets: [
				{
					label: 'Number of Employees by AgeRange',
					data: Numberdata,
					backgroundColor: this.ageRangeColors,
					barThickness: this.barThick,
				}
			],
		};
		this.YoSByAgeRange_Opt = {
			responsive: true,
			plugins: {
				datalabels: {
					anchor: "end",
					align: "top",
					formatter: (x: number, ctx: Context) => x,	
					//rotation: 270,
					offset: 3,
					display: 'display',
					/*font: {
						size: this.fontSize,
					},*/
				}
			},
			legend: {
				display: false,
			},
			scales: {
				xAxes: [{
					stacked: false,
				}],
				yAxes: [{
					scaleLabel: {
						display: true,
						labelString: 'Number of Employees',
						//fontSize: 18,
					},
					gridLines: {
						display: true,
					},
					ticks: {
						min: 0,
						max: Helpers.ceil_base(Max+7,7),
						stepSize: 7,
					},
				},
			],
			},
			tooltips: {
				enabled: false,
				callbacks: {
					label: function(tooltipItem, data) {
						var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
						return ' '+ value +' Employees';
					}
				}
			}
		};
	}

	refreshEngagementAgeRangeByDimensionChart():void {
		if(this.currentAgeRange != null){
			var Obj: any[] = this.resultsByDimension.map(x => x);
			console.log(Obj);
			this.dimension_labels = this.dimensionList.map(x => x['dimension_name']);
			this.ageRange_data = Obj.map(x => {
				const digitdecimal =  (x[this.currentAgeRange].score_avg*100/5).toFixed(AppConfig.decPlaces); ////check this again
				return parseFloat(digitdecimal);
			});
			console.log(this.ageRange_data);
		}
	}

	refreshEngagementAgeRangeByQuestionChart():void {
		if(this.currentAgeRange != null){
			var data: any[]  = this.resultByQuestion.map(x => x);
			console.log(data);
			this.questionScoreByAgeRange = data[this.currentAgeRange].map(x => {
				const digitdecimal =  (x['score_avg']*100/5).toFixed(AppConfig.decPlaces); ////check this data again also
				return parseFloat(digitdecimal);
			});
			this.scoreByQuestionLabels = data[this.currentAgeRange].map(x => 'Q' + x['question_id']);
			console.log(this.questionScoreByAgeRange);
			console.log(this.scoreByQuestionLabels);
		}
	}
}
