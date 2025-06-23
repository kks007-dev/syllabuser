import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function GoogleCalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("w-6 h-6", props.className)}
      {...props}
    >
      <path d="M12 2.5C12.41 2.5 12.75 2.84 12.75 3.25V5.5H16.25V2.75C16.25 2.34 16.59 2 17 2C17.41 2 17.75 2.34 17.75 2.75V5.5H19.5C20.88 5.5 22 6.62 22 8V19.5C22 20.88 20.88 22 19.5 22H4.5C3.12 22 2 20.88 2 19.5V8C2 6.62 3.12 5.5 4.5 5.5H6.25V2.75C6.25 2.34 6.59 2 7 2C7.41 2 7.75 2.34 7.75 2.75V5.5H11.25V3.25C11.25 2.84 11.59 2.5 12 2.5ZM19.5 7H4.5C4.22 7 4 7.22 4 7.5V9H20V7.5C20 7.22 19.78 7 19.5 7ZM4.5 20H19.5C19.78 20 20 19.78 20 19.5V10.5H4V19.5C4 19.78 4.22 20 4.5 20Z" />
    </svg>
  );
}
