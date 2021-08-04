class Sprite
{
    constructor( x, y, largura, altura )
    {
        this.x = x;
        this.y = y;
        this.largura = largura;
        this.altura = altura;
    }

    desenho( xCanvas, yCanvas )
    {
        contexto.drawImage( img, this.x, this.y, this.largura, this.altura, xCanvas, yCanvas, this.largura, this.altura );
    }
}

let bg = new Sprite(0, 0, 600, 600);
let spriteBoneco = new Sprite( 618, 16, 87, 87 );

let perdeu = new Sprite(603, 478, 397, 358);
let jogar = new Sprite(603, 127, 397, 347);
let novo = new Sprite(68, 721, 287, 93);
let spriteRecord = new Sprite(28, 879, 441, 95);
let spriteChao = new Sprite(0, 604, 600, 54);

let redObstacle = new Sprite(662, 867, 50, 120);
let pinkObstacle = new Sprite(719, 867, 50, 120);
let blueObstacle = new Sprite(779, 867, 50, 120);
let greenObstacle = new Sprite(839, 867, 50, 120);
let yellowObstacle = new Sprite(898, 867, 50, 120);
