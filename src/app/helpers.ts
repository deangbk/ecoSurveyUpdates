
export class Helpers {
	public static waitUntil(cond: Function): Promise<any> {
		const poll = (resolve: any) => {
			if (cond()) resolve();
			else setTimeout(() => poll(resolve), 100);
		}
		return new Promise(poll);
	};
	public static timeout(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	public static lerp(from: any, to: any, x: number) {
		return from + x * (to - from);
	} 
	public static lerpColor(rgb1: number[], rgb2: number[], x: number) {
		var r = this.lerp(rgb1[0], rgb2[0], x);
		var g = this.lerp(rgb1[1], rgb2[1], x);
		var b = this.lerp(rgb1[2], rgb2[2], x);
		return `rgb(${r}, ${g}, ${b})`
	}
	
	public static ceil_base(x: number, base: number) {
		return Math.ceil(x / base) * base;
	}
	public static floor_base(x: number, base: number) {
		return Math.floor(x / base) * base;
	}
	
	// https://stackoverflow.com/a/38327540
	public static groupBy(list: any[], keyGetter: Function) {
		const map = new Map();
		list.forEach((item) => {
			const key = keyGetter(item);
			const collection = map.get(key);
			if (!collection) {
				map.set(key, [item]);
			} else {
				collection.push(item);
			}
		});
		return map;
	}
	
	public static generateBarColors(data: number[]): any {
		var count = data.length;
		var num_highlights = count > 10 ? 3 : 1;	// Max number of highlighted max/min bars, each
		
		var index_max: number[] = [];
		var index_min: number[] = [];
		
		if (count >= num_highlights * 2 + 1) {
			const tolerance = 1;
			
			var max = Math.max(...data);
			var min = Math.min(...data);
			
			var data_zip: number[][] = data.map((e, i) => [e, i]);
			var data_zip_asc: number[][] = [...data_zip].sort((x, y) => (x[0] - y[0]));
			var data_zip_dsc: number[][] = [...data_zip_asc].reverse();
			
			var num_min = 0, num_max = 0;
			
			// Select mins
			for (let i = 0; i < data_zip_asc.length && num_min < num_highlights; ++i) {
				var [x, idx] = data_zip_asc[i];
				if (Math.abs(x - min) > tolerance)
					break;
				index_min.push(idx);
				num_min++;
			}
			
			// Select maxs
			for (let i = 0; i < data_zip_dsc.length && num_max < num_highlights; ++i) {
				var [x, idx] = data_zip_dsc[i];
				if (Math.abs(x - max) > tolerance)
					break;
				index_max.push(idx);
				num_max++;
			}
		}
		
		return { mins: index_min, maxs: index_max };
	}
	
	public static wrapText(str: string, maxLineLen: number): string[] {
		var words = str.split(' ').map(x => x.trim());
		var res: string[] = [];

		var line: string = '';
		words.forEach(x => {
			var wordLen = x.length;
			
			// If adding the next word would make it overflow, start a new line
			if (line.length + wordLen > maxLineLen) {
				if (line.length > 0)
					res.push(line.slice());	// copy string
				line = '';
			}
			
			if (line.length > 0)
				line += ' ';
			line += x;
		});
		
		// Add leftover text
		if (line.length > 0)
			res.push(line.slice());

		return res;
	}
}
