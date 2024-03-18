import { Component, OnInit } from '@angular/core';
import { Chart } from "chart.js";
import { ChartData, ChartDataSets, ChartOptions } from "chart.js";
import { Context } from 'chartjs-plugin-datalabels';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Helpers } from "../helpers"
import { AppConfig } from '../config';
import { NewDataService } from "../data/new-data.service";

@Component({
  selector: 'app-ov-percent-questions',
  templateUrl: './ov-percent-questions.component.html',
  styleUrls: ['./ov-percent-questions.component.scss']
})
export class OvPercentQuestionsComponent implements OnInit {

  constructor(private dataSrv: NewDataService) { }

  ngOnInit(): void {

    this.getCountQuesData();
  }
  error = "";
  surveyId = 2;
  perData_ready: boolean = false;
  dataDimensionQ: any;
  testData: number[][]= [[3, 14, 16,32,12,13],
  [4, 1, 7,32,12,13],
  [7, 5, 9,32,12,32],
  [7, 5, 9,32,12,32],
  [7, 5, 9,32,12,32]];
  labelsTempString=[];
  labelsTemp: string[][]=[["1","2","3","4","5","6","7","8","9"]];
  labelsTest: any[]=["1","2","3","4","5","6","7","8","9"];
  labelsTemp2: string[][]=[["1","2","3","4","5","6","7","8","9"]];
  c_data_questPer: any[][] = [];
   c_labels_questPer: any[][]=[];


  async refreshCharts() {
		await Helpers.waitUntil(_ => this.perData_ready);
		

		this.refreshByDeptsOverviewChart();
   
	}
	refreshByDeptsOverviewChart(): void {
		var dataQ = this.dataDimensionQ;
		
		var labels: string[] = [];//dataQ.map(x => x.questionId);
		var data: number[] = [];//dataQ.map(x => x.percentageAnswerScore);
		
		this.c_labels_questPer =[["1","2","3","4","5","6","7","8","9"],["1","2","3","4","5","6","7","8","9"]];// this.labelsTemp;//this.dataDimensionQ[0]["labels"];// //labels;
		this.c_data_questPer= dataQ;
    this.labelsTest=[1,2,3,4]//["1","2","3","4","5","6","7","8","9"];
    this.testData=[[4, 1, 7,32,12,13],
    [7, 5, 9,32,12,32],
    [7, 5, 9,32,12,32],
    [7, 5, 9,32,12,32],
    [7, 5, 9,32,12,34]];
    console.log(this.c_labels_questPer );
    console.log(	this.c_data_questPer)
  
	}
  getCountQuesData(): void {

    const stringArray: { name: string, values: number[][], labels: string[] }[] = [
     
    ];
    var dataQ; 
     this.dataSrv.getQuestionPer(2).subscribe(
      (res: any[]) => {
    console.log(res);
   // this.dataDimensionQ = res;
    
    dataQ=res;
    var questions;
    for (let i =0; i < dataQ.length; i++)
    { 
      var testData2;
      questions=dataQ[i]["questions"];

       this.testData[0]= dataQ[i]["questions"].map(x => x.scores[0]);
       this.testData[1]= dataQ[i]["questions"].map(x => x.scores[1]);
       this.testData[2]= dataQ[i]["questions"].map(x => x.scores[2]);
       this.testData[3]= dataQ[i]["questions"].map(x => x.scores[3]);
       this.testData[4]= dataQ[i]["questions"].map(x => x.scores[4]);
       testData2=[...this.testData];
       /// set the labels
      this.labelsTemp[i]=(dataQ[i]["questions"].map(x => ''+x.questionId));
      // console.log(qnum);
       
       const newArray: { name: string, values: any[][], labels: any[] }[] = [
      
        { name: dataQ[i]["dimensionName"], values:  testData2, labels: this.labelsTemp[i]}
      ];

      stringArray.push(...newArray)
   
    }
    this.dataDimensionQ=stringArray;//;stringArray[4].values;
    //console.log(this.labelsTemp);
   console.log("dataDimensionQ", this.dataDimensionQ);
   this.perData_ready=true;
      });
      
   //  for ()
this.refreshCharts();
 
   }



  }
