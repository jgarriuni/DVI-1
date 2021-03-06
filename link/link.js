Quintus.Link = function(Q) {

    /**
     * Clase que representa a Link, controlado por el jugador
     */
    Q.Sprite.extend('Link', {
        init: function(p) {
            this._super(p, {
                sheet: 'link',
                sprite: 'linkAnim',
                gravity: 0,
                stepDistance: 16, 
                stepDelay: 0.2,
                points: [
                    [-8, -3],
                    [8, -3],
                    [8, 12],
                    [-8, 12]
                ],
                type: Q.SPRITE_PLAYER,
                collisionMask: Q.SPRITE_FIRE | Q.SPRITE_WALL | Q.SPRITE_DEFAULT | Q.SPRITE_ENEMY | Q.SPRITE_CHEST | Q.SPRITE_COLLIDER | Q.SPRITE_RUPEE | Q.SPRITE_NPC,
                invulnerabilityTime: 1,
                invulnerability: false,
                talking: false,
                talkingNext: 0,
                talkingNPC: 0,
            });

            this.add('stepControls, animation');

            this.on('hit', 'hit');
            this.on('dead', 'dead');
            this.on('restart', 'restart');
        },

        /**
         * Aparece la escena de final cuando muere Link
         */
        restart: function() {
            Q.audio.stop();
            Q.clearStages();
            Q.stageScene('endGame');
        },

        /**
         * Describe el comportamiento de Link
         * cuando colisiona con un objeto.
         */
        hit: function(col) {
            switch (col.obj.p.type) {
                /**
                 * Al chocar contra un enemigo o contra una bola de fuego,
                 * se vuelve invulnerable durante un tiempo y pierde una vida.
                 */
                case Q.SPRITE_FIRE:
                    col.obj.destroy();
                case Q.SPRITE_ENEMY:
                    if (!this.p.invulnerability) {
                        this.p.invulnerabilityTime = 1;
                        this.p.invulnerability = true;
                        Q.state.dec("lives", 1);
                        Q.audio.play("hero_hurt.mp3");
                        if (Q.state.get('lives') === 0) {
                            this.trigger('dead');
                        }
                    }
                    break;
                /** 
                * Activa el sensor de los objetos.
                */
                case Q.SPRITE_CHEST:
                case Q.SPRITE_COLLIDER:
                case Q.SPRITE_RUPEE:
                    col.obj.sensor();
                    break;
                /**
                 * Comienza el diálogo con los personajes y
                 * deja de moverse.
                 */
                case Q.SPRITE_NPC:
                    if(!this.p.talking){
                        this.p.talking = true;
                        this.p.stepDistance = 0;
                        this.p.talkingNPC = col.obj;
                        this.children[0].destroy();
                        col.obj.trigger('sensor');
                    }
                    break;
                /**
                 * La pared impide que Link pase.
                 */
                case Q.SPRITE_WALL:
                    break;  
            }
        },

        /**
         * Activa la animación de muerte de Link.
         */
        dead: function() {
            this.p.stepDistance = 0;
            Q.audio.stop();
            Q.audio.play("hero_dying.mp3");
            this.p.sheet = 'dying';
            this.play('dying', 1);
        },

        /**
         * Modifica los sprites de Link en función de su movimiento,
         * y cambia su comportamiento durante la conversación con NPCs.
         */
        step: function(dt) {
            if(this.p.talking){
                this.p.talkingNext += dt;
                if(Q.inputs.confirm && this.p.talkingNext > 0.3){
                    this.p.talkingNext = 0;
                    if(this.p.talkingNPC.p.continue){
                        this.p.talkingNPC.trigger('talk');
                    }else{
                        this.p.stepDistance = 16;
                        this.stage.insert(new Q.Sword(), this);
                        this.p.talkingNPC.trigger('endTalk', this);
                    }
                }
            }else{
                this.p.reloadSword -= dt;
                var dir = 'walking';

                if (Q.inputs.up) {
                    dir += '_up';
                } else if (Q.inputs.down) {
                    dir += '_down';
                }
                if (Q.inputs.left) {
                    dir += '_left';
                } else if (Q.inputs.right) {
                    dir += '_right';
                }
                if (dir !== 'walking') {
                    this.play(dir);
                }
                if (this.p.invulnerability) {
                    this.p.invulnerabilityTime -= dt;
                    if (this.p.invulnerabilityTime < 0) {
                        this.p.invulnerability = false;
                    }
                }
                this.stage.collide(this);
            }
        }
    });

    Q.animations('linkAnim', {
        'walking_right': { frames: [0, 1, 2, 3, 4, 5, 6, 7], rate: 1 / 16, next: 'stand_right' },
        'stand_right': { frames: [0] },

        'walking_up': { frames: [11, 12, 13, 14, 15, 16, 17, 18], rate: 1 / 16, next: 'stand_up' },
        'walking_up_right': { frames: [8, 9, 10], rate: 1 / 12, next: 'stand_up_right' },
        'walking_up_left': { frames: [19, 20, 21], rate: 1 / 12, next: 'stand_up_left' },
        'stand_up': { frames: [11] },
        'stand_up_right': { frames: [8] },
        'stand_up_left': { frames: [19] },

        'walking_down': { frames: [33, 34, 35, 36, 37, 38, 39, 40], rate: 1 / 16, next: 'stand_down' },
        'walking_down_right': { frames: [41, 42, 43], rate: 1 / 12, next: 'stand_down_right' },
        'walking_down_left': { frames: [30, 31, 32], rate: 1 / 12, next: 'stand_down_left' },
        'stand_down': { frames: [33] },
        'stand_down_right': { frames: [41] },
        'stand_down_left': { frames: [30] },

        'walking_left': { frames: [22, 23, 24, 25, 26, 27, 28, 29], rate: 1 / 16, next: 'stand_left' },
        'stand_left': { frames: [22] },

        'dying': { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], rate: 1 / 8, loop: false, trigger: "restart" }
    });
};
