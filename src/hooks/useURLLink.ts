import { AppDispatch, setSnackMessage } from '@/redux';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export const useURLLink = (URLLink: string) => {
    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        if (URLLink !== undefined && !URLLink?.includes('-')) {
            dispatch(setSnackMessage("The URLLink does not contain hyphens."))
        }
    }, [])

    const linkId = URLLink?.split('-')[0]
    const linkName = URLLink?.substring(URLLink.indexOf('-') + 1)

    const convertID_NameStringToURLFormat = (id: number, name: string) => {
        name = (name ?? '').replace(/[^a-zA-Z0-9\- ]/g, '').replace(/\s+/g, '-').toLowerCase();

        return `${id}-${name}`;
    }

    return {
        linkId,
        linkName,
        convertID_NameStringToURLFormat
    };
};
