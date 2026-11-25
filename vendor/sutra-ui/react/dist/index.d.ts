import * as react from 'react';
import { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes, HTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, ReactElement, FocusEvent, MouseEvent, KeyboardEvent } from 'react';
export { themeInitScript } from './theme-script.js';

declare function cx(...parts: Array<string | false | null | undefined>): string;

declare function MarkIcon(): react.JSX.Element;

type NumberLocale = 'en-IN' | 'hi-IN';
type NumberingSystem = 'latn' | 'deva';
type NumberMode = 'number' | 'currency';
type FormatIndianOptions = {
    mode?: NumberMode;
    locale?: NumberLocale;
    decimals?: number;
    numberingSystem?: NumberingSystem;
};
declare function normalizeIndianDigits(input: string): string;
declare function parseIndianNumber(input: string): number | null;
declare function formatIndianNumber(value: number, options?: FormatIndianOptions): string;
declare function formatLakhCrore(value: number, locale?: 'en' | 'hi'): string | null;

type Locale = 'en' | 'hi';
declare const messages: {
    readonly en: {
        readonly close: "Close";
        readonly copy: "Copy";
        readonly copied: "Copied";
        readonly download: "Download";
        readonly menu: "Menu";
        readonly breadcrumb: "Breadcrumb";
        readonly related: "Related tools";
        readonly theme: "Theme";
        readonly language: "Language";
        readonly required: "required";
        readonly skip: "Skip to content";
        readonly primaryNav: "Primary";
        readonly light: "Light";
        readonly dark: "Dark";
        readonly contrast: "Contrast";
        readonly system: "System";
        readonly english: "English";
        readonly hindi: "Hindi";
        readonly dismiss: "Dismiss notification";
        readonly rowHeader: "Item";
        readonly atLeast: "Minimum";
        readonly atMost: "Maximum";
    };
    readonly hi: {
        readonly close: "बंद करें";
        readonly copy: "कॉपी करें";
        readonly copied: "कॉपी हो गया";
        readonly download: "डाउनलोड करें";
        readonly menu: "मेनू";
        readonly breadcrumb: "ब्रेडक्रम्ब";
        readonly related: "संबंधित उपकरण";
        readonly theme: "थीम";
        readonly language: "भाषा";
        readonly required: "आवश्यक";
        readonly skip: "मुख्य सामग्री पर जाएँ";
        readonly primaryNav: "मुख्य नेविगेशन";
        readonly light: "हल्का";
        readonly dark: "गहरा";
        readonly contrast: "उच्च कंट्रास्ट";
        readonly system: "सिस्टम";
        readonly english: "English";
        readonly hindi: "हिन्दी";
        readonly dismiss: "सूचना बंद करें";
        readonly rowHeader: "मद";
        readonly atLeast: "न्यूनतम";
        readonly atMost: "अधिकतम";
    };
};
type Messages = {
    [Key in keyof (typeof messages)['en']]: string;
};

type Theme = 'light' | 'dark' | 'high-contrast' | 'system';

type SutraContextValue = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    locale: Locale;
    setLocale: (locale: Locale) => void;
    messages: Messages;
};
declare function SutraProvider({ children, defaultTheme, defaultLocale, }: {
    children: ReactNode;
    defaultTheme?: Theme;
    defaultLocale?: Locale;
}): react.JSX.Element;
declare function useSutra(): SutraContextValue;

declare function Accordion({ type, defaultValue, children, }: {
    type?: 'single' | 'multiple';
    defaultValue?: string[];
    children: ReactNode;
}): react.JSX.Element;
declare function AccordionItem({ value, title, children, }: {
    value: string;
    title: string;
    children: ReactNode;
}): react.JSX.Element;
type FaqItem = {
    question: string;
    answer: string;
};
declare function Faq({ items, title }: {
    items: FaqItem[];
    title?: string;
}): react.JSX.Element;

declare function Alert({ tone, title, children, }: {
    tone?: 'info' | 'success' | 'warning' | 'danger';
    title: string;
    children?: ReactNode;
}): react.JSX.Element;

declare function Badge({ tone, children, }: {
    tone?: 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';
    children: ReactNode;
}): react.JSX.Element;

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';
type Common = {
    variant?: Variant;
    size?: Size;
    className?: string;
    children?: ReactNode;
};
type ButtonAsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
};
type ButtonAsLink = Common & AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
};
type ButtonProps = ButtonAsButton | ButtonAsLink;
declare const Button: react.ForwardRefExoticComponent<ButtonProps & react.RefAttributes<HTMLButtonElement | HTMLAnchorElement>>;

declare function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>): react.JSX.Element;
declare function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>): react.JSX.Element;
declare function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>): react.JSX.Element;
declare function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>): react.JSX.Element;
declare function CardFooter({ className, children }: {
    className?: string;
    children?: ReactNode;
}): react.JSX.Element;

type ComparisonColumn = {
    key: string;
    header: string;
};
type ComparisonRow = {
    label: string;
    values: Record<string, string>;
};
declare function ComparisonTable({ caption, columns, rows, highlight, rowHeader, }: {
    caption: string;
    columns: ComparisonColumn[];
    rows: ComparisonRow[];
    highlight?: string;
    rowHeader?: string;
}): react.JSX.Element;

declare function CopyButton({ value, label }: {
    value: string;
    label?: string;
}): react.JSX.Element;

declare function DownloadButton({ filename, content, mime, children, }: {
    filename: string;
    content: string | Blob;
    mime?: string;
    children?: ReactNode;
}): react.JSX.Element;

type NavItem = {
    href: string;
    label: string;
};
declare function Header({ title, href, nav, children, }: {
    title?: string;
    href?: string;
    nav?: NavItem[];
    children?: ReactNode;
}): react.JSX.Element;

declare function Footer({ title, note, links, children, }: {
    title?: string;
    note?: ReactNode;
    links?: NavItem[];
    children?: ReactNode;
}): react.JSX.Element;

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
    label?: string;
    hint?: string;
    error?: string;
};
declare const Input: react.ForwardRefExoticComponent<Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
    label?: string;
    hint?: string;
    error?: string;
} & react.RefAttributes<HTMLInputElement>>;

declare function LanguageToggle(): react.JSX.Element;

type NumberInputProps = {
    label?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    id?: string;
    name?: string;
    value: number | null;
    onValueChange: (value: number | null) => void;
    mode?: 'number' | 'currency';
    decimals?: number;
    digits?: NumberingSystem;
    showScale?: boolean;
    disabled?: boolean;
    placeholder?: string;
    min?: number;
    max?: number;
    className?: string;
};
declare const NumberInput: react.ForwardRefExoticComponent<NumberInputProps & react.RefAttributes<HTMLInputElement>>;

type ResultBreakdown = {
    label: string;
    value: string;
    hint?: string;
};
declare function ResultPanel({ label, value, unit, caption, breakdown, tone, }: {
    label: string;
    value: string;
    unit?: string;
    caption?: string;
    breakdown?: ResultBreakdown[];
    tone?: 'default' | 'primary' | 'success' | 'danger';
}): react.JSX.Element;

type SelectOption = {
    value: string;
    label: string;
    disabled?: boolean;
};
type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
    label?: string;
    hint?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
};
declare const Select: react.ForwardRefExoticComponent<Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
    label?: string;
    hint?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
} & react.RefAttributes<HTMLSelectElement>>;

declare function Slider({ label, value, onValueChange, min, max, step, hint, formatValue, id, }: {
    label: string;
    value: number;
    onValueChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    hint?: string;
    formatValue?: (value: number) => string;
    id?: string;
}): react.JSX.Element;

declare function Tabs({ value, defaultValue, onValueChange, children, }: {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    children: ReactNode;
}): react.JSX.Element;
declare function TabList({ children, label }: {
    children: ReactNode;
    label: string;
}): react.JSX.Element;
declare function Tab({ value, children }: {
    value: string;
    children: ReactNode;
}): react.JSX.Element;
declare function TabPanel({ value, children }: {
    value: string;
    children: ReactNode;
}): react.JSX.Element;

declare function ThemeSwitcher(): react.JSX.Element;

type ToastInput = {
    title: string;
    description?: string;
    tone?: 'info' | 'success' | 'warning' | 'danger';
};
type ToastContextValue = {
    toast: (input: ToastInput) => void;
};
declare function ToastProvider({ children }: {
    children: ReactNode;
}): react.JSX.Element;
declare function useToast(): ToastContextValue;

declare function Toggle({ label, checked, onCheckedChange, hint, disabled, id, }: {
    label: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    hint?: string;
    disabled?: boolean;
    id?: string;
}): react.JSX.Element;

type TriggerProps = {
    onFocus?: (event: FocusEvent<HTMLElement>) => void;
    onBlur?: (event: FocusEvent<HTMLElement>) => void;
    onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
    onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
    'aria-describedby'?: string;
};
declare function Tooltip({ content, children }: {
    content: string;
    children: ReactElement<TriggerProps>;
}): react.JSX.Element | null;

type Crumb = {
    label: string;
    href?: string;
};
type RelatedTool = {
    href: string;
    title: string;
    description?: string;
};
declare function ToolLayout({ title, description, breadcrumb, related, header, footer, nav, children, }: {
    title: string;
    description?: string;
    breadcrumb?: Crumb[];
    related?: RelatedTool[];
    header?: ReactNode;
    footer?: ReactNode;
    nav?: NavItem[];
    children: ReactNode;
}): react.JSX.Element;

export { Accordion, AccordionItem, Alert, Badge, Button, type ButtonProps, Card, CardBody, CardFooter, CardHeader, CardTitle, type ComparisonColumn, type ComparisonRow, ComparisonTable, CopyButton, type Crumb, DownloadButton, Faq, type FaqItem, Footer, type FormatIndianOptions, Header, Input, type InputProps, LanguageToggle, type Locale, MarkIcon, type Messages, type NavItem, NumberInput, type NumberInputProps, type NumberLocale, type NumberMode, type NumberingSystem, type RelatedTool, type ResultBreakdown, ResultPanel, Select, type SelectOption, type SelectProps, Slider, SutraProvider, Tab, TabList, TabPanel, Tabs, type Theme, ThemeSwitcher, type ToastInput, ToastProvider, Toggle, ToolLayout, Tooltip, cx, formatIndianNumber, formatLakhCrore, messages, normalizeIndianDigits, parseIndianNumber, useSutra, useToast };
