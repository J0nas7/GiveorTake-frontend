import React, { CSSProperties, forwardRef } from "react";

// Use React minimally so it isn't removed by IDE
void React.createElement;

type Variant = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'small' | 'div' | 'button'
type ReturnElement = 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'small' | 'div' | 'button'

const elements: Record<Variant, ReturnElement> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    p: 'p',
    span: 'span',
    button: 'button',
    small: 'small',
    div: 'div'
}

const classes: Record<Variant, string> = {
    h1: 'm-0 my-3 font-roboto font-helvetica font-arial sans-serif font-normal text-2xl leading-[1.235] tracking-[0.00735em] page-title',
    h2: 'block',
    h3: '',
    p: 'block w-full float-left my-2',
    span: 'block',
    button: 'block',
    small: 'text-xs',
    div: 'block'
}

type Props = {
    variant?: Variant
    className?: string
    theId?: string
    style?: CSSProperties
    onClick?: Function
    children?: React.ReactNode
}

const theElement = forwardRef<any, Props>(
    (
        {
            variant = 'div', className, theId, style, onClick, children
        },
        ref
    ) => {
        const Element = elements[variant]
        className = className ? ' ' + className : ''

        return (
            <Element
                className={`${classes[variant] + className}`}
                id={theId}
                style={style}
                onClick={onClick ?
                    (event) => onClick!(event) :
                    undefined}
                ref={ref ? ref : undefined}
            >
                {children}
            </Element>
        )
    }
)

// Adding display name for better debugging
theElement.displayName = 'BlockText';

export const Text = theElement
export const Block = theElement
