import type { SVGProps } from "react"

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
      <path d="M12 12m-4 0a4 4 0 1 0 8 0 4 4 0 1 0-8 0"></path>
      <path d="M12 12m-1 0a1 1 0 1 0 2 0 1 1 0 1 0-2 0"></path>
    </svg>
  ),
}
