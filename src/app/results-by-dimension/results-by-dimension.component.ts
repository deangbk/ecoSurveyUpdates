import { Component, OnInit } from '@angular/core';

import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';

import { ChartData, ChartOptions } from "chart.js";
import { Context } from 'chartjs-plugin-datalabels';

import { ChartPercentBar_Data } from '../charts/template/template-chart-percent-bars/template-chart-percent-bars.component'

import { AppConfig } from '../config';
import { NewDataService } from "../data/new-data.service";
import { Helpers } from "../helpers";

import * as Models from "../data/data-model-new";

@Component({
	selector: 'app-results-by-dimension',
	templateUrl: './results-by-dimension.component.html',
	styleUrls: ['./results-by-dimension.component.scss'],
	providers: [
		{ provide: BsDropdownConfig, useValue: { isAnimated: true, autoClose: true } },
	],
})
export class ResultsByDimensionComponent implements OnInit {
	
	surveyId = 2;
	
	dataError: any;
	dataReady_DimInfo: boolean = false;
	dataReady_DimData: boolean = false;
	
	currentDimension: number = null;
	dataDimension: Models.ResultByCategoryFilter;
	
	listDepartments: Models.GetAllDeptsFlat[] = null;
	currentDepartmentId: number = null;
	
	// ---------------------------------------------------------
	
	dropdown_Dimensions_Text: string;
	dropdown_Dimensions_Items: any;
	
	tree_Department_Data: any = null;
	dropdown_Department_Text: string;
	
	c_data_engagementScore: ChartData;
	c_opt_engagementScore: ChartOptions;
	
	c_data_scoreMode: number[] = null;
	
	c_data_scoreByRole: number[] = null;	c_labels_scoreByRole: string[];
	c_data_scoreByAge: number[] = null;		c_labels_scoreByAge: string[];
	c_data_deptsOverview: number[] = null;	c_labels_deptsOverview: string[];
	
	c_data_dept_rate: ChartData;			c_opt_dept_rate: ChartOptions;
	c_data_dept_score: ChartData;			c_opt_dept_score: ChartOptions;
	c_data_dept_scoreMode: number[] = null;
	
	// ---------------------------------------------------------
	
	dataReady_ResultByQuestion: boolean = false;
	
	dataResultByQuestion: Models.ResultQuestionsPercentageMap[];
	
	c_data_scoreByQuestion: number[];
	c_labels_scoreByQuestion: string[];
	c_data_scorePercentageByQuestion: ChartPercentBar_Data = null;
	c_labels_scorePercentageByQuestion: string[];
	
	// ---------------------------------------------------------
	
	constructor(private dataSrv: NewDataService) { }
	
	ngOnInit(): void {
		this.dropdown_Dimensions_Text = 'None selected';
		this.dropdown_Dimensions_Items = {};
		
		this.dropdown_Department_Text = 'None selected';
		
		this.refreshDat_DimInfo();
	}
	
	// ---------------------------------------------------------
	
	onSelectDimension(item: any): void {
		console.log('Select dimension: ' + item.id + ' ' + item.name);
		
		this.currentDimension = item.id;
		this.dropdown_Dimensions_Text = item.name;
		
		this.refreshData_DimData();
	}
	
	onSelectDepartment(item: number): void {
		console.log(`Select department: ${item}`);
		
		this.currentDepartmentId = item;
		this.dropdown_Department_Text = this.listDepartments
			.find(x => x['department_id'] == item)['department_name'];
		
		this.refreshData_Departments();
	}
	
	// ---------------------------------------------------------
	
	refreshDat_DimInfo(): void {
		this.dataReady_DimInfo = false;
		this.getDimensionAndDepartmentInfo();
	}
	async getDimensionAndDepartmentInfo() {
		console.log('Requesting data from backend...');
		
		var dimReady = false, depReady = false;
		
		this.dataReady_DimInfo = false;
		
		this.dataSrv.getDimensionList(this.surveyId).subscribe(
			(res: Models.DimensionTable[]) => {
				this.dropdown_Dimensions_Text = 'None selected';
				this.dropdown_Dimensions_Items = res.map((x, index: number) => ({
					id: index + 1,
					name: x.dimension_name,
					name_short: x.dimension_name_short,
				}));
				
				console.log(this.dropdown_Dimensions_Items);
			},
			(err) => {
				this.dropdown_Dimensions_Text = 'Data error';
				this.dropdown_Dimensions_Items = {};
			},
			() => dimReady = true
		);
		
		this.dataSrv.getDepartmentList_Flat(this.surveyId).subscribe(
			(res: Models.GetAllDeptsFlat[]) => {
				console.log(res);
				
				this.listDepartments = res;
				{
					this.tree_Department_Data = null;
					
					var _getChildren = (listChildrenId: number[]) => {
						var listChildren = listChildrenId.map(
							(id: number) => res.find(x => x.department_id == id));
						return listChildren;
					};
					
					// Recursively convert data into a tree
					var _constructTreeNodeFromData = (data: Models.GetAllDeptsFlat) => {
						var node = {
							id: Number(data.department_id),
							name: data.department_name,
							expand: true,
						};
						
						var childrenData: any[] = _getChildren(data.children_ids);
						node['children'] = childrenData.map(x => _constructTreeNodeFromData(x));
						node.expand = childrenData.length > 0;
						
						return node;
					};
					
					this.tree_Department_Data = res
						.filter(x => x.parent_id == null)		// Get only top-level departments
						.map(x => _constructTreeNodeFromData(x));
				}
			},
			(err) => {
				this.listDepartments = [];
				this.tree_Department_Data = null;
			},
			() => depReady = true
		);
		
		await Helpers.waitUntil(() => dimReady && depReady);
		
		this.dataReady_DimInfo = true;
	}
	
	refreshData_DimData(): void {
		this.dataReady_DimData = false;
		this.dataReady_ResultByQuestion = false;
		
		this.getDimensionData();
		this.refreshCharts();
	}
	
	getDimensionData(): void {
		console.log('Requesting data from backend...');
		
		this.dataError = null;
		
		this.dataSrv.getDimensionResultsData(this.surveyId, this.currentDimension).subscribe(
			(res: Models.ResultByCategoryFilter) => {
				console.log(res);
				
				this.dataDimension = res;
			},
			(err) => {
				this.dataError = err;
				this.dataDimension = null;
			},
			() => this.dataReady_DimData = true
		);
		
		this.dataSrv.getQuestionResultsData(this.surveyId, this.currentDimension, -1).subscribe(
			(res: Models.ResultQuestionsPercentageMap[]) => {
				console.log(res);
				
				this.dataResultByQuestion = res;
			},
			(err) => {
				this.dataError = err;
				
				this.c_data_scoreByQuestion = null;
				this.c_labels_scoreByQuestion = null;
				this.c_data_scorePercentageByQuestion = null;
				this.c_labels_scorePercentageByQuestion = null;
			},
			() => this.dataReady_ResultByQuestion = true,
		);
	}
	
	async refreshCharts() {
		await Helpers.waitUntil(_ => this.dataReady_DimData && this.dataReady_ResultByQuestion);
		
		if (this.dataError == null) {
			this.refreshScoreChart();
			this.refreshScoreModeChart();
			this.refreshByRoleChart();
			this.refreshByAgeChart();
			this.refreshByDeptsOverviewChart();
		
			this.refreshResultByQuestionCharts();
		}
	}
	
	refreshScoreChart(): void {
		var avgScore: number = this.dataDimension.score_avg_percent;
		
		this.c_data_engagementScore = {
			labels: ['2023'],
			datasets: [
				{
					label: '',
					data: [avgScore],
					backgroundColor: [
						AppConfig.darkishGreen,
					],
					barThickness: 80,
				}
			],
		};
		this.c_opt_engagementScore = {
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
					}
				}],
			},
			tooltips: {
				callbacks: {
					label: function(tooltipItem, data) {
						// Used any to shut up TypeScript
						//var label = data.labels[tooltipItem.index];
						var value: any = data.datasets[tooltipItem.datasetIndex].data;
						var value2: number = value[tooltipItem.index];
						return value2.toFixed(1) + '%';
					}
				},
				
			}
		};
	}
	refreshScoreModeChart(): void {
		var scoreMode: number[] = this.dataDimension.score_modes;
		
		this.c_data_scoreMode = scoreMode;
	}
	refreshByRoleChart(): void {
		var dataRoles = [...this.dataDimension.score_roles];		// Copy
		dataRoles.sort((a, b) => a.role_id - b.role_id);
		
		var labels: string[] = dataRoles.map(x => x.role_name);
		var data: number[] = dataRoles.map(x => parseFloat(x.score_avg_percent.toFixed(1)));
		
		this.c_labels_scoreByRole = labels;
		this.c_data_scoreByRole = data;
	}
	refreshByAgeChart(): void {
		var dataAges = [...this.dataDimension.score_generations];	// Copy
		dataAges.sort((a, b) => a.generation_id - b.generation_id);
		
		var labels: string[] = dataAges.map(x => x.generation_name);
		var data: number[] = dataAges.map(x => parseFloat(x.score_avg_percent.toFixed(1)));
		
		this.c_labels_scoreByAge = labels;
		this.c_data_scoreByAge = data;
	}
	refreshByDeptsOverviewChart(): void {
		var dataDepts = [...this.dataDimension.score_depts];		// Copy
		
		var labels: string[] = dataDepts.map(x => x.department_name);
		var data: number[] = dataDepts.map(x => parseFloat(x.score_avg_percent.toFixed(1)));
		
		this.c_labels_deptsOverview = labels;
		this.c_data_deptsOverview = data;
	}
	
	refreshResultByQuestionCharts(): void {
		var perQuestionData: any[] = [];
		
		for (var iData of this.dataResultByQuestion) {
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
			perQuestionData.push(dataPoint);
		}

		{
			this.c_data_scoreByQuestion = perQuestionData.map(x => x.avgPercent);
			this.c_labels_scoreByQuestion = perQuestionData.map(x => 'Q' + x.num);

			var dataRemap_Per = [...Array(5)].map((_, i: number) => {
				return perQuestionData.map(x => x.freqPercent[i]);
			});
			var dataRemap_Num = [...Array(5)].map((_, i: number) => {
				return perQuestionData.map(x => x.freqNumeric[i]);
			});

			this.c_data_scorePercentageByQuestion = {
				percent: dataRemap_Per,
				numeric: dataRemap_Num,
			};
			this.c_labels_scorePercentageByQuestion =
				perQuestionData.map(x => 'Q' + x.num);
		}
	}
	
	// ---------------------------------------------------------
	
	dataReady_DepartmentRes: boolean = false;
	selectedDepartmentData: Models.ResultDepartment = null;
	
	dataReady_ResultByQuestionDept: boolean = false;
	dataResultByQuestionDept: Models.ResultQuestionsPercentageMap[];
	
	c_data_scoreByQuestionDept: number[];
	c_labels_scoreByQuestionDept: string[];
	c_data_scorePercentageByQuestionDept: ChartPercentBar_Data = null;
	c_labels_scorePercentageByQuestionDept: string[];
	
	// ---------------------------------------------------------
	
	refreshData_Departments(): void {
		this.dataReady_DepartmentRes = false;
		this.dataReady_ResultByQuestionDept = false;
		
		this.getData_Departments();
		this.refreshDepartmentCharts();
	}
	
	getData_Departments(): void {
		console.log('Requesting data from backend...');
		
		this.dataSrv.getDimensionResultsData_OfDepartment(this.surveyId,
			this.currentDimension, this.currentDepartmentId).subscribe(
				(res: Models.ResultByCategoryFilterSp) => {
					this.selectedDepartmentData = res.score_depts;
					console.log(this.selectedDepartmentData);
				
					this.dataError = null;
				},
				(err) => {
					this.dataError = err;
				
					this.selectedDepartmentData = null;
				},
				() => this.dataReady_DepartmentRes = true
			);
		
		this.dataSrv.getQuestionResultsData(this.surveyId,
			this.currentDimension, this.currentDepartmentId).subscribe(
				(res: Models.ResultQuestionsPercentageMap[]) => {
					console.log(res);

					this.dataResultByQuestionDept = res;
				},
				(err) => {
					this.dataError = err;

					this.c_data_scoreByQuestionDept = null;
					this.c_labels_scoreByQuestionDept = null;
					this.c_data_scorePercentageByQuestionDept = null;
					this.c_labels_scorePercentageByQuestionDept = null;
				},
				() => this.dataReady_ResultByQuestionDept = true,
			);
	}
	async refreshDepartmentCharts() {
		await Helpers.waitUntil(_ =>
			this.dataReady_DepartmentRes && this.dataReady_ResultByQuestionDept);
		
		if (this.dataError == null) {
			var population = this.listDepartments.find(
				x => x.department_id == this.currentDepartmentId).population_sum;
			
			var countResponse: number = this.selectedDepartmentData.responder_count;
			var avgScore: number = this.selectedDepartmentData.score_avg_percent;
			var scoreModes: number[] = this.selectedDepartmentData.score_modes;
		
			this.refreshDepartmentChart_ResponseRate(countResponse, population);
			this.refreshDepartmentChart_Score(avgScore);
			this.refreshDepartmentChart_ScoreModes(scoreModes);
			
			this.refreshDepartmentChart_Questions();
		}
	}
	
	refreshDepartmentChart_ResponseRate(countResponse: number, countPopulation: number) {
		console.log(`Response count = ${countResponse}, Population = ${countPopulation}`);
		var labels = ["Response","Non-Response"];
		this.c_data_dept_rate = {
			labels: labels,
			datasets: [
				{
					label: "Response Count",
					data: [countResponse, countPopulation - countResponse],
					backgroundColor: [
						AppConfig.primaryColour,
						'rgb(25, 140, 210, 1)'
					],
				}
			],
		};
		this.c_opt_dept_rate = {
			plugins: {
				datalabels: {
					labels: {
						title: {
							anchor: "end",
							align: "end",

							formatter: (x: number, ctx: Context) => {var x=(((x/(countPopulation + countResponse)))*100);return x.toFixed(1) + '%\n';},
							//formatter: (x: number, ctx: Context) => {var y=x;x=(x/this.employeeCount)*100;return x.toFixed(1) + '%\n  '+y;},
						},
						value: {
							//color: this.responseColors,
							anchor: "center",
							align: "center",			
							formatter: (x: number, ctx: Context) => x,
						}
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
					padding: 30
					
				},
			},
			cutoutPercentage: 40,
			tooltips: {
				enabled: false
			},
		}
	}
	refreshDepartmentChart_Score(avgScore: number) {
		this.c_data_dept_score = {
			labels: [
				2023,
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
		this.c_opt_dept_score = {
			plugins: {
				datalabels: {
					anchor: "end",
					align: "end",
					formatter: (x: number, ctx: Context) => x.toFixed(2) + '%',
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
					}
				}],
			},
			tooltips: {
				enabled: false
			},
		}
	}
	refreshDepartmentChart_ScoreModes(scoreModes: number[]) {
		this.c_data_dept_scoreMode = scoreModes;
	}
	
	refreshDepartmentChart_Questions(): void {
		var perQuestionData: any[] = [];

		for (var iData of this.dataResultByQuestionDept) {
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
			perQuestionData.push(dataPoint);
		}

		{
			this.c_data_scoreByQuestionDept = perQuestionData.map(x => x.avgPercent);
			this.c_labels_scoreByQuestionDept = perQuestionData.map(x => 'Q' + x.num);

			var dataRemap_Per = [...Array(5)].map((_, i: number) => {
				return perQuestionData.map(x => x.freqPercent[i]);
			});
			var dataRemap_Num = [...Array(5)].map((_, i: number) => {
				return perQuestionData.map(x => x.freqNumeric[i]);
			});

			this.c_data_scorePercentageByQuestionDept = {
				percent: dataRemap_Per,
				numeric: dataRemap_Num,
			};
			this.c_labels_scorePercentageByQuestionDept =
				perQuestionData.map(x => 'Q' + x.num);
		}
	}
}
