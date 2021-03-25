
var rows = 200;
var columns = 200;
var size = 4;

var ocean = 0.45;
var beach = 0.51;
var mountain = 0.7;

var weatherScale = 0.005;

var baseCloudThreshold = 0.45;
var cloudThreshold = baseCloudThreshold;
var cloudTransparecy = 0.3;

var flowRate = 0.3;
var evaporationRate = 0.05;

var riverThreshold = 1;
var lakeThreshold = 4;



function setup() {

    createCanvas(columns * size, rows * size);

    for (let x = 0; x < columns; x++) {

        Tiles.push([]);
        
        for (let y = 0; y < rows; y++) {
            Tiles[x].push(new Tile(x, y));
        }
    }

    for (let x = 0; x < Tiles.length; x++) {
        const column = Tiles[x];

        for (let y = 0; y < column.length; y++) {
            const tile = column[y];

            tile.calcNeighbours();
        }
    }
}

n =0 
function draw() {

    var weather = (noise(n * weatherScale)) + 0.5;
    console.log(weather);

    cloudThreshold = weather * baseCloudThreshold;

    for (let x = 0; x < Tiles.length; x++) {
        const column = Tiles[x];

        for (let y = 0; y < column.length; y++) {
            const tile = column[y];

            tile.draw(n * 0.4, n * 0.4);
        }
    }


    for (let x = 0; x < Tiles.length; x++) {
        const column = Tiles[x];

        for (let y = 0; y < column.length; y++) {
            const tile = column[y];

            tile.drawCloud();
        }
    }
    n ++
}

function perlin(x, y, scale, octaves, persistence, lacunarity) {

    var value = 0;
    var divisor = 0;

    for (let index = 0; index < octaves; index++) {
        
        value += noise(x * scale * (lacunarity ** index), y * scale * (lacunarity ** index)) * (persistence ** index);
        divisor += (persistence ** index);

    }

    return value / divisor
}

Tiles = []
class Tile {

    constructor(x, y) {
        
        this.x = x;
        this.y = y;

        this.height = perlin(x, y, 0.04, 3, 0.4, 2);
        this.water = 0;

        if (this.height < ocean) {
            this.colour = color(0, 0, this.height/ocean * 255);
            this.type = 'Ocean';

        }else if (this.height < beach){

            this.colour = color(255 - (this.height-ocean)/ (beach-ocean)* 100, 255 - (this.height-ocean)/ (beach-ocean)* 100, 0);
            this.type = 'Beach';

        } else if (this.height < mountain){
            this.colour = [0, 255 - (this.height-beach)/ (mountain-beach)* 255, 0];
            this.type = 'Grass';

        } else {
            this.colour = color((this.height - mountain) / (0.85-mountain)*255)
            this.type = 'Mountain';
        }

    }

    calcRainfall(xMod, yMod) {

        this.rainfall = ((perlin(this.x - xMod, this.y - yMod, 0.06, 1, 0.4, 2)) + (this.height)) / 2;

        if (this.rainfall > cloudThreshold) {
            var multiplier  = (this.rainfall - cloudThreshold) / (1 - cloudThreshold);
            this.cloudColour = [(1 - multiplier) * 255, (1 - multiplier) * 255, 255, Math.min(255, 255* multiplier * 5)];

            if (this.type != 'Ocean') {
                this.water += multiplier;
            }

        } else {
            this.cloudColour = [0, 0, 0, 0];
        }
    }

    calcNeighbours(){
        
        this.neighbours = [];

        for (let x = -1 ; x < 2; x++) {
            
            for (let y = - 1; y < 2; y++) {
            
                if((x != 0) || (y != 0)) {

                    if ((this.x + x < columns && this.x + x >= 0) && (this.y + y < rows && this.y + y >= 0)) {
                        var tile = Tiles[this.x + x][this.y + y];
                        this.neighbours.push(tile);
                    }
                }
            }
        }
    }

    calcFlowTo() {

        var multiplier = 0.0002;

        this.flowTo = undefined;

        if (this.type != 'Ocean') {
            var height = this.height + (this.water * multiplier);

            for (let index = 0; index < this.neighbours.length; index++) {
                const tile = this.neighbours[index];

                if(tile.height + (tile.water * multiplier) < height) {

                    this.flowTo = tile;
                    height = tile.height + (tile.water * multiplier);
                }
            }
        }
    }

    calcFlow() {

        if (this.type != 'Ocean') {

            this.water *= (1 - evaporationRate);

            if (this.flowTo != undefined) {

                if (this.flowTo.type != 'Ocean') {

                    this.flow = this.water * flowRate;
                    this.flowTo.water += this.flow

                }

                this.water *= (1 - flowRate);
            }

        }
    }

    draw(xMod, yMod) {

        this.calcFlowTo();
        this.calcFlow();
        this.calcRainfall(xMod, yMod);

        if (this.type != 'Grass') {
            fill(this.colour);
        } else {
            fill(255 * (1 - (this.height-beach)/ (mountain-beach))* (Math.max(1 - this.water * 5, 0)), this.colour[1],this.colour[2]);
        }
        noStroke();
        rect(this.x * size, this.y * size, size, size);


        if (this.type != 'Ocean') {

            if (this.flowTo != undefined) {
                if (this.flow > riverThreshold && (this.water <= lakeThreshold || this.flowTo.water <= lakeThreshold)) {
                    strokeWeight(Math.min(this.flow / (riverThreshold), size));
                    stroke(0, 255 * this.height, 255, 255 * Math.min(1, this.flow / (riverThreshold)));
                    line((this.x + 0.5) * size, (this.y + 0.5) * size, (this.flowTo.x + 0.5) * size, (this.flowTo.y + 0.5) * size)

                } 
            }

            if (this.water > lakeThreshold) {
                
                // stroke(0, 0, 255, 255 * Math.min(1, this.water / lakeThreshold));
                // strokeWeight(Math.min(this.water / (lakeThreshold), size));
                // point((this.x + 0.5) * size, (this.y + 0.5) * size);
                
                fill(0, 255 * this.height, 255, 255 * Math.min(1, this.water / lakeThreshold));
                noStroke();
                rect(this.x * size, this.y * size, size, size);
            }
        }

    }

    drawCloud() {

        fill(this.cloudColour[0], this.cloudColour[1],this.cloudColour[2],this.cloudColour[3] * (1- cloudTransparecy));
        noStroke();
        rect(this.x * size, this.y * size, size, size);
    }
}