import { Component, OnInit } from '@angular/core';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { BsModalService } from 'ngx-bootstrap/modal';

import { ChartData, ChartOptions } from "chart.js";
import { Context } from 'chartjs-plugin-datalabels';

import { NewDataService } from "../data/new-data.service";
import { Helpers } from "../helpers";
import { AppConfig } from "../config";

@Component({
  selector: 'app-results-by-gender',
  templateUrl: './results-by-gender.component.html',
  styleUrls: ['./results-by-gender.component.scss'],
  providers: [
	  { provide: BsDropdownConfig, useValue: { isAnimated: true, autoClose: true } },
	  BsModalService,
  ],
})
export class ResultsByGenderComponent implements OnInit {

  surveyId = 2;
	error: any = null;
	dataReady_Info: boolean = false;
	dataReady_Gender: boolean[] = [false, false];
	dataReady_Overview: boolean = false;
	dataReady_Dimension: boolean = false;
	dataReady_Question: boolean[] = [false, false];
	dataReady_Selection: boolean = false;
	dataReady_refreshOverview: boolean = false;
	
	surveyInfo: any = null;
	resultsOverview: any = null;
	
	employeeCount: number;
	responseCount: number;
	
	surveyDate: Date;
	
	currentGender: number = null;

	dropdown_Genders_Text: string;
	dropdown_Gender_Items: any[];

	
	// ---------------------------------------------------------
	
	response_Data: ChartData;
	response_Opt: ChartOptions;
	
	GenderResponse_Data: ChartData;
	GenderResponse_Opt: ChartOptions;
	
	GenderEngagement_Data: ChartData;
	GenderEngagement_Opt: ChartOptions;

	YoSByGender_Data: ChartData;
	YoSByGender_Opt: ChartOptions;

	YoSResponse_Data: ChartData;
	YoSResponse_Opt: ChartOptions;

	dimensionList: string[] = [];
	dimension_labels: string[] = [];
	
	resultsByGender: any[] = [null, null];
	GenderList: any[] = [];

	gender_data: number;

	questionScoreByGender: number;
	resultByQuestion: any[] = [];
	scoreByQuestionLabels: string[];

	// ---------------------------------------------------------
	
	genearationColors: any[] = ["rgba(0, 180, 220, 1)", "rgba(255,200,50,1)"];
	responseColors: any[] = [AppConfig.darkishGreen,AppConfig.responseOrange];
	yearOfServiceLineColor: any = "rgba(240,80,80,1)";
	avgYearOfService: number;
	fontSize: number = 22;
	barThick: number = 60;
	// ---------------------------------------------------------

	constructor(private dataSrv: NewDataService) { }

	ngOnInit(): void {
		this.dropdown_Genders_Text = ' none selected ';
		this.dropdown_Gender_Items = [{id:0,name:'Male'},{id:1,name:'Female'}];
		this.GenderList = this.dropdown_Gender_Items.map(x => x['name']);
		this.getOvierviewData();
		this.getSelectionData();
		this.refreshOverviewCharts();
		this.refreshSelectionCharts();
		console.log(this.dropdown_Gender_Items);
	}

	getOvierviewData(): void{
		this.getInfo();
		this.getGenderData();
	}

	getSelectionData(): void{
		this.getDimensionData();
		this.getQuestionData();
	}

	// ---------------------------------------------------------

	onRefreshData(): void {
		this.getOvierviewData();
		this.getSelectionData();
		this.refreshOverviewCharts();
		this.refreshSelectionCharts();
	}

	onSelectGender(item: any): void {
		console.log('Select Gender: ' + item.name);
		
		this.currentGender = item.id;
		this.dropdown_Genders_Text = item.name;
		
		this.refreshSelectionCharts();
	}

	// ---------------------------------------------------------
	
	async refreshOverviewCharts() {
		await Helpers.waitUntil(_ => this.dataReady_Info && this.dataReady_Overview && this.dataReady_Gender.every(x => x === true));
		console.log("refreshing charts...");
			this.refreshResponseRateChart();
			this.refreshGenderResponseChart();
			this.refreshEngagementGenderChart();
			this.refreshYearOfServiceResponseChart();
			this.dataReady_refreshOverview = true;
		console.log("completed refreshing charts..");
	}
	
	async refreshSelectionCharts() {
		await Helpers.waitUntil(_ => this.dataReady_refreshOverview && this.dataReady_Dimension && this.dataReady_Question.every(x => x === true));
		console.log("refreshing byDimension chart...");
		this.refreshEngagementGenderByDimensionChart();
		this.refreshEngagementGenderByQuestionChart();
		console.log("completed refreshing byDimension chart...");
	}

	async getInfo(){
		this.dataReady_Overview = false;
		this.dataSrv.getSurveyInfo(this.surveyId).subscribe(
			(res: any) => {
				this.error = null;
				console.log(res);

				this.surveyInfo = res;
				this.surveyDate = new Date(res["date_created"]);
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

	async getDimensionData(){
		this.dataReady_Dimension = false;
		this.dataSrv.getDimensionList(this.surveyId).subscribe(
			(res: any) => {
				this.error = null;
				console.log(res);
				this.dimensionList = res;
			},
			(err) => {
				this.error = err;
			},
			() => this.dataReady_Dimension = true
		);
	}

	async getGenderData(){
		console.log('Requesting data from backend...');
		
		this.dataReady_Gender = [false, false];
		
      	console.log(this.dropdown_Gender_Items.length);
		for(let i=0; i<this.dropdown_Gender_Items.length; i++){
			this.dataSrv.getGenderResultsData(this.surveyId,i+1).subscribe(
				(res: any) =>{
					this.error = null;
					console.log(res);
					this.resultsByGender[i] = res;
					
				},
				(err) => {
					this.error = err;
					
				},
				() => this.dataReady_Gender[i] = true
			);
		}

		await Helpers.waitUntil(_ => this.dataReady_Gender.every(x => x === true));

		this.dataReady_Selection = true;
		console.log('Data received.');
		console.log(this.resultsByGender);
		
	}

	async getQuestionData(){
		console.log('Requesting data from backend...');

		await Helpers.waitUntil(_ => this.dataReady_refreshOverview);

		this.dataReady_Question = [false, false];
		for(let i=0; i<this.dropdown_Gender_Items.length; i++){
			this.dataSrv.getQuestionResultsDataByGender(this.surveyId,i+1).subscribe(
				(res: any) => {
					this.error = null;
					console.log(res);
					
					this.resultByQuestion[i] = res;
				},
				(err) => {
					this.error = err;
					
					this.resultByQuestion[i] = [];

				},
				() => this.dataReady_Question[i] = true,
			);
		}

		await Helpers.waitUntil(_ => this.dataReady_Question.every(x => x === true));

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
			plugins: {
				datalabels: {
					labels: {
						title: {
							anchor: "end",
							align: "end",
							formatter: (x: number, ctx: Context) => {
								var x=((x/this.employeeCount)*100);
								return x.toFixed(AppConfig.decPlaces) + '%\n';
							},
							//formatter: (x: number, ctx: Context) => {var y=x;x=(x/this.employeeCount)*100;return x.toFixed(1) + '%\n  '+y;},
						},
						value: {
							//color: this.responseColors,
							anchor: "center",
							align: "center",

							formatter: (x: number, ctx: Context) => x,
						}
					},
					/*font: {
						size: this.fontSize,
					},*/
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
					fontSize:AppConfig.donutFontSize,
					
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
	
	refreshGenderResponseChart():void {
		
		var labels: string[] = this.GenderList;
    	var Numberdata: number[] = this.resultsByGender.map(x => x['responder_count']);
		
		console.log(labels);

		this.GenderResponse_Data = {
			labels: 
				labels,
			datasets: [
				{
					label: 'Response Rate by Gender',
					data: Numberdata,
					backgroundColor: this.genearationColors,
					barThickness: 50,
				}
			],
		};
		this.GenderResponse_Opt = {
			
			plugins: {
				datalabels: {
					labels: {
						title: {
							anchor: "end",
							align: "end",							
							formatter: (x: number, ctx: Context) => {
								var x=((x/this.responseCount)*100);
								return x.toFixed(AppConfig.decPlaces) + '%\n';
							},
							offset: 3,
							display: 'display',
						},
						value: {
							//color: this.genearationColors,
							anchor: "center",
							align: "center",
							formatter: (x: number, ctx: Context) => x,
							offset: 3,
							display: 'display',
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
	
	refreshEngagementGenderChart():void {
		
		var labels: string[] = this.GenderList;
		var data: number[] = this.resultsByGender.map(x => {
			const digitdecimal =  x['score_avg_percent'].toFixed(AppConfig.decPlaces); 
			return parseFloat(digitdecimal);
		});
		
		this.GenderEngagement_Data = {
			labels: labels,
			datasets: [{
				data: data,
				backgroundColor: this.genearationColors,
				barThickness: 50,
			}],
		};
		this.GenderEngagement_Opt = {
			
			plugins: {
				datalabels: {
					anchor: "end",
					align: "end",
					formatter: (x: string, ctx: Context) => x + '%',
				},
				/*font: {
					size: this.fontSize,
				},*/
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
						//var label = data.labels[tooltipItem.index];
						var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
						return value + '%';
					}
				},
				
			}
		};
	}

	refreshYearOfServiceResponseChart():void {
		
		console.log(this.resultsOverview.length);
		
		/*var yearOfService:number[] = this.resultsByGender.map(x => {
			const digitdecimal =  x['service_avg']; 
			return parseFloat(digitdecimal.toFixed(1));
		});*/

		var labels: string[] = this.GenderList;
		var Numberdata: number[] = this.resultsByGender.map(x => x['responder_count']);
		var Max = Math.max(...Numberdata);

		console.log(labels);

		this.YoSByGender_Data = {
			labels: 
				labels,
			datasets: [
				{
					yAxisID: "yBar",
					type: 'bar',
					label: 'Response Rate by Gender',
					data: Numberdata,
					backgroundColor: this.genearationColors,
					barThickness: 50,
					order: 2,
				},
				/*{
					yAxisID: "yLine",
					type: 'line',
					label: 'Year of Service Average',
					data: yearOfService,
					borderColor: this.yearOfServiceLineColor,
					fill: false,
					borderWidth: 3,
					pointRadius: 3,
					hoverRadius: 3,
					order: 1,
				},*/
			],
		};
		this.YoSByGender_Opt = {
			//responsive: true,
			plugins: {
				datalabels: {
					labels: {
						title: {
							anchor: "end",
							align: "end",
						formatter: (x: number, ctx: Context) => {
							if(ctx.datasetIndex===0){
								return x;
							}else{
								return '';
							}},
							offset: 3,
							display: 'display',
						},
						/*value: {
						anchor: "end",
						align: "end",
						
						formatter: (x: number, ctx: Context) => {
							if (ctx.datasetIndex===1){
								return x.toFixed(1);
							}else{
								return '';
							}},	
						}*/
					},
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
					stacked: false,
				}],
				yAxes: [{
					id: "yBar",
					position: 'left',
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
				/*{
					id: "yLine",
					position: 'right',
					scaleLabel: {
						display: true,
						labelString: 'Years of Service',
						//fontSize: 18,
					},
					gridLines: {
						display: false,
					},
					ticks: {
						min: 0,
						max: Helpers.ceil_base(Math.max(...yearOfService)+6,6),
						stepSize: 3,
					},
				}*/
			],
			
			},
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

	refreshEngagementGenderByDimensionChart():void {
		if(this.currentGender != null){
			var data: any[] = this.resultsByGender.map(x => x['score_dimensions']);
			this.dimension_labels = this.dimensionList.map(x => x['dimension_name']);
			console.log(this.dimension_labels);
			
			this.gender_data = data[this.currentGender].map(x => {const digitdecimal =  (x['score_avg']*100/5).toFixed(AppConfig.decPlaces); return parseFloat(digitdecimal);});
			console.log(this.gender_data);
		}
	}

	refreshEngagementGenderByQuestionChart():void {
		if(this.currentGender != null){
			var data: any[]  = this.resultByQuestion.map(x => x);
			console.log(data);
			this.questionScoreByGender = data[this.currentGender].map(x => {const digitdecimal =  (x['score_avg']*100/5).toFixed(AppConfig.decPlaces); return parseFloat(digitdecimal);});   ////check if should be fixed
			this.scoreByQuestionLabels = data[this.currentGender].map(x => 'Q' + x['question_id']);
			console.log(this.questionScoreByGender);
			console.log(this.scoreByQuestionLabels);
		}
	}

}
