import { Block } from "@/components"
import { Jumbotron } from "@/core-ui"
import { SnackBar } from '@/core-ui/components/SnackBar'

type GuestLayoutProps = {
    children: React.ReactNode
}

export const GuestLayout: React.FC<GuestLayoutProps> = (props) => (
    <Block className="guest-wrapper">
        <SnackBar />
        <Jumbotron />
        <Block className="guest-contents">
            {props.children}
        </Block>
    </Block>
)
