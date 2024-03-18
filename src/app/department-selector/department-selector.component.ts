import { Component, OnInit, Output, EventEmitter, Input, OnChanges, ViewChild } from '@angular/core';

import { AccordionModule, AccordionPanelComponent } from 'ngx-bootstrap/accordion';

@Component({
	selector: 'app-department-selector',
	templateUrl: './department-selector.component.html',
	styleUrls: ['./department-selector.component.scss'],
	providers: [
		AccordionModule,
	],
})
export class DepartmentSelectorComponent implements OnInit {
	
	public treeItems_test = [
		{
			id: 1,
			name: "Top Dept 1",
			expand: true,
			children: [
				{
					id: 11,
					name: "Sub Dept 1:1",
					expand: true,
					children: [
						{
							id: 111,
							name: "Sub Dept 1:1:1",
						},
					]
				},
				{
					id: 12,
					name: "Sub Dept 1:2",
					expand: true,
					children: [
						{
							id: 121,
							name: "Sub Dept 1:2:1",
						},
						{
							id: 122,
							name: "Sub Dept 1:2:2",
						},
					]
				},
			]
		},
		{
			id: 2,
			name: "Top Dept 2",
			expand: true,
			children: [
				{
					id: 21,
					name: "Sub Dept 2:1",
					expand: true,
					children: [
						{
							id: 211,
							name: "Sub Dept 2:1:1",
						},
						{
							id: 212,
							name: "Sub Dept 2:1:2",
						},
					]
				},
				{
					id: 22,
					name: "Sub Dept 2:2",
					expand: true,
					children: [
						{
							id: 221,
							name: "Sub Dept 2:2:1",
						},
					]
				},
			]
		}
	];
	
	@ViewChild('categoryGroup', { static: false }) categoryGroup: AccordionPanelComponent;
	
	@Input('items') treeItems = [];
	@Input('heading') heading: string = '';
	@Input('isDisabled') disabled: boolean = false;
	
	@Output('select') selectItemEvent = new EventEmitter<number>();
	
	selectedItemId: number;
	
	constructor() { }
	
	ngOnInit(): void {
		// this.treeItems = this.treeItems_test;
	}
	
	onClick(item: number): void {
		this.selectedItemId = item;
		
		this.selectItemEvent.emit(item);
		console.log(item);
		
		this.categoryGroup.isOpen = false;
	}
}
