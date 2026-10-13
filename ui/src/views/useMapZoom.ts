import Panzoom, { type PanzoomObject } from "@panzoom/panzoom";
import { useEffect, useRef, useState } from "react";

/**
 * Zoom and panning of a map (step 7.10): the Panzoom instance on the map's box, the zoom by
 * mouse wheel, and the measured shape of the image so the box fits it exactly.
 */
export function useMapZoom() {
  const stage = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const zoom = useRef<PanzoomObject | null>(null);
  const [fit, setFit] = useState<{ width: number; height: number } | null>(
    null,
  );

  useEffect(() => {
    const element = content.current;
    const parent = stage.current;
    if (element === null || parent === null) {
      return;
    }
    const panzoom = Panzoom(element, { minScale: 1, maxScale: 10 });
    zoom.current = panzoom;
    // Points keep their size on screen while the map grows.
    function scaled(event: Event) {
      const scale = (event as CustomEvent<{ scale: number }>).detail.scale;
      element?.style.setProperty("--marker-scale", String(1 / scale));
    }
    parent.addEventListener("wheel", panzoom.zoomWithWheel);
    element.addEventListener("panzoomchange", scaled);
    return () => {
      parent.removeEventListener("wheel", panzoom.zoomWithWheel);
      element.removeEventListener("panzoomchange", scaled);
      panzoom.destroy();
      zoom.current = null;
    };
  }, []);

  // The map's box takes exactly the shape of the image, so points sit where they belong.
  function measure(image: HTMLImageElement | null) {
    const parent = stage.current;
    if (image === null || parent === null || image.naturalWidth === 0) {
      return;
    }
    const room = { width: parent.clientWidth, height: parent.clientHeight };
    if (room.width === 0 || room.height === 0) {
      return;
    }
    const ratio = image.naturalWidth / image.naturalHeight;
    setFit(
      room.width / room.height > ratio
        ? { width: room.height * ratio, height: room.height }
        : { width: room.width, height: room.width / ratio },
    );
  }

  // The stage shrinks when the note or the entry list appear; the map follows.
  useEffect(() => {
    const parent = stage.current;
    function resized() {
      measure(content.current?.querySelector("img") ?? null);
    }
    window.addEventListener("resize", resized);
    const watcher =
      typeof ResizeObserver === "undefined" || parent === null
        ? null
        : new ResizeObserver(resized);
    if (parent !== null) {
      watcher?.observe(parent);
    }
    return () => {
      window.removeEventListener("resize", resized);
      watcher?.disconnect();
    };
  }, []);

  return { stage, content, zoom, fit, measure };
}
