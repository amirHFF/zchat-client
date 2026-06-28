import React from "react";

interface Props {
    name: string;
    online?: boolean;
}

const colors = [
    "#4F46E5",
    "#2563EB",
    "#059669",
    "#EA580C",
    "#DC2626",
    "#9333EA",
    "#0891B2",
    "#CA8A04"
];

function getColor(name: string) {
    let hash = 0;

    for (let i = 0; i < name.length; i++) {
        hash += name.charCodeAt(i);
    }

    return colors[hash % colors.length];
}

export default function UserAvatar({ name, online = false }: Props) {

    return (

        <div
    style={{
        position: "relative",
        width: 42,
        height: 42,
        flexShrink: 0,
        overflow: "visible"   // اضافه کن
    }}
>
            

            <div
                style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    background: getColor(name),
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: 600,
                    fontSize: 16
                }}
            >
                {name[0].toUpperCase()}
            </div>

            {online && (

                <div
                    style={{
                        position: "absolute",
                        right: 2,
                        bottom: 2,
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "#22C55E",
                        border: "2px solid white"
                    }}
                />

            )}

        </div>

    );

}