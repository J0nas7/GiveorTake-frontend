import { Block } from "@/components"

export const GuestLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Block className="guest-wrapper">
            <Block className="guest-contents">
                {children}
            </Block>
        </Block>
    )
}