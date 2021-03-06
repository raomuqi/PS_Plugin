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

    return scale;
}


//* must place top for image resize
Image.prototype.onDraw = function()
{ 
    // written by Marc Autret
    // "this" is the container; "this.image" is the graphic
    if( !this.image ) return;
    var WH = this.size,
    wh = this.image.size,
    k = Math.min(WH[0]/wh[0], WH[1]/wh[1]),
    xy;
    // Resize proportionally:
    wh = [k*wh[0],k*wh[1]];
    // Center:
    xy = [ (WH[0]-wh[0])/2, (WH[1]-wh[1])/2 ];
    this.graphics.drawImage(this.image,xy[0],xy[1],wh[0],wh[1]);
    WH = wh = xy = null;
}

function saveTxt(content)
{
    var Name = app.activeDocument.name.replace(/\.[^\.]+$/, '');
    var Ext = decodeURI(app.activeDocument.name).replace(/^.*\./,'');
    if (Ext.toLowerCase() != 'psd')
        return;

    var Path = app.activeDocument.path;
    var saveFile = File(Path + "/" + Name +".txt");

    if(saveFile.exists)
        saveFile.remove();

    saveFile.encoding = "UTF8";
    saveFile.open("e", "TEXT", "????");
    saveFile.writeln(content);
    saveFile.close();
}

function SaveText(content) {
    var Path = app.activeDocument.path;
    var Name = "sysInfo_get";
    var saveFile = new File(Path + "/" + Name +".txt");

    if(saveFile.exists)
        saveFile.remove();

    saveFile.encoding = "UTF8";
    saveFile.open("e", "TEXT", "????");
    saveFile.writeln(content);
    saveFile.close();
    alert("Success");
}
////////////////////////////////////////////////////
//* main input
// main();
// alert(app.activeDocument.path);
var info = app.systemInformation;
var reg = /^Serial number.*$/m;
info = "The rain\n in \nSPAIN";
reg = /(\w+)/gm;
// alert(info.match(reg));
alert(info);

// ShowSelImages();

// var lySet = app.activeDocument.layerSets.getByName("a");
// lySet.remove();
// var aa = {"1":true, "2":2};
// alert(aa[1]);

function main()
{
    // var value = prompt();
    // alert(isNaN(value));

    var docRef = app.activeDocument;

    var lySet = docRef.layerSets.add();
    lySet.name = "__Reference";
    for (var i = 0; i < docRef.layerSets.length; i++) {
        var lySetTemp = docRef.layerSets[i];
        if(isNaN(lySetTemp.name) == false){
            var lyNew = CreateTextLayer(lySetTemp.name);
            lyNew.move(lySet, ElementPlacement.INSIDE);
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

    // var files = File.openDialog("Open", "*.*", true);
    // if(files == null) return;
    // var names = "";
    // for(var i=0; i<files.length; i++){
    //     names += files[i].name+"\r";
    // }
    // alert(names);
}

function ShowSelImages(){
    var dialog = new Window("dialog");
    dialog.text = "SelectImage";
    dialog.orientation = "column";
    var count = 4;
    var img = {};    // new Dictionary
    var chboxGroup = new Array();
    for(var i=0; i<count; i++){
        var group = dialog.add("group");
        group.orientation = "row";
        //* ratio button
        chboxGroup[i] = group.add("checkbox");
        //* text
        var editText = group.add('edittext');
        editText.text = i;
        //* image
        var imgfile = new File("D:/Users/Administrator/Pictures/bb.png"); 
        if(imgfile == null)return;
        var img = group.add("image", undefined, imgfile);
        img.size = [50,50];
    }
    var btnOk = dialog.add("button");
    btnOk.text = "OK";
    btnOk.onClick = function(){
        dialog.close();
        // CreateTextLayer("aa");
    }

    dialog.show();
}

function UITest(){
    // DIALOG
    // ======
    var dialog = new Window("dialog"); 
    dialog.text = "Dialog"; 
    dialog.orientation = "column"; 
    dialog.alignChildren = ["center","top"]; 
    dialog.spacing = 10; 
    dialog.margins = 16; 

    // GROUP1
    // ======
    var group1 = dialog.add("group", undefined, {name: "group1"}); 
    group1.orientation = "row"; 
    group1.alignChildren = ["left","center"]; 
    group1.spacing = 10; 
    group1.margins = 0; 

    var edittext1 = group1.add('edittext {properties: {name: "edittext1"}}'); 
    edittext1.text = "EditText"; 

    var image1_imgString = "%C2%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%1E%00%00%00%1E%08%06%00%00%00%3B0%C2%AE%C2%A2%00%00%00%19tEXtSoftware%00Adobe%20ImageReadyq%C3%89e%3C%00%00%01%07IDATx%C3%9A%C3%AC%C2%96%C3%BD%0D%C2%83%20%10%C3%85%C3%85t%00Fp%04Gh7p%04%C2%BBA%3B%C2%89%23t%C2%85n%C2%A0%1B%C3%98%11%C2%BA%C2%81n%40%1F%0D%C2%B4h%3DA%22%C3%B8G%7D%C3%89%C2%8B%17%14%7F%7C%C3%9C%11%C2%98%C2%80%C2%92%0D%C2%94%26%1B%C3%A9%60%C3%84W%C3%B8%11%C2%98%C2%97%C3%83%C3%95%3B%12_%1D%5Dz%C3%A2%C2%BB%1C%C3%A6%3ET%C3%89%C3%90%C2%B0tA%C2%A7%02%C3%AE%10%C2%B6p%C2%87%C3%B8%C3%A6%3B%00%C3%A7%19%C3%A3%5D%26%C2%A1%C3%A2WU%C3%A8%19%170'%C3%9A7%C3%89j%1E%1A%7C_%C3%98%C2%BE%0E%C2%981%C3%B6%C3%84%C3%A3%0C%C3%B7Fs%C2%A3J0%5Cr%19%C3%9Fr%C2%95%20Y%C2%B4rR3%C3%AF%C3%A1F%C2%AD%C2%809%C2%98Z%C3%96w%C2%B4%C3%A4Ru%5C%C3%83r%C2%B5%16%C3%81S%C3%8B%C2%8F%2B%C2%B8%C2%B4%40s%23%C3%83%C3%9D%C3%A1%C3%94%1E%C2%AB%C2%93I%C2%AB%C2%9C%C3%98%C3%ABVL%C2%AB%C2%A3%C3%A0%C3%A6%1EO%C2%82G%C3%90%01%C3%9C%02%C2%9D%C2%85%C3%8F%C2%82%09%C2%A8%C3%96%C3%85%01J%C3%82I%C2%B0%05%C3%AA%C2%A3%01%C2%9C%02%C2%B7%22%C2%8C%3Ep%13%C3%8C%22%5D%7D%C3%A4%C2%89w%C3%92%C2%99%1F%C3%B3%C3%AA3.%C2%BD%C2%84%C3%BD%C3%9Deo%07%C3%AF%C3%A0%1D%C2%BC%C2%9A%5E%02%0C%00u%C2%82%C2%98%3D%C3%8A%C2%8D%C3%B4%C2%B0%00%00%00%00IEND%C2%AEB%60%C2%82"; 
    var image1 = group1.add("image", undefined, File.decode(image1_imgString), {name: "image1"}); 

    // GROUP2
    // ======
    var group2 = dialog.add("group", undefined, {name: "group2"}); 
    group2.orientation = "row"; 
    group2.alignChildren = ["left","center"]; 
    group2.spacing = 10; 
    group2.margins = 0; 

    var edittext2 = group2.add('edittext {properties: {name: "edittext2"}}'); 
    edittext2.text = "EditText"; 

    var image2 = group2.add("image", undefined, File.decode(image1_imgString), {name: "image2"}); 

    dialog.show();
}

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
    newColor.rgb.green = 1;   
    newColor.rgb.blue = 0;   
    textProperty.color = newColor;   
    textProperty.position = new Array( 100,100);  
    thisLayer.blendMode = BlendMode.NORMAL;   
    thisLayer.opacity = 100;   
    textProperty.contents = layerName;   
    app.preferences.rulerUnits=startRulerUnits;  
    return thisLayer;
}; 

function SavePNG(img, savePath){
    var opts = new ExportOptionsSaveForWeb();
    if (img.bitsPerChannel != BitsPerChannelType.EIGHT)
        img.bitsPerChannel = BitsPerChannelType.EIGHT;
    opts.PNG8 = false;
    opts.transparency = true;
    opts.interlaced = false;
    opts.quality = 100;
    opts.includeProfile = false;
    opts.format = SaveDocumentType.PNG;
    img.exportDocument(savePath, ExportType.SAVEFORWEB, opts);
}