import type { SVGProps } from "react";

export function AgriSmartLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="hsl(var(--primary) / 0.1)" />
            <path d="M16.7,11.1c1.2-1.2,1.8-2.7,1.8-4.3c0-1.6-0.6-3.1-1.8-4.3c-1.2-1.2-2.7-1.8-4.3-1.8s-3.1,0.6-4.3,1.8C7,3.6,6.4,5,6.4,6.7" stroke="hsl(var(--primary))"/>
            <path d="M12.4,8.5c-0.3,0.3-0.5,0.7-0.5,1.1c0,0.4,0.2,0.8,0.5,1.1l0,0c0.3,0.3,0.7,0.5,1.1,0.5c0.4,0,0.8-0.2,1.1-0.5" stroke="hsl(var(--primary))"/>
            <path d="M17.2,13.7c0.2,0,0.5,0,0.7-0.1c1.3-0.5,2.1-1.8,1.8-3.1c-0.2-1-1.2-1.8-2.2-1.8" stroke="hsl(var(--accent))"/>
            <path d="M2.8,12.7C2.8,12.7,2.8,12.7,2.8,12.7c-0.5,2,0.2,4.1,1.9,5.5" stroke="hsl(var(--primary))"/>
            <path d="M11.2,14.6c0,0-2.3-1.2-3.8-0.3c-1.5,0.9-1.3,3.3-1.3,3.3" stroke="hsl(var(--primary))"/>
        </svg>
    );
}