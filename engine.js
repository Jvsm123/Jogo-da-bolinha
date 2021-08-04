//Variáveis para o jogo:
let canvas;
let contexto;

let Altura;
let Largura;
let maxPulos = 3;
let velocidade = 6;
let estadoAtual;
let record;
let img;
let pontosNovaFase = [ 5, 10, 15, 20, 25, 30, 50, 100, 999 ];
let faseAtual = 0;

let labelNovaFase =
{
    texto: '',
    opacidade: 0.0,

    fadeIn: function( dt )
    {
        let fadeInId = setInterval( () =>   
        {
            if( labelNovaFase.opacidade < 1.0 )
            {
                labelNovaFase.opacidade += 0.01;
            }
            else
            {
                clearInterval( fadeInId );
            }
        }, 10 * dt );
    },

    fadeOut: function( dt )
    {
        let fadeOutId = setInterval( () =>
        {
            if( labelNovaFase.opacidade > 0.0 )
            {
                labelNovaFase.opacidade -= 0.01;
            }
            else
            {
                clearInterval( fadeOutId );
            }
        }, 10 * dt);
    }
}

//Como está o jogo atualmente
const estados = 
{
    jogar: 0,
    jogando: 1,
    perdeu: 2
}

//Criação do chão
let chao = 
{
    y: 550,
    x: 0,
    altura: 50,

    atualiza: function()
    {
        this.x -= velocidade;

        if( this.x <= -30 )
            this.x += 30;
    },

    desenho: function()
    {
        spriteChao.desenho( this.x, this.y );
        spriteChao.desenho( this.x + spriteChao.largura, this.y );
    }
}

//Criação do nosso player
let bloco =
{
    x: 50,
    y: 0,
    altura: spriteBoneco.altura,
    largura: spriteBoneco.largura,
    gravidade: 1,
    velocidade: 0,
    forcaDoPulo: 15,
    quantPulos: 0,
    score: 0,
    rotacao: 0,
    vidas: 5,
    colizao: false,

    ateChao: function()
    {
        this.velocidade += this.gravidade;
        this.y += this.velocidade;
        this.rotacao += Math.PI / 180 * velocidade;

        //impedindo sair do canvas:
        if( this.y > chao.y - this.altura && 
            estadoAtual !== estados.perdeu )
        {
            this.y = chao.y - this.altura;

            //permitindo 3 pulos quando cair no chão
            this.quantPulos = 0;

            //zera a velocidade da quando perder, para não vá para o chão abruptamente!
            this.velocidade = 0;
        }
    },

    pular: function()
    {
        if( this.quantPulos < maxPulos )
        {
            this.velocidade = -this.forcaDoPulo;
            this.quantPulos++;
        }
    },

    desenho: function()
    {
        //Sala o contexto atual
        contexto.save();

        //Operações de rotações
        contexto.translate( this.x + this.largura / 2, this.y + this.altura / 2 );
        contexto.rotate( this.rotacao );

        spriteBoneco.desenho( -this.largura / 2, -this.altura / 2 );

        //Retorna o contexto para 0:0
        contexto.restore();
    },

    resete: function()
    {
        this.velocidade = 0;
        this.y = 0;
        this.vidas = 5;

        if( this.score > record )
        {
            localStorage.setItem( 'record', this.score );
            record = this.score;
        }

        this.score = 0;

        velocidade = 6;
        faseAtual = 0;
        this.gravidade = 1;
    }
}

//Criação dos nossos obstaculos
let obstaculos = 
{
    _obs: [],
    _scored: false,
    _sprites: [ redObstacle, pinkObstacle, blueObstacle, greenObstacle, yellowObstacle ],
    tempoInsere: 0,

    insere: function()
    {
        this._obs.push(
        {
            x: Largura,
            y: chao.y - Math.floor( Math.random() * 101 + 20 ),
            // largura: Math.floor( Math.random() * 21 ) + 30,
            largura: 50,

            sprite: this._sprites[ Math.floor( Math.random() * this._sprites.length ) ]
        });

        this.tempoInsere = 36 + Math.floor( Math.random() * 21 );
    },

    atualiza: function()
    {
        if( this.tempoInsere === 0 ) this.insere();

        else this.tempoInsere--;

        for( let i = 0, tam = this._obs.length; i < tam; i++ )
        {
            let obs = this._obs[ i ];

            //fazemos seu deslocameto sub. x do obs pela velocidade
            obs.x -= velocidade;

            //Verifica se: nosso bloco está antes do obstáculo
            //se nosso bloco não pulou o obstáculo
            //se nosso bloco está na mesma altura do obstáculo
            if( !bloco.colizao &&
                bloco.x < obs.x + obs.largura && 
                bloco.x + bloco.largura >= obs.x && 
                bloco.y + bloco.altura >= obs.y)
            {
                bloco.colizao = true;

                setTimeout( () => bloco.colizao = false, 500);

                if( bloco.vidas >= 1 ) bloco.vidas--;

                else estadoAtual = estados.perdeu;
            }

            else if( obs.x <= 0 && !obs._scored)
            {
                bloco.score++;

                obs._scored = true;

                if( faseAtual < pontosNovaFase.length &&
                    bloco.score === pontosNovaFase[ faseAtual ]
                )
                {
                    proximaFase();
                }
            }

            //Verificando se ele ultrapassou o canvas,
            //se sim, ele será removido
            else if( obs.x <= -obs.largura )
            {
                this._obs.splice(i, 1);
                tam--;
                i--;
            }
        }
    },

    limpa: function()
    {
        this._obs = [];
    },

    desenho: function()
    {
        for( let i = 0, tam = this._obs.length; i < tam; i++ )
        {
            let obs = this._obs[ i ];

            obs.sprite.desenho( obs.x, obs.y );
        }
    }
}

//Função para proximaFase
function proximaFase()
{
    velocidade++;
    faseAtual++;
    bloco.vidas++;

    labelNovaFase.texto = `Level: ${faseAtual}`;
    labelNovaFase.fadeIn( 0.4 );

    if( faseAtual >= 4 )
    {
        bloco.gravidade += 0.2;
    }

    setTimeout( () =>
    {
        labelNovaFase.fadeOut( 0.4 );
    }, 1400);
}

//Função raiz
function main() 
{
    Altura = window.innerHeight;
    Largura = window.innerWidth;

    if( Largura >= 500 )
    {
        Largura = 600;
        Altura = 600;
    }

    canvas = document.createElement( 'canvas' );

    canvas.width = Largura;
    canvas.height = Altura;

    canvas.style.border = "1px solid #000";

    contexto = canvas.getContext('2d');

    document.body.appendChild( canvas );

    document.addEventListener( 'mousedown', iniciar );

    estadoAtual = estados.jogar;

    record = localStorage.getItem('record');

    if( record === null )
        record = 0;

    img = new Image();
    img.src = './assets/sheet.png';

    loop();
}

// Movimentos do user e inicio do jogo
function iniciar( evento ) 
{
    if( estadoAtual === estados.jogando )
        bloco.pular();

    else if( estadoAtual === estados.jogar )
        estadoAtual = estados.jogando;

    else if( estadoAtual === estados.perdeu && bloco.y >= Altura * 2 )
    {
        estadoAtual = estados.jogar;
        obstaculos.limpa();
        bloco.resete();
    }
}

//Loop central do jogo
function loop() 
{
    update();
    desenho();

    window.requestAnimationFrame( loop );
}

//Faz a atualização dos nossos frames
function update() 
{
    if( estadoAtual === estados.jogando )
        obstaculos.atualiza();

    chao.atualiza();
    bloco.ateChao();
}

//Serve para desenhar na tela tudo que foi feito até agora
function desenho() 
{
    bg.desenho(0, 0);

    //Colocando Score:
    contexto.fillStyle = 'white';
    contexto.font = '50px Arial';
    contexto.fillText( bloco.score, 30, 60 );
    contexto.fillText( bloco.vidas, 540,60 );

    //Atribuindo opacidade e indicação de níveis;
    contexto.fillStyle = `rgba(0, 0, 0, ${labelNovaFase.opacidade})`;
    contexto.fillText( labelNovaFase.texto, canvas.width / 2 - contexto.measureText( labelNovaFase.texto ).width / 2, canvas.height / 3 );

    if( estadoAtual === estados.jogando )
        obstaculos.desenho();

    //pinta o chão e o bloco
    chao.desenho(); 
    bloco.desenho();

    if( estadoAtual === estados.jogar )
        jogar.desenho( Largura / 2 - jogar.largura / 2, Altura / 2  - jogar.altura / 2 );

    if( estadoAtual === estados.perdeu )
    {
        //Alinhando elementos
        perdeu.desenho( Largura / 2 - perdeu.largura / 2, Altura / 2 - perdeu.altura / 2 - spriteRecord.altura / 2 );
        spriteRecord.desenho( Largura / 2 - spriteRecord.largura / 2, Altura / 2 + perdeu.altura / 2 - spriteRecord.altura / 2 - 23 );

        //Pontuação
        contexto.fillText( bloco.score, 375, 390 );
        contexto.fillStyle = 'white';

        //Record
        if( bloco.score > record )
        {
            novo.desenho( Largura / 2 - 180, Altura / 2 + 30 );
            contexto.fillText( bloco.score, 420, 470 );
        }
        else 
            contexto.fillText( record, 420, 470 );    
    }
}

//Inicia o jogo!
main();
