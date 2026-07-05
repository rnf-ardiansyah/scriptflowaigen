import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
    className,
    children,
    ...props
}: SelectPrimitive.SelectTriggerProps) {
    return (
        <SelectPrimitive.Trigger
            className={cn(
                "flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-background/60 px-3 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/40 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground",
                className,
            )}
            {...props}
        >
            <span className="truncate">{children}</span>
            <SelectPrimitive.Icon asChild>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );
}

export function SelectContent({
    className,
    children,
    ...props
}: SelectPrimitive.SelectContentProps) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                position="popper"
                sideOffset={6}
                className={cn(
                    "z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border bg-surface-elevated p-1.5 shadow-soft",
                    className,
                )}
                {...props}
            >
                <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
}

export function SelectItem({
    className,
    children,
    ...props
}: SelectPrimitive.SelectItemProps) {
    return (
        <SelectPrimitive.Item
            className={cn(
                "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 pr-8 text-sm text-foreground outline-none data-[highlighted]:bg-electric/10 data-[highlighted]:text-electric data-[state=checked]:font-medium",
                className,
            )}
            {...props}
        >
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
            <SelectPrimitive.ItemIndicator className="absolute right-2.5">
                <Check className="h-4 w-4 text-electric" />
            </SelectPrimitive.ItemIndicator>
        </SelectPrimitive.Item>
    );
}