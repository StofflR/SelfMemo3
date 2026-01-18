import { Box, BoxProps } from '@mantine/core';

interface LogoProps extends BoxProps {
  size?: number | string;
  color?: string;
}

const bgColor = "var(--mantine-color-body)";
const blueColor = "var(--mantine-color-blue-filled)";
const accentColor = "#f59f00"; 

//login logo
export const LogoFull = ({ size = 180, color, ...props }: LogoProps) => {
    const finalColor = color || blueColor;
    return (
      <Box w="auto" h={size} {...props} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', maxHeight: size }}>
            <g transform="translate(150, 60)">
                <g transform="translate(-50, -40)">
                    <path d="M10 30L50 60L90 30V80H10V30Z" stroke={finalColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <path d="M10 30L90 30" stroke={finalColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M50 60L10 80" stroke={finalColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M50 60L90 80" stroke={finalColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                    
                    <g transform="translate(75, 5) scale(1.3)">
                        <circle cx="12" cy="12" r="16" fill={bgColor} />
                        <path d="M18 8C18 3.58172 14.4183 0 10 0C5.58172 0 2 3.58172 2 8V16L0 18V20H20V18L18 16V8Z" fill={accentColor}/>
                        <path d="M10 24C11.1046 24 12 23.1046 12 22H8C8 23.1046 8.89543 24 10 24Z" fill={accentColor}/>
                        <path d="M-2 6C-3.5 7.5 -3.5 10.5 -2 12" stroke={accentColor} strokeWidth="2" strokeLinecap="round"/>
                        <path d="M-5 3C-7.5 5.5 -7.5 14.5 -5 17" stroke={accentColor} strokeWidth="2" strokeLinecap="round"/>
                        <path d="M22 6C23.5 7.5 23.5 10.5 22 12" stroke={accentColor} strokeWidth="2" strokeLinecap="round"/>
                        <path d="M25 3C27.5 5.5 27.5 14.5 25 17" stroke={accentColor} strokeWidth="2" strokeLinecap="round"/>
                    </g>
                </g>
            </g>
            <text x="50%" y="160" textAnchor="middle" fill={finalColor} fontSize="55" fontWeight="700" fontFamily="system-ui, sans-serif">
                SelfMemo<tspan fill={accentColor} dy="-20" fontSize="40" fontWeight="bold">3</tspan>
            </text>
        </svg>
      </Box>
    );
};

//logo for navbar
export const LogoHorizontal = ({ size = 40, color, ...props }: LogoProps) => {
    const finalColor = color || blueColor;
    return (
        <Box h={size} w="auto" {...props} style={{ display: 'flex', alignItems: 'center' }}>
             <svg viewBox="0 0 380 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height: '100%', width: 'auto' }}>
                <g transform="translate(0, 10) scale(0.9)">
                    <path d="M10 30L50 60L90 30V80H10V30Z" stroke={finalColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <path d="M10 30L90 30" stroke={finalColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M50 60L10 80" stroke={finalColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M50 60L90 80" stroke={finalColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                    
                    <g transform="translate(75, 5) scale(1.4)">
                        <circle cx="12" cy="12" r="16" fill={bgColor} />
                        <path d="M18 8C18 3.58172 14.4183 0 10 0C5.58172 0 2 3.58172 2 8V16L0 18V20H20V18L18 16V8Z" fill={accentColor}/>
                        <path d="M10 24C11.1046 24 12 23.1046 12 22H8C8 23.1046 8.89543 24 10 24Z" fill={accentColor}/>
                        <path d="M-2 6C-3.5 7.5 -3.5 10.5 -2 12" stroke={accentColor} strokeWidth="2" strokeLinecap="round"/>
                        <path d="M-5 3C-7.5 5.5 -7.5 14.5 -5 17" stroke={accentColor} strokeWidth="2" strokeLinecap="round"/>
                        <path d="M22 6C23.5 7.5 23.5 10.5 22 12" stroke={accentColor} strokeWidth="2" strokeLinecap="round"/>
                        <path d="M25 3C27.5 5.5 27.5 14.5 25 17" stroke={accentColor} strokeWidth="2" strokeLinecap="round"/>
                    </g>
                </g>

                <text 
                    x="110" 
                    y="55" 
                    dominantBaseline="central" 
                    fill={finalColor} 
                    fontSize="52" 
                    fontWeight="700" 
                    fontFamily="system-ui, sans-serif"
                >
                    SelfMemo<tspan fill={accentColor} dy="-18" fontSize="38" fontWeight="bold">3</tspan>
                </text>
             </svg>
        </Box>
    )
}

//only icon
export const LogoIcon = ({ size = 40, color, ...props }: LogoProps) => {
    const finalColor = color || blueColor;
    return (
        <Box w={size} h={size} {...props}>
             <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                <g transform="translate(10, 20)">
                    <path d="M10 30L50 60L90 30V80H10V30Z" stroke={finalColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <path d="M10 30L90 30" stroke={finalColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M50 60L10 80" stroke={finalColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M50 60L90 80" stroke={finalColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                    <g transform="translate(75, 5) scale(1.2)">
                        <circle cx="12" cy="12" r="16" fill={bgColor} />
                        <path d="M18 8C18 3.58172 14.4183 0 10 0C5.58172 0 2 3.58172 2 8V16L0 18V20H20V18L18 16V8Z" fill={accentColor}/>
                        <path d="M10 24C11.1046 24 12 23.1046 12 22H8C8 23.1046 8.89543 24 10 24Z" fill={accentColor}/>
                        <path d="M-2 6C-3.5 7.5 -3.5 10.5 -2 12" stroke={accentColor} strokeWidth="2" strokeLinecap="round"/>
                        <path d="M-5 3C-7.5 5.5 -7.5 14.5 -5 17" stroke={accentColor} strokeWidth="2" strokeLinecap="round"/>
                        <path d="M22 6C23.5 7.5 23.5 10.5 22 12" stroke={accentColor} strokeWidth="2" strokeLinecap="round"/>
                        <path d="M25 3C27.5 5.5 27.5 14.5 25 17" stroke={accentColor} strokeWidth="2" strokeLinecap="round"/>
                    </g>
                </g>
             </svg>
        </Box>
    )
}