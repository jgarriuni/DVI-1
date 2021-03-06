Quintus.SwordLink = function(Q) {
    /**
     * Clase que controla la espada de Link
     */
    Q.Sprite.extend('Sword', {
        init: function(p) {
            this._super(p, {
                sheet: 'sword',
                sprite: 'swordAnim',
                gravity: 0,
                type: Q.SPRITE_SWORD,
                collisionMask: Q.SPRITE_ENEMY,
                stepDistance: 8, 
                stepDelay: 0.1,
                atack: false,
                direction: '_right',
                atackResetMax: 2 / 3,
                atackReset: 2 / 3,
                originX: 0,
                originY: 0,
                dmg: 1,
            });
            this.add('animation');
            this.on('hit', 'hit');
            this.on('restart', this, 'restart');
        },

        /**
         * Modifica el sprite de la espada en función de su posición.
         * También se encarga de las animaciones de ataque y de su
         * comportamiento durante el mismo.
         */
        step: function(dt) {
            dir = 'sword';
            if (!this.p.atack) {
                if (Q.inputs.up) {
                    this.p.direction = '_up';
                    dir += '_up';
                } else if (Q.inputs.down) {
                    this.p.direction = '_down';
                    dir += '_down';
                }
                if (Q.inputs.left) {
                    this.p.direction = '_left';
                    dir += '_left';
                } else if (Q.inputs.right) {
                    this.p.direction = '_right';
                    dir += '_right';
                }
                if (dir !== 'sword') {
                    this.play(dir);
                }
            }
            if (Q.inputs.fire && !this.p.atack) {
                this.p.atack = true;
                Q.audio.play('sword1.mp3');
                this.p.sheet = "atack_sword";
                this.p.originX = this.p.cx;
                this.p.originY = this.p.cy;
                setSwordPos(this.p);       
                this.play('sword_atack' + this.p.direction);
            }
            if (this.p.atack) {
                this.stage.collide(this);
            }
            if (Q.state.get('lives') === 0) { 
                this.destroy();
            }
        },

        /**
         * Golpea a los enemigos
         */
        hit: function(col) {
            col.obj.trigger('kicked', [col.obj.p.sprite, this.p.direction]);
        },

        /**
         * La espada vuelve a su posición inicial tras atacar
         */
        restart: function() {
            this.p.atack = false;
            this.p.sheet = 'sword';
            this.p.cx = this.p.originX;
            this.p.cy = this.p.originY;
        }
    });

    Q.animations('swordAnim', {
        'sword_atack_right': { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], rate: 1 / 18, loop: false, trigger: 'restart', next: 'sword_right_stop' },
        'sword_atack_up': { frames: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], rate: 1 / 18, loop: false, trigger: 'restart', next: 'sword_up_stop' },
        'sword_atack_left': { frames: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35], loop: false, trigger: 'restart', rate: 1 / 18, next: 'sword_left_stop' },
        'sword_atack_down': { frames: [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47], rate: 1 / 18, loop: false, trigger: 'restart', next: 'sword_down_stop' },
        'sword_right': { frames: [0, 1, 2, 3, 4, 5], rate: 1 / 16, next: 'sword_right_stop' },
        'sword_right_stop': { frames: [0] },
        'sword_up': { frames: [6, 7, 8, 9, 10, 11], rate: 1 / 16, next: 'sword_up_stop' },
        'sword_up_stop': { frames: [6] },
        'sword_left': { frames: [12, 13, 14, 15, 16, 17], rate: 1 / 16, next: 'sword_left_stop' },
        'sword_left_stop': { frames: [12] },
        'sword_down': { frames: [18, 19, 20, 21, 22, 23], rate: 1 / 16, next: 'sword_down_stop' },
        'sword_down_stop': { frames: [18] },
        'sword_up_right': { frames: [0, 1, 2, 3, 4, 5], rate: 1 / 12, next: 'sword_up_right_stop' },
        'sword_up_right_stop': { frames: [0] },
        'sword_up_left': { frames: [6, 7, 8, 9, 10, 11], rate: 1 / 12, next: 'sword_up_left_stop' },
        'sword_up_left_stop': { frames: [6] },
        'sword_down_right': { frames: [0, 1, 2, 3, 4, 5], rate: 1 / 12, next: 'sword_down_right_stop' },
        'sword_down_right_stop': { frames: [0] },
        'sword_down_left': { frames: [18, 19, 20, 21, 22, 23], rate: 1 / 12, next: 'sword_down_left_stop' },
        'sword_down_left_stop': { frames: [18] },
    });
};

/**
 * Coloca la posición de la espada
 * @param {*} p 
 */
function setSwordPos(p){   
    switch(p.direction){
        case "_right":
            p.cx += 20;
            p.cy += 8; 
            break
        case "_left":
            p.cx += 14;
            p.cy += 8;
            break;
        case "_up":
            p.cx += 16;
            p.cy += 8;
            break;
        case "_down":
            p.cx += 16;
            p.cy += 12;
            break;
    }   
}