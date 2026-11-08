import React, { useCallback, useRef, useState } from 'react';
import { geoNaturalEarth1 } from 'd3-geo';
import { Territory } from '../types/game';
import { getBaseProjectionScale } from './spatialIndex';

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 18;

export function useMapGestures(params: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  territories: Record<string, Territory>;
  onTapClientPoint: (clientX: number, clientY: number) => void;
}) {
  const { canvasRef, containerRef, territories, onTapClientPoint } = params;

  const [transform, setTransform] = useState<{ k: number; x: number; y: number }>({
    k: 1.85,
    x: 0,
    y: 0,
  });

  const transformRef = useRef(transform);
  transformRef.current = transform;

  const territoriesRef = useRef(territories);
  territoriesRef.current = territories;

  const lastPinchTimeRef = useRef<number>(0);

  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    movedDistance: number;
    pinchDist: number | null;
    pinchMidX: number | null;
    pinchMidY: number | null;
    wasPinching: boolean;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    movedDistance: 0,
    pinchDist: null,
    pinchMidX: null,
    pinchMidY: null,
    wasPinching: false,
  });

  const centerOnTerritory = useCallback(
    (territoryId: string, targetScale = 2.6) => {
      const container = containerRef.current;
      const territory = territoriesRef.current[territoryId];
      if (!container || !territory) return;

      const width = container.clientWidth || 1024;
      const height = container.clientHeight || 640;

      const baseScale = getBaseProjectionScale(width, height);
      const projection = geoNaturalEarth1()
        .scale(baseScale)
        .translate([width / 2, height / 2]);

      const pt = projection(territory.centroid);
      if (!pt) return;

      const nextTransform = {
        k: targetScale,
        x: width / 2 - pt[0] * targetScale,
        y: height / 2 - pt[1] * targetScale,
      };
      transformRef.current = nextTransform;
      setTransform(nextTransform);
    },
    [containerRef]
  );

  const reprojectOnResize = useCallback(
    (
      prevWidth: number,
      prevHeight: number,
      nextWidth: number,
      nextHeight: number
    ) => {
      if (
        prevWidth <= 0 ||
        prevHeight <= 0 ||
        nextWidth <= 0 ||
        nextHeight <= 0 ||
        (prevWidth === nextWidth && prevHeight === nextHeight)
      ) {
        return;
      }

      const cur = transformRef.current;
      const oldProj = geoNaturalEarth1()
        .scale(getBaseProjectionScale(prevWidth, prevHeight))
        .translate([prevWidth / 2, prevHeight / 2]);

      const oldMapX = (prevWidth / 2 - cur.x) / cur.k;
      const oldMapY = (prevHeight / 2 - cur.y) / cur.k;
      const centerGeo = oldProj.invert?.([oldMapX, oldMapY]) as
        | [number, number]
        | null;
      if (!centerGeo) return;

      const newProj = geoNaturalEarth1()
        .scale(getBaseProjectionScale(nextWidth, nextHeight))
        .translate([nextWidth / 2, nextHeight / 2]);
      const newPt = newProj(centerGeo);
      if (!newPt) return;

      const nextTransform = {
        k: cur.k,
        x: nextWidth / 2 - newPt[0] * cur.k,
        y: nextHeight / 2 - newPt[1] * cur.k,
      };
      transformRef.current = nextTransform;
      setTransform(nextTransform);
    },
    []
  );

  const zoomBy = useCallback(
    (factor: number) => {
      const container = containerRef.current;
      const cx = (container?.clientWidth || 800) / 2;
      const cy = (container?.clientHeight || 500) / 2;
      setTransform((prev) => {
        const nextK = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.k * factor));
        const ratio = nextK / prev.k;
        const next = {
          k: nextK,
          x: cx - (cx - prev.x) * ratio,
          y: cy - (cy - prev.y) * ratio,
        };
        transformRef.current = next;
        return next;
      });
    },
    [containerRef]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: transformRef.current.x,
      origY: transformRef.current.y,
      movedDistance: 0,
      pinchDist: null,
      pinchMidX: null,
      pinchMidY: null,
      wasPinching: false,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    dragRef.current.movedDistance = Math.hypot(dx, dy);

    setTransform((prev) => {
      const next = {
        ...prev,
        x: dragRef.current.origX + dx,
        y: dragRef.current.origY + dy,
      };
      transformRef.current = next;
      return next;
    });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    if (dragRef.current.movedDistance < 6) {
      onTapClientPoint(e.clientX, e.clientY);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const factor = e.deltaY < 0 ? 1.18 : 0.85;
    setTransform((prev) => {
      const nextK = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.k * factor));
      const ratio = nextK / prev.k;
      const next = {
        k: nextK,
        x: mouseX - (mouseX - prev.x) * ratio,
        y: mouseY - (mouseY - prev.y) * ratio,
      };
      transformRef.current = next;
      return next;
    });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      dragRef.current = {
        isDragging: true,
        startX: t.clientX,
        startY: t.clientY,
        origX: transformRef.current.x,
        origY: transformRef.current.y,
        movedDistance: 0,
        pinchDist: null,
        pinchMidX: null,
        pinchMidY: null,
        wasPinching: false,
      };
    } else if (e.touches.length >= 2) {
      lastPinchTimeRef.current = Date.now();
      const canvas = canvasRef.current;
      const rect = canvas?.getBoundingClientRect();
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const d = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      const midX = (t0.clientX + t1.clientX) / 2 - (rect?.left || 0);
      const midY = (t0.clientY + t1.clientY) / 2 - (rect?.top || 0);

      dragRef.current.isDragging = false;
      dragRef.current.movedDistance = 999;
      dragRef.current.wasPinching = true;
      dragRef.current.pinchDist = Math.max(12, d);
      dragRef.current.pinchMidX = midX;
      dragRef.current.pinchMidY = midY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (
      e.touches.length === 1 &&
      dragRef.current.isDragging &&
      !dragRef.current.wasPinching
    ) {
      const t = e.touches[0];
      const dx = t.clientX - dragRef.current.startX;
      const dy = t.clientY - dragRef.current.startY;
      dragRef.current.movedDistance = Math.hypot(dx, dy);
      setTransform((prev) => {
        const next = {
          ...prev,
          x: dragRef.current.origX + dx,
          y: dragRef.current.origY + dy,
        };
        transformRef.current = next;
        return next;
      });
    } else if (e.touches.length >= 2 && dragRef.current.pinchDist) {
      lastPinchTimeRef.current = Date.now();
      dragRef.current.wasPinching = true;
      dragRef.current.movedDistance = 999;

      const canvas = canvasRef.current;
      const rect = canvas?.getBoundingClientRect();
      const t0 = e.touches[0];
      const t1 = e.touches[1];

      const midX = (t0.clientX + t1.clientX) / 2 - (rect?.left || 0);
      const midY = (t0.clientY + t1.clientY) / 2 - (rect?.top || 0);

      const newDist = Math.max(
        12,
        Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY)
      );
      const factor = newDist / dragRef.current.pinchDist;
      const panDx =
        dragRef.current.pinchMidX !== null ? midX - dragRef.current.pinchMidX : 0;
      const panDy =
        dragRef.current.pinchMidY !== null ? midY - dragRef.current.pinchMidY : 0;

      dragRef.current.pinchDist = newDist;
      dragRef.current.pinchMidX = midX;
      dragRef.current.pinchMidY = midY;

      setTransform((prev) => {
        const nextK = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev.k * factor));
        const ratio = nextK / prev.k;
        const next = {
          k: nextK,
          x: midX - (midX - prev.x) * ratio + panDx,
          y: midY - (midY - prev.y) * ratio + panDy,
        };
        transformRef.current = next;
        return next;
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const isRecentPinch = Date.now() - lastPinchTimeRef.current < 450;
    if (
      dragRef.current.isDragging &&
      !dragRef.current.wasPinching &&
      !isRecentPinch &&
      dragRef.current.movedDistance < 10 &&
      e.changedTouches.length === 1 &&
      e.touches.length === 0
    ) {
      const t = e.changedTouches[0];
      onTapClientPoint(t.clientX, t.clientY);
    }

    if (e.touches.length === 1) {
      const remaining = e.touches[0];
      dragRef.current.isDragging = true;
      dragRef.current.startX = remaining.clientX;
      dragRef.current.startY = remaining.clientY;
      dragRef.current.origX = transformRef.current.x;
      dragRef.current.origY = transformRef.current.y;
      dragRef.current.movedDistance = 999;
      dragRef.current.pinchDist = null;
      dragRef.current.pinchMidX = null;
      dragRef.current.pinchMidY = null;
      dragRef.current.wasPinching = true;
    } else if (e.touches.length === 0) {
      dragRef.current.isDragging = false;
      dragRef.current.pinchDist = null;
      dragRef.current.pinchMidX = null;
      dragRef.current.pinchMidY = null;
      dragRef.current.wasPinching = false;
    }
  };

  return {
    transform,
    centerOnTerritory,
    reprojectOnResize,
    zoomBy,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onWheel: handleWheel,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
