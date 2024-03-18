import { TransitiveCompileNgModuleMetadata } from '@angular/compiler';
import { Helpers } from "../../helpers"
import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  QueryList,
  ViewChildren,
} from "@angular/core";

import { Chart } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Context from "chartjs-plugin-datalabels";
import { ChartData, ChartDataSets, ChartOptions } from "chart.js";

import { ChartPercentBar_Data } from '../../charts/template/template-chart-percent-bars/template-chart-percent-bars.component'


import stacked100 from "chartjs-plugin-stacked100";
import { float } from 'html2canvas/dist/types/css/property-descriptors/float';

import { DataService } from "../../data/data.service";
import { ResponseData } from '../../data/response_data.model';
import { NewDataService } from "../../data/new-data.service";
import * as Models from "../../data/data-model-new";
import { AppConfig } from '../../config';

@Component({
  selector: 'app-overview-charts',
  templateUrl: './overview-charts.component.html',
  styleUrls: ['./overview-charts.component.scss']
})
export class OverviewChartsComponent implements   OnInit, AfterViewInit {
  constructor(private dataService: DataService, private newDataService: NewDataService) {} 
  // {

  // constructor() { }
///Need this for the dunamic chart generation of Departments by dimensions---- using for mode chart second version
@ViewChildren("avgDimChart", { read: ElementRef }) // grab canvas DOM element to create multiple dynamic charts
avgDimChartElementRefs: QueryList<ElementRef>;

///Need this for the dunamic chart generation of Departments by dimensions---- using for mode chart second version
@ViewChildren("avgDepChart", { read: ElementRef }) // grab canvas DOM element to create multiple dynamic charts
avgDepChartElementRefs: QueryList<ElementRef>;
   ngOnInit(): void {
   // this.getResponseByCountry();
    this.getAvgByDimensions();
    this.getModeByDimensions();
    //this.getAvgByDepartments();
 
   }
   dataReady_DimData: boolean = false;
   surveyId = 2;

   responseCountry: any[] =[13, 19, 3, 5, 2, 3];
   responseCountryLabels: string[]=['Thailand','Singapore','Cambodia', 'Dubai','Vietnam', 'MAXZI'];
   responseCountryColours: string[]=[];
   responseByCountry: any[]=[];
/// first chart
avgDimensionLabels: string[]=['Thailand','Singapore','Cambodia', 'Dubai','Vietnam', 'MAXZI'];
   avgCountryColours: string[]=[];
   avgByDimensions: any[]=[];
   perByDimensions: any[]=[];
   perOverall: any[]=[];
   perLabels: any[]=[];
   perOverallDept: any[]=[];
   perLabelsDept: any[]=[];
   avgByDepartments: any[]=[];
   perByDepartments: any[]=[];
   avgDepartmentLabels: string[]=['Thailand','Singapore','Cambodia', 'Dubai','Vietnam', 'MAXZI'];
MaxMode: Int16Array;
  modeDimensions: any[]=[];
 DimensionNames:string[]=[];
 maxMode: number=0;
 modeScoreDepartments:any[]=[];
 vcOpts:any={};
 departzScores: any[]=[];
 departzLabels: any[]=[];
 depart1Scores: any[]=[];
 depart1Labels: any[]=[];
 depart2Scores: any[]=[];
 depart2Labels: any[]=[];
 depart3Scores: any[]=[];
 depart3Labels: any[]=[];
 dataReady_Dept1Data: boolean=false;
 c_data_scorebyDeptz: ChartData;
 c_data_scorebyDept1: ChartData;
 c_data_scorebyDept2: ChartData;
 c_data_scorebyDept3: ChartData;
 c_opt_scorebyDept1: ChartOptions;



   // set error/success messages
  error = "";
  success = "";
// ngOnChanges(changes: ThisParameterType.dataReady_DimData){
// alert("Data is ready");
// }
   ngAfterViewInit() {
    this.getAvgByDepartments();
    setTimeout(() => {

      //// this gets the party started for creating the charts by department/dimensions
      this.createQuesDeptCharts(
        this.avgDimChartElementRefs,
       this.avgDimChartData
      );
      this.createDeptCharts(
         this.avgDepChartElementRefs,
        this.avgDepChartData
       );
    }, 10000); //add time delay to wait for data to be loaded before injecting into DOM Element
  }
///needed for chart option, but can change to vertical later

  public horizontalChartOptions: any = {
    layout: {
      padding: {
          left: 0,
          right: 50,
          top: 0,
          bottom: 0
      }
    },
    plugins: {
      datalabels: {
        anchor: "end",
        align: "right",
        /*font:{
          size: 28,
        },*/
      },
    },
    responsive: true,
    legend: {
      display: false,
    },
    scales: {
      xAxes: [
        {
          ticks: {
            min: 0,
            max: 50,//this.maxMode
          },
          scaleLabel: {
            display: true,
            labelString: "Mode Score",
          },
          
           
        
        },
      ],
      yAxes: [
        {
          gridLines: {
            display: false,
          },
        },
      ],
    },
  };
 
  public verticalChartOptions: any = {
    layout: {
      padding: {
          left: 0,
          right: 0,
          top: 30,
          bottom: 0
      }
    },
    plugins: {
      datalabels: {
        anchor: "end",
        align: "top",
        /*font:{
          size: 28,
        },*/
      },
    },
    responsive: true,
    legend: {
      display: false,
    },
    scales: {
      yAxes: [
        {
          ticks: {
            min: 0,
          //  max: 350,//this.maxMode
           // stepSize: 1,
          },
          scaleLabel: {
            display: true,
            labelString: "",
          },
        },
      ],
      xAxes: [
        {
          gridLines: {
            display: false,
          },
        },
      ],
    },
  };

  avgDimChartData: Chart.ChartData[] = [];
  avgDepChartData: Chart.ChartData[] = [];
 /***nedded for  multiple charts Average Scores by questions */
 loadSecondChart(lbs,cdata,dcolour, elId="averageQuestionChart"): void {
  var canvas = <HTMLCanvasElement>(
 document.getElementById(elId)
);


 var ctx = canvas.getContext('2d');
 var averageQuestionChart = new Chart(ctx, {
     type: 'horizontalBar',
     data: {
         labels:lbs,//['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],// 
         datasets: [{
          barPercentage: 0.5,
             label: '# Average Score',
             data:cdata,// [12, 19, 3, 5, 2, 3],//
             backgroundColor: dcolour,
             borderColor: dcolour,
             borderWidth: 1
         }]
     },
     options: {
      layout: {
        padding: {
            left: 0,
            right: 50,
            top: 0,
            bottom: 0
        }
      },
      plugins: {
        datalabels: {
          anchor: "end",
          align: "right",
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            ticks: {
              min: 0,
              max: 5,
              stepSize: 1,
            },
            scaleLabel: {
              display: true,
              labelString: "Average Score",
            },
            
             
          
          },
        ],
        yAxes: [
          {
            gridLines: {
              display: false,
            },
          },
        ],
      },
     }
 });
 }



 async refreshCharts() {
  await Helpers.waitUntil(_ => this.dataReady_DimData);
  ////chart.js option configs for normal/vertical bar charts

  this.vcOpts= {
    // plugins: {
    //   datalabels: {
    //     anchor: "end",
    //     align: "top",
    //   },
    // },
    // responsive: true,
    // legend: {
    //   display: false,
    // },
    // scales: {
    //   yAxes: [
    //     {
    //       ticks: {
    //         min: 0,
    //         max: 350,//this.maxMode
    //         stepSize: 1,
    //       },
    //       scaleLabel: {
    //         display: true,
    //         labelString: "Mode Scores",
    //       },
    //     },
    //   ],
    //   xAxes: [
    //     {
    //       gridLines: {
    //         display: false,
    //       },
    //     },
    //   ],
    // },
  };

  
 // this.refreshScoreChart();
 // this.refreshScoreModeChart();
 // this.refreshByRoleChart();
 // this.refreshByAgeChart();
}


  ///new data source
  getAvgByDimensions(): void {
    this.newDataService.getResultsOverview(this.surveyId).subscribe(
   // this.newDataService.getAvgDim().subscribe(
      (res: any[]) => {
  //// create Total without dimensions here in the same function

  this.perOverall[1]=res["score_avg_percent"];
  this.perOverall[0]=55.3;
  this.perLabels[0]="2022";
  this.perLabels[1]="2023";
  this.createTotChart();
///Averaages by dimensions
        this.avgDimensionLabels = res["score_dimensions"].map((a) => a.dimension_name);
        this.avgByDimensions = res["score_dimensions"].map((a)=>a.score_avg);
        this.perByDimensions= res["score_dimensions"].map((a)=>a.score_avg_percent);
        this.createAvgChart();
        this.createPerChart();
       

      
        console.log(res);
        console.log(this.avgDimensionLabels);
      }
    );

  }
  getModeByDimensions(): void {

    this.newDataService.getResultsOverview(this.surveyId).subscribe(
 //   this.newDataService.getAvgDim().subscribe(
      (res: any[]) => {
        let dimLabels=[1,2,3,4,5];
        this.modeDimensions=res["score_dimensions"].map((a) => a.score_modes);
        this.DimensionNames=res["score_dimensions"].map((a) => a.dimension_name);
        console.log("Mode Dimensions");
        console.log(this.modeDimensions);
        for(var i = 0;i<=5;i++) {
          this.maxMode=Math.max(...this.modeDimensions[i])>this.maxMode?Math.max(...this.modeDimensions[i]):this.maxMode;         
       }
       
       this.maxMode=this.maxMode+20;
       console.log(this.maxMode);
       this.dataReady_DimData=true;
        this.avgDimChartData = this.createChartData(
          this.modeDimensions,
         dimLabels
        );
      }
    );

  }
/// same charts as Dimension, but for departments
  getAvgByDepartments(): void {
    this.newDataService.getDepartmentOverview(this.surveyId).subscribe(
      (res: any[]) => {
  //// create Total without dimensions here in the same function

  this.perOverallDept[1]=res["score_avg_percent"];
  this.perOverallDept[0]=55.3;
  this.perLabelsDept[0]="2022";
  this.perLabelsDept[1]="2023";
//  this.createTotChart();
///Averaages by dimensions
    //    this.avgDepartmentLabels = res["score_departments"].map((a) => a.department_name);
    //    this.avgByDepartments = res["score_departments"].map((a)=>a.score_avg);
    //    this.perByDepartments= res["score_departments"].map((a)=>a.score_avg_percent);
      //  this.createAvgChart();


      ///get mode per department too
    //  this.modeScoreDepartments=res["score_departments"].map((a)=>a.score_modes)
        this.createPerChartDept(this.avgDepartmentLabels, this.perByDepartments,[56,43,71,67,55,66,63,55,43 ],"perChartDep" );
      //  this.createPerChartDept();
       let modeLabels=[1,2,3,4,5];
      this.avgDepChartData = this.createChartData(
        this.modeScoreDepartments,
        modeLabels
      );
    
      ///*** Get data to create charts by department tree level */
       console.log("Calling Deprtments");
       console.log(res);
       this.departzScores=res["score_departments0"].map((a) => a.score_avg_percent);
       this.departzLabels=res["score_departments0"].map((a) => a.department_name);
       this.depart1Scores=res["score_departments1"].slice(1).map((a) => a.score_avg_percent);
       this.depart1Labels=res["score_departments1"].slice(1).map((a) => a.department_name);
       this.depart2Scores=res["score_departments2"].slice(1).map((a) => a.score_avg_percent);
       this.depart2Labels=res["score_departments2"].slice(1).map((a) => a.department_name);
       this.depart3Scores=res["score_departments3"].slice(1).map((a) => a.score_avg_percent);
       this.depart3Labels=res["score_departments3"].slice(1).map((a) => a.department_name);
       console.log("dept z scores");
       console.log(this.departzLabels);

       this.c_data_scorebyDeptz = {
        labels:this.departzLabels, //this.depart1Labels,
        datasets: [{
          label: '',
          data:this.departzScores,
          backgroundColor: this.createColor(this.departzScores),//AppConfig.primaryColour,
          barThickness: 80,
        }],
      };

       var textLen = this.depart1Labels.length >= 4 ? 20 : (128 / this.depart1Labels.length);
       var labelsWrap = this.depart1Labels.map(x => Helpers.wrapText(x, textLen));
       this.c_data_scorebyDept1 = {
        labels:labelsWrap , //this.depart1Labels,
        datasets: [{
          label: '',
          data:this.depart1Scores,
          backgroundColor: this.createColor(this.depart1Scores),//AppConfig.primaryColour,
          barThickness: 80,
        }],
      };
        this.c_data_scorebyDept2 = {
          labels: this.depart2Labels,
          datasets: [{
            label: '',
            data:this.depart2Scores,
            backgroundColor: AppConfig.primaryColour,
            barThickness: 80,
          }],
        };
          this.c_data_scorebyDept3= {
            labels: this.depart3Labels,
            datasets: [{
              label: '',
              data:this.depart3Scores,
              backgroundColor: AppConfig.primaryColour,
              barThickness: 80,
            }],
      };
     /// create options for bar chart
this.c_opt_scorebyDept1 = {
  plugins: {
    datalabels: {
      anchor: "end",
      align: "end",
      formatter: (x: number) => x.toFixed(AppConfig.decPlaces) + '%',
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
      },
    }],
  },
  tooltips: {
    enabled: false,
  },
};

       this.dataReady_Dept1Data=true;
      }
    );

  }
 //Helper to create chart data for multiple sets of charts
 createChartData(chartDatabase: any[], chartLabels: any[]) {
  var chartDataTemp = chartDatabase.map((item) => {
    const chart = {
      labels: chartLabels,
      datasets: [
        {
          barPercentage: 0.5,
          data: item,
          backgroundColor:this.createColor(item), //'#e8e8ea', //
          label: "Average Score",
        },
      ],
    };
    return chart;
  });
  return chartDataTemp;
}

 //Helper to create charts for Average Score by Question Per Dept
 createQuesDeptCharts(
  chartElementRef: QueryList<ElementRef>,
  chartData: Chart.ChartData[]
) {
  //console.log("function called");
  var charts = chartElementRef.map((chartElementRef, index) => {
    const config = Object.assign(
      {},
      {
        type: "bar",
        data: chartData[index],
        options: this.verticalChartOptions,
      }
    );

    return new Chart(chartElementRef.nativeElement, config);
  });
}

//Helper to create charts for Mode Per Dept
 createDeptCharts(
  chartElementRef: QueryList<ElementRef>,
  chartData: Chart.ChartData[]
) {
  //console.log("function called");
  var charts = chartElementRef.map((chartElementRef, index) => {
    const config = Object.assign(
      {},
      {
        type: "bar",
        data: chartData[index],
        options: this.verticalChartOptions,
      }
    );

    return new Chart(chartElementRef.nativeElement, config);
  });
}

//// chart for Average scores
  createAvgChart():void {
  
    var myChart = new Chart("avgChart", {
      type: 'bar',
      data: {
        //  labels:  this.responseCountryLabels,
          labels:this.avgDimensionLabels.map(x => {return x.split(" ")}),
          datasets: [
          //   {
          //     label: 'Expected Responses',
          //     backgroundColor: '#e8e8ea' ,
          //       borderColor: '#c6c4c4',
          //       borderWidth: 1,
             
          //     data: [31,53,29,12,171,208,78 ]
          //   },
            {
              label: 'Average Score',
             // data: this.responseCountry,
              data:this.avgByDimensions,
              backgroundColor:'#7777d8', //this.responseCountryColours ,
              borderColor: '#7b79f2',
              borderWidth: 1
          }
         
        ]
      },
      options: {
        plugins: {
          datalabels: {
            anchor: "end",
            align: "top",
            formatter: function(value, context) {
              return (value.toFixed(AppConfig.decPlaces));
            }
          },
        },
          scales: {
              yAxes: [{
                
                  gridLines: {
                    display: true,
                  },
                  ticks: {
                      beginAtZero: true
                  }
              }],
              xAxes: [{
                
                gridLines: {
                  display: false,
                },
                
              }]
          },
          tooltips: {
            enabled: false
        }
      }
  });
  
  }

/// Chart for percentage by dimension compared with previous year
  createPerChart():void {
  
    var myChart = new Chart("perChart", {
      type: 'bar',
      data: {
        //  labels:  this.responseCountryLabels,
          labels:  this.avgDimensionLabels.map(x => {return x.split(" ")}),
          datasets: [
            {
              label: '2022 Scores',
              backgroundColor: '#e8e8ea' ,
                borderColor: '#c6c4c4',
                borderWidth: 1,
             
              data: [56,43,71,67,55,66,63 ]
            },
            {
              label: '2023 Scores',
             // data: this.responseCountry,
             data:this.perByDimensions,
              backgroundColor:'#b5f584', //this.responseCountryColours ,
              borderColor: '#9cd66f',
              borderWidth: 1
          }
         
        ]
      },
      options: {

        plugins: {
          datalabels: {
            anchor: "end",
            align: "top",
            formatter: function(value, context) {
              return (value.toFixed(AppConfig.decPlaces)) + '%'; //`${value}.0 %`;
            }
          },
        },
          scales: {
              yAxes: [{
                
                  gridLines: {
                    display: true,
                  },
                  ticks: {
                   
                      beginAtZero: true,
                    callback: (value,index,values) =>{                                 
                                  return `${value}.0 %`;
                    }
                  }
              }],
              xAxes: [{
                /*ticks: {
                  fontSize: 20,
                  
                },*/
                gridLines: {
                  display: false,
                },
              }]
          },
          tooltips: {
            enabled: false
        }
      }
  });
  
  }
/// can create dynamically Standard chart using percantages
  createPerChartDept(lableArray: any[], dataArray: any[],pastData: any[],chartName: string):void {
 // createPerChartDept():void {
  
    var myChart = new Chart(chartName, {
      type: 'bar',
      data: {
        //  labels:  this.responseCountryLabels,
          labels:  lableArray,
          datasets: [
            {
              label: '2022 Scores',
              backgroundColor: '#e8e8ea' ,
                borderColor: '#c6c4c4',
                borderWidth: 1,
             
              data: pastData,
            },
            {
              label: '2023 Scores',
             // data: this.responseCountry,
             data:dataArray,
              backgroundColor:'#b5f584', //this.responseCountryColours ,
              borderColor: '#9cd66f',
              borderWidth: 1
          }
         
        ]
      },
      options: {

        plugins: {
          datalabels: {
            anchor: "end",
            align: "top",
            formatter: function(value, context) {
              return (value.toFixed(AppConfig.decPlaces)) + '%'; //`${value}.0 %`;
            }
          },
        },
          scales: {
              yAxes: [{
                
                  gridLines: {
                    display: true,
                  },
                  ticks: {
                   
                      beginAtZero: true,
                    callback: (value,index,values) =>{
                                  console.log(value);
                                  return `${value}.0 %`;
                    }
                  }
              }],
              xAxes: [{
                
                gridLines: {
                  display: false,
                }
              }]
          },
          tooltips: {
            enabled: false
        }
      }
  });
  
  }



//// chart for Average scores
createTotChart():void {
  
  var myChart = new Chart("totChart", {
    type: 'bar',
    data: {
      //  labels:  this.responseCountryLabels,
        labels:  this.perLabels,
        datasets: [
        //   {
        //     label: 'Expected Responses',
        //     backgroundColor: '#e8e8ea' ,
        //       borderColor: '#c6c4c4',
        //       borderWidth: 1,
           
        //     data: [31,53,29,12,171,208,78 ]
        //   },
          {
            label: 'Average Score',
           // data: this.responseCountry,
            data: this.perOverall,
            backgroundColor:'#b5f584', //this.responseCountryColours ,
            borderColor: '#9cd66f',
            borderWidth: 1
        }
       
      ]
    },
    options: {
      plugins: {
        datalabels: {
          anchor: "end",
          align: "top",
          formatter: function(value, context) {
            return (value.toFixed(AppConfig.decPlaces)) + '%'; //`${value}.0 %`;
          }
        },
      },
        scales: {
            yAxes: [{
              
                gridLines: {
                  display: true,
                },
                ticks: {
                    beginAtZero: true,
                    //max: 100,
                    stepSize: 10,
                    callback: (value,index,values) => (value + '%'),
                }
            }],
            xAxes: [{
              
              gridLines: {
                display: false,
              }
            }]
        },
        tooltips: {
          enabled: false
      }
    }
});


this.c_data_scorebyDept1 = {
  labels: ["deano","dept2"],//this.depart1Labels,
  datasets: [{
    label: '',
    data:[5,3], //this.depart1Scores,
    backgroundColor: AppConfig.primaryColour,
    barThickness: 80,
  }],
};
}

//create color array to assign red/green colours to max/min values of data
createColor(array) {
  var max = Math.max(...array);
  var min = Math.min(...array);

  var max_ind = array.map((e, i) => (Number(e) === max ? i : "")).filter(String);
  var min_ind = array.map((e, i) => (Number(e) === min ? i : "")).filter(String);

  var colour = array.map((x) => "rgba(160, 255, 87, 1)"); // set non max/min values to grey

  // assign colours to max/min indices
  for (var i in max_ind) {
    colour[max_ind[i]] = "rgba(0, 176, 80, 1)";//"rgba(0, 127, 0, 0.6)";
  }

  for (var i in min_ind) {
    colour[min_ind[i]] = "rgba(230, 0, 0, 1)";//rgba(255, 0, 0, 0.6)";
  }
  //console.log(max_ind);
  return colour;
  
}
  }







