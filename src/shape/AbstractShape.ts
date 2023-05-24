class AbstractShape {

    handleTagName: string | undefined;

    constructor() { }

    insertShapeElement(dataModel: any, node: any) {
        dataModel.addNodes([node]);
    }

}

export default AbstractShape;