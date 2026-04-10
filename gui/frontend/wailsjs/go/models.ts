export namespace app {
	
	export class ConfigValueUpdate {
	    keyPath: string;
	    value: any;
	
	    static createFrom(source: any = {}) {
	        return new ConfigValueUpdate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.keyPath = source["keyPath"];
	        this.value = source["value"];
	    }
	}

}

