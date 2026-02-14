import { connection } from "next/server";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { powerJobFileRouter } from "../router";
import { Suspense } from "react";

export async function UploadThingSSR() {
  return (
    <Suspense>
      <UTSSR />
    </Suspense>
  );
}

async function UTSSR() {
  await connection();
  return (
    <NextSSRPlugin routerConfig={extractRouterConfig(powerJobFileRouter)} />
  );
}
