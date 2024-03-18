import { Component, OnInit } from '@angular/core';

import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';

import { ChartData, ChartOptions } from "chart.js";
import { Context } from 'chartjs-plugin-datalabels';

import { ChartPercentBar_Data } from '../charts/template/template-chart-percent-bars/template-chart-percent-bars.component'

import { AppConfig } from '../config';
import { NewDataService } from "../data/new-data.service";
import { Helpers } from "../helpers";
import { DimDifferenceService} from "../data/dim-difference.service";
import { BottomScores} from "../data/dim-difference.service";

import * as Models from "../data/data-model-new";

import { ResultsByGenerationComponent } from "../results-by-generation/results-by-generation.component";

@Component({
	selector: 'app-results-by-department',
	templateUrl: './results-by-department.component.html',
	styleUrls: ['./results-by-department.component.scss'],
	providers: [
		{ provide: BsDropdownConfig, useValue: { isAnimated: true, autoClose: true } },
	],
})

export class ResultsByDepartmentComponent implements OnInit {
	
	surveyId = 2;
	
	dataError: any;
	dataReady_DeptList: boolean = false;
	
	listDepartments: Models.GetAllDeptsFlat[] = null;
	selectedDepartmentId: number = null;
	
	// ---------------------------------------------------------
	
	tree_Department_Data: any = null;
	tree_Department_Text: string;
	
	// ---------------------------------------------------------
	
	constructor(private dataSrv: NewDataService, private dimDrv: DimDifferenceService, private dimBot:BottomScores) { }

	ngOnInit(): void {
		this.tree_Department_Text = 'None selected';

		this.refreshDeptList();
		this.getGenerationListData();
	
	}

	// ---------------------------------------------------------
	
	onSelectDepartment(item: number): void {
		// The console statement has been removed.log(`Select department: ${item}`);
		// comment out all //console.log statements

		
		this.selectedDepartmentId = item;
		this.tree_Department_Text = this.listDepartments
			.find(x => x.department_id == item).department_name;
		
		this.refreshDepartmentData();
	}
	
	// ---------------------------------------------------------
	
	refreshDeptList(): void {
		////console.log('Requesting data from backend...');
		
		this.dataError = null;
		this.dataReady_DeptList = false;
		
		this.dataSrv.getDepartmentList_Flat(this.surveyId).subscribe(
			(res: Models.GetAllDeptsFlat[]) => {
				////console.log(res);
				
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
				
				this.dataError = err;
			},
			() => this.dataReady_DeptList = true
		);
	}
	
	// ---------------------------------------------------------
	
	dataReady_DeptData: boolean = false;
	dataReady_SubDeptData: boolean = false;
	dataReady_SubDeptDataOld: boolean = false;
	dataReady_ResultByQuestion: boolean = false;
	dataReady_OldDeptData : boolean = false;
	dataReady_dataSubDepartmentOld : boolean = false;
	dataReady_dataOverallOld : boolean = false;
	dataReady_dataDimOld : boolean = false;
	dataReady_dataOldGen : boolean = false;
	dataReady_dataOldRole : boolean = false;
	overview_r1: number=0;
overview_r2: number=0;
lable_overview: string;
	
	dataSelectedDepartment: Models.ResultByCategoryFilter = null;
	dataSubDepartment: Models.ResultSubdepts = null;
	dataResultByQuestion: any[];
	
	// ----------------------------------
	
	c_data_responseRate: ChartData;
	c_opt_responseRate: ChartOptions;
	
	c_data_engagementScore: ChartData;
	c_opt_engagementScore: ChartOptions;
	
	c_data_scoreMode: number[] = [];

	c_data_scoreByRole: number[] = []; c_labels_scoreByRole: string[] = [];
	c_data_scoreByAge: number[] = []; c_labels_scoreByAge: string[] = [];
	c_data_dimensions: number[] = []; c_labels_dimensions: string[] = [];
	c_color_generations: string[] = ResultsByGenerationComponent.generationColors;
	
	c_data_dimensionScoreModes: any[] = [];
	
	t_data_scoreDimension: any[];

	//c_data_scorebySubDept: any[] = []; c_labels_scorebySubDept: string[] = [];
	c_data_scorebySubDept: ChartData;
	c_data_scorebySubDeptOld: ChartData;
	c_opt_scorebySubDept: ChartOptions;
	c_data_scorebyDeptDim: ChartData;
	c_data_scorebyDeptDimVertical: ChartData;
	c_data_scorebyAgeOld: ChartData;
	c_data_scorebyRoleOld: ChartData;

	c_data_scoreByQuestion: number[];
	c_labels_scoreByQuestion: string[];
	c_data_scorePercentageByQuestion: ChartPercentBar_Data = null;
	c_labels_scorePercentageByQuestion: string[];
	oldDimensionScores: number[];
	
	c_dataMap_scoreByQuestion_Dims: any[];
	dataSubDepartmentOld: Models.ResultOldData[] = null;
	dataOverallOld: Models.OldDataTable[] = null;
	dataDimOld:Models.OldDataTable[]= null;
	dataSubOld:Models.OldDataTable[]= null;
	dataOldGen:Models.OldDataTable[]= null;
	dataOldRole:Models.OldDataTable[]= null;

	///
	dimComparison: Partial<Models.DimensionComparison> = {};
	//dimComparison: Models.DimensionComparison;
	combinedData: { data: number; dataYear: number; label: string }[] = [];

	// ---------------------------------------------------------
	
	refreshDepartmentData(): void {
		this.dataError = null;
		this.dataReady_DeptData = false;
		this.dataReady_SubDeptData = false;
		this.dataReady_OldDeptData = false;
		this.dataReady_ResultByQuestion = false;
		this.dataReady_dataSubDepartmentOld = false;
		
		this.getDepartmentData();
		this.refreshDepartmentDataCharts();
	}
	
	getDepartmentData(): void {
		////console.log('Requesting data from backend...');

		this.dataSrv.getDepartmentResultsData(this.surveyId, this.selectedDepartmentId).subscribe(
			(res: Models.ResultByCategoryFilter) => {
				////console.log(res);
				this.dataError = null;
				this.dataSelectedDepartment = res;
			},
			(err) => {
				this.dataError = err;
				this.dataSelectedDepartment = null;
			},
			() => {this.dataReady_DeptData = true;
				var dataAges = [...this.dataSelectedDepartment.score_generations];	// Copy
				dataAges.sort((a, b) => a.generation_id - b.generation_id);
				
				this.setGenerationColours(dataAges.map(x => x.generation_name));
			}
		);
		
		this.dataSrv.getSubDepartmentResultsData(this.surveyId, this.selectedDepartmentId).subscribe(
			(res: Models.ResultSubdepts) => {
				////console.log(res);
				this.dataError = null;
				this.dataSubDepartment = res;
			},
			(err) => {
				this.dataError = err;
				this.dataSubDepartment = null;
			},
			() => this.dataReady_SubDeptData = true
		);
		this.dataSrv.getOldDepartmentResultsData(this.surveyId, this.selectedDepartmentId).subscribe(
			(res: Models.ResultOldData[] ) => {
				//console.log(res);
				this.dataError = null;
				this.dataSubDepartmentOld = res;
			},
			(err) => {
				this.dataError = err;
				this.dataSubDepartment = null;
			},
			() => this.dataReady_dataSubDepartmentOld = true
		);
		this.dataSrv.getOldDepartmentOverallData(this.surveyId,this.selectedDepartmentId).subscribe(
			(res: Models.OldDataTable[] ) => {
				//console.log(res);
				this.dataError = null;
				this.dataOverallOld = res;
			},
			(err) => {
				this.dataError = err;
				this.dataOverallOld = null;
			},
			() => this.dataReady_dataOverallOld = true
		);

		this.dataSrv.getOldDimResultsData(this.surveyId,this.selectedDepartmentId).subscribe(
			(res: Models.OldDataTable[] ) => {
				//console.log(res);
				this.dataError = null;
				this.dataDimOld = res;
			},
			(err) => {
				this.dataError = err;
				this.dataDimOld= null;
			},
			() => this.dataReady_OldDeptData  = true
		);
		///gets old scores based on sub departments
		this.dataSrv.old_subScores(this.surveyId,this.selectedDepartmentId).subscribe(
			(res: Models.OldDataTable[] ) => {
				//console.log(res);
				this.dataError = null;
				this.dataSubOld = res;
			},
			(err) => {
				this.dataError = err;
				this.dataSubOld= null;
			},
			() => this.dataReady_dataSubDepartmentOld  = true
		);
			///gets old scores based on sub departments & generation
			this.dataSrv.getOldResultsFilter(this.surveyId,this.selectedDepartmentId,0,0,0,0,"GenerationDep").subscribe(
				(res: Models.OldDataTable[] ) => {
					//console.log(res);
					this.dataError = null;
					this.dataOldGen = res;
					//console.log("Old Gen data");
					//console.log(this.dataOldGen);
				},
				(err) => {
					this.dataError = err;
					this.dataOldGen= null;
				},
				() => this.dataReady_dataOldGen  = true
			);

			this.dataSrv.getOldResultsFilter(this.surveyId,this.selectedDepartmentId,0,0,0,0,"RoleDep").subscribe(
				(res: Models.OldDataTable[] ) => {
					//console.log(res);
					this.dataError = null;
					this.dataOldRole = res;
					//console.log("Old Role data");
					//console.log(this.dataOldRole);
				},
				(err) => {
					this.dataError = err;
					this.dataOldRole =null;
				},
				() => this.dataReady_dataOldRole  = true
			);
		
		this.dataSrv.getQuestionResultsData(this.surveyId,
			-1, this.selectedDepartmentId).subscribe(
				(res: Models.ResultQuestionsPercentageMap[]) => {
					//console.log(res);
					this.dataError = null;
					this.dataResultByQuestion = res;
				},
				(err) => {
					this.dataError = err;
					
					this.dataResultByQuestion = null;
					this.c_data_scoreByQuestion = null;
					this.c_labels_scoreByQuestion = null;
					this.c_data_scorePercentageByQuestion = null;
					this.c_labels_scorePercentageByQuestion = null;
				},
				() => this.dataReady_ResultByQuestion = true,
			);
	}
	
	refreshDepartmentDataCharts() {
		this.refreshDepartmentDataCharts_Main();
		this.refreshDepartmentDataCharts_Sub();
		this.refreshDepartmentDataCharts_ByQ();
	}
	async refreshDepartmentDataCharts_Main() {
		await Helpers.waitUntil(() => this.dataReady_DeptData && this.dataReady_dataOldGen);
		
		this.refreshResponseRateChart();
		this.refreshScoreChart();
		this.refreshScoreModeChart();
		this.refreshByRoleChart();
		this.refreshByAgeChart();
		this.refreshByDimensionsChart();
		this.refreshDimensionsScoreModesChart();
		
		this.resetScoreTables();
	}
	async refreshDepartmentDataCharts_Sub() {
		await Helpers.waitUntil(() => this.dataReady_SubDeptData && this.dataReady_dataSubDepartmentOld);
		
		this.refreshBySubDeptsChart();
	}
	async refreshDepartmentDataCharts_ByQ() {
		await Helpers.waitUntil(() => this.dataReady_DeptData && this.dataReady_ResultByQuestion);
		
		this.refreshByQuestionsChart();
	}
	
	refreshResponseRateChart(): void {
		var responseCount = this.dataSelectedDepartment.responder_count;
		var totalPopulation = this.listDepartments.find(
			x => x.department_id == this.selectedDepartmentId).population_sum;
		
		//console.log('Dept total population: ' + totalPopulation);
		
		var labels = ["Response", "Non-Response"];
		
		if (responseCount > totalPopulation) {
			console.error("ERROR: Responder count is more than the dept population");
			
			totalPopulation = responseCount;
		}
		
		var nonResponseCount = totalPopulation - responseCount;
		var responseData = [responseCount, nonResponseCount];
		var responseRate = responseCount / totalPopulation * 100;
		this.dimComparison.ResponseRate = parseFloat(responseRate.toFixed(AppConfig.decPlaces)); ///check this should it be fixed here
		this.dimComparison.ResponseTotal = responseCount;
		this.dimComparison.ResponsePotential = totalPopulation;

		this.c_data_responseRate = {
			labels: labels,
			datasets: [
				{
					label: "Response Rate",
					data: responseData,
					backgroundColor: [
						AppConfig.darkishGreen,
						AppConfig.responseOrange
					],
				}
			],
		};
		this.c_opt_responseRate = {
			plugins: {
				datalabels: {
					labels: {
						title: {
							anchor: "end",
							align: "end",
							formatter: (x: number, ctx: Context) => {
								x = (x / totalPopulation) * 100;
								return x.toFixed(AppConfig.decPlaces) + '%';
							},
						},
						value: {
							//color: this.responseColors,
							anchor: "center",
							align: "center",
							formatter: (x: number, ctx: Context) => x.toString(),
						},
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
				labels: {
					padding: 30,
					fontSize: AppConfig.donutFontSize,
				}
			},
			cutoutPercentage: 40,
			tooltips: {
				enabled: false
			},
		};
	}
	
	refreshScoreChart(): void {
	// 	var avgScore: number = this.dataSelectedDepartment.score_avg_percent
		
	// 	this.c_data_engagementScore = {
	// 		datasets: [
	// 			{
	// 				label: '',
	// 				data: [avgScore],
	// 				backgroundColor: [
	// 					AppConfig.primaryColour,
	// 				],
	// 				barThickness: 80,
	// 			}
	// 		],
	// 	};
	// 	this.c_opt_engagementScore = {
	// 		plugins: {
	// 			datalabels: {
	// 				anchor: "end",
	// 				align: "end",
	// 				formatter: (x: number, ctx: Context) => x.toFixed(1) + '%',
	// 			},
	// 		},
	// 		legend: {
	// 			display: false
	// 		},
	// 		scales: {
	// 			yAxes: [{
	// 				gridLines: {
	// 					display: true,
	// 				},
	// 				ticks: {
	// 					min: 0,
	// 					max: 100,
	// 					stepSize: 20,
	// 				}
	// 			}],
	// 		}
	// 	};
	// }

	const currentDate = new Date();
	const currentYear = currentDate.getFullYear();
			var avgScore: number = this.dataSelectedDepartment.score_avg_percent
			var datasets: any[] = [3];
			var OldScores=this.dataOverallOld;
			var overData=OldScores.map(x => parseFloat(x.score.toFixed(AppConfig.decPlaces))); ///check if should be fixed here
			var overLabels=OldScores.map(x => x.label);
			
			this.dimComparison.DifOverall = parseFloat((avgScore-overData[0]).toFixed(AppConfig.decPlaces)); ///check if should be fixed
			overData.push(avgScore);
			this.overview_r1=overData[0];
			this.overview_r2=avgScore;
			overLabels.push("2023 2nd Round");
			// datasets[0]=	{
			// 			label: '',
			// 			data: [avgScore],
			// 			backgroundColor: [
			// 				AppConfig.primaryColour,
			// 			],
			// 			//barThickness: 40,
			// 			barPercentage: 0.9,
			// 		maxBarThickness: 40,
			// 		minBarLength: 2,
			// 		};
			
			//  for (var i = 0; i < OldScores.length; i++) {
			// 	datasets[i+1]={
			// 		label: OldScores[i].year,
			// 		data: [OldScores[i].score],
			// 		backgroundColor: [AppConfig.primaryColour],
			// 		//barThickness: 40,
			// 		barPercentage: 0.9,
			// 		maxBarThickness: 40,
			// 		minBarLength: 2,
			// 	  };
			// //console.log("Old Overall: "+OldScores[i].score);
			//  }
		
			
			this.c_data_engagementScore = {
				labels: overLabels,
			//	datasets: datasets,
				datasets: [
					{
						label: 'Average Score',
						data: overData,
						backgroundColor: ['rgba(178, 178, 178,1)',AppConfig.darkishGreen],
						//	AppConfig.primaryColour,
						
						barThickness: 80,
					}
	
	
				],
			};
			this.c_opt_engagementScore = {
				plugins: {
					datalabels: {
						anchor: "end",
						align: "end",
						formatter: (x: number, ctx: Context) => x.toFixed(AppConfig.decPlaces) + '%',
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
				}
			};
		}
	refreshScoreModeChart(): void {
		var scoreMode: number[] = this.dataSelectedDepartment.score_modes;
		
		this.c_data_scoreMode = scoreMode;
	}
	refreshByRoleChart(): void {
		var dataRoles = [...this.dataSelectedDepartment.score_roles];		// Copy
		dataRoles.sort((a, b) => a.role_id - b.role_id);
		var OldScores=this.dataOldRole;
		OldScores.sort((a, b) => a.Role- b.Role);
		
		var labels: string[] = dataRoles.map(x => x.role_name);
		var data: number[] = dataRoles.map(x => x.score_avg_percent);
		var dataOld: number[] = OldScores.map(x => parseFloat(x.score.toFixed(AppConfig.decPlaces))); ////check if should be fixed here
		
		this.c_labels_scoreByRole = labels;
		this.c_data_scoreByRole = data;
		this.c_data_scorebyRoleOld={
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
			},{
				label: '2023 2nd Round',
				data:data,// [10, 4, 16,70, 60, 20, 50],//
				borderColor:'rgba(255,255,255,1)',
				backgroundColor:this.createColor(data),//rgba(0, 109, 177,1)', //
				//barThickness: 40,

				barPercentage: 0.9,
				maxBarThickness: 60,
				minBarLength: 2,
				//categoryPercentage: 0.2, // Adjust this value to control spacing between dataset bars
			
				//barThickness: 40,
			}
		]}
	}
	refreshByAgeChart(): void {
		var dataAges = [...this.dataSelectedDepartment.score_generations];	// Copy
		dataAges.sort((a, b) => a.generation_id - b.generation_id);
		var OldScores=this.dataOldGen;
		
		var labels: string[] = dataAges.map(x => x.generation_name);
		var data: number[] = dataAges.map(x => parseFloat(x.score_avg_percent.toFixed(AppConfig.decPlaces))); ///check if should be fixed yet
		var dataOld: number[] = OldScores.map(x => parseFloat(x.score.toFixed(AppConfig.decPlaces )));  ///check if should be fixed
		var idsOld: number[] = OldScores.map(x => x.generation_Id);
		var mapGenId: number[] = dataAges.map(x => x.generation_id);
		var oldScoresNewMap: number[] = [];
		//console.log("Old Gen Ids"+idsOld);
		//console.log("new lgens"+mapGenId);
		var maxLen = Math.max(mapGenId.length, idsOld.length)
 		for (var i = 0; i < mapGenId.length; i++) {
							
				var index = idsOld.indexOf(mapGenId[i]);
				if (index != -1)
				{
				oldScoresNewMap[i]=dataOld[index];	
				}	
				else
				{
					oldScoresNewMap[i]=0;
				}	
		}

		this.c_labels_scoreByAge = labels;
		this.c_data_scoreByAge = data;

		this.c_data_scorebyAgeOld={
			labels: labels,
			datasets: [
				
			
			{
			label: '2023 1st Round',
				data: oldScoresNewMap,//dataOld,
				borderColor:'rgba(255,255,255,1)',
				backgroundColor:'rgba(177, 186, 191,1)',//this.createColor(data),//AppConfig.primaryColour, //			
				//categoryPercentage: 0.2, // Adjust this value to control spacing between dataset bars
			 

				barPercentage: 0.9,
				maxBarThickness: 60,
				minBarLength: 2,
				//barThickness: 40,
			},{
				label: '2023 2nd Round',
				data:data,// [10, 4, 16,70, 60, 20, 50],//
				borderColor:'rgba(255,255,255,1)',
				backgroundColor:this.c_color_generations,//rgba(0, 109, 177,1)', //
				//barThickness: 40,

				barPercentage: 0.9,
				maxBarThickness: 60,
				minBarLength: 2,
				//categoryPercentage: 0.2, // Adjust this value to control spacing between dataset bars
			
				//barThickness: 40,
			}
		]}


	}
	refreshByDimensionsChart(): void {
		var dataDims = this.dataSelectedDepartment.score_dimensions;
		
		var labels: string[] = dataDims.map(x => x.dimension_name);
		var data: number[] = dataDims.map(x => parseFloat(x.score_avg_percent.toFixed(AppConfig.decPlaces))); /// check if should be fixed here
		var textLen = dataDims.length >= 4 ? 6 : (128 / dataDims.length);
		var labelsWrap = labels.map(x => Helpers.wrapText(x, textLen));

		this.c_labels_dimensions = labels;
		this.c_data_dimensions = data;

////// get data for multiple datasets chart
var oldData=this.dataDimOld;

//console.log(labelsWrap);
//console.log("OldLables");
var dataYear: number[] = oldData.map(x => parseFloat(x.score.toFixed(AppConfig.decPlaces))); ///check if should be fixed
///needs to be sorted by the original data scores.... not sure how
this.oldDimensionScores=dataYear;
/// get max score dimension
let maxScore = Math.max.apply(null, data);

// Find the index of the maximum value using indexOf
let indexOfMaxScore = data.indexOf(maxScore);
//get minimum dimension
let minScore = Math.min.apply(null, data);

// Find the index of the minimum value using indexOf
let indexOfMinScore = data.indexOf(minScore);

//// setting values for the table to display
	var rst = this.dimDrv.findLargestDifference(data,dataYear);
	var botRst=this.dimBot.bot3(data);
	//console.log(rst);
	this.dimComparison.DimIncrease = parseFloat(rst.largestDifference.toFixed(AppConfig.decPlaces)); ////check if should be fixed here
	this.dimComparison.DimInceasedName = labels[rst.largestDifferenceIndex];//labels[rst.largestDifferenceIndex];
	this.dimComparison.TopDim=labels[indexOfMaxScore];
	this.dimComparison.TopScore=maxScore;
	this.dimComparison.BotDim=labels[indexOfMinScore];
	this.dimComparison.BotScore=minScore;
	this.dimComparison.BotDims=botRst.indicesOfBottom3Scores.map(score => labels[score]);
	this.dimComparison.TopDims=botRst.indicesOfTop3Scores.map(score => labels[score]);
	this.dimComparison.BotScores=botRst.bottom3Scores;
	this.dimComparison.TopScores=botRst.top3Scores;
	this.dimComparison.DimDecrease = parseFloat(rst.largestNegativeDifference.toFixed(AppConfig.decPlaces));   ////check if should be fixed here
	this.dimComparison.DimDecreaseName =rst.largestNegativeDifferenceIndex==-1?"No Negative": labels[rst.largestNegativeDifferenceIndex];

//Creating the data for table
this.combinedData = data.map((value, index) => ({
	data: value,
	dataYear: dataYear[index],
	label: labels[index]
  }));
  this.combinedData.sort((a, b) => b.data - a.data);



this.c_data_scorebyDeptDim={

	labels: labels,
			datasets: [
				{
					label: '2023 1st Round',
						data: dataYear,
						borderColor:'rgba(255,255,255,1)',
						backgroundColor:'rgba(177, 186, 191,1)',//'rgba(0, 109, 177,1)',//this.createColor(data),//AppConfig.primaryColour, //			
						//categoryPercentage: 0.2, // Adjust this value to control spacing between dataset bars
					 
		
						barPercentage: 0.9,
						maxBarThickness: 40,
						minBarLength: 2,
						//barThickness: 40,
					},
				
			{
				label: '2023 2nd Round',
				data:data,// [10, 4, 16,70, 60, 20, 50],//
				borderColor:'rgba(255,255,255,1)',
				backgroundColor:this.createColor(data), //
				//barThickness: 40,

				barPercentage: 0.9,
				maxBarThickness: 40,
				minBarLength: 2,
				//categoryPercentage: 0.2, // Adjust this value to control spacing between dataset bars
			
				//barThickness: 40,
			},
			
		]}

		this.c_data_scorebyDeptDimVertical={
			labels: labelsWrap,
			datasets: [
				
			
			{
			label: '2023 1st Round',
				data: dataYear,
				borderColor:'rgba(255,255,255,1)',
				backgroundColor:'rgba(177, 186, 191,1)',//this.createColor(data),//AppConfig.primaryColour, //			
				//categoryPercentage: 0.2, // Adjust this value to control spacing between dataset bars
			 

				barPercentage: 0.9,
				maxBarThickness: 60,
				minBarLength: 2,
				//barThickness: 40,
			},{
				label: '2023 2nd Round',
				data:data,// [10, 4, 16,70, 60, 20, 50],//
				borderColor:'rgba(255,255,255,1)',
				backgroundColor:'rgba(0, 109, 177,1)', //
				//barThickness: 40,

				barPercentage: 0.9,
				maxBarThickness: 60,
				minBarLength: 2,
				//categoryPercentage: 0.2, // Adjust this value to control spacing between dataset bars
			
				//barThickness: 40,
			}
		]}


	}
	refreshDimensionsScoreModesChart(): void {
		var dataDepts = this.dataSelectedDepartment.score_dimensions;
		
		var scoreModes: any[] = dataDepts.map(x => ({
			title: x.dimension_name,
			score: x.score_modes,
		}));
		//console.log(scoreModes);
		
		this.c_data_dimensionScoreModes = scoreModes;
	}
	
	resetScoreTables(): void {
		var dataDimension = this.dataSelectedDepartment.score_dimensions;
		
		this.t_data_scoreDimension = dataDimension.map(x => ({
			id: x.dimension_id,
			name: x.dimension_name,
			score: x.score_avg.toFixed(AppConfig.decPlaces),
			scorep: x.score_avg_percent.toFixed(AppConfig.decPlaces) + '%',
		}));
		this.t_data_scoreDimension.sort((a, b) => b.score - a.score);	// Descending sort
	}
	
	refreshBySubDeptsChart(): void {
		var dataSubDepts = this.dataSubDepartment.score_subdepts;
		var dataSubOld = this.dataSubOld;
		//console.log("Old sub data "+ dataSubOld);
		var labels: string[] = dataSubDepts.map(x => x.department_name);
		var data: number[] = dataSubDepts.map(x => parseFloat(x.score_avg_percent.toFixed(AppConfig.decPlaces))); ///cehck if should be fixed here
		var dataOld: number[] = dataSubOld.map(x => parseFloat(x.score.toFixed(AppConfig.decPlaces)));
		
		/*
		this.c_labels_scorebySubDept = labels;
		this.c_data_scorebySubDept = data;
		*/
		labels.unshift(this.tree_Department_Text);
		data.unshift(this.overview_r2);
		dataOld.unshift(this.overview_r1);
		var textLen = dataSubDepts.length >= 4 ? 12 : (128 / dataSubDepts.length);
		var labelsWrap = labels.map(x => Helpers.wrapText(x, textLen));
		
		
		//console.log('Wrapping text with max length = ', textLen);
		
		this.c_data_scorebySubDept = {
			labels: labelsWrap,
			datasets: [{
				label: '',
				data: data,
				backgroundColor:this.createColor(data),//AppConfig.primaryColour, //
				barThickness: 60,
			}],
		};
		this.c_opt_scorebySubDept = {
			plugins: {
				datalabels: {
					anchor: "end",
					align: "end",
					formatter: (x: number, ctx: Context) => x.toFixed(AppConfig.decPlaces) + '%',
				},
			},
			legend: {
				display: false
			},
			scales: {
				yAxes: [
					{
						gridLines: {
							display: true,
						},
						ticks: {
							min: 0,
							max: 100,
							stepSize: 20,
							callback: (value: number, index: number, values: any) => (value + '%'),
						},
					}
				],
			},
			tooltips: {
				enabled: false,
			},
		};
//// set chart data for old data
		this.c_data_scorebySubDeptOld = {
			labels: labelsWrap,
			datasets: [
				{
					label: '2023 1st Round',
					data: dataOld,
					backgroundColor:'rgba(152, 170, 179,1)',//AppConfig.primaryColour, //
					
					barPercentage: 0.9,
					maxBarThickness: 60,
					minBarLength: 2,
				},
				{
				label: '2023 2nd Round',
				data: data,
				backgroundColor:this.createColor(data),//AppConfig.primaryColour, //
			
				barPercentage: 0.9,
				maxBarThickness: 60,
				minBarLength: 2,
			}
			
		],
		};
		this.c_opt_scorebySubDept = {
			plugins: {
				datalabels: {
					anchor: "end",
					align: "end",
					formatter: (x: number, ctx: Context) => x.toFixed(AppConfig.decPlaces) + '%',
				},
			},
			legend: {
				display: false
			},
			scales: {
				yAxes: [
					{
						gridLines: {
							display: true,
						},
						ticks: {
							min: 0,
							max: 100,
							stepSize: 20,
							callback: (value: number, index: number, values: any) => (value + '%'),
						},
					}
				],
			},
			tooltips: {
				enabled: false,
			},
		};
	}
	
	refreshByQuestionsChart(): void {
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
			this.c_data_scoreByQuestion = perQuestionData
				.map(x => x.avgPercent);
			this.c_labels_scoreByQuestion = perQuestionData
				.map(x => 'Q' + x.num);

			this.c_data_scorePercentageByQuestion =
				getPercentageMapData(perQuestionData);
				////console.log("questionpercantage data")
			//	//console.log(this.c_data_scorePercentageByQuestion );
			this.c_labels_scorePercentageByQuestion =
				perQuestionData.map(x => 'Q' + x.num);
		}
		{
			var dataDepts = this.dataSelectedDepartment.score_dimensions;
			var dimensionMap: Map<number, string> = new Map();
			dataDepts.forEach((x, idx) => {
				var id: number = x.dimension_id;
				var name: string = x.dimension_name;
				dimensionMap[id] = name;
			});
			
			var dataByDimension: Map<number, any> = Helpers.groupBy(perQuestionData, x => x.dim);

			this.c_dataMap_scoreByQuestion_Dims = [];

			for (var [dimId, listData] of dataByDimension) {
				this.c_dataMap_scoreByQuestion_Dims.push({
					dimName: dimensionMap[dimId],
					labels: listData.map(x => 'Q' + x.num),
					qScores: listData.map(x => x.avgPercent),
					qPercentages: getPercentageMapData(listData),
				});
			}
			
			//console.log(this.c_dataMap_scoreByQuestion_Dims);
		}
	}
	
	// ---------------------------------------------------------

	dataReady_Generations: boolean = false;
	dataReady_ByGeneration: boolean = false;
	
	listGenerations: Models.GenerationTable[] = null;
	selectedGenerationId: number = null;
	
	resultDataByGeneration: Models.ResultByDeptThenGeneration = null;
	dataSelectedGeneration: Models.ResultByDeptThenGeneration_Sub = null;
	
	// ----------------------------------

	dropdown_Generations_Text: string = 'None selected';
	dropdown_Generations_Items: any;
	
	c_data_rateByGenr: ChartData;
	c_opt_rateByGenr: ChartOptions;
	
	c_data_dimensionsByGenr: number[] = [];
	c_labels_dimensionsByGenr: string[] = [];
	
	c_data_byQuestionByGenr: number[];
	c_labels_byQuestionByGenr: string[];

	// ---------------------------------------------------------
	
	getGenerationListData(): void {
		this.dataError = null;
		this.dataReady_Generations = false;
		
		this.dataSrv.getGenerationList().subscribe(
			(res: Models.GenerationTable[]) => {
				//console.log(res);
				
				this.listGenerations = res;
				
				this.dropdown_Generations_Text = 'None selected';
				this.dropdown_Generations_Items = res.map((x, index: number) => ({
					id: x.generation_id,
					name: x.generation_name,
				}));
			},
			(err) => {
				this.listGenerations = [];
				this.dataError = err;
			},
			() => this.dataReady_Generations = true
		);
	}
	
	onSelectGeneration(item: any): void {
		//console.log('Select generation: ' + item.id + ' ' + item.name);
		
		this.selectedGenerationId = item.id;
		this.dropdown_Generations_Text = item.name;
		
		this.refreshGenerationsData();
	}
	
	refreshGenerationsData(): void {
		this.dataError = null;
		this.dataReady_ByGeneration = false;

		this.getGenerationData();
		this.refreshGenerationCharts();
	}
	getGenerationData(): void {
		this.dataSrv.getDepartmentThenGenerationResultsData(this.surveyId, this.selectedDepartmentId).subscribe(
			(res: Models.ResultByDeptThenGeneration) => {
				//console.log(res);
				this.dataError = null;
				
				this.resultDataByGeneration = res;
				this.dataSelectedGeneration = res.score_generations
					.find(x => x.group.generation_id == this.selectedGenerationId);
			},
			(err) => {
				this.dataError = err;
				this.resultDataByGeneration = null;
			},
			() => this.dataReady_ByGeneration = true
		);
	}
	async refreshGenerationCharts() {
		await Helpers.waitUntil(() => this.dataReady_Generations && this.dataReady_ByGeneration);
		
		this.refreshGenerationChart_ResponseRate();
		this.refreshGenerationChart_ByDimension();
		this.refreshGenerationChart_ByQuestion();
	}
	refreshGenerationChart_ResponseRate(): void {
		var dataGenr: Models.ResultByDeptThenGeneration_Sub[] =
			this.resultDataByGeneration.score_generations;
		
		interface _Data {
			id: number,
			name: string,
			count: number,
		};
		var cdata: _Data[] = dataGenr
			.filter(x => x.score.responder_count > 0)
			.map(x => ({
				id: x.group.generation_id,
				name: x.group.generation_name,
				count: x.score.responder_count,
			}));
		cdata.sort((a, b) => a.id - b.id);
		
		var totalCount: number = cdata.reduce((s, x) => s + x.count, 0);	// Sum
		
		this.c_data_rateByGenr = {
			labels: cdata.map(x => x.name),
			datasets: [
				{
					label: 'Response Rate by Generation',
					data: cdata.map(x => x.count),
					backgroundColor: ResultsByGenerationComponent.generationColors,
					barThickness: 80,
				}
			],
		};
		this.c_opt_rateByGenr = {
			plugins: {
				datalabels: {
					labels: {
					
						title: {
							anchor: "end",
							align: "end",
							
							formatter: (x: number, ctx: Context) => {
								var x = ((x / totalCount) * 100);
								return x.toFixed(AppConfig.decPlaces) + '%';
							},
						},
						value: {
							anchor: "center",
							align: "center",
							formatter: (x: number, ctx: Context) => x,
						}
					},
					font: {
						//size: AppConfig.donutFontSize2,
					},
				},
				outlabels: {
					display: false,
				
				},

			},
			legend: {
				display: true,
				position: 'bottom',
				labels: {
					padding: 30,
					//fontSize: AppConfig.donutFontSize2,
				}
			},
			cutoutPercentage: 40,
			tooltips: {
				enabled: false,
			}
		};
	}
	refreshGenerationChart_ByDimension(): void {
		var dataDims = this.dataSelectedGeneration.score_dimensions;

		var labels: string[] = dataDims.map(x => x.dimension_name);
		var data: number[] = dataDims.map(x => parseFloat(x.score_avg_percent.toFixed(AppConfig.decPlaces)));
		
		this.c_labels_dimensionsByGenr = labels;
		this.c_data_dimensionsByGenr = data;
	}
	refreshGenerationChart_ByQuestion(): void {
		var perQuestionData: any[] = [];

		for (var iData of this.dataSelectedGeneration.score_questions) {
			var count = iData.score_count;
			var scoreModes = iData.score_modes;
			var dataPoint = {
				num: iData.question_id,
				dim: iData.dimension_id,
				avgPercent: iData.score_avg / 5 * 100,
				count: count,
				freqNumeric: scoreModes,
				freqPercent: scoreModes.map(x => (x / count) * 100),
			};
			perQuestionData.push(dataPoint);
		}
		
		this.c_data_byQuestionByGenr = perQuestionData
			.map(x => x.avgPercent);
		this.c_labels_byQuestionByGenr = perQuestionData
			.map(x => 'Q' + x.num);
	}

	createColor(array: number[]) {
		var barColors = Helpers.generateBarColors(array);
		
		// Initialize everything to gray
		var colors = array.map(_ => "rgb(25, 140, 210)");
		
		// Assign min bars
		barColors.mins.forEach((x: number) => colors[x] = "rgb(255, 50, 50)");
		
		// Assign max bars
		barColors.maxs.forEach((x: number) => colors[x] = "rgb(0, 190, 80)");
		
		return colors;
	}
	setGenerationColours(labels: string[]): void {
		// Your function implementation here
		for (let i = 0; i < labels.length; i++) {
			const currentLabel = labels[i];
			switch (currentLabel) {
				case "Boomer":
					// Action when condition 1 is met
					this.c_color_generations[i] = "rgba(0, 190, 75, 1)"
					break;
				case "Gen X":
					// Action when condition 2 is met
				this.c_color_generations[i] = "rgba(170, 230, 100, 1)"
					break;
					case "Gen Y":
						// Action when condition 2 is met
						this.c_color_generations[i] = "rgba(0, 200, 240, 1)"
						break;
						case "Gen Z":
							// Action when condition 2 is met
							this.c_color_generations[i] = "rgba(80, 150, 230, 1)"
							break;
				default:
					// Default action when no conditions are met
					//console.log(`No action needed for label: ${currentLabel}`+this.c_color_generations);
			}
		}
	}
}

