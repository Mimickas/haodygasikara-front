import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

export default function CircuitDatePicker() {
    const [date, setDate] = useState();

    return (
        <>
            <button
                popoverTarget="circuit-date-popover"
                className="w-full text-left text-white font-body py-3 px-1 bg-transparent border-none cursor-pointer"
                style={{ anchorName: "--circuit-date" }}
            >
                {date ? date.toLocaleDateString("fr-FR") : "Choisir une date"}
            </button>

            <div
                popover="auto"
                id="circuit-date-popover"
                className="cx-anchored-popover"
                style={{ positionAnchor: "--circuit-date" }}
            >
                <DayPicker mode="single" selected={date} onSelect={setDate} />
            </div>
        </>
    );
}