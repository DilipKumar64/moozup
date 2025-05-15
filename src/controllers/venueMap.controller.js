const prisma = require("../config/prisma");
const deleteFromSupabase = require("../utils/deleteFromSupabase");
const getSupabasePath = require("../utils/getSupabasePath");
const uploadToSupabase = require("../utils/uploadToSupabase");

exports.uploadVenueMap = async (req, res) => {
    try {
        const eventId = Number(req.params.eventId);
        if (!eventId) return res.status(400).json({ message: "Event ID is required" });

        if (!req.files?.venueMap?.[0]) {
            return res.status(400).json({ message: "Venue map file is required" });
        }

        const file = req.files.venueMap[0];
        const venueMapUrl = await uploadToSupabase(file, "venueMaps")

        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: { venueMap: venueMapUrl },
        });
        res.status(200).json({ message: "Venue map uploaded", event: updatedEvent });

    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Failed to upload venue map", error: err.message });
    }
}

exports.getVenueMap = async (req, res) => {
    try {
        const eventId = Number(req.params.eventId);
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { venueMap: true },
        });

        if (!event || !event.venueMap) {
            return res.status(404).json({ message: "Venue map not found" });
        }

        res.status(200).json({ venueMap: event.venueMap });
    } catch (err) {
        res.status(500).json({ message: "Error fetching venue map", error: err.message });
    }
};


exports.updateVenueMap = async (req, res) => {
    try {
        const eventId = Number(req.params.eventId);
        const file = req.files?.venueMap?.[0];

        if (!file) return res.status(400).json({ message: "Venue map file required" });

        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return res.status(404).json({ message: "Event not found" });

        // ✅ Delete old image from Supabase if exists
        if (event.venueMap) {
            const filePath = getSupabasePath(event.venueMap, "moozup/venueMaps");
            if (filePath) {
                await deleteFromSupabase("moozup", `venueMaps/${filePath}`);
            }
        }

        // ✅ Upload new image
        const newMapUrl = await uploadToSupabase(file, "venueMaps");

        // ✅ Update event with new map URL
        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: { venueMap: newMapUrl },
        });

        res.status(200).json({
            message: "Venue map updated successfully",
            venueMap: updatedEvent.venueMap,
        });

    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({
            message: "Error updating venue map",
            error: err.message,
        });
    }
};


exports.deleteVenueMap = async (req, res) => {
    try {
        const eventId = Number(req.params.eventId);
        const event = await prisma.event.findUnique({ where: { id: eventId } });

        if (!event || !event.venueMap) {
            return res.status(404).json({ message: "No venue map to delete" });
        }

        // ✅ Extract correct path from Supabase URL
        const filePath = getSupabasePath(event.venueMap, "moozup/venueMaps");
        if (!filePath) {
            return res.status(400).json({ message: "Invalid Supabase URL format" });
        }

        // ✅ Delete from Supabase: bucket = "moozup", path = "venueMaps/filename"
        await deleteFromSupabase("moozup", `venueMaps/${filePath}`);

        // ✅ Remove URL from DB
        await prisma.event.update({
            where: { id: eventId },
            data: { venueMap: null },
        });

        res.status(200).json({ message: "Venue map deleted successfully" });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ message: "Error deleting venue map", error: err.message });
    }
};
