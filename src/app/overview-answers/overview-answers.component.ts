import { Component, OnInit } from '@angular/core';


import { ChartData, ChartDataSets, ChartOptions } from "chart.js";
import { Context } from 'chartjs-plugin-datalabels';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Helpers } from "../helpers"
import { AppConfig } from '../config';
import { NewDataService } from "../data/new-data.service";

@Component({
  selector: 'app-overview-answers',
  templateUrl: './overview-answers.component.html',
  styleUrls: ['./overview-answers.component.scss']
})
export class OverviewAnswersComponent implements OnInit {
  //c_data_engagementScore: ChartData;
	//c_opt_engagementScore: ChartOptions;
	
	//c_data_scoreMode: number[] = null;
  surveyId = 2;
	
  dataError: any;
  dataDimension: any;
  dataReady_DimData: boolean = false;
  c_data_deptsOverview: number[] = null; c_labels_deptsOverview: string[];
  constructor(private dataSrv: NewDataService) { }
  testData: number[]=[1,2,3];

  ngOnInit(): void {
    this.getDimensionData()
  }
	async refreshCharts() {
		await Helpers.waitUntil(_ => this.dataReady_DimData);
		
	//	this.refreshScoreChart();
	//	this.refreshScoreModeChart();
	//	this.refreshByRoleChart();
	//	this.refreshByAgeChart(); console.log("running chart");
		this.refreshByDeptsOverviewChart();
   
	}
	refreshByDeptsOverviewChart(): void {
		var dataDepts = this.dataDimension;
		
		var labels: string[] = dataDepts.map(x => {return 'Q' + x.questionId;});
		var data: number[] = dataDepts.map(x => x.percentageAnswerScore);
		
		this.c_labels_deptsOverview = labels;
		this.c_data_deptsOverview = data;
  
	}


  getDimensionData(): void {
		console.log('Requesting data from backend...');
		
		this.dataSrv.getQuestionOverview(this.surveyId).subscribe(
			(res: any) => {
				console.log(res);
				
				this.dataDimension = res;
				
				this.dataReady_DimData = true;
        console.log("DimData Set true");
        this.refreshCharts();
			},
			(err) => {
				this.dataError = err;
				this.dataReady_DimData = true;
			}
		);
	}


  
}