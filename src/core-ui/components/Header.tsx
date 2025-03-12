// External
import clsx from "clsx"
import React from "react"
import Image from "next/image";
import Link from "next/link";

// Internal
import styles from "../styles/modules/Header.module.scss";
import { Block, Text } from "@/components";
import SearchBar from "./SearchBar";

export const Header: React.FC = () => {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/">
                    <Block className={styles['logo-wrapper']}>
                        <Image
                            src="/giveortake-logo.png"
                            alt="Logo"
                            width={54}
                            height={36}
                        />
                        <Text variant="span">
                            <Text variant="span" className="font-sans text-lg font-extrabold text-white h-5">
                                Give or Take
                            </Text>
                            <Text variant="span" className="text-xs text-black">
                                Project Management & Time Tracking
                            </Text>
                        </Text>
                    </Block>
                </Link>
                
                <SearchBar />
                
                <nav>
                    <ul className={styles.navList}>
                        <li>
                            <a href="#" className={clsx(styles.navLink)}>
                                Home
                            </a>
                        </li>
                        <li>
                            <a href="#" className={clsx(styles.navLink)}>
                                About
                            </a>
                        </li>
                        <li>
                            <a href="#" className={clsx(styles.navLink)}>
                                Contact
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};