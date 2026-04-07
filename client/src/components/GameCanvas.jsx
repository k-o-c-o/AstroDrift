import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { useKeyboard } from '../hooks/useKeyboard';

const SPEED = 3.5;
const PROXIMITY_RADIUS = 150;
const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1800;

function hexToNum(hex) {
  return parseInt(hex.replace('#', ''), 16);
}

function createAvatar(username, color) {
  const container = new PIXI.Container();

  // Proximity ring
  const ring = new PIXI.Graphics();
  ring.circle(0, 0, PROXIMITY_RADIUS);
  ring.stroke({ color: hexToNum(color), alpha: 0.2, width: 1.5 });
  container.addChild(ring);

  // Shadow
  const shadow = new PIXI.Graphics();
  shadow.ellipse(0, 26, 18, 6);
  shadow.fill({ color: 0x000000, alpha: 0.3 });
  container.addChild(shadow);

  // Avatar body
  const body = new PIXI.Graphics();
  body.circle(0, 0, 22);
  body.fill({ color: hexToNum(color), alpha: 1 });
  container.addChild(body);

  const highlight = new PIXI.Graphics();
  highlight.circle(-5, -7, 9);
  highlight.fill({ color: 0xffffff, alpha: 0.15 });
  container.addChild(highlight);

  const initials = new PIXI.Text({
    text: username.slice(0, 2).toUpperCase(),
    style: {
      fontSize: 13,
      fill: 0xffffff,
      fontWeight: '700',
      fontFamily: 'Arial',
    },
  });
  initials.anchor.set(0.5);
  container.addChild(initials);

  const nameBg = new PIXI.Graphics();
  nameBg.roundRect(-38, 28, 76, 20, 6);
  nameBg.fill({ color: 0x000000, alpha: 0.6 });
  container.addChild(nameBg);

  // Name label
  const nameLabel = new PIXI.Text({
    text: username.length > 10 ? username.slice(0, 10) + '…' : username,
    style: {
      fontSize: 11,
      fill: 0xffffff,
      fontFamily: 'Arial',
      fontWeight: '500',
    },
  });
  nameLabel.anchor.set(0.5, 0);
  nameLabel.y = 30;
  container.addChild(nameLabel);

  container.__ring = ring;
  container.__color = color;

  return container;
}


function createWorld() {
  const world = new PIXI.Container();

  // Deep blue background
  const bg = new PIXI.Graphics();
  bg.rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  bg.fill({ color: 0x020818 });
  world.addChild(bg);

  // Stars
  const stars = new PIXI.Graphics();
  for (let i = 0; i < 300; i++) {
    const r = Math.random() * 1.2 + 0.2;
    stars.circle(Math.random() * WORLD_WIDTH, Math.random() * WORLD_HEIGHT, r);
    stars.fill({ color: 0xffffff, alpha: Math.random() * 0.6 + 0.2 });
  }
  world.addChild(stars);

  // Galaxy zones
 const galaxyZones = [
    { x: 80,   y: 80,  w: 380, h: 260, label: 'Andromeda Sector', sub: 'M31 · 2.537M ly',            color: 0x7F77DD, coreColor: 0xAFA9EC },
    { x: 560,  y: 80,  w: 380, h: 260, label: 'Orion Nebula',     sub: 'NGC 1976 · 1,344 ly',         color: 0x1D9E75, coreColor: 0x5DCAA5 },
    { x: 1040, y: 80,  w: 380, h: 260, label: 'Triangulum Gate',  sub: 'M33 · 2.73M ly',              color: 0xD85A30, coreColor: 0xF0997B },
    { x: 80,   y: 440, w: 380, h: 260, label: 'Whirlpool Drift',  sub: 'M51 · 23M ly',                color: 0x378ADD, coreColor: 0x85B7EB },
    { x: 560,  y: 440, w: 380, h: 260, label: 'Milky Way Core',   sub: 'Sagittarius A* · 26,000 ly',  color: 0xEF9F27, coreColor: 0xFAC775 },
    { x: 1040, y: 440, w: 380, h: 260, label: 'Cosmic Lounge',    sub: 'NGC 4889 · 308M ly',          color: 0xD4537E, coreColor: 0xED93B1 },
];

  galaxyZones.forEach(({ x, y, w, h, label, sub, color, coreColor }) => {
    const zone = new PIXI.Graphics();
    zone.roundRect(x, y, w, h, 12);
    zone.fill({ color, alpha: 0.06 });
    zone.roundRect(x, y, w, h, 12);
    zone.stroke({ color, alpha: 0.4, width: 1.5 });
    world.addChild(zone);

    const core = new PIXI.Graphics();
    core.circle(x + w - 40, y + 40, 6);
    core.fill({ color: coreColor, alpha: 0.9 });
    world.addChild(core);

    const nameText = new PIXI.Text({ text: label, style: { fontSize: 13, fill: coreColor, fontFamily: 'Arial', fontWeight: '700' } });
    nameText.alpha = 0.9;
    nameText.x = x + 14;
    nameText.y = y + 14;
    world.addChild(nameText);

    const subText = new PIXI.Text({ text: sub, style: { fontSize: 10, fill: coreColor, fontFamily: 'Arial' } });
    subText.alpha = 0.45;
    subText.x = x + 14;
    subText.y = y + 32;
    world.addChild(subText);
  });

  const border = new PIXI.Graphics();
  border.rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  border.stroke({ color: 0x2a2a6e, alpha: 0.6, width: 2 });
  world.addChild(border);

  return world;
}

export default function GameCanvas({ users, myId, onMove, chatRoom }) {
  const containerRef = useRef(null);
  const appRef       = useRef(null);
  const worldRef     = useRef(null);
  const spritesRef   = useRef({});
  const myPosRef     = useRef({ x: 600, y: 400 });
  const usersRef     = useRef(users);
  const keys         = useKeyboard();

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    let destroyed = false;

    async function init() {
      if (!containerRef.current) return;

      const app = new PIXI.Application();

      await app.init({
        resizeTo: containerRef.current,
        backgroundColor: 0x020818,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (destroyed) {
        app.destroy(true);
        return;
      }

      appRef.current = app;
      containerRef.current.appendChild(app.canvas);

      const world = createWorld();
      worldRef.current = world;
      app.stage.addChild(world);

      app.ticker.add(() => {
        const currentUsers = usersRef.current;
        const currentMyId  = myId;

        let dx = 0, dy = 0;
        const k = keys.current;
        if (k['ArrowUp']    || k['w'] || k['W']) dy -= SPEED;
        if (k['ArrowDown']  || k['s'] || k['S']) dy += SPEED;
        if (k['ArrowLeft']  || k['a'] || k['A']) dx -= SPEED;
        if (k['ArrowRight'] || k['d'] || k['D']) dx += SPEED;

        if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

        if (dx !== 0 || dy !== 0) {
          myPosRef.current.x = Math.max(30, Math.min(WORLD_WIDTH  - 30, myPosRef.current.x + dx));
          myPosRef.current.y = Math.max(30, Math.min(WORLD_HEIGHT - 30, myPosRef.current.y + dy));
          onMove(myPosRef.current.x, myPosRef.current.y);
        }

        const mySprite = currentMyId ? spritesRef.current[currentMyId] : null;
        if (mySprite) {
          const sw = app.renderer.width;
          const sh = app.renderer.height;
          world.x = Math.min(0, Math.max(-(WORLD_WIDTH  - sw), sw / 2 - mySprite.x));
          world.y = Math.min(0, Math.max(-(WORLD_HEIGHT - sh), sh / 2 - mySprite.y));
        }

        Object.entries(spritesRef.current).forEach(([id, sprite]) => {
          const user = currentUsers[id];
          if (!user) return;

          if (id === currentMyId) {
            sprite.x = myPosRef.current.x;
            sprite.y = myPosRef.current.y;
          } else {
            sprite.x += (user.x - sprite.x) * 0.12;
            sprite.y += (user.y - sprite.y) * 0.12;
          }

          // Pulse ring when connected
          if (sprite.__ring) {
            const t = Date.now() / 800;
            sprite.__ring.alpha = 0.15 + 0.1 * Math.sin(t);
          }
        });
      });
    }

    init();

    return () => {
      destroyed = true;
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, []); 

  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;

    // Add missing avatars
    Object.entries(users).forEach(([id, user]) => {
      if (!spritesRef.current[id]) {
        const avatar = createAvatar(user.username, user.color || '#7F77DD');
        avatar.x = user.x || 400;
        avatar.y = user.y || 300;
        world.addChild(avatar);
        spritesRef.current[id] = avatar;
      }
    });

    Object.keys(spritesRef.current).forEach((id) => {
      if (!users[id]) {
        world.removeChild(spritesRef.current[id]);
        spritesRef.current[id].destroy({ children: true });
        delete spritesRef.current[id];
      }
    });
  }, [users]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
      tabIndex={0}
    />
  );
}