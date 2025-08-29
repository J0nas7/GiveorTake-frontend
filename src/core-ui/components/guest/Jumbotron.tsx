// External
import { CSSProperties } from 'react'

// Internal
import { Block } from "@/components"

export const Jumbotron = () => {
    const numberOfImages = 10
    const randomImage = Math.floor(Math.random() * (numberOfImages - 1 + 1) + 1)
    const requireImg = "/signin/signin-" + randomImage + ".jpg"

    const jumbotronCSS: CSSProperties = {
        height: '100vh',
        backgroundImage: `url('${requireImg}')`,
        backgroundPosition: 'center',
        backgroundSize: 'contain'
    }

    return (
        <Block className="jumbotron-wrapper" style={jumbotronCSS} />
    )
}
