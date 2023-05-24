import  GraphEditor  from '../../src/GraphEditor'
export function createEditor(title) {

    var container =
        (global.document.createElement('div')) || undefined;
        
    container.style.width="200px";
    container.style.height="260px";
    container.style.margin="10px";
    container.style.border="1px solid gray";
    container.style.display="flex";
    container.style.flexDirection="column";
    var titleContainer =
    (global.document.createElement('div')) || undefined;
    titleContainer.innerHTML=title;
    var graphContainer =
    (global.document.createElement('div')) || undefined;
    
    container.appendChild(titleContainer);
    container.appendChild(graphContainer);
       
    var editor = new GraphEditor(
        {
            container:graphContainer,
            view: {
                size: {
                    width: 200,
                    height: 200
                }
            }
        }
    );
    document.getElementById("preview")?.appendChild(container);
    return editor;
}