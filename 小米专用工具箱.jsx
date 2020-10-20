//******************************************
// Toolbox
// Author: JackRao
//
// 文件结构如下：
// -- 1 （组名，必须跟要导入的图片名字相同）
// ---- BlankLocator（空白图层，名字随意，带剪切蒙板）
// ---- Base（基础图层，名字随意，矢量图形，与上面剪切蒙板一起使用）
//
//******************************************/ 

if(app.documents.length > 0)
    var docRef = app.activeDocument;    //* global use

//------------------------------Common function----------------------------------
//* Layer position matched
function GetOffset(boundSrc, boundTg){
    // var boundSrc = layerSrc.bounds;
    // var boundTg = layerTg.bounds;
    var centerSrc = {x: (boundSrc[2]+boundSrc[0])*.5, y: (boundSrc[3]+boundSrc[1])*.5};  //* place *.5 outside be a problem
    var centerTg = {x: (boundTg[2]+boundTg[0])*.5, y: (boundTg[3]+boundTg[1])*.5};
    var x = boundSrc[0] - boundTg[0];
    var y = boundSrc[1] - boundTg[1];
    x = centerSrc.x - centerTg.x;
    y = centerSrc.y - centerTg.y;

    // return [x, y];   // use array
    return {'x':x, 'y': y};  // use dictionary
}
//* Layer size matched  --- TODO: need to be optimized
function GetScaleFactor(boundSrc, boundTg){
    var scale = 1;
    //* source
    var srcWidth = boundSrc[2] - boundSrc[0];
    var srcHeight = boundSrc[3] - boundSrc[1];
    //* target
    var tgWidth = boundTg[2] - boundTg[0];
    var tgHeight = boundTg[3] - boundTg[1];
    //* new algrithm
    var srcRatio = srcWidth / srcHeight;
    var tgRatio = tgWidth / tgHeight;
    scale = (srcRatio > tgRatio)? srcWidth / tgWidth: srcHeight / tgHeight;
    //* deprecated algrithm
    // scale = (tgWidth < tgHeight)? srcWidth/tgWidth: srcHeight/tgHeight;
    // if(srcWidth >= srcHeight){
    //     if(tgWidth == tgHeight) scale = srcHeight/tgWidth;
    // }
    
    return scale;
}
//* Load selected images
function LoadImages(){
    var layers = new Array();
    var files = File.openDialog("选择文件:", '图片:*.jpg;*.png, 所有:*.*', true);
    // alert(files[0].fsName);
    // var files = app.openDialog();
    if(files == null) return;
    for(var i=0; i<files.length; i++) {
        app.load(new File(files[i]));
        var tempFile = app.activeDocument;
        var fileName = tempFile.name.split('.')[0];
        tempFile.selection.selectAll();
        tempFile.selection.copy();
        tempFile.close(SaveOptions.DONOTSAVECHANGES);
        app.activeDocument = docRef;
        docRef.artLayers.add();     //* add layer before paste
        layers[i] = docRef.paste();
        layers[i].name = fileName;
        layers[i].visible = false;
    }
    //* add empty layer to avoid "transform" not available error
    var lyTemp = docRef.artLayers.add();
    lyTemp.name = "占个位置而已，待会我就飞走了";
    layers.push(lyTemp);
    return layers;
}
//* Save as JPEG
function SaveJPEG(doc, saveFile, quality){
    var saveOptions = new JPEGSaveOptions();
    saveOptions.embedColorProfile = true;
    saveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
    saveOptions.matte = MatteType.NONE;
    saveOptions.quality = quality;
    doc.saveAs(saveFile, saveOptions, true);
}
//* Export layer to image
function ExportLayer(layer, file){
    var docDup = docRef.duplicate();
    // docDup.artLayers.add();
    app.activeDocument = docRef;    // for following layer duplicate
    var lyCopy = layer.duplicate(docDup, ElementPlacement.INSIDE);
    app.activeDocument = docDup;    // for save document
    SaveJPEG(docDup, file, 12);
    app.activeDocument = docRef;    // to default
    docDup.close(SaveOptions.DONOTSAVECHANGES);
}

//* Create text layer
function CreateTextLayer(layerName) {    
    var startRulerUnits = app.preferences.rulerUnits;  
    app.preferences.rulerUnits = Units.PIXELS;  
    var thisLayer = activeDocument.artLayers.add();   
    thisLayer.kind = LayerKind.TEXT;   
    thisLayer.name = layerName;   
    var textProperty = thisLayer.textItem;   
    textProperty.kind = TextType.POINTTEXT;  
    //Font Size  
    textProperty.size = 1;   
    textProperty.font = "Arial";   
    var newColor = new SolidColor();   
    //Font Colour  
    newColor.rgb.red = 1;   
    newColor.rgb.green = 0;   
    newColor.rgb.blue = 0;   
    textProperty.color = newColor;   
    textProperty.position = new Array( 100,100);  
    thisLayer.blendMode = BlendMode.NORMAL;   
    thisLayer.opacity = 100;   
    textProperty.contents = layerName;   
    app.preferences.rulerUnits=startRulerUnits;  
    return thisLayer;
}; 
//<----------------------------------------------------------------

//------------------------------Slice layout----------------------------------
//* Generate referent text layer for
var lySetRef;
function CreateRefLayers(){
    lySetRef = docRef.layerSets.add();
    lySetRef.name = "__Reference";
    for (var i = 0; i < docRef.layerSets.length; i++) {
        var lySetTemp = docRef.layerSets[i];
        if(isNaN(lySetTemp.name) == false && lySetTemp.visible){
            var lyNew = CreateTextLayer(lySetTemp.name);
            lyNew.move(lySetRef, ElementPlacement.INSIDE);
            //* base layer in layerSet
            var lyBase = lySetTemp.artLayers[lySetTemp.artLayers.length - 1];   // bottom of current layerSet
            if(lyBase == null) return;
            //* translate and scale 
            var offst = GetOffset(lyBase.bounds, lyNew.bounds);
            lyNew.translate(offst.x, offst.y);
            var scale = GetScaleFactor(lyBase.bounds, lyNew.bounds) * 100;  // percentage --- 100%
            // scale *= .3;
            lyNew.resize(scale, scale, AnchorPosition.MIDDLECENTER);
        }
    }
}

//* Copy some document layer to activeDocument
function LoadForSlice(){
    var matchCount = 0;
    var lysNew = LoadImages();
    if(lysNew == null) return;

    for(var i=0; i<lysNew.length; i++){
        var lyNew = lysNew[i];
        var lySetCount = docRef.layerSets.length;
        for(var j=0; j<lySetCount; j++){
            var lySet = docRef.layerSets[j];
            if(lyNew.name == lySet.name){
                lysNew.visible = true;
                //* base layer in layerSet
                var lyBase = lySet.artLayers[lySet.artLayers.length - 1];   // bottom of current layerSet
                //* position
                var offst = GetOffset(lyBase.bounds, lyNew.bounds);
                lyNew.translate(offst.x, offst.y);
                //* scale
                var scale = GetScaleFactor(lyBase.bounds, lyNew.bounds) * 100; // percentage --- 100%
                scale += 2;      // scale offset
                lyNew.resize(scale, scale, AnchorPosition.MIDDLECENTER);
                //* move to layerSet(Group)
                var lyTop = lySet.artLayers[0];
                lyTop.visible = false;
                lyNew.move(lyTop, ElementPlacement.PLACEAFTER);
                
                matchCount++;
                app.refresh();  
                break;     // exist more layerSets, pevent executing follow snippet
            }

            // place here follow upper 'break'
            if(lyNew.name != lySet.name && j == lySetCount-1){    // exist more layerSets
                // app.refresh();   // lead to flicker using refresh when remove hidden layer 
                lyNew.remove();
            }
        }
    }
    // $.sleep(100);
    alert("主人，我已经把图片都放进来了！");

    //* UI prompt
    if(matchCount == 0) alert("主人，您选的图片没有一张符合要求");
}
//<----------------------------------------------------------------

//------------------------------Output jpg----------------------------------
//* Load image to current Document
function LoadToExport(){
    var lysNew = LoadImages();
    var lysCount = lysNew.length;
    if(lysCount > 1)
        var lySetNew = docRef.layerSets.add();

    var boundCanvas = new Array(0, 0, docRef.width, docRef.height);
    for(var i=0; i<lysCount; i++) {
        var lyNew = lysNew[i];
        lyNew.visible = true;
        //* move to layerSets
        if(lysCount > 1)   
            lyNew.move(lySetNew, ElementPlacement.INSIDE);
        //* translate
        var offset = GetOffset(boundCanvas, lyNew.bounds);  
        lyNew.translate(offset.x, offset.y);
        //* scale
        var scale = GetScaleFactor(boundCanvas, lyNew.bounds) * 100; // percentage --- 100%
        scale += 6      // scale offset
        lyNew.resize(scale, scale, AnchorPosition.MIDDLECENTER);
    }
    app.refresh();

    alert("主人，我已经把图片都放进来了！");
}

//* Save all layer of current layerSet
function SaveCurLayerset(){
    var lySetCur = docRef.activeLayer;
    var isLayer = lySetCur.typename == "ArtLayer"?  true: false;
    var diagName = "输出目录：当前选择的是 " + (isLayer? "层": "组");   //FIXME: not displayed on windows
    var DirSaved = Folder.selectDialog(diagName);   // using "var path" get wrong directory
    
    if(DirSaved == null)return;
    var file;   //file name saved
    if(isLayer){    
        file = new File(DirSaved + "/50.jpg");
        ExportLayer(lySetCur, file);
    }else{
        var lysCount = lySetCur.artLayers.length
        for (var i = 0; i < lysCount; i++) {
            var lyCur = lySetCur.artLayers[i];
            //* layers order: from top to bottom; output order: from bottom to top
            var invertIndex = lysCount-i-1;     
            var fileName = (invertIndex==4) ? 15: invertIndex + 1; //1, 2, 3, 4, 15
            file = new File(DirSaved + "/" + fileName + ".jpg");
            ExportLayer(lyCur, file);
        }
    }

    alert("主人，我已经把图片都导出去了！");
}
//<----------------------------------------------------------------

function main(){
    if(app.documents.length == 0){
        alert("主人，能不能先开个文档再来");return;
    }

    var dialog = new Window("dialog", "小米专用工具包");
    var panel1  = dialog.add("panel", undefined, "切片排版");
    var button1 = panel1.add("button", undefined, "加载切片", {name:"ok"});
    var panel2  = dialog.add("panel", undefined, "主图处理");
    var button2 = panel2.add("button", undefined, "加载主图");
    var button3 = panel2.add("button", undefined, "输出JPG");
    
    // CreateRefLayers();   // reference number

    //* button event
    button1.onClick = function(){
        if(lySetRef != null) lySetRef.remove();
        dialog.close();
        LoadForSlice();
    }
    button2.onClick = function(){
        dialog.close();
        LoadToExport();
    }
    button3.onClick = function(){
        dialog.close();
        SaveCurLayerset();
    }
    
    dialog.show();
}

// var lys = docRef.activeLayer.artLayers.length; 
// alert(lys);

// var ly = docRef.activeLayer;
// ly.remove();

//* Main input
main();