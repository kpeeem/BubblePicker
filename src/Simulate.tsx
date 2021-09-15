// https://martinheinz.github.io/physics-visual/
// https://martinheinz.dev/blog/15
import { useRef, useEffect } from "react";
import {
  Shape,
  Collision,
  setupCanvas,
  getRandomInt,
  moveWithGravity,
  checkCollision,
  resolveCollisionWithBounce
} from "./utils";

type Props = {
  items: string[];
  onSelect?: (item: string[]) => void;
};

const gravity = false;

export default function Simulate({ items, onSelect }: Props) {
  const canvasRef = useRef<{
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    rect: DOMRect;
  }>();
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const itemsRef = useRef<Shape[]>([]);
  // Get the device pixel ratio, falling back to 1.
  const dpr = window?.devicePixelRatio || 1;

  useEffect(() => {
    const canvasEl = canvasElRef.current;
    if (!canvasEl) {
      return;
    }

    canvasRef.current = setupCanvas(canvasEl, dpr);

    if (!canvasRef.current) return;

    const { canvas, ctx, rect } = canvasRef.current;
    const { width: canvasWidth, height: canvasHeight } = rect;

    canvas.addEventListener(
      "mousedown",
      function (event: MouseEvent) {
        const selectedItems: string[] = [];
        for (let o of itemsRef.current) {
          if (
            ctx.isPointInPath(
              o.circle,
              event.offsetX * dpr,
              event.offsetY * dpr
            )
          ) {
            o.setActive();
          }
          if (o.isActive) {
            selectedItems.push(o.t);
          }
        }
        onSelect?.(selectedItems);
        // createShape(event);
      },
      false
    );

    canvas.addEventListener("mousemove", function (event) {
      for (let o of itemsRef.current) {
        if (
          ctx.isPointInPath(o.circle, event.offsetX * dpr, event.offsetY * dpr)
        ) {
          o.setHover();
          canvasEl.style.cursor = "pointer";
        } else {
          o.setHover(false);
          canvasEl.style.cursor = "default";
        }
      }
    });

    /** This function is ran with every animation frame and each time clears canvas, updates coordinates of all objects,
     * resolves collisions of objects and edges of canvas , resolves collisions between objects and finally draws all of them. */
    function animate() {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      if (gravity) {
        moveWithGravity(0.01, itemsRef.current);
      } else {
        for (let o of itemsRef.current) {
          o.move(0.1);
        }
      }

      for (let o of itemsRef.current) {
        o.resolveEdgeCollision(canvasWidth, canvasHeight);
      }

      let collisions: (Collision | null)[] = [];
      for (let [i, o1] of itemsRef.current.entries()) {
        for (let [j, o2] of itemsRef.current.entries()) {
          if (i < j) {
            let { collisionInfo, collided } = checkCollision(o1, o2);
            if (collided) {
              collisions.push(collisionInfo);
            }
          }
        }
      }

      for (let col of collisions) {
        if (col) {
          resolveCollisionWithBounce(col); // resolveCollision(col)
        }
      }
      for (let o of itemsRef.current) {
        o.draw();
      }

      window.requestAnimationFrame(animate);
    }

    window.requestAnimationFrame(animate);
  }, [dpr, onSelect]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const { canvas, ctx } = canvasRef.current;
    const {
      offsetHeight: canvasOffsetHeight,
      offsetWidth: canvasOffsetWidth
    } = canvas;

    const currentItems = itemsRef.current.map((v) => v.t);

    // new items
    const diffRight = items.filter((x) => !currentItems.includes(x));
    // deleted items
    const diffLeft = currentItems.filter((x) => !items.includes(x));

    // let rows = 6;
    let radius = 50;
    // let startX = Math.round(canvasOffsetWidth / 2);
    // let startY = Math.round(canvasOffsetHeight / 2);
    let cols = Math.round(canvasOffsetHeight * 0.25) / radius;

    // console.log({ cols, canvasOffsetHeight, canvasOffsetWidth });
    for (let [i, item] of diffLeft.entries()) {
      // setTimeout(() => {
      itemsRef.current = itemsRef.current.filter((v) => v.t !== item);
      // }, 70 * i);
    }

    for (let [i, item] of diffRight.entries()) {
      // let radius = getRandomInt(36 + 16, 59 + 16);
      // setTimeout(() => {
      let x = getRandomInt(radius, canvasOffsetWidth - radius);
      let y = getRandomInt(radius, canvasOffsetHeight - radius);

      itemsRef.current.push(
        new Shape(
          ctx,
          x,
          y,
          radius,
          0, //getRandomInt(-1, 1),
          0,
          radius * 10,
          item
        )
      );
      // }, 50 * i);
    }
  }, [items]);

  return (
    <div>
      <canvas
        width="500"
        height="500"
        className="canvas"
        ref={canvasElRef}
        id="canvas"
      />
    </div>
  );
}
