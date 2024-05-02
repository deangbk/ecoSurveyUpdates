import { Component, OnInit } from '@angular/core';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { BsModalService } from 'ngx-bootstrap/modal';

import { ChartData, ChartOptions, defaults } from "chart.js";
import { Context } from 'chartjs-plugin-datalabels';

import { NewDataService } from "../data/new-data.service";
import { Helpers } from "../helpers";
import { AppConfig } from "../config";

@Component({
  selector: 'app-results-by-year-of-service',
  templateUrl: './results-by-year-of-service.component.html',
  styleUrls: ['./results-by-year-of-service.component.scss'],
  providers: [
	  { provide: BsDropdownConfig, useValue: { isAnimated: true, autoClose: true } },
	  BsModalService,
  ],
})
export class ResultsByYearOfServiceComponent implements OnInit {

	surveyId = 2;
	error: any = null;
	refreshData:boolean = false;
	
	dataReady_Info: boolean = false;
	dataReady_YearOfService: boolean = false;
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
	
	currentYearOfService: number = null;

	dropdown_YearOfServices_Text: string;
	dropdown_YearOfService_Items: any[];
	all_YearOfService : any[];
	
	// ---------------------------------------------------------
	
	response_Data: ChartData;
	response_Opt: ChartOptions;
	
	YearOfServiceResponse_Data: ChartData;
	YearOfServiceResponse_Opt: ChartOptions;
	
	YearOfServiceEngagement_Data: ChartData;
	YearOfServiceEngagement_Opt: ChartOptions;

	YoSByYearOfService_Data: ChartData;
	YoSByYearOfService_Opt: ChartOptions;

	YoSResponse_Data: ChartData;
	YoSResponse_Opt: ChartOptions;

	dimensionList: string[] = [];
	dimension_labels: string[] = [];
	
	resultsByYearOfService: any[] =[];
	resultsByDimension: any[] = [];
	resultByQuestion: any[] = [];

	getYearOfServices = [0, 6, 12, 2 * 12, 6 * 12, 11 * 12, 16 * 12, 21 * 12, 26 * 12, 99999];
	ByRangeYearOfService_labels: string[] = ['6 Months or less', 'Less than 1 Year',
	'1 Year', '2-5 Years', '6-10 Years', '11-15 Years', '16-20 Years',
	'21-25 Years','26 Years or longer'];
  	ByRangeYearOfService_labels_scale: string[] = ['6 Months;or less', 'Less than;1 Year',
	'1 Year', '2-5;Years', '6-10;Years', '11-15;Years', '16-20;Years',
	'21-25;Years','26 Years;or longer'];
  	rangeType: string = 'service';

	YearOfService_data: number[]=[];

	questionScoreByYearOfService: number;
	scoreByQuestionLabels: string[];

	// ---------------------------------------------------------
	//Charts colors configuration
	YearOfServiceColors: any[] = ["rgba(0, 240, 75, 1)" ,"rgba(0, 200, 240, 1)","rgba(255, 200, 100, 1)",
  "rgba(20, 210, 80, 1)","rgba(120,80,240,1)","rgba(255, 200, 10, 1)",
  "rgba(100, 255, 150, 1)","rgba(110,170,240,1)","rgba(255, 255, 100, 1)"];

	responseColors: any[] = [AppConfig.darkishGreen,AppConfig.responseOrange];
	yearOfServiceLineColor: any = "rgba(255,200,100,1)";

	//fontSize: number = 22;
	barThick: number = 60;

	// ---------------------------------------------------------

	constructor(private dataSrv: NewDataService) { }

	//
	ngOnInit(): void {
		this.dropdown_YearOfServices_Text = ' none selected ';
		this.dropdown_YearOfService_Items = [];
		this.getOvierviewData();
		this.getSelectionData();
		this.refreshOverviewCharts();
		this.refreshSelectionCharts();
		//console.log(this.dropdown_YearOfService_Items);
	}

	//Used to get the survey information
	getOvierviewData(): void{
		this.getInfo();
		this.getYearOfServiceList();
		this.getYearOfServiceData();
	}
	getSelectionData(): void{
		this.getDimensionList();
		this.getDimensionData();
		this.getQuestionData();
	}

	// ---------------------------------------------------------

	onRefreshData(): void {
		//this.refreshData = true;
		this.getOvierviewData();
		this.getSelectionData();
		this.refreshOverviewCharts();
		this.refreshSelectionCharts();
	}

	onSelectYearOfService(item: any): void {
		//console.log('Select YearOfService: ' + item.name);
		
		this.currentYearOfService = item.id;
		this.dropdown_YearOfServices_Text = item.name;
		
		this.refreshSelectionCharts();
	}
	
	// ---------------------------------------------------------
	//await for the overview infomation to be ready then refresh charts display
	async refreshOverviewCharts() {
		await Helpers.waitUntil(_ => this.dataReady_Info && this.dataReady_Overview && this.dataReady_YearOfService);
	//	console.log("refreshing charts...");
			this.refreshResponseRateChart();
			this.refreshYearOfServiceResponseChart();
			this.refreshEngagementYearOfServiceChart();
			this.refreshYearOfServiceResponseChart();
			this.dataReady_refreshOverview = true;
	//	console.log("completed refreshing charts..");
	}
	//await for the selection infomation to be ready then refresh charts display
	async refreshSelectionCharts() {
		await Helpers.waitUntil(_ => this.dataReady_refreshOverview && this.dataReady_Dimension.every(x => x === true) && this.dataReady_Question.every(x => x === true));
	//	console.log("refreshing byDimension chart...");
		this.refreshEngagementYearOfServiceByDimensionChart();
		this.refreshEngagementYearOfServiceByQuestionChart();
	//	console.log("completed refreshing byDimension chart...");
	}

	async getInfo(){

		this.dataReady_Overview = false
		//Used to get the survey information
		this.dataSrv.getSurveyInfo(this.surveyId).subscribe(
			(res: any) => {
				this.error = null;
			//	console.log(res);
				
				this.surveyInfo = res;
				this.surveyDate = new Date(res['date_created']);
				this.employeeCount= res['responder_count'];
			},
			(err) => {
				this.error = err;
			},
			() => this.dataReady_Info = true
		);
		
		//Used to get Response Rate
		this.dataSrv.getResultsOverview(this.surveyId).subscribe(
			(res: any) => {
				this.error = null;
			//	console.log(res);
				
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

		//Used to get all dimensions information
		this.dataSrv.getDimensionList(this.surveyId).subscribe(
			(res: any) => {
				this.error = null;
			//	console.log(res);
				this.dimensionList = res;
			},
			(err) => {
				this.error = err;
			},
			() => this.dataReady_DimensionList = true
		);
	}

	getYearOfServiceList(): void{
		
		this.dropdown_YearOfService_Items = this.ByRangeYearOfService_labels.map((x:any, index:number) => {return {id: index, name: x}});
		this.all_YearOfService = this.ByRangeYearOfService_labels.map((x:any, index:number) => {return {id: index,yid: index + 1, name: x}});
	}

	async getYearOfServiceData(){
	//	console.log('Requesting data from backend...');

		//prepare all Question arrays to get information
		var Id = this.all_YearOfService.map((x:any)=> x['id']);
		for(let id of Id){
			this.dataReady_Question[id] = false;
			this.resultByQuestion[id] = null;
		}
	//	console.log(this.dataReady_YearOfService);
	//	console.log(this.dataReady_Question);

		await Helpers.waitUntil(_ => this.dataReady_Question.every(x => x === false));

		//Used to get Year of service information
		this.dataSrv.getRangeResultsDataAll(this.surveyId, "service", this.getYearOfServices).subscribe(
			(res: any) => {
				this.error = null;
		//		console.log(res);
				
				this.resultsByYearOfService = res;
			},
			(err) => {
				this.error = err;
				
				this.resultsByYearOfService = [];
				//this.scoreByRangeAge = [];
			},
			() => this.dataReady_YearOfService = true
		);

		await Helpers.waitUntil(_ => this.dataReady_YearOfService);
		//this.dropdown_YearOfService_Items.sort((a:any,b:any) => a.gid - b.gid);
		this.dataReady_Selection = true;
	//	console.log('YearOfService Data received.');
	//	console.log(this.resultsByYearOfService);
		
		
	}

	async getDimensionData(){

		await Helpers.waitUntil(_ => this.dataReady_DimensionList);
	//	console.log('Requesting dimension data from backend...');
		//prepare all dimension arrays to get information
		for(let id = 0; id < this.dimensionList.length; id++){
			this.dataReady_Dimension[id] = false;
			this.resultsByDimension[id] = null;
		}
	//	console.log(this.dataReady_Dimension);
	//	console.log(this.resultsByDimension);

		await Helpers.waitUntil(_ => this.dataReady_Dimension.every((x:any) => x === false));
		//loop through all dimensions to get information
		this.dimensionList.forEach((Did: any,index:number) => {
			//Used to get dimension information by year of service
			this.dataSrv.getRangeResultsData(this.surveyId,"dims",Did['dimension_id'],this.rangeType,this.getYearOfServices).subscribe(
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
	//	console.log('Dimension Data received.');
	//	console.log(this.resultsByDimension);
	}
	
	async getQuestionData(){
		await Helpers.waitUntil(_ => this.dataReady_YearOfService);
	//	console.log('Requesting question data from backend...');
		//loop through all Year of service ranges to get information
		this.all_YearOfService.forEach((Qid: any,index:number) => {
			//range for each loop
			var ranges:number[] = [this.getYearOfServices[index],this.getYearOfServices[index+1]];
			//Used to get question information by year of service
			this.dataSrv.getQuestionResultsDataByYearOfService(this.surveyId,ranges).subscribe(
				(res: any) => {
					this.error = null;
				//	console.log(res);
					this.resultByQuestion[Qid['id']] = res.filter((x:any) => x != null);
				},
				(err) => {
					this.error = err;
					this.resultByQuestion[Qid['id']] = [];
				},
				() => this.dataReady_Question[Qid['id']] = true
			);
		});
	//	console.log('Question Data received.');
	//	console.log(this.resultByQuestion);
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
			rotation: 120,
			hover:{
				mode: null,

			} ,
			events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
		
			plugins: {
				datalabels: {
					labels: {
						title: {
							anchor: "end",
							align: "end",
							formatter: (x: number, ctx: Context) => {var x=((x/this.employeeCount)*100);return x.toFixed(AppConfig.decPlaces) + '%\n';},
							//formatter: (x: number, ctx: Context) => {var y=x;x=(x/this.employeeCount)*100;return x.toFixed(1) + '%\n  '+y;},
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
					//	family: defaults.global.defaultFontFamily,
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
	
	refreshYearOfServiceResponseChart():void {
		
	//	console.log(this.resultsByYearOfService);
		//var labels: string[] = this.resultsByYearOfService.filter(function (x){return x.responder_count > 0}).map(x => {if(x != null){return x['YearOfService_name']}});
		var labels:string[] = this.ByRangeYearOfService_labels;
		var Numberdata: number[] = this.resultsByYearOfService.filter(function (x){return x.responder_count > 0}).map(x => {if(x != null){return x['responder_count']}});
		//console.log(labels);
		//console.log(data);
		
		this.YearOfServiceResponse_Data = {
			labels: 
				labels,
			datasets: [
				{
					label: 'Response Rate by YearOfService',
					data: Numberdata,
					backgroundColor: this.YearOfServiceColors,
					//barThickness: 80,
				}
			],
		};
		this.YearOfServiceResponse_Opt = {
			rotation: 100,
			hover:{
				mode: null,

			} ,
			events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
		
			plugins: {
				datalabels: {
					labels: {
						//change these to configure the datalabels
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
						family: defaults.global.defaultFontFamily,
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
				},
			},			
			cutoutPercentage: 40,
			tooltips: {
				enabled: false,
				callbacks: {
					label: function(tooltipItem, data) {
						var label = data.labels[tooltipItem.index];
						var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
						return ' '+ value +' Employees';
					}
				}
			}
			
		};
		
	}
	
	refreshEngagementYearOfServiceChart():void {
		
		var labels:string[] = this.ByRangeYearOfService_labels_scale.map((x:any) => {return x.split(';')});
		var data: number[] = this.resultsByYearOfService.filter(function (x){return x.responder_count > 0}).map(x => {if((x['responder_count'] > 0)){const digitdecimal =  x['score_avg_percent'].toFixed(AppConfig.decPlaces); return parseFloat(digitdecimal);}}); ///check if fixed
		///next set the labels to wrap to the next line at 10 characters
		var textLen = this.ByRangeYearOfService_labels.length >= 4 ? 10 : (128 / this.ByRangeYearOfService_labels.length);
		var labelsWrap = this.ByRangeYearOfService_labels.map(x => Helpers.wrapText(x, textLen));
		//console.log(labelsWrap+" Lables Len "+textLen);
		this.YearOfServiceEngagement_Data = {
			//labels: labelsWrap,//labelsWrap,//labels,
			labels: labels,
			datasets: [{
				data: data,
				backgroundColor: this.YearOfServiceColors,
				barThickness: this.barThick,
			}],
		};
		this.YearOfServiceEngagement_Opt = {
			
			plugins: {
				datalabels: {
					anchor: "end",
					align: "end",
					formatter: (x: string, ctx: Context) => x + '%',
					offset: 3,
					display: 'display',
					/*font: {
						size: this.fontSize,
						family: defaults.global.defaultFontFamily,
					},*/
				},
			},
			layout: {
				padding: {
				 // right: this.padding,
				 top:30,
				 bottom:10
				}
				
			  },
			legend: {
				display: false,
			},
			scales: {
				xAxes: [{
					stacked: true,
					/*ticks: {
						fontSize: 22,
					}*/
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
						//var label = data.labels[tooltipItem.index];
						var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
						return value + '%';
					}
				},
				
			}
		};
		
	}

	refreshEngagementYearOfServiceByDimensionChart():void {
		if(this.currentYearOfService != null){
			var data: any[] = this.resultsByDimension.map(x => x);
		//	console.log(data);
			this.dimension_labels = this.dimensionList.map(x => x['dimension_name']);
			this.YearOfService_data = data.map(x => {const digitdecimal =  (x[this.currentYearOfService].score_avg*100/5).toFixed(AppConfig.decPlaces); return parseFloat(digitdecimal);}); ///check
		//	console.log(this.YearOfService_data);
		}
	}

	refreshEngagementYearOfServiceByQuestionChart():void {
		if(this.currentYearOfService != null){
			var data: any[]  = this.resultByQuestion.map(x => x);
			//console.log(data);
			this.questionScoreByYearOfService = data[this.currentYearOfService].map(x => {const digitdecimal =  (x['score_avg']*100/5).toFixed(AppConfig.decPlaces); return parseFloat(digitdecimal);}); ///check
			this.scoreByQuestionLabels = data[this.currentYearOfService].map(x => 'Q' + x['question_id']);
			//console.log(this.questionScoreByYearOfService);
			//console.log(this.scoreByQuestionLabels);
		}
	}
}
