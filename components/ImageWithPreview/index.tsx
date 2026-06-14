"use client";

import { useState, useEffect, ComponentPropsWithoutRef } from "react";
import { createPortal } from "react-dom";
import styles from "./ImageWithPreview.module.css";

export default function ImageWithPreview({ src, alt, ...props }: ComponentPropsWithoutRef<"img">) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        // ESC 键关闭预览
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        // 阻止背景滚动
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleEsc);

        return () => {
            document.body.style.overflow = originalOverflow;
            document.removeEventListener("keydown", handleEsc);
        };
    }, [isOpen]);

    return (
        <>
            <img
                src={src}
                alt={alt}
                onClick={() => setIsOpen(true)}
                className="cursor-pointer transition-opacity rounded my-4"
                {...props}
            />
            {isOpen &&
                createPortal(
                    <div
                        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 ${styles.fadeIn} cursor-pointer`}
                        onClick={() => setIsOpen(false)}
                        role="dialog"
                        aria-modal="true"
                        aria-label="图片预览"
                    >
                        <img
                            src={src}
                            alt={alt || "预览图片"}
                            className={`max-w-[100vw] max-h-[100vh] object-contain ${styles.scaleIn} cursor-auto`}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>,
                    document.body
                )}
        </>
    );
}
