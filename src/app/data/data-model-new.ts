
export interface GetSurveyInfo {
	date_created: string,
	project_name: string,
	description: string,
	responder_count: number,
};

export interface DimensionTable {
	dimension_id: number,
	dimension_name: string,
	dimension_name_short: string,
	project_name?: string,
};
export interface DepartmentTable {
	department_id: number,
	department_name: string,
	department_name_short: string,
	project_name?: string,
	population?: number,
};
export interface GenerationTable {
	generation_id: number,
	generation_name: string,
	year_min?: number,
	year_max?: number,
};
export interface RoleTable {
	role_id: number,
	role_name: string,
	year_min?: number,
	project_name?: string,
};
export interface GenderTable {
	gender: number,
};
export interface OldDataTable {
	department_id: number,
	year: number,
	label: string,
	project_id?: number,
	score: number,
	Generation?: number,
	Role?: number,
	generation_Id?: number,
	dim?:number,
	dimName?:string,
	yearService?:number,
};
export interface DimensionComparison {
	ResponseRate: number,
	ResponseTotal: number,
	DifOverall: number,
	ResponsePotential: number,
	DimIncrease?: number,
	DimDecrease: number,
	DimInceasedName?: string,
	DimDecreaseName?: string,
	TopDim?: string,
	TopScore?: number,
	BotDim?: string
	BotScore?: number,
	BotScores?: number[],
	TopScores?: number[],
	TopDims?: string[],
	BotDims?: string[],
	BottomDims?:DimComparisonItem[],
	TopDimItems?:DimComparisonItem[],
};

export interface DimComparisonItem {
	DimensionName: string,
	scoreR2: number,
	scoreR1: number,
	difference: number,
	rank?: number,
}
// ---------------------------------------------------------

export interface GetAllDeptsTree extends DepartmentTable {
	parent_id?: number,
	children: GetAllDeptsTree[],
	level: number,
	population: number,
	population_sum: number,
};
export interface GetAllDeptsFlat extends DepartmentTable {
	parent_id?: number,
	children_ids: number[],
	level: number,
	population: number,
	population_sum: number,
};

// ---------------------------------------------------------

export interface ResultBase {
	responder_count: number,
	service_avg: number,
	score_avg: number,
	score_avg_percent: number,
	score_modes: number[],
};

export interface ResultDimension extends ResultBase, DimensionTable {
}
export interface ResultDepartment extends ResultBase, DepartmentTable {
}
export interface ResultRole extends ResultBase, RoleTable {
}
export interface ResultGeneration extends ResultBase, GenerationTable {
}
export interface ResultGender extends ResultBase, GenderTable {
}

export interface ResultOverview extends ResultBase {
	response_count: number,
	score_dimensions?: ResultDimension[],
	score_depts?: ResultDepartment[],
	score_roles?: ResultRole[],
	score_generations?: ResultGeneration[],
	score_genders?: ResultGender[],
};
export interface ResultByCategoryFilter extends ResultBase {
	group: DimensionTable | DepartmentTable
		| RoleTable | GenerationTable | GenderTable,
	score_dimensions?: ResultDimension[],
	score_depts?: ResultDepartment[],
	score_roles?: ResultRole[],
	score_generations?: ResultGeneration[],
	score_genders?: ResultGender[],
};
export interface ResultByCategoryFilterSp {
	group: DimensionTable | DepartmentTable
		| RoleTable | GenerationTable | GenderTable,
	score_dimensions?: ResultDimension,
	score_depts?: ResultDepartment,
	score_roles?: ResultRole,
	score_generations?: ResultGeneration,
	score_genders?: ResultGender,
};
export interface ResultSubdepts extends ResultBase {
	response_count: number,
	score_subdepts: ResultDepartment[],
};

export interface ResultOldData {
	Department_Id: number,
	scoresByYear: OldDataTable[],
};
export interface ResultByRangeFilter extends ResultBase {
	range: number[],
	score_dimensions?: ResultDimension[],
	score_roles?: ResultRole[],
	score_genders?: ResultGender[],
};
export interface ResultQuestionsPercentageMap {
	question_id: number,
	dimension_id: number,
	score_count: number,
	score_avg: number,
	score_modes: number[],
};

export interface ResultByDeptThenGeneration_Sub {
	group: GenerationTable,
	score: ResultBase,
	score_dimensions: ResultDimension[],
	score_questions: ResultQuestionsPercentageMap[],
};
export interface ResultByDeptThenGeneration {
	group: DepartmentTable,
	score: ResultBase,
	score_generations: ResultByDeptThenGeneration_Sub[],
};