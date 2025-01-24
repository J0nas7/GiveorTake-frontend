import {
    createContext, 
    ReactNode, 
    useContext
} from "react"

type TranslationContextType = {
    translations: Record<string, string> // Replace with your actual translation type
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export const TranslationProvider = ({
    translations,
    children,
}: {
    translations: Record<string, string>
    children: ReactNode
}) => {
    return (
        <TranslationContext.Provider value={{ translations }}>
            {children}
        </TranslationContext.Provider>
    )
}

export const useTranslations = () => {
    const context = useContext(TranslationContext)
    if (!context) {
        throw new Error("useTranslations must be used within a TranslationProvider")
    }
    return context.translations
}
