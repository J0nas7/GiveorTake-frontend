import React from 'react';
import styles from "../styles/modules/Footer.module.scss";

// Use React minimally so it isn't removed by IDE
void React.createElement;

export const Footer = () => (
    <footer className={styles.footer}>
        <div className={styles.container}>
            © {new Date().getFullYear()} Give or Take. All rights reserved.
            {/* <a href="#" className={styles.link}> | Privacy Policy</a> */}
        </div>
    </footer>
);
