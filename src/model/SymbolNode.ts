import { ContainerNode, ContainerNodeAttrs } from './ContainerNode';

export class SymbolNodeAttrs extends ContainerNodeAttrs { }

export class SymbolNode extends ContainerNode {

    static className = 'SymbolNode';
    className = 'SymbolNode';
    attributes = new SymbolNodeAttrs();
    symbolName: string | undefined;

    constructor(opt?: any) {
        super();
        if (opt) this.fromObject(opt);
    }

    getSymbolName() {
        return this.symbolName;
    }

    setSymbolName(name: string) {
        this.symbolName = name;
    }

    fromObject(obj: any) {
        super.fromObject(obj);
        let symbolName: string;
        if (obj instanceof Array) {
            symbolName = obj[8];
        } else {
            ({ symbolName } = obj);
        }
        if (symbolName) this.setSymbolName(symbolName);
    }

    toObject(isArray: boolean = false) {
        let obj: any = super.toObject(isArray);
        let symbolName = this.getSymbolName();
        if (isArray) {
            obj.push(symbolName);
        } else {
            obj.symbolName = symbolName;
        }
        return obj;
    }

}
