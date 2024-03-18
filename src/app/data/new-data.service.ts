import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AppConfig } from '../config';

@Injectable({
	providedIn: 'root'
})
export class NewDataService {
	baseUrl: string;
	
	constructor(private http: HttpClient) {
		if (AppConfig.apiSourceLocal)
			this.baseUrl = 'https://localhost:7131/api';
		else
			this.baseUrl = 'https://ecosurveyapi.azurewebsites.net/api';
	}
	
	
	//Handle errors
	private handleError(error: HttpErrorResponse) {
		console.log(error);
		// return an observable with a user message
		return throwError('Error! something went wrong.');
	}
	

	//Grab average score per comp
	getAvgDim(): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/overview/2`)
			.pipe(catchError(this.handleError));
	}
	

	//Overview
	public getSurveyInfo(surveyId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/survey/get/${surveyId}`)
			.pipe(catchError(this.handleError));
	}
	public getResultsOverview(surveyId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/overview/${surveyId}?gets=dims`)
			.pipe(catchError(this.handleError));
	}
	public getResultsOverviewEx(surveyId: number, gets: string): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/overview/${surveyId}?gets=${gets}`)
			.pipe(catchError(this.handleError));
	}
	
	
	//Dimension
	public getDimensionList(surveyId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/survey/getallgroups/${surveyId}`)
			.pipe(catchError(this.handleError));
	}
	public getDimensionResultsData(surveyId: number, dimensionId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/by_category/${surveyId}`
				+ `?category=dims&id=${dimensionId}&top_depts_only=true`)
			.pipe(catchError(this.handleError));
	}
	public getDimensionResultsData_OfDepartment(surveyId: number, dimensionId: number,
		deptId: number): Observable<any> {
		
		return this.http
			.get(`${this.baseUrl}/result/by_category_sp/${surveyId}`
				+ `?category=dims&id=${dimensionId}`
				+ `&category_get=dept&id_get=${deptId}`)
			.pipe(catchError(this.handleError));
	}


	//Department
	public getDepartmentOverview(surveyId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/by_dept/${surveyId}`)
			.pipe(catchError(this.handleError));
	}
	public getDepartmentList_Tree(surveyId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/survey/getalldepts_tree/${surveyId}`)
			.pipe(catchError(this.handleError));
	}
	public getDepartmentList_Flat(surveyId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/survey/getalldepts_flat/${surveyId}`)
			.pipe(catchError(this.handleError));
	}
	public getDepartmentResultsData(surveyId: number, deptId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/by_category/${surveyId}`
				+ `?category=dept&id=${deptId}`)
			.pipe(catchError(this.handleError));
	}
	public getSubDepartmentResultsData(surveyId: number, deptId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/by_subdepts/${surveyId}/${deptId}`)
			.pipe(catchError(this.handleError));
	}
	public getDepartmentThenGenerationResultsData(surveyId: number, deptId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/by_dept_then_genr/${surveyId}/${deptId}`)
			.pipe(catchError(this.handleError));
	}
	///old department results data
	public getOldDepartmentResultsData(surveyId: number, depId): Observable<any> {
		return this.http
		.get(`${this.baseUrl}/OldResults/old_dep/${surveyId}/${depId}`)
		.pipe(catchError(this.handleError));
}

public getOldDepartmentOverallData(surveyId: number, depId: number): Observable<any> {
	return this.http
	.get(`${this.baseUrl}/OldResults/old_dep_overall/${surveyId}/${depId}`)
	.pipe(catchError(this.handleError));
}
//// old dimension data filtered by department
public getOldDimResultsData(surveyId: number, depId: number): Observable<any> {
	return this.http
	.get(`${this.baseUrl}/OldResults/old_dep_dim/${surveyId}/${depId}`)
	.pipe(catchError(this.handleError));
}
//// old scores data filtered by department/dimension/generation/role
public getOldResultsFilter(surveyId: number, Dep_Id: number, Dim_Id:number, Role_Id:number, Generation:number,Years_Service:number,cat: string): Observable<any> {
	return this.http
	.get(`${this.baseUrl}/OldResults/old_filter/${surveyId}`
	+ `?Dep_Id=${Dep_Id}&Role=${Role_Id}&Dim_Id=${Dim_Id}&Generation=${Generation}&Years_Service=${Years_Service}&Category=${cat}`)
	
	.pipe(catchError(this.handleError));
}

//// old subdepartment data filtered by department
public old_subScores(surveyId: number, depId: number): Observable<any> {
	return this.http
	.get(`${this.baseUrl}/OldResults/old_sub/${surveyId}/${depId}`)
	.pipe(catchError(this.handleError));
}
	//Generation
	public getGenerationList(): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/responder/getallgenerations`)
			.pipe(catchError(this.handleError));
	}
	public getGenerationResultsData(surveyId: number, generationId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/by_category/${surveyId}`
				+ `?category=gnra&id=${generationId}`)
			.pipe(catchError(this.handleError));
	}
	public getGenerationResultsData_ofDimension(surveyId: number, generationId: number,
		dimensionId: number): Observable<any> {
		
		return this.http
			.get(`${this.baseUrl}/result/by_category/${surveyId}`
				+ `?category=gnra&id=${generationId}&category_get=dims&id_get=${dimensionId}`)
			.pipe(catchError(this.handleError));
	}


	//Role
	public getRoleList(): Observable<any> {
		return this.http
			//.get(`${this.baseUrl}/survey/getallroles/${surveyId}`)
			.get(`${this.baseUrl}/responder/getallroles`)
			.pipe(catchError(this.handleError));
	}
	public getRoleResultsData(surveyId: number, roleId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/by_category/${surveyId}`
				+ `?category=role&id=${roleId}`)
			.pipe(catchError(this.handleError));
	}
	
	//Gender
	public getGenderList(): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/responder/getallgenders`)
			.pipe(catchError(this.handleError));
	}
	public getGenderResultsData(surveyId: number, genderId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/by_category/${surveyId}`
				+ `?category=gender&id=${genderId}`)
			.pipe(catchError(this.handleError));
	}
	
	//Question
	public getQuestionOverview(surveyId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/by_questions/${surveyId}`)
			.pipe(catchError(this.handleError));
	}
	public getQuestionPer(surveyId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/quest_dim/${surveyId}`)
			.pipe(catchError(this.handleError));
	}
	public getQuestionResultsData(surveyId: number, dimensionId: number, departmentId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/by_question_n/${surveyId}`
				+ `?category=dept&id=${departmentId}&dim_id=${dimensionId}`)
			.pipe(catchError(this.handleError));
	}
	public getQuestionResultsDataByGeneration(surveyId: number, generationId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/by_question_n/${surveyId}`
				+ `?category=gnra&id=${generationId}`)
			.pipe(catchError(this.handleError));
	}
	public getQuestionResultsDataByRole(surveyId: number, roleId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/by_question_n/${surveyId}`
				+ `?category=role&id=${roleId}`)
			.pipe(catchError(this.handleError));
	}
	public getQuestionResultsDataByGender(surveyId: number, genderId: number): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/by_question_n/${surveyId}`
				+ `?category=gender&id=${genderId}`)
			.pipe(catchError(this.handleError));
	}
	public getQuestionResultsDataByAgeRange(surveyId: number, range: number[]): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/by_question_n/${surveyId}`
				+ `?category=age&range_l=${range[0]}&range_u=${range[1]}`)
			.pipe(catchError(this.handleError));
	}
	public getQuestionResultsDataByYearOfService(surveyId: number, range: number[]): Observable<any> {
		return this.http
			.get(`${this.baseUrl}/result/by_question_n/${surveyId}`
				+ `?category=service&range_l=${range[0]}&range_u=${range[1]}`)
			.pipe(catchError(this.handleError));
	}
	

	//Range(Age,YearOfService)
	public getRangeResultsDataAll(surveyId: number, rangeType: string, ranges: number[]): Observable<any> {
		return this.getRangeResultsData(surveyId, 'x', -1, rangeType, ranges);
	}
	public getRangeResultsData(surveyId: number, category: string, categoryId: number,
		rangeType: string, ranges: number[]): Observable<any> {
		
		var ranges_s = ranges.join(',');
		return this.http
			.get(`${this.baseUrl}/result/by_range/${surveyId}`
				+ `?category=${category}&id=${categoryId}`
				+ `&category_range=${rangeType}&ranges=${ranges_s}`)
			.pipe(catchError(this.handleError));
	}


}
