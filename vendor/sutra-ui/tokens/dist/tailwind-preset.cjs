'use strict';
module.exports = {
  "theme": {
    "extend": {
      "colors": {
        "sutra": {
          "canvas": "var(--sutra-color-bg-canvas)",
          "surface": "var(--sutra-color-bg-surface)",
          "subtle": "var(--sutra-color-bg-subtle)",
          "sunken": "var(--sutra-color-bg-sunken)",
          "inverse": "var(--sutra-color-bg-inverse)",
          "ink": "var(--sutra-color-fg-default)",
          "muted": "var(--sutra-color-fg-muted)",
          "primary": "var(--sutra-color-bg-primary)",
          "primary-hover": "var(--sutra-color-bg-primary-hover)",
          "primary-subtle": "var(--sutra-color-bg-primary-subtle)",
          "on-primary": "var(--sutra-color-fg-on-primary)",
          "accent": "var(--sutra-color-bg-accent)",
          "accent-subtle": "var(--sutra-color-bg-accent-subtle)",
          "danger": "var(--sutra-color-bg-danger)",
          "danger-subtle": "var(--sutra-color-bg-danger-subtle)",
          "success": "var(--sutra-color-bg-success)",
          "success-subtle": "var(--sutra-color-bg-success-subtle)",
          "warning": "var(--sutra-color-fg-warning)",
          "warning-subtle": "var(--sutra-color-bg-warning-subtle)",
          "info": "var(--sutra-color-fg-info)",
          "info-subtle": "var(--sutra-color-bg-info-subtle)",
          "line": "var(--sutra-color-border-default)",
          "line-strong": "var(--sutra-color-border-strong)",
          "link": "var(--sutra-color-fg-link)",
          "focus": "var(--sutra-color-focus-ring)"
        }
      },
      "fontFamily": {
        "sans": [
          "Inter",
          "Noto Sans Devanagari",
          "Nirmala UI",
          "Mangal",
          "sans-serif"
        ],
        "display": [
          "Fraunces",
          "Noto Sans Devanagari",
          "Iowan Old Style",
          "Palatino",
          "serif"
        ],
        "mono": [
          "IBM Plex Mono",
          "Noto Sans Mono",
          "ui-monospace",
          "monospace"
        ]
      },
      "fontSize": {
        "xs": [
          "var(--sutra-font-size-xs)",
          {
            "lineHeight": "var(--sutra-font-line-xs)"
          }
        ],
        "sm": [
          "var(--sutra-font-size-sm)",
          {
            "lineHeight": "var(--sutra-font-line-sm)"
          }
        ],
        "base": [
          "var(--sutra-font-size-md)",
          {
            "lineHeight": "var(--sutra-font-line-md)"
          }
        ],
        "lg": [
          "var(--sutra-font-size-lg)",
          {
            "lineHeight": "var(--sutra-font-line-lg)"
          }
        ],
        "xl": [
          "var(--sutra-font-size-xl)",
          {
            "lineHeight": "var(--sutra-font-line-xl)"
          }
        ],
        "2xl": [
          "var(--sutra-font-size-2xl)",
          {
            "lineHeight": "var(--sutra-font-line-2xl)"
          }
        ],
        "3xl": [
          "var(--sutra-font-size-3xl)",
          {
            "lineHeight": "var(--sutra-font-line-3xl)"
          }
        ],
        "4xl": [
          "var(--sutra-font-size-4xl)",
          {
            "lineHeight": "var(--sutra-font-line-4xl)"
          }
        ],
        "display": [
          "var(--sutra-font-size-display)",
          {
            "lineHeight": "var(--sutra-font-line-display)"
          }
        ]
      },
      "fontWeight": {
        "regular": "400",
        "medium": "500",
        "semibold": "600",
        "bold": "700"
      },
      "spacing": {
        "0": "var(--sutra-space-0)",
        "1": "var(--sutra-space-1)",
        "2": "var(--sutra-space-2)",
        "3": "var(--sutra-space-3)",
        "4": "var(--sutra-space-4)",
        "5": "var(--sutra-space-5)",
        "6": "var(--sutra-space-6)",
        "8": "var(--sutra-space-8)",
        "10": "var(--sutra-space-10)",
        "12": "var(--sutra-space-12)",
        "16": "var(--sutra-space-16)",
        "20": "var(--sutra-space-20)"
      },
      "borderRadius": {
        "none": "var(--sutra-radius-none)",
        "sm": "var(--sutra-radius-sm)",
        "md": "var(--sutra-radius-md)",
        "lg": "var(--sutra-radius-lg)",
        "xl": "var(--sutra-radius-xl)",
        "full": "var(--sutra-radius-full)"
      },
      "boxShadow": {
        "sm": "var(--sutra-shadow-sm)",
        "md": "var(--sutra-shadow-md)",
        "lg": "var(--sutra-shadow-lg)"
      },
      "transitionDuration": {
        "sutra-fast": "var(--sutra-motion-duration-fast)",
        "sutra-normal": "var(--sutra-motion-duration-normal)",
        "sutra-slow": "var(--sutra-motion-duration-slow)"
      },
      "transitionTimingFunction": {
        "sutra": "var(--sutra-motion-easing-standard)",
        "sutra-emphasis": "var(--sutra-motion-easing-emphasis)"
      }
    }
  }
};
