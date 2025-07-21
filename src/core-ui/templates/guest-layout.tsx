import { Block } from "@/components"
import { Jumbotron } from "@/core-ui"

type GuestLayoutProps = {
    children: React.ReactNode
}

export const GuestLayout: React.FC<GuestLayoutProps> = (props) => (
    <Block className="guest-wrapper">
        <Jumbotron />
        <Block className="guest-contents">
            {props.children}
        </Block>
    </Block>
)
