export default class EventObject {

    name: string;
    properties: any = {};

    constructor(name: string, ...params: any) {
        this.name = name;
        for (let i = 0, len = params.length; i < len; i += 2) {
            let key = params[i], val = params[i + 1];
            if (typeof key === 'string' && val !== undefined) {
                this.properties[key] = val;
            }
        }
    }

    getName() {
        return this.name;
    }

    getProperty(key: string) {
        return this.properties[key];
    }

}