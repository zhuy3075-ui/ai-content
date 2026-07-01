import React from "react";
import { Card, Chip, cn } from "@heroui/react";
import { Icon } from "@iconify/react";

export type TrendCardProps = {
    title: string;
    value: string | number;
    change: string;
    changeType: "positive" | "neutral" | "negative";
    trendType: "up" | "neutral" | "down";
    trendChipPosition?: "top" | "bottom";
    trendChipVariant?: "flat" | "light";
};

export const TrendCard = ({
    title,
    value,
    change,
    changeType,
    trendType,
    trendChipPosition = "top",
    trendChipVariant = "light",
}: TrendCardProps) => {
    return (
        <Card className="border border-default-100 bg-content1 shadow-sm">
            <div className="flex p-4 relative">
                <div className="flex flex-col gap-y-2">
                    <dt className="text-small text-default-500 font-medium">{title}</dt>
                    <dd className="text-default-700 text-3xl font-semibold">{value}</dd>
                </div>
                <Chip
                    className={cn("absolute right-4", {
                        "top-4": trendChipPosition === "top",
                        "bottom-4": trendChipPosition === "bottom",
                    })}
                    classNames={{
                        content: "font-medium text-[0.65rem]",
                    }}
                    color={
                        changeType === "positive" ? "success" : changeType === "neutral" ? "warning" : "danger"
                    }
                    radius="sm"
                    size="sm"
                    startContent={
                        trendType === "up" ? (
                            <Icon height={12} icon={"solar:arrow-right-up-linear"} width={12} />
                        ) : trendType === "neutral" ? (
                            <Icon height={12} icon={"solar:arrow-right-linear"} width={12} />
                        ) : (
                            <Icon height={12} icon={"solar:arrow-right-down-linear"} width={12} />
                        )
                    }
                    variant={trendChipVariant}
                >
                    {change}
                </Chip>
            </div>
        </Card>
    );
};
