"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/shared/Map"), { ssr: false });

export default function StoreMap({ focusId }: { focusId?: string }) {
  return <MapComponent focusId={focusId} />;
}
