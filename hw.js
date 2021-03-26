let url="https://www.espncricinfo.com/series/ipl-2020-21-1210595";
let fs=require('fs');
let cheerio=require('cheerio');
let path=require('path');
let request=require('request');

function dirCreator(filename){
    let full_path=path.join(__dirname,filename);
    if(!fs.existsSync(full_path)){
        fs.mkdirSync(full_path); 
    }
}
function dir2Creator(filename){
    let full_path=path.join(__dirname,"IPL 2020",filename);
    if(!fs.existsSync(full_path)){
        fs.mkdirSync(full_path); 
    }
}

request(url,cb);

function cb(error,response,html){
    if(error){
        console.log(error);
    }else{
        extractHTML(html);
    }
}
function extractHTML(html){
    let selectorTool=cheerio.load(html);
    let resultsURL="https://www.espncricinfo.com"+selectorTool(".label.blue-text.blue-on-hover").attr("href");
    // console.log(resultsURL);
    dirCreator("IPL 2020");
    getResults(resultsURL);
}
function getResults(resultsURL){
    request(resultsURL,cb);
    function cb(error,response,html){
        if(error){
            console.log(error);
        }else{
            extractResuts(html);
        }
    }
}
function extractResuts(html){
    let selectorTool=cheerio.load(html);
    let allMatches=selectorTool(".col-md-8.col-16");
    // console.log(allMatches.length);
    for(let i=0;i<allMatches.length;i++){
            let cardBtns=selectorTool(allMatches[i]).find(".btn.btn-sm.btn-outline-dark.match-cta");
            let link=selectorTool(cardBtns[2]).attr("href");
            let fullLink="https://www.espncricinfo.com"+link;
            //  console.log(fullLink);
            getMatch(fullLink);
    }
}
function getMatch(link){
    request(link,cb);
    function cb(error,response,html){
        if(error){
            console.log(error);
        }else{
            extractMatch(html);
        }
    }
}
function extractMatch(html){
    let selectorTool=cheerio.load(html);
    let teamNameEleArr=selectorTool(".Collapsible h5");
    let teamNameArr=[];
    for(let i=0;i<teamNameEleArr.length;i++){
        let teamName=selectorTool(teamNameEleArr[i]).text();
        teamName=teamName.split("INNINGS")[0];
        teamName=teamName.trim();
        dir2Creator(teamName);
        teamNameArr.push(teamName);
    }
    let batsmenTable=selectorTool(".table.batsman");
    let description=selectorTool(".event .description").text();
    let venue=description.split(",")[1];
    let date=description.split(",")[2];
    // console.log(venue);
    // console.log(date);
    for(let i=0;i<batsmenTable.length;i++){
        let batmen=selectorTool(batsmenTable[i]).find("tbody tr");
        for(let j=0;j<batmen.length;j++ ){
            let batmanCols=selectorTool(batmen[j]).find("td");
            if(batmanCols.length==8){
                let playername=selectorTool(batmanCols[0]).text().trim();
                let runs=selectorTool(batmanCols[2]).text();
                let balls=selectorTool(batmanCols[3]).text();
                let fours=selectorTool(batmanCols[5]).text();
                let sixes=selectorTool(batmanCols[6]).text();
                let sr=selectorTool(batmanCols[7]).text();

                let PlayerObj={
                    Name:playername,
                    Runs:runs,
                    Balls:balls,
                    Fours:fours,
                    Sixes:sixes,
                    SR:sr,
                    Date:date,
                    Venue:venue,
                    Opponent:i==0?teamNameArr[1]:teamNameArr[0],
                }
                let fileName=playername.split(" ").join("");
                let filePath=path.join(__dirname,"IPL 2020",teamNameArr[i],fileName+".json");
                if(fs.existsSync(filePath) == false){
                    fs.openSync(filePath, "a");
                    let arr1 = [];
                    arr1.push(PlayerObj);
                    let contentInEmptyFile = JSON.stringify(arr1,null,4);
                    fs.writeFileSync(filePath, contentInEmptyFile);

                }
                else{
                    let contentInFile = fs.readFileSync(filePath);
                    let arr = JSON.parse(contentInFile);
                    arr.push(PlayerObj);
                    // fs.appendFileSync(filePath, content);   
                    fs.writeFileSync(filePath, JSON.stringify(arr,null,4));
                }

            }
        }
    }
}