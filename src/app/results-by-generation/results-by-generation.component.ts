import { Component, OnInit } from '@angular/core';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { BsModalService } from 'ngx-bootstrap/modal';

import { ChartData, ChartOptions } from "chart.js";
import { Context } from 'chartjs-plugin-datalabels';

import { NewDataService } from "../data/new-data.service";
import { Helpers } from "../helpers";
import * as Models from "../data/data-model-new";
import { AppConfig } from "../config";

@Component({
  selector: 'app-results-by-generation',
  templateUrl: './results-by-generation.component.html',
  styleUrls: ['./results-by-generation.component.scss'],
  providers: [
	  { provide: BsDropdownConfig, useValue: { isAnimated: true, autoClose: true } },
	  BsModalService,
  ],
})
export class ResultsByGenerationComponent implements OnInit {
	
	surveyId = 2;
	error: any = null;
	refreshData:boolean = false;
	
	dataReady_Info: boolean = false;
	dataReady_Gen: boolean[] =[];
	dataReady_GenerationList: boolean = false;
	dataReady_Overview: boolean = false;
	dataReady_Dimension: boolean = false;
	dataReady_Question: boolean[] = [];
	dataReady_YoS: boolean = false;
	dataReady_Selection: boolean = false;
	dataReady_refreshOverview: boolean = false;
	dataReady_GenerationListOld: boolean = false;

	surveyInfo: any = null;
	resultsOverview: any = null;
	
	dataOldGen:Models.OldDataTable[]= null;
	employeeCount: number;
	responseCount: number;
	
	surveyDate: Date;
	
	currentGeneration: number = null;

	
	dropdown_Generations_Text: string;
	dropdown_Generation_Items: any[];
	all_generation : any[];
	
	// ---------------------------------------------------------
	
	response_Data: ChartData;
	response_Opt: ChartOptions;
	
	generationResponse_Data: ChartData;
	generationResponse_Opt: ChartOptions;
	
	generationEngagement_Data: ChartData;
	generationEngagement_Opt: ChartOptions;
	generationEngagement_DataOld: ChartData;

	YoSByGen_Data: ChartData;
	YoSByGen_Opt: ChartOptions;

	YoSResponse_Data: ChartData;
	YoSResponse_Opt: ChartOptions;

	dimensionList: string[] = [];
	dimension_labels: string[] = [];
	c_labels_scoreByGen: string[] = [];
	
	resultsByGeneration: any[] =[];

	gen_data: number;

	questionScoreByGeneration: number;
	resultByQuestion: any[] = [];
	scoreByQuestionLabels: string[];

	Cate: string = 'generation' ;
	rangeType: string = 'service';
	yearRanges: number[] = [0, 9999];

	YoSbyGen: any[] = [];
	avgYearOfService: number[];

	// ---------------------------------------------------------
	
	public static generationColors: string[] = [
		"rgba(0, 190, 75, 1)", "rgba(170, 230, 100, 1)",
		"rgba(0, 200, 240, 1)", "rgba(80, 150, 230, 1)"];
	responseColors: any[] = [AppConfig.darkishGreen,AppConfig.responseOrange];
	yearOfServiceLineColor: any = "rgba(255,150,60,1)";
	fontSize: number = 22;
	barThick: number = 60;
	// ---------------------------------------------------------

	constructor(private dataSrv: NewDataService) { }
		
	ngOnInit(): void {
		this.dropdown_Generations_Text = ' none selected ';
		this.dropdown_Generation_Items = [];
		this.getOvierviewData();
		this.getSelectionData();
		this.refreshOverviewCharts();
		this.refreshSelectionCharts();
		//console.log(this.dropdown_Generation_Items);
	}
	getOvierviewData(): void{
		this.getInfo();
		this.getGenerationList();
		this.getGenerationData();
		this.getGenerationOld();
	}
	getSelectionData(): void{
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

	onSelectGeneration(item: any): void {
		console.log('Select generation: ' + item.name);
		
		this.currentGeneration = item.id;
		this.dropdown_Generations_Text = item.name;
		
		this.refreshSelectionCharts();
	}
	
	// ---------------------------------------------------------
	
	async refreshOverviewCharts() {

		await Helpers.waitUntil(_ => this.dataReady_Info && this.dataReady_Overview && this.dataReady_Gen.every(x => x === true));

		console.log("refreshing charts...");
			this.refreshResponseRateChart();
			this.refreshGenerationResponseChart();
			this.refreshEngagementGenerationChart();
			this.refreshYearOfServiceResponseChart();
			this.dataReady_refreshOverview = true;
		console.log("completed refreshing charts..");
	}
	
	async refreshSelectionCharts() {

		await Helpers.waitUntil(_ => this.dataReady_refreshOverview && this.dataReady_Dimension && this.dataReady_Question.every(x => x === true));
		
		console.log("refreshing byDimension chart...");
		this.refreshEngagementGenerationByDimensionChart();
		this.refreshEngagementGenerationByQuestionChart();
		console.log("completed refreshing byDimension chart...");
	}

	async getInfo(){

		this.dataReady_Overview = false
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

	getDimensionData(): void{
		this.dataReady_Dimension = false;
		//Use this to get the dimension list
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

	getGenerationList(): void{
		this.dataReady_GenerationList = false;
		this.dataSrv.getGenerationList().subscribe(
			(res: any) => {
				this.error = null;
				//console.log(res);
				this.all_generation = res.map((x:any, index:number) => {
					return {id: index, gid: x['generation_id'],name: x['generation_name']}
				});
			},
			(err) => {
				this.error = err;
			},
			() => this.dataReady_GenerationList = true
		);
	}

	getGenerationOld(): void{
		this.dataReady_GenerationListOld = false;
		this.dataSrv.getOldResultsFilter(this.surveyId,0,0,0,0,0,"GenerationDep").subscribe(
			(res: Models.OldDataTable[] ) => {
				console.log(res);
				this.error = null;
				this.dataOldGen = res;
				console.log("Old Generation Data received.");
				console.log(this.dataOldGen);
			},
			(err) => {
				this.error = err;
				this.dataOldGen = null;
			},
			() => this.dataReady_GenerationListOld = true
		);
	}



	async getGenerationData(){
		console.log('Requesting data from backend...');

		await Helpers.waitUntil(_ => this.dataReady_GenerationList);

		this.dataReady_YoS = false;
		var Id = this.all_generation.map((x:any) => x['id']);	
		//prepare all generation and question arrays to get information
		for(let id of Id){
			this.dataReady_Gen[id] = false;
			this.dataReady_Question[id] = false;
			this.resultsByGeneration[id] = null;
			this.resultByQuestion[id] = null;
		}
		console.log(this.dataReady_Gen);
		console.log(this.dataReady_Question);

		await Helpers.waitUntil(_ => this.dataReady_Gen.every(x => x === false) && this.dataReady_Question.every(x => x === false));
		var i = 0;
		//loop through all generation to get information
		this.all_generation.forEach((Gid: any,index: number) => {
			//Used to get Generation information
			this.dataSrv.getGenerationResultsData(this.surveyId,Gid['gid']).subscribe(
				(res: any) =>{
					this.error = null;
					console.log(Gid,res);
					this.resultsByGeneration[Gid['id']] = res;
					if(res.responder_count > 0){
						this.dropdown_Generation_Items[i] = Gid;
						i++;
					}
				},
				(err) => {
					this.error = err;
					this.resultsByGeneration[Gid['id']] = [];
				},
				() => this.dataReady_Gen[Gid['id']] = true
			);
		});

		//get Year of Service information
		this.dataSrv.getRangeResultsData(this.surveyId,this.Cate,-1,this.rangeType,this.yearRanges).subscribe(
			(res: any) => {
				this.error = null;
				console.log(res);
				this.YoSbyGen = res;
			},
			(err) => {
				this.error = err;
				this.YoSbyGen = [];
			},
			() => this.dataReady_YoS = true
		);

		await Helpers.waitUntil(_ => this.dataReady_Gen.every(x => x === true));

		//sort the dropdown list
		this.dropdown_Generation_Items.sort((a:any,b:any) => a.gid - b.gid);
		this.dataReady_Selection = true;
		await Helpers.waitUntil(_ => this.dataReady_YoS);

		console.log('Generation Data received.');
		console.log(this.resultsByGeneration);
	}
	
	async getQuestionData(){
		console.log('Requesting Question data from backend...');

		await Helpers.waitUntil(_ => this.dataReady_GenerationList && this.dataReady_Gen.every(x => x === true));

		//loop through all generation to get information
		this.all_generation.forEach((Qid: any) => {
			//Used to get question information by generation
			this.dataSrv.getQuestionResultsDataByGeneration(this.surveyId,Qid['gid']).subscribe(
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
			hover:{
				mode: null,

			} ,
			events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
		
			rotation: 180,
			plugins: {
				datalabels: {
					labels: {
						//configuration these for change the data labels
						title: {
							anchor: "end",
							align: "end",
							formatter: (x: number, ctx: Context) => {
								var x = ((x / this.employeeCount) * 100);
								return x.toFixed(AppConfig.decPlaces) + '%\n';
							},
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
	
	refreshGenerationResponseChart():void {
		
		console.log(this.resultsByGeneration);
		var labels: string[] = this.resultsByGeneration
			.filter(function (x){return x.responder_count > 0})
				.map(function (x){
					return x.group['generation_name'];
				}
			);
				
		var Numberdata: number[] = this.resultsByGeneration
			.filter(function (x){return x.responder_count > 0})
				.map(x => {
					if(x != null){
						return x['responder_count'];
					}
				}
			);

		console.log(labels);
		console.log(Numberdata);
		this.generationResponse_Data = {
			labels: 
				labels,
			datasets: [
				{
					label: 'Response Rate by Generation',
					data: Numberdata,
					backgroundColor: ResultsByGenerationComponent.generationColors,
					barThickness: 80,
				}
			],
		};
		this.generationResponse_Opt = {
			hover:{
				mode: null,

			} ,
			events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
		
			rotation: 180,
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
	
	refreshEngagementGenerationChart():void {
		var dataOldGen= this.dataOldGen;
		var dataOld= dataOldGen.map(x => parseFloat(x.score.toFixed(AppConfig.decPlaces))); //// check if should be fixed
		var labels: string[] = this.resultsByGeneration
			.filter(function (x){return x.responder_count > 0})
				.map(x => {
					if((x['responder_count'] > 0)){
						return x.group['generation_name'];
					}
				}
			);

		var data: number[] = this.resultsByGeneration
			.filter(function (x){return x.responder_count > 0})
				.map(x => {
					if((x['responder_count'] > 0)){
						const digitdecimal =  x['score_avg_percent'].toFixed(AppConfig.decPlaces); ///check if should be fixed
						return parseFloat(digitdecimal);
					}
				}
			);
		
		this.generationEngagement_Data = {
			labels: labels,
			datasets: [{
				data: data,
				backgroundColor: ResultsByGenerationComponent.generationColors,
				barThickness: 50,
			}],
		};
		this.c_labels_scoreByGen=labels
		this.generationEngagement_DataOld = {
			labels: labels,
			datasets: [
				{
					label: '2023 1st Round',
						data: dataOld,
						borderColor:'rgba(255,255,255,1)',
						backgroundColor:'rgba(177, 186, 191,1)',//this.createColor(data),//AppConfig.primaryColour, //			
						//categoryPercentage: 0.2, // Adjust this value to control spacing between dataset bars
					 
		
						barPercentage: 0.9,
						maxBarThickness: 60,
						minBarLength: 2,
						//barThickness: 40,
					},
				{
					label: '2023 2nd Round',
				data: data,
				backgroundColor: ResultsByGenerationComponent.generationColors,
				barPercentage: 0.9,
				maxBarThickness: 50,
				minBarLength: 2,
			}],
		};

		this.generationEngagement_Opt = {
			
			plugins: {
				datalabels: {
					anchor: "end",
					align: "end",
					formatter: (x: string, ctx: Context) => x + '%',
					/*font: {
						size: this.fontSize,
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

		/*var yearOfService:number[] = this.resultsByGeneration
			.filter(function (x){return x.responder_count > 0})
				.map(x => {
					const digitdecimal =  x['service_avg'];
					return parseFloat(digitdecimal.toFixed(1));
				}
			);*/

		var labels: string[] = this.resultsByGeneration
			.filter(function (x){return x.responder_count > 0})
				.map(x => {
					if(x != null){
						return x.group['generation_name'];
					}
				}
			);

		var Numberdata: number[] = this.resultsByGeneration
			.filter(function (x){return x.responder_count > 0})
				.map(x => {
					if(x != null){
						return x['responder_count'];
					}
				}
			);
		var Max = Math.max(...Numberdata);

		console.log(labels);

		this.YoSByGen_Data = {
			labels: 
				labels,
			datasets: [
				{
					yAxisID: "yBar",
					type: 'bar',
					label: 'Response Rate by Generation',
					data: Numberdata,
					backgroundColor: ResultsByGenerationComponent.generationColors,
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
		this.YoSByGen_Opt = {
			responsive: true,
			plugins: {
				datalabels: {
					anchor: "end",
					align: "top",
					formatter: (x: number, ctx: Context) => {
						if(ctx.datasetIndex===0){
							return x;
						}else{
							if(ctx.datasetIndex===1){
								return x.toFixed(AppConfig.decPlaces);
							}else{
								return '';
							}
						}
					},	
					//rotation: 270,
					offset: 3,
					display: 'auto',
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
						max: Helpers.ceil_base(Math.max(...yearOfService)+4,2),
						stepSize: 2,
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

	refreshEngagementGenerationByDimensionChart():void {
		if(this.currentGeneration != null){
			var data: any[] = this.resultsByGeneration.map(x => x['score_dimensions']);
			this.dimension_labels = this.dimensionList.map(x => x['dimension_name']);
			console.log(data);
			this.gen_data = data[this.currentGeneration]
				.map(x => {
					const digitdecimal =  (x['score_avg']*100/5).toFixed(AppConfig.decPlaces);
					return parseFloat(digitdecimal);
				});
			console.log(this.gen_data);
		}
	}

	refreshEngagementGenerationByQuestionChart():void {
		if(this.currentGeneration != null){
			var data: any[]  = this.resultByQuestion.map(x => x);
			console.log(data);
			this.questionScoreByGeneration = data[this.currentGeneration].map(x => {
				const digitdecimal =  (x['score_avg']*100/5).toFixed(AppConfig.decPlaces); /// check if should be fixed
				return parseFloat(digitdecimal);
			});
			this.scoreByQuestionLabels = data[this.currentGeneration].map(x => 'Q' + x['question_id']);
			console.log(this.questionScoreByGeneration);
			console.log(this.scoreByQuestionLabels);
		}
	}

	
}
