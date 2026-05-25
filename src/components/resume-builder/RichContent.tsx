'use client';

import React from 'react';

type Props = {
    html?: string;
    path?: string;
    className?: string;
    style?: React.CSSProperties;
    overrides?: any;
};

const RichContent = ({
    html = '',
    path = '',
    className = '',
    style = {},
}: Props) => {

    return (
        <div
            className={className}
            style={style}
            data-edit-path={path}
            data-edit-type="richtext"
            data-edit-value={html}
            dangerouslySetInnerHTML={{
                __html: html || '<p></p>',
            }}
        />
    );
};

export default RichContent;