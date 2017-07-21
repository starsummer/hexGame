const BOARDSIZE=13;
const RED=1;
const EMPTY=0;
const BLUE=-1;
const RANGE=2;
let chessBoard=[];
    for(let i=0;i<=12;i++){
        chessBoard[i]=[];
        for(let j=0;j<=12;j++){
            chessBoard[i][j]=0;
        }
    }
let blueMustWin=false;
let redMustWin=false;

let LIMIT_DEPTH = 2; // 博弈树探索深度
let i_max=8,i_min=4,j_max=8,j_min=4;
let canvas = document.getElementById('hexmap');
let ctx = canvas.getContext('2d');
let hexX,
    hexY,
 	hexHeight,
    hexRadius,
    hexRectangleHeight,
    hexRectangleWidth,
    hexagonAngle = 0.523598776, // 30 degrees in radians
    sideLength = 22,//六边形宽度
    boardWidth = 11,
    boardHeight = 11,
    me;

let neighbor=new Array();
for(let i=0;i<=11;i++){ //求每块的邻居
	neighbor[i]=new Array();
	for(let j=0;j<=11;j++){
		neighbor[i][j]=new Array();

		if(inBorad(i-1,j)){
			neighbor[i][j].push([i-1,j]);
		}
		if(inBorad(i-1,j+1)){
			neighbor[i][j].push([i-1,j+1]);
		}
		if(inBorad(i,j-1)){
			neighbor[i][j].push([i,j-1]);
		}
		if(inBorad(i,j+1)){
			neighbor[i][j].push([i,j+1]);
		}
		if(inBorad(i+1,j-1)){
			neighbor[i][j].push([i+1,j-1]);
		}
		if(inBorad(i+1,j)){
			neighbor[i][j].push([i+1,j]);
		}
	}
}
//console.log(neighbor);
// console.log(neighbor[6][6]);

let bridge=[];//每个点的桥接点
for(let i=1;i<=11;i++){
    bridge[i]=[];
    for(let j=1;j<=11;j++){
        bridge[i][j]=[];
        if(inBorad(i+1,j-2)) bridge[i][j].push([i+1,j-2]);
        if(inBorad(i+2,j-1)) bridge[i][j].push([i+2,j-1]);
        if(inBorad(i+1,j+1)) bridge[i][j].push([i+1,j+1]);
        if(inBorad(i-1,j+2)) bridge[i][j].push([i-1,j+2]);
        if(inBorad(i-2,j+1)) bridge[i][j].push([i-2,j+1]);
        if(inBorad(i-1,j-1)) bridge[i][j].push([i-1,j-1]);
    }
}


function init(){
    hexHeight = Math.sin(hexagonAngle) * sideLength;
    hexRadius = Math.cos(hexagonAngle) * sideLength;
    hexRectangleHeight = sideLength + 2 * hexHeight; //六边形高度
    hexRectangleWidth = 2 * hexRadius; //六边形宽度

    if (canvas.getContext){
        ctx.fillStyle = "#000000"; //白色背景色
        ctx.strokeStyle = "#CCCCCC"; //笔触颜色为灰色
        ctx.lineWidth = 1; //线条宽度

        drawBoard(ctx, boardWidth, boardHeight);

        canvas.addEventListener("click", function(eventInfo) {
            var x,
                y,
                screenX,
                screenY;

            x = eventInfo.offsetX || eventInfo.layerX;
            y = eventInfo.offsetY || eventInfo.layerY;

            
            hexY = Math.floor(y / (hexHeight + sideLength));
            hexX = Math.floor((x - hexY * hexRadius) / hexRectangleWidth);



            if(hexX>=0 &&hexX<11 &&hexY>=0 &&hexY<11){
                if(chessBoard[hexX+1][hexY+1]!=0){
                    console.log("已有子");
                    console.log(chessBoard[hexX+1][hexY+1]);

                }else{
            	   // fillColor(ctx, hexX, hexY);
                    let hadPlace=false;//是否已走棋 
                    placeBoard(hexX+1,hexY+1,-aiColor);

                    if(aiColor===RED){
                        if(getRedValue(chessBoard)>=100000000){//必胜局面
                            console.log("红方必胜");
                            let length=getRedLength(chessBoard);//距红色胜利所需最短步数
                            console.log("红方胜利步数："+length);
                            for(let i=1;i<=11;i++){
                                for(let j=1;j<=11;j++){
                                    if(chessBoard[i][j]!==0) continue;
                                    chessBoard[i][j]=aiColor;
                                    //若据胜利步数缩短并还保持必胜局面
                                    if(getRedLength(chessBoard)<length && getRedValue(chessBoard)>=100000000){
                                        chessBoard[i][j]=0;//否则会认为此处已有子，不能下
                                        placeBoard(i,j,aiColor);
                                        hadPlace=true;
                                    }
                                    chessBoard[i][j]=0;//回溯
                                }
                            }
                        }
                    }
                    if(aiColor===BLUE){
                        if(getBlueValue(chessBoard)>=100000000){//必胜局面
                            console.log("蓝方必胜");
                            let length=getBlueLength(chessBoard);//距蓝色胜利所需最短步数
                            for(let i=1;i<=11;i++){
                                for(let j=1;j<=11;j++){
                                    if(chessBoard[i][j]!==0) continue;
                                    chessBoard[i][j]=aiColor;
                                    //若据胜利步数缩短并还保持必胜局面
                                    if(getBlueLength(chessBoard)<length && getBlueValue(chessBoard)>=100000000){
                                        chessBoard[i][j]=0;//否则会认为此处已有子，不能下
                                        placeBoard(i,j,aiColor);
                                        hadPlace=true;
                                    }
                                    chessBoard[i][j]=0;//回溯
                                }
                            }
                        }
                    }
                    if(!hadPlace){
                        let [x,y]=nextPlace(chessBoard, aiColor);
                        placeBoard(x,y,aiColor);
                    }
                    // testEstimate();
                    // console.log("i: "+i_min+" "+i_max+" j: "+j_min+" "+j_max);
                    checkChessBoard(chessBoard);
                }
			}


            // screenX = hexX * hexRectangleWidth + ((hexY % 2) * hexRadius);
            // screenY = hexY * (hexHeight + sideLength);

            // ctx.clearRect(0, 0, canvas.width, canvas.height);

            // drawBoard(ctx, boardWidth, boardHeight);

            // // Check if the mouse's coords are on the board
            // if(hexX >= 0 && hexX < boardWidth) {
            //     if(hexY >= 0 && hexY < boardHeight) {
            //         ctx.fillStyle = "#000000";
            //         drawHexagon(ctx, screenX, screenY, true);
            //     }
            // }
        });
    }
}

function initChessBoard(chessBoard){
    for(let i=0;i<=12;i++){
        for(let j=0;j<=12;j++){
            chessBoard[i][j]=0;
        }
    }
}
 function drawBoard(canvasContext, width, height) {
     var i,j;
    for(i = 0; i < width; ++i) {
         for(j = 0; j < height; ++j) {
             drawHexagon(
                 ctx, 
               //  i * hexRectangleWidth + ((j % 2) * hexRadius), 
                 i * hexRectangleWidth+j*hexRadius, 
                 j * (sideLength + hexHeight), 
                 false
             );
         }
     }
 }

function drawHexagon(canvasContext, x, y, fill) {           
     var fill = fill || false;
    canvasContext.beginPath(); //起始一条路径
     canvasContext.moveTo(x + hexRadius, y); //路径移动到指定点
     canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight);
     canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight + sideLength);
     canvasContext.lineTo(x + hexRadius, y + hexRectangleHeight);
     canvasContext.lineTo(x, y + sideLength + hexHeight);
     canvasContext.lineTo(x, y + hexHeight);
     canvasContext.closePath();//回到起点
    // if(fill){
     // 	canvasContext.fillStyle="red";
     // 	canvasContext.fill();
     // }
     // else {
     //     canvasContext.stroke();
     // }
     canvasContext.stroke();
     // if(fill) {
     //     canvasContext.();
     // } else {	
     //     canvasContext.stroke();
     // }
 }

function fillColor(canvasContext,hexX,hexY,color){
    let x=hexX * hexRectangleWidth+hexY*hexRadius;
    let y=hexY * (sideLength + hexHeight);

    canvasContext.beginPath(); //起始一条路径
    canvasContext.moveTo(x + hexRadius, y); //路径移动到指定点
    canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight);
    canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight + sideLength);
    canvasContext.lineTo(x + hexRadius, y + hexRectangleHeight);
    canvasContext.lineTo(x, y + sideLength + hexHeight);
    canvasContext.lineTo(x, y + hexHeight);
    canvasContext.closePath();//回到起点
    if(color==RED){
    	canvasContext.fillStyle="red";
    	canvasContext.fill();            	
    }else{
    	canvasContext.fillStyle="blue";
    	canvasContext.fill();         	
    }
    me=!me;
}
    

function inBorad(x,y){
	if(x>=1 && x<=11 && y>=1 && y<=11){
		return true;
	}else{
		return false;
	}
}

function possiblePlace(chessBoard) {
    let places = [];
    for (let i = i_min; i <= i_max; i++) {
        for (let j = j_min; j <= j_max; j++) {
            if (chessBoard[i][j] === EMPTY) {
                places.push([i,j]);
            }
        }
    }
    return places;
}

function trimMap(board,color){
	//左上到右下
	//删除蓝色节点，连接红色周围节点。
	let map;
// 	for(let i=0;i<;i++)
// 	if(color===RED){ 

// 	}
// }
}

// 根据第一次落子位置x, y初始搜索边界
function initBorder(x, y) {
    if (x-RANGE >= 1)
        i_min = x - RANGE;
    else 
        i_min = 1;
    if (x+RANGE <= 11)
        i_max = x + RANGE;
    else 
        i_max = 11;
    if (y-RANGE >= 1)
        j_min = y - RANGE;
    else
        j_min = 1;
    if (y+RANGE <= 11)
        j_max = y + RANGE;
    else
        j_max = 11;
}

function resetBorder(x, y) {


    if (x-RANGE >= 1)
        i_min = i_min < x-RANGE ? i_min : x-RANGE;
    else
        i_min = 1;
    if (x+RANGE <= 11)
        i_max = i_max > x+RANGE ? i_max : x+RANGE;
    else
        i_max = 11;
    if (y-RANGE >= 1)
        j_min = j_min < y-RANGE ? j_min : y-RANGE;
    else
        j_min = 1;
    if (y+RANGE <= 11)
        j_max = j_max > y+RANGE ? j_max : y+RANGE;
    else
        j_max = 11;
}

function setBorder(imin, imax, jmin, jmax) {
    i_min = imin;
    i_max = imax;
    j_min = jmin;
    j_max = jmax;
}

//估值函数 
function estimate(chessBoard,color){
    let valueBlue=getBlueValue(chessBoard);
    let valueRed=getRedValue(chessBoard);
    // console.log("蓝方价值："+valueBlue);
    // console.log("红方价值："+valueRed);
    if(color===RED){
        return valueRed-1.05*valueBlue;
    }
    else if(color===BLUE){
        return valueBlue-1.05*valueRed;
    }
}
function getBlueValue(chessBoard){
    //遍历chessBoard
    let value=0;
    let valueBlue=0;
    let set=[];
    // for(let i=0;i<=30;i++){
    //     set[i]=[];
    // }
    let k=0;
    let visited=init_visited();
    for(let i=1;i<=11;i++){
        for(let j=1;j<=11;j++){
            if(chessBoard[i][j]===BLUE && visited[i][j]===false){//深搜
               set[k]=[];
               dfs(chessBoard, visited, i, j, BLUE, set[k]);
                k++;
            }
        }
    }
    let toLeft=lengthToLeft(chessBoard, BLUE);
    let toRight=lengthToRight(chessBoard, BLUE);
    // console.log("蓝色集合");
    // console.log(set);
    for(let i=0;i<set.length;i++){
        let toLeft_min=Infinity;
        let toRight_min=Infinity;
        for(let [x,y] of set[i]){
            if(toLeft[x][y]<toLeft_min) toLeft_min=toLeft[x][y];
            if(toRight[x][y]<toRight_min) toRight_min=toRight[x][y];
        }
         // console.log("toLeft_min="+ toLeft_min+" toRight_min="+toRight_min);
         
        switch(toLeft_min+toRight_min){
            case 0: value=100000000; break;
            case 1: value=1000000; break;
            case 2: value=100000; break;
            case 3: value=10000; break;
            case 4: value=5000; break;
            case 5: value=1000; break;
            case 6: value=500; break;
            case 7: value=100; break;
            case 8: value=10; break;
            case 9: value=5; break;
            default: value=1;
        }
        valueBlue+=value;
    }
    return valueBlue;
}
function getRedValue(chessBoard){
    //遍历chessBoard
    let value=0;
    let valueRed=0;
    let set=[];
    // for(let i=0;i<=30;i++){
    //     set[i]=[];
    // }
    let k=0;
    let visited=init_visited();
    for(let i=1;i<=11;i++){
        for(let j=1;j<=11;j++){
            if(chessBoard[i][j]===RED && visited[i][j]===false){//深搜
               
               set[k]=[];
               dfs(chessBoard, visited, i, j, RED, set[k]);
                k++;
            }
        }
    }
    let toUp=lengthToUp(chessBoard, RED);
    let toDown=lengthToDown(chessBoard, RED);
    // console.log("红色集合");
    // console.log(set);
    for(let i=0;i<set.length;i++){
        let toUp_min=Infinity;
        let toDown_min=Infinity;
        for(let [x,y] of set[i]){
            if(toUp[x][y]<toUp_min) toUp_min=toUp[x][y];
            if(toDown[x][y]<toDown_min) toDown_min=toDown[x][y];
        }
         // console.log("toUp_min="+ toUp_min+" toDown_min="+toDown_min);
         
        switch(toUp_min+toDown_min){
            case 0: value=100000000; break;
            case 1: value=1000000; break;
            case 2: value=100000; break;
            case 3: value=10000; break;
            case 4: value=5000; break;
            case 5: value=1000; break;
            case 6: value=500; break;
            case 7: value=100; break;
            case 8: value=10; break;
            case 9: value=5; break;
            default: value=1;
        }
        valueRed+=value;
    }
    return valueRed;
}
function testEstimate(){
	// initChessBoard(chessBoard);
    // placeBoard(6,6,RED);

    // let value=estimate(chessBoard,BLUE);
	 console.log("估值"+estimate(chessBoard, RED));
}

function dfs(chessBoard,visited,hexx,hexy,color,set){
    if(!inBorad(hexx,hexy)) return;//棋盘外的点
    if(chessBoard[hexx][hexy]!==color) return;
    if(visited[hexx][hexy]) return;
    // console.log(hexx+"  "+hexy);
    visited[hexx][hexy]=true;
    set.push( [hexx,hexy] );
    for(let [x,y] of neighbor[hexx][hexy]){
      //  console.log([x,y]);
        if(chessBoard[x][y]===color && visited[x][y]===false){
            dfs(chessBoard,visited,x,y,color,set);
        }
    }
   // toBesee(visited);  
    // 形成桥的点
    if(chessBoard[hexx][hexy-1]==0 && chessBoard[hexx+1][hexy-1]==0 ) dfs(chessBoard,visited,hexx+1,hexy-2,color,set);//上
    if(chessBoard[hexx+1][hexy-1]==0 && chessBoard[hexx+1][hexy]==0) dfs(chessBoard,visited,hexx+2,hexy-1,color,set);//右上
    if(chessBoard[hexx+1][hexy]==0 && chessBoard[hexx][hexy+1]==0) dfs(chessBoard,visited,hexx+1,hexy+1,color,set);//右下
    if(chessBoard[hexx-1][hexy+1]==0 && chessBoard[hexx][hexy+1]==0) dfs(chessBoard,visited,hexx-1,hexy+2,color,set);//下
    if(chessBoard[hexx-1][hexy]==0 && chessBoard[hexx-1][hexy+1]==0) dfs(chessBoard,visited,hexx-2,hexy+1,color,set);//左下
    if(chessBoard[hexx-1][hexy]==0 && chessBoard[hexx][hexy-1]==0) dfs(chessBoard,visited,hexx-1,hexy-1,color,set);//左上
}

function lengthToLeft(chessBoard,color){//连接左方最短步数
    let length=new Array();
    for(let i=0;i<=12;i++){ //初始为无穷大
        length[i]=[];//二维数组
        for(let j=0;j<=12;j++){
            length[i][j]=Infinity;
        }
    }    
    for(let i=1;i<=11;i++){//第一列初始化
        if(chessBoard[1][i]===BLUE){
            length[1][i]=0;
        }else if(chessBoard[1][i]===RED){
            length[1][i]=Infinity;
        }else if(chessBoard[1][i]===0){
            length[1][i]=1;

        }
    }

    let flag=true;
    while(flag){
        flag=false;
        for(let i=2;i<=11;i++){
            for(let j=1;j<=11;j++){
                let min=Infinity;
                for( let [x,y] of neighbor[i][j] ){ //遍历邻居求最小值
                    if(length[x][y]<min){
                        min=length[x][y];
                    }
                }

                if(chessBoard[i][j]===BLUE){   
                    if(min<length[i][j]){
                        length[i][j]=min;
                        flag=true;
                    }
                }

                else if(chessBoard[i][j]===RED){
                    length[i][j]=Infinity;
                }

                else if(chessBoard[i][j]===0){
                    if(min+1<length[i][j]){
                        length[i][j]=min+1;
                        flag=true;
                    }
                }
            }
        }        
    }
    // console.log(length[1]);  
    return length;  
}
function lengthToRight(chessBoard,color){//连接右边最短步数
    let length=new Array();
    for(let i=0;i<=12;i++){ //初始为无穷大
        length[i]=[];//二维数组
        for(let j=0;j<=12;j++){
            length[i][j]=Infinity;
        }
    }    
    for(let i=1;i<=11;i++){//初始化最后一列
        if(chessBoard[11][i]===BLUE){
            length[11][i]=0;
        }else if(chessBoard[11][i]===RED){
            length[11][i]=Infinity;
        }else if(chessBoard[11][i]===0){
            length[11][i]=1;
        }
    }
    let flag=true;
    while(flag){
        flag=false;
        for(let i=10;i>=1;i--){
            for(let j=1;j<=11;j++){
                let min=Infinity;
                for( let [x,y] of neighbor[i][j] ){ //遍历邻居求最小值
                    if(min>length[x][y]){
                        min=length[x][y];
                    }
                }

                if(chessBoard[i][j]===BLUE){
                    if(min<length[i][j]){
                        length[i][j]=min;
                        flag=true;
                    }
                }

                else if(chessBoard[i][j]===RED){
                    length[i][j]=Infinity;
                }

                else if(chessBoard[i][j]===0){
                    if(min+1<length[i][j]){
                        length[i][j]=min+1;
                        flag=true;
                    }
                }
            }
        }        
    }
        // console.log(length[11]);  

    return length;    
}
function lengthToUp(chessBoard,color){//连接上方最短步数
    let length=new Array();
    for(let i=0;i<=12;i++){ //初始为无穷大
        length[i]=[];//二维数组
        for(let j=0;j<=12;j++){
            length[i][j]=Infinity;
        }
    }    
    for(let i=1;i<=11;i++){//第一行初始化
        if(chessBoard[i][1]===RED){
            length[i][1]=0;
        }else if(chessBoard[i][1]===BLUE){
            length[i][1]=Infinity;
        }else if(chessBoard[1][i]===0){
            length[i][1]=1;

        }
    }

    let flag=true;
    while(flag){
        flag=false;
        for(let j=1;j<=11;j++){//遍历顺序 从上到下
            for(let i=1;i<=11;i++){
                let min=Infinity;
                for( let [x,y] of neighbor[i][j] ){ //遍历邻居求最小值
                    if(length[x][y]<min){
                        min=length[x][y];
                    }
                }

                if(chessBoard[i][j]===RED){   
                    if(min<length[i][j]){
                        length[i][j]=min;
                        flag=true;
                    }
                }

                else if(chessBoard[i][j]===BLUE){
                    length[i][j]=Infinity;
                }

                else if(chessBoard[i][j]===0){
                    if(min+1<length[i][j]){
                        length[i][j]=min+1;
                        flag=true;
                    }
                }
            }
        }        
    }
    // console.log(length[1]);  
    return length;  
}
function lengthToDown(chessBoard,color){//连接下方最短步数
    let length=new Array();
    for(let i=0;i<=12;i++){ //初始为无穷大
        length[i]=[];//二维数组
        for(let j=0;j<=12;j++){
            length[i][j]=Infinity;
        }
    }    
    for(let i=1;i<=11;i++){//最后一行一行初始化
        if(chessBoard[i][11]===RED){
            length[i][11]=0;
        }else if(chessBoard[i][1]===BLUE){
            length[i][11]=Infinity;
        }else if(chessBoard[1][i]===0){
            length[i][11]=1;

        }
    }

    let flag=true;
    while(flag){
        flag=false;
        for(let j=11;j>0;j--){//遍历顺序 从上到下
            for(let i=1;i<=11;i++){
                let min=Infinity;
                for( let [x,y] of neighbor[i][j] ){ //遍历邻居求最小值
                    if(length[x][y]<min){
                        min=length[x][y];
                    }
                }

                if(chessBoard[i][j]===RED){   
                    if(min<length[i][j]){
                        length[i][j]=min;
                        flag=true;
                    }
                }

                else if(chessBoard[i][j]===BLUE){
                    length[i][j]=Infinity;
                }

                else if(chessBoard[i][j]===0){
                    if(min+1<length[i][j]){
                        length[i][j]=min+1;
                        flag=true;
                    }
                }
            }
        }        
    }
    // console.log(length[1]);  
    return length;  
}

function toBesee(arr){
    for(let i=1;i<=11;i++){
        for(let j=1;j<=11;j++){
            if(arr[i][j]==1){
                placeBoard(i,j,BLUE);
            }
        }
    }
}

function getWeight(chessBoard, alpha, beta, color, searchDepth, place, isMax) {
    // 得到落子位置
    let [i, j] = place;
    // 落子
    if (isMax) {
        chessBoard[i][j] = color;
    } else {
        chessBoard[i][j] = -color;
    }
    // 保存旧边界
    let [old_i_min, old_i_max, old_j_min, old_j_max] = [i_min, i_max, j_min, j_max];
    // 更新边界
    resetBorder(i, j);

    let weight = alphaBeta(chessBoard, alpha, beta, color, searchDepth+1);

    // 恢复棋盘上一个状态
    chessBoard[i][j] = EMPTY;
    // 恢复边界
    setBorder(old_i_min, old_i_max, old_j_min, old_j_max);
    // 返回值
    return weight;
}

function alphaBeta(chessBoard,alpha,beta,color,searchDepth){
    // if(isMax){
    //     console.log("极大层");
    // }else{
    //     console.log("极小层");
    // }
    // console.log("alpha="+alpha+"  beta="+beta);
    let isMin = searchDepth % 2 === 1 ? true : false;
    let isTop = searchDepth === 0 ? true : false;//
    let isMax = !isMin;

    if(searchDepth >= LIMIT_DEPTH){
        return estimate(chessBoard,color); 
    }
//  let place=possiblePlace(chessBoard);//可走步法
    if(isTop){
        let maxPlace;
        for(let place of possiblePlace(chessBoard)){
            // chessBoard[x,y]=color; //放置棋子；
            let MAX=getWeight(chessBoard,alpha,beta,color,searchDepth,place,isMax);
            //chessBoard //恢复
            // chessBoard[x,y]=0;
            if(MAX>alpha){
                alpha=MAX;
                maxPlace=place;
            }
            if(alpha>=beta){
                break;
            }
        }
        console.log("最佳位置："+maxPlace);
        return maxPlace;
    }
    else if(isMax){
        for(let place of possiblePlace(chessBoard)){
            // chessBoard[x][y]=color; //放置棋子；
            let MAX=getWeight(chessBoard,alpha,beta,color,searchDepth,place,isMax);
            //chessBoard //恢复
            // chessBoard[x][y]=color;
            if(MAX>alpha){
                alpha=MAX;
            }
            if(alpha>=beta){
                break;
            }
        }
        return alpha;

    }
    else if(!isMax){
        for(let place of possiblePlace(chessBoard)){
            // chessBoard[x][y]=color; //放置棋子
            let MIN=getWeight(chessBoard,alpha,beta,color,searchDepth,place,isMax);
            // chessBoard[x][y]=0; //恢复
            if(MIN<beta){
                beta=MIN;//更新beta值
            }
            if(beta<=alpha){//MIN层节点小于父节点alpha值，剪枝
                break;
            }
        }
        return beta;
    }
}

function nextPlace(chessBoard, color) {
    let alpha = -Infinity;
    let beta = +Infinity;
    return alphaBeta(chessBoard, alpha, beta, color, 0);
}

//
function init_visited(){
    let visited=[];
    for(let i=0;i<=12;i++){
        visited[i]=[];
        for(let j=0;j<=12;j++){
            visited[i][j]=false;
        }
    }
    return visited;
}
//走x,y并绘制棋局
function placeBoard(x,y,color){
    console.log(x+" "+y);
    console.log(chessBoard[x][y]);
    if(chessBoard[x][y]!==0){
        return;
    }
    chessBoard[x][y]=color;
    resetBorder(x,y);
    fillColor(ctx,x-1,y-1,color);
}

//距蓝方胜利最短步数
function getBlueLength(chessBoard){
    //遍历chessBoard
    let value=0;
    let valueBlue=0;
    let set=[];
    // for(let i=0;i<=30;i++){
    //     set[i]=[];
    // }
    let k=0;
    let visited=init_visited();
    for(let i=1;i<=11;i++){
        for(let j=1;j<=11;j++){
            if(chessBoard[i][j]===BLUE && visited[i][j]===false){//深搜
               set[k]=[];
               dfs(chessBoard, visited, i, j, BLUE, set[k]);
                k++;
            }
        }
    }
    let minLength=Infinity;
    let toLeft=lengthToLeft(chessBoard, BLUE);
    let toRight=lengthToRight(chessBoard, BLUE);
    // console.log("蓝色集合");
    // console.log(set);
    // for(let i=0;i<set.length;i++){
    //     let toLeft_min=Infinity;
    //     let toRight_min=Infinity;
    //     for(let [x,y] of set[i]){
    //         if(toLeft[x][y]<toLeft_min) toLeft_min=toLeft[x][y];
    //         if(toRight[x][y]<toRight_min) toRight_min=toRight[x][y];
    //     }
    //      // console.log("toLeft_min="+ toLeft_min+" toRight_min="+toRight_min);
    //     if(toLeft_min+toRight_min<minLength){
    //         minLength=toLeft_min+toRight_min;
    //     }
    // }
    for(let i=1;i<=11;i++){
        for(let j=1;j<=11;j++){
            if(chessBoard[i][j]===BLUE){
                if(toLeft[i][j]+toRight[i][j]<minLength){
                    minLength=toLeft[i][j]+toRight[i][j];
                }                
            }
        }
    }
    return minLength;    
}

function getRedLength(chessBoard){
        //遍历chessBoard
    let value=0;
    let valueRed=0;
    let set=[];

    let k=0;
    let visited=init_visited();
    for(let i=1;i<=11;i++){
        for(let j=1;j<=11;j++){
            if(chessBoard[i][j]===RED && visited[i][j]===false){//深搜
               
               set[k]=[];
               dfs(chessBoard, visited, i, j, RED, set[k]);
                k++;
            }
        }
    }
    let minLength=Infinity;
    let toUp=lengthToUp(chessBoard, RED);
    let toDown=lengthToDown(chessBoard, RED);
    // for(let i=0;i<set.length;i++){
    //     let toUp_min=Infinity;
    //     let toDown_min=Infinity;
    //     for(let [x,y] of set[i]){
    //         if(toUp[x][y]<toUp_min) toUp_min=toUp[x][y];
    //         if(toDown[x][y]<toDown_min) toDown_min=toDown[x][y];
    //     }
    //      // console.log("toUp_min="+ toUp_min+" toDown_min="+toDown_min);
    //     console.log("set:");
    //     if(toUp_min+toDown_min<minLength){
    //         minLength=toUp_min+toDown_min;
    //         console.log("toUp_min:"+toUp_min+" toDown_min:"+toDown_min);
    //     }
    // }
    for(let i=1;i<=11;i++){
        for(let j=1;j<=11;j++){
            if(chessBoard[i][j]==RED){
                if(toUp[i][j]+toDown[i][j]<minLength){
                    minLength=toUp[i][j]+toDown[i][j];
                }                
            }
        }
    }
    return minLength;
}
function bluehasWin(chessBoard){
    let visited=init_visited();
    for(let i=1;i<=11;i++){
        dfsWin(chessBoard,1,i,visited,BLUE);
    }
}

function checkChessBoard(chessBoard){
    // 检查蓝方是否已经胜利
    if(getBlueLength(chessBoard)<=0){
        alert("蓝方胜利");
    }
    // 检查红方是否已经胜利
    if(getRedLength(chessBoard)<=0){
        alert("红方胜利");
    }    

    // if(getBlueValue(chessBoard)>=100000000){//蓝方必胜
    //     findBluePoint(chessBoard);
    // }
    // if(getRedValue(chessBoard)>=100000000){//红方必胜
    //     findRedPoint(chessBoard);
    // }
}

let aiColor=BLUE;
window.onload=function(){
	init();
    initChessBoard(chessBoard);
    // console.log(chessBoard);
    document.getElementById("firster").addEventListener("click", function(eventInfo){
        placeBoard(6,6,RED);
        initBorder(6,6);
        aiColor=RED;
        //
    })
    document.getElementById("later").addEventListener("click", function(eventInfo){
        aiColor=BLUE;
        //
    })
    // testEstimate();
}