import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  QueryList,
  ViewChildren
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Chart } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import stacked100 from "chartjs-plugin-stacked100";
import * as jspdf from 'jspdf';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas'

import { DataService } from "../data/data.service";
import { ResponseData } from '../data/response_data.model';

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
  selector: 'app-country-chart',
  templateUrl: './country-chart.component.html',
  styleUrls: ['./country-chart.component.scss']
})
export class CountryChartComponent implements OnInit {

  constructor(private route: ActivatedRoute, private dataService: DataService) { }
  public captureScreen()  
  {  
    var data = document.getElementById('contentToConvert');  
    html2canvas(data).then(canvas => {  
      // Few necessary setting options  
      var imgWidth = 208;   
      var pageHeight = 295;    
      var imgHeight = canvas.height * imgWidth / canvas.width;  
      var heightLeft = imgHeight;  
  
      const contentDataURL = canvas.toDataURL('image/png')  
      let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF  
      var position = 0;  
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight)  
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save('MYPdf.pdf'); // Generated PDF   
    });  
  }  

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
  };

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
            labelString: "Average Scores",
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
  };
///Need this for the dunamic chart generation of Departments by dimensions
   @ViewChildren("avgDimChart", { read: ElementRef }) // grab canvas DOM element to create multiple dynamic charts
   avgDimChartElementRefs: QueryList<ElementRef>;
  ngOnInit(): void {
    /// this grabs the country id from the url
    const idc = this.route.snapshot.paramMap.get('id');
   this.id = idc;

    //console.log(idc);
    this.getAvgByDept();
    this.getCountQuesData();
    this.getAverageQuestData();
    this.getDimData();
    this.getDepDim();
  }
  ngAfterViewInit() {
    setTimeout(() => {

      //// this gets the party started for creating the charts by department/dimensions
      this.createQuesDeptCharts(
        this.avgDimChartElementRefs,
       this.avgDimChartData
      );
    }, 2000); //add time delay to wait for data to be loaded before injecting into DOM Element
  }
  avgDimChartData: Chart.ChartData[] = [];
  id: string = "";
  // set error/success messages
  error = "";
  success = "";
CountryName="";
departmentDatasets: any[]=[];
dimensionData: any[]=[];
labelsDepartments: any[]=[];
labelsDimensions: any[]=[];

/***not */
  loadFirstChart(lbs,cdata,dcolour): void {
     var canvas = <HTMLCanvasElement>(
    document.getElementById("myChart")
  );
    var ctx = canvas.getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: lbs,//['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
              barPercentage: 0.5,
                label: '# Average Score',
                data: cdata,//[12, 19, 3, 5, 2, 3],
                backgroundColor: dcolour,
                borderColor: dcolour,
                borderWidth: 1
            }]
        },
        options: {
          legend: {
            labels: {
                // This more specific font property overrides the global property
                fontColor: 'black',
                //fontSize:16
            }
          },
          plugins: {
            datalabels: {
              anchor: "end",
              align: "top",
              font: {
                weight: 'lighter',
                size: 12,
               
              }
            },
           
          },
         
            scales: {
                yAxes: [{
                  ticks: {
                    min: 0,
                    max: 5,
                    stepSize: 1,
                  },
                  gridLines: {
                    display: true,
                  },
                }],
                xAxes: [
                  {
                    gridLines: {
                      display: false,
                    },
                  
                }]
            }
        }
    });
    }
  /***nedded for  multiple charts Average Scores by questions */
    loadSecondChart(lbs,cdata,dcolour): void {
      var canvas = <HTMLCanvasElement>(
     document.getElementById("averageQuestionChart")
   );
     var ctx = canvas.getContext('2d');
     var averageQuestionChart = new Chart(ctx, {
         type: 'horizontalBar',
         data: {
             labels: lbs,//['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
             datasets: [{
              barPercentage: 0.5,
                 label: '# Average Score',
                 data: cdata,//[12, 19, 3, 5, 2, 3],
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

     /***not */
     getDimData(): void {
      this.dataService.getDimCount(this.id).subscribe(
        (res: any[]) => {
         // console.log("dimensions");
 
 this.dimensionData=res;
 console.log(this.dimensionData);

     });
     } 
   
/***not */
  getAvgByDept(): void {
    let deptLabels= [];
    let deptCounts=[];
    let deptColours=[];
    this.dataService.getAvgPerCountry(this.id).subscribe(
      (res: any[]) => {
      //  console.log(res);
       // res.forEach(function (value) {

deptLabels= res.map((a) => a.DepartmentName);
deptCounts=res.map((a)=>a.Department_Count);
deptColours=res.map((a)=>a.Country_Colour);

       // }


        // for (const [key, value] of Object.entries(res)) {
        //   this.avgCompDatasets.push(value.map((a) => a.avg_answer));
        //   this.compLabels = value.map((a) => a.CompetencyName);
        //   this.countryTitles.push(key);
        // }
      
     
        this.CountryName=res[0].CountryName;
     

      this.departmentDatasets=res;
   // console.log("dataset");
   // console.log(this.departmentDatasets);
        this.loadFirstChart(deptLabels,   deptCounts, deptColours);
        this.createAvgChart( deptLabels,   deptCounts, deptColours);

       },
       (err) => {
         this.error = err;
       }
     );
      }

      ///gets the array of charts --- needed for charts per department
getDepDim(): void {
  this.dataService.getDimDepCount(this.id).subscribe(
    (res: any[]) => {
      this.labelsDepartments= res.map((a) => a.DepartmentName);
     let DimensionColours=[];
     let DimensionData=[];
     let dimLabels=[];

     res.forEach(function (value)     
     {
      let DimensionDataSet=value.Department_Results.map((a) => a.avg_answer );
      dimLabels=value.Department_Results.map((a) => a.DimensionName);
      DimensionData.push(DimensionDataSet);
     })
      console.log("DimensionData");
      console.log(DimensionData);
      this.avgDimChartData = this.createChartData(
        DimensionData,
        dimLabels
      );
    //  console.log(this.avgDimChartData);
    },
    (err) => {
      this.error = err;
    }
  );

}

      createAvgChart(lbs,scores, colours):void {
  
        var myChart = new Chart("countryAverageChart", {
          type: 'bar',
          data: {
              labels: ['Test Label','Cambodo'],// lbs,
              datasets: [{
                  label: '# Average Scores',
                  data:[6,9],// scores,
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
                          beginAtZero: true
                      },
                      gridLines: {
                        display: false,
                      },
                      
                      
                  }],
                  xAxes: [
                    {
                      gridLines: {
                        display: false,
                      },
                    
                  }]
              }
          }
      });
      
      }
 /***not */     
getAverageQuestData(): void {
  let deptLabels= [];
    let deptCounts=[];
    let deptColours=[];
  this.dataService.getAvgQuesCountry(this.id).subscribe(
    (res: any[]) => {
//console.log("By Question");
//console.log(res);
deptLabels= res.map((a) => a.question_id);
deptCounts=res.map((a)=>a.avg_answer);
deptColours=res.map((a)=>a.BarColours);

this.loadSecondChart(deptLabels,deptCounts,deptColours);
this.loadEmptyChart(deptLabels,deptCounts,deptColours);
    });
}

      getCountQuesData(): void {
        this.dataService.getCountQuesCountry(this.id).subscribe(
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
                plugins: {
                  datalabels: {
                    display: false,
                  },
                  stacked100: { enable: true },
                },
              },
            });
          },
          (err) => {
            this.error = err;
          }
        );
      }


      loadEmptyChart(lbs,cdata,dcolour): void {
        var canvas = <HTMLCanvasElement>(
       document.getElementById("emptyChart")
     );
       var ctx = canvas.getContext('2d');
       var emptyChart = new Chart(ctx, {
           type: 'bar',
           data: {
               labels: lbs,//['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
               datasets: [{
                   label: '# Average Score',
                   data: cdata,//[12, 19, 3, 5, 2, 3],
                   backgroundColor: dcolour,
                   borderColor: dcolour,
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
                     },
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
        type: "horizontalBar",
        data: chartData[index],
        options: this.horizontalChartOptions,
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
  //console.log(max_ind);
  return colour;
  
}

}
