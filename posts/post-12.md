---
title: "web 粒子效果"
date: 2025-02-08
tags: ["web"]
summary: "canvas 实现粒子效果案例~"
---

```html
<html>
    <head> </head>
    <body>
        <canvas id="canvas"></canvas>
        <script>
            class Vector2 {
                constructor(x, y) {
                    this.x = x;
                    this.y = y;
                }
                set(x, y) {
                    this.x = x;
                    this.y = y;
                    return this;
                }
                clone() {
                    return new Vector2(this.x, this.y);
                }
                add(v) {
                    this.x += v.x;
                    this.y += v.y;
                    return this;
                }
                sub(v) {
                    this.x -= v.x;
                    this.y -= v.y;
                    return this;
                }
                mult(v) {
                    this.x *= v.x;
                    this.y *= v.y;
                    return this;
                }
                magnitude() {
                    return Math.sqrt(this.x * this.x + this.y * this.y);
                }
                setFromScalarAngle(scalar, angle) {
                    this.x = Math.cos(angle) * scalar;
                    this.y = Math.sin(angle) * scalar;
                }
            }

            class Particle {
                constructor(canvas, x, y, scalar, direction, radius, color) {
                    this.canvas = canvas;
                    this.position = new Vector2(x, y);
                    this.velocity = new Vector2();
                    this.velocity.setFromScalarAngle(scalar, direction);
                    this.radius = radius;
                    this.color = color;
                    this.range = 100;
                }
                update() {
                    this.position.add(this.velocity);

                    if (this.position.x - this.range > this.canvas.width) {
                        this.position.x = this.canvas.width / 2;
                        this.position.y = this.canvas.height / 2;
                    }
                    if (this.position.x + this.range < 0) {
                        this.position.x = this.canvas.width / 2;
                        this.position.y = this.canvas.height / 2;
                    }
                    if (this.position.y - this.range > this.canvas.height) {
                        this.position.x = this.canvas.width / 2;
                        this.position.y = this.canvas.height / 2;
                    }
                    if (this.position.y + this.range < 0) {
                        this.position.x = this.canvas.width / 2;
                        this.position.y = this.canvas.height / 2;
                    }
                }
            }

            window.onload = function () {
                var canvas = document.getElementById("canvas"),
                    ctx = canvas.getContext("2d"),
                    width = (canvas.width = window.innerWidth),
                    height = (canvas.height = window.innerHeight),
                    particles = [],
                    particleNum = 100,
                    colors = [
                        "#0952BD",
                        "#A5BFF0",
                        "#118CD6",
                        "#1AAEE8",
                        "#F2E8C9",
                    ];

                window.onresize = () => {
                    width = canvas.width = window.innerWidth;
                    height = canvas.height = window.innerHeight;
                };

                function randomIntFromRange(min, max) {
                    return Math.floor(Math.random() * (max - min + 1) + min);
                }
                function randomColor(colors) {
                    return colors[Math.floor(Math.random() * colors.length)];
                }

                for (let i = 0; i < particleNum; i++) {
                    particles.push(
                        new Particle(
                            canvas,
                            canvas.width / 2,
                            canvas.height / 2,
                            Math.random() * 8 + 2,
                            Math.random() * Math.PI * 2,
                            randomIntFromRange(5, 7),
                            randomColor(colors),
                        ),
                    );
                }

                function draw() {
                    for (let i = 0; i < particleNum; i++) {
                        var p = particles[i];
                        p.update();
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(
                            p.position.x,
                            p.position.y,
                            p.radius,
                            0,
                            Math.PI * 2,
                        );
                        ctx.shadowColor = p.color;
                        ctx.shadowBlur = 5;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                        ctx.globalAlpha = "1";
                        ctx.fillStyle = p.color;
                        ctx.fill();
                        ctx.restore();
                    }
                }

                render();

                function render() {
                    ctx.fillStyle = "hsla(260,40%,5%,.2)";
                    ctx.fillRect(0, 0, width, height);
                    draw();
                    requestAnimationFrame(render);
                }
            };
        </script>
    </body>
</html>
```
