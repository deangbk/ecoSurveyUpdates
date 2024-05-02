import { Component, OnInit } from "@angular/core";
import { BsDropdownConfig } from "ngx-bootstrap/dropdown";
import { BsModalService } from "ngx-bootstrap/modal";

import { ChartData, ChartOptions } from "chart.js";
import { Context } from "chartjs-plugin-datalabels";

import { NewDataService } from "../data/new-data.service";
import { Helpers } from "../helpers";
import * as Models from "../data/data-model-new";
import { AppConfig } from "../config";

@Component({
  selector: "app-results-by-role",
  templateUrl: "./results-by-role.component.html",
  styleUrls: ["./results-by-role.component.scss"],
  providers: [
    {
      provide: BsDropdownConfig,
      useValue: { isAnimated: true, autoClose: true },
    },
    BsModalService,
  ],
})
export class ResultsByRoleComponent implements OnInit {
  surveyId = 2;
  error: any = null;
  refreshData: boolean = false;
  dataReady: boolean = false;
  dataReady_Info: boolean = false;
  dataReady_Role: boolean[] = [];
  dataReady_RoleList: boolean = false;
  dataReady_Overview: boolean = false;
  dataReady_Dimension: boolean = false;
  dataReady_Question: boolean[] = [];
  dataReady_Selection: boolean = false;
  dataReady_refreshOverview: boolean = false;
  dataReady_RoleListOld: boolean = false;

  surveyInfo: any = null;
  resultsOverview: any = null;

  employeeCount: number;
  responseCount: number;

  surveyDate: Date;

  //---------------------------

  dimensionList: string[] = [];
  dimension_labels: string[] = [];
  c_labels_scoreByRole: string[] = [];

  dataOldRole:Models.OldDataTable[]= null;

  roleId: number = 1;
  ResultbyRoles: any = null;

  currentRole: number = null;

  dropdown_Roles_Text: string;
  dropdown_Role_Items: any[];
  all_role: any[];

  // ---------------------------------------------------------

  response_Data: ChartData;
  response_Opt: ChartOptions;

  roleResponse_Data: ChartData;
  roleResponse_Opt: ChartOptions;

  roleEngagement_Data: ChartData;
  roleEngagement_Opt: ChartOptions;
roleEngagement_DataOld: ChartData;

  YoSByRole_Data: ChartData;
  YoSByRole_Opt: ChartOptions;

  resultsByRole: any[] = [null, null, null, null];

  role_data: number;

  questionScoreByRole: number;
  resultByQuestion: any[] = [];
  scoreByQuestionLabels: string[];

  // ---------------------------------------------------------

  roleColors: any[] = [
    "rgba(40, 195, 90, 1)",
    "rgba(30, 195, 245, 1)",
    "rgba(200, 140, 240, 1)",
    "rgba(100, 140, 240, 1)",
    "rgba(250, 190, 75, 1)",
    
  ];
  responseColors: any[] = [ AppConfig.darkishGreen,AppConfig.responseOrange];
  yearOfServiceLineColor: any = "rgba(255,150,60,1)";
  fontSize: number = 22;
  barThick: number = 60;

  // ---------------------------------------------------------

  constructor(private dataSrv: NewDataService) {}

  ngOnInit(): void {
    this.dropdown_Roles_Text = " none selected ";
    this.dropdown_Role_Items = [];
    this.getOvierviewData();
    this.getSelectionData();
    this.refreshOverviewCharts();
    this.refreshSelectionCharts();
    //console.log(this.dropdown_Role_Items);
  }

  getOvierviewData(): void {
    this.getInfo();
    this.getRoleLists();
    this.getRoleData();
    this.getRoleOld();
  }

  getSelectionData(): void {
    this.getDimensionData();
    this.getQuestionData();
  }

  // ---------------------------------------------------------

  onRefreshData(): void {
    //this.refreshData = true;
    this.dataReady = false;
    this.getOvierviewData();
    this.getSelectionData();
    this.refreshOverviewCharts();
    this.refreshSelectionCharts();
  }

  onSelectRole(item: any): void {
    console.log("Select Role: " + item.name);

    this.currentRole = item.id;
    this.dropdown_Roles_Text = item.name;

    this.refreshSelectionCharts();
  }

  // ---------------------------------------------------------

  async refreshOverviewCharts() {
    await Helpers.waitUntil((_) => this.dataReady_Info && this.dataReady_Overview && this.dataReady_RoleList && this.dataReady_Role.every((x) => x === true));
    console.log("refreshing charts...");
    this.refreshResponseRateChart();
    this.refreshRoleResponseChart();
    this.refreshEngagementRoleChart();
    this.refreshYearOfServiceResponseChart();
    this.dataReady_refreshOverview = true;
    console.log("completed refreshing charts..");
  }

  async refreshSelectionCharts() {
    await Helpers.waitUntil((_) => this.dataReady_refreshOverview && this.dataReady_Dimension && this.dataReady_Question.every((x) => x === true));
    console.log("refreshing byDimension chart...");
    this.refreshEngagementRoleByDimensionChart();
    this.refreshEngagementRoleByQuestionChart();
    console.log("completed refreshing byDimension chart...");
  }

  // ---------------------------------------------------------
  async getInfo() {
    this.dataReady_Overview = false;
    this.dataSrv.getSurveyInfo(this.surveyId).subscribe(
      (res: any) => {
        this.error = null;
        console.log(res);

        this.surveyInfo = res;
        this.surveyDate = new Date(res["date_created"]);
        this.employeeCount = res["responder_count"];
      },
      (err) => {
        this.error = err;
      },
      () => (this.dataReady_Info = true)
    );

    this.dataSrv.getResultsOverview(this.surveyId).subscribe(
      (res: any) => {
        this.error = null;
        console.log(res);

        this.resultsOverview = res;
        this.responseCount = res["responder_count"];
      },
      (err) => {
        this.error = err;
      },
      () => (this.dataReady_Overview = true)
    );
    await Helpers.waitUntil((_) => this.dataReady_Info && this.dataReady_Overview);
  }

  getDimensionData(): void {
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
      () => (this.dataReady_Dimension = true)
    );
  }

  getRoleLists(): void {
    this.dataReady_RoleList = false;
    this.dataSrv.getRoleList().subscribe(
      (res: any) => {
        this.error = null;
        console.log("Role" + res);
        this.all_role = res.map((x: any, index: number) => {
          return { id: index, rid: x["role_id"], name: x["role_name"] };
        });
        console.log(this.all_role);
      },
      (err) => {
        this.error = err;
      },
      () => (this.dataReady_RoleList = true)
    );
  }
  getRoleOld(): void{
		this.dataReady_RoleListOld = false;
		this.dataSrv.getOldResultsFilter(this.surveyId,0,0,0,0,0,"Role").subscribe(
			(res: Models.OldDataTable[] ) => {
				console.log(res);
				this.error = null;
				this.dataOldRole = res;
				console.log("Old Generation Data received.");
				console.log(this.dataOldRole);
			},
			(err) => {
				this.error = err;
				this.dataOldRole = null;
			},
			() => this.dataReady_RoleListOld = true
		);
	}
  async getRoleData() {
    console.log("Requesting data from backend...");

    await Helpers.waitUntil((_) => this.dataReady_RoleList);
    var Id = this.all_role.map((x: any) => x["id"]);
    console.log(Id);
    //prepare all role and question arrays to get information
    for (let id of Id) {
      this.dataReady_Role[id] = false;
      this.dataReady_Question[id] = false;
      this.resultsByRole[id] = null;
      this.resultByQuestion[id] = null;
    }
    console.log(Id);
    console.log(this.dataReady_Role);
    console.log(this.dataReady_Question);
    
    await Helpers.waitUntil((_) => this.dataReady_Role.every((x: any) => x === false) && this.dataReady_Question.every((x: any) => x === false));
    
    //loop through all roles to get information
    var i:number = 0;
    this.all_role.forEach((Rid: any, index: number) => {
      //Used to get role information
      this.dataSrv.getRoleResultsData(this.surveyId, Rid["rid"]).subscribe(
        (res: any) => {
          this.error = null;
          console.log(res);
          this.resultsByRole[index] = res;
          if (res.responder_count > 0) {
            this.dropdown_Role_Items[i] = Rid;
            console.log(this.dropdown_Role_Items);
            i++;
          }
        },
        (err) => {
          this.error = err;
          this.resultsByRole[index] = {};
        },
        () => (this.dataReady_Role[index] = true)
      );
    });

    await Helpers.waitUntil((_) => this.dataReady_Role.every((x) => x === true));
   
    //sort the dropdown list
    this.dropdown_Role_Items.sort((a: any, b: any) => a.id - b.id);
    console.log(this.dropdown_Role_Items);
    this.dataReady_Selection = true;
    console.log("Role Data received.");
    console.log(this.resultsByRole);
  }

  async getQuestionData() {

    await Helpers.waitUntil((_) => this.dataReady_RoleList && this.dataReady_Role.every((x) => x));
    console.log("Requesting question data from backend...");

    //loop through all roles to get information
    this.all_role.forEach((Qid: any) => {
      //Used to get question information by role
      this.dataSrv.getQuestionResultsDataByRole(this.surveyId, Qid["rid"]).subscribe(
          (res: any) => {
            this.error = null;
            console.log(res);

            this.resultByQuestion[Qid["id"]] = res.filter(
              (x: any) => x != null
            );
          },
          (err) => {
            this.error = err;
            this.resultByQuestion[Qid["id"]] = [];
          },
          () => (this.dataReady_Question[Qid["id"]] = true)
        );
    });

    await Helpers.waitUntil((_) => this.dataReady_Question.every((x) => x === true));
    console.log("Question Data received.");
    console.log(this.resultByQuestion);
  }

  //----------------------------------------------------------------------------------------------------

  refreshResponseRateChart(): void {
    var labels = ["Response", "Non-Response"];
    var responseData = [
      this.responseCount,
      this.employeeCount - this.responseCount,
    ];
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
            title: {
              anchor: "end",
              align: "end",
              formatter: (x: number, ctx: Context) => {
                var x = (x / this.employeeCount) * 100;
                return x.toFixed(AppConfig.decPlaces) + "%\n";
              },
              //formatter: (x: number, ctx: Context) => {var y=x;x=(x/this.employeeCount)*100;return x.toFixed(1) + '%\n  '+y;},
            },
            value: {
              //color: this.responseColors,
              anchor: "center",
              align: "center",

              formatter: (x: number, ctx: Context) => x,
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
        position: "bottom",
        labels: {
          padding: 30,
          fontSize: AppConfig.donutFontSize,
        },
      },
      cutoutPercentage: 40,
      tooltips: {
        enabled: false,
        callbacks: {
          label: function (tooltipItem, data) {
            var label = data.labels[tooltipItem.index];
            var value =
              data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            return label + " Count: " + value;
          },
        },
      },
    };
  }

  refreshRoleResponseChart(): void {

    var labels: string[] = this.resultsByRole
      .filter(function (x) {return x.responder_count > 0;})
      .map((x) => x.group["role_name"]);
    
    var Numberdata: number[] = this.resultsByRole
      .filter(function (x) {return x.responder_count > 0;})
      .map((x) => x["responder_count"]);
    
    console.log(labels);
    //console.log(data);
    //console.log(response);
    this.roleResponse_Data = {
      labels: labels,
      datasets: [
        {
          label: "Response Rate by role",
          data: Numberdata,
          backgroundColor: this.roleColors,
          //barThickness: 50,
        },
      ],
    };
    this.roleResponse_Opt = {
      hover:{
				mode: null,

			} ,
			events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
		
      rotation: 100,
      plugins: {
        datalabels: {
          labels: {
            title: {
              anchor: "end",
              align: "end",
              formatter: (x: number, ctx: Context) => {
                var x = (x / this.responseCount) * 100;
                return x.toFixed(AppConfig.decPlaces) + "%\n";
              },
              
              //formatter: (x: number, ctx: Context) => {var y=x;x=(x/this.responseCount)*100;return x.toFixed(1) + '%\n  '+y;},
            },
            value: {
              //color: this.responseColors,
              anchor: "center",
              align: "center",
              formatter: (x: number, ctx: Context) => {
                if (x > 0) {
                  return x;
                }
              },
              
            },
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
        position: "bottom",
        labels: {
          padding: 30,
        },
      },
      cutoutPercentage: 40,
      tooltips: {
        enabled: false,
        callbacks: {
          label: function (tooltipItem, data) {
            var label = data.labels[tooltipItem.index];
            var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            return " " + value + " Employees";
          },
        },
      },
    };
  }

  refreshEngagementRoleChart(): void {
    var dataOldR= this.dataOldRole;
		var dataOld= dataOldR.map(x => parseFloat(x.score.toFixed(AppConfig.decPlaces)));
    var labels: string[] = this.resultsByRole
      .filter(function (x) {return x.responder_count > 0;})
      .map((x) => x.group["role_name"]);
    
    var data: number[] = this.resultsByRole
      .filter(function (x) {return x.responder_count > 0;})
      .map((x) => {
        const digitdecimal = x["score_avg_percent"].toFixed(AppConfig.decPlaces); ///check if should be fixed
        return parseFloat(digitdecimal);
      });


     
    this.roleEngagement_Data = {
      labels: labels,
      datasets: [
        {
          data: [100,100,100],//data,
          backgroundColor: this.roleColors,
          barThickness: this.barThick,
        },
      ],
    };
    this.c_labels_scoreByRole=labels
		this.roleEngagement_DataOld = {
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
				backgroundColor: this.roleColors,
				barPercentage: 0.9,
				maxBarThickness: 50,
				minBarLength: 2,
			}],
		};

    this.roleEngagement_Opt = {
      plugins: {
        datalabels: {
          anchor: "end",
          align: "end",
          formatter: (x: string, ctx: Context) => x + "%",
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
        xAxes: [
          {
            stacked: true,
          },
        ],
        yAxes: [
          {
            gridLines: {
              display: true,
            },
            ticks: {
              min: 0,
              max: 100,
              stepSize: 20,
              callback: function (value) {
                return value + "%";
              },
            },
          },
        ],
      },
      tooltips: {
        enabled: false,
        callbacks: {
          label: function (tooltipItem, data) {
            //var label = data.labels[tooltipItem.index];
            var value =
              data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            return value + "%";
          },
        },
      },
    };
  }

  refreshYearOfServiceResponseChart(): void {

    console.log(this.resultsOverview.length);

    /*var yearOfService: number[] = this.resultsByRole
      .filter(function (x) {
        return x.responder_count > 0;})
      .map((x) => {
        const digitdecimal = x["service_avg"];
        return parseFloat(digitdecimal.toFixed(1));
      });*/

    var labels: string[] = this.resultsByRole
      .filter(function (x) {return x.responder_count > 0;})
      .map((x) => {
        if (x != null) {
          return x.group["role_name"];
        }});

    var Numberdata: number[] = this.resultsByRole
      .filter(function (x) {
        return x.responder_count > 0;})
      .map((x) => {
        if (x != null) {
          return x['responder_count'];
        }});

    var Max = Math.max(...Numberdata);

    console.log(labels);
    //console.log(data);
    //console.log(response);
    this.YoSByRole_Data = {
      labels: labels,
      datasets: [
        {
          yAxisID: "yBar",
          type: "bar",
          label: "Response Rate by Generation",
          data: Numberdata,
          backgroundColor: this.roleColors,
          barThickness: this.barThick,
          order: 2,
        },
        /*{
          yAxisID: "yLine",
          type: "line",
          label: "Year of Service Average",
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
    this.YoSByRole_Opt = {
      responsive: true,
      plugins: {
        datalabels: {
          anchor: "end",
          align: "top",

          formatter: (x: number, ctx: Context) => {
            if (ctx.datasetIndex === 0) {
              return x;
            } else {
              if (ctx.datasetIndex === 1) {
                return x.toFixed(AppConfig.decPlaces);
              } else {
                return "";
              }
            }
          },
          //rotation: 270,
          offset: 3,
					display: 'auto',
          /*font: {
						size: this.fontSize,
					},*/
        },
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            stacked: false,
          },
        ],
        yAxes: [
          {
            id: "yBar",
            position: "left",
            scaleLabel: {
              display: true,
              labelString: "Number of Employees",
              //fontSize: 18,
            },
            gridLines: {
              display: true,
            },
            ticks: {
              min: 0,
              /*max: Helpers.ceil_base(
                Max + Helpers.floor_base(Max / 7, 7),
                Helpers.floor_base(Max / 7, 7)
              ),*/
              max: Helpers.ceil_base(Max+7,7),
              stepSize: 7,
            },
          },
          /*{
            id: "yLine",
            position: "right",
            scaleLabel: {
              display: true,
              labelString: "Years of Service",
              //fontSize: 18,
            },
            gridLines: {
              display: false,
            },
            ticks: {
              min: 0,
              max: Helpers.ceil_base(Math.max(...yearOfService) + 4, 2),
              stepSize: 2,
            },
          },*/
        ],
      },
      tooltips: {
        enabled: false,
        callbacks: {
          label: function (tooltipItem, data) {
            var label = data.labels[tooltipItem.index];
            var value =
              data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
            return " " + value + " Employees";
          },
        },
      },
    };
  }

  refreshEngagementRoleByDimensionChart(): void {
    if (this.currentRole != null) {
      var data: any[] = this.resultsByRole.map((x) => x["score_dimensions"]);
      this.dimension_labels = this.dimensionList.map((x) => x["dimension_name"]);
      console.log(data);

      this.role_data = data[this.currentRole].map((x) => {
        const digitdecimal = ((x["score_avg"] * 100) / 5).toFixed(AppConfig.decPlaces); ///check if should eb fixed
        return parseFloat(digitdecimal);
      });
    }
  }

  refreshEngagementRoleByQuestionChart(): void {
    if (this.currentRole != null) {
      var data: any[] = this.resultByQuestion.map((x) => x);
      console.log(data);
      this.questionScoreByRole = data[this.currentRole].map((x) => {
        const digitdecimal = ((x["score_avg"] * 100) / 5).toFixed(AppConfig.decPlaces); ///check
        return parseFloat(digitdecimal);
      });
      this.scoreByQuestionLabels = data[this.currentRole].map((x) => "Q" + x["question_id"]);
      console.log(this.questionScoreByRole);
      console.log(this.scoreByQuestionLabels);
    }
  }
}

// ---------------------------------------------------------
