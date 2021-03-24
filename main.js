
var rows = 200;
var columns = 200;
var size = 4;


function setup() {

    createCanvas(800, 800);

    for (let x = 0; x < columns; x++) {

        Tiles.push([]);
        
        for (let y = 0; y < rows; y++) {
            Tiles[x].push(new Tile(x, y));
        }
    }
}

n =0 
function draw() {

    for (let x = 0; x < Tiles.length; x++) {
        const column = Tiles[x];

        for (let y = 0; y < column.length; y++) {
            const tile = column[y];

            tile.draw(n * 0.4, n * 0.4);
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

        this.height = perlin(x, y, 0.04, 3, 0.4, 2)

        var ocean = 0.45;
        var beach = 0.51;
        var mountain = 0.7;

        if (this.height < ocean) {
            this.colour = color(0, 0, this.height/ocean * 255);
            this.type = 'Ocean';

        }else if (this.height < beach){

            this.colour = color(255 - (this.height-ocean)/ (beach-ocean)* 100, 255 - (this.height-ocean)/ (beach-ocean)* 100, 0);
            this.type = 'Beach';

        } else if (this.height < mountain){
            this.colour = color(0, 255 - (this.height-beach)/ (mountain-beach)* 255, 0);
            this.type = 'Grass';

        } else {
            this.colour = color((this.height - mountain) / (0.85-mountain)*255)
            this.type = 'Mountain';
        }



    }

    calcRainfall(xMod, yMod) {
        this.rainfall = ((perlin(this.x - xMod, this.y - yMod, 0.06, 2, 0.4, 2) ** 1.5 )* (this.height));
    }

    draw(xMod, yMod) {

        fill(this.colour);
        noStroke();
        rect(this.x * size, this.y * size, size, size);

        this.calcRainfall(xMod, yMod);

        var rainfallThreshold = 0.2
        var cloudThreshold = 0.1

        if (this.rainfall < cloudThreshold) {
            fill(255, 255, 255, 255 * (this.rainfall - cloudThreshold / 2.5) / cloudThreshold);
        } else if (this.rainfall < rainfallThreshold){
            fill(0, 0, 255, 255 * (this.rainfall - rainfallThreshold / 2.5) / rainfallThreshold);

        };

        noStroke();
        rect(this.x * size, this.y * size, size, size);
    }
}