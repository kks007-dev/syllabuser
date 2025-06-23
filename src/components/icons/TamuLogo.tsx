import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function TamuLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 170.8 132.8"
      className={cn("h-12 w-auto", props.className)}
      fill="currentColor"
      {...props}
    >
      <title>Texas A&M University Logo</title>
      <path d="M36.7 131.8V31.5h22.2v44.9h.3c5.5-39.2 35.8-44.9 35.8-44.9s0 44.9-30.3 44.9c-7.9 0-9.4 2.8-9.4 7.1v68.3H36.7z" />
      <path d="M134.1 131.8V31.5h-22.2v44.9h-.3c-5.5-39.2-35.8-44.9-35.8-44.9s0 44.9 30.3 44.9c7.9 0 9.4 2.8 9.4 7.1v68.3h22.2z" />
      <path d="M59.6 1V23.3h51.6V1H59.6z" />
      <path d="M7.1 15.8C4.3 15.8 2 18.1 2 20.9v2.2h166.8v-2.2c0-2.8-2.2-5-5-5H7.1z" />
    </svg>
  );
}
