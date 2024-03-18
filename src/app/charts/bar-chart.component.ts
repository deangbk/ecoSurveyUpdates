import { TransitiveCompileNgModuleMetadata } from '@angular/compiler';
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
import stacked100 from "chartjs-plugin-stacked100";
import { float } from 'html2canvas/dist/types/css/property-descriptors/float';

import { DataService } from "../data/data.service";
import { ResponseData } from '../data/response_data.model';
// import { AvgData } from '../data/avg_data.model';
// import {ModeData} from '../data/mode_data.model';

//////set default chart.js configs//////////////////

Chart.defaults.global.defaultFontSize = 16;
Chart.defaults.global.defaultFontStyle = "bold";
Chart.plugins.register(ChartDataLabels);
Chart.plugins.register(stacked100);
Chart.helpers.merge(Chart.defaults.global.plugins.datalabels, {
  color: "black",
});
/////////////////////////////////////////////////

@Component({
  selector: "bar-chart",
  templateUrl: "./bar-chart.component.html",
  styleUrls: ["./bar-chart.component.scss"],
})
export class BarChartComponent implements OnInit, AfterViewInit {
  constructor(private dataService: DataService) {}

  ////chart.js option configs for normal/vertical bar charts
  public verticalChartOptions: any = {
    plugins: {
      datalabels: {
        anchor: "end",
        align: "top",
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
            max: 5,
            stepSize: 1,
          },
          scaleLabel: {
            display: true,
            labelString: "Average Score",
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
    tooltips: {
      enabled: false,
    },
  };

  public horizontalChartOptions: any = {
   
    plugins: {
      datalabels: {
        anchor: "end",
        align: "right",
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
    tooltips: {
      enabled: false,
    },
  };

  public avgQuesChartOptions: any = {
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
          scaleLabel: {
            display: true,
            labelString: "Question",
          },
        },
      ],
    },
    tooltips: {
      enabled: false,
    },
  };

  //placeholder arrays for survey/chart data
  avgCompDatasets: any[] = [];
  avgDimDatasets: any[] = [];
  avgDeptDatasets: any[] = [];
  avgQuesDatasets: any[] = [];
  countQuesDatasets: any[] = [];
  countDeptDatasets: any[] = [];
  modeDimDatasets: any[] = [];
  avModel: ResponseData ={Country:"stuff", Department_Count:[], Department_Labels:[]};

  avgCompChartData: Chart.ChartData[] = [];
  avgQuesChartData: Chart.ChartData[] = [];
  avgDimChartData: Chart.ChartData[] = [];
  avgDeptChartData: Chart.ChartData[] = [];
  countQuesChartData: Chart.ChartData[] = [];
  responseChartData: Chart.ChartData[] = [];

  //placeholder arrays for chart labels + titles
  compLabels: string[] = [];
  questionLabels: string[] = [];
  dimLabels: string[] = [];
  deptTitles: string[] = [];
  countryTitles: string[] = [];
  modeLabels: string[];

  deptLabels: string[] = [];
  countryLabels: string[] = [];
  responseCountry: any[] =[13, 19, 3, 5, 2, 3];
  responseCountryLabels: string[]=['Thailand','Singapore','Cambodia', 'Dubai','Vietnam', 'MAXZI'];
  responseCountryColours: string[]=[];
  responseByCountry: any[]=[];

  responseDatasets: any[]=[];
  responseLabels: string[]=[];
 

  // set error/success messages
  error = "";
  success = "";

  //lifecycle hook gets executed after view is rendered (http-get)
  ngOnInit() {
    this.getAvgCompData();
    this.getAvgDimData();
    this.getAvgDeptData();
    this.getAvgQuesData();
    this.getModeDimData();
    this.getCountQuesData();
    this.getCountDeptData();
    this.getResponseByCountry();
    this.getResponseByDepartment();
    this.getScoreByCountry();
  }

  @ViewChildren("avgQuesChart", { read: ElementRef }) // grab canvas DOM element to create multiple dynamic charts
  avgQuesChartElementRefs: QueryList<ElementRef>;

  @ViewChildren("avgCompChart", { read: ElementRef })
  avgCompChartElementRefs: QueryList<ElementRef>;

  @ViewChildren("avgDimChart", { read: ElementRef })
  avgDimChartElementRefs: QueryList<ElementRef>;

  @ViewChildren("avgDeptChart", { read: ElementRef })
  avgDeptChartElementRefs: QueryList<ElementRef>;

  ngAfterViewInit() {
    setTimeout(() => {
      console.log(this.avgCompChartData);
      this.createCompCharts(
        this.avgCompChartElementRefs,
        this.avgCompChartData
      // this.responseChartData
      );
      this.createDimCharts(this.avgDimChartElementRefs, this.avgDimChartData);
      this.createAvgDeptCharts(
        this.avgDeptChartElementRefs,
        this.avgDeptChartData
      );
      this.createQuesDeptCharts(
        this.avgQuesChartElementRefs,
        this.avgQuesChartData
      );
    }, 2000); //add time delay to wait for data to be loaded before injecting into DOM Element
  }

  getAvgCompData(): void {
    this.dataService.getAvgComp().subscribe(
      (res: any[]) => {
        //console.log(res);

        for (const [key, value] of Object.entries(res)) {
          this.avgCompDatasets.push(value.map((a) => a.avg_answer));
          this.compLabels = value.map((a) => a.CompetencyName);
          this.countryTitles.push(key);
        }
      // console.log("chart data set push");
       // console.log(this.avgCompDatasets);
       // console.log("labels set");
        console.log(this.compLabels);

        this.avgCompChartData = this.createChartData(
          this.avgCompDatasets,
          this.compLabels
        );
       // console.log(this);
      },
      (err) => {
        this.error = err;
      }
    );
  }

  getAvgDimData(): void {
    this.dataService.getAvgDim().subscribe(
      (res: any[]) => {
        //console.log(res);

        for (const [key, value] of Object.entries(res)) {
          this.avgDimDatasets.push(value.map((a) => a.avg_answer));
        }

        this.dimLabels = Object.values(res)[0].map((a) => a.DimensionName);

        this.avgDimChartData = this.createChartData(
          this.avgDimDatasets,
          this.dimLabels
        );
      },
      (err) => {
        this.error = err;
      }
    );
  }

  getAvgDeptData(): void {
    this.dataService.getAvgDept().subscribe(
      (res: any[]) => {
        //console.log(res);

        for (const [key, value] of Object.entries(res)) {
          this.avgDeptDatasets.push(value.map((a) => a.avg_answer));
        }

        this.deptTitles = Object.values(res)[0].map((a) => a.DeptName);

        //console.log(this.deptTitles);

        this.avgDeptChartData = this.createChartData(
          this.avgDeptDatasets,
          this.deptTitles
        );

        //radar chart for Avg by Dept
        // var canvas_radar = <HTMLCanvasElement>(
        //   document.getElementById('avgDeptRadarChart')
        // );
        // var ctx_radar = canvas_radar.getContext('2d');
        // const avgDeptRadarChart = new Chart(ctx_radar, {
        //   type: 'radar',
        //   data: {
        //     labels: chart_labels,
        //     datasets: [
        //       {
        //         label: 'Average Score',
        //         data: chart_data,
        //         backgroundColor: 'rgba(255, 200, 0, 0.6)',
        //         borderColor: 'rgba(180, 180, 180, 1)'
        //       },
        //     ],
        //   },
        //   options: {
        //     legend: {
        //       display: false,
        //     },
        //     scale: {
        //       ticks: {
        //         display: false,
        //         min: 0,
        //         max: 5,
        //       },
        //     },
        //   },
        // });
      },
      (err) => {
        this.error = err;
      }
    );
  }

  getAvgQuesData(): void {
    this.dataService.getAvgQues().subscribe(
      (res: any[]) => {
        for (const [key, value] of Object.entries(res)) {
          for (const [key1, value1] of Object.entries(value)) {
            this.avgQuesDatasets.push(value1["avg_data"]);
            this.questionLabels = value1["question_ids"];
            this.deptLabels.push(key1);
            this.countryLabels.push(key);
          }
        }
        this.questionLabels = this.questionLabels.filter(
          (v, i, a) => a.indexOf(v) === i
        ); //filter for unique dimension names

        this.avgQuesChartData = this.createChartData(
          this.avgQuesDatasets,
          this.questionLabels
        );
      },
      (err) => {
        this.error = err;
      }
    );
  }

  getCountQuesData(): void {
    this.dataService.getCountQues().subscribe(
      (res: any[]) => {
        //console.log(res);

        var canvas = <HTMLCanvasElement>(
          document.getElementById("percentageChart")
        );

        
        var ctx = canvas.getContext("2d");
        const percentageChart = new Chart(ctx, {
          type: "horizontalBar",
          data: {
            labels:["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24"], //this.questionLabels,
            datasets: [
              {
                label: "Strongly Disagree",
                data: Object.values(res).map(
                  (a) =>
                    a["ans_count"][a["answers"]
                      .map((e, i) => (e === 1 ? i : "")).filter(String)
                    ] //find count value for which answer matches "1" which is Strongly Disagree
                ),
                backgroundColor: "rgba(255, 0, 0, 0.6)",
              },
              {
                label: "Disagree",
                data: Object.values(res).map(
                  (a) =>
                    a["ans_count"][a["answers"]
                      .map((e, i) => (e === 2 ? i : "")).filter(String)
                    ]//find count value for which answer matches "2" which is Disagree
                ),
                backgroundColor: "rgba(255, 127, 0, 0.6)",
              },
              {
                label: "Neutral",
                data: Object.values(res).map(
                  (a) =>
                    a["ans_count"][a["answers"]
                      .map((e, i) => (e === 3 ? i : "")).filter(String)
                    ]//find count value for which answer matches "3" which is Neutral 
                ),
                backgroundColor: "rgba(255, 255, 0, 0.6)",
              },
              {
                label: "Agree",
                data: Object.values(res).map(
                  (a) =>
                    a["ans_count"][a["answers"]
                    .map((e, i) => (e === 4 ? i : "")).filter(String)
                    ]
                ),
                backgroundColor: "rgba(0, 255, 0, 0.6)",
              },
              {
                label: "Strongly Agree",
                data: Object.values(res).map(
                  (a) =>
                    a["ans_count"][a["answers"]
                      .map((e, i) => (e === 5 ? i : "")).filter(String)
                    ]
                ),
                backgroundColor: "rgba(0, 127, 0, 0.6)",
              },
            ],
          },
          options: {
            plugins: {
              datalabels: {
                display: false,
              },
              stacked100: { enable: true },
            },
            scales:{
              xAxes: [
                {
                  gridLines: {
                    display: false,
                  },
                },
              ],
            
              yAxes: [
                {
                  gridLines: {
                    display: true,
                  },
                },
              ],
            },
          },
        });
      },
      (err) => {
        this.error = err;
      }
    );
  }

  getCountDeptData(): void {
    this.dataService.getCountDept().subscribe(
      (res: any[]) => {
        // console.log(res);
      },
      (err) => {
        this.error = err;
      }
    );
  }

  getModeDimData(): void {
    this.dataService.getModeDim().subscribe(
      (res: any[]) => {
        for (const [key, value] of Object.entries(res)) {
          for (const [key1, value1] of Object.entries(value)) {
            this.modeDimDatasets.push(value1);
          }
        }
      },
      (err) => {
        this.error = err;
      }
    );
  }
getResponseByDepartment():void {
  let chartCountryData=[];
 
  let DepLabels=[];
  let DepCount=[];
  let tempData=[];
  let tempCountry="";
  let tempLabels=[];
 

  this.dataService.getRepsonseDepart().subscribe(
    (res: any[]) => {
      res.forEach(function (value) {
        if (tempCountry==value.CountryName)
        {
        DepLabels.push(value.DepartmentName);
        DepCount.push(value.Department_Count);
        
        }
        else{
          if (tempCountry!="")
          {
          let rData={Country:tempCountry,Department_Count:DepCount,Department_Labels:DepLabels};
          chartCountryData.push(rData);
          tempData.push(DepCount);
          //this.responseDatasets.push(DepCount);
          tempLabels.push(DepLabels);
          }
          
          DepLabels=[];
          DepLabels.push(value.DepartmentName);
          DepCount=[];
          DepCount.push(value.Department_Count);
        }
        tempCountry=value.CountryName;
       // console.log(value);
      }); 
      let dData = {Country:tempCountry,Department_Count:DepCount,Department_Labels:DepLabels};
      chartCountryData.push(dData);
    
      console.log(chartCountryData);
//testData.Country="stuff";

this.responseChartData = this.createChartData(
 // this.avgQuesDatasets,
  tempData,
  tempLabels
);
     console.log(this.responseChartData);
    },
    (err) => {
      this.error = err;
    }
  );

}

getResponseByCountry(): void {





this.dataService.getRepsonseCount().subscribe(
  (res: any[]) => {
    //console.log(res);

    // for (const [key, value] of Object.entries(res)) {
    //   this.avgCompDatasets.push(value.map((a) => a.avg_answer));
       this.responseCountryLabels = res.map((a) => a.CountryName);
       this.responseCountry = res.map((a)=>a.Country_Count);
       this.responseCountryColours = res.map((a)=>a.Country_Colour);
    //   this.countryTitles.push(key);
    // }

    //console.log(this.avgCompDatasets);

    // this.avgCompChartData = this.createChartData(
    //   this.avgCompDatasets,
    //   this.compLabels
    // );
   // console.log(this.responseCountryColours);
  //  console.log("Response Data");
  //  console.log(res);
    this.createResponseChart();
    //this.createAvgChart();
  },
  (err) => {
    this.error = err;
  }
);



}
getScoreByCountry(): void {
let AvgLabels =[];
let AvgCountry =[];
let AvgColours=[];
  this.dataService.getAvgCountry().subscribe(
    (res: any[]) => {
      //console.log(res);
  
      // for (const [key, value] of Object.entries(res)) {
      //   this.avgCompDatasets.push(value.map((a) => a.avg_answer));
      AvgLabels = res.map((a) => a.CountryName);
      AvgCountry = res.map((a)=>a.Country_Count);
      AvgColours = res.map((a)=>a.Country_Colour);
      //   this.countryTitles.push(key);
      // }
  
      //console.log(this.avgCompDatasets);
  
      // this.avgCompChartData = this.createChartData(
      //   this.avgCompDatasets,
      //   this.compLabels
      // );
     // console.log(this.responseCountryColours);
    //  console.log("Response Data");
    //  console.log(res);
   //   this.createResponseChart();
      this.createAvgChart( AvgLabels,   AvgCountry, AvgColours);
    },
    (err) => {
      this.error = err;
    }
  );

}

createResponseChart():void {
  
  var myChart = new Chart("responseChart", {
    type: 'bar',
    data: {
        labels:  this.responseCountryLabels,
        datasets: [
          {
            label: 'Expected Responses',
            backgroundColor: '#e8e8ea' ,
              borderColor: '#c6c4c4',
              borderWidth: 1,
           
            data: [31,53,29,12,171,208,78 ]
          },
          {
            label: 'Actual Responses',
            data: this.responseCountry,
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
              }
            }]
        }
    }
});

}

createAvgChart(lbs,scores, colours):void {
  
  var myChart = new Chart("globalAverageChart", {
    type: 'bar',
    data: {
        labels:  lbs,
        datasets: [{
          barPercentage: 0.5,
        
            label: '# Average Scores',
            data: scores,
            backgroundColor: colours ,
            borderColor: colours,
            borderWidth: 1
        }]
    },
    options: {      
      plugins: {
        datalabels: {
          anchor: "end",
          align: "top",
        },
      },
        scales: {
            yAxes: [{
                ticks: {
                  min: 0,
                  max: 5,
                  stepSize: 1,
                }, gridLines: {
                  display: true,
                }
            }],
            xAxes: [{
              
              gridLines: {
                display: false,
              }
            }]
        }
    }
});

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
            backgroundColor: this.createColor(item),
            label: "Average Score",
          },
        ]
      };
      return chart;
    });
    return chartDataTemp;
  }

  //Helper to create charts for Average Score by Comp
  createCompCharts(
    chartElementRef: QueryList<ElementRef>,
    chartData: Chart.ChartData[]
  ) {
    
    console.log("function called");
    console.log(chartData);
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

  //Helper to create charts for Average Score by Dim
  createDimCharts(
    chartElementRef: QueryList<ElementRef>,
    chartData: Chart.ChartData[]
  ) {
    //console.log("function called");
    var charts = chartElementRef.map((chartElementRef, index) => {
      const config = Object.assign(
        {},
        {
          type: "horizontalBar",
          data: chartData[index],
          options: this.horizontalChartOptions,
        }
      );

      return new Chart(chartElementRef.nativeElement, config);
    });
  }

  //Helper to create charts for Average Score by Dept
  createAvgDeptCharts(
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
          type: "horizontalBar",
          data: chartData[index],
          options: this.avgQuesChartOptions,
        }
      );

      return new Chart(chartElementRef.nativeElement, config);
    });
  }

 //create color array to assign red/green colours to max/min values of data
 createColor(array) {
  var max = Math.max(...array);
  var min = Math.min(...array);

  var max_ind = array.map((e, i) => (Number(e) === max ? i : "")).filter(String);
  var min_ind = array.map((e, i) => (Number(e) === min ? i : "")).filter(String);

  var colour = array.map((x) => "rgba(180, 180, 180, 1)"); // set non max/min values to grey

  // assign colours to max/min indices
  for (var i in max_ind) {
    colour[max_ind[i]] = "rgba(0, 176, 80, 1)";//"rgba(0, 127, 0, 0.6)";
  }

  for (var i in min_ind) {
    colour[min_ind[i]] = "rgba(230, 0, 0, 1)";//rgba(255, 0, 0, 0.6)";
  }
  console.log(max_ind);
  return colour;
  
}
}
