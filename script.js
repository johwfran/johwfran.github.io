/* script.js - Johwfran Thobias - Versão Órion Centralizado e Sutil */

document.addEventListener('DOMContentLoaded', () => {

    /* ==============================================
       1. ANIMAÇÃO DE FUNDO: REDE + ÓRION
       ============================================== */
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    
    // Ajusta o tamanho do canvas para a tela
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray = [];
    let constellationStars = [];
    
    // Otimização mobile: menos partículas para não travar
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 30 : 80;

    // DEFINIÇÃO DE ÓRION (Posições X centralizadas em torno de 0.5)
    const configurations = {
        name: "Órion Completo",
        // Cores base naturais das estrelas (tênues)
        starColors: {
            red: { core: '#ffffff', halo: 'rgba(255, 120, 80, 0.15)' }, // Betelgeuse sutil
            blue: { core: '#ffffff', halo: 'rgba(170, 210, 255, 0.2)' }, // Rigel sutil
            white: { core: '#ffffff', halo: 'rgba(240, 240, 240, 0.15)' } // Três Marias sutis
        },
        // Coordenadas remapeadas para o CENTRO da tela
        stars: [
            { x: 0.43, y: 0.25, type: 'red' },   // 0: Betelgeuse (Ombro esquerdo)
            { x: 0.58, y: 0.20, type: 'white' }, // 1: Bellatrix (Ombro direito)
            { x: 0.55, y: 0.48, type: 'white' }, // 2: Mintaka (Cinturão - direita)
            { x: 0.50, y: 0.50, type: 'white' }, // 3: Alnilam (Cinturão - centro)
            { x: 0.45, y: 0.52, type: 'white' }, // 4: Alnitak (Cinturão - esquerda)
            { x: 0.38, y: 0.75, type: 'white' }, // 5: Saiph (Pé esquerdo)
            { x: 0.61, y: 0.70, type: 'blue' }   // 6: Rigel (Pé direito)
        ],
        // Linhas de guia (Guerras imaginárias - tênues)
        links: [
            [0, 4], // Betelgeuse a Alnitak
            [1, 2], // Bellatrix a Mintaka
            [2, 3], // Cinturão
            [3, 4], // Cinturão
            [4, 5], // Alnitak a Saiph
            [2, 6], // Mintaka a Rigel
            [0, 1], // Ombros
            [5, 6]  // Pés
        ]
    };

    class Particle {
        constructor(x, y, dx, dy, size, colorConfig, isMainStar) {
            this.x = x;
            this.y = y;
            this.dx = dx;
            this.dy = dy;
            this.size = size;
            this.baseSize = size;
            this.colorConfig = colorConfig; // { core: str, halo: str }
            this.isMainStar = isMainStar;
            // Para cintilação (twinkle)
            this.twinkleFactor = Math.random() * 100;
            this.twinkleSpeed = 0.02 + Math.random() * 0.03;
        }

        draw() {
            // Calcula opacidade para cintilação
            this.twinkleFactor += this.twinkleSpeed;
            let twinkleOp = 0.5 + Math.sin(this.twinkleFactor) * 0.5;

            // Define opacidade global tênue (SUTILIDADE)
            ctx.globalAlpha = this.isMainStar ? (twinkleOp * 0.8) : (twinkleOp * 0.4);

            if (this.isMainStar) {
                // Estrelas principais: Halo + Núcleo intenso
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2, false);
                ctx.fillStyle = this.colorConfig.halo; // Halo sutil
                ctx.fill();

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.colorConfig.core; // Núcleo branco
                ctx.fill();
            } else {
                // Partículas da rede dinámica
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = '#f0f0f0'; // Cor neutra tênue
                ctx.fill();
            }

            // Reseta opacidade global
            ctx.globalAlpha = 1;
        }

        update() {
            if (!this.isMainStar) {
                // Apenas partículas dinâmica flutuam
                if (this.x > canvas.width || this.x < 0) this.dx = -this.dx;
                if (this.y > canvas.height || this.y < 0) this.dy = -this.dy;
                this.x += this.dx;
                this.y += this.dy;
            }
            this.draw();
        }
    }

    function initSites() {
        particlesArray = [];
        constellationStars = [];

        // 1. Instanciar Órion (Centralizado e Estático)
        configurations.stars.forEach(star => {
            let x = star.x * canvas.width;
            let y = star.y * canvas.height;
            let colors = configurations.starColors[star.type];
            let size = (Math.random() * 1.5) + 2.0; // Tamanho visível mas não gigante
            
            // Estático (dx, dy = 0), isMainStar = true
            let p = new Particle(x, y, 0, 0, size, colors, true);
            constellationStars.push(p);
            particlesArray.push(p); 
        });

        // 2. Instanciar a Rede Dinâmica (Partículas Aleatórias Tênues)
        const dynamicCount = isMobile ? 15 : 50; // Menos no mobile
        for (let i = 0; i < dynamicCount; i++) {
            let size = (Math.random() * 1.5) + 0.5;
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            // Velocidade muito sutil
            let dx = (Math.random() - 0.5) * 0.8; 
            let dy = (Math.random() - 0.5) * 0.8;
            
            // isMainStar = false, sem cores especiais
            particlesArray.push(new Particle(x, y, dx, dy, size, null, false));
        }
    }

    function connectStars() {
        // Distância de conexão dinámica tênue
        let netDist = isMobile ? 5000 : 15000; 
        
        // 1. Desenhar a REDE Dinâmica (Fios sutis)
        for (let a = 0; a < particlesArray.length; a++) {
            // Pula estrelas estáticas nas conexões dinâmicas
            if (particlesArray[a].isMainStar) continue;

            for (let b = a; b < particlesArray.length; b++) {
                if (particlesArray[b].isMainStar) continue;

                let dist = ((particlesArray[a].x - particlesArray[b].x) ** 2) + 
                           ((particlesArray[a].y - particlesArray[b].y) ** 2);
                
                if (dist < netDist) {
                    let opacity = (1 - (dist / netDist)) * 0.15; // EXTREMAMENTE TRANSPARENTE
                    ctx.strokeStyle = `rgba(255, 68, 68, ${opacity})`; // Destaque vermelho sutil
                    ctx.lineWidth = 0.5; // Linha muito fina
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }

        // 2. Desenhar as Linhas de Guia de ÓRION (Tênues e Fixas)
        configurations.links.forEach(link => {
            let p1 = constellationStars[link[0]];
            let p2 = constellationStars[link[1]];
            
            // Linhas brancas muito tênues, estilo mapa estelar
            ctx.strokeStyle = `rgba(200, 200, 200, 0.1)`; // SUTILIDADE MÁXIMA
            ctx.lineWidth = 1.0; 
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        });
    }

    function animateBg() {
        requestAnimationFrame(animateBg);
        ctx.clearRect(0, 0, innerWidth, innerHeight);

        particlesArray.forEach(particle => particle.update());
        connectStars();
    }

    // Recalcula ao redimensionar
    window.addEventListener('resize', () => {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        initSites();
    });

    initSites();
    animateBg();

    /* ==============================================
       2. OUTRAS FUNÇÕES DO SITE (Menu, Fade, Ano)
       ============================================== */
    
    // Atualizar Ano do rodapé
    const yearSpan = document.getElementById('ano-atual');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Menu mudando ao rolar
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Menu Mobile Hamburger
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const navLinksLi = document.querySelectorAll('.nav-links li');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            navLinksLi.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });
            mobileMenu.classList.toggle('toggle');
        });
        navLinksLi.forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('nav-active')) {
                    navLinks.classList.remove('nav-active');
                    mobileMenu.classList.remove('toggle');
                    navLinksLi.forEach(l => l.style.animation = '');
                }
            });
        });
    }

    // Fade-in das seções
    const fadeSections = document.querySelectorAll('.fade-section');
    const observerOptions = { root: null, threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    const fadeObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, observerOptions);
    fadeSections.forEach(section => fadeObserver.observe(section));
});