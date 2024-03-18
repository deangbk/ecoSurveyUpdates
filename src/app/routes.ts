import { Routes } from '@angular/router';
import { BarChartComponent } from './charts/bar-chart.component';
import { CountryChartComponent } from './country-chart/country-chart.component';
import { OverviewChartsComponent } from './Overview-New/overview-charts/overview-charts.component';
import { MainCombinedComponent } from './main-combined/main-combined.component';
import { OverviewComponent } from './overview/overview.component';
import { ResultsByDimensionComponent } from './results-by-dimension/results-by-dimension.component';
import { ResultsByDepartmentComponent } from './results-by-department/results-by-department.component';
import { ResultsByGenerationComponent } from './results-by-generation/results-by-generation.component';
import { ResultsByRoleComponent } from './results-by-role/results-by-role.component';
import { ResultsByGenderComponent } from './results-by-gender/results-by-gender.component'
import { ResultsByAgeComponent } from './results-by-age/results-by-age.component';
import { ResultsByYearOfServiceComponent } from './results-by-year-of-service/results-by-year-of-service.component';
import { OverviewAnswersComponent } from './overview-answers/overview-answers.component';
import { OvPercentQuestionsComponent } from './ov-percent-questions/ov-percent-questions.component';
import { RCircleChartComponent } from './charts/circle-chart/circle-chart.component';

export const appRoutes: Routes = [
	{ path: 'home', component: BarChartComponent },
	{ path: 'Country/:id', component: CountryChartComponent },
	{ path: 'homeNew', component: OverviewChartsComponent },
	{ path: 'quest', component: OverviewAnswersComponent },
	{ path: 'perQuest', component: OvPercentQuestionsComponent },
	{ path: 'donut', component: RCircleChartComponent },
	
	{ path: 'home/overview', component: MainCombinedComponent  },

	{ path: 'home/overview/bydimension', component: ResultsByDimensionComponent },
	{ path: 'home/overview/bydepartment', component: ResultsByDepartmentComponent },
	{ path: 'home/overview/bygeneration', component: ResultsByGenerationComponent },
	{ path: 'home/overview/byrole', component: ResultsByRoleComponent },
	{ path: 'home/overview/bygender', component: ResultsByGenderComponent },
	{ path: 'home/overview/byage', component: ResultsByAgeComponent },
    { path: 'home/overview/byyearofservice', component: ResultsByYearOfServiceComponent },
	{path: 'OverView', component: OverviewComponent}
 
];
