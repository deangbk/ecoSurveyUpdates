
import { RouterModule } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { appRoutes } from './routes';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AccordionModule } from 'ngx-bootstrap/accordion';

import { AppComponent } from './app.component';

import { SortByPipe } from './sort-by.pipe';

import { BarChartComponent } from './charts/bar-chart.component';
import { CountryChartComponent } from './country-chart/country-chart.component';

import { OverviewChartsComponent } from './Overview-New/overview-charts/overview-charts.component';

import { RCircleChartComponent } from './charts/circle-chart/circle-chart.component';
import { RBarChartComponent } from './charts/bar-chart/bar-chart.component';
import { BaseChartComponent } from './charts/base-chart/base-chart.component';

import { OverviewComponent } from './overview/overview.component';
import { MainCombinedComponent } from './main-combined/main-combined.component';
import { ResultsByDimensionComponent } from './results-by-dimension/results-by-dimension.component';
import { ResultsByDepartmentComponent } from './results-by-department/results-by-department.component';
import { DepartmentSelectorComponent } from './department-selector/department-selector.component';
import { ResultsByGenerationComponent } from './results-by-generation/results-by-generation.component'
import { ResultsByRoleComponent } from './results-by-role/results-by-role.component'
import { ResultsByGenderComponent } from './results-by-gender/results-by-gender.component'
import { ResultsByAgeComponent } from './results-by-age/results-by-age.component';
import { ResultsByYearOfServiceComponent } from './results-by-year-of-service/results-by-year-of-service.component';

import { MenuBarComponent } from './menu-bar/menu-bar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { OverviewAnswersComponent } from './overview-answers/overview-answers.component';
import { TemplateChartHoriQuestionsComponent } from './charts/template/template-chart-hori-questions/template-chart-hori-questions.component';
import { OvPercentQuestionsComponent } from './ov-percent-questions/ov-percent-questions.component';
import { TemplateChartPerComponent } from './charts/template/template-chart-per/template-chart-per.component';
import { TemplateChartPercentBarsComponent } from './charts/template/template-chart-percent-bars/template-chart-percent-bars.component';
import { TemplateChartScoreModeComponent } from './charts/template/template-chart-score-mode/template-chart-score-mode.component';
import { TemplateChartHoriBarsComponent } from './charts/template/template-chart-hori-bars/template-chart-hori-bars.component';
import { TemplateChartVertiBarsComponent } from './charts/template/template-chart-verti-bars/template-chart-verti-bars.component';
import { TemplateHoriTestComponent } from './charts/template/template-hori-test/template-hori-test.component';
import { TemplateVertGroupedComponent } from './charts/template/template-vert-grouped/template-vert-grouped.component';
import { BottomScores } from './data/dim-difference.service';
import { DimDifferenceService } from './data/dim-difference.service';
import { DonutTestComponent } from './charts/donut-test/donut-test.component';
import { SortTablePipe } from './pipes/sort-table.pipe';

@NgModule({
	declarations: [
		AppComponent,
		BarChartComponent,
		CountryChartComponent,
		SortByPipe,
		OverviewChartsComponent,
	
		RCircleChartComponent,
		RBarChartComponent,
		BaseChartComponent,
		
		MainCombinedComponent, 
		OverviewComponent,
		
		ResultsByDimensionComponent,
		ResultsByDepartmentComponent,
		ResultsByGenerationComponent,
		ResultsByRoleComponent,
		ResultsByGenderComponent,
		ResultsByAgeComponent,
		ResultsByYearOfServiceComponent,
		
		MenuBarComponent,
		DepartmentSelectorComponent,
		TemplateChartScoreModeComponent,
		TemplateChartHoriBarsComponent,
		OverviewAnswersComponent,
		TemplateChartHoriQuestionsComponent,
		OvPercentQuestionsComponent,
		TemplateChartPerComponent,
		TemplateChartPercentBarsComponent,
		TemplateChartVertiBarsComponent,
		TemplateHoriTestComponent,
		TemplateVertGroupedComponent,
		DonutTestComponent,
		SortTablePipe,
	],
	imports: [
		BrowserModule,
		HttpClientModule,
		RouterModule.forRoot(appRoutes),
		
		FormsModule,
		ReactiveFormsModule,
		BrowserAnimationsModule,
		BsDropdownModule.forRoot(),
		//NgbModule,
		AccordionModule.forRoot(),
		NgbTooltipModule,
	],
	providers: [{provide: LocationStrategy, useClass: HashLocationStrategy},DimDifferenceService, BottomScores],
	bootstrap: [AppComponent]
})
export class AppModule {
}
