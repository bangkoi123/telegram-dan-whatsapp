import React from 'react';

const staticPlaceholderSvg = '<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="qr-code-svg"><rect width="200" height="200" fill="white"/><rect x="30" y="30" width="45" height="45" fill="#1A1C2C"/><rect x="37" y="37" width="31" height="31" fill="white"/><rect x="44" y="44" width="17" height="17" fill="#1A1C2C"/><rect x="125" y="30" width="45" height="45" fill="#1A1C2C"/><rect x="132" y="37" width="31" height="31" fill="white"/><rect x="139" y="44" width="17" height="17" fill="#1A1C2C"/><rect x="30" y="125" width="45" height="45" fill="#1A1C2C"/><rect x="37" y="132" width="31" height="31" fill="white"/><rect x="44" y="139" width="17" height="17" fill="#1A1C2C"/><path fill="#1A1C2C" d="M85 30h10v10H85z M95 40h10v10H95z M105 30h10v10h-10z M85 50h10v10H85z M105 50h10v10h-10z M85 70h10v10H85z M95 60h10v10H95z M105 70h10v10h-10z M30 85h10v10H30z M40 95h10v10H40z M50 85h10v10H50z M30 105h10v10H30z M50 105h10v10H50z M85 85h10v10H85z M95 95h10v10H95z M105 85h10v10h-10z M115 95h10v10h-10z M85 105h10v10H85z M95 115h10v10H95z M105 105h10v10h-10z M125 85h10v10h-10z M135 95h10v10h-10z M145 85h10v10h-10z M155 95h10v10h-10z M125 105h10v10h-10z M145 105h10v10h-10z M85 125h10v10H85z M95 135h10v10H95z M105 125h10v10h-10z M115 135h10v10h-10z M85 145h10v10H85z M95 155h10v10H95z M105 145h10v10h-10z M125 125h10v10h-10z M135 135h10v10h-10z M145 125h10v10h-10z M155 135h10v10h-10z M125 145h10v10h-10z M135 155h10v10h-10z M145 145h10v10h-10z"/></svg>';

const QrCodePlaceholder: React.FC<{ svgString?: string }> = ({ svgString }) => {
    const finalSvg = svgString || staticPlaceholderSvg;
    return (
        <div className="qr-code-svg" dangerouslySetInnerHTML={{ __html: finalSvg }} />
    );
};


export default QrCodePlaceholder;