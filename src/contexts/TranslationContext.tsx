"use client"

// External
import React, { createContext, ReactNode, useContext } from "react";

// Internal
import i18n from "@/app/lib/i18n";
import { I18nextProvider, useTranslation, UseTranslationResponse } from "react-i18next";

const TranslationContext = createContext<UseTranslationResponse<string, undefined> | undefined>(undefined);

type TranslationProviderProps = {
    children: ReactNode
}

export const TranslationProvider: React.FC<TranslationProviderProps> = (props) => (
    <I18nextProvider i18n={i18n}>
        <TranslationContext.Provider value={useTranslation()}>
            {props.children}
        </TranslationContext.Provider>
    </I18nextProvider>
)

export const useTranslations = () => {
    const context = useContext(TranslationContext)
    if (!context) {
        throw new Error("useTranslations must be used within a TranslationProvider")
    }
    return context
}
