'use client';

import React from 'react';

type Props = {
    title: string;
    style?: React.CSSProperties;
    headingStyle?: string;
    lineColor?: string;
    lineThick?: string;
    lineWidth?: string;
};

const SectionHeader = ({
    title,
    style,
    headingStyle,
    lineColor,
    lineThick,
    lineWidth,
}: Props) => {

    const lc = lineColor || '#1f2937';
    const lt = lineThick || '2px';
    const lw = lineWidth || '100%';

    if (headingStyle?.includes('underline')) {
        return (
            <div
                className="section-header-container"
                style={{
                    borderBottom: `${lt} solid ${lc}`,
                    paddingBottom: '4px',
                    marginBottom: '8px',
                    width: lw,
                }}
            >
                <h2 style={style}>{title}</h2>
            </div>
        );
    }

    if (headingStyle?.includes('background')) {
        return (
            <div
                className="section-header-container"
                style={{
                    background: `${lc}15`,
                    padding: '6px 10px',
                    borderRadius: '6px',
                    marginBottom: '8px',
                }}
            >
                <h2 style={style}>{title}</h2>
            </div>
        );
    }

    return (
        <div
            className="section-header-container"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '8px',
            }}
        >
            <h2 style={style}>{title}</h2>

            <div
                style={{
                    flex: 1,
                    height: lt,
                    background: lc,
                    borderRadius: '999px',
                }}
            />
        </div>
    );
};

export default SectionHeader;