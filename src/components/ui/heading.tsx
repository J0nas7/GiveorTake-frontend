import React from 'react';
import { Text } from '..';

// Use React minimally so it isn't removed by IDE
void React.createElement;

type Variant = 'h1' | 'h2' | 'h3'
/**
 * Renders a form field.
 *
 * @param {string} props.title Text for heading.
 */

export const Heading = ({
    title = '',
    variant = 'h1',
    className = '',
    children = ''
}: {
    title?: string,
    variant?: Variant
    className?: string,
    children?: React.ReactNode,
}) => {
    return (
        <Text variant={variant} className={className}>{(title || children)}</Text>
    )
}
