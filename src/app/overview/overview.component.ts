import { Component, OnInit, ViewChild } from '@angular/core';

import { ChartData, ChartDataSets, ChartOptions } from "chart.js";
import { Context } from 'chartjs-plugin-datalabels';

import { ChartPercentBar_Data } from '../charts/template/template-chart-percent-bars/template-chart-percent-bars.component'

import { AppConfig } from '../config';
import { NewDataService } from "../data/new-data.service";
import { Helpers } from "../helpers";

import * as Models from "../data/data-model-new";

@Component({
	selector: 'app-overview',
	templateUrl: './overview.component.html',
	styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
	
	surveyId = 2;
	
	error: any = null;
	dataReady: boolean = false;
	
	surveyInfo: Models.GetSurveyInfo = null;
	resultsOverview: Models.ResultOverview = null;
	
	employeeCount: number = 100;
	responseCount: number;
	
	surveyDate: Date = null;
	
	dimensionMap: Map<number, string> = new Map();
	
	// ---------------------------------------------------------
	
	response_Rate: string;
	response_Data: ChartData;
	response_Opt: ChartOptions;
	
	c_data_scoreAll: ChartData;
	c_opt_scoreAll: ChartOptions;
	
	c_data_scoreDimension: number[] = null;
	c_labels_scoreDimension: string[];
	
	t_data_scoreDimension: any[];
	t_data_scoreDepartment: any[];
	
	// ---------------------------------------------------------

	fontSize: number = 22;
	barThick: number = 60;

	// ---------------------------------------------------------
	
	constructor(private dataSrv: NewDataService) { }
	
	ngOnInit(): void {
		console.log('Survey ID = ', this.surveyId);
		
		this.getData();
		this.refreshCharts();
		
		this.initGetResultByQuestion();
		this.initGetResultByRange();
	}
	
	ngAfterViewInit(): void {
		setTimeout(() => {}, 2000);		// 2s delay
	}
	
	// ---------------------------------------------------------
	
	getData(): void {
		console.log('Requesting data from backend...');
		
		this.dataSrv.getSurveyInfo(this.surveyId).subscribe(
			(res: Models.GetSurveyInfo) => {
				this.error = null;
				console.log(res);
				
				this.surveyInfo = res;
				
				this.surveyDate = new Date(res.date_created);
				this.employeeCount = res.responder_count;
			},
			(err) => {
				this.error = err;
			}
		);
		
		this.dataSrv.getResultsOverviewEx(this.surveyId, "dims,dept").subscribe(
			(res: Models.ResultOverview) => {
				this.error = null;
				console.log(res);
				
				this.resultsOverview = res;
				this.dataReady = true;
				
				this.responseCount = res.responder_count;
			},
			(err) => {
				this.error = err;
				this.dataReady = false;
			}
		);
	}
	
	// ---------------------------------------------------------
	
	onRefreshData(): void {
		this.dataReady = false;
		this.getData();
		this.refreshCharts();
		this.initGetResultByQuestion();
		this.initGetResultByRange();
	}
	
	async refreshCharts() {
		await Helpers.waitUntil(_ => this.dataReady);
		
		if (this.error == null) {
			this.refreshResponseRateChart();
			this.refreshEngagementChart();
			this.refreshEngagementDimensionChart();
			
			this.resetScoreTables();
		}
	}
	
	refreshResponseRateChart(): void {
		var labels = ["Response", "Non-Response"];
		
		var responseData = [this.responseCount, this.employeeCount - this.responseCount];
		var responseRate = this.responseCount / this.employeeCount * 100;
		
		this.response_Rate = responseRate.toFixed(1) + '%';
		
		this.response_Data = {
			labels: labels,
			datasets: [
				{
					label: "Response Rate",
					data: responseData,
					backgroundColor: [
						AppConfig.primaryColour,
						'rgb(25, 140, 210)'
					],
					hoverBackgroundColor: [
						AppConfig.primaryColour,
						'rgb(25, 140, 210)'
					],
				}
			],
		};
		/*
		this.response_Opt = {
			plugins: {
				datalabels: {
					anchor: "end",
					align: "start",
					formatter: (x: number, ctx: Context) => {
						x = (x / this.employeeCount) * 100;
						return x.toFixed(1) + '%';
					},
				},
				outlabels: {
					text: '%v',
					color: 'white',
					stretch: 20,
					padding: 5,
					font: {
						resizable: true,
						minSize: 12,
						maxSize: 18,
					},
				},
			},
			responsive: true,
			legend: {
				display: false,
				position: 'bottom',
			},
			cutoutPercentage: 40,
			tooltips: {
				callbacks: {
					label: function(tooltipItem, data) {
						var label = data.labels[tooltipItem.index];
						var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
						return label + ' Count: ' + value;
					}
				}
			}
		};
		*/
		
		this.response_Opt = {
			rotation: 90,
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
							formatter: (x: number, ctx: Context) => {
								x = (x / this.employeeCount) * 100;
								return x.toFixed(1) + '%';
							},
						},
						value: {
							//color: this.responseColors,
							anchor: "center",
							align: "center",
							formatter: (x: number, ctx: Context) => x,
						},
					},
					
				},
				/*
				outlabels: {
					//display: false,
					text: '%v',
					color: 'white',
					stretch: 40,
					padding: 5,
					font: {
						resizable: true,
						minSize: 16,
						maxSize: 24,
					},
				},
				*/
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
				enabled: false
			},
		};
		
	}
	refreshEngagementChart(): void {
		var year: string = this.surveyDate.getFullYear().toString();
		
		var avgScore: number = this.resultsOverview.score_avg_percent;
		
		this.c_data_scoreAll = {
			labels: [
				year,
			],
			datasets: [
				{
					label: '',
					data: [avgScore],
					backgroundColor: [
						AppConfig.primaryColour,
					],
					barThickness: 80,
				}
			],
		};
		this.c_opt_scoreAll = {
			plugins: {
				datalabels: {
					anchor: "end",
					align: "end",
					formatter: (x: number, ctx: Context) => x.toFixed(1) + '%',
					
				},
			},
			legend: {
				display: false
			},
			scales: {
				yAxes: [{
					gridLines: {
						display: true,
					},
					ticks: {
						min: 0,
						max: 100,
						stepSize: 20,
						callback: (value: number, index: number, values: any) => (value + '%'),
					}
				}],
			},
			
			tooltips: {
				/*
				callbacks: {
					label: function (tooltipItem, data) {
						//var label = data.labels[tooltipItem.index];
						var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
						return value + '%';
					}
				},
				*/
				enabled: false,
			}
		};
	}
	refreshEngagementDimensionChart(): void {
		var year: string = this.surveyDate.getFullYear().toString();
		
		var dataDimension = this.resultsOverview.score_dimensions;
		
		var groupNames: string[] = dataDimension.map(x => x.dimension_name);
		var groupValues: number[] = dataDimension.map(x => x.score_avg_percent);
		
		this.c_data_scoreDimension = groupValues;
		this.c_labels_scoreDimension = groupNames;
		
		dataDimension.forEach((x, idx) => {
			var id: number = x.dimension_id;
			var name: string = x.dimension_name;
			this.dimensionMap[id] = name;
		});
	}
	
	resetScoreTables(): void {
		{
			var dataDimension = this.resultsOverview.score_dimensions;
		
			this.t_data_scoreDimension = dataDimension.map(x => ({
				id: x.dimension_id,
				name: x.dimension_name,
				score: x.score_avg.toFixed(2),
				scorep: x.score_avg_percent.toFixed(1) + '%',
			}));
			this.t_data_scoreDimension.sort((a, b) => b.score - a.score);	// Descending sort
		}
		{
			var dataDepartment = this.resultsOverview.score_depts;

			this.t_data_scoreDepartment = dataDepartment.map(x => ({
				id: x.department_id,
				name: x.department_name,
				namesh: x.department_name_short,
				score: x.score_avg.toFixed(2),
				scorep: x.score_avg_percent.toFixed(1) + '%',
			}));
			this.t_data_scoreDepartment.sort((a, b) => b.score - a.score);	// Descending sort
		}
	}
	
	// ---------------------------------------------------------
	
	dataReady_ResultByQ: boolean = false;
	
	perQuestionData: any[] = [];
	
	c_data_scoreByQuestion: number[];
	c_labels_scoreByQuestion: string[];
	
	c_data_scorePercentageByQuestion: ChartPercentBar_Data = null;
	c_labels_scorePercentageByQuestion: string[];
	
	c_dataMap_scoreByQuestion_Dims: any[];
	
	// ---------------------------------------------------------
	
	initGetResultByQuestion(): void {
		this.dataReady_ResultByQ = false;
		this.getResultByQuestionData();
		this.refreshResultByQuestionCharts();
	}
	
	getResultByQuestionData(): void {
		console.log('getResultByQuestionData: Requesting data from backend...');
		
		this.dataSrv.getQuestionResultsData(this.surveyId, -1, -1).subscribe(
			(res: Models.ResultQuestionsPercentageMap[]) => {
				this.error = null;
				console.log(res);
				
				this.perQuestionData = [];
				for (var iData of res) {
					var questionNum = iData.question_id;
					var dimensionId = iData.dimension_id;
					var count = iData.score_count;
					var scoreAvg = iData.score_avg;
					var scoreModes = iData.score_modes;
					
					var dataPoint = {
						num: questionNum,
						dim: dimensionId,
						avgPercent: scoreAvg / 5 * 100,
						count: iData.score_count,
						freqNumeric: scoreModes,
						freqPercent: scoreModes.map(x => (x / count) * 100),
					};
					this.perQuestionData.push(dataPoint);
				}
			},
			(err) => {
				this.error = err;
				
				this.perQuestionData = [];
				this.c_data_scoreByQuestion = [];
				this.c_data_scorePercentageByQuestion = null;
			},
			() => this.dataReady_ResultByQ = true,
		);
		
	}
	
	async refreshResultByQuestionCharts() {
		await Helpers.waitUntil(() => this.dataReady && this.dataReady_ResultByQ);
		
		if (this.error == null) {
			console.log(this.perQuestionData);
			
			var getPercentageMapData = (data: any[]): ChartPercentBar_Data => {
				var dataRemap_Per = [...Array(5)].map((_, i: number) => {
					return data.map(x => x.freqPercent[i]);
				});
				var dataRemap_Num = [...Array(5)].map((_, i: number) => {
					return data.map(x => x.freqNumeric[i]);
				});
				return {
					percent: dataRemap_Per,
					numeric: dataRemap_Num,
				};
			};
			
			{
				this.c_data_scoreByQuestion = this.perQuestionData
					.map(x => x.avgPercent);
				this.c_labels_scoreByQuestion = this.perQuestionData
					.map(x => 'Q' + x.num);
				
				this.c_data_scorePercentageByQuestion =
					getPercentageMapData(this.perQuestionData);
				this.c_labels_scorePercentageByQuestion =
					this.perQuestionData.map(x => 'Q' + x.num);
			}
			{
				var dataByDimension: Map<number, any> = Helpers.groupBy(this.perQuestionData, x => x.dim);
				
				this.c_dataMap_scoreByQuestion_Dims = [];
				
				for (var [dimId, listData] of dataByDimension) {
					this.c_dataMap_scoreByQuestion_Dims.push({
						dimName: this.dimensionMap[dimId],
						labels: listData.map(x => 'Q' + x.num),
						qScores: listData.map(x => x.avgPercent),
						qPercentages: getPercentageMapData(listData),
					});
				}
				
				console.log(this.c_dataMap_scoreByQuestion_Dims);
			}
		}
	}
	
	// ---------------------------------------------------------
	
	dataReady_ResultRange_Age: boolean = false;
	dataReady_ResultRange_Year: boolean = false;		// Years/Months of service
	
	byRangeAgeData: any[] = [];
	byRangeYearData: any[] = [];
	
	getAgeRanges = [0, 25, 35, 45, 55, 999];
	c_labels_scoreByRangeAge: string[] = ['Under 25', '25-34', '35-44', '45-54', '55 and Above'];
	c_data_scoreByRangeAge: number[];
	
	getYearRanges = [0, 6, 12, 2 * 12, 6 * 12, 11 * 12, 16 * 12, 21 * 12, 26 * 12, 99999];
	c_labels_scoreByRangeYear: string[] = ['6 Months or less', 'Less than 1 Year',
		'1 Year', '2-5 Years', '6-10 Years', '11-15 Years', '16-20 Years',
		'21-25 Years', '26 Years or longer'];
	c_data_scoreByRangeYear: number[];
	
	// ---------------------------------------------------------
	
	initGetResultByRange(): void {
		this.dataReady_ResultRange_Age = false;
		this.dataReady_ResultRange_Year = false;
		
		this.getResultByRangeData();
		this.refreshResultByRangeCharts();
	}

	getResultByRangeData():void{
		console.log('getResultByRangeData: Requesting data from backend...');

		this.dataSrv.getRangeResultsDataAll(this.surveyId, "age", this.getAgeRanges).subscribe(
			(res: any) => {
				this.error = null;
				console.log(res);
				
				this.byRangeAgeData = res;
			},
			(err) => {
				this.error = err;
				
				this.byRangeAgeData = [];
				this.c_data_scoreByRangeAge = [];
			},
			() => this.dataReady_ResultRange_Age = true
		);
		
		this.dataSrv.getRangeResultsDataAll(this.surveyId, "service", this.getYearRanges).subscribe(
			(res: any) => {
				this.error = null;
				console.log(res);

				this.byRangeYearData = res;
			},
			(err) => {
				this.error = err;

				this.byRangeYearData = [];
				this.c_data_scoreByRangeYear = [];
			},
			() => this.dataReady_ResultRange_Year = true
		);
	}

	async refreshResultByRangeCharts() {
		//console.log('refreshResultByRangeCharts: Waiting for data...');
		
		await Helpers.waitUntil(() => this.dataReady && this.dataReady_ResultRange_Age
			&& this.dataReady_ResultRange_Year);

		if (this.error == null) {
			{
				this.c_data_scoreByRangeAge = this.byRangeAgeData.map(x => x['score_avg_percent']);
			}
			{
				this.c_data_scoreByRangeYear = this.byRangeYearData.map(x => x['score_avg_percent']);
			}
		}
	}
}
