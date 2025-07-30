Implement dependency injection into the component, by abstracting the TSX out of it, into a ComponentNameView.


Insert comments for sections in the TS logic:
// ---- Hooks ----
(and for state, methods, effects and render as well)

Make method-level comments for all methods and effects.

Integrate dependency injection, so we split TS logic (ComponentNameContainer) and TSX (ComponentNameContainerView) from each other.



Create testing of UserDetailsView, including UserDetailsViewProps variables being undefined/null.


Add a second describe() => {}, testing 5 new edge cases.




Network hosting:
npm run dev -- -H 192.168.50.132

npm i:
    sass
    clsx
    axios
    @reduxjs/toolkit react-redux
    next-i18next react-i18next i18next
    @mui/material @emotion/react @emotion/styled
    react-textarea-autosize
    i18next-http-backend
    i18next-browser-languagedetector
    @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome @fortawesome/free-brands-svg-icons
    react-quill quill-mention
    react-chartjs-2 chart.js
    react-merge-providers
    cookies-next@4.0
    react-dnd react-dnd-html5-backend
    next-qrcode
    yup

    --save-dev:
        jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
        @types/jest
        ts-node typescript ts-jest
        jest-environment-jsdom @types/testing-library__jest-dom
        babel-jest @babel/core @babel/preset-env @babel/preset-react
        identity-obj-proxy
        @babel/plugin-transform-runtime @babel/preset-typescript
        @types/quill
        redux-mock-store

